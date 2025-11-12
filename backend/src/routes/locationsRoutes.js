const express = require("express");
const { google } = require("googleapis");
const path = require("path");
const router = express.Router();

// Google API Setup
const keyFile =
  process.env.GOOGLE_APPLICATION_CREDENTIALS ||
  process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH ||
  path.join(__dirname, "../../mia-logistics-469406-eec521c603c0.json");

const auth = new google.auth.GoogleAuth({
  keyFile,
  scopes: [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive",
    "https://www.googleapis.com/auth/drive.file",
  ],
});

const sheets = google.sheets({ version: "v4", auth });

// Default spreadsheet ID
const DEFAULT_SPREADSHEET_ID = "18B1PIhCDmBWyHZytvOcfj_1QbYBwczLf1x1Qbu0E5As";
const LOCATIONS_SHEET = "Locations";

const LOCATIONS_HEADERS = [
  "id",
  "code",
  "avatar",
  "category",
  "subcategory",
  "address",
  "status",
  "ward",
  "district",
  "province",
  "note",
  "createdAt",
  "updatedAt",
];

// Helper function: Get Vietnam time string
function getVietnamTimeString() {
  const now = new Date();
  const vietnamTimeString = now.toLocaleString("en-CA", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  return vietnamTimeString.replace(", ", " ");
}

// Helper: Ensure headers exist in sheet
async function ensureHeaders(sheetName, headers) {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: DEFAULT_SPREADSHEET_ID,
      range: `${sheetName}!A1:Z1`,
    });

    const existingHeaders = response.data.values?.[0] || [];

    if (existingHeaders.length === 0) {
      // Insert headers
      await sheets.spreadsheets.values.update({
        spreadsheetId: DEFAULT_SPREADSHEET_ID,
        range: `${sheetName}!A1`,
        valueInputOption: "RAW",
        resource: { values: [headers] },
      });
      console.log(`✅ Headers inserted into ${sheetName}`);
    }
  } catch (error) {
    console.error(`❌ Error ensuring headers for ${sheetName}:`, error.message);
  }
}

// Helper: Get all records from sheet
async function getAllRecords(sheetName) {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: DEFAULT_SPREADSHEET_ID,
      range: `${sheetName}!A1:Z`,
    });

    const rows = response.data.values || [];
    if (rows.length === 0) return [];

    const headers = rows[0];
    const records = [];

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (row.some((cell) => cell)) {
        // Only add non-empty rows
        const record = {};
        headers.forEach((header, idx) => {
          record[header] = row[idx] || "";
        });
        records.push(record);
      }
    }

    return records;
  } catch (error) {
    console.error(`❌ Error getting records from ${sheetName}:`, error.message);
    throw error;
  }
}

// Helper: Append record to sheet
async function appendRecord(sheetName, headers, record) {
  try {
    // Normalize record to match headers
    const normalized = {};
    headers.forEach((header) => {
      normalized[header] = record[header] || "";
    });

    const values = headers.map((header) => normalized[header]);

    await sheets.spreadsheets.values.append({
      spreadsheetId: DEFAULT_SPREADSHEET_ID,
      range: `${sheetName}!A:Z`,
      valueInputOption: "RAW",
      resource: { values: [values] },
    });

    return normalized;
  } catch (error) {
    console.error(`❌ Error appending to ${sheetName}:`, error.message);
    throw error;
  }
}

// GET /api/locations - Get all locations
router.get("/", async (req, res) => {
  try {
    await ensureHeaders(LOCATIONS_SHEET, LOCATIONS_HEADERS);
    const records = await getAllRecords(LOCATIONS_SHEET);

    res.json(records);
  } catch (error) {
    console.error("❌ GET /api/locations error:", error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/locations - Create new location
router.post("/", async (req, res) => {
  try {
    const location = req.body || {};
    const now = getVietnamTimeString();

    const newLocation = {
      id: location.id || `LOC-${Date.now()}`,
      code: location.code || "",
      avatar: location.avatar || "🏢",
      category: location.category || "",
      subcategory: location.subcategory || "",
      address: location.address || "",
      status: location.status || "active",
      ward: location.ward || "",
      district: location.district || "",
      province: location.province || "",
      note: location.note || "",
      createdAt: now,
      updatedAt: now,
    };

    await ensureHeaders(LOCATIONS_SHEET, LOCATIONS_HEADERS);
    const saved = await appendRecord(LOCATIONS_SHEET, LOCATIONS_HEADERS, newLocation);

    res.status(201).json(saved);
  } catch (error) {
    console.error("❌ POST /api/locations error:", error);
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/locations/:id - Update location
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body || {};
    const now = getVietnamTimeString();

    // Get existing records
    await ensureHeaders(LOCATIONS_SHEET, LOCATIONS_HEADERS);
    const records = await getAllRecords(LOCATIONS_SHEET);

    // Find the record
    const index = records.findIndex((r) => r.id === id);
    if (index === -1) {
      return res.status(404).json({ error: "Location not found" });
    }

    // Update the record
    const updated = {
      ...records[index],
      ...updates,
      id, // Ensure ID doesn't change
      updatedAt: now,
    };

    // Get all rows to update
    const allRecords = records.map((r, idx) => {
      if (idx === index) return updated;
      return r;
    });

    // Rebuild the sheet
    const values = [
      LOCATIONS_HEADERS,
      ...allRecords.map((r) => LOCATIONS_HEADERS.map((h) => r[h] || "")),
    ];

    await sheets.spreadsheets.values.update({
      spreadsheetId: DEFAULT_SPREADSHEET_ID,
      range: `${LOCATIONS_SHEET}!A1:Z${values.length}`,
      valueInputOption: "RAW",
      resource: { values },
    });

    res.json(updated);
  } catch (error) {
    console.error("❌ PUT /api/locations/:id error:", error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/locations/:id - Delete location
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Get existing records
    await ensureHeaders(LOCATIONS_SHEET, LOCATIONS_HEADERS);
    const records = await getAllRecords(LOCATIONS_SHEET);

    // Find and remove the record
    const filtered = records.filter((r) => r.id !== id);
    if (filtered.length === records.length) {
      return res.status(404).json({ error: "Location not found" });
    }

    // Rebuild the sheet without deleted record
    const values = [
      LOCATIONS_HEADERS,
      ...filtered.map((r) => LOCATIONS_HEADERS.map((h) => r[h] || "")),
    ];

    await sheets.spreadsheets.values.update({
      spreadsheetId: DEFAULT_SPREADSHEET_ID,
      range: `${LOCATIONS_SHEET}!A1:Z${values.length}`,
      valueInputOption: "RAW",
      resource: { values },
    });

    res.json({ message: "Location deleted successfully" });
  } catch (error) {
    console.error("❌ DELETE /api/locations/:id error:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
