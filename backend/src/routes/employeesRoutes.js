const express = require("express");
const router = express.Router();
const {
  ensureHeaders,
  getAllRecords,
  appendRecord,
  updateRecordAtRow,
  findRowIndexById,
} = require("../utils/googleSheetsHelpers");
const { getVietnamTimeString } = require("../utils/timeHelpers");

const EMPLOYEES_SHEET = "Employees";
const EMPLOYEES_HEADERS = [
  "id",
  "code",
  "fullName",
  "email",
  "phone",
  "department",
  "position",
  "status",
  "createdAt",
  "updatedAt",
];

// Helper to normalize employee data
function normalizeEmployee(record) {
  const base = Object.fromEntries(EMPLOYEES_HEADERS.map((h) => [h, ""]));
  const merged = { ...base, ...record };
  // Ensure boolean is string for Google Sheets
  if (merged.status !== undefined) {
    merged.status =
      merged.status === true || merged.status === "true" || merged.status === "TRUE"
        ? "TRUE"
        : "FALSE";
  }
  return merged;
}

// GET /api/employees - List all employees
router.get("/", async (req, res, next) => {
  try {
    await ensureHeaders(EMPLOYEES_SHEET, EMPLOYEES_HEADERS);
    const records = await getAllRecords(EMPLOYEES_SHEET);
    res.json(records);
  } catch (err) {
    next(err);
  }
});

// GET /api/employees/:id - Get employee by ID
router.get("/:id", async (req, res, next) => {
  try {
    const employeeId = req.params.id;
    await ensureHeaders(EMPLOYEES_SHEET, EMPLOYEES_HEADERS);
    const { rowIndex, headers, values } = await findRowIndexById(EMPLOYEES_SHEET, "id", employeeId);

    if (rowIndex === -1) {
      return res.status(404).json({ error: "Employee not found" });
    }

    const employee = {};
    headers.forEach((h, i) => {
      employee[h] = values[rowIndex]?.[i] || "";
    });

    res.json(employee);
  } catch (err) {
    next(err);
  }
});

// POST /api/employees - Create new employee
router.post("/", async (req, res) => {
  try {
    const employeeData = req.body || {};
    const now = getVietnamTimeString();
    await ensureHeaders(EMPLOYEES_SHEET, EMPLOYEES_HEADERS);

    const employeeId = employeeData.id || `EMP-${Date.now()}`;
    const newEmployee = normalizeEmployee({
      ...employeeData,
      id: employeeId,
      createdAt: now,
      updatedAt: now,
    });

    await appendRecord(EMPLOYEES_SHEET, EMPLOYEES_HEADERS, newEmployee);

    res.status(201).json(newEmployee);
  } catch (error) {
    console.error("❌ POST /api/employees error:", error);
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/employees/:id - Update employee
router.put("/:id", async (req, res) => {
  try {
    const employeeId = req.params.id;
    const updates = req.body || {};
    const now = getVietnamTimeString();
    await ensureHeaders(EMPLOYEES_SHEET, EMPLOYEES_HEADERS);

    const { rowIndex } = await findRowIndexById(EMPLOYEES_SHEET, "id", employeeId);

    if (rowIndex === -1) {
      return res.status(404).json({ error: "Employee not found" });
    }

    const updatedEmployee = normalizeEmployee({
      ...updates,
      id: employeeId, // Preserve ID
      updatedAt: now,
    });

    await updateRecordAtRow(EMPLOYEES_SHEET, EMPLOYEES_HEADERS, updatedEmployee, rowIndex);

    res.json(updatedEmployee);
  } catch (error) {
    console.error("❌ PUT /api/employees/:id error:", error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/employees/:id - Delete employee
router.delete("/:id", async (req, res) => {
  try {
    const employeeId = req.params.id;
    await ensureHeaders(EMPLOYEES_SHEET, EMPLOYEES_HEADERS);

    const { rowIndex } = await findRowIndexById(EMPLOYEES_SHEET, "id", employeeId);

    if (rowIndex === -1) {
      return res.status(404).json({ error: "Employee not found" });
    }

    // Soft delete: Set status to FALSE instead of deleting
    const now = getVietnamTimeString();
    const updatedEmployee = normalizeEmployee({
      status: "FALSE",
      updatedAt: now,
    });

    await updateRecordAtRow(EMPLOYEES_SHEET, EMPLOYEES_HEADERS, updatedEmployee, rowIndex);

    res.json({ success: true, message: "Employee deactivated" });
  } catch (error) {
    console.error("❌ DELETE /api/employees/:id error:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
