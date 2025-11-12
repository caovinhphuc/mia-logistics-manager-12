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

const INBOUND_INTERNATIONAL_SHEET = "InboundInternational";
// Core headers - based on GOOGLE_SHEETS_SETUP.md (70+ columns)
const INBOUND_INTERNATIONAL_HEADERS = [
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
  "timeline_cargoReady_est",
  "timeline_cargoReady_act",
  "timeline_cargoReady_status",
  "timeline_etd_est",
  "timeline_etd_act",
  "timeline_etd_status",
  "timeline_eta_est",
  "timeline_eta_act",
  "timeline_eta_status",
  "timeline_depart_est",
  "timeline_depart_act",
  "timeline_depart_status",
  "timeline_arrivalPort_est",
  "timeline_arrivalPort_act",
  "timeline_arrivalPort_status",
  "timeline_receive_est",
  "timeline_receive_act",
  "timeline_receive_status",
  "doc_checkBill_est",
  "doc_checkBill_act",
  "doc_checkBill_status",
  "doc_checkCO_est",
  "doc_checkCO_act",
  "doc_checkCO_status",
  "doc_sendDocs_est",
  "doc_sendDocs_act",
  "doc_sendDocs_status",
  "doc_customs_est",
  "doc_customs_act",
  "doc_customs_status",
  "doc_tax_est",
  "doc_tax_act",
  "doc_tax_status",
  "notes",
  "createdAt",
  "updatedAt",
];

// Helper to normalize inbound international data
function normalizeInboundInternational(record) {
  const base = Object.fromEntries(INBOUND_INTERNATIONAL_HEADERS.map((h) => [h, ""]));
  return { ...base, ...record };
}

// GET /api/inbound/international - List all inbound international records
router.get("/", async (req, res, next) => {
  try {
    const items = await googleSheetsService.getInboundInternational();
    res.json(items);
  } catch (err) {
    next(err);
  }
});

// GET /api/inbound/international/:id - Get inbound international by ID
router.get("/:id", async (req, res, next) => {
  try {
    const id = req.params.id;
    await ensureHeaders(INBOUND_INTERNATIONAL_SHEET, INBOUND_INTERNATIONAL_HEADERS);
    const { rowIndex, headers, values } = await findRowIndexById(
      INBOUND_INTERNATIONAL_SHEET,
      "id",
      id
    );

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

// POST /api/inbound/international - Create new inbound international record
router.post("/", async (req, res) => {
  try {
    const recordData = req.body || {};
    const now = getVietnamTimeString();
    await ensureHeaders(INBOUND_INTERNATIONAL_SHEET, INBOUND_INTERNATIONAL_HEADERS);

    const recordId = recordData.id || `INT-${Date.now()}`;
    const newRecord = normalizeInboundInternational({
      ...recordData,
      id: recordId,
      createdAt: now,
      updatedAt: now,
    });

    await appendRecord(INBOUND_INTERNATIONAL_SHEET, INBOUND_INTERNATIONAL_HEADERS, newRecord);

    res.status(201).json(newRecord);
  } catch (error) {
    console.error("❌ POST /api/inbound/international error:", error);
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/inbound/international/:id - Update inbound international record
router.put("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const updates = req.body || {};
    const now = getVietnamTimeString();
    await ensureHeaders(INBOUND_INTERNATIONAL_SHEET, INBOUND_INTERNATIONAL_HEADERS);

    const { rowIndex } = await findRowIndexById(INBOUND_INTERNATIONAL_SHEET, "id", id);

    if (rowIndex === -1) {
      return res.status(404).json({ error: "Record not found" });
    }

    const updatedRecord = normalizeInboundInternational({
      ...updates,
      id, // Preserve ID
      updatedAt: now,
    });

    await updateRecordAtRow(
      INBOUND_INTERNATIONAL_SHEET,
      INBOUND_INTERNATIONAL_HEADERS,
      updatedRecord,
      rowIndex
    );

    res.json(updatedRecord);
  } catch (error) {
    console.error("❌ PUT /api/inbound/international/:id error:", error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/inbound/international/:id - Delete inbound international record
router.delete("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    await ensureHeaders(INBOUND_INTERNATIONAL_SHEET, INBOUND_INTERNATIONAL_HEADERS);

    const { rowIndex } = await findRowIndexById(INBOUND_INTERNATIONAL_SHEET, "id", id);

    if (rowIndex === -1) {
      return res.status(404).json({ error: "Record not found" });
    }

    // Soft delete: Update status instead of deleting
    const now = getVietnamTimeString();
    const updatedRecord = normalizeInboundInternational({
      status: "cancelled",
      updatedAt: now,
    });

    await updateRecordAtRow(
      INBOUND_INTERNATIONAL_SHEET,
      INBOUND_INTERNATIONAL_HEADERS,
      updatedRecord,
      rowIndex
    );

    res.json({ success: true, message: "Record cancelled" });
  } catch (error) {
    console.error("❌ DELETE /api/inbound/international/:id error:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
