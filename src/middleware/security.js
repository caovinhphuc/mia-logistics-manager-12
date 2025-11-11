// API Security Middleware
import analytics from "../services/analyticsService";

// Rate limiting configuration
const RATE_LIMITS = {
  googleSheets: {
    requests: 100,
    window: 60000, // 1 minute
    blockDuration: 300000, // 5 minutes
  },
  googleDrive: {
    requests: 100,
    window: 60000,
    blockDuration: 300000,
  },
  googleMaps: {
    requests: 1000,
    window: 60000,
    blockDuration: 600000, // 10 minutes
  },
};

// Track API usage for rate limiting
const apiUsage = new Map();

// Rate limiting middleware
export const rateLimitMiddleware = (apiName) => {
  return (req, res, next) => {
    const clientId = req.headers["x-client-id"] || req.ip;
    const now = Date.now();
    const limit = RATE_LIMITS[apiName];

    if (!limit) {
      return next();
    }

    const key = `${apiName}:${clientId}`;
    const usage = apiUsage.get(key) || {
      count: 0,
      resetTime: now + limit.window,
    };

    // Reset counter if window has passed
    if (now > usage.resetTime) {
      usage.count = 0;
      usage.resetTime = now + limit.window;
    }

    // Check if limit exceeded
    if (usage.count >= limit.requests) {
      analytics.trackEvent("rate_limit_exceeded", {
        api_name: apiName,
        client_id: clientId,
        limit: limit.requests,
        window: limit.window,
      });

      return res.status(429).json({
        error: "Rate limit exceeded",
        message: `Too many requests to ${apiName} API`,
        retryAfter: Math.ceil((usage.resetTime - now) / 1000),
      });
    }

    // Increment counter
    usage.count++;
    apiUsage.set(key, usage);

    // Track API usage
    analytics.trackGoogleAPIUsage(apiName, req.method, true, 0);

    next();
  };
};

// Input validation middleware
export const validateInputMiddleware = (schema) => {
  return (req, res, next) => {
    const validation = validateFormData(req.body, schema);

    if (!validation.isValid) {
      analytics.trackEvent("validation_error", {
        errors: validation.errors,
        endpoint: req.path,
      });

      return res.status(400).json({
        error: "Validation failed",
        errors: validation.errors,
      });
    }

    req.body = validation.data;
    next();
  };
};

// Security headers middleware
export const securityHeadersMiddleware = (req, res, next) => {
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()",
  );

  next();
};

// CORS configuration
export const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      "http://localhost:3000",
      "http://localhost:3001",
      "https://mialogistics.com",
      "https://www.mialogistics.com",
    ];

    // Allow requests with no origin (mobile apps, etc.)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Client-ID"],
};

// Error handling middleware
export const errorHandlingMiddleware = (err, req, res, next) => {
  // Log error
  analytics.trackError(err, {
    endpoint: req.path,
    method: req.method,
    userAgent: req.headers["user-agent"],
  });

  // Don't leak error details in production
  const isDevelopment = process.env.NODE_ENV === "development";

  res.status(err.status || 500).json({
    error: isDevelopment ? err.message : "Internal server error",
    ...(isDevelopment && { stack: err.stack }),
  });
};
