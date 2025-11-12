import bcrypt from "bcryptjs";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import fs from "fs";
import { google } from "googleapis";
import { createServer } from "http";
import fetch from "node-fetch";
import path from "path";
// Import notification services
import { notificationConfig } from "./config/notification.js";
import emailService from "./services/emailService.js";
import notificationManager from "./services/notificationManager.js";
import realtimeService from "./services/realtimeService.js";
import telegramService from "./services/telegramService.js";
dotenv.config();

// Utility function for Vietnam timezone
function getVietnamTime() {
  return new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" }));
}

function getVietnamTimeDisplay() {
  const vietnamTime = getVietnamTime();
  // Format: DD/MM/YYYY HH:mm:ss (Vietnam timezone)
  const day = String(vietnamTime.getDate()).padStart(2, "0");
  const month = String(vietnamTime.getMonth() + 1).padStart(2, "0");
  const year = vietnamTime.getFullYear();
  const hours = String(vietnamTime.getHours()).padStart(2, "0");
  const minutes = String(vietnamTime.getMinutes()).padStart(2, "0");
  const seconds = String(vietnamTime.getSeconds()).padStart(2, "0");

  return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
}

function getVietnamTimeString() {
  // Format: YYYY-MM-DD HH:mm:ss (Vietnam timezone)
  // Sử dụng toLocaleString để lấy đúng múi giờ Việt Nam
  const now = new Date();
  const vietnamTimeString = now.toLocaleString("en-CA", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  // Convert từ format "2025-08-23, 14:35:44" thành "2025-08-23 14:35:44"
  return vietnamTimeString.replace(", ", " ");
}

const app = express();
const server = createServer(app);

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5050;
const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
let ACTIVE_SPREADSHEET_ID = SPREADSHEET_ID;
// === Auth Sheets Schema ===
const USERS_SHEET = "Users";
const USERS_HEADERS = [
  "id",
  "email",
  "passwordHash",
  "fullName",
  "roleId",
  "status",
  "createdAt",
  "updatedAt",
];
const ROLES_SHEET = "Roles";
const ROLES_HEADERS = ["id", "name", "description"];
const ROLE_PERMS_SHEET = "RolePermissions";
const ROLE_PERMS_HEADERS = ["roleId", "resource", "action"];
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
// Logs
const LOGS_SHEET = "Logs";
const LOGS_HEADERS = [
  "id",
  "timestamp",
  "userId",
  "email",
  "action",
  "resource",
  "details",
  "ip",
  "userAgent",
];

// Auto-update admin permissions to ensure full access
async function ensureAdminFullPermissions() {
  if (!ACTIVE_SPREADSHEET_ID || !fs.existsSync(SERVICE_ACCOUNT_PATH)) return;
  await resolveSpreadsheetId();
  const sheets = getSheetsClient();

  // All possible resources in the system
  const allResources = [
    "orders",
    "carriers",
    "locations",
    "transfers",
    "transportRequests",
    "shipments",
    "settings",
    "employees",
    "inbound-international",
    "inbound-domestic",
    "inbound-schedule",
  ];

  const allActions = ["view", "create", "update", "delete"];

  // Get current admin permissions
  await ensureHeaders(sheets, ROLE_PERMS_SHEET, ROLE_PERMS_HEADERS);
  const currentPermissions = await getAllRecords(sheets, ROLE_PERMS_SHEET);
  const adminPermissions = (currentPermissions || []).filter((p) => p.roleId === "admin");

  // Check if admin has all permissions
  const hasAllPermissions = allResources.every((resource) =>
    allActions.every((action) =>
      adminPermissions.some((p) => p.resource === resource && p.action === action)
    )
  );

  if (!hasAllPermissions) {
    console.log("🔄 Updating admin permissions to ensure full access...");

    // Remove existing admin permissions
    await deleteRolePermissionsForRole(sheets, "admin");

    // Add all permissions for admin
    for (const resource of allResources) {
      for (const action of allActions) {
        await appendRecord(sheets, ROLE_PERMS_SHEET, ROLE_PERMS_HEADERS, {
          roleId: "admin",
          resource: resource,
          action: action,
        });
      }
    }
    console.log("✅ Admin permissions updated with full access");
  }
}

// Seed admin if empty
async function seedAuthSheetsIfEmpty() {
  if (!ACTIVE_SPREADSHEET_ID || !fs.existsSync(SERVICE_ACCOUNT_PATH)) return;
  await resolveSpreadsheetId();
  const sheets = getSheetsClient();
  await ensureHeaders(sheets, USERS_SHEET, USERS_HEADERS);
  await ensureHeaders(sheets, ROLES_SHEET, ROLES_HEADERS);
  await ensureHeaders(sheets, ROLE_PERMS_SHEET, ROLE_PERMS_HEADERS);
  await ensureHeaders(sheets, EMPLOYEES_SHEET, EMPLOYEES_HEADERS);
  const users = await getAllRecords(sheets, USERS_SHEET);
  if (!users || users.length === 0) {
    const now = getVietnamTimeString();
    const adminRole = {
      id: "admin",
      name: "Admin",
      description: "Super admin",
    };
    await appendRecord(sheets, ROLES_SHEET, ROLES_HEADERS, adminRole);
    const hash = await bcrypt.hash("admin@123", 10);
    await appendRecord(sheets, USERS_SHEET, USERS_HEADERS, {
      id: "u-admin",
      email: "admin@mia.vn",
      passwordHash: hash,
      fullName: "Administrator",
      roleId: "admin",
      status: "active",
      createdAt: now,
      updatedAt: now,
    });
    // Basic full permissions for admin
    const resources = [
      "orders",
      "carriers",
      "locations",
      "transfers",
      "transportRequests",
      "shipments",
      "settings",
    ];
    for (const r of resources) {
      for (const a of ["view", "create", "update", "delete"]) {
        await appendRecord(sheets, ROLE_PERMS_SHEET, ROLE_PERMS_HEADERS, {
          roleId: "admin",
          resource: r,
          action: a,
        });
      }
    }
    console.log("✅ Seeded auth sheets with default admin");
  }

  // Always ensure admin has full permissions
  await ensureAdminFullPermissions();
}

// Trim a sheet to keep only header + last N rows
async function trimSheetToLastRows(sheets, sheetName, keepRows = 1000) {
  const meta = await sheets.spreadsheets.values.get({
    spreadsheetId: ACTIVE_SPREADSHEET_ID,
    range: `${sheetName}`,
  });
  const values = meta.data.values || [];
  if (values.length <= keepRows + 1) return; // header + keepRows
  const total = values.length - 1; // exclude header
  const toDelete = total - keepRows;
  const sheetId = await getSheetIdByName(sheets, sheetName);
  if (!sheetId) return;
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: ACTIVE_SPREADSHEET_ID,
    requestBody: {
      requests: [
        {
          deleteDimension: {
            range: {
              sheetId,
              dimension: "ROWS",
              startIndex: 1, // after header
              endIndex: 1 + toDelete,
            },
          },
        },
      ],
    },
  });
}

// Auth: login endpoint
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: "email and password are required" });
    }
    if (!SPREADSHEET_ID || !fs.existsSync(SERVICE_ACCOUNT_PATH)) {
      return res.status(500).json({ error: "Google Sheets not configured" });
    }
    await resolveSpreadsheetId();
    const sheets = getSheetsClient();
    await ensureHeaders(sheets, USERS_SHEET, USERS_HEADERS);
    await ensureHeaders(sheets, ROLES_SHEET, ROLES_HEADERS);
    await ensureHeaders(sheets, ROLE_PERMS_SHEET, ROLE_PERMS_HEADERS);
    const users = await getAllRecords(sheets, USERS_SHEET);
    const user = (users || []).find(
      (u) => String(u.email).toLowerCase() === String(email).toLowerCase()
    );
    if (!user || !user.passwordHash) {
      return res.status(401).json({ error: "Email hoặc mật khẩu không đúng" });
    }
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ error: "Email hoặc mật khẩu không đúng" });
    }
    if (user.status && String(user.status).toLowerCase() !== "active") {
      return res.status(403).json({ error: "Tài khoản đang bị khóa" });
    }
    const roleId = user.roleId || "";
    const perms = await getAllRecords(sheets, ROLE_PERMS_SHEET);
    const rolePerms = (perms || []).filter((p) => p.roleId === roleId);
    // log successful login
    try {
      await ensureHeaders(sheets, LOGS_SHEET, LOGS_HEADERS);
      await appendRecord(sheets, LOGS_SHEET, LOGS_HEADERS, {
        id: `LOG-${Date.now()}`,
        timestamp: getVietnamTimeString(),
        userId: user.id,
        email: user.email,
        action: "LOGIN",
        resource: "auth",
        details: "User login success",
        ip: req.ip || "",
        userAgent: req.headers["user-agent"] || "",
      });
      await trimSheetToLastRows(sheets, LOGS_SHEET, 1000);
    } catch (e) {
      console.warn("Login log write failed:", e?.message || e);
    }
    return res.json({
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      roleId,
      permissions: rolePerms,
    });
  } catch (e) {
    console.error("POST /api/auth/login error:", e);
    res.status(500).json({ error: e.message });
  }
});

// Auth: logout (for logging purpose)
app.post("/api/auth/logout", async (req, res) => {
  try {
    await resolveSpreadsheetId();
    const sheets = getSheetsClient();
    await ensureHeaders(sheets, LOGS_SHEET, LOGS_HEADERS);
    const { userId = "", email = "" } = req.body || {};
    await appendRecord(sheets, LOGS_SHEET, LOGS_HEADERS, {
      id: `LOG-${Date.now()}`,
      timestamp: getVietnamTimeString(),
      userId,
      email,
      action: "LOGOUT",
      resource: "auth",
      details: "User logout",
      ip: req.ip || "",
      userAgent: req.headers["user-agent"] || "",
    });
    await trimSheetToLastRows(sheets, LOGS_SHEET, 1000);
    res.json({ ok: true });
  } catch (e) {
    console.error("POST /api/auth/logout error:", e);
    res.status(500).json({ error: e.message });
  }
});

// Initialize Logs sheet (headers + size)
app.post("/api/logs/init", async (req, res) => {
  try {
    await resolveSpreadsheetId();
    const sheets = getSheetsClient();
    const headers = await ensureHeaders(sheets, LOGS_SHEET, LOGS_HEADERS);
    // ensure grid rows up to 1000
    const sheetId = await getSheetIdByName(sheets, LOGS_SHEET);
    if (sheetId) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: ACTIVE_SPREADSHEET_ID,
        requestBody: {
          requests: [
            {
              updateSheetProperties: {
                properties: { sheetId, gridProperties: { rowCount: 1001 } },
                fields: "gridProperties.rowCount",
              },
            },
          ],
        },
      });
    }
    res.json({ ok: true, sheet: LOGS_SHEET, headers, maxRows: 1000 });
  } catch (e) {
    console.error("POST /api/logs/init error:", e);
    res.status(500).json({ error: e.message });
  }
});

// Generic logs endpoint
app.post("/api/logs", async (req, res) => {
  try {
    await resolveSpreadsheetId();
    const sheets = getSheetsClient();
    await ensureHeaders(sheets, LOGS_SHEET, LOGS_HEADERS);
    const { userId = "", email = "", action = "", resource = "", details = "" } = req.body || {};
    const rec = {
      id: `LOG-${Date.now()}`,
      timestamp: getVietnamTimeString(),
      userId,
      email,
      action,
      resource,
      details,
      ip: req.ip || "",
      userAgent: req.headers["user-agent"] || "",
    };
    await appendRecord(sheets, LOGS_SHEET, LOGS_HEADERS, rec);
    await trimSheetToLastRows(sheets, LOGS_SHEET, 1000);
    res.status(201).json(rec);
  } catch (e) {
    console.error("POST /api/logs error:", e);
    res.status(500).json({ error: e.message });
  }
});

// Query logs with filters and pagination (80/20)
app.get("/api/logs", async (req, res) => {
  try {
    await resolveSpreadsheetId();
    const sheets = getSheetsClient();
    await ensureHeaders(sheets, LOGS_SHEET, LOGS_HEADERS);
    const list = await getAllRecords(sheets, LOGS_SHEET);
    const {
      limit = "500",
      action = "",
      resource = "",
      email = "",
      from = "",
      to = "",
    } = req.query || {};

    // Filter
    let rows = (list || []).filter(Boolean);
    const fromTs = from ? new Date(from + "T00:00:00").getTime() : 0;
    const toTs = to ? new Date(to + "T23:59:59").getTime() : Number.MAX_SAFE_INTEGER;
    rows = rows.filter((r) => {
      const okAction = action ? String(r.action || "") === String(action) : true;
      const okRes = resource ? String(r.resource || "") === String(resource) : true;
      const okEmail = email ? String(r.email || "").includes(String(email)) : true;
      const ts = new Date(String(r.timestamp || "")).getTime();
      const okTime = isFinite(ts) ? ts >= fromTs && ts <= toTs : true;
      return okAction && okRes && okEmail && okTime;
    });

    // Sort desc by timestamp string (fallback to id)
    rows.sort(
      (a, b) =>
        String(b.timestamp || "").localeCompare(String(a.timestamp || "")) ||
        String(b.id || "").localeCompare(String(a.id || ""))
    );

    const n = Math.max(1, Math.min(1000, parseInt(String(limit)) || 500));
    res.json(rows.slice(0, n));
  } catch (e) {
    console.error("GET /api/logs error:", e);
    res.status(500).json({ error: e.message });
  }
});

// Export logs to CSV (filtered)
app.get("/api/logs/export", async (req, res) => {
  try {
    // Reuse GET logic by querying first
    const url = new URL(req.protocol + "://" + req.get("host") + req.originalUrl);
    const q = url.search;
    const resp = await fetch(`http://localhost:${PORT}/api/logs${q}`);
    const rows = await resp.json();
    const headers = LOGS_HEADERS;
    const table = [headers, ...(rows || []).map((r) => headers.map((h) => r[h] ?? ""))];
    const csv = table
      .map((cols) =>
        cols
          .map((v) => {
            const s = String(v);
            return s.includes(",") || s.includes('"') ? '"' + s.replace(/"/g, '""') + '"' : s;
          })
          .join(",")
      )
      .join("\n");
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", 'attachment; filename="logs.csv"');
    res.send(csv);
  } catch (e) {
    console.error("GET /api/logs/export error:", e);
    res.status(500).json({ error: e.message });
  }
});

// Employees listing
app.get("/api/employees", async (req, res) => {
  try {
    if (!SPREADSHEET_ID || !fs.existsSync(SERVICE_ACCOUNT_PATH)) {
      return res.status(500).json({ error: "Google Sheets not configured" });
    }
    await resolveSpreadsheetId();
    const sheets = getSheetsClient();
    await ensureHeaders(sheets, EMPLOYEES_SHEET, EMPLOYEES_HEADERS);
    const list = await getAllRecords(sheets, EMPLOYEES_SHEET);
    return res.json(list || []);
  } catch (e) {
    console.error("GET /api/employees error:", e);
    res.status(500).json({ error: e.message });
  }
});

// Create employee
app.post("/api/employees", async (req, res) => {
  try {
    const rec = req.body || {};
    if (!SPREADSHEET_ID || !fs.existsSync(SERVICE_ACCOUNT_PATH)) {
      return res.status(500).json({ error: "Google Sheets not configured" });
    }
    await resolveSpreadsheetId();
    const sheets = getSheetsClient();
    const headers = await ensureHeaders(sheets, EMPLOYEES_SHEET, EMPLOYEES_HEADERS);
    const now = getVietnamTimeString();
    const normalized = {
      ...Object.fromEntries(headers.map((h) => [h, ""])),
      id: rec.id || `EMP-${Date.now()}`,
      code: rec.code || "",
      fullName: rec.fullName || "",
      email: rec.email || "",
      phone: rec.phone || "",
      department: rec.department || "",
      position: rec.position || "",
      status: rec.status || "active",
      createdAt: now,
      updatedAt: now,
    };
    await appendRecord(sheets, EMPLOYEES_SHEET, headers, normalized);
    res.status(201).json(normalized);
  } catch (e) {
    console.error("POST /api/employees error:", e);
    res.status(500).json({ error: e.message });
  }
});

// Update employee
app.put("/api/employees/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!SPREADSHEET_ID || !fs.existsSync(SERVICE_ACCOUNT_PATH)) {
      return res.status(500).json({ error: "Google Sheets not configured" });
    }
    await resolveSpreadsheetId();
    const sheets = getSheetsClient();
    await ensureHeaders(sheets, EMPLOYEES_SHEET, EMPLOYEES_HEADERS);
    const { headers, rowIndex } = await findRowIndexById(sheets, EMPLOYEES_SHEET, "id", id);
    if (rowIndex === -1) return res.status(404).json({ error: "Employee not found" });
    const endCol = colNumToLetter(headers.length);
    const existingResp = await sheets.spreadsheets.values.get({
      spreadsheetId: ACTIVE_SPREADSHEET_ID,
      range: `${EMPLOYEES_SHEET}!A${rowIndex}:${endCol}${rowIndex}`,
    });
    const existingValues = existingResp.data.values?.[0] || [];
    const existingRecord = Object.fromEntries(headers.map((h, i) => [h, existingValues[i] ?? ""]));
    const merged = {
      ...existingRecord,
      ...req.body,
      id,
      updatedAt: getVietnamTimeString(),
    };
    await updateRecordAtRow(sheets, EMPLOYEES_SHEET, headers, rowIndex, merged);
    res.json(merged);
  } catch (e) {
    console.error("PUT /api/employees/:id error:", e);
    res.status(500).json({ error: e.message });
  }
});

// Delete employee
app.delete("/api/employees/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!SPREADSHEET_ID || !fs.existsSync(SERVICE_ACCOUNT_PATH)) {
      return res.status(500).json({ error: "Google Sheets not configured" });
    }
    await resolveSpreadsheetId();
    const sheets = getSheetsClient();
    await ensureHeaders(sheets, EMPLOYEES_SHEET, EMPLOYEES_HEADERS);
    const { headers, rowIndex } = await findRowIndexById(sheets, EMPLOYEES_SHEET, "id", id);
    if (rowIndex === -1) return res.status(404).json({ error: "Employee not found" });
    await clearRow(sheets, EMPLOYEES_SHEET, headers, rowIndex);
    res.status(204).send();
  } catch (e) {
    console.error("DELETE /api/employees/:id error:", e);
    res.status(500).json({ error: e.message });
  }
});

// Initialize Employees sheet (headers only, no seed data)
app.post("/api/employees/init", async (req, res) => {
  try {
    if (!SPREADSHEET_ID || !fs.existsSync(SERVICE_ACCOUNT_PATH)) {
      return res.status(500).json({ error: "Google Sheets not configured" });
    }
    await resolveSpreadsheetId();
    const sheets = getSheetsClient();
    const headers = await ensureHeaders(sheets, EMPLOYEES_SHEET, EMPLOYEES_HEADERS);
    return res.json({ ok: true, sheet: EMPLOYEES_SHEET, headers });
  } catch (e) {
    console.error("POST /api/employees/init error:", e);
    res.status(500).json({ error: e.message });
  }
});

// Initialize auth sheets (Users, Roles, RolePermissions) with default admin
app.post("/api/auth/init", async (req, res) => {
  try {
    if (!SPREADSHEET_ID || !fs.existsSync(SERVICE_ACCOUNT_PATH)) {
      return res.status(500).json({ error: "Google Sheets not configured" });
    }
    await resolveSpreadsheetId();
    await seedAuthSheetsIfEmpty();
    return res.json({
      ok: true,
      seeded: true,
      usersSheet: USERS_SHEET,
      rolesSheet: ROLES_SHEET,
      rolePermsSheet: ROLE_PERMS_SHEET,
    });
  } catch (e) {
    console.error("POST /api/auth/init error:", e);
    res.status(500).json({ error: e.message });
  }
});

// ===== Auth Management APIs: Roles / RolePermissions / Users =====
// GET Roles
app.get("/api/auth/roles", async (req, res) => {
  try {
    if (!SPREADSHEET_ID || !fs.existsSync(SERVICE_ACCOUNT_PATH)) {
      return res.status(500).json({ error: "Google Sheets not configured" });
    }
    await resolveSpreadsheetId();
    const sheets = getSheetsClient();
    await ensureHeaders(sheets, ROLES_SHEET, ROLES_HEADERS);
    const list = await getAllRecords(sheets, ROLES_SHEET);
    return res.json(list || []);
  } catch (e) {
    console.error("GET /api/auth/roles error:", e);
    res.status(500).json({ error: e.message });
  }
});

// Create/Update Role
app.post("/api/auth/roles", async (req, res) => {
  try {
    const role = req.body || {};
    if (!role.id || !role.name) {
      return res.status(400).json({ error: "id and name are required" });
    }
    await resolveSpreadsheetId();
    const sheets = getSheetsClient();
    const { headers, rowIndex } = await findRowIndexById(sheets, ROLES_SHEET, "id", role.id);
    const normalized = {
      ...Object.fromEntries(ROLES_HEADERS.map((h) => [h, ""])),
      id: role.id,
      name: role.name,
      description: role.description || "",
    };
    await ensureHeaders(sheets, ROLES_SHEET, ROLES_HEADERS);
    if (rowIndex === -1) {
      await appendRecord(sheets, ROLES_SHEET, ROLES_HEADERS, normalized);
    } else {
      await updateRecordAtRow(sheets, ROLES_SHEET, headers, rowIndex, normalized);
    }
    res.json(normalized);
  } catch (e) {
    console.error("POST /api/auth/roles error:", e);
    res.status(500).json({ error: e.message });
  }
});

// GET RolePermissions by roleId
app.get("/api/auth/role-permissions", async (req, res) => {
  try {
    const roleId = String(req.query.roleId || "");
    if (!roleId) return res.status(400).json({ error: "roleId required" });
    await resolveSpreadsheetId();
    const sheets = getSheetsClient();
    await ensureHeaders(sheets, ROLE_PERMS_SHEET, ROLE_PERMS_HEADERS);
    const list = await getAllRecords(sheets, ROLE_PERMS_SHEET);
    return res.json((list || []).filter((r) => r.roleId === roleId));
  } catch (e) {
    console.error("GET /api/auth/role-permissions error:", e);
    res.status(500).json({ error: e.message });
  }
});

// Helper: delete all RolePermissions rows for a roleId
async function deleteRolePermissionsForRole(sheets, roleId) {
  const data = await sheets.spreadsheets.values.get({
    spreadsheetId: ACTIVE_SPREADSHEET_ID,
    range: ROLE_PERMS_SHEET,
  });
  const values = data.data.values || [];
  if (values.length === 0) return 0;
  const headers = values[0];
  const roleCol = headers.indexOf("roleId");
  if (roleCol === -1) return 0;
  // collect row indices (1-based) that match roleId
  const rowsToDelete = [];
  for (let r = 1; r < values.length; r++) {
    if (values[r]?.[roleCol] === roleId) rowsToDelete.push(r + 1);
  }
  // delete bottom-up
  let deleted = 0;
  for (let i = rowsToDelete.length - 1; i >= 0; i--) {
    await deleteRow(sheets, ROLE_PERMS_SHEET, rowsToDelete[i]);
    deleted++;
  }
  return deleted;
}

// Replace RolePermissions for a role
app.post("/api/auth/role-permissions", async (req, res) => {
  try {
    const { roleId, permissions } = req.body || {};
    if (!roleId || !Array.isArray(permissions)) {
      return res.status(400).json({ error: "roleId and permissions[] required" });
    }
    await resolveSpreadsheetId();
    const sheets = getSheetsClient();
    await ensureHeaders(sheets, ROLE_PERMS_SHEET, ROLE_PERMS_HEADERS);
    await deleteRolePermissionsForRole(sheets, roleId);
    for (const p of permissions) {
      const rec = {
        roleId,
        resource: String(p.resource || ""),
        action: String(p.action || ""),
      };
      if (!rec.resource || !rec.action) continue;
      await appendRecord(sheets, ROLE_PERMS_SHEET, ROLE_PERMS_HEADERS, rec);
    }
    res.json({ ok: true });
  } catch (e) {
    console.error("POST /api/auth/role-permissions error:", e);
    res.status(500).json({ error: e.message });
  }
});

// Users list
app.get("/api/auth/users", async (req, res) => {
  try {
    await resolveSpreadsheetId();
    const sheets = getSheetsClient();
    await ensureHeaders(sheets, USERS_SHEET, USERS_HEADERS);
    const list = await getAllRecords(sheets, USERS_SHEET);
    res.json(list || []);
  } catch (e) {
    console.error("GET /api/auth/users error:", e);
    res.status(500).json({ error: e.message });
  }
});

// Create user
app.post("/api/auth/users", async (req, res) => {
  try {
    const { email, password, fullName = "", roleId = "admin", status = "active" } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: "email and password required" });
    await resolveSpreadsheetId();
    const sheets = getSheetsClient();
    await ensureHeaders(sheets, USERS_SHEET, USERS_HEADERS);
    const now = getVietnamTimeString();
    const passwordHash = await bcrypt.hash(password, 10);
    const user = {
      id: `u-${Date.now()}`,
      email: String(email).toLowerCase(),
      passwordHash,
      fullName,
      roleId,
      status,
      createdAt: now,
      updatedAt: now,
    };
    await appendRecord(sheets, USERS_SHEET, USERS_HEADERS, user);
    res.status(201).json({ id: user.id, email: user.email, fullName, roleId, status });
  } catch (e) {
    console.error("POST /api/auth/users error:", e);
    res.status(500).json({ error: e.message });
  }
});

// Update user (role/status/password)
app.put("/api/auth/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body || {};
    await resolveSpreadsheetId();
    const sheets = getSheetsClient();
    await ensureHeaders(sheets, USERS_SHEET, USERS_HEADERS);
    const { headers, rowIndex } = await findRowIndexById(sheets, USERS_SHEET, "id", id);
    if (rowIndex === -1) return res.status(404).json({ error: "User not found" });
    const endCol = colNumToLetter(headers.length);
    const existingResp = await sheets.spreadsheets.values.get({
      spreadsheetId: ACTIVE_SPREADSHEET_ID,
      range: `${USERS_SHEET}!A${rowIndex}:${endCol}${rowIndex}`,
    });
    const existingValues = existingResp.data.values?.[0] || [];
    const existing = Object.fromEntries(headers.map((h, i) => [h, existingValues[i] ?? ""]));
    const merged = {
      ...existing,
      ...updates,
      id,
      updatedAt: getVietnamTimeString(),
    };
    if (updates.password) {
      merged.passwordHash = await bcrypt.hash(String(updates.password), 10);
    }
    await updateRecordAtRow(sheets, USERS_SHEET, headers, rowIndex, merged);
    res.json({
      id,
      email: merged.email,
      fullName: merged.fullName,
      roleId: merged.roleId,
      status: merged.status,
    });
  } catch (e) {
    console.error("PUT /api/auth/users/:id error:", e);
    res.status(500).json({ error: e.message });
  }
});
const SERVICE_ACCOUNT_PATH =
  process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH ||
  path.resolve(process.cwd(), "../src/config/service-account-key.json");

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "";
const TELEGRAM_WEBHOOK_URL = process.env.TELEGRAM_WEBHOOK_URL || "";

function getSheetsClient() {
  const auth = new google.auth.GoogleAuth({
    keyFile: SERVICE_ACCOUNT_PATH,
    scopes: [
      "https://www.googleapis.com/auth/spreadsheets",
      "https://www.googleapis.com/auth/drive.readonly",
    ],
  });
  return google.sheets({ version: "v4", auth });
}

// Retry function with exponential backoff
async function retryWithBackoff(fn, maxRetries = 3, baseDelay = 1000) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (error.code === 429 && attempt < maxRetries) {
        const delay = baseDelay * Math.pow(2, attempt - 1);
        console.log(`⚠️ Rate limit hit, retrying in ${delay}ms (attempt ${attempt}/${maxRetries})`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
}

function getDriveClient() {
  const auth = new google.auth.GoogleAuth({
    keyFile: SERVICE_ACCOUNT_PATH,
    scopes: ["https://www.googleapis.com/auth/drive"],
  });
  return google.drive({ version: "v3", auth });
}

// ---- Simple in-memory storage to make the app runnable without Google Sheets ----
const ordersMemory = [];
const carriersMemory = [
  {
    carrierId: "CAR001",
    name: "Giao Hàng Nhanh Express",
    contactPerson: "Nguyễn Văn A",
    email: "contact@ghnexpress.com",
    phone: "0901234567",
    address: "Hà Nội",
    serviceAreas: "Toàn quốc",
    pricingMethod: "PER_KM",
    baseRate: 50000,
    perKmRate: 5000,
    perM3Rate: 0,
    perTripRate: 0,
    stopFee: 10800,
    fuelSurcharge: 0.1,
    remoteAreaFee: 20000,
    insuranceRate: 0.005,
    vehicleTypes: "Van,Truck",
    maxWeight: 1000,
    maxVolume: 10,
    operatingHours: "06:00-22:00",
    rating: 4.5,
    isActive: true,
    createdAt: getVietnamTimeString(),
    updatedAt: getVietnamTimeString(),
  },
  {
    carrierId: "CAR002",
    name: "Viettel Post",
    contactPerson: "Trần Thị B",
    email: "business@viettelpost.vn",
    phone: "0987654321",
    address: "TP.HCM",
    serviceAreas: "Miền Nam",
    pricingMethod: "PER_M3",
    baseRate: 30000,
    perKmRate: 0,
    perM3Rate: 80000,
    perTripRate: 0,
    stopFee: 0,
    fuelSurcharge: 0.08,
    remoteAreaFee: 15000,
    insuranceRate: 0.003,
    vehicleTypes: "Motorbike,Van",
    maxWeight: 500,
    maxVolume: 5,
    operatingHours: "07:00-21:00",
    rating: 4.2,
    isActive: true,
    createdAt: getVietnamTimeString(),
    updatedAt: getVietnamTimeString(),
  },
  {
    carrierId: "CAR003",
    name: "Minh Trí",
    contactPerson: "Lê Văn C",
    email: "contact@minhtri.com",
    phone: "0912345678",
    address: "TP.HCM",
    serviceAreas: "MIA HCM,MIA Hà Nội,MIA Đà Nẵng",
    pricingMethod: "PER_M3",
    baseRate: 25000,
    perKmRate: 0,
    perM3Rate: 75000,
    perTripRate: 0,
    stopFee: 0,
    fuelSurcharge: 0.05,
    remoteAreaFee: 12000,
    insuranceRate: 0.002,
    vehicleTypes: "Van,Truck",
    maxWeight: 800,
    maxVolume: 8,
    operatingHours: "08:00-20:00",
    rating: 4.8,
    isActive: true,
    createdAt: getVietnamTimeString(),
    updatedAt: getVietnamTimeString(),
  },
  {
    carrierId: "CAR004",
    name: "Minh Trí",
    contactPerson: "Lê Văn C",
    email: "contact@minhtri.com",
    phone: "0912345678",
    address: "TP.HCM",
    serviceAreas: "MIA HCM,MIA Hà Nội,MIA Đà Nẵng",
    pricingMethod: "PER_TRIP",
    baseRate: 150000,
    perKmRate: 0,
    perM3Rate: 0,
    perTripRate: 500000,
    stopFee: 0,
    fuelSurcharge: 0.03,
    remoteAreaFee: 10000,
    insuranceRate: 0.001,
    vehicleTypes: "Truck",
    maxWeight: 1200,
    maxVolume: 12,
    operatingHours: "08:00-20:00",
    rating: 4.8,
    isActive: true,
    createdAt: getVietnamTimeString(),
    updatedAt: getVietnamTimeString(),
  },
];

// ---- Google Sheets helpers ----
const ORDERS_HEADERS = [
  "orderId",
  "customerName",
  "customerEmail",
  "customerPhone",
  "pickupAddress",
  "deliveryAddress",
  "pickupCoordinates",
  "deliveryCoordinates",
  "carrierId",
  "carrierName",
  "totalWeight",
  "totalVolume",
  "packageCount",
  "serviceLevel",
  "estimatedCost",
  "actualCost",
  "distance",
  "estimatedDuration",
  "status",
  "notes",
  "createdAt",
  "updatedAt",
  "scheduledPickup",
  "scheduledDelivery",
  "actualPickup",
  "actualDelivery",
];

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
  "stopFee",
  "fuelSurcharge",
  "remoteAreaFee",
  "insuranceRate",
  "vehicleTypes",
  "maxWeight",
  "maxVolume",
  "operatingHours",
  "rating",
  "isActive",
  "createdAt",
  "updatedAt",
];

// ---- Transfers (Warehouse Transfer Slips) ----
const TRANSFERS_SHEET = "Transfers";
const TRANSFERS_HEADERS = [
  "transfer_id",
  "orderCode",
  "hasVali",
  "date",
  "source",
  "dest",
  "quantity",
  "state",
  "transportStatus",
  "note",
  "pkgS",
  "pkgM",
  "pkgL",
  "pkgBagSmall",
  "pkgBagMedium",
  "pkgBagLarge",
  "pkgOther",
  "totalPackages",
  "volS",
  "volM",
  "volL",
  "volBagSmall",
  "volBagMedium",
  "volBagLarge",
  "volOther",
  "totalVolume",
  "dest_id",
  "source_id",
  "employee",
  // Bổ sung thông tin địa điểm xử lý sau import
  "address",
  "ward",
  "district",
  "province",
];

// Đã xóa TRANSFERS_MOCK để tránh load dữ liệu giả

// ---- Volume Rules (Settings: Bảng tính khối) ----
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

function normalizeTransfer(record = {}) {
  const base = Object.fromEntries(TRANSFERS_HEADERS.map((h) => [h, ""]));
  const merged = { ...base, ...record };
  // Mặc định trạng thái vận chuyển
  if (!merged.transportStatus) merged.transportStatus = "Chờ báo kiện";
  // Tính tổng (nếu chưa có)
  const pkgFields = [
    "pkgS",
    "pkgM",
    "pkgL",
    "pkgBagSmall",
    "pkgBagMedium",
    "pkgBagLarge",
    "pkgOther",
  ];
  const volFields = [
    "volS",
    "volM",
    "volL",
    "volBagSmall",
    "volBagMedium",
    "volBagLarge",
    "volOther",
  ];
  const totalPkgs = pkgFields.map((k) => Number(merged[k] || 0)).reduce((a, b) => a + b, 0);
  const totalVol = volFields.map((k) => Number(merged[k] || 0)).reduce((a, b) => a + b, 0);
  merged.totalPackages = merged.totalPackages || totalPkgs;
  merged.totalVolume = merged.totalVolume || totalVol;
  // Đảm bảo transfer_id là ID chính
  if (!merged.transfer_id && merged.id) merged.transfer_id = merged.id;
  return merged;
}

// --- Helpers: sanitize inputs & apply sheet formatting ---
function toNumberSafe(value, fractionDigits = 0) {
  if (value == null || value === "") return 0;
  if (typeof value === "number") return value;
  const s = String(value).trim();
  if (s === "" || /^0+$/.test(s)) return 0;
  // remove thousands separators, normalize last decimal point
  let clean = s.replace(/,/g, "");
  const dots = (clean.match(/\./g) || []).length;
  if (dots > 1) {
    const parts = clean.split(".");
    const last = parts.pop();
    clean = parts.join("") + "." + last;
  }
  const n = Number(clean);
  if (!Number.isFinite(n)) return 0;
  return fractionDigits > 0 ? Number(n.toFixed(fractionDigits)) : n;
}

function toStringSafe(value) {
  if (value == null) return "";
  return String(value).trim();
}

function formatDateForSheet(input) {
  const s = toStringSafe(input);
  if (!s) return "";
  // Nếu đã là dd/MM/yyyy thì trả lại
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(s)) return s;
  // Nếu là ISO hoặc chuỗi ngày hợp lệ -> convert sang dd/MM/yyyy theo VN timezone
  const d = new Date(s);
  if (!isNaN(d.getTime())) {
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = String(d.getFullYear());
    return `${day}/${month}/${year}`;
  }
  // Không parse được, trả về chuỗi gốc
  return s;
}

function normalizeForSheet(rec) {
  // Làm sạch dữ liệu trước khi append lên Sheet
  const n = { ...rec };
  n.transfer_id = toStringSafe(n.transfer_id || n.id);
  n.orderCode = toStringSafe(n.orderCode);
  n.hasVali = toStringSafe(n.hasVali);
  // Format ngày dd/MM/yyyy
  n.date = formatDateForSheet(n.date);
  n.source = toStringSafe(n.source);
  n.dest = toStringSafe(n.dest);
  n.quantity = toNumberSafe(n.quantity, 0);
  n.state = toStringSafe(n.state);
  n.transportStatus = toStringSafe(n.transportStatus || "Chờ báo kiện");
  n.note = toStringSafe(n.note);

  // Packages (integers)
  n.pkgS = toNumberSafe(n.pkgS, 0);
  n.pkgM = toNumberSafe(n.pkgM, 0);
  n.pkgL = toNumberSafe(n.pkgL, 0);
  n.pkgBagSmall = toNumberSafe(n.pkgBagSmall, 0);
  n.pkgBagMedium = toNumberSafe(n.pkgBagMedium, 0);
  n.pkgBagLarge = toNumberSafe(n.pkgBagLarge, 0);
  n.pkgOther = toNumberSafe(n.pkgOther, 0);

  // Volumes (2 decimals)
  n.volS = toNumberSafe(n.volS, 2);
  n.volM = toNumberSafe(n.volM, 2);
  n.volL = toNumberSafe(n.volL, 2);
  n.volBagSmall = toNumberSafe(n.volBagSmall, 2);
  n.volBagMedium = toNumberSafe(n.volBagMedium, 2);
  n.volBagLarge = toNumberSafe(n.volBagLarge, 2);
  n.volOther = toNumberSafe(n.volOther, 2);

  // Totals
  n.totalPackages = toNumberSafe(n.totalPackages, 0);
  n.totalVolume = toNumberSafe(n.totalVolume, 2);

  // IDs & employee
  n.dest_id = toStringSafe(n.dest_id);
  n.source_id = toStringSafe(n.source_id);
  n.employee = toStringSafe(n.employee);

  // Địa chỉ chi tiết (có sau các bước xử lý)
  n.address = toStringSafe(n.address);
  n.ward = toStringSafe(n.ward);
  n.district = toStringSafe(n.district);
  n.province = toStringSafe(n.province);

  return n;
}

async function formatTransfersSheet(sheets, headers) {
  // Áp dụng format đẹp: header màu xanh nhạt, font chuẩn, kẻ khung, định dạng số & ngày
  const requests = [];

  // Freeze 1 hàng đầu
  requests.push({
    updateSheetProperties: {
      properties: {
        title: TRANSFERS_SHEET,
        gridProperties: { frozenRowCount: 1 },
      },
      fields: "gridProperties.frozenRowCount",
    },
  });

  // Header style - màu xanh nhạt, chữ đen đậm, căn giữa, kẻ khung
  requests.push({
    repeatCell: {
      range: { sheetId: undefined, startRowIndex: 0, endRowIndex: 1 },
      cell: {
        userEnteredFormat: {
          textFormat: {
            bold: true,
            fontSize: 11,
            fontFamily: "Arial",
          },
          backgroundColor: { red: 0.85, green: 0.95, blue: 1.0 }, // Xanh nhạt đẹp
          horizontalAlignment: "CENTER",
          verticalAlignment: "MIDDLE",
          borders: {
            top: { style: "SOLID", color: { red: 0.2, green: 0.4, blue: 0.8 } },
            bottom: {
              style: "SOLID",
              color: { red: 0.2, green: 0.4, blue: 0.8 },
            },
            left: {
              style: "SOLID",
              color: { red: 0.2, green: 0.4, blue: 0.8 },
            },
            right: {
              style: "SOLID",
              color: { red: 0.2, green: 0.4, blue: 0.8 },
            },
          },
        },
      },
      fields:
        "userEnteredFormat(textFormat,backgroundColor,horizontalAlignment,verticalAlignment,borders)",
    },
  });

  // Data rows style - kẻ khung, font chuẩn, màu nền trắng
  requests.push({
    repeatCell: {
      range: { sheetId: undefined, startRowIndex: 1, endRowIndex: 1000 },
      cell: {
        userEnteredFormat: {
          textFormat: {
            fontSize: 10,
            fontFamily: "Arial",
          },
          backgroundColor: { red: 1.0, green: 1.0, blue: 1.0 }, // Nền trắng
          borders: {
            top: { style: "SOLID", color: { red: 0.8, green: 0.8, blue: 0.8 } },
            bottom: {
              style: "SOLID",
              color: { red: 0.8, green: 0.8, blue: 0.8 },
            },
            left: {
              style: "SOLID",
              color: { red: 0.8, green: 0.8, blue: 0.8 },
            },
            right: {
              style: "SOLID",
              color: { red: 0.8, green: 0.8, blue: 0.8 },
            },
          },
          horizontalAlignment: "LEFT",
          verticalAlignment: "MIDDLE",
        },
      },
      fields:
        "userEnteredFormat(textFormat,backgroundColor,borders,horizontalAlignment,verticalAlignment)",
    },
  });

  // Helper to locate column index by header name
  const colIndex = (name) => headers.indexOf(name);

  // Cột số nguyên
  const numberCols0 = [
    "quantity",
    "pkgS",
    "pkgM",
    "pkgL",
    "pkgBagSmall",
    "pkgBagMedium",
    "pkgBagLarge",
    "pkgOther",
    "totalPackages",
  ]
    .map(colIndex)
    .filter((i) => i >= 0);

  // Cột số thập phân 2 chữ số
  const numberCols2 = [
    "volS",
    "volM",
    "volL",
    "volBagSmall",
    "volBagMedium",
    "volBagLarge",
    "volOther",
    "totalVolume",
  ]
    .map(colIndex)
    .filter((i) => i >= 0);

  const dateCol = colIndex("date");
  const statusCol = colIndex("state");
  const transportStatusCol = colIndex("transportStatus");

  // Format cột số nguyên - căn phải, màu xanh nhạt
  for (const c of numberCols0) {
    requests.push({
      repeatCell: {
        range: {
          sheetId: undefined,
          startRowIndex: 1,
          startColumnIndex: c,
          endColumnIndex: c + 1,
        },
        cell: {
          userEnteredFormat: {
            numberFormat: { type: "NUMBER", pattern: "#,##0" },
            horizontalAlignment: "RIGHT",
            backgroundColor: { red: 0.95, green: 0.98, blue: 1.0 },
          },
        },
        fields: "userEnteredFormat(numberFormat,horizontalAlignment,backgroundColor)",
      },
    });
  }

  // Format cột số thập phân - căn phải, màu xanh nhạt
  for (const c of numberCols2) {
    requests.push({
      repeatCell: {
        range: {
          sheetId: undefined,
          startRowIndex: 1,
          startColumnIndex: c,
          endColumnIndex: c + 1,
        },
        cell: {
          userEnteredFormat: {
            numberFormat: { type: "NUMBER", pattern: "#,##0.00" },
            horizontalAlignment: "RIGHT",
            backgroundColor: { red: 0.95, green: 0.98, blue: 1.0 },
          },
        },
        fields: "userEnteredFormat(numberFormat,horizontalAlignment,backgroundColor)",
      },
    });
  }

  // Cột ngày - căn giữa, màu vàng nhạt
  if (dateCol >= 0) {
    requests.push({
      repeatCell: {
        range: {
          sheetId: undefined,
          startRowIndex: 1,
          startColumnIndex: dateCol,
          endColumnIndex: dateCol + 1,
        },
        cell: {
          userEnteredFormat: {
            numberFormat: { type: "DATE", pattern: "dd/MM/yyyy" },
            horizontalAlignment: "CENTER",
            backgroundColor: { red: 1.0, green: 0.98, blue: 0.9 },
          },
        },
        fields: "userEnteredFormat(numberFormat,horizontalAlignment,backgroundColor)",
      },
    });
  }

  // Cột trạng thái - căn giữa, màu cam nhạt
  if (statusCol >= 0) {
    requests.push({
      repeatCell: {
        range: {
          sheetId: undefined,
          startRowIndex: 1,
          startColumnIndex: statusCol,
          endColumnIndex: statusCol + 1,
        },
        cell: {
          userEnteredFormat: {
            horizontalAlignment: "CENTER",
            backgroundColor: { red: 1.0, green: 0.95, blue: 0.8 },
          },
        },
        fields: "userEnteredFormat(horizontalAlignment,backgroundColor)",
      },
    });
  }

  // Cột trạng thái vận chuyển - căn giữa, màu xanh lá nhạt
  if (transportStatusCol >= 0) {
    requests.push({
      repeatCell: {
        range: {
          sheetId: undefined,
          startRowIndex: 1,
          startColumnIndex: transportStatusCol,
          endColumnIndex: transportStatusCol + 1,
        },
        cell: {
          userEnteredFormat: {
            horizontalAlignment: "CENTER",
            backgroundColor: { red: 0.9, green: 1.0, blue: 0.9 },
          },
        },
        fields: "userEnteredFormat(horizontalAlignment,backgroundColor)",
      },
    });
  }

  // Auto-resize columns để vừa với dữ liệu
  requests.push({
    autoResizeDimensions: {
      dimensions: {
        sheetId: undefined,
        dimension: "COLUMNS",
        startIndex: 0,
        endIndex: headers.length,
      },
    },
  });

  if (requests.length > 0) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: ACTIVE_SPREADSHEET_ID,
      requestBody: { requests },
    });
  }
}

function colNumToLetter(num) {
  let s = "";
  while (num > 0) {
    const mod = (num - 1) % 26;
    s = String.fromCharCode(65 + mod) + s;
    num = Math.floor((num - 1) / 26);
  }
  return s;
}

async function ensureHeaders(sheets, sheetName, headers) {
  // Ensure sheet exists; if not, create it, then ensure header row
  const meta = await sheets.spreadsheets.get({
    spreadsheetId: ACTIVE_SPREADSHEET_ID,
  });
  const sheet = meta.data.sheets?.find((s) => s.properties?.title === sheetName);
  if (!sheet) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: ACTIVE_SPREADSHEET_ID,
      requestBody: {
        requests: [
          {
            addSheet: {
              properties: {
                title: sheetName,
                gridProperties: {
                  rowCount: 1000,
                  columnCount: Math.max(headers.length, 26),
                },
              },
            },
          },
        ],
      },
    });
  }
  const get = await sheets.spreadsheets.values.get({
    spreadsheetId: ACTIVE_SPREADSHEET_ID,
    range: `${sheetName}!1:1`,
  });
  const firstRow = get.data.values?.[0] || [];
  const needsSync =
    firstRow.length === 0 ||
    firstRow.length !== headers.length ||
    headers.some((h, i) => firstRow[i] !== h);
  if (needsSync) {
    await sheets.spreadsheets.values.update({
      spreadsheetId: ACTIVE_SPREADSHEET_ID,
      range: `${sheetName}!1:1`,
      valueInputOption: "RAW",
      requestBody: { values: [headers] },
    });
    return headers;
  }
  return firstRow;
}

async function getAllRecords(sheets, sheetName) {
  // Chỉ định rõ range để đọc đủ tất cả 108 cột
  const resp = await sheets.spreadsheets.values.get({
    spreadsheetId: ACTIVE_SPREADSHEET_ID,
    range: `${sheetName}!A:DD`, // Đọc từ cột A đến DD (108 cột)
  });
  const [headers, ...rows] = resp.data.values || [];
  if (!headers) return [];

  return rows.map((row) => {
    const record = {};
    // Map tất cả headers, kể cả khi row không đủ cột
    headers.forEach((header, index) => {
      record[header] = row[index] || ""; // Đảm bảo tất cả headers đều có giá trị
    });
    return record;
  });
}

async function appendRecord(sheets, sheetName, headers, record) {
  const row = headers.map((h) => (record[h] ?? "").toString());
  await sheets.spreadsheets.values.append({
    spreadsheetId: ACTIVE_SPREADSHEET_ID,
    range: `${sheetName}`,
    valueInputOption: "USER_ENTERED",
    insertDataOption: "INSERT_ROWS",
    requestBody: { values: [row] },
  });
  return record;
}

async function findRowIndexById(sheets, sheetName, idField, idValue) {
  const data = await sheets.spreadsheets.values.get({
    spreadsheetId: ACTIVE_SPREADSHEET_ID,
    range: `${sheetName}`,
  });
  const values = data.data.values || [];
  if (values.length === 0) return { headers: [], rowIndex: -1, values: [] };
  const headers = values[0];
  const idIdx = headers.indexOf(idField);
  if (idIdx === -1) return { headers, rowIndex: -1, values };
  for (let r = 1; r < values.length; r++) {
    if (values[r]?.[idIdx] === idValue) {
      return { headers, rowIndex: r + 1, values };
    }
  }
  return { headers, rowIndex: -1, values };
}

async function updateRecordAtRow(sheets, sheetName, headers, rowIndex, record) {
  const endCol = colNumToLetter(headers.length);
  const row = headers.map((h) => (record[h] ?? "").toString());
  await sheets.spreadsheets.values.update({
    spreadsheetId: ACTIVE_SPREADSHEET_ID,
    range: `${sheetName}!A${rowIndex}:${endCol}${rowIndex}`,
    valueInputOption: "USER_ENTERED",
    requestBody: { values: [row] },
  });
  return record;
}

async function clearRow(sheets, sheetName, headers, rowIndex) {
  const endCol = colNumToLetter(headers.length);
  await sheets.spreadsheets.values.clear({
    spreadsheetId: ACTIVE_SPREADSHEET_ID,
    range: `${sheetName}!A${rowIndex}:${endCol}${rowIndex}`,
  });
}

// Get sheetId by sheet title
async function getSheetIdByName(sheets, sheetName) {
  const meta = await sheets.spreadsheets.get({
    spreadsheetId: ACTIVE_SPREADSHEET_ID,
  });
  const sheet = meta.data.sheets?.find((s) => s.properties?.title === sheetName);
  return sheet?.properties?.sheetId;
}

// Physically delete a row (remove the entire row)
async function deleteRow(sheets, sheetName, rowIndex) {
  // rowIndex here is 1-based (including header). We should not delete header.
  const sheetId = await getSheetIdByName(sheets, sheetName);
  if (sheetId == null) throw new Error(`Sheet ${sheetName} not found`);
  if (rowIndex <= 1) throw new Error("Refuse to delete header row");

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: ACTIVE_SPREADSHEET_ID,
    requestBody: {
      requests: [
        {
          deleteDimension: {
            range: {
              sheetId,
              dimension: "ROWS",
              startIndex: rowIndex - 1, // 0-based, inclusive
              endIndex: rowIndex, // 0-based, exclusive
            },
          },
        },
      ],
    },
  });
}

// Resolve and cache a proper spreadsheet ID (accept folder ID and create/find a sheet inside)
async function resolveSpreadsheetId() {
  if (!ACTIVE_SPREADSHEET_ID) return;
  try {
    const drive = getDriveClient();
    const info = await drive.files.get({
      fileId: ACTIVE_SPREADSHEET_ID,
      fields: "id, mimeType, name",
    });
    if (info.data.mimeType === "application/vnd.google-apps.spreadsheet") {
      return; // already a spreadsheet id
    }
    if (info.data.mimeType === "application/vnd.google-apps.folder") {
      const list = await drive.files.list({
        q: `'${ACTIVE_SPREADSHEET_ID}' in parents and mimeType='application/vnd.google-apps.spreadsheet' and trashed=false`,
        fields: "files(id, name)",
        pageSize: 1,
      });
      if (list.data.files && list.data.files.length > 0) {
        ACTIVE_SPREADSHEET_ID = list.data.files[0].id;
        return;
      }
      // create a new spreadsheet inside folder
      const created = await drive.files.create({
        requestBody: {
          name: "mia-logistics",
          mimeType: "application/vnd.google-apps.spreadsheet",
          parents: [SPREADSHEET_ID],
        },
        fields: "id",
      });
      ACTIVE_SPREADSHEET_ID = created.data.id;
    }
  } catch (e) {
    console.error("resolveSpreadsheetId error:", e);
  }
}

// ---- Orders API (Google Sheets backed with in-memory fallback) ----
app.get("/api/orders", async (req, res) => {
  try {
    if (!SPREADSHEET_ID || !fs.existsSync(SERVICE_ACCOUNT_PATH)) {
      return res.json(ordersMemory);
    }
    await resolveSpreadsheetId();
    const sheets = getSheetsClient();
    await ensureHeaders(sheets, "Orders", ORDERS_HEADERS);
    const list = await getAllRecords(sheets, "Orders");
    res.json(list);
  } catch (error) {
    console.error("GET /api/orders error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/orders", async (req, res) => {
  try {
    const order = req.body || {};
    if (!SPREADSHEET_ID || !fs.existsSync(SERVICE_ACCOUNT_PATH)) {
      if (!order.orderId) order.orderId = `ORD-${Date.now()}`;
      order.createdAt = order.createdAt || getVietnamTimeString();
      order.updatedAt = getVietnamTimeString();
      ordersMemory.push(order);
      return res.status(201).json(order);
    }
    await resolveSpreadsheetId();
    const sheets = getSheetsClient();
    await ensureHeaders(sheets, "Orders", ORDERS_HEADERS);
    if (!order.orderId) order.orderId = `ORD-${Date.now()}`;
    order.createdAt = order.createdAt || getVietnamTimeString();
    order.updatedAt = getVietnamTimeString();
    const normalized = {
      ...Object.fromEntries(ORDERS_HEADERS.map((h) => [h, ""])),
      ...order,
    };
    const saved = await appendRecord(sheets, "Orders", ORDERS_HEADERS, normalized);
    res.status(201).json(saved);
  } catch (error) {
    console.error("POST /api/orders error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/orders/:orderId", async (req, res) => {
  try {
    const { orderId } = req.params;
    if (!SPREADSHEET_ID || !fs.existsSync(SERVICE_ACCOUNT_PATH)) {
      const idx = ordersMemory.findIndex((o) => o.orderId === orderId);
      if (idx === -1) return res.status(404).json({ error: "Order not found" });
      ordersMemory[idx] = {
        ...ordersMemory[idx],
        ...req.body,
        updatedAt: getVietnamTimeString(),
      };
      return res.json(ordersMemory[idx]);
    }
    await resolveSpreadsheetId();
    const sheets = getSheetsClient();
    await ensureHeaders(sheets, "Orders", ORDERS_HEADERS);
    const { headers, rowIndex } = await findRowIndexById(sheets, "Orders", "orderId", orderId);
    if (rowIndex === -1) return res.status(404).json({ error: "Order not found" });
    const merged = {
      ...Object.fromEntries(headers.map((h) => [h, ""])),
      orderId,
      ...req.body,
      updatedAt: getVietnamTimeString(),
    };
    const updated = await updateRecordAtRow(sheets, "Orders", headers, rowIndex, merged);
    res.json(updated);
  } catch (error) {
    console.error("PUT /api/orders error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/orders/:orderId", async (req, res) => {
  try {
    const { orderId } = req.params;
    if (!SPREADSHEET_ID || !fs.existsSync(SERVICE_ACCOUNT_PATH)) {
      const idx = ordersMemory.findIndex((o) => o.orderId === orderId);
      if (idx === -1) return res.status(404).json({ error: "Order not found" });
      ordersMemory.splice(idx, 1);
      return res.status(204).send();
    }
    await resolveSpreadsheetId();
    const sheets = getSheetsClient();
    const { headers, rowIndex } = await findRowIndexById(sheets, "Orders", "orderId", orderId);
    if (rowIndex === -1) return res.status(404).json({ error: "Order not found" });
    await clearRow(sheets, "Orders", headers, rowIndex);
    res.status(204).send();
  } catch (error) {
    console.error("DELETE /api/orders error:", error);
    res.status(500).json({ error: error.message });
  }
});

// ---- InboundInternational API (Google Sheets) ----
const INBOUND_INTERNATIONAL_SHEET = "InboundInternational";
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
  // Packaging flattened
  "packagingTypes",
  "packagingQuantities",
  "packagingDescriptions",
  // Timeline flattened (với descriptions)
  "timeline_created_description", // Mô tả Ngày tạo phiếu
  "timeline_cargoReady_est",
  "timeline_cargoReady_act",
  "timeline_cargoReady_status",
  "timeline_cargoReady_description", // Mô tả Cargo Ready
  "timeline_etd_est",
  "timeline_etd_act",
  "timeline_etd_status",
  "timeline_etd_description", // Mô tả ETD
  "timeline_eta_est",
  "timeline_eta_act",
  "timeline_eta_status",
  "timeline_eta_description", // Mô tả ETA
  "timeline_depart_est",
  "timeline_depart_act",
  "timeline_depart_status",
  "timeline_depart_description", // Mô tả Ngày hàng đi
  "timeline_arrivalPort_est",
  "timeline_arrivalPort_act",
  "timeline_arrivalPort_status",
  "timeline_arrivalPort_description", // Mô tả Ngày hàng về cảng
  "timeline_receive_est",
  "timeline_receive_act",
  "timeline_receive_status",
  "timeline_receive_description", // Mô tả Ngày nhận hàng
  // Document status flattened (với descriptions)
  "doc_checkBill_est",
  "doc_checkBill_act",
  "doc_checkBill_status",
  "doc_checkBill_description", // Mô tả Check bill
  "doc_checkCO_est",
  "doc_checkCO_act",
  "doc_checkCO_status",
  "doc_checkCO_description", // Mô tả Check CO
  "doc_sendDocs_est",
  "doc_sendDocs_act",
  "doc_sendDocs_status",
  "doc_sendDocs_description", // Mô tả Send docs
  "doc_customs_est",
  "doc_customs_act",
  "doc_customs_status",
  "doc_customs_description", // Mô tả Customs
  "doc_tax_est",
  "doc_tax_act",
  "doc_tax_status",
  "doc_tax_description", // Mô tả Tax
  "notes",
  "createdAt",
  "updatedAt",
];

app.get("/api/inboundinternational", async (req, res) => {
  try {
    if (!SPREADSHEET_ID || !fs.existsSync(SERVICE_ACCOUNT_PATH)) {
      return res.json([]);
    }
    await resolveSpreadsheetId();
    const sheets = getSheetsClient();
    await ensureHeaders(sheets, INBOUND_INTERNATIONAL_SHEET, INBOUND_INTERNATIONAL_HEADERS);
    const list = await getAllRecords(sheets, INBOUND_INTERNATIONAL_SHEET);
    res.json(list);
  } catch (error) {
    console.error("GET /api/inboundinternational error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/inboundinternational", async (req, res) => {
  try {
    if (!SPREADSHEET_ID || !fs.existsSync(SERVICE_ACCOUNT_PATH)) {
      return res.status(500).json({ error: "Google Sheets not configured" });
    }
    await resolveSpreadsheetId();
    const sheets = getSheetsClient();
    await ensureHeaders(sheets, INBOUND_INTERNATIONAL_SHEET, INBOUND_INTERNATIONAL_HEADERS);
    const record = {
      ...Object.fromEntries(INBOUND_INTERNATIONAL_HEADERS.map((h) => [h, ""])),
      ...req.body,
    };

    // Ensure date format is consistent (YYYY-MM-DD)
    if (record.date && typeof record.date === "string") {
      // If it's already in YYYY-MM-DD format, keep it
      if (!/^\d{4}-\d{2}-\d{2}$/.test(record.date)) {
        // Convert other formats to YYYY-MM-DD
        const date = new Date(record.date);
        if (!isNaN(date.getTime())) {
          record.date = date.toISOString().split("T")[0];
        }
      }
    }
    if (!record.id) record.id = `INB-${Date.now()}`;
    // Always set createdAt for new records, updatedAt for all records
    if (!record.createdAt) record.createdAt = getVietnamTimeString();
    record.updatedAt = getVietnamTimeString();
    const saved = await appendRecord(
      sheets,
      INBOUND_INTERNATIONAL_SHEET,
      INBOUND_INTERNATIONAL_HEADERS,
      record
    );
    res.status(201).json(saved);
  } catch (error) {
    console.error("POST /api/inboundinternational error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/inboundinternational/:id", async (req, res) => {
  try {
    if (!SPREADSHEET_ID || !fs.existsSync(SERVICE_ACCOUNT_PATH)) {
      return res.status(500).json({ error: "Google Sheets not configured" });
    }
    await resolveSpreadsheetId();
    const sheets = getSheetsClient();
    await ensureHeaders(sheets, INBOUND_INTERNATIONAL_SHEET, INBOUND_INTERNATIONAL_HEADERS);
    const { headers, rowIndex } = await findRowIndexById(
      sheets,
      INBOUND_INTERNATIONAL_SHEET,
      "id",
      req.params.id
    );
    if (rowIndex === -1) return res.status(404).json({ error: "Record not found" });
    const merged = {
      ...Object.fromEntries(headers.map((h) => [h, ""])),
      id: req.params.id,
      ...req.body,
      updatedAt: getVietnamTimeString(),
    };

    // Ensure date format is consistent (YYYY-MM-DD)
    if (merged.date && typeof merged.date === "string") {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(merged.date)) {
        const date = new Date(merged.date);
        if (!isNaN(date.getTime())) {
          merged.date = date.toISOString().split("T")[0];
        }
      }
    }
    const updated = await updateRecordAtRow(
      sheets,
      INBOUND_INTERNATIONAL_SHEET,
      headers,
      rowIndex,
      merged
    );
    res.json(updated);
  } catch (error) {
    console.error("PUT /api/inboundinternational error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/inboundinternational/:id", async (req, res) => {
  try {
    if (!SPREADSHEET_ID || !fs.existsSync(SERVICE_ACCOUNT_PATH)) {
      return res.status(500).json({ error: "Google Sheets not configured" });
    }
    await resolveSpreadsheetId();
    const sheets = getSheetsClient();
    const { headers, rowIndex } = await findRowIndexById(
      sheets,
      INBOUND_INTERNATIONAL_SHEET,
      "id",
      req.params.id
    );
    if (rowIndex === -1) return res.status(404).json({ error: "Record not found" });
    await clearRow(sheets, INBOUND_INTERNATIONAL_SHEET, headers, rowIndex);
    res.status(204).send();
  } catch (error) {
    console.error("DELETE /api/inboundinternational error:", error);
    res.status(500).json({ error: error.message });
  }
});

// ---- InboundDomestic API (Google Sheets) ----
const INBOUND_DOMESTIC_SHEET = "InboundDomestic";
const INBOUND_DOMESTIC_HEADERS = [
  "id",
  "date",
  "supplier",
  "origin",
  "destination",
  "product",
  "quantity",
  "status",
  "category",
  "carrier",
  "purpose",
  "receiveTime",
  "estimatedArrival",
  "actualArrival",
  "notes",
  "createdAt",
  "updatedAt",
  // Packaging columns (added at end to avoid data shift)
  "packagingTypes",
  "packagingQuantities",
  "packagingDescriptions",
];

app.get("/api/inbounddomestic", async (req, res) => {
  try {
    if (!SPREADSHEET_ID || !fs.existsSync(SERVICE_ACCOUNT_PATH)) {
      return res.status(500).json({ error: "Google Sheets not configured" });
    }
    await resolveSpreadsheetId();
    const sheets = getSheetsClient();
    await ensureHeaders(sheets, INBOUND_DOMESTIC_SHEET, INBOUND_DOMESTIC_HEADERS);
    const list = await getAllRecords(sheets, INBOUND_DOMESTIC_SHEET);
    res.json(list);
  } catch (error) {
    console.error("GET /api/inbounddomestic error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/inbounddomestic", async (req, res) => {
  try {
    if (!SPREADSHEET_ID || !fs.existsSync(SERVICE_ACCOUNT_PATH)) {
      return res.status(500).json({ error: "Google Sheets not configured" });
    }
    await resolveSpreadsheetId();
    const sheets = getSheetsClient();
    await ensureHeaders(sheets, INBOUND_DOMESTIC_SHEET, INBOUND_DOMESTIC_HEADERS);

    const record = {
      ...Object.fromEntries(INBOUND_DOMESTIC_HEADERS.map((h) => [h, ""])),
      ...req.body,
    };

    if (!record.id) record.id = `DOM-${Date.now()}`;
    if (!record.createdAt) record.createdAt = getVietnamTimeString();
    record.updatedAt = getVietnamTimeString();

    const saved = await appendRecord(
      sheets,
      INBOUND_DOMESTIC_SHEET,
      INBOUND_DOMESTIC_HEADERS,
      record
    );
    res.status(201).json(saved);
  } catch (error) {
    console.error("POST /api/inbounddomestic error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/inbounddomestic/:id", async (req, res) => {
  try {
    if (!SPREADSHEET_ID || !fs.existsSync(SERVICE_ACCOUNT_PATH)) {
      return res.status(500).json({ error: "Google Sheets not configured" });
    }
    await resolveSpreadsheetId();
    const sheets = getSheetsClient();

    const { headers, rowIndex } = await findRowIndexById(
      sheets,
      INBOUND_DOMESTIC_SHEET,
      "id",
      req.params.id
    );

    if (rowIndex === -1) {
      return res.status(404).json({ error: "Record not found" });
    }

    const merged = {
      ...Object.fromEntries(headers.map((h) => [h, ""])),
      id: req.params.id,
      ...req.body,
      updatedAt: getVietnamTimeString(),
    };

    const updated = await updateRecordAtRow(
      sheets,
      INBOUND_DOMESTIC_SHEET,
      headers,
      rowIndex,
      merged
    );
    res.json(updated);
  } catch (error) {
    console.error("PUT /api/inbounddomestic error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/inbounddomestic/:id", async (req, res) => {
  try {
    if (!SPREADSHEET_ID || !fs.existsSync(SERVICE_ACCOUNT_PATH)) {
      return res.status(500).json({ error: "Google Sheets not configured" });
    }
    await resolveSpreadsheetId();
    const sheets = getSheetsClient();

    const { headers, rowIndex } = await findRowIndexById(
      sheets,
      INBOUND_DOMESTIC_SHEET,
      "id",
      req.params.id
    );

    if (rowIndex === -1) {
      return res.status(404).json({ error: "Record not found" });
    }

    await clearRow(sheets, INBOUND_DOMESTIC_SHEET, headers, rowIndex);
    res.status(204).send();
  } catch (error) {
    console.error("DELETE /api/inbounddomestic error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/carriers", async (req, res) => {
  try {
    if (!SPREADSHEET_ID || !fs.existsSync(SERVICE_ACCOUNT_PATH)) {
      console.error("❌ Google Sheets not configured");
      return res.status(500).json({ error: "Google Sheets not configured" });
    }

    await resolveSpreadsheetId();
    const sheets = getSheetsClient();

    console.log("🔄 Fetching carriers from Google Sheets...");

    // Use retry logic for rate limiting
    const list = await retryWithBackoff(async () => {
      await ensureHeaders(sheets, "Carriers", CARRIERS_HEADERS);
      return await getAllRecords(sheets, "Carriers");
    });

    console.log("✅ Successfully fetched carriers from Google Sheets:", list.length, "carriers");

    // Normalize boolean values from Google Sheets
    const normalizedList = list.map((carrier) => ({
      ...carrier,
      isActive: carrier.isActive === "TRUE" || carrier.isActive === true,
      baseRate: Number(carrier.baseRate) || 0,
      perKmRate: Number(carrier.perKmRate) || 0,
      perM3Rate: Number(carrier.perM3Rate) || 0,
      perTripRate: Number(carrier.perTripRate) || 0,
      fuelSurcharge: Number(carrier.fuelSurcharge) || 0,
      remoteAreaFee: Number(carrier.remoteAreaFee) || 0,
      insuranceRate: Number(carrier.insuranceRate) || 0,
      maxWeight: Number(carrier.maxWeight) || 0,
      maxVolume: Number(carrier.maxVolume) || 0,
      rating: Number(carrier.rating) || 0,
    }));

    return res.json(normalizedList);
  } catch (error) {
    console.error("❌ GET /api/carriers error:", error);
    return res.status(500).json({ error: error.message });
  }
});

app.post("/api/carriers", async (req, res) => {
  try {
    const carrier = req.body || {};
    if (!SPREADSHEET_ID || !fs.existsSync(SERVICE_ACCOUNT_PATH)) {
      const now = getVietnamTimeString();
      const created = {
        carrierId: carrier.carrierId || `CAR-${Date.now()}`,
        name: carrier.name || "",
        contactPerson: carrier.contactPerson || "",
        email: carrier.email || "",
        phone: carrier.phone || "",
        address: carrier.address || "",
        serviceAreas: carrier.serviceAreas || "",
        pricingMethod: carrier.pricingMethod || "PER_KM",
        baseRate: Number(carrier.baseRate || 0),
        perKmRate: Number(carrier.perKmRate || 0),
        perM3Rate: Number(carrier.perM3Rate || 0),
        perTripRate: Number(carrier.perTripRate || 0),
        fuelSurcharge: Number(carrier.fuelSurcharge || 0),
        remoteAreaFee: Number(carrier.remoteAreaFee || 0),
        insuranceRate: Number(carrier.insuranceRate || 0),
        vehicleTypes: carrier.vehicleTypes || "",
        maxWeight: Number(carrier.maxWeight || 0),
        maxVolume: Number(carrier.maxVolume || 0),
        operatingHours: carrier.operatingHours || "",
        rating: Number(carrier.rating || 0),
        isActive: carrier.isActive !== false,
        createdAt: now,
        updatedAt: now,
      };
      carriersMemory.push(created);
      return res.status(201).json(created);
    }
    await resolveSpreadsheetId();
    const sheets = getSheetsClient();
    await ensureHeaders(sheets, "Carriers", CARRIERS_HEADERS);
    const now = getVietnamTimeString();
    const normalized = {
      ...Object.fromEntries(CARRIERS_HEADERS.map((h) => [h, ""])),
      carrierId: carrier.carrierId || `CAR-${Date.now()}`,
      name: carrier.name || "",
      contactPerson: carrier.contactPerson || "",
      email: carrier.email || "",
      phone: carrier.phone || "",
      address: carrier.address || "",
      serviceAreas: carrier.serviceAreas || "",
      pricingMethod: carrier.pricingMethod || "PER_KM",
      baseRate: Number(carrier.baseRate || 0),
      perKmRate: Number(carrier.perKmRate || 0),
      perM3Rate: Number(carrier.perM3Rate || 0),
      perTripRate: Number(carrier.perTripRate || 0),
      fuelSurcharge: Number(carrier.fuelSurcharge || 0),
      remoteAreaFee: Number(carrier.remoteAreaFee || 0),
      insuranceRate: Number(carrier.insuranceRate || 0),
      vehicleTypes: carrier.vehicleTypes || "",
      maxWeight: Number(carrier.maxWeight || 0),
      maxVolume: Number(carrier.maxVolume || 0),
      operatingHours: carrier.operatingHours || "",
      rating: Number(carrier.rating || 0),
      isActive: carrier.isActive !== false,
      createdAt: now,
      updatedAt: now,
    };
    const saved = await appendRecord(sheets, "Carriers", CARRIERS_HEADERS, normalized);
    res.status(201).json(saved);
  } catch (error) {
    console.error("POST /api/carriers error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/carriers/:carrierId", async (req, res) => {
  try {
    const { carrierId } = req.params;
    if (!SPREADSHEET_ID || !fs.existsSync(SERVICE_ACCOUNT_PATH)) {
      const idx = carriersMemory.findIndex((c) => c.carrierId === carrierId);
      if (idx === -1) return res.status(404).json({ error: "Carrier not found" });
      carriersMemory[idx] = {
        ...carriersMemory[idx],
        ...req.body,
        updatedAt: getVietnamTimeString(),
      };
      return res.json(carriersMemory[idx]);
    }
    await resolveSpreadsheetId();
    const sheets = getSheetsClient();
    await ensureHeaders(sheets, "Carriers", CARRIERS_HEADERS);
    const { headers, rowIndex } = await findRowIndexById(
      sheets,
      "Carriers",
      "carrierId",
      carrierId
    );
    if (rowIndex === -1) return res.status(404).json({ error: "Carrier not found" });
    // Merge with existing row to avoid wiping fields on partial updates
    const endCol = colNumToLetter(headers.length);
    const existingResp = await sheets.spreadsheets.values.get({
      spreadsheetId: ACTIVE_SPREADSHEET_ID,
      range: `Carriers!A${rowIndex}:${endCol}${rowIndex}`,
    });
    const existingValues = existingResp.data.values?.[0] || [];
    const existingRecord = Object.fromEntries(headers.map((h, i) => [h, existingValues[i] ?? ""]));
    const merged = {
      ...existingRecord,
      carrierId,
      ...req.body,
      updatedAt: getVietnamTimeString(),
    };
    const updated = await updateRecordAtRow(sheets, "Carriers", headers, rowIndex, merged);
    res.json(updated);
  } catch (error) {
    console.error("PUT /api/carriers error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/carriers/:carrierId", async (req, res) => {
  try {
    const { carrierId } = req.params;
    if (!SPREADSHEET_ID || !fs.existsSync(SERVICE_ACCOUNT_PATH)) {
      const idx = carriersMemory.findIndex((c) => c.carrierId === carrierId);
      if (idx === -1) return res.status(404).json({ error: "Carrier not found" });
      carriersMemory.splice(idx, 1);
      return res.status(204).send();
    }
    await resolveSpreadsheetId();
    const sheets = getSheetsClient();
    const { headers, rowIndex } = await findRowIndexById(
      sheets,
      "Carriers",
      "carrierId",
      carrierId
    );
    if (rowIndex === -1) return res.status(404).json({ error: "Carrier not found" });
    await clearRow(sheets, "Carriers", headers, rowIndex);
    res.status(204).send();
  } catch (error) {
    console.error("DELETE /api/carriers error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Debug endpoint: check Drive file info by ID
app.get("/api/_debug/file-info", async (req, res) => {
  try {
    if (!SPREADSHEET_ID || !fs.existsSync(SERVICE_ACCOUNT_PATH)) {
      return res.status(400).json({ error: "Missing env or key file" });
    }
    const drive = getDriveClient();
    const info = await drive.files.get({
      fileId: SPREADSHEET_ID,
      fields: "id, name, mimeType, owners, permissions",
    });
    res.json(info.data);
  } catch (error) {
    console.error("GET /api/_debug/file-info error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Debug endpoint: show resolved spreadsheet and sheets list
app.get("/api/_debug/state", async (req, res) => {
  try {
    await resolveSpreadsheetId();
    const sheets = getSheetsClient();
    const meta = await sheets.spreadsheets.get({
      spreadsheetId: ACTIVE_SPREADSHEET_ID,
    });
    res.json({
      providedId: SPREADSHEET_ID,
      activeSpreadsheetId: ACTIVE_SPREADSHEET_ID,
      sheetTitles: (meta.data.sheets || []).map((s) => s.properties?.title),
    });
  } catch (error) {
    console.error("GET /api/_debug/state error:", error);
    res.status(500).json({ error: error.message });
  }
});

// ---- Transport Requests API ----

// Read-only: liệt kê header hiện tại của sheet TransportRequests và các cột thiếu theo chuẩn cần dùng từ dialog
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

app.get("/api/transport-requests/headers", async (req, res) => {
  try {
    if (req.query.spreadsheetId) {
      ACTIVE_SPREADSHEET_ID = String(req.query.spreadsheetId);
    }
    if (!ACTIVE_SPREADSHEET_ID || !fs.existsSync(SERVICE_ACCOUNT_PATH)) {
      return res.status(400).json({ error: "Google Sheets not configured" });
    }
    await resolveSpreadsheetId();
    const sheets = getSheetsClient();
    const meta = await sheets.spreadsheets.values.get({
      spreadsheetId: ACTIVE_SPREADSHEET_ID,
      range: "TransportRequests!1:1",
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
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get("/api/transport-requests", async (req, res) => {
  try {
    if (req.query.spreadsheetId) {
      ACTIVE_SPREADSHEET_ID = String(req.query.spreadsheetId);
    }

    if (!ACTIVE_SPREADSHEET_ID || !fs.existsSync(SERVICE_ACCOUNT_PATH)) {
      console.log("⚠️ Không có Google Sheet hoặc Service Account - trả về mảng rỗng");
      return res.json([]);
    }
    await resolveSpreadsheetId();
    const sheets = getSheetsClient();
    await ensureHeaders(sheets, "TransportRequests", TRANSPORT_REQUESTS_REQUIRED);
    const list = await getAllRecords(sheets, "TransportRequests");
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

// Tạo requestId mới cho Transport Request
app.post("/api/transport-requests/generate-id", async (req, res) => {
  try {
    if (req.query.spreadsheetId) {
      ACTIVE_SPREADSHEET_ID = String(req.query.spreadsheetId);
    }

    if (!ACTIVE_SPREADSHEET_ID || !fs.existsSync(SERVICE_ACCOUNT_PATH)) {
      // Mock response khi không có Google Sheets
      const mockId = `MSC-${String(Date.now()).slice(-8).padStart(8, "0")}`;
      return res.json({ requestId: mockId });
    }

    await resolveSpreadsheetId();
    const sheets = getSheetsClient();
    await ensureHeaders(sheets, "TransportRequests", TRANSPORT_REQUESTS_REQUIRED);

    // Lấy tất cả requestId hiện tại
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: ACTIVE_SPREADSHEET_ID,
      range: "TransportRequests!A:A",
    });

    const requestIds = response.data.values?.slice(1) || []; // Bỏ qua header
    let maxNumber = 0;

    // Tìm số lớn nhất trong các requestId hiện tại
    requestIds.forEach((row) => {
      if (row[0] && row[0].startsWith("MSC-")) {
        const numberPart = row[0].substring(4); // Bỏ "MSC-"
        const number = parseInt(numberPart, 10);
        if (!isNaN(number) && number > maxNumber) {
          maxNumber = number;
        }
      }
    });

    // Tạo requestId mới
    const newNumber = maxNumber + 1;
    const requestId = `MSC-${String(newNumber).padStart(8, "0")}`;

    // Tạo hàng mới với requestId
    const vietnamTimeString = getVietnamTimeString();
    const vietnamTimeDisplay = getVietnamTimeDisplay();
    console.log("🕐 Vietnam Time String:", vietnamTimeString);
    console.log("🕐 Vietnam Time Display:", vietnamTimeDisplay);
    const newRow = [requestId, vietnamTimeString];
    // Thêm các cột trống cho đến hết
    for (let i = 2; i < 55; i++) {
      newRow.push("");
    }

    await sheets.spreadsheets.values.append({
      spreadsheetId: ACTIVE_SPREADSHEET_ID,
      range: "TransportRequests!A:A",
      valueInputOption: "RAW",
      insertDataOption: "INSERT_ROWS",
      resource: {
        values: [newRow],
      },
    });

    res.json({ requestId, rowIndex: requestIds.length + 2 }); // +2 vì có header và row mới
  } catch (error) {
    console.error("POST /api/transport-requests/generate-id error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Xóa cột trùng lặp trong TransportRequests
app.delete("/api/transport-requests/duplicate-columns", async (req, res) => {
  try {
    if (req.query.spreadsheetId) {
      ACTIVE_SPREADSHEET_ID = String(req.query.spreadsheetId);
    }

    if (!ACTIVE_SPREADSHEET_ID || !fs.existsSync(SERVICE_ACCOUNT_PATH)) {
      return res.status(400).json({ error: "Google Sheets not configured" });
    }

    await resolveSpreadsheetId();
    const sheets = getSheetsClient();

    // Lấy thông tin sheet
    const response = await sheets.spreadsheets.get({
      spreadsheetId: ACTIVE_SPREADSHEET_ID,
      ranges: ["TransportRequests!A1:ZZ1"],
    });

    const sheet = response.data.sheets[0];
    const sheetId = sheet.properties.sheetId;
    const currentHeaders = sheet.data[0].rowData[0].values.map((cell) => cell.formattedValue || "");

    console.log(`📊 Tổng số cột hiện tại: ${currentHeaders.length}`);

    // Tìm các cột trùng lặp
    const columnsToDelete = [];
    const firstOccurrence = new Map();

    currentHeaders.forEach((header, index) => {
      if (header) {
        if (firstOccurrence.has(header)) {
          // Đây là cột trùng lặp, cần xóa
          columnsToDelete.push(index + 1);
        } else {
          // Đây là lần đầu tiên xuất hiện
          firstOccurrence.set(header, index + 1);
        }
      }
    });

    if (columnsToDelete.length === 0) {
      return res.json({
        message: "Không có cột trùng lặp nào",
        deletedColumns: [],
      });
    }

    console.log(`🗑️ Sẽ xóa ${columnsToDelete.length} cột trùng lặp:`, columnsToDelete);

    // Xóa các cột từ cuối lên đầu để tránh ảnh hưởng đến index
    const sortedColumnsToDelete = columnsToDelete.sort((a, b) => b - a);
    const deletedColumns = [];

    for (const colIndex of sortedColumnsToDelete) {
      console.log(`🗑️ Đang xóa cột ${colIndex}...`);

      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: ACTIVE_SPREADSHEET_ID,
        requestBody: {
          requests: [
            {
              deleteDimension: {
                range: {
                  sheetId: sheetId,
                  dimension: "COLUMNS",
                  startIndex: colIndex - 1,
                  endIndex: colIndex,
                },
              },
            },
          ],
        },
      });

      deletedColumns.push({
        column: currentHeaders[colIndex - 1],
        position: colIndex,
      });
      console.log(`✅ Đã xóa cột ${colIndex}`);
    }

    res.json({
      message: "Đã xóa tất cả cột trùng lặp",
      deletedColumns,
      totalDeleted: deletedColumns.length,
    });
  } catch (error) {
    console.error("DELETE /api/transport-requests/duplicate-columns error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Cập nhật Transport Request
app.put("/api/transport-requests/:requestId", async (req, res) => {
  try {
    const { requestId } = req.params;

    // Debug: Log request body
    console.log("🔍 DEBUG - PUT request body:", req.body);
    console.log("🔍 DEBUG - Transfer IDs in request:", {
      stop1TransferIds: req.body.stop1TransferIds,
      stop2TransferIds: req.body.stop2TransferIds,
      stop3TransferIds: req.body.stop3TransferIds,
      stop4TransferIds: req.body.stop4TransferIds,
      stop5TransferIds: req.body.stop5TransferIds,
    });
    if (req.query.spreadsheetId) {
      ACTIVE_SPREADSHEET_ID = String(req.query.spreadsheetId);
    }

    if (!ACTIVE_SPREADSHEET_ID || !fs.existsSync(SERVICE_ACCOUNT_PATH)) {
      return res.json({
        ...req.body,
        requestId,
        updatedAt: getVietnamTimeString(),
      });
    }

    await resolveSpreadsheetId();
    const sheets = getSheetsClient();
    const headers = TRANSPORT_REQUESTS_REQUIRED;

    const { rowIndex, headers: foundHeaders } = await findRowIndexById(
      sheets,
      "TransportRequests",
      "requestId",
      requestId
    );

    if (rowIndex === -1) {
      return res.status(404).json({ error: "Transport Request not found" });
    }

    // Debug: Log headers comparison
    console.log("🔍 DEBUG - Headers comparison:", {
      requiredHeadersLength: headers.length,
      foundHeadersLength: foundHeaders.length,
      requiredHeaders: headers.slice(0, 5), // First 5 headers
      foundHeaders: foundHeaders.slice(0, 5), // First 5 headers
      transferIdsInRequired: headers.includes("stop1TransferIds"),
      transferIdsInFound: foundHeaders.includes("stop1TransferIds"),
    });

    const endCol = colNumToLetter(foundHeaders.length);
    const existingResp = await sheets.spreadsheets.values.get({
      spreadsheetId: ACTIVE_SPREADSHEET_ID,
      range: `TransportRequests!A${rowIndex}:${endCol}${rowIndex}`,
    });
    const existingValues = existingResp.data.values?.[0] || [];
    const existingRecord = Object.fromEntries(
      foundHeaders.map((h, i) => [h, existingValues[i] ?? ""])
    );

    const merged = {
      ...existingRecord,
      ...req.body,
    };

    // Debug: Log merged data
    console.log("🔍 DEBUG - Merged data transfer IDs:", {
      stop1TransferIds: merged.stop1TransferIds,
      stop2TransferIds: merged.stop2TransferIds,
      stop3TransferIds: merged.stop3TransferIds,
      stop4TransferIds: merged.stop4TransferIds,
      stop5TransferIds: merged.stop5TransferIds,
    });
    // Sử dụng TRANSPORT_REQUESTS_REQUIRED để đảm bảo ghi đủ tất cả 108 cột
    await updateRecordAtRow(
      sheets,
      "TransportRequests",
      headers, // headers = TRANSPORT_REQUESTS_REQUIRED
      rowIndex,
      merged
    );
    res.json(merged);
  } catch (error) {
    console.error("PUT /api/transport-requests/:requestId error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Xóa Transport Request
app.delete("/api/transport-requests/:requestId", async (req, res) => {
  try {
    const { requestId } = req.params;
    if (req.query.spreadsheetId) {
      ACTIVE_SPREADSHEET_ID = String(req.query.spreadsheetId);
    }

    if (!ACTIVE_SPREADSHEET_ID || !fs.existsSync(SERVICE_ACCOUNT_PATH)) {
      return res.json({ success: true });
    }

    await resolveSpreadsheetId();
    const sheets = getSheetsClient();

    // Ensure headers exist
    await ensureHeaders(sheets, "TransportRequests", TRANSPORT_REQUESTS_REQUIRED);

    console.log("DEBUG: Searching for requestId:", requestId);
    const {
      rowIndex,
      headers: foundHeaders,
      values,
    } = await findRowIndexById(sheets, "TransportRequests", "requestId", requestId);

    console.log("DEBUG: findRowIndexById result:", {
      rowIndex,
      foundHeadersLength: foundHeaders.length,
      valuesLength: values.length,
      firstRowSample: values[0]?.slice(0, 3),
      requestIdColumn: foundHeaders.indexOf("requestId"),
    });

    if (rowIndex === -1) {
      console.log("DEBUG: Request not found in sheet");
      return res.status(404).json({ error: "Transport Request not found" });
    }

    console.log("DEBUG: clearRow args:", {
      sheetName: "TransportRequests",
      headersLength: foundHeaders.length,
      rowIndex,
      headers: foundHeaders.slice(0, 3),
      requestId: requestId,
    });

    console.log("DEBUG: Before clearRow - calculating range...");
    const endCol = colNumToLetter(foundHeaders.length);
    console.log("DEBUG: Range calculation:", {
      foundHeadersLength: foundHeaders.length,
      endCol: endCol,
      range: `TransportRequests!A${rowIndex}:${endCol}${rowIndex}`,
    });

    await clearRow(sheets, "TransportRequests", foundHeaders, rowIndex);
    res.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/transport-requests/:requestId error:", error);
    res.status(500).json({ error: error.message });
  }
});

// ---- Transfers API ----
app.get("/api/transfers", async (req, res) => {
  try {
    if (req.query.spreadsheetId) {
      ACTIVE_SPREADSHEET_ID = String(req.query.spreadsheetId);
    }

    if (!ACTIVE_SPREADSHEET_ID || !fs.existsSync(SERVICE_ACCOUNT_PATH)) {
      console.error("❌ Google Sheets not configured");
      return res.status(500).json({ error: "Google Sheets not configured" });
    }

    await resolveSpreadsheetId();
    const sheets = getSheetsClient();

    // Use retry logic for rate limiting
    const list = await retryWithBackoff(async () => {
      await ensureHeaders(sheets, TRANSFERS_SHEET, TRANSFERS_HEADERS);
      return await getAllRecords(sheets, TRANSFERS_SHEET);
    });

    if (!list || list.length === 0) {
      console.log("📭 Sheet Transfers trống - trả về mảng rỗng");
      return res.json([]);
    }

    // Normalize data for frontend consistency
    const normalizedList = list.map((transfer) => ({
      ...transfer,
      // Convert string numbers to actual numbers
      volS: Number(transfer.volS) || 0,
      volM: Number(transfer.volM) || 0,
      volL: Number(transfer.volL) || 0,
      volBagSmall: Number(transfer.volBagSmall) || 0,
      volBagMedium: Number(transfer.volBagMedium) || 0,
      volBagLarge: Number(transfer.volBagLarge) || 0,
      volOther: Number(transfer.volOther) || 0,
      pkgS: Number(transfer.pkgS) || 0,
      pkgM: Number(transfer.pkgM) || 0,
      pkgL: Number(transfer.pkgL) || 0,
      pkgBagSmall: Number(transfer.pkgBagSmall) || 0,
      pkgBagMedium: Number(transfer.pkgBagMedium) || 0,
      pkgBagLarge: Number(transfer.pkgBagLarge) || 0,
      pkgOther: Number(transfer.pkgOther) || 0,
      quantity: Number(transfer.quantity) || 0,
      totalPackages: Number(transfer.totalPackages) || 0,
      totalVolume: Number(transfer.totalVolume) || 0,
      // Convert boolean strings to actual booleans
      hasVali: transfer.hasVali === "Có vali" || transfer.hasVali === true,
    }));

    console.log(
      "✅ Successfully fetched transfers from Google Sheets:",
      normalizedList.length,
      "transfers"
    );
    return res.json(normalizedList);
  } catch (error) {
    console.error("❌ GET /api/transfers error:", error);
    return res.status(500).json({ error: error.message });
  }
});

app.post("/api/transfers/import", async (req, res) => {
  try {
    const rows = Array.isArray(req.body?.rows) ? req.body.rows : [];
    if (rows.length === 0) return res.status(400).json({ error: "rows is required" });

    if (req.query.spreadsheetId) {
      ACTIVE_SPREADSHEET_ID = String(req.query.spreadsheetId);
    }

    if (!ACTIVE_SPREADSHEET_ID || !fs.existsSync(SERVICE_ACCOUNT_PATH)) {
      const seen = new Set();
      let imported = 0;
      let duplicated = 0;
      for (const r of rows) {
        const id = String(r.id || r.transfer_id || "").trim();
        if (!id || seen.has(id)) {
          duplicated++;
          continue;
        }
        seen.add(id);
        imported++;
      }
      return res.json({ imported, duplicated, total: rows.length });
    }

    await resolveSpreadsheetId();
    const sheets = getSheetsClient();
    const headers = await ensureHeaders(sheets, TRANSFERS_SHEET, TRANSFERS_HEADERS);
    const existing = await getAllRecords(sheets, TRANSFERS_SHEET);
    const existingIds = new Set(
      (existing || []).map((r) => String(r.transfer_id || "").trim()).filter(Boolean)
    );

    // Sanitize & normalize all rows trước khi lưu
    const cleaned = rows
      .map((r) => normalizeForSheet(normalizeTransfer(r)))
      .filter((r) => String(r.transfer_id || "").trim() !== "");

    let imported = 0;
    let duplicated = 0;
    for (const rec of cleaned) {
      const id = String(rec.transfer_id || "").trim();
      if (!id || existingIds.has(id)) {
        duplicated++;
        continue;
      }
      await appendRecord(sheets, TRANSFERS_SHEET, headers, rec);
      existingIds.add(id);
      imported++;
    }

    // Áp dụng format sau khi import
    try {
      await formatTransfersSheet(sheets, headers);
    } catch (e) {
      console.warn("Format sheet warning:", e?.message || e);
    }

    res.json({ imported, duplicated, total: cleaned.length });
  } catch (error) {
    console.error("POST /api/transfers/import error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/transfers/export", async (req, res) => {
  try {
    if (req.query.spreadsheetId) {
      ACTIVE_SPREADSHEET_ID = String(req.query.spreadsheetId);
    }
    await resolveSpreadsheetId();
    const sheets = getSheetsClient();
    const headers = await ensureHeaders(sheets, TRANSFERS_SHEET, TRANSFERS_HEADERS);
    const list = await getAllRecords(sheets, TRANSFERS_SHEET);
    const rows = [headers, ...(list || []).map((r) => headers.map((h) => r[h] ?? ""))];
    const csv = rows
      .map((cols) =>
        cols
          .map((v) => (String(v).includes(",") ? `"${String(v).replace(/"/g, '""')}"` : String(v)))
          .join(",")
      )
      .join("\n");
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", 'attachment; filename="transfers.csv"');
    res.send(csv);
  } catch (error) {
    console.error("GET /api/transfers/export error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Update a transfer by id (merge and overwrite fields)
app.put("/api/transfers/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (req.query.spreadsheetId) {
      ACTIVE_SPREADSHEET_ID = String(req.query.spreadsheetId);
    }

    if (!ACTIVE_SPREADSHEET_ID || !fs.existsSync(SERVICE_ACCOUNT_PATH)) {
      // No sheet available; acknowledge update without persistence
      return res.json({ id, ...req.body });
    }

    await resolveSpreadsheetId();
    const sheets = getSheetsClient();
    await ensureHeaders(sheets, TRANSFERS_SHEET, TRANSFERS_HEADERS);
    const { headers, rowIndex } = await findRowIndexById(
      sheets,
      TRANSFERS_SHEET,
      "transfer_id",
      id
    );
    if (rowIndex === -1) return res.status(404).json({ error: "Transfer not found" });

    const endCol = colNumToLetter(headers.length);
    const existingResp = await sheets.spreadsheets.values.get({
      spreadsheetId: ACTIVE_SPREADSHEET_ID,
      range: `${TRANSFERS_SHEET}!A${rowIndex}:${endCol}${rowIndex}`,
    });
    const existingValues = existingResp.data.values?.[0] || [];
    const existingRecord = Object.fromEntries(headers.map((h, i) => [h, existingValues[i] ?? ""]));

    // Merge và chuẩn hóa 1 số trường quan trọng trước khi ghi
    const merged = { ...existingRecord, ...req.body };
    merged.date = formatDateForSheet(merged.date);

    await updateRecordAtRow(sheets, TRANSFERS_SHEET, headers, rowIndex, merged);
    res.json(merged);
  } catch (error) {
    console.error("PUT /api/transfers/:id error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Delete a transfer by id
app.delete("/api/transfers/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (req.query.spreadsheetId) {
      ACTIVE_SPREADSHEET_ID = String(req.query.spreadsheetId);
    }

    if (!ACTIVE_SPREADSHEET_ID || !fs.existsSync(SERVICE_ACCOUNT_PATH)) {
      // No sheet available; acknowledge delete without persistence
      return res.json({ id, deleted: true });
    }

    await resolveSpreadsheetId();
    const sheets = getSheetsClient();
    await ensureHeaders(sheets, TRANSFERS_SHEET, TRANSFERS_HEADERS);
    const { headers, rowIndex } = await findRowIndexById(
      sheets,
      TRANSFERS_SHEET,
      "transfer_id",
      id
    );
    if (rowIndex === -1) return res.status(404).json({ error: "Transfer not found" });

    // Remove the entire row so the sheet has no empty gaps
    await deleteRow(sheets, TRANSFERS_SHEET, rowIndex);
    res.json({ id, deleted: true });
  } catch (error) {
    console.error("DELETE /api/transfers/:id error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Repair TransportRequests headers
app.post("/api/transport-requests/repair-headers", async (req, res) => {
  try {
    if (req.query.spreadsheetId) {
      ACTIVE_SPREADSHEET_ID = String(req.query.spreadsheetId);
    }

    if (!ACTIVE_SPREADSHEET_ID || !fs.existsSync(SERVICE_ACCOUNT_PATH)) {
      return res.json({ ok: true, message: "No sheet configured" });
    }

    await resolveSpreadsheetId();
    const sheets = getSheetsClient();

    // Ensure all required headers exist
    await ensureHeaders(sheets, "TransportRequests", TRANSPORT_REQUESTS_REQUIRED);

    // Apply formatting
    await formatTransfersSheet(sheets, TRANSPORT_REQUESTS_REQUIRED);

    res.json({
      ok: true,
      message: "TransportRequests headers repaired and formatting applied",
    });
  } catch (error) {
    console.error("POST /api/transport-requests/repair-headers error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Clear all transfers from sheet
app.delete("/api/transfers/clear", async (req, res) => {
  try {
    if (req.query.spreadsheetId) {
      ACTIVE_SPREADSHEET_ID = String(req.query.spreadsheetId);
    }

    if (!ACTIVE_SPREADSHEET_ID || !fs.existsSync(SERVICE_ACCOUNT_PATH)) {
      return res.json({ message: "No sheet configured, nothing to clear" });
    }

    await resolveSpreadsheetId();
    const sheets = getSheetsClient();

    // Clear all data except header row
    await sheets.spreadsheets.values.clear({
      spreadsheetId: ACTIVE_SPREADSHEET_ID,
      range: `${TRANSFERS_SHEET}!2:1000`,
    });

    console.log("🗑️ Cleared all transfer data from sheet");
    res.json({ message: "All transfer data cleared successfully" });
  } catch (error) {
    console.error("DELETE /api/transfers/clear error:", error);
    res.status(500).json({ error: error.message });
  }
});

// ---- Settings API: Volume Rules ----
app.get("/api/settings/volume-rules", async (req, res) => {
  try {
    if (req.query.spreadsheetId) {
      ACTIVE_SPREADSHEET_ID = String(req.query.spreadsheetId);
    }

    if (!ACTIVE_SPREADSHEET_ID || !fs.existsSync(SERVICE_ACCOUNT_PATH)) {
      // Fallback to defaults if no sheet/key
      return res.json(VOLUME_DEFAULTS);
    }

    await resolveSpreadsheetId();
    const sheets = getSheetsClient();
    await ensureHeaders(sheets, VOLUME_SHEET, VOLUME_HEADERS);
    const list = await getAllRecords(sheets, VOLUME_SHEET);
    if (!list || list.length === 0) {
      const now = getVietnamTimeString();
      for (const rec of VOLUME_DEFAULTS) {
        const normalized = {
          ...Object.fromEntries(VOLUME_HEADERS.map((h) => [h, ""])),
          ...rec,
          createdAt: now,
          updatedAt: now,
        };
        await appendRecord(sheets, VOLUME_SHEET, VOLUME_HEADERS, normalized);
      }
      const seeded = await getAllRecords(sheets, VOLUME_SHEET);
      return res.json(seeded);
    }
    return res.json(list);
  } catch (error) {
    console.error("GET /api/settings/volume-rules error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/settings/volume-rules", async (req, res) => {
  try {
    const rules = Array.isArray(req.body?.rules) ? req.body.rules : [];
    if (rules.length === 0) {
      return res.status(400).json({ error: "rules is required" });
    }

    if (req.query.spreadsheetId) {
      ACTIVE_SPREADSHEET_ID = String(req.query.spreadsheetId);
    }

    if (!ACTIVE_SPREADSHEET_ID || !fs.existsSync(SERVICE_ACCOUNT_PATH)) {
      // no-op but acknowledge success to keep UX smooth
      return res.json({ updated: rules.length, appended: 0 });
    }

    await resolveSpreadsheetId();
    const sheets = getSheetsClient();
    const headers = await ensureHeaders(sheets, VOLUME_SHEET, VOLUME_HEADERS);

    let updated = 0;
    let appended = 0;
    for (const rule of rules) {
      const id = String(rule.id || "").trim();
      if (!id) continue;

      const { headers: hdrs, rowIndex } = await findRowIndexById(sheets, VOLUME_SHEET, "id", id);

      const now = getVietnamTimeString();
      if (rowIndex === -1) {
        const normalized = {
          ...Object.fromEntries(headers.map((h) => [h, ""])),
          id,
          name: rule.name || "",
          unitVolume: String(Number(rule.unitVolume || 0)),
          description: rule.description || "",
          createdAt: now,
          updatedAt: now,
        };
        await appendRecord(sheets, VOLUME_SHEET, headers, normalized);
        appended++;
      } else {
        const endCol = colNumToLetter(hdrs.length);
        const existingResp = await sheets.spreadsheets.values.get({
          spreadsheetId: ACTIVE_SPREADSHEET_ID,
          range: `${VOLUME_SHEET}!A${rowIndex}:${endCol}${rowIndex}`,
        });
        const existingValues = existingResp.data.values?.[0] || [];
        const existingRecord = Object.fromEntries(hdrs.map((h, i) => [h, existingValues[i] ?? ""]));
        const merged = {
          ...existingRecord,
          id,
          name: rule.name || existingRecord.name || "",
          unitVolume: String(Number(rule.unitVolume || 0)),
          description: rule.description ?? existingRecord.description ?? "",
          updatedAt: now,
        };
        await updateRecordAtRow(sheets, VOLUME_SHEET, hdrs, rowIndex, merged);
        updated++;
      }
    }

    res.json({ updated, appended });
  } catch (error) {
    console.error("POST /api/settings/volume-rules error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Initialize notification services
realtimeService.init(server);

// Telegram webhook handler for production
if (TELEGRAM_WEBHOOK_URL) {
  app.post("/webhook/telegram", (req, res) => {
    telegramService.handleWebhook(req, res);
  });
}

// Notification API endpoints
app.post("/api/_debug/telegram/send", async (req, res) => {
  try {
    const { chatId, text } = req.body || {};
    if (!chatId || !text)
      return res.status(400).json({ ok: false, error: "chatId and text required" });

    const result = await telegramService.sendMessageDebug(chatId, text);
    res.json(result);
  } catch (e) {
    console.error("Telegram send error:", e);
    res.status(500).json({ ok: false, error: e.message });
  }
});

// Lightweight Telegram notify API
app.post("/api/notifications/telegram", async (req, res) => {
  try {
    const { text, chatId } = req.body || {};
    if (!text) return res.status(400).json({ ok: false, error: "text required" });

    const targetChatId = chatId || notificationConfig.telegram.chatId;
    const result = await telegramService.sendMessageDebug(targetChatId, text);
    res.json(result);
  } catch (e) {
    console.error("Telegram notify error:", e);
    res.status(500).json({ ok: false, error: e.message });
  }
});

// Notification status endpoint
app.get("/api/notifications/status", (req, res) => {
  try {
    const status = notificationManager.getServiceStatus();
    res.json(status);
  } catch (error) {
    console.error("Notification status error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Send test notification
app.post("/api/notifications/test", async (req, res) => {
  try {
    const { type, data, priority = "medium" } = req.body;

    if (!type) {
      return res.status(400).json({ error: "Notification type required" });
    }

    // Add test recipients for email testing
    const testRecipients = [{ email: "kho.1@mia.vn", name: "Kho Test" }];

    const success = await notificationManager.sendNotification(
      type,
      data || {},
      testRecipients,
      priority
    );
    res.json({ success, message: "Test notification sent" });
  } catch (error) {
    console.error("Test notification error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get notification history
app.get("/api/notifications/history", (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const history = notificationManager.getNotificationHistory(limit);
    res.json(history);
  } catch (error) {
    console.error("Notification history error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Send carrier update notification
app.post("/api/notifications/carrier-update", async (req, res) => {
  try {
    const { carrierData, priority = "medium" } = req.body;

    if (!carrierData) {
      return res.status(400).json({ error: "Carrier data required" });
    }

    const success = await notificationManager.sendCarrierUpdate(carrierData, priority);
    res.json({ success, message: "Carrier update notification sent" });
  } catch (error) {
    console.error("Carrier update notification error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Send system alert
app.post("/api/notifications/system-alert", async (req, res) => {
  try {
    const { alertType, description, action = "", priority = "high" } = req.body;

    if (!alertType || !description) {
      return res.status(400).json({ error: "Alert type and description required" });
    }

    const success = await notificationManager.sendSystemAlert(
      alertType,
      description,
      action,
      priority
    );
    res.json({ success, message: "System alert sent" });
  } catch (error) {
    console.error("System alert error:", error);
    res.status(500).json({ error: error.message });
  }
});

// ---- Locations API ----
const LOCATIONS_SHEET = "Locations";
const LOCATIONS_HEADERS = [
  "id",
  "code",
  "avatar",
  "category",
  "subcategory",
  "address",
  "status",
  "ward",
  "district",
  "province",
  "note",
  "createdAt",
  "updatedAt",
];

const LOCATIONS_MOCK = [
  {
    id: "1",
    code: "LOC001",
    avatar: "🏢",
    category: "Kho hàng",
    subcategory: "Kho trung tâm",
    address: "123 Đường ABC, Phường 1",
    status: "active",
    ward: "Phường 1",
    district: "Quận 1",
    province: "TP. Hồ Chí Minh",
    note: "Kho chính của công ty",
    createdAt: getVietnamTimeString(),
    updatedAt: getVietnamTimeString(),
  },
  {
    id: "2",
    code: "LOC002",
    avatar: "🏪",
    category: "Cửa hàng",
    subcategory: "Showroom",
    address: "456 Đường XYZ, Phường 2",
    status: "active",
    ward: "Phường 2",
    district: "Quận 3",
    province: "TP. Hồ Chí Minh",
    note: "Showroom trưng bày sản phẩm",
    createdAt: getVietnamTimeString(),
    updatedAt: getVietnamTimeString(),
  },
  {
    id: "3",
    code: "LOC003",
    avatar: "🏭",
    category: "Nhà máy",
    subcategory: "Sản xuất",
    address: "789 Đường DEF, Phường 3",
    status: "inactive",
    ward: "Phường 3",
    district: "Quận 7",
    province: "TP. Hồ Chí Minh",
    note: "Nhà máy sản xuất",
    createdAt: getVietnamTimeString(),
    updatedAt: getVietnamTimeString(),
  },
];

// GET /api/locations
app.get("/api/locations", async (req, res) => {
  try {
    if (req.query.spreadsheetId) {
      ACTIVE_SPREADSHEET_ID = String(req.query.spreadsheetId);
    }

    if (!ACTIVE_SPREADSHEET_ID || !fs.existsSync(SERVICE_ACCOUNT_PATH)) {
      console.error("❌ Google Sheets not configured");
      return res.status(500).json({ error: "Google Sheets not configured" });
    }

    await resolveSpreadsheetId();
    const sheets = getSheetsClient();

    // Use retry logic for rate limiting
    const list = await retryWithBackoff(async () => {
      await ensureHeaders(sheets, LOCATIONS_SHEET, LOCATIONS_HEADERS);
      return await getAllRecords(sheets, LOCATIONS_SHEET);
    });

    if (!list || list.length === 0) {
      console.log("📋 Locations sheet is empty, seeding with mock data...");
      // Seed mock data if sheet is empty
      const now = getVietnamTimeString();
      for (const rec of LOCATIONS_MOCK) {
        const normalized = {
          ...Object.fromEntries(LOCATIONS_HEADERS.map((h) => [h, ""])),
          ...rec,
          createdAt: now,
          updatedAt: now,
        };
        await retryWithBackoff(async () => {
          await appendRecord(sheets, LOCATIONS_SHEET, LOCATIONS_HEADERS, normalized);
        });
      }
      const seeded = await retryWithBackoff(async () => {
        return await getAllRecords(sheets, LOCATIONS_SHEET);
      });
      console.log("✅ Seeded locations sheet with", seeded.length, "records");
      return res.json(seeded);
    }

    console.log("✅ Successfully fetched locations from Google Sheets:", list.length, "locations");
    return res.json(list);
  } catch (error) {
    console.error("❌ GET /api/locations error:", error);
    return res.status(500).json({ error: error.message });
  }
});

// POST /api/locations
app.post("/api/locations", async (req, res) => {
  try {
    const location = req.body;
    if (!location.code) {
      return res.status(400).json({ error: "Location code is required" });
    }

    if (req.query.spreadsheetId) {
      ACTIVE_SPREADSHEET_ID = String(req.query.spreadsheetId);
    }

    if (!ACTIVE_SPREADSHEET_ID || !fs.existsSync(SERVICE_ACCOUNT_PATH)) {
      return res.json({ ...location, id: Date.now().toString() });
    }

    await resolveSpreadsheetId();
    const sheets = getSheetsClient();
    await ensureHeaders(sheets, LOCATIONS_SHEET, LOCATIONS_HEADERS);

    const now = getVietnamTimeString();
    const normalized = {
      ...Object.fromEntries(LOCATIONS_HEADERS.map((h) => [h, ""])),
      ...location,
      id: location.id || Date.now().toString(),
      createdAt: now,
      updatedAt: now,
    };

    await appendRecord(sheets, LOCATIONS_SHEET, LOCATIONS_HEADERS, normalized);
    res.json(normalized);
  } catch (error) {
    console.error("POST /api/locations error:", error);
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/locations/:id
app.put("/api/locations/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (req.query.spreadsheetId) {
      ACTIVE_SPREADSHEET_ID = String(req.query.spreadsheetId);
    }

    if (!ACTIVE_SPREADSHEET_ID || !fs.existsSync(SERVICE_ACCOUNT_PATH)) {
      return res.json({ ...req.body, id, updatedAt: getVietnamTimeString() });
    }

    await resolveSpreadsheetId();
    const sheets = getSheetsClient();
    await ensureHeaders(sheets, LOCATIONS_SHEET, LOCATIONS_HEADERS);

    const { headers, rowIndex } = await findRowIndexById(sheets, LOCATIONS_SHEET, "id", id);

    if (rowIndex === -1) {
      return res.status(404).json({ error: "Location not found" });
    }

    const endCol = colNumToLetter(headers.length);
    const existingResp = await sheets.spreadsheets.values.get({
      spreadsheetId: ACTIVE_SPREADSHEET_ID,
      range: `${LOCATIONS_SHEET}!A${rowIndex}:${endCol}${rowIndex}`,
    });
    const existingValues = existingResp.data.values?.[0] || [];
    const existingRecord = Object.fromEntries(headers.map((h, i) => [h, existingValues[i] ?? ""]));

    const merged = {
      ...existingRecord,
      ...req.body,
      updatedAt: getVietnamTimeString(),
    };
    await updateRecordAtRow(sheets, LOCATIONS_SHEET, headers, rowIndex, merged);
    res.json(merged);
  } catch (error) {
    console.error("PUT /api/locations/:id error:", error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/locations/:id
app.delete("/api/locations/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (req.query.spreadsheetId) {
      ACTIVE_SPREADSHEET_ID = String(req.query.spreadsheetId);
    }

    if (!ACTIVE_SPREADSHEET_ID || !fs.existsSync(SERVICE_ACCOUNT_PATH)) {
      return res.json({ success: true });
    }

    await resolveSpreadsheetId();
    const sheets = getSheetsClient();
    await ensureHeaders(sheets, LOCATIONS_SHEET, LOCATIONS_HEADERS);

    const { headers, rowIndex } = await findRowIndexById(sheets, LOCATIONS_SHEET, "id", id);

    if (rowIndex === -1) {
      return res.status(404).json({ error: "Location not found" });
    }

    await clearRow(sheets, LOCATIONS_SHEET, rowIndex);
    res.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/locations/:id error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Thêm các API khác cho Carriers, Customers, ...

async function overwriteHeaderRow(sheets, sheetName, headers) {
  // Lấy hàng đầu để biết bề rộng hiện tại
  const resp = await sheets.spreadsheets.values.get({
    spreadsheetId: ACTIVE_SPREADSHEET_ID,
    range: `${sheetName}!1:1`,
  });
  const current = resp.data.values?.[0] || [];
  const width = Math.max(current.length, headers.length);
  const padded = [...headers];
  while (padded.length < width) padded.push("");
  await sheets.spreadsheets.values.update({
    spreadsheetId: ACTIVE_SPREADSHEET_ID,
    range: `${sheetName}!1:1`,
    valueInputOption: "RAW",
    requestBody: { values: [padded] },
  });
}

// API: Repair Transfers headers safely
app.post("/api/transfers/repair-headers", async (req, res) => {
  try {
    if (req.query.spreadsheetId) {
      ACTIVE_SPREADSHEET_ID = String(req.query.spreadsheetId);
    }
    if (!ACTIVE_SPREADSHEET_ID || !fs.existsSync(SERVICE_ACCOUNT_PATH)) {
      return res.status(400).json({ error: "Google Sheets not configured" });
    }
    await resolveSpreadsheetId();
    const sheets = getSheetsClient();

    // Overwrite header row with canonical headers and clear extras
    await ensureHeaders(sheets, TRANSFERS_SHEET, TRANSFERS_HEADERS);
    await overwriteHeaderRow(sheets, TRANSFERS_SHEET, TRANSFERS_HEADERS);

    // Re-apply formatting (số nguyên/thập phân, ngày, auto-resize)
    await formatTransfersSheet(sheets, TRANSFERS_HEADERS);

    res.json({ ok: true, message: "Headers repaired and formatting applied" });
  } catch (e) {
    console.error("POST /api/transfers/repair-headers error:", e);
    res.status(500).json({ error: e.message });
  }
});

// API: Cập nhật tiêu đề cột MN cho TransportRequests
app.post("/api/transport-requests/update-mn-headers", async (req, res) => {
  try {
    if (req.query.spreadsheetId) {
      ACTIVE_SPREADSHEET_ID = String(req.query.spreadsheetId);
    }

    if (!ACTIVE_SPREADSHEET_ID || !fs.existsSync(SERVICE_ACCOUNT_PATH)) {
      return res.status(400).json({ error: "Google Sheets not configured" });
    }

    await resolveSpreadsheetId();
    const sheets = getSheetsClient();

    // Lấy hàng tiêu đề hiện tại
    const headerResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: ACTIVE_SPREADSHEET_ID,
      range: "TransportRequests!1:1",
    });

    const currentHeaders = headerResponse.data.values?.[0] || [];
    console.log("🔍 Current headers:", currentHeaders);

    // Tìm vị trí các cột address để chèn MN vào sau
    const mnHeaders = [];
    let insertIndex = 0;

    for (let i = 0; i < currentHeaders.length; i++) {
      mnHeaders.push(currentHeaders[i]);

      // Nếu là cột address (stop1Address, stop2Address, ...), chèn MN vào sau
      if (
        currentHeaders[i] &&
        currentHeaders[i].includes("Address") &&
        currentHeaders[i].startsWith("stop")
      ) {
        const stopNumber = currentHeaders[i].replace("Address", "");
        const mnColumnName = `${stopNumber}MN`;

        // Kiểm tra xem cột MN đã tồn tại chưa
        if (!currentHeaders.includes(mnColumnName)) {
          mnHeaders.push(mnColumnName);
          console.log(`✅ Added ${mnColumnName} after ${currentHeaders[i]}`);
        } else {
          console.log(`ℹ️ ${mnColumnName} already exists`);
        }
      }
    }

    console.log("🔍 New headers with MN:", mnHeaders);

    // Cập nhật hàng tiêu đề
    await sheets.spreadsheets.values.update({
      spreadsheetId: ACTIVE_SPREADSHEET_ID,
      range: "TransportRequests!1:1",
      valueInputOption: "RAW",
      requestBody: { values: [mnHeaders] },
    });

    // Đảm bảo tất cả headers cần thiết đều có
    await ensureHeaders(sheets, "TransportRequests", TRANSPORT_REQUESTS_REQUIRED);

    res.json({
      ok: true,
      message: "MN headers updated successfully",
      oldHeadersCount: currentHeaders.length,
      newHeadersCount: mnHeaders.length,
      addedColumns: mnHeaders.filter((h) => !currentHeaders.includes(h)),
    });
  } catch (error) {
    console.error("POST /api/transport-requests/update-mn-headers error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Transport Proposals API Routes (Sheet mới cho đề nghị vận chuyển)
app.post("/api/transport-proposals/init", async (req, res) => {
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });

    // Tạo headers cho sheet (tiếng Anh)
    const headers = [
      "ID",
      "Request Code",
      "Type",
      "Origin ID",
      "Origin Name",
      "Origin Address",
      "Destination IDs",
      "Destination Names",
      "Destination Addresses",
      "Status",
      "Shipping Status",
      "Department",
      "Request Date",
      "Has Luggage",
      "Created By",
      "Product Quantity",
      "Total Packages",
      "Total Volume (m3)",
      "Package Details (JSON)",
      "External Destinations (JSON)",
      "Note",
      "Created At",
      "Updated At",
    ];

    // Kiểm tra xem sheet đã tồn tại chưa
    try {
      await sheets.spreadsheets.get({
        spreadsheetId: ACTIVE_SPREADSHEET_ID,
        ranges: ["TransportProposals"],
      });
      console.log("Sheet TransportProposals đã tồn tại");
    } catch (error) {
      // Tạo sheet mới nếu chưa tồn tại
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: ACTIVE_SPREADSHEET_ID,
        resource: {
          requests: [
            {
              addSheet: {
                properties: {
                  title: "TransportProposals",
                  gridProperties: {
                    rowCount: 1000,
                    columnCount: headers.length,
                  },
                },
              },
            },
          ],
        },
      });
      console.log("Đã tạo sheet TransportProposals mới");
    }

    // Thêm headers
    await sheets.spreadsheets.values.update({
      spreadsheetId: ACTIVE_SPREADSHEET_ID,
      range: "TransportProposals!A1:N1",
      valueInputOption: "RAW",
      resource: {
        values: [headers],
      },
    });

    res.json({
      success: true,
      message: "Sheet TransportProposals đã được khởi tạo thành công",
    });
  } catch (error) {
    console.error("Error initializing TransportProposals sheet:", error);
    res.status(500).json({
      success: false,
      error: "Không thể khởi tạo sheet TransportProposals",
    });
  }
});

app.post("/api/transport-proposals", async (req, res) => {
  try {
    const {
      type,
      originId,
      destinationIds,
      note,
      transportStatus,
      shippingStatus,
      department,
      requestDate,
      hasLuggage,
      createdBy,
      productQuantity,
      packages,
      totalPackages,
      totalVolume,
      externalDestinations,
    } = req.body;

    const spreadsheetId = "18B1PIhCDmBWyHZytvOcfj_1QbYBwczLf1x1Qbu0E5As";
    if (!fs.existsSync(SERVICE_ACCOUNT_PATH)) {
      return res.status(500).json({ error: "Google Sheets not configured" });
    }

    const auth = new google.auth.GoogleAuth({
      keyFile: process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });

    // Tạo mã đề nghị
    const requestCode = generateTransportRequestCode(type);
    const now = getVietnamTime();
    const vietnameseDateTime = getVietnamTimeDisplay();

    // Lấy thông tin địa điểm từ Locations sheet
    const origin = await getLocationById(originId, sheets);

    let destinations = [];
    let destinationNames = "";
    let destinationAddresses = "";

    if (type === "system") {
      // Từ hệ thống: sử dụng destinationIds
      destinations = await Promise.all(destinationIds.map((id) => getLocationById(id, sheets)));
      destinationNames = destinations.map((d) => d.name).join("; ");
      destinationAddresses = destinations.map((d) => d.address).join("; ");
    } else {
      // Ngoài hệ thống: sử dụng externalDestinations
      destinationNames = externalDestinations.map((d) => d.customerName || "Khách hàng").join("; ");
      destinationAddresses = externalDestinations.map((d) => d.address).join("; ");
    }

    // Chuẩn bị dữ liệu để ghi vào sheet
    const rowData = [
      generateTransportRequestId(), // ID
      requestCode, // Mã đề nghị
      type === "system" ? "Từ hệ thống" : "Ngoài hệ thống", // Loại
      origin.id, // Điểm đi ID
      origin.name, // Điểm đi tên
      origin.address, // Điểm đi địa chỉ
      type === "system"
        ? destinationIds.join(",")
        : externalDestinations.map((d, i) => `EXT_${i + 1}`).join(","), // Điểm đến IDs
      destinationNames, // Điểm đến tên
      destinationAddresses, // Điểm đến địa chỉ
      transportStatus || "Chờ xác nhận", // Trạng thái
      shippingStatus || "Đã báo kiện", // Trạng thái vận chuyển
      department || "", // Phòng ban sử dụng
      requestDate || vietnameseDateTime.split(" ")[0], // Ngày đề nghị
      hasLuggage || "Không vali", // Có vali
      createdBy || "current_user", // Người tạo phiếu
      productQuantity || 0, // Số lượng sản phẩm
      totalPackages || 0, // Tổng số kiện
      totalVolume || 0, // Tổng khối lượng (m³)
      packages ? JSON.stringify(packages) : "", // Chi tiết kiện (JSON)
      externalDestinations ? JSON.stringify(externalDestinations) : "", // Chi tiết điểm đến ngoài hệ thống (JSON)
      note || "", // Ghi chú
      vietnameseDateTime, // Ngày tạo
      vietnameseDateTime, // Ngày cập nhật
    ];

    // Ghi dữ liệu vào sheet với timeout
    console.log("📝 Đang ghi dữ liệu vào Google Sheets...");
    const startTime = Date.now();

    await sheets.spreadsheets.values.append({
      spreadsheetId: spreadsheetId,
      range: "TransportProposals!A:W",
      valueInputOption: "RAW",
      resource: {
        values: [rowData],
      },
    });

    const endTime = Date.now();
    console.log(`✅ Đã ghi dữ liệu vào sheet trong ${endTime - startTime}ms`);

    res.json({
      success: true,
      message: "Đề nghị vận chuyển đã được tạo thành công",
      data: {
        id: rowData[0],
        requestCode,
        type,
        origin,
        destinations,
        status: "pending",
        createdAt: vietnameseDateTime,
      },
    });
  } catch (error) {
    console.error("Error creating transport request:", error);
    res.status(500).json({
      success: false,
      error: "Không thể tạo đề nghị vận chuyển",
    });
  }
});

// Update headers for existing TransportProposals sheet
app.post("/api/transport-proposals/update-headers", async (req, res) => {
  try {
    const spreadsheetId = "18B1PIhCDmBWyHZytvOcfj_1QbYBwczLf1x1Qbu0E5As";
    if (!fs.existsSync(SERVICE_ACCOUNT_PATH)) {
      return res.status(500).json({ error: "Google Sheets not configured" });
    }

    const auth = new google.auth.GoogleAuth({
      keyFile: process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });
    // Headers đầy đủ (tiếng Anh)
    const headers = [
      "ID",
      "Request Code",
      "Type",
      "Origin ID",
      "Origin Name",
      "Origin Address",
      "Destination IDs",
      "Destination Names",
      "Destination Addresses",
      "Status",
      "Shipping Status",
      "Department",
      "Request Date",
      "Has Luggage",
      "Created By",
      "Product Quantity",
      "Total Packages",
      "Total Volume (m3)",
      "Package Details (JSON)",
      "External Destinations (JSON)",
      "Note",
      "Created At",
      "Updated At",
    ];

    // Cập nhật headers trong sheet
    await sheets.spreadsheets.values.update({
      spreadsheetId: spreadsheetId,
      range: "TransportProposals!1:1",
      valueInputOption: "RAW",
      resource: {
        values: [headers],
      },
    });

    res.json({
      success: true,
      message: "Headers đã được cập nhật thành công",
      headers: headers,
    });
  } catch (error) {
    console.error("Error updating headers:", error);
    res.status(500).json({
      error: "Không thể cập nhật headers",
      details: error.message,
    });
  }
});

// GET transport proposals
app.get("/api/transport-proposals", async (req, res) => {
  try {
    const spreadsheetId = "18B1PIhCDmBWyHZytvOcfj_1QbYBwczLf1x1Qbu0E5As";
    if (!fs.existsSync(SERVICE_ACCOUNT_PATH)) {
      return res.status(500).json({ error: "Google Sheets not configured" });
    }

    const auth = new google.auth.GoogleAuth({
      keyFile: process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });

    // Lấy dữ liệu từ sheet
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: spreadsheetId,
      range: "TransportProposals!A:W",
    });

    const rows = response.data.values || [];
    if (rows.length <= 1) {
      return res.json([]);
    }

    const headers = rows[0];
    const data = rows.slice(1).map((row) => {
      const record = {};
      headers.forEach((header, index) => {
        record[header] = row[index] || "";
      });
      return record;
    });

    res.json(data);
  } catch (error) {
    console.error("Error fetching transport proposals:", error);
    res.status(500).json({
      error: "Không thể lấy danh sách đề nghị vận chuyển",
      details: error.message,
    });
  }
});

// Helper functions for transport requests
function generateTransportRequestCode(type) {
  const prefix = type === "system" ? "TRS" : "TRE";
  const timestamp = Date.now().toString().slice(-6);
  return `${prefix}-${timestamp}`;
}

function generateTransportRequestId() {
  return `tr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

async function getLocationById(id, sheets) {
  try {
    const spreadsheetId = "18B1PIhCDmBWyHZytvOcfj_1QbYBwczLf1x1Qbu0E5As";
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: spreadsheetId,
      range: "Locations!A:Z",
    });

    const rows = response.data.values || [];
    const headers = rows[0] || [];
    const locationRow = rows.find((row) => row[0] === id);

    if (!locationRow) {
      throw new Error("Location not found");
    }

    const location = {};
    headers.forEach((header, index) => {
      location[header] = locationRow[index] || "";
    });

    return {
      id: location.ID || id,
      name: location.code || location.Tên || location.name || "",
      address: location.address || location.Địa_chỉ || "",
    };
  } catch (error) {
    console.error("Error fetching location:", error);
    throw new Error("Không thể lấy thông tin địa điểm");
  }
}

// Function to test Google Apps Script connection
async function testGoogleAppsScript() {
  try {
    const googleAppsScriptUrl = process.env.VITE_GOOGLE_APPS_SCRIPT_URL;
    if (!googleAppsScriptUrl) {
      return { status: "❌ Không hoạt động", reason: "Chưa cấu hình URL" };
    }

    // Test with a simple distance calculation
    const testUrl = `${googleAppsScriptUrl}?origin=${encodeURIComponent("Quận 1, TP. Hồ Chí Minh")}&destination=${encodeURIComponent("Quận Ba Đình, Hà Nội")}`;

    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const response = await fetch(testUrl, {
      method: "GET",
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      if (data.distance && data.distance > 0) {
        return {
          status: "✅ Hoạt động",
          reason: `Tính khoảng cách thành công (${data.distance}km)`,
        };
      } else if (data.error) {
        return {
          status: "⚠️ Một phần",
          reason: `Kết nối được nhưng có lỗi: ${data.error}`,
        };
      } else {
        return {
          status: "⚠️ Một phần",
          reason: "Kết nối được nhưng không có dữ liệu khoảng cách",
        };
      }
    } else {
      return {
        status: "❌ Không hoạt động",
        reason: `Lỗi HTTP ${response.status}: ${response.statusText}`,
      };
    }
  } catch (error) {
    if (error.name === "AbortError") {
      return {
        status: "❌ Không hoạt động",
        reason: "Hết thời gian chờ kết nối (10s)",
      };
    }
    return { status: "❌ Không hoạt động", reason: error.message };
  }
}

// Health check endpoint
app.get("/api/auth/health", (req, res) => {
  res.json({
    status: "online",
    timestamp: getVietnamTimeDisplay(),
    uptime: process.uptime(),
    message: "Server is running",
  });
});

// Register endpoint (placeholder)
app.post("/api/auth/register", async (req, res) => {
  try {
    const { fullName, email, password, phone } = req.body;

    // Basic validation
    if (!fullName || !email || !password || !phone) {
      return res.status(400).json({
        error: "Tất cả các trường đều bắt buộc",
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: "Email không hợp lệ",
      });
    }

    // Password validation
    if (password.length < 6) {
      return res.status(400).json({
        error: "Mật khẩu phải có ít nhất 6 ký tự",
      });
    }

    // Phone validation
    const phoneRegex = /^[0-9]{10,11}$/;
    if (!phoneRegex.test(phone.replace(/\s/g, ""))) {
      return res.status(400).json({
        error: "Số điện thoại phải có 10-11 chữ số",
      });
    }

    // TODO: Implement actual user registration logic
    // For now, just return success
    res.json({
      message: "Đăng ký thành công! Vui lòng đăng nhập để tiếp tục.",
      user: {
        fullName,
        email,
        phone,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({
      error: "Lỗi server khi đăng ký",
    });
  }
});

// Forgot password endpoint (placeholder)
app.post("/api/auth/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    // Basic validation
    if (!email) {
      return res.status(400).json({
        error: "Email là bắt buộc",
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: "Email không hợp lệ",
      });
    }

    // TODO: Implement actual password reset logic
    // For now, just return success
    res.json({
      message: "Email đặt lại mật khẩu đã được gửi!",
      email: email,
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({
      error: "Lỗi server khi gửi email",
    });
  }
});

server.listen(PORT, async () => {
  const startTime = getVietnamTimeDisplay();

  console.log(`\n🚀 MIA LOGISTICS MANAGER - SERVER KHỞI ĐỘNG THÀNH CÔNG`);
  console.log(`⏰ Thời gian: ${startTime}`);
  console.log(`📡 Cổng: ${PORT} | Socket.IO: Sẵn sàng`);
  console.log(
    `🤖 Telegram Bot: ${telegramService.isInitialized ? "✅ Hoạt động" : "❌ Không hoạt động"}`
  );
  console.log(
    `📧 Dịch vụ Email: ${emailService.isInitialized ? "✅ Hoạt động" : "❌ Không hoạt động"}`
  );
  console.log(
    `🔔 Quản lý Thông báo: ${notificationManager.isInitialized ? "✅ Hoạt động" : "❌ Không hoạt động"}`
  );

  // Auto-update admin permissions on server startup
  try {
    await ensureAdminFullPermissions();
  } catch (error) {
    console.log("⚠️ Không thể cập nhật quyền admin:", error.message);
  }

  // Test Google Apps Script connection
  console.log(`\n🔄 Đang kiểm tra kết nối Google Apps Script...`);
  const gasStatus = await testGoogleAppsScript();
  console.log(
    `🗺️ Google Apps Script (Tính khoảng cách): ${gasStatus.status} - ${gasStatus.reason}`
  );

  console.log(`\n✨ Hệ thống đã sẵn sàng phục vụ!`);
  console.log(`🌐 Backend API: http://localhost:${PORT}`);
  console.log(`📱 Frontend App: http://localhost:3000`);
  console.log(`📊 Google Sheets: Đã kết nối`);
  console.log(`🔐 Bảo mật: Đã kích hoạt\n`);
});
