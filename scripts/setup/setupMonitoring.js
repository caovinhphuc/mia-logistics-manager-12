// MIA Logistics Manager - Monitoring & Analytics Setup
// Setup monitoring, analytics và performance tracking

const fs = require('fs');
const path = require('path');

console.log('📊 MIA Logistics Manager - Monitoring & Analytics Setup');
console.log('=======================================================');
console.log('');

// Colors
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, colors.green);
}

function logWarning(message) {
  log(`⚠️  ${message}`, colors.yellow);
}

function logError(message) {
  log(`❌ ${message}`, colors.red);
}

function logInfo(message) {
  log(`ℹ️  ${message}`, colors.blue);
}

// Create Google Analytics setup
function createGoogleAnalytics() {
  logInfo('Creating Google Analytics setup...');

  try {
    // Add Google Analytics to index.html
    const indexHtmlPath = path.join(__dirname, '..', 'public', 'index.html');
    let indexContent = fs.readFileSync(indexHtmlPath, 'utf8');

    const googleAnalyticsScript = `
    <!-- Google Analytics -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'GA_MEASUREMENT_ID', {
        page_title: document.title,
        page_location: window.location.href,
        custom_map: {
          'custom_parameter_1': 'user_type',
          'custom_parameter_2': 'feature_used'
        }
      });
    </script>`;

    // Insert before closing head tag
    indexContent = indexContent.replace(
      '</head>',
      `${googleAnalyticsScript}\n  </head>`
    );

    fs.writeFileSync(indexHtmlPath, indexContent);
    logSuccess('Google Analytics script added to index.html');

    return true;
  } catch (error) {
    logError(`Google Analytics setup failed: ${error.message}`);
    return false;
  }
}

// Create Sentry error monitoring
function createSentryMonitoring() {
  logInfo('Creating Sentry error monitoring...');

  try {
    // Sentry configuration file
    const sentryConfig = `// Sentry Configuration
import * as Sentry from "@sentry/react";
import { Integrations } from "@sentry/tracing";

// Initialize Sentry
Sentry.init({
  dsn: process.env.REACT_APP_SENTRY_DSN || "YOUR_SENTRY_DSN_HERE",
  environment: process.env.NODE_ENV,
  integrations: [
    new Integrations.BrowserTracing(),
  ],
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  beforeSend(event) {
    // Filter out development errors
    if (process.env.NODE_ENV === 'development') {
      return null;
    }
    return event;
  },
  beforeBreadcrumb(breadcrumb) {
    // Filter out sensitive data
    if (breadcrumb.category === 'console' && breadcrumb.level === 'error') {
      return null;
    }
    return breadcrumb;
  }
});

export default Sentry;`;

    fs.writeFileSync(path.join(__dirname, '..', 'src', 'utils', 'sentry.js'), sentryConfig);
    logSuccess('Sentry configuration created');

    // Update index.js to include Sentry
    const indexJsPath = path.join(__dirname, '..', 'src', 'index.js');
    let indexJsContent = fs.readFileSync(indexJsPath, 'utf8');

    // Add Sentry import at the top
    if (!indexJsContent.includes('sentry')) {
      indexJsContent = `import './utils/sentry';\n${indexJsContent}`;
      fs.writeFileSync(indexJsPath, indexJsContent);
      logSuccess('Sentry imported in index.js');
    }

    return true;
  } catch (error) {
    logError(`Sentry monitoring setup failed: ${error.message}`);
    return false;
  }
}

// Create performance monitoring
function createPerformanceMonitoring() {
  logInfo('Creating performance monitoring...');

  try {
    // Web Vitals monitoring
    const performanceConfig = `// Performance Monitoring with Web Vitals
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

// Send metrics to analytics service
function sendToAnalytics(metric) {
  const body = JSON.stringify(metric);

  // Send to Google Analytics
  if (window.gtag) {
    window.gtag('event', metric.name, {
      event_category: 'Web Vitals',
      event_label: metric.id,
      value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
      non_interaction: true,
    });
  }

  // Send to custom analytics endpoint
  if (process.env.REACT_APP_ANALYTICS_ENDPOINT) {
    fetch(process.env.REACT_APP_ANALYTICS_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: body,
    }).catch(console.error);
  }

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log('Web Vital:', metric);
  }
}

// Initialize Web Vitals monitoring
function initPerformanceMonitoring() {
  getCLS(sendToAnalytics);
  getFID(sendToAnalytics);
  getFCP(sendToAnalytics);
  getLCP(sendToAnalytics);
  getTTFB(sendToAnalytics);

  // Additional performance metrics
  if ('performance' in window) {
    // Monitor page load time
    window.addEventListener('load', () => {
      const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
      sendToAnalytics({
        name: 'PageLoadTime',
        value: loadTime,
        id: 'page-load',
        delta: loadTime,
        entries: []
      });
    });

    // Monitor memory usage (if available)
    if ('memory' in performance) {
      const memoryInfo = performance.memory;
      sendToAnalytics({
        name: 'MemoryUsage',
        value: memoryInfo.usedJSHeapSize / 1024 / 1024, // MB
        id: 'memory-usage',
        delta: memoryInfo.usedJSHeapSize / 1024 / 1024,
        entries: []
      });
    }
  }
}

export { initPerformanceMonitoring, sendToAnalytics };`;

    fs.writeFileSync(path.join(__dirname, '..', 'src', 'utils', 'performance.js'), performanceConfig);
    logSuccess('Performance monitoring created');

    // Update index.js to initialize performance monitoring
    const indexJsPath = path.join(__dirname, '..', 'src', 'index.js');
    let indexJsContent = fs.readFileSync(indexJsPath, 'utf8');

    // Add performance monitoring import and initialization
    if (!indexJsContent.includes('performance')) {
      indexJsContent = indexJsContent.replace(
        "import './utils/sentry';",
        `import './utils/sentry';\nimport { initPerformanceMonitoring } from './utils/performance';\n\n// Initialize performance monitoring\ninitPerformanceMonitoring();`
      );
      fs.writeFileSync(indexJsPath, indexJsContent);
      logSuccess('Performance monitoring initialized in index.js');
    }

    return true;
  } catch (error) {
    logError(`Performance monitoring setup failed: ${error.message}`);
    return false;
  }
}

// Create custom analytics service
function createCustomAnalytics() {
  logInfo('Creating custom analytics service...');

  try {
    const analyticsService = `// Custom Analytics Service
class AnalyticsService {
  constructor() {
    this.endpoint = process.env.REACT_APP_ANALYTICS_ENDPOINT;
    this.apiKey = process.env.REACT_APP_ANALYTICS_API_KEY;
    this.sessionId = this.generateSessionId();
    this.startTime = Date.now();
  }

  generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // Track page views
  trackPageView(pageName, pageUrl) {
    this.sendEvent('page_view', {
      page_name: pageName,
      page_url: pageUrl,
      session_id: this.sessionId,
      timestamp: new Date().toISOString(),
      user_agent: navigator.userAgent,
      referrer: document.referrer
    });
  }

  // Track user actions
  trackEvent(eventName, eventData = {}) {
    this.sendEvent(eventName, {
      ...eventData,
      session_id: this.sessionId,
      timestamp: new Date().toISOString(),
      page_url: window.location.href,
      page_title: document.title
    });
  }

  // Track Google API usage
  trackGoogleAPIUsage(apiName, operation, success, responseTime, errorMessage = null) {
    this.sendEvent('google_api_usage', {
      api_name: apiName,
      operation: operation,
      success: success,
      response_time: responseTime,
      error_message: errorMessage,
      session_id: this.sessionId,
      timestamp: new Date().toISOString()
    });
  }

  // Track business metrics
  trackBusinessMetric(metricName, value, metadata = {}) {
    this.sendEvent('business_metric', {
      metric_name: metricName,
      value: value,
      metadata: metadata,
      session_id: this.sessionId,
      timestamp: new Date().toISOString()
    });
  }

  // Track errors
  trackError(error, context = {}) {
    this.sendEvent('error', {
      error_message: error.message,
      error_stack: error.stack,
      error_name: error.name,
      context: context,
      session_id: this.sessionId,
      timestamp: new Date().toISOString(),
      page_url: window.location.href,
      user_agent: navigator.userAgent
    });
  }

  // Send event to analytics endpoint
  sendEvent(eventType, eventData) {
    if (!this.endpoint) {
      // Log to console in development
      if (process.env.NODE_ENV === 'development') {
        console.log('Analytics Event:', eventType, eventData);
      }
      return;
    }

    const payload = {
      event_type: eventType,
      data: eventData,
      api_key: this.apiKey
    };

    fetch(this.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    }).catch(error => {
      console.error('Analytics error:', error);
    });
  }

  // Track session end
  trackSessionEnd() {
    const sessionDuration = Date.now() - this.startTime;
    this.trackEvent('session_end', {
      session_duration: sessionDuration,
      session_id: this.sessionId
    });
  }
}

// Create singleton instance
const analytics = new AnalyticsService();

// Track session end when page unloads
window.addEventListener('beforeunload', () => {
  analytics.trackSessionEnd();
});

export default analytics;`;

    fs.writeFileSync(path.join(__dirname, '..', 'src', 'services', 'analyticsService.js'), analyticsService);
    logSuccess('Custom analytics service created');

    return true;
  } catch (error) {
    logError(`Custom analytics setup failed: ${error.message}`);
    return false;
  }
}

// Create monitoring dashboard configuration
function createMonitoringDashboard() {
  logInfo('Creating monitoring dashboard configuration...');

  try {
    // Monitoring configuration
    const monitoringConfig = `// Monitoring Dashboard Configuration
export const MONITORING_CONFIG = {
  // Google Analytics
  GOOGLE_ANALYTICS: {
    MEASUREMENT_ID: process.env.REACT_APP_GA_MEASUREMENT_ID || 'GA_MEASUREMENT_ID',
    ENABLED: process.env.REACT_APP_ENABLE_GA === 'true'
  },

  // Sentry Error Monitoring
  SENTRY: {
    DSN: process.env.REACT_APP_SENTRY_DSN || 'YOUR_SENTRY_DSN_HERE',
    ENABLED: process.env.REACT_APP_ENABLE_SENTRY === 'true',
    ENVIRONMENT: process.env.NODE_ENV,
    SAMPLE_RATE: process.env.NODE_ENV === 'production' ? 0.1 : 1.0
  },

  // Custom Analytics
  CUSTOM_ANALYTICS: {
    ENDPOINT: process.env.REACT_APP_ANALYTICS_ENDPOINT,
    API_KEY: process.env.REACT_APP_ANALYTICS_API_KEY,
    ENABLED: process.env.REACT_APP_ENABLE_CUSTOM_ANALYTICS === 'true'
  },

  // Performance Monitoring
  PERFORMANCE: {
    ENABLED: process.env.REACT_APP_ENABLE_PERFORMANCE_MONITORING === 'true',
    SAMPLE_RATE: process.env.NODE_ENV === 'production' ? 0.1 : 1.0
  },

  // Business Metrics
  BUSINESS_METRICS: {
    ENABLED: process.env.REACT_APP_ENABLE_BUSINESS_METRICS === 'true',
    TRACK_USER_ACTIONS: true,
    TRACK_API_USAGE: true,
    TRACK_ERRORS: true,
    TRACK_PERFORMANCE: true
  }
};

// Dashboard metrics configuration
export const DASHBOARD_METRICS = {
  // User metrics
  USER_METRICS: [
    'active_users',
    'new_users',
    'session_duration',
    'page_views',
    'bounce_rate'
  ],

  // API metrics
  API_METRICS: [
    'google_sheets_api_calls',
    'google_drive_api_calls',
    'google_maps_api_calls',
    'api_response_time',
    'api_error_rate'
  ],

  // Performance metrics
  PERFORMANCE_METRICS: [
    'page_load_time',
    'first_contentful_paint',
    'largest_contentful_paint',
    'cumulative_layout_shift',
    'first_input_delay'
  ],

  // Business metrics
  BUSINESS_METRICS: [
    'transport_requests_created',
    'warehouse_items_managed',
    'staff_actions_performed',
    'partner_interactions',
    'vehicle_utilization'
  ]
};

// Alert thresholds
export const ALERT_THRESHOLDS = {
  API_ERROR_RATE: 0.05, // 5%
  API_RESPONSE_TIME: 5000, // 5 seconds
  PAGE_LOAD_TIME: 3000, // 3 seconds
  MEMORY_USAGE: 100, // 100 MB
  ERROR_COUNT: 10 // 10 errors per hour
};`;

    fs.writeFileSync(path.join(__dirname, '..', 'src', 'config', 'monitoring.js'), monitoringConfig);
    logSuccess('Monitoring dashboard configuration created');

    return true;
  } catch (error) {
    logError(`Monitoring dashboard setup failed: ${error.message}`);
    return false;
  }
}

// Create monitoring hooks
function createMonitoringHooks() {
  logInfo('Creating monitoring hooks...');

  try {
    // Custom hook for analytics
    const analyticsHook = `// Custom hook for analytics
import { useEffect } from 'react';
import analytics from '../services/analyticsService';
import { MONITORING_CONFIG } from '../config/monitoring';

export const useAnalytics = () => {
  useEffect(() => {
    if (MONITORING_CONFIG.CUSTOM_ANALYTICS.ENABLED) {
      analytics.trackPageView(
        document.title,
        window.location.href
      );
    }
  }, []);

  const trackEvent = (eventName, eventData) => {
    if (MONITORING_CONFIG.CUSTOM_ANALYTICS.ENABLED) {
      analytics.trackEvent(eventName, eventData);
    }
  };

  const trackGoogleAPIUsage = (apiName, operation, success, responseTime, errorMessage) => {
    if (MONITORING_CONFIG.BUSINESS_METRICS.ENABLED) {
      analytics.trackGoogleAPIUsage(apiName, operation, success, responseTime, errorMessage);
    }
  };

  const trackBusinessMetric = (metricName, value, metadata) => {
    if (MONITORING_CONFIG.BUSINESS_METRICS.ENABLED) {
      analytics.trackBusinessMetric(metricName, value, metadata);
    }
  };

  const trackError = (error, context) => {
    if (MONITORING_CONFIG.BUSINESS_METRICS.ENABLED) {
      analytics.trackError(error, context);
    }
  };

  return {
    trackEvent,
    trackGoogleAPIUsage,
    trackBusinessMetric,
    trackError
  };
};`;

    fs.writeFileSync(path.join(__dirname, '..', 'src', 'hooks', 'useAnalytics.js'), analyticsHook);
    logSuccess('Analytics hook created');

    return true;
  } catch (error) {
    logError(`Monitoring hooks setup failed: ${error.message}`);
    return false;
  }
}

// Update environment variables
function updateEnvironmentVariables() {
  logInfo('Updating environment variables for monitoring...');

  try {
    const envPath = path.join(__dirname, '..', '.env');
    let envContent = fs.readFileSync(envPath, 'utf8');

    const monitoringVars = `
# Monitoring & Analytics Configuration
REACT_APP_ENABLE_GA=true
REACT_APP_GA_MEASUREMENT_ID=GA_MEASUREMENT_ID
REACT_APP_ENABLE_SENTRY=true
REACT_APP_SENTRY_DSN=YOUR_SENTRY_DSN_HERE
REACT_APP_ENABLE_CUSTOM_ANALYTICS=true
REACT_APP_ANALYTICS_ENDPOINT=YOUR_ANALYTICS_ENDPOINT_HERE
REACT_APP_ANALYTICS_API_KEY=YOUR_ANALYTICS_API_KEY_HERE
REACT_APP_ENABLE_PERFORMANCE_MONITORING=true
REACT_APP_ENABLE_BUSINESS_METRICS=true`;

    if (!envContent.includes('REACT_APP_ENABLE_GA')) {
      envContent += monitoringVars;
      fs.writeFileSync(envPath, envContent);
      logSuccess('Monitoring environment variables added');
    } else {
      logSuccess('Monitoring environment variables already exist');
    }

    return true;
  } catch (error) {
    logError(`Environment variables update failed: ${error.message}`);
    return false;
  }
}

// Main monitoring setup function
function main() {
  log('📊 MIA Logistics Manager - Monitoring & Analytics Setup', colors.cyan);
  log('=======================================================', colors.cyan);
  log('');

  const steps = [
    { name: 'Google Analytics', fn: createGoogleAnalytics },
    { name: 'Sentry Monitoring', fn: createSentryMonitoring },
    { name: 'Performance Monitoring', fn: createPerformanceMonitoring },
    { name: 'Custom Analytics', fn: createCustomAnalytics },
    { name: 'Monitoring Dashboard', fn: createMonitoringDashboard },
    { name: 'Monitoring Hooks', fn: createMonitoringHooks },
    { name: 'Environment Variables', fn: updateEnvironmentVariables }
  ];

  let successCount = 0;

  steps.forEach((step, index) => {
    log(`\n${index + 1}. ${step.name}...`, colors.magenta);
    if (step.fn()) {
      successCount++;
    }
  });

  log('\n📊 Monitoring Setup Summary:', colors.cyan);
  log('=============================', colors.cyan);
  log(`Completed: ${successCount}/${steps.length} steps`);

  if (successCount === steps.length) {
    logSuccess('Monitoring & Analytics setup completed successfully!');
    log('');
    log('🚀 Next steps:', colors.yellow);
    log('1. Configure Google Analytics Measurement ID');
    log('2. Setup Sentry account and DSN');
    log('3. Configure custom analytics endpoint');
    log('4. Test monitoring in development');
    log('5. Deploy and verify monitoring in production');
    log('');
    log('📚 Available monitoring:', colors.blue);
    log('- Google Analytics: Page views, user behavior');
    log('- Sentry: Error tracking and performance');
    log('- Web Vitals: Core web vitals metrics');
    log('- Custom Analytics: Business metrics');
    log('- Performance Monitoring: Page load times');
  } else {
    logError('Some monitoring setup steps failed. Please check the errors above.');
  }
}

// Run monitoring setup
main();
