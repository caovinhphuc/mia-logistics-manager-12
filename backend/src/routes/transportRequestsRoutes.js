const express = require("express");
const { getSheetsClient, resolveSpreadsheetId } = require("../services/googleSheetsService");
const {
  ensureHeaders,
  getAllRecords,
  appendRecord,
  updateRecordAtRow,
  findRowIndexById,
  colNumToLetter,
  DEFAULT_SPREADSHEET_ID,
} = require("../utils/googleSheetsHelpers");
const { getVietnamTimeString } = require("../utils/timeHelpers");

const router = express.Router();

// Transport Requests Schema
const TRANSPORT_REQUESTS_SHEET = "TransportRequests";
const TRANSPORT_REQUESTS_REQUIRED = [
  "requestId",
  "createdAt",
  "pickupAddress",
  "stop1Address",
  "stop2Address",
  "stop3Address",
  "stop4Address",
  "stop5Address",
  "stop6Address",
  "stop7Address",
  "stop8Address",
  "stop9Address",
  "stop10Address",
  "stop1Products",
  "stop2Products",
  "stop3Products",
  "stop4Products",
  "stop5Products",
  "stop6Products",
  "stop7Products",
  "stop8Products",
  "stop9Products",
  "stop10Products",
  "stop1VolumeM3",
  "stop2VolumeM3",
  "stop3VolumeM3",
  "stop4VolumeM3",
  "stop5VolumeM3",
  "stop6VolumeM3",
  "stop7VolumeM3",
  "stop8VolumeM3",
  "stop9VolumeM3",
  "stop10VolumeM3",
  "stop1Packages",
  "stop2Packages",
  "stop3Packages",
  "stop4Packages",
  "stop5Packages",
  "stop6Packages",
  "stop7Packages",
  "stop8Packages",
  "stop9Packages",
  "stop10Packages",
  "totalProducts",
  "totalVolumeM3",
  "totalPackages",
  "pricingMethod",
  "carrierId",
  "carrierName",
  "carrierContact",
  "carrierPhone",
  "carrierEmail",
  "vehicleType",
  "driverId",
  "driverName",
  "driverPhone",
  "driverLicense",
  "loadingImages",
  "department",
  "serviceArea",
  "pricePerKm",
  "pricePerM3",
  "pricePerTrip",
  "stopFee",
  "fuelSurcharge",
  "tollFee",
  "insuranceFee",
  "baseRate",
  "estimatedCost",
  "status",
  "note",
  "distance1",
  "distance2",
  "distance3",
  "distance4",
  "distance5",
  "distance6",
  "distance7",
  "distance8",
  "distance9",
  "distance10",
  "totalDistance",
  "stop1OrderCount",
  "stop2OrderCount",
  "stop3OrderCount",
  "stop4OrderCount",
  "stop5OrderCount",
  "stop6OrderCount",
  "stop7OrderCount",
  "stop8OrderCount",
  "stop9OrderCount",
  "stop10OrderCount",
  "totalOrderCount",
  "stop1TransferIds",
  "stop2TransferIds",
  "stop3TransferIds",
  "stop4TransferIds",
  "stop5TransferIds",
  "stop6TransferIds",
  "stop7TransferIds",
  "stop8TransferIds",
  "stop9TransferIds",
  "stop10TransferIds",
  "stop1MN",
  "stop2MN",
  "stop3MN",
  "stop4MN",
  "stop5MN",
  "stop6MN",
  "stop7MN",
  "stop8MN",
  "stop9MN",
  "stop10MN",
];

/**
 * GET /api/transport-requests/headers
 * Get headers from TransportRequests sheet
 */
router.get("/headers", async (req, res) => {
  try {
    if (req.query.spreadsheetId) {
      process.env.GOOGLE_SHEETS_SPREADSHEET_ID = String(req.query.spreadsheetId);
    }

    await resolveSpreadsheetId();
    const sheets = await getSheetsClient();
    const meta = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID || DEFAULT_SPREADSHEET_ID,
      range: `${TRANSPORT_REQUESTS_SHEET}!1:1`,
    });
    const headers = meta.data.values?.[0] || [];
    const missing = TRANSPORT_REQUESTS_REQUIRED.filter((h) => !headers.includes(h));
    res.json({
      count: headers.length,
      headers,
      requiredCount: TRANSPORT_REQUESTS_REQUIRED.length,
      missingCount: missing.length,
      missing,
    });
  } catch (error) {
    console.error("GET /api/transport-requests/headers error:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/transport-requests
 * Get all transport requests from TransportRequests sheet
 */
router.get("/", async (req, res) => {
  try {
    if (req.query.spreadsheetId) {
      process.env.GOOGLE_SHEETS_SPREADSHEET_ID = String(req.query.spreadsheetId);
    }

    await resolveSpreadsheetId();
    await ensureHeaders(TRANSPORT_REQUESTS_SHEET, TRANSPORT_REQUESTS_REQUIRED);
    const list = await getAllRecords(TRANSPORT_REQUESTS_SHEET);

    if (!list || list.length === 0) {
      console.log("📭 Sheet TransportRequests trống - trả về mảng rỗng");
      return res.json([]);
    }

    return res.json(list);
  } catch (error) {
    console.error("GET /api/transport-requests error:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/transport-requests/:requestId
 * Get a single transport request by ID
 */
router.get("/:requestId", async (req, res) => {
  try {
    const { requestId } = req.params;
    if (req.query.spreadsheetId) {
      process.env.GOOGLE_SHEETS_SPREADSHEET_ID = String(req.query.spreadsheetId);
    }

    await resolveSpreadsheetId();
    await ensureHeaders(TRANSPORT_REQUESTS_SHEET, TRANSPORT_REQUESTS_REQUIRED);
    const { rowIndex, headers, values } = await findRowIndexById(
      TRANSPORT_REQUESTS_SHEET,
      "requestId",
      requestId
    );

    if (rowIndex === -1) {
      return res.status(404).json({ error: "Transport request not found" });
    }

    const record = Object.fromEntries(headers.map((h, i) => [h, values[i] ?? ""]));
    res.json(record);
  } catch (error) {
    console.error("GET /api/transport-requests/:requestId error:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * PUT /api/transport-requests/:requestId
 * Update a transport request
 */
router.put("/:requestId", async (req, res) => {
  try {
    const { requestId } = req.params;
    if (req.query.spreadsheetId) {
      process.env.GOOGLE_SHEETS_SPREADSHEET_ID = String(req.query.spreadsheetId);
    }

    await resolveSpreadsheetId();
    await ensureHeaders(TRANSPORT_REQUESTS_SHEET, TRANSPORT_REQUESTS_REQUIRED);
    const { rowIndex, headers } = await findRowIndexById(
      TRANSPORT_REQUESTS_SHEET,
      "requestId",
      requestId
    );

    if (rowIndex === -1) {
      return res.status(404).json({ error: "Transport request not found" });
    }

    const now = getVietnamTimeString();
    const normalized = {
      ...Object.fromEntries(headers.map((h) => [h, ""])),
      ...req.body,
      requestId,
      updatedAt: now,
    };

    await updateRecordAtRow(TRANSPORT_REQUESTS_SHEET, headers, normalized, rowIndex);
    res.json(normalized);
  } catch (error) {
    console.error("PUT /api/transport-requests/:requestId error:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /api/transport-requests/:requestId
 * Delete a transport request (clear row)
 */
router.delete("/:requestId", async (req, res) => {
  try {
    const { requestId } = req.params;
    if (req.query.spreadsheetId) {
      process.env.GOOGLE_SHEETS_SPREADSHEET_ID = String(req.query.spreadsheetId);
    }

    await resolveSpreadsheetId();
    await ensureHeaders(TRANSPORT_REQUESTS_SHEET, TRANSPORT_REQUESTS_REQUIRED);
    const { rowIndex, headers: hdrs } = await findRowIndexById(
      TRANSPORT_REQUESTS_SHEET,
      "requestId",
      requestId
    );

    if (rowIndex === -1) {
      return res.status(404).json({ error: "Transport request not found" });
    }

    // Clear row
    const sheets = await getSheetsClient();
    const endCol = colNumToLetter(hdrs.length);
    await sheets.spreadsheets.values.clear({
      spreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID || DEFAULT_SPREADSHEET_ID,
      range: `${TRANSPORT_REQUESTS_SHEET}!A${rowIndex}:${endCol}${rowIndex}`,
    });

    res.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/transport-requests/:requestId error:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/transport-requests/generate-id
 * Generate a new request ID and create an empty row
 */
router.post("/generate-id", async (req, res) => {
  try {
    if (req.query.spreadsheetId) {
      process.env.GOOGLE_SHEETS_SPREADSHEET_ID = String(req.query.spreadsheetId);
    }

    await resolveSpreadsheetId();
    await ensureHeaders(TRANSPORT_REQUESTS_SHEET, TRANSPORT_REQUESTS_REQUIRED);
    const sheets = await getSheetsClient();

    // Get all requestIds
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID || DEFAULT_SPREADSHEET_ID,
      range: `${TRANSPORT_REQUESTS_SHEET}!A:A`,
    });

    const requestIds = response.data.values?.slice(1) || []; // Skip header
    let maxNumber = 0;

    // Find max number in existing requestIds
    requestIds.forEach((row) => {
      if (row[0] && row[0].startsWith("MSC-")) {
        const numberPart = row[0].substring(4); // Remove "MSC-"
        const number = parseInt(numberPart, 10);
        if (!isNaN(number) && number > maxNumber) {
          maxNumber = number;
        }
      }
    });

    // Generate new requestId
    const newNumber = maxNumber + 1;
    const requestId = `MSC-${String(newNumber).padStart(8, "0")}`;

    // Create new row with requestId
    const vietnamTimeString = getVietnamTimeString();
    const newRow = [requestId, vietnamTimeString];
    // Add empty columns
    for (let i = 2; i < TRANSPORT_REQUESTS_REQUIRED.length; i++) {
      newRow.push("");
    }

    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID || DEFAULT_SPREADSHEET_ID,
      range: `${TRANSPORT_REQUESTS_SHEET}!A:A`,
      valueInputOption: "RAW",
      insertDataOption: "INSERT_ROWS",
      resource: {
        values: [newRow],
      },
    });

    res.json({ requestId, rowIndex: requestIds.length + 2 }); // +2 for header and new row
  } catch (error) {
    console.error("POST /api/transport-requests/generate-id error:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
