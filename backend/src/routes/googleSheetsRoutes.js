const express = require("express");
const { google } = require("googleapis");
const path = require("path");
const router = express.Router();

// Google API Setup - use correct path relative to backend root
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
const drive = google.drive({ version: "v3", auth });

// Default spreadsheet ID
const DEFAULT_SPREADSHEET_ID = "18B1PIhCDmBWyHZytvOcfj_1QbYBwczLf1x1Qbu0E5As";

// Read from sheet
router.post("/read", async (req, res) => {
  try {
    const { spreadsheetId, range, sheetName } = req.body;

    if (!spreadsheetId || !range) {
      return res.status(400).json({
        success: false,
        error: "spreadsheetId and range are required",
      });
    }

    // Use sheetName if provided, otherwise use range as-is
    const fullRange = sheetName ? `${sheetName}!${range}` : range;

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: fullRange,
    });

    res.json({
      success: true,
      values: response.data.values || [],
      range: response.data.range,
    });
  } catch (error) {
    console.error("Error reading sheet:", error);
    res.status(500).json({
      success: false,
      error: "Failed to read sheet",
      details: error.message,
    });
  }
});

// Write to sheet
router.post("/write", async (req, res) => {
  try {
    const { spreadsheetId, range, values } = req.body;

    if (!spreadsheetId || !range || !values) {
      return res.status(400).json({
        success: false,
        error: "spreadsheetId, range, and values are required",
      });
    }

    const response = await sheets.spreadsheets.values.update({
      spreadsheetId,
      range,
      valueInputOption: "RAW",
      resource: { values },
    });

    res.json({
      success: true,
      updatedRows: response.data.updatedRows,
      updatedColumns: response.data.updatedColumns,
    });
  } catch (error) {
    console.error("Error writing to sheet:", error);
    res.status(500).json({
      success: false,
      error: "Failed to write to sheet",
      details: error.message,
    });
  }
});

// Append to sheet
router.post("/append", async (req, res) => {
  try {
    const { spreadsheetId, range, values } = req.body;

    if (!spreadsheetId || !values) {
      return res.status(400).json({
        success: false,
        error: "spreadsheetId and values are required",
      });
    }

    const response = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: range || "A:Z",
      valueInputOption: "RAW",
      resource: { values },
    });

    res.json({
      success: true,
      updatedRows: response.data.updates.updatedRows,
      updatedColumns: response.data.updates.updatedColumns,
    });
  } catch (error) {
    console.error("Error appending to sheet:", error);
    res.status(500).json({
      success: false,
      error: "Failed to append to sheet",
      details: error.message,
    });
  }
});

// Get spreadsheet info
router.get("/info/:spreadsheetId?", async (req, res) => {
  try {
    const spreadsheetId = req.params.spreadsheetId || DEFAULT_SPREADSHEET_ID;

    const response = await sheets.spreadsheets.get({
      spreadsheetId,
    });

    res.json({
      success: true,
      spreadsheet: {
        id: response.data.spreadsheetId,
        title: response.data.properties.title,
        sheets: response.data.sheets.map((sheet) => ({
          id: sheet.properties.sheetId,
          title: sheet.properties.title,
          rowCount: sheet.properties.gridProperties.rowCount,
          columnCount: sheet.properties.gridProperties.columnCount,
        })),
      },
    });
  } catch (error) {
    console.error("Error getting spreadsheet info:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get spreadsheet info",
      details: error.message,
    });
  }
});

module.exports = router;
