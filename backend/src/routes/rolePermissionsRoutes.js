const express = require("express");
const router = express.Router();
const {
  ensureHeaders,
  getAllRecords,
  appendRecord,
  DEFAULT_SPREADSHEET_ID,
} = require("../utils/googleSheetsHelpers");

const ROLE_PERMISSIONS_SHEET = "RolePermissions";
const ROLE_PERMISSIONS_HEADERS = ["roleId", "resource", "action"];

// Helper to normalize role permission data
function normalizeRolePermission(record) {
  const base = Object.fromEntries(ROLE_PERMISSIONS_HEADERS.map((h) => [h, ""]));
  return { ...base, ...record };
}

// GET /api/role-permissions - List all role permissions
router.get("/", async (req, res, next) => {
  try {
    await ensureHeaders(ROLE_PERMISSIONS_SHEET, ROLE_PERMISSIONS_HEADERS);
    const records = await getAllRecords(ROLE_PERMISSIONS_SHEET);
    res.json(records);
  } catch (err) {
    next(err);
  }
});

// GET /api/role-permissions/role/:roleId - Get permissions for a role
router.get("/role/:roleId", async (req, res, next) => {
  try {
    const roleId = req.params.roleId;
    await ensureHeaders(ROLE_PERMISSIONS_SHEET, ROLE_PERMISSIONS_HEADERS);
    const records = await getAllRecords(ROLE_PERMISSIONS_SHEET);
    const filtered = records.filter((r) => r.roleId === roleId);
    res.json(filtered);
  } catch (err) {
    next(err);
  }
});

// GET /api/role-permissions/:roleId/:resource/:action - Check specific permission
router.get("/:roleId/:resource/:action", async (req, res, next) => {
  try {
    const { roleId, resource, action } = req.params;
    await ensureHeaders(ROLE_PERMISSIONS_SHEET, ROLE_PERMISSIONS_HEADERS);
    const records = await getAllRecords(ROLE_PERMISSIONS_SHEET);
    const permission = records.find(
      (r) => r.roleId === roleId && r.resource === resource && r.action === action
    );
    res.json({ hasPermission: !!permission, permission });
  } catch (err) {
    next(err);
  }
});

// POST /api/role-permissions - Create new role permission
router.post("/", async (req, res) => {
  try {
    const permissionData = req.body || {};

    if (!permissionData.roleId || !permissionData.resource || !permissionData.action) {
      return res.status(400).json({
        error: "roleId, resource, and action are required",
      });
    }

    await ensureHeaders(ROLE_PERMISSIONS_SHEET, ROLE_PERMISSIONS_HEADERS);

    // Check if permission already exists
    const records = await getAllRecords(ROLE_PERMISSIONS_SHEET);
    const exists = records.find(
      (r) =>
        r.roleId === permissionData.roleId &&
        r.resource === permissionData.resource &&
        r.action === permissionData.action
    );

    if (exists) {
      return res.status(409).json({ error: "Permission already exists" });
    }

    const newPermission = normalizeRolePermission(permissionData);
    await appendRecord(ROLE_PERMISSIONS_SHEET, ROLE_PERMISSIONS_HEADERS, newPermission);

    res.status(201).json(newPermission);
  } catch (error) {
    console.error("❌ POST /api/role-permissions error:", error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/role-permissions/:roleId/:resource/:action - Delete role permission
router.delete("/:roleId/:resource/:action", async (req, res) => {
  try {
    const { roleId, resource, action } = req.params;
    await ensureHeaders(ROLE_PERMISSIONS_SHEET, ROLE_PERMISSIONS_HEADERS);

    const records = await getAllRecords(ROLE_PERMISSIONS_SHEET);
    const record = records.find(
      (r) => r.roleId === roleId && r.resource === resource && r.action === action
    );

    if (!record) {
      return res.status(404).json({ error: "Permission not found" });
    }

    // Verify the row matches all three fields
    const { headers, values } = await getAllRecords(ROLE_PERMISSIONS_SHEET);
    let actualRowIndex = -1;
    for (let i = 0; i < values.length; i++) {
      const row = {};
      headers.forEach((h, j) => {
        row[h] = values[i]?.[j] || "";
      });
      if (row.roleId === roleId && row.resource === resource && row.action === action) {
        actualRowIndex = i;
        break;
      }
    }

    if (actualRowIndex === -1) {
      return res.status(404).json({ error: "Permission not found" });
    }

    // Delete row using batchUpdate
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

    // Get sheet ID
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId: DEFAULT_SPREADSHEET_ID,
    });
    const sheet = spreadsheet.data.sheets.find(
      (s) => s.properties.title === ROLE_PERMISSIONS_SHEET
    );

    if (!sheet) {
      return res.status(404).json({ error: "Sheet not found" });
    }

    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: DEFAULT_SPREADSHEET_ID,
      resource: {
        requests: [
          {
            deleteDimension: {
              range: {
                sheetId: sheet.properties.sheetId,
                dimension: "ROWS",
                startIndex: actualRowIndex + 1, // +1 because row 1 is header
                endIndex: actualRowIndex + 2,
              },
            },
          },
        ],
      },
    });

    res.json({ success: true, message: "Permission deleted" });
  } catch (error) {
    console.error("❌ DELETE /api/role-permissions error:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
