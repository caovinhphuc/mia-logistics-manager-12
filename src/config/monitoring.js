// Monitoring Dashboard Configuration
export const MONITORING_CONFIG = {
  // Google Analytics
  GOOGLE_ANALYTICS: {
    MEASUREMENT_ID:
      process.env.REACT_APP_GA_MEASUREMENT_ID || "GA_MEASUREMENT_ID",
    ENABLED: process.env.REACT_APP_ENABLE_GA === "true",
  },

  // Sentry Error Monitoring
  SENTRY: {
    DSN: process.env.REACT_APP_SENTRY_DSN || "YOUR_SENTRY_DSN_HERE",
    ENABLED: process.env.REACT_APP_ENABLE_SENTRY === "true",
    ENVIRONMENT: process.env.NODE_ENV,
    SAMPLE_RATE: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
  },

  // Custom Analytics
  CUSTOM_ANALYTICS: {
    ENDPOINT: process.env.REACT_APP_ANALYTICS_ENDPOINT,
    API_KEY: process.env.REACT_APP_ANALYTICS_API_KEY,
    ENABLED: process.env.REACT_APP_ENABLE_CUSTOM_ANALYTICS === "true",
  },

  // Performance Monitoring
  PERFORMANCE: {
    ENABLED: process.env.REACT_APP_ENABLE_PERFORMANCE_MONITORING === "true",
    SAMPLE_RATE: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
  },

  // Business Metrics
  BUSINESS_METRICS: {
    ENABLED: process.env.REACT_APP_ENABLE_BUSINESS_METRICS === "true",
    TRACK_USER_ACTIONS: true,
    TRACK_API_USAGE: true,
    TRACK_ERRORS: true,
    TRACK_PERFORMANCE: true,
  },
};

// Dashboard metrics configuration
export const DASHBOARD_METRICS = {
  // User metrics
  USER_METRICS: [
    "active_users",
    "new_users",
    "session_duration",
    "page_views",
    "bounce_rate",
  ],

  // API metrics
  API_METRICS: [
    "google_sheets_api_calls",
    "google_drive_api_calls",
    "google_maps_api_calls",
    "api_response_time",
    "api_error_rate",
  ],

  // Performance metrics
  PERFORMANCE_METRICS: [
    "page_load_time",
    "first_contentful_paint",
    "largest_contentful_paint",
    "cumulative_layout_shift",
    "first_input_delay",
  ],

  // Business metrics
  BUSINESS_METRICS: [
    "transport_requests_created",
    "warehouse_items_managed",
    "staff_actions_performed",
    "partner_interactions",
    "vehicle_utilization",
  ],
};

// Alert thresholds
export const ALERT_THRESHOLDS = {
  API_ERROR_RATE: 0.05, // 5%
  API_RESPONSE_TIME: 5000, // 5 seconds
  PAGE_LOAD_TIME: 3000, // 3 seconds
  MEMORY_USAGE: 100, // 100 MB
  ERROR_COUNT: 10, // 10 errors per hour
};
