const express = require("express");
const router = express.Router();
const {
  ensureHeaders,
  getAllRecords,
  appendRecord,
  updateRecordAtRow,
  findRowIndexById,
  DEFAULT_SPREADSHEET_ID,
} = require("../utils/googleSheetsHelpers");

const ROLES_SHEET = "Roles";
const ROLES_HEADERS = ["id", "name", "description"];

// Helper to normalize role data
function normalizeRole(record) {
  const base = Object.fromEntries(ROLES_HEADERS.map((h) => [h, ""]));
  return { ...base, ...record };
}

// GET /api/roles - List all roles
router.get("/", async (req, res, next) => {
  try {
    await ensureHeaders(ROLES_SHEET, ROLES_HEADERS);
    const records = await getAllRecords(ROLES_SHEET);
    res.json(records);
  } catch (err) {
    next(err);
  }
});

// GET /api/roles/:id - Get role by ID
router.get("/:id", async (req, res, next) => {
  try {
    const roleId = req.params.id;
    await ensureHeaders(ROLES_SHEET, ROLES_HEADERS);
    const { rowIndex, headers, values } = await findRowIndexById(ROLES_SHEET, "id", roleId);

    if (rowIndex === -1) {
      return res.status(404).json({ error: "Role not found" });
    }

    const role = {};
    headers.forEach((h, i) => {
      role[h] = values[rowIndex]?.[i] || "";
    });

    res.json(role);
  } catch (err) {
    next(err);
  }
});

// POST /api/roles - Create new role
router.post("/", async (req, res) => {
  try {
    const roleData = req.body || {};
    await ensureHeaders(ROLES_SHEET, ROLES_HEADERS);

    const roleId = roleData.id || `ROLE-${Date.now()}`;
    const newRole = normalizeRole({
      ...roleData,
      id: roleId,
    });

    await appendRecord(ROLES_SHEET, ROLES_HEADERS, newRole);

    res.status(201).json(newRole);
  } catch (error) {
    console.error("❌ POST /api/roles error:", error);
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/roles/:id - Update role
router.put("/:id", async (req, res) => {
  try {
    const roleId = req.params.id;
    const updates = req.body || {};
    await ensureHeaders(ROLES_SHEET, ROLES_HEADERS);

    const { rowIndex } = await findRowIndexById(ROLES_SHEET, "id", roleId);

    if (rowIndex === -1) {
      return res.status(404).json({ error: "Role not found" });
    }

    const updatedRole = normalizeRole({
      ...updates,
      id: roleId, // Preserve ID
    });

    await updateRecordAtRow(ROLES_SHEET, ROLES_HEADERS, updatedRole, rowIndex);

    res.json(updatedRole);
  } catch (error) {
    console.error("❌ PUT /api/roles/:id error:", error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/roles/:id - Delete role
router.delete("/:id", async (req, res) => {
  try {
    const roleId = req.params.id;
    await ensureHeaders(ROLES_SHEET, ROLES_HEADERS);

    const { rowIndex } = await findRowIndexById(ROLES_SHEET, "id", roleId);

    if (rowIndex === -1) {
      return res.status(404).json({ error: "Role not found" });
    }

    // Delete row (rowIndex + 1 because row 1 is header)
    const { google } = require("googleapis");
    const path = require("path");
    const keyFile =
      process.env.GOOGLE_APPLICATION_CREDENTIALS ||
      process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH ||
      path.join(__dirname, "../../mia-logistics-469406-eec521c603c0.json");
    const auth = new google.auth.GoogleAuth({
      keyFile,
      scopes: [
        "https://www.googleapis.com/auth/spreadsheets",
        "https://www.googleapis.com/auth/drive",
      ],
    });
    const sheets = google.sheets({ version: "v4", auth });

    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: DEFAULT_SPREADSHEET_ID,
      resource: {
        requests: [
          {
            deleteDimension: {
              range: {
                sheetId: await getSheetId(ROLES_SHEET),
                dimension: "ROWS",
                startIndex: rowIndex,
                endIndex: rowIndex + 1,
              },
            },
          },
        ],
      },
    });

    res.json({ success: true, message: "Role deleted" });
  } catch (error) {
    console.error("❌ DELETE /api/roles/:id error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Helper to get sheet ID by name
async function getSheetId(sheetName) {
  const { google } = require("googleapis");
  const path = require("path");
  const keyFile =
    process.env.GOOGLE_APPLICATION_CREDENTIALS ||
    process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH ||
    path.join(__dirname, "../../mia-logistics-469406-eec521c603c0.json");
  const auth = new google.auth.GoogleAuth({
    keyFile,
    scopes: [
      "https://www.googleapis.com/auth/spreadsheets",
      "https://www.googleapis.com/auth/drive",
    ],
  });
  const sheets = google.sheets({ version: "v4", auth });
  const response = await sheets.spreadsheets.get({
    spreadsheetId: DEFAULT_SPREADSHEET_ID,
  });
  const sheet = response.data.sheets.find((s) => s.properties.title === sheetName);
  return sheet ? sheet.properties.sheetId : 0;
}

module.exports = router;
