const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
// const rateLimit = require("express-rate-limit"); // Enable when needed for production
const createDOMPurify = require("dompurify");
const { JSDOM } = require("jsdom");
const hpp = require("hpp");
const compression = require("compression");
const path = require("path");
require("dotenv").config();

// DOMPurify setup (server-side)
const window = new JSDOM("").window;
const DOMPurify = createDOMPurify(window);

// Import main router (tổng hợp tất cả 16 route modules)
const apiRouter = require("./routes/router");

// Import routes for legacy paths (backward compatibility)
const inboundInternationalRoutes = require("./routes/inboundInternationalRoutes");
const inboundDomesticRoutes = require("./routes/inboundDomesticRoutes");
const googleSheetsAuthRoutes = require("./routes/googleSheetsAuthRoutes");

// Import middleware
const { securityHeaders } = require("./middleware/googleSheetsAuth");
const { globalErrorHandler } = require("./middleware/errorHandler");
const { prettyLogger } = require("./middleware/prettyLogger");

// Create Express app
const app = express();

// Set view engine for email templates
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

// Trust proxy (for rate limiting behind reverse proxy)
app.set("trust proxy", 1);

// Security middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
      },
    },
    crossOriginEmbedderPolicy: false,
  })
);

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      "http://localhost:3000",
      "http://localhost:5050",
      "https://mia-logistics.vercel.app",
      process.env.CORS_ORIGIN,
    ].filter(Boolean);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-CSRF-Token"],
};

app.use(cors(corsOptions));

// Rate limiting (apply to API only)
// const limiter = rateLimit({
//   windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000", 10),
//   max: parseInt(process.env.RATE_LIMIT_MAX_ATTEMPTS || "100", 10),
//   standardHeaders: true,
//   legacyHeaders: false,
// });

// app.use('/api/', limiter); // enable in production as needed

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Data sanitization against XSS
app.use((req, res, next) => {
  if (req.body) {
    try {
      req.body = JSON.parse(DOMPurify.sanitize(JSON.stringify(req.body)));
    } catch (_) {
      // ignore parse errors
    }
  }
  next();
});

// Prevent parameter pollution
app.use(hpp());

// Compression middleware
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV === "development") {
  app.use(prettyLogger);
} else {
  app.use(morgan("combined"));
}

// Custom security headers and optional request logger
app.use(securityHeaders);
// app.use(requestLogger);

// Static files
app.use("/uploads", express.static(path.join(__dirname, "../../uploads")));

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    version: process.env.npm_package_version || "1.0.0",
  });
});

// Root endpoint -> return health info (thuận tiện cho checks mặc định)
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    version: process.env.npm_package_version || "1.0.0",
  });
});

// API routes - Sử dụng main router (tổng hợp tất cả 16 route modules)
// Router này bao gồm:
// - Authentication & User Management (authRoutes)
// - Core Business (carriers, transfers, locations, transportRequests)
// - Settings & Volume Rules (settingsRoutes)
// - Inbound Management (inboundDomestic, inboundInternational)
// - RBAC System (roles, employees, rolePermissions)
// - Admin Operations (adminRoutes)
// - Utilities (telegram, googleSheets, googleSheetsAuth)
app.use("/api", apiRouter);

// Additional legacy paths for backward compatibility
// (Được giữ lại để đảm bảo client cũ vẫn hoạt động)

// Legacy inbound paths
app.use("/api/inboundinternational", inboundInternationalRoutes);
app.use("/api/inbound_international", inboundInternationalRoutes);
app.use("/api/inbounddomestic", inboundDomesticRoutes);

// Legacy Google Sheets Auth path
app.use("/api/auth-sheets", googleSheetsAuthRoutes);

// API Health check endpoint (additional to router's /api/health)
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    status: "OK",
    message: "MIA Logistics Manager API is running",
    timestamp: new Date().toISOString(),
    version: "2.1.0",
    environment: process.env.NODE_ENV || "development",
    service: "MIA Logistics Manager API",
    routes: {
      total: 16,
      modules: [
        "auth",
        "admin",
        "carriers",
        "transfers",
        "locations",
        "transport-requests",
        "employees",
        "roles",
        "role-permissions",
        "settings",
        "telegram",
        "sheets",
        "inbound/domestic",
        "inbound/international",
        "google-sheets-auth",
      ],
    },
  });
});

// 404 handler
app.all("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// Global error handler
app.use(globalErrorHandler);

module.exports = { app };
