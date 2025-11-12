const express = require("express");
const router = express.Router();
const googleSheetsService = require("../services/googleSheetsService");
const {
  ensureHeaders,
  appendRecord,
  updateRecordAtRow,
  findRowIndexById,
  DEFAULT_SPREADSHEET_ID,
} = require("../utils/googleSheetsHelpers");
const { getVietnamTimeString } = require("../utils/timeHelpers");

const CARRIERS_SHEET = "Carriers";
const CARRIERS_HEADERS = [
  "carrierId",
  "name",
  "avatarUrl",
  "contactPerson",
  "email",
  "phone",
  "address",
  "serviceAreas",
  "pricingMethod",
  "baseRate",
  "perKmRate",
  "perM3Rate",
  "perTripRate",
  "fuelSurcharge",
  "remoteAreaFee",
  "insuranceRate",
  "vehicleTypes",
  "maxWeight",
  "maxVolume",
  "operatingHours",
  "isActive",
  "rating",
  "createdAt",
  "updatedAt",
];

// Helper to normalize carrier data
function normalizeCarrier(record) {
  const base = Object.fromEntries(CARRIERS_HEADERS.map((h) => [h, ""]));
  const merged = { ...base, ...record };
  // Ensure boolean is string for Google Sheets
  if (merged.isActive !== undefined) {
    merged.isActive =
      merged.isActive === true || merged.isActive === "true" || merged.isActive === "TRUE"
        ? "TRUE"
        : "FALSE";
  }
  // Ensure numbers are strings for Google Sheets
  const numberFields = [
    "baseRate",
    "perKmRate",
    "perM3Rate",
    "perTripRate",
    "fuelSurcharge",
    "remoteAreaFee",
    "insuranceRate",
    "maxWeight",
    "maxVolume",
    "rating",
  ];
  numberFields.forEach((field) => {
    if (merged[field] !== undefined) {
      merged[field] = String(merged[field] || "0");
    }
  });
  return merged;
}

// GET /api/carriers - list carriers from Google Sheets
router.get("/", async (req, res, next) => {
  try {
    const carriers = await googleSheetsService.getCarriers();
    res.json(carriers);
  } catch (err) {
    next(err);
  }
});

// POST /api/carriers - Create new carrier
router.post("/", async (req, res) => {
  try {
    const carrierData = req.body || {};
    const now = getVietnamTimeString();

    await ensureHeaders(CARRIERS_SHEET, CARRIERS_HEADERS);

    const carrierId = carrierData.carrierId || `CAR-${Date.now()}`;
    const newCarrier = normalizeCarrier({
      ...carrierData,
      carrierId,
      createdAt: now,
      updatedAt: now,
    });

    await appendRecord(CARRIERS_SHEET, CARRIERS_HEADERS, newCarrier);

    res.status(201).json(newCarrier);
  } catch (error) {
    console.error("❌ POST /api/carriers error:", error);
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/carriers/:id - Update carrier
router.put("/:id", async (req, res) => {
  try {
    const carrierId = req.params.id;
    const updates = req.body || {};
    const now = getVietnamTimeString();

    await ensureHeaders(CARRIERS_SHEET, CARRIERS_HEADERS);

    // Find row index
    const { rowIndex, headers, values } = await findRowIndexById(
      CARRIERS_SHEET,
      "carrierId",
      carrierId
    );

    if (rowIndex === -1) {
      return res.status(404).json({ error: "Carrier not found" });
    }

    // Merge updates with existing values
    const updatedCarrier = normalizeCarrier({
      ...Object.fromEntries(headers.map((h, i) => [h, values[i] || ""])),
      ...updates,
      carrierId, // Ensure carrierId doesn't change
      updatedAt: now,
    });

    await updateRecordAtRow(CARRIERS_SHEET, CARRIERS_HEADERS, updatedCarrier, rowIndex);

    res.json(updatedCarrier);
  } catch (error) {
    console.error("❌ PUT /api/carriers/:id error:", error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/carriers/:id - Delete carrier
router.delete("/:id", async (req, res) => {
  try {
    const carrierId = req.params.id;

    const { rowIndex } = await findRowIndexById(CARRIERS_SHEET, "carrierId", carrierId);

    if (rowIndex === -1) {
      return res.status(404).json({ error: "Carrier not found" });
    }

    // Delete row by clearing it (safer than deleting dimension)
    const { headers } = await findRowIndexById(CARRIERS_SHEET, "carrierId", carrierId);
    const emptyRow = headers.map(() => "");

    const sheets = await googleSheetsService.getSheetsClient();
    await sheets.spreadsheets.values.update({
      spreadsheetId: DEFAULT_SPREADSHEET_ID,
      range: `${CARRIERS_SHEET}!A${rowIndex}:Z${rowIndex}`,
      valueInputOption: "RAW",
      resource: { values: [emptyRow] },
    });

    res.json({ success: true, message: "Carrier deleted" });
  } catch (error) {
    console.error("❌ DELETE /api/carriers/:id error:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
