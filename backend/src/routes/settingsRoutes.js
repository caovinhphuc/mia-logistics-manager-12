const express = require("express");
const { getSheetsClient, resolveSpreadsheetId } = require("../services/googleSheetsService");
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

// Volume Rules Schema
const VOLUME_SHEET = "VolumeRules";
const VOLUME_HEADERS = ["id", "name", "unitVolume", "description", "createdAt", "updatedAt"];
const VOLUME_DEFAULTS = [
  { id: "S", name: "Size S", unitVolume: "0.04", description: "" },
  { id: "M", name: "Size M", unitVolume: "0.09", description: "" },
  { id: "L", name: "Size L", unitVolume: "0.14", description: "" },
  { id: "BAG_S", name: "Bao nhỏ", unitVolume: "0.01", description: "" },
  { id: "BAG_M", name: "Bao trung", unitVolume: "0.05", description: "" },
  { id: "BAG_L", name: "Bao lớn", unitVolume: "0.10", description: "" },
  { id: "OTHER", name: "Khác", unitVolume: "0.00", description: "" },
];

/**
 * GET /api/settings/volume-rules
 * Get volume calculation rules from Google Sheets
 */
router.get("/volume-rules", async (req, res) => {
  try {
    if (req.query.spreadsheetId) {
      process.env.GOOGLE_SHEETS_SPREADSHEET_ID = String(req.query.spreadsheetId);
    }

    const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
    if (!spreadsheetId) {
      // Fallback to defaults if no sheet configured
      return res.json(VOLUME_DEFAULTS);
    }

    await resolveSpreadsheetId();
    await ensureHeaders(VOLUME_SHEET, VOLUME_HEADERS);
    const list = await getAllRecords(VOLUME_SHEET);

    if (!list || list.length === 0) {
      // Auto-seed default values
      const now = getVietnamTimeString();
      for (const rec of VOLUME_DEFAULTS) {
        const normalized = {
          ...Object.fromEntries(VOLUME_HEADERS.map((h) => [h, ""])),
          ...rec,
          createdAt: now,
          updatedAt: now,
        };
        await appendRecord(VOLUME_SHEET, VOLUME_HEADERS, normalized);
      }
      const seeded = await getAllRecords(VOLUME_SHEET);
      return res.json(seeded);
    }

    return res.json(list);
  } catch (error) {
    console.error("GET /api/settings/volume-rules error:", error);
    // Fallback to defaults on error
    res.json(VOLUME_DEFAULTS);
  }
});

/**
 * POST /api/settings/volume-rules
 * Update volume calculation rules in Google Sheets
 */
router.post("/volume-rules", async (req, res) => {
  try {
    const rules = Array.isArray(req.body?.rules) ? req.body.rules : [];
    if (rules.length === 0) {
      return res.status(400).json({ error: "rules is required" });
    }

    if (req.query.spreadsheetId) {
      process.env.GOOGLE_SHEETS_SPREADSHEET_ID = String(req.query.spreadsheetId);
    }

    const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
    if (!spreadsheetId) {
      // No-op but acknowledge success to keep UX smooth
      return res.json({ updated: rules.length, appended: 0 });
    }

    await resolveSpreadsheetId();
    await ensureHeaders(VOLUME_SHEET, VOLUME_HEADERS);
    const sheets = await getSheetsClient();

    let updated = 0;
    let appended = 0;

    for (const rule of rules) {
      const id = String(rule.id || "").trim();
      if (!id) continue;

      const {
        headers: hdrs,
        rowIndex,
        values: existingValues,
      } = await findRowIndexById(VOLUME_SHEET, "id", id);
      const now = getVietnamTimeString();

      if (rowIndex === -1) {
        // Create new rule
        const normalized = {
          ...Object.fromEntries(VOLUME_HEADERS.map((h) => [h, ""])),
          id,
          name: rule.name || "",
          unitVolume: String(Number(rule.unitVolume || 0)),
          description: rule.description || "",
          createdAt: now,
          updatedAt: now,
        };
        await appendRecord(VOLUME_SHEET, VOLUME_HEADERS, normalized);
        appended++;
      } else {
        // Update existing rule
        const existingRecord = Object.fromEntries(hdrs.map((h, i) => [h, existingValues[i] ?? ""]));

        const merged = {
          ...existingRecord,
          id,
          name: rule.name || existingRecord.name || "",
          unitVolume: String(Number(rule.unitVolume || 0)),
          description: rule.description ?? existingRecord.description ?? "",
          updatedAt: now,
        };
        await updateRecordAtRow(VOLUME_SHEET, hdrs, merged, rowIndex);
        updated++;
      }
    }

    res.json({ updated, appended });
  } catch (error) {
    console.error("POST /api/settings/volume-rules error:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
