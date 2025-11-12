const express = require("express");
const { google } = require("googleapis");
const path = require("path");
const {
  ensureHeaders,
  getAllRecords,
  appendRecord,
  updateRecordAtRow,
  findRowIndexById,
  colNumToLetter,
} = require("../utils/googleSheetsHelpers");
const { getVietnamTimeString } = require("../utils/timeHelpers");

const router = express.Router();

// Google API Setup
const keyFile =
  process.env.GOOGLE_APPLICATION_CREDENTIALS ||
  process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH ||
  path.join(__dirname, "../../mia-logistics-469406-eec521c603c0.json");

const DEFAULT_SPREADSHEET_ID = "18B1PIhCDmBWyHZytvOcfj_1QbYBwczLf1x1Qbu0E5As";

const auth = new google.auth.GoogleAuth({
  keyFile,
  scopes: [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive",
    "https://www.googleapis.com/auth/drive.file",
  ],
});

const sheets = google.sheets({ version: "v4", auth });

// Transfers Sheet Configuration
const TRANSFERS_SHEET = "Transfers";
const TRANSFERS_HEADERS = [
  "transfer_id",
  "orderCode",
  "hasVali",
  "date",
  "source",
  "dest",
  "quantity",
  "state",
  "transportStatus",
  "note",
  "pkgS",
  "pkgM",
  "pkgL",
  "pkgBagSmall",
  "pkgBagMedium",
  "pkgBagLarge",
  "pkgOther",
  "totalPackages",
  "volS",
  "volM",
  "volL",
  "volBagSmall",
  "volBagMedium",
  "volBagLarge",
  "volOther",
  "totalVolume",
  "dest_id",
  "source_id",
  "employee",
  "address",
  "ward",
  "district",
  "province",
];

// Helper: Normalize transfer record
function normalizeTransfer(record) {
  const base = Object.fromEntries(TRANSFERS_HEADERS.map((h) => [h, ""]));
  const merged = { ...base, ...record };

  // Default transport status
  if (!merged.transportStatus) merged.transportStatus = "Chờ báo kiện";

  // Calculate totals
  const pkgFields = [
    "pkgS",
    "pkgM",
    "pkgL",
    "pkgBagSmall",
    "pkgBagMedium",
    "pkgBagLarge",
    "pkgOther",
  ];
  const volFields = [
    "volS",
    "volM",
    "volL",
    "volBagSmall",
    "volBagMedium",
    "volBagLarge",
    "volOther",
  ];
  const totalPkgs = pkgFields.map((k) => Number(merged[k] || 0)).reduce((a, b) => a + b, 0);
  const totalVol = volFields.map((k) => Number(merged[k] || 0)).reduce((a, b) => a + b, 0);
  merged.totalPackages = merged.totalPackages || totalPkgs;
  merged.totalVolume = merged.totalVolume || totalVol;

  // Ensure transfer_id is primary ID
  if (!merged.transfer_id && merged.id) merged.transfer_id = merged.id;

  return merged;
}

function toStringSafe(value, defaultValue = "") {
  if (value === null || value === undefined) return defaultValue;
  if (typeof value === "string") return value.trim();
  return String(value).trim();
}

function toNumberSafe(value, decimals = 0) {
  if (value === null || value === undefined || value === "") return 0;
  const num = Number(value);
  if (Number.isNaN(num)) return 0;
  if (decimals <= 0) return Math.round(num);
  const factor = Math.pow(10, decimals);
  return Math.round(num * factor) / factor;
}

function formatDateForSheet(input) {
  const s = toStringSafe(input);
  if (!s) return "";
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(s)) return s;
  const d = new Date(s);
  if (!Number.isNaN(d.getTime())) {
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = String(d.getFullYear());
    return `${day}/${month}/${year}`;
  }
  return s;
}

function normalizeForSheet(rec) {
  const n = { ...rec };
  n.transfer_id = toStringSafe(n.transfer_id || n.id);
  n.orderCode = toStringSafe(n.orderCode);
  n.hasVali = toStringSafe(n.hasVali);
  n.date = formatDateForSheet(n.date);
  n.source = toStringSafe(n.source);
  n.dest = toStringSafe(n.dest);
  n.quantity = toNumberSafe(n.quantity, 0);
  n.state = toStringSafe(n.state);
  n.transportStatus = toStringSafe(n.transportStatus || "Chờ báo kiện");
  n.note = toStringSafe(n.note);

  n.pkgS = toNumberSafe(n.pkgS, 0);
  n.pkgM = toNumberSafe(n.pkgM, 0);
  n.pkgL = toNumberSafe(n.pkgL, 0);
  n.pkgBagSmall = toNumberSafe(n.pkgBagSmall, 0);
  n.pkgBagMedium = toNumberSafe(n.pkgBagMedium, 0);
  n.pkgBagLarge = toNumberSafe(n.pkgBagLarge, 0);
  n.pkgOther = toNumberSafe(n.pkgOther, 0);

  n.volS = toNumberSafe(n.volS, 2);
  n.volM = toNumberSafe(n.volM, 2);
  n.volL = toNumberSafe(n.volL, 2);
  n.volBagSmall = toNumberSafe(n.volBagSmall, 2);
  n.volBagMedium = toNumberSafe(n.volBagMedium, 2);
  n.volBagLarge = toNumberSafe(n.volBagLarge, 2);
  n.volOther = toNumberSafe(n.volOther, 2);

  n.totalPackages = toNumberSafe(n.totalPackages, 0);
  n.totalVolume = toNumberSafe(n.totalVolume, 2);

  n.dest_id = toStringSafe(n.dest_id);
  n.source_id = toStringSafe(n.source_id);
  n.employee = toStringSafe(n.employee);
  n.address = toStringSafe(n.address);
  n.ward = toStringSafe(n.ward);
  n.district = toStringSafe(n.district);
  n.province = toStringSafe(n.province);

  return n;
}

const ACTIVE_LOCATION_STATUSES = new Set(["active", "true", "1", "yes"]);

function isLocationActive(statusValue) {
  if (!statusValue) return false;
  const normalized = toStringSafe(statusValue).toLowerCase();
  return ACTIVE_LOCATION_STATUSES.has(normalized);
}

async function loadLocationsMap(spreadsheetId) {
  try {
    const locations = await getAllRecords(spreadsheetId, "Locations");
    const map = new Map();
    locations.forEach((loc) => {
      const id = toStringSafe(loc.id || loc.ID);
      if (!id) return;

      const status = loc.status || loc.Status || loc.active || loc.Active;
      if (status && !isLocationActive(status)) return;

      map.set(id, {
        address: toStringSafe(loc.address || loc.Address),
        ward: toStringSafe(loc.ward || loc.Ward),
        district: toStringSafe(loc.district || loc.District),
        province: toStringSafe(loc.province || loc.Province),
      });
    });
    return map;
  } catch (error) {
    console.error("❌ loadLocationsMap error:", error.message);
    return new Map();
  }
}

function applyLocationData(record, locationsMap) {
  const destId = toStringSafe(record.dest_id);
  if (!destId) return record;
  const location = locationsMap.get(destId);
  if (!location) return record;
  record.address = location.address;
  record.ward = location.ward;
  record.district = location.district;
  record.province = location.province;
  return record;
}

// Helper: Retry with backoff
async function retryWithBackoff(fn, maxRetries = 3, delay = 1000) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      console.log(`⏳ Retry ${i + 1}/${maxRetries} after ${delay}ms...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
      delay *= 2;
    }
  }
}

// GET /api/transfers - Get all transfers
router.get("/", async (req, res) => {
  try {
    const spreadsheetId = req.query.spreadsheetId || DEFAULT_SPREADSHEET_ID;
    await ensureHeaders(spreadsheetId, TRANSFERS_SHEET, TRANSFERS_HEADERS);
    const records = await retryWithBackoff(async () => {
      return await getAllRecords(spreadsheetId, TRANSFERS_SHEET);
    });

    if (!records || records.length === 0) {
      console.log("📭 Sheet Transfers trống - trả về mảng rỗng");
      return res.json([]);
    }

    // Normalize data
    const normalizedList = records.map((transfer) => ({
      ...transfer,
      volS: Number(transfer.volS) || 0,
      volM: Number(transfer.volM) || 0,
      volL: Number(transfer.volL) || 0,
      volBagSmall: Number(transfer.volBagSmall) || 0,
      volBagMedium: Number(transfer.volBagMedium) || 0,
      volBagLarge: Number(transfer.volBagLarge) || 0,
      volOther: Number(transfer.volOther) || 0,
      pkgS: Number(transfer.pkgS) || 0,
      pkgM: Number(transfer.pkgM) || 0,
      pkgL: Number(transfer.pkgL) || 0,
      pkgBagSmall: Number(transfer.pkgBagSmall) || 0,
      pkgBagMedium: Number(transfer.pkgBagMedium) || 0,
      pkgBagLarge: Number(transfer.pkgBagLarge) || 0,
      pkgOther: Number(transfer.pkgOther) || 0,
    }));

    const locationsMap = await loadLocationsMap(spreadsheetId);
    const enrichedList = normalizedList.map((transfer) =>
      applyLocationData({ ...transfer }, locationsMap)
    );

    res.json(enrichedList);
  } catch (error) {
    console.error("❌ GET /api/transfers error:", error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/transfers - Create new transfer
router.post("/", async (req, res) => {
  try {
    const transferData = req.body || {};

    await ensureHeaders(TRANSFERS_SHEET, TRANSFERS_HEADERS);

    // Normalize transfer data
    const normalizedTransfer = normalizeTransfer(transferData);

    const locationsMap = await loadLocationsMap(DEFAULT_SPREADSHEET_ID);
    applyLocationData(normalizedTransfer, locationsMap);

    // Set default values if missing
    if (!normalizedTransfer.transfer_id) {
      // Generate transfer_id if not provided
      const now = new Date();
      const dateStr = now.toISOString().slice(0, 10).replace(/-/g, "");
      const randomNum = Math.floor(Math.random() * 100000)
        .toString()
        .padStart(5, "0");
      normalizedTransfer.transfer_id = `TRF-${dateStr}-${randomNum}`;
    }

    if (!normalizedTransfer.date) {
      const now = new Date();
      normalizedTransfer.date = now.toLocaleDateString("vi-VN");
    }

    if (!normalizedTransfer.state) {
      normalizedTransfer.state = "Đề nghị chuyển kho";
    }

    if (!normalizedTransfer.transportStatus) {
      normalizedTransfer.transportStatus = "Chờ báo kiện";
    }

    // Append new record
    await appendRecord(TRANSFERS_SHEET, TRANSFERS_HEADERS, normalizedTransfer);

    res.json(normalizedTransfer);
  } catch (error) {
    console.error("❌ POST /api/transfers error:", error);
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/transfers/:id - Update transfer
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body || {};

    // Get existing records
    await ensureHeaders(TRANSFERS_SHEET, TRANSFERS_HEADERS);
    const records = await getAllRecords(TRANSFERS_SHEET);

    // Find the record by transfer_id
    const index = records.findIndex((r) => r.transfer_id === id || r.id === id);
    if (index === -1) {
      return res.status(404).json({ error: "Transfer not found" });
    }

    const existingRecord = records[index];
    const updatedRecord = normalizeTransfer({
      ...existingRecord,
      ...updates,
    });

    const locationsMap = await loadLocationsMap(DEFAULT_SPREADSHEET_ID);
    applyLocationData(updatedRecord, locationsMap);

    // Find row index
    const { rowIndex } = await findRowIndexById(TRANSFERS_SHEET, "transfer_id", id);
    if (rowIndex === -1) {
      return res.status(404).json({ error: "Transfer not found" });
    }

    await updateRecordAtRow(TRANSFERS_SHEET, TRANSFERS_HEADERS, updatedRecord, rowIndex);

    res.json(updatedRecord);
  } catch (error) {
    console.error("❌ PUT /api/transfers/:id error:", error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/transfers/import - Bulk import transfers
router.post("/import", async (req, res) => {
  try {
    const rows = Array.isArray(req.body?.rows) ? req.body.rows : [];
    if (rows.length === 0) {
      return res.status(400).json({ error: "rows is required" });
    }

    const spreadsheetId = req.query.spreadsheetId || DEFAULT_SPREADSHEET_ID;

    await ensureHeaders(spreadsheetId, TRANSFERS_SHEET, TRANSFERS_HEADERS);
    const existing = await getAllRecords(spreadsheetId, TRANSFERS_SHEET);
    const existingIds = new Set(
      existing.map((r) => String(r.transfer_id || r.id || "").trim()).filter((id) => id.length > 0)
    );

    const locationsMap = await loadLocationsMap(spreadsheetId);

    const cleaned = rows
      .map((r) => normalizeForSheet(normalizeTransfer(r)))
      .filter((r) => String(r.transfer_id || "").trim() !== "");

    let imported = 0;
    let duplicated = 0;

    for (const record of cleaned) {
      applyLocationData(record, locationsMap);
      const id = String(record.transfer_id || "").trim();
      if (!id || existingIds.has(id)) {
        duplicated++;
        continue;
      }

      const values = TRANSFERS_HEADERS.map((header) => record[header] ?? "");
      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: `${TRANSFERS_SHEET}!A:Z`,
        valueInputOption: "RAW",
        resource: { values: [values] },
      });

      existingIds.add(id);
      imported++;
    }

    res.json({ imported, duplicated, total: cleaned.length });
  } catch (error) {
    console.error("❌ POST /api/transfers/import error:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
