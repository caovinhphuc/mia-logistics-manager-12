const express = require("express");
const router = express.Router();
const { ensureHeaders, getAllRecords } = require("../utils/googleSheetsHelpers");

// GET /api/admin/stats - Get admin statistics
router.get("/stats", async (req, res) => {
  try {
    // Get counts from various sheets
    const sheets = {
      carriers: "Carriers",
      transfers: "Transfers",
      locations: "Locations",
      transportRequests: "TransportRequests",
      employees: "Employees",
      users: "Users",
    };

    const stats = {};

    for (const [key, sheetName] of Object.entries(sheets)) {
      try {
        const headers =
          sheetName === "Users"
            ? [
                "id",
                "email",
                "passwordHash",
                "fullName",
                "roleId",
                "status",
                "createdAt",
                "updatedAt",
              ]
            : sheetName === "Carriers"
              ? [
                  "carrierId",
                  "name",
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
                ]
              : sheetName === "Transfers"
                ? [
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
                  ]
                : sheetName === "Locations"
                  ? [
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
                    ]
                  : sheetName === "TransportRequests"
                    ? ["requestId", "createdAt", "status"]
                    : [
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

        await ensureHeaders(sheetName, headers);
        const records = await getAllRecords(sheetName);

        // Filter active records if status/isActive field exists
        let activeCount = records.length;
        if (sheetName === "Carriers") {
          activeCount = records.filter((r) => r.isActive === "TRUE" || r.isActive === true).length;
        } else if (sheetName === "Employees" || sheetName === "Users") {
          activeCount = records.filter((r) => r.status === "TRUE" || r.status === true).length;
        }

        stats[key] = {
          total: records.length,
          active: activeCount,
        };
      } catch (err) {
        console.error(`Error getting stats for ${sheetName}:`, err);
        stats[key] = { total: 0, active: 0, error: err.message };
      }
    }

    res.json({
      success: true,
      stats,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ GET /api/admin/stats error:", error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/admin/sheets - Get all sheets info
router.get("/sheets", async (req, res) => {
  try {
    const googleSheetsService = require("../services/googleSheetsService");
    const titles = await googleSheetsService.listSheetTitles();
    res.json({
      success: true,
      spreadsheetId: googleSheetsService.spreadsheetId,
      sheets: titles,
      count: titles.length,
    });
  } catch (error) {
    console.error("❌ GET /api/admin/sheets error:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
