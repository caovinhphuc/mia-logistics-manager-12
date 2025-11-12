const { google } = require("googleapis");
const path = require("path");

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

// Helper: Ensure headers exist in sheet
// Supports both: ensureHeaders(spreadsheetId, sheetName, headers) and ensureHeaders(sheetName, headers)
async function ensureHeaders(spreadsheetIdOrSheetName, sheetNameOrHeaders, headers) {
  try {
    let ssId, sheetName, hdrs;

    // Check if first arg is spreadsheetId (string with length > 20) or sheetName
    if (spreadsheetIdOrSheetName && spreadsheetIdOrSheetName.length > 20) {
      // New signature: ensureHeaders(spreadsheetId, sheetName, headers)
      ssId = spreadsheetIdOrSheetName || DEFAULT_SPREADSHEET_ID;
      sheetName = sheetNameOrHeaders;
      hdrs = headers;
    } else {
      // Old signature: ensureHeaders(sheetName, headers)
      ssId = DEFAULT_SPREADSHEET_ID;
      sheetName = spreadsheetIdOrSheetName;
      hdrs = sheetNameOrHeaders;
    }

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: ssId,
      range: `${sheetName}!A1:Z1`,
    });

    const existingHeaders = response.data.values?.[0] || [];

    if (existingHeaders.length === 0) {
      // Insert headers
      await sheets.spreadsheets.values.update({
        spreadsheetId: ssId,
        range: `${sheetName}!A1`,
        valueInputOption: "RAW",
        resource: { values: [hdrs] },
      });
      console.log(`✅ Headers inserted into ${sheetName}`);
    }
  } catch (error) {
    console.error(`❌ Error ensuring headers:`, error.message);
  }
}

// Helper: Get all records from sheet
// Supports both: getAllRecords(spreadsheetId, sheetName) and getAllRecords(sheetName)
async function getAllRecords(spreadsheetIdOrSheetName, sheetName) {
  try {
    let ssId, sheet;

    // Check if first arg is spreadsheetId (string with length > 20) or sheetName
    if (spreadsheetIdOrSheetName && spreadsheetIdOrSheetName.length > 20) {
      // New signature: getAllRecords(spreadsheetId, sheetName)
      ssId = spreadsheetIdOrSheetName || DEFAULT_SPREADSHEET_ID;
      sheet = sheetName;
    } else {
      // Old signature: getAllRecords(sheetName)
      ssId = DEFAULT_SPREADSHEET_ID;
      sheet = spreadsheetIdOrSheetName;
    }

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: ssId,
      range: `${sheet}!A1:Z`,
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

// Helper: Update record at specific row
async function updateRecordAtRow(sheetName, headers, record, rowIndex) {
  try {
    // Normalize record to match headers
    const normalized = {};
    headers.forEach((header) => {
      normalized[header] = record[header] || "";
    });

    const values = headers.map((header) => normalized[header]);

    await sheets.spreadsheets.values.update({
      spreadsheetId: DEFAULT_SPREADSHEET_ID,
      range: `${sheetName}!A${rowIndex}:${colNumToLetter(headers.length)}${rowIndex}`,
      valueInputOption: "RAW",
      resource: { values: [values] },
    });

    return normalized;
  } catch (error) {
    console.error(`❌ Error updating record in ${sheetName}:`, error.message);
    throw error;
  }
}

// Helper: Find row index by ID (supports custom field name)
async function findRowIndexById(sheetName, idField, idValue) {
  try {
    const records = await getAllRecords(sheetName);
    const index = records.findIndex((record) => record[idField] === idValue);

    if (index === -1) {
      return { headers: [], rowIndex: -1, values: [] };
    }

    // Get headers
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: DEFAULT_SPREADSHEET_ID,
      range: `${sheetName}!A1:Z1`,
    });
    const headers = response.data.values?.[0] || [];

    // Get values for the found row
    const response2 = await sheets.spreadsheets.values.get({
      spreadsheetId: DEFAULT_SPREADSHEET_ID,
      range: `${sheetName}!A:Z`,
    });
    const allValues = response2.data.values || [];
    const rowValues = allValues[index + 1] || []; // +1 for header

    // Return row number (1-based, +1 for header)
    return {
      headers,
      rowIndex: index + 2,
      values: rowValues,
    };
  } catch (error) {
    console.error(`❌ Error finding row index in ${sheetName}:`, error.message);
    throw error;
  }
}

// Helper: Convert column number to letter (1 -> A, 27 -> AA)
function colNumToLetter(num) {
  let result = "";
  while (num > 0) {
    num--;
    result = String.fromCharCode(65 + (num % 26)) + result;
    num = Math.floor(num / 26);
  }
  return result;
}

module.exports = {
  ensureHeaders,
  getAllRecords,
  appendRecord,
  updateRecordAtRow,
  findRowIndexById,
  colNumToLetter,
};
