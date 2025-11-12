const express = require("express");
const router = express.Router();
const googleSheetsService = require("../services/googleSheetsService");
const {
  ensureHeaders,
  appendRecord,
  updateRecordAtRow,
  findRowIndexById,
} = require("../utils/googleSheetsHelpers");
const { getVietnamTimeString } = require("../utils/timeHelpers");

const INBOUND_DOMESTIC_SHEET = "InboundDomestic";
// Core headers - full headers list can be extended based on actual sheet structure
const INBOUND_DOMESTIC_HEADERS = [
  "id",
  "date",
  "pi",
  "supplier",
  "origin",
  "destination",
  "product",
  "category",
  "quantity",
  "container",
  "status",
  "carrier",
  "purpose",
  "receiveTime",
  "poNumbers",
  "packagingTypes",
  "packagingQuantities",
  "packagingDescriptions",
  "notes",
  "createdAt",
  "updatedAt",
];

// Helper to normalize inbound domestic data
function normalizeInboundDomestic(record) {
  const base = Object.fromEntries(INBOUND_DOMESTIC_HEADERS.map((h) => [h, ""]));
  return { ...base, ...record };
}

// GET /api/inbound/domestic - List all inbound domestic records
router.get("/", async (req, res, next) => {
  try {
    const items = await googleSheetsService.getInboundDomestic();
    res.json(items);
  } catch (err) {
    next(err);
  }
});

// GET /api/inbound/domestic/:id - Get inbound domestic by ID
router.get("/:id", async (req, res, next) => {
  try {
    const id = req.params.id;
    await ensureHeaders(INBOUND_DOMESTIC_SHEET, INBOUND_DOMESTIC_HEADERS);
    const { rowIndex, headers, values } = await findRowIndexById(INBOUND_DOMESTIC_SHEET, "id", id);

    if (rowIndex === -1) {
      return res.status(404).json({ error: "Record not found" });
    }

    const record = {};
    headers.forEach((h, i) => {
      record[h] = values[rowIndex]?.[i] || "";
    });

    res.json(record);
  } catch (err) {
    next(err);
  }
});

// POST /api/inbound/domestic - Create new inbound domestic record
router.post("/", async (req, res) => {
  try {
    const recordData = req.body || {};
    const now = getVietnamTimeString();
    await ensureHeaders(INBOUND_DOMESTIC_SHEET, INBOUND_DOMESTIC_HEADERS);

    const recordId = recordData.id || `DOM-${Date.now()}`;
    const newRecord = normalizeInboundDomestic({
      ...recordData,
      id: recordId,
      createdAt: now,
      updatedAt: now,
    });

    await appendRecord(INBOUND_DOMESTIC_SHEET, INBOUND_DOMESTIC_HEADERS, newRecord);

    res.status(201).json(newRecord);
  } catch (error) {
    console.error("❌ POST /api/inbound/domestic error:", error);
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/inbound/domestic/:id - Update inbound domestic record
router.put("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const updates = req.body || {};
    const now = getVietnamTimeString();
    await ensureHeaders(INBOUND_DOMESTIC_SHEET, INBOUND_DOMESTIC_HEADERS);

    const { rowIndex } = await findRowIndexById(INBOUND_DOMESTIC_SHEET, "id", id);

    if (rowIndex === -1) {
      return res.status(404).json({ error: "Record not found" });
    }

    const updatedRecord = normalizeInboundDomestic({
      ...updates,
      id, // Preserve ID
      updatedAt: now,
    });

    await updateRecordAtRow(
      INBOUND_DOMESTIC_SHEET,
      INBOUND_DOMESTIC_HEADERS,
      updatedRecord,
      rowIndex
    );

    res.json(updatedRecord);
  } catch (error) {
    console.error("❌ PUT /api/inbound/domestic/:id error:", error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/inbound/domestic/:id - Delete inbound domestic record
router.delete("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    await ensureHeaders(INBOUND_DOMESTIC_SHEET, INBOUND_DOMESTIC_HEADERS);

    const { rowIndex } = await findRowIndexById(INBOUND_DOMESTIC_SHEET, "id", id);

    if (rowIndex === -1) {
      return res.status(404).json({ error: "Record not found" });
    }

    // Soft delete: Update status instead of deleting
    const now = getVietnamTimeString();
    const updatedRecord = normalizeInboundDomestic({
      status: "cancelled",
      updatedAt: now,
    });

    await updateRecordAtRow(
      INBOUND_DOMESTIC_SHEET,
      INBOUND_DOMESTIC_HEADERS,
      updatedRecord,
      rowIndex
    );

    res.json({ success: true, message: "Record cancelled" });
  } catch (error) {
    console.error("❌ DELETE /api/inbound/domestic/:id error:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
