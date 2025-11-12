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
const bcrypt = require("bcryptjs");

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

const ACTIVE_STATUSES = new Set(["TRUE", "true", true, "active", "ACTIVE", "1"]);
const SALT_ROUNDS = 10;

// Helper to hash password (bcrypt with fixed salt rounds)
function hashPassword(password) {
  return bcrypt.hashSync(String(password), SALT_ROUNDS);
}

async function comparePassword(plainPassword, hashedPassword) {
  if (!hashedPassword) return false;
  try {
    return await bcrypt.compare(String(plainPassword), String(hashedPassword));
  } catch (error) {
    console.error("❌ bcrypt compare error:", error);
    return false;
  }
}

// Helper to normalize user data
function normalizeStatus(rawStatus) {
  const value = String(rawStatus ?? "").trim();
  if (!value) return "";
  if (ACTIVE_STATUSES.has(value)) return "active";
  if (["FALSE", "false", "0", "inactive", "INACTIVE"].includes(value)) return "inactive";
  return value;
}

function normalizeUser(record) {
  const base = Object.fromEntries(USERS_HEADERS.map((h) => [h, ""]));
  const merged = { ...base, ...record };
  if (merged.status !== undefined) {
    merged.status = normalizeStatus(merged.status);
  }
  return merged;
}

// POST /api/auth/login - Login user
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    await ensureHeaders(USERS_SHEET, USERS_HEADERS);
    const users = await getAllRecords(USERS_SHEET);

    const user = users.find(
      (u) => String(u.email || "").toLowerCase() === String(email).toLowerCase()
    );

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    if (!ACTIVE_STATUSES.has(user.status)) {
      return res.status(403).json({ error: "Account is not active" });
    }

    const isValidPassword = await comparePassword(password, user.passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Return user without password hash
    const userWithoutPassword = { ...user };
    delete userWithoutPassword.passwordHash;
    res.json({
      success: true,
      user: userWithoutPassword,
      message: "Login successful",
    });
  } catch (error) {
    console.error("❌ POST /api/auth/login error:", error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/auth/register - Register new user
router.post("/register", async (req, res) => {
  try {
    const { email, password, fullName, roleId = "3" } = req.body;

    if (!email || !password || !fullName) {
      return res.status(400).json({ error: "Email, password, and fullName are required" });
    }

    await ensureHeaders(USERS_SHEET, USERS_HEADERS);

    // Check if user already exists
    const users = await getAllRecords(USERS_SHEET);
    const existingUser = users.find((u) => u.email === email);

    if (existingUser) {
      return res.status(409).json({ error: "User already exists" });
    }

    const now = getVietnamTimeString();
    const userId = `USER-${Date.now()}`;
    const passwordHash = hashPassword(password);

    const newUser = normalizeUser({
      id: userId,
      email,
      passwordHash,
      fullName,
      roleId,
      status: "active",
      createdAt: now,
      updatedAt: now,
    });

    await appendRecord(USERS_SHEET, USERS_HEADERS, newUser);

    // Return user without password hash
    const userWithoutPassword = { ...newUser };
    delete userWithoutPassword.passwordHash;
    res.status(201).json({
      success: true,
      user: userWithoutPassword,
      message: "User registered successfully",
    });
  } catch (error) {
    console.error("❌ POST /api/auth/register error:", error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/auth/logout - Logout (client-side, just acknowledge)
router.post("/logout", (req, res) => {
  res.json({ success: true, message: "Logout successful" });
});

// POST /api/auth/verify-password - Verify password using same hashing logic as sheet
router.post("/verify-password", async (req, res) => {
  try {
    const { password, hash } = req.body || {};

    if (!password || !hash) {
      return res.status(400).json({ success: false, error: "password and hash are required" });
    }

    const isValid = await comparePassword(password, hash);

    res.json({ success: true, isValid });
  } catch (error) {
    console.error("❌ POST /api/auth/verify-password error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/auth/me - Get current user info (requires auth middleware in production)
router.get("/me", async (req, res) => {
  try {
    // In production, extract user from JWT token
    // For now, return 401 if no user info provided
    const userId = req.headers["x-user-id"] || req.query.userId;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    await ensureHeaders(USERS_SHEET, USERS_HEADERS);
    const { rowIndex, headers, values } = await findRowIndexById(USERS_SHEET, "id", userId);

    if (rowIndex === -1) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = {};
    headers.forEach((h, i) => {
      user[h] = values[rowIndex]?.[i] || "";
    });

    // Return user without password hash
    const userWithoutPassword = { ...user };
    delete userWithoutPassword.passwordHash;
    res.json(userWithoutPassword);
  } catch (error) {
    console.error("❌ GET /api/auth/me error:", error);
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/auth/change-password - Change password
router.put("/change-password", async (req, res) => {
  try {
    const { userId, oldPassword, newPassword } = req.body;

    if (!userId || !oldPassword || !newPassword) {
      return res.status(400).json({ error: "UserId, oldPassword, and newPassword are required" });
    }

    await ensureHeaders(USERS_SHEET, USERS_HEADERS);
    const { rowIndex, headers, values } = await findRowIndexById(USERS_SHEET, "id", userId);

    if (rowIndex === -1) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = {};
    headers.forEach((h, i) => {
      user[h] = values[rowIndex]?.[i] || "";
    });

    // Verify old password
    const isValidOldPassword = await comparePassword(oldPassword, user.passwordHash);
    if (!isValidOldPassword) {
      return res.status(401).json({ error: "Invalid old password" });
    }

    // Update password
    const now = getVietnamTimeString();
    const newPasswordHash = hashPassword(newPassword);
    const updatedUser = normalizeUser({
      ...user,
      passwordHash: newPasswordHash,
      updatedAt: now,
    });

    await updateRecordAtRow(USERS_SHEET, USERS_HEADERS, updatedUser, rowIndex);

    res.json({ success: true, message: "Password changed successfully" });
  } catch (error) {
    console.error("❌ PUT /api/auth/change-password error:", error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/auth/users - List all users (Admin only)
router.get("/users", async (req, res, next) => {
  try {
    await ensureHeaders(USERS_SHEET, USERS_HEADERS);
    const users = await getAllRecords(USERS_SHEET);

    // Return users without password hash
    const usersWithoutPassword = users.map((user) => {
      const userWithoutPassword = { ...user };
      delete userWithoutPassword.passwordHash;
      return userWithoutPassword;
    });

    res.json(usersWithoutPassword);
  } catch (err) {
    next(err);
  }
});

// GET /api/auth/users/:id - Get user by ID
router.get("/users/:id", async (req, res, next) => {
  try {
    const userId = req.params.id;
    await ensureHeaders(USERS_SHEET, USERS_HEADERS);
    const { rowIndex, headers, values } = await findRowIndexById(USERS_SHEET, "id", userId);

    if (rowIndex === -1) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = {};
    headers.forEach((h, i) => {
      user[h] = values[rowIndex]?.[i] || "";
    });

    // Return user without password hash
    const userWithoutPassword = { ...user };
    delete userWithoutPassword.passwordHash;
    res.json(userWithoutPassword);
  } catch (err) {
    next(err);
  }
});

// PUT /api/auth/users/:id - Update user (Admin only)
router.put("/users/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    const updates = req.body || {};
    const now = getVietnamTimeString();
    await ensureHeaders(USERS_SHEET, USERS_HEADERS);

    const { rowIndex, headers, values } = await findRowIndexById(USERS_SHEET, "id", userId);

    if (rowIndex === -1) {
      return res.status(404).json({ error: "User not found" });
    }

    // Get existing user data
    const existingUser = {};
    headers.forEach((h, i) => {
      existingUser[h] = values[rowIndex]?.[i] || "";
    });

    // If password is being updated, hash it
    let passwordHash = existingUser.passwordHash;
    if (updates.password) {
      passwordHash = hashPassword(updates.password);
      delete updates.password; // Remove password from updates
    }

    const updatedUser = normalizeUser({
      ...existingUser,
      ...updates,
      id: userId, // Preserve ID
      passwordHash, // Use existing or new hash
      updatedAt: now,
    });

    await updateRecordAtRow(USERS_SHEET, USERS_HEADERS, updatedUser, rowIndex);

    // Return user without password hash
    const userWithoutPassword = { ...updatedUser };
    delete userWithoutPassword.passwordHash;
    res.json(userWithoutPassword);
  } catch (error) {
    console.error("❌ PUT /api/auth/users/:id error:", error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/auth/init - Initialize auth sheets (create headers if missing)
router.post("/init", async (req, res) => {
  try {
    // Ensure Users sheet has headers
    await ensureHeaders(USERS_SHEET, USERS_HEADERS);

    // Ensure Roles sheet has headers (if exists)
    const ROLES_SHEET = "Roles";
    const ROLES_HEADERS = ["id", "name", "description"];
    try {
      await ensureHeaders(ROLES_SHEET, ROLES_HEADERS);
    } catch (err) {
      console.warn("Roles sheet not found, skipping...");
    }

    // Ensure RolePermissions sheet has headers (if exists)
    const ROLE_PERMISSIONS_SHEET = "RolePermissions";
    const ROLE_PERMISSIONS_HEADERS = ["roleId", "resource", "action"];
    try {
      await ensureHeaders(ROLE_PERMISSIONS_SHEET, ROLE_PERMISSIONS_HEADERS);
    } catch (err) {
      console.warn("RolePermissions sheet not found, skipping...");
    }

    res.json({
      success: true,
      message: "Auth sheets initialized successfully",
      sheets: {
        Users: "ready",
        Roles: "ready",
        RolePermissions: "ready",
      },
    });
  } catch (error) {
    console.error("❌ POST /api/auth/init error:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
