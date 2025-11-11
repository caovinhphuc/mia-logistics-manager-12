/**
 * MIA Logistics Manager - Enhanced Logging Service
 * Centralized logging with levels and filtering
 */

class Logger {
  constructor() {
    this.logLevel = this.getLogLevel();
    this.isDevelopment = process.env.NODE_ENV === 'development';
    this.isProduction = process.env.NODE_ENV === 'production';
    this.enablePerformanceMonitoring = process.env.REACT_APP_ENABLE_PERFORMANCE_MONITORING !== 'false';
    this.enableMockModeMessages = process.env.REACT_APP_ENABLE_MOCK_MODE_MESSAGES === 'true';

    // Log levels
    this.levels = {
      ERROR: 0,
      WARN: 1,
      INFO: 2,
      DEBUG: 3
    };

    // Performance tracking
    this.performanceMetrics = new Map();
    this.startTime = Date.now();

    // Filter out common warnings
    this.filteredWarnings = [
      'React Router Future Flag Warning',
      'React Router will begin wrapping state updates',
      'Relative route resolution within Splat routes is changing',
      'An iframe which has both allow-scripts and allow-same-origin for its sandbox attribute can escape its sandboxing',
      'cb=gapi.loaded_0',
      'gapi.loaded_0'
    ];

    // Override console.warn and console.error to filter out unwanted warnings
    this.setupWarningFilter();
  }

  setupWarningFilter() {
    if (this.isDevelopment) {
      const originalWarn = console.warn;
      const originalError = console.error;

      console.warn = (...args) => {
        const message = args.join(' ');
        const shouldFilter = this.filteredWarnings.some(filter =>
          message.includes(filter)
        ) || this.isGoogleAPIWarning(message);

        if (!shouldFilter) {
          originalWarn.apply(console, args);
        }
      };

      console.error = (...args) => {
        const message = args.join(' ');
        const shouldFilter = this.isGoogleAPIWarning(message);

        if (!shouldFilter) {
          originalError.apply(console, args);
        }
      };
    }
  }

  // Check if warning is from Google API
  isGoogleAPIWarning(message) {
    return message.includes('cb=gapi.loaded') ||
           message.includes('gapi.loaded') ||
           message.includes('fedcm_migration') ||
           message.includes('allow-scripts and allow-same-origin') ||
           message.includes('An iframe which has both allow-scripts and allow-same-origin') ||
           message.includes('_.g.VB') ||
           message.includes('Eu.VB') ||
           message.includes('_.rv') ||
           message.includes('_.vv') ||
           message.includes('_.Bv') ||
           message.includes('rx.OI') ||
           message.includes('_.zx') ||
           message.includes('m_migration_mod');
  }

  getLogLevel() {
    const envLevel = process.env.REACT_APP_LOG_LEVEL || 'info';
    const levelMap = {
      'error': 0,
      'warn': 1,
      'info': 2,
      'debug': 3
    };
    return levelMap[envLevel.toLowerCase()] || 2;
  }

  shouldLog(level) {
    return level <= this.logLevel;
  }

  formatMessage(level, category, message, data = null) {
    const timestamp = new Date().toISOString();
    const levelName = Object.keys(this.levels)[level];

    let formattedMessage = `[${timestamp}] ${levelName} [${category}] ${message}`;

    if (data) {
      formattedMessage += ` ${JSON.stringify(data)}`;
    }

    return formattedMessage;
  }

  getEmoji(level) {
    const emojis = {
      0: '❌', // ERROR
      1: '⚠️', // WARN
      2: '✅', // INFO
      3: '🔍'  // DEBUG
    };
    return emojis[level] || '📝';
  }

  log(level, category, message, data = null) {
    if (!this.shouldLog(level)) return;

    const emoji = this.getEmoji(level);
    const formattedMessage = this.formatMessage(level, category, message, data);

    // Use appropriate console method
    switch (level) {
      case 0: // ERROR
        console.error(emoji, formattedMessage);
        break;
      case 1: // WARN
        console.warn(emoji, formattedMessage);
        break;
      case 2: // INFO
        console.log(emoji, formattedMessage);
        break;
      case 3: // DEBUG
        console.log(emoji, formattedMessage);
        break;
      default:
        console.log(emoji, formattedMessage);
    }
  }

  // Convenience methods
  error(category, message, data = null) {
    this.log(this.levels.ERROR, category, message, data);
  }

  warn(category, message, data = null) {
    this.log(this.levels.WARN, category, message, data);
  }

  info(category, message, data = null) {
    this.log(this.levels.INFO, category, message, data);
  }

  debug(category, message, data = null) {
    this.log(this.levels.DEBUG, category, message, data);
  }

  // Performance monitoring
  startTimer(operation) {
    if (!this.enablePerformanceMonitoring) return;
    this.performanceMetrics.set(operation, Date.now());
  }

  endTimer(operation) {
    if (!this.enablePerformanceMonitoring) return;

    const startTime = this.performanceMetrics.get(operation);
    if (startTime) {
      const duration = Date.now() - startTime;
      this.performanceMetrics.delete(operation);

      if (duration > 100) { // Only log operations taking more than 100ms
        this.info('PERFORMANCE', `${operation} completed`, { duration: `${duration}ms` });
      }
    }
  }

  // Service-specific logging methods
  googleAuth(message, data = null) {
    this.info('GOOGLE_AUTH', message, data);
  }

  googleSheets(message, data = null) {
    this.info('GOOGLE_SHEETS', message, data);
  }

  googleAppsScript(message, data = null) {
    this.info('GOOGLE_APPS_SCRIPT', message, data);
  }

  mockMode(message, data = null) {
    if (this.enableMockModeMessages) {
      this.info('MOCK_MODE', message, data);
    } else {
      // Still log to console but without the logger format for debugging
      if (this.isDevelopment) {
        console.debug(`[MOCK_MODE] ${message}`, data);
      }
    }
  }

  system(message, data = null) {
    this.info('SYSTEM', message, data);
  }

  // Clean logging for production
  cleanLog(level, message, data = null) {
    if (this.isProduction && level >= this.levels.WARN) {
      return; // Don't log warnings/errors in production
    }

    this.log(level, 'CLEAN', message, data);
  }

  // Batch logging
  batchLog(logs) {
    logs.forEach(({ level, category, message, data }) => {
      this.log(level, category, message, data);
    });
  }

  // Clear console in development
  clearConsole() {
    if (this.isDevelopment) {
      console.clear();
      this.system('Console cleared for better development experience');
    }
  }

  // Toggle mock mode messages
  setMockModeMessages(enabled) {
    this.enableMockModeMessages = enabled;
  }

  // Get performance summary
  getPerformanceSummary() {
    const uptime = Date.now() - this.startTime;
    return {
      uptime: `${Math.round(uptime / 1000)}s`,
      activeOperations: this.performanceMetrics.size,
      logLevel: Object.keys(this.levels)[this.logLevel]
    };
  }

  // Enable/disable warning filtering
  setWarningFiltering(enabled) {
    this.setupWarningFilter();
  }

  // Add custom warning filter
  addWarningFilter(filter) {
    this.filteredWarnings.push(filter);
  }

  // Remove warning filter
  removeWarningFilter(filter) {
    this.filteredWarnings = this.filteredWarnings.filter(f => f !== filter);
  }
}

// Create singleton instance
const logger = new Logger();

// Export convenience methods
export const log = {
  error: (category, message, data) => logger.error(category, message, data),
  warn: (category, message, data) => logger.warn(category, message, data),
  info: (category, message, data) => logger.info(category, message, data),
  debug: (category, message, data) => logger.debug(category, message, data),

  // Service-specific
  googleAuth: (message, data) => logger.googleAuth(message, data),
  googleSheets: (message, data) => logger.googleSheets(message, data),
  googleAppsScript: (message, data) => logger.googleAppsScript(message, data),
  mockMode: (message, data) => logger.mockMode(message, data),
  system: (message, data) => logger.system(message, data),

  // Performance
  startTimer: (operation) => logger.startTimer(operation),
  endTimer: (operation) => logger.endTimer(operation),

  // Utility
  clearConsole: () => logger.clearConsole(),
  getPerformanceSummary: () => logger.getPerformanceSummary(),

  // Warning filtering
  setWarningFiltering: (enabled) => logger.setWarningFiltering(enabled),
  addWarningFilter: (filter) => logger.addWarningFilter(filter),
  removeWarningFilter: (filter) => logger.removeWarningFilter(filter),

  // Mock mode messages
  setMockModeMessages: (enabled) => logger.setMockModeMessages(enabled)
};

export default logger;
