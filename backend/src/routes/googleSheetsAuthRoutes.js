const express = require("express");
const router = express.Router();

// GET /api/google-sheets-auth/status - Check Google Sheets authentication status
router.get("/status", async (req, res) => {
  try {
    const googleSheetsService = require("../services/googleSheetsService");
    const spreadsheetId = googleSheetsService.spreadsheetId;

    // Try to list sheets to verify connection
    try {
      const titles = await googleSheetsService.listSheetTitles();
      res.json({
        success: true,
        authenticated: true,
        spreadsheetId,
        sheetsCount: titles.length,
        message: "Google Sheets connection active",
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        authenticated: false,
        spreadsheetId,
        error: err.message,
        message: "Google Sheets connection failed",
      });
    }
  } catch (error) {
    console.error("❌ GET /api/google-sheets-auth/status error:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
