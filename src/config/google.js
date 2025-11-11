// Google Configuration
export const GOOGLE_CONFIG = {
  // Google Sheets Configuration
  SPREADSHEET_ID:
    process.env.REACT_APP_GOOGLE_SPREADSHEET_ID ||
    "18B1PIhCDmBWyHZytvOcfj_1QbYBwczLf1x1Qbu0E5As",

  // Google API Configuration
  CLIENT_ID: process.env.REACT_APP_GOOGLE_CLIENT_ID || "your-google-client-id",

  // API Scopes
  SCOPES: [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive",
    "https://www.googleapis.com/auth/userinfo.profile",
    "https://www.googleapis.com/auth/userinfo.email",
  ],

  // Sheets Configuration
  SHEETS: {
    CARRIERS: "Carriers",
    TRANSPORTS: "Transports",
    WAREHOUSE: "Warehouse",
    STAFF: "Staff",
    PARTNERS: "Partners",
    SETTINGS: "Settings",
  },

  // Default Ranges
  RANGES: {
    ALL: "A:Z",
    HEADERS: "A1:Z1",
    DATA: "A2:Z",
  },

  // API Endpoints
  API: {
    SHEETS: "https://sheets.googleapis.com/v4/spreadsheets",
    DRIVE: "https://www.googleapis.com/drive/v3",
    AUTH: "https://accounts.google.com/o/oauth2/v2/auth",
  },
};

// Google Apps Script Configuration
export const APPS_SCRIPT_CONFIG = {
  SCRIPT_ID:
    process.env.REACT_APP_GOOGLE_APPS_SCRIPT_ID || "your-apps-script-id",
  FUNCTIONS: {
    GET_CARRIERS: "getCarriers",
    ADD_CARRIER: "addCarrier",
    UPDATE_CARRIER: "updateCarrier",
    DELETE_CARRIER: "deleteCarrier",
    GET_STATS: "getCarriersStats",
  },
};

// Environment Configuration
export const ENV_CONFIG = {
  NODE_ENV: process.env.NODE_ENV || "development",
  IS_DEVELOPMENT: process.env.NODE_ENV === "development",
  IS_PRODUCTION: process.env.NODE_ENV === "production",

  // Feature Flags - Sử dụng Google Sheets thực tế
  FEATURES: {
    GOOGLE_SHEETS: true, // Luôn bật Google Sheets
    GOOGLE_DRIVE: true, // Luôn bật Google Drive
    GOOGLE_APPS_SCRIPT: true, // Luôn bật Google Apps Script
    MOCK_DATA: false, // Tắt mock data, sử dụng Google Sheets thực tế
  },
};

// Default Spreadsheet Structure
export const DEFAULT_SPREADSHEET_STRUCTURE = {
  sheets: [
    {
      name: "Carriers",
      headers: [
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
        "createdAt",
        "updatedAt",
      ],
    },
    {
      name: "Transports",
      headers: [
        "transportId",
        "carrierId",
        "origin",
        "destination",
        "distance",
        "estimatedTime",
        "cost",
        "status",
        "createdAt",
        "updatedAt",
      ],
    },
    {
      name: "Warehouse",
      headers: [
        "itemId",
        "name",
        "category",
        "supplier",
        "stockQuantity",
        "unit",
        "unitPrice",
        "location",
        "expiryDate",
        "createdAt",
        "updatedAt",
      ],
    },
    {
      name: "Staff",
      headers: [
        "staffId",
        "name",
        "position",
        "department",
        "hireDate",
        "salary",
        "role",
        "isActive",
        "createdAt",
        "updatedAt",
      ],
    },
    {
      name: "Partners",
      headers: [
        "partnerId",
        "companyName",
        "contactPerson",
        "email",
        "phone",
        "address",
        "taxCode",
        "contractType",
        "isActive",
        "createdAt",
        "updatedAt",
      ],
    },
    {
      name: "Settings",
      headers: ["key", "value", "description", "category", "updatedAt"],
    },
  ],
};

export default GOOGLE_CONFIG;
