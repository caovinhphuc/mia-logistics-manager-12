/**
 * 📋 CENTRALIZED LOGGER
 * Thay thế tất cả console.log/error/warn statements
 * Hỗ trợ development và production environments
 */

class Logger {
  constructor() {
    this.isDev = process.env.NODE_ENV === 'development';
    this.isTest = process.env.NODE_ENV === 'test';
    this.enableConsole = this.isDev || this.isTest;
  }

  /**
   * Log error messages
   * @param {string} message - Error message
   * @param {object} data - Additional error data
   */
  error(message, data = {}) {
    const logData = {
      level: 'ERROR',
      message,
      data,
      timestamp: new Date().toISOString(),
      url: window?.location?.href || 'server',
    };

    if (this.enableConsole) {
      console.error('🚨 ERROR:', message, data);
    }

    // Send to monitoring service in production
    if (!this.isDev) {
      this.sendToMonitoring(logData);
    }
  }

  /**
   * Log warning messages
   * @param {string} message - Warning message
   * @param {object} data - Additional data
   */
  warn(message, data = {}) {
    const logData = {
      level: 'WARN',
      message,
      data,
      timestamp: new Date().toISOString(),
    };

    if (this.enableConsole) {
      console.warn('⚠️ WARN:', message, data);
    }

    if (!this.isDev) {
      this.sendToMonitoring(logData);
    }
  }

  /**
   * Log info messages
   * @param {string} message - Info message
   * @param {object} data - Additional data
   */
  info(message, data = {}) {
    const logData = {
      level: 'INFO',
      message,
      data,
      timestamp: new Date().toISOString(),
    };

    if (this.enableConsole) {
      console.info('ℹ️ INFO:', message, data);
    }
  }

  /**
   * Log success messages
   * @param {string} message - Success message
   * @param {object} data - Additional data
   */
  success(message, data = {}) {
    if (this.enableConsole) {
      console.log('✅ SUCCESS:', message, data);
    }
  }

  /**
   * Log debug messages (development only)
   * @param {string} message - Debug message
   * @param {object} data - Additional data
   */
  debug(message, data = {}) {
    if (this.isDev) {
      console.log('🐛 DEBUG:', message, data);
    }
  }

  /**
   * Log API calls
   * @param {string} method - HTTP method
   * @param {string} url - API endpoint
   * @param {object} options - Request options
   */
  api(method, url, options = {}) {
    if (this.isDev) {
      console.log('🌐 API:', method, url, options);
    }
  }

  /**
   * Log performance metrics
   * @param {string} operation - Operation name
   * @param {number} duration - Duration in ms
   * @param {object} data - Additional metrics
   */
  performance(operation, duration, data = {}) {
    const logData = {
      operation,
      duration,
      data,
      timestamp: new Date().toISOString(),
    };

    if (this.enableConsole) {
      console.log('⚡ PERF:', `${operation} took ${duration}ms`, data);
    }

    // Always send performance data for monitoring
    this.sendToMonitoring({ level: 'PERFORMANCE', ...logData });
  }

  /**
   * Send logs to monitoring service (production)
   * @param {object} logData - Log data to send
   */
  sendToMonitoring(logData) {
    try {
      // Send to your monitoring service (e.g., Sentry, LogRocket, etc.)
      // For now, store in localStorage as fallback
      const logs = JSON.parse(localStorage.getItem('mia_logs') || '[]');
      logs.push(logData);

      // Keep only last 100 logs
      if (logs.length > 100) {
        logs.splice(0, logs.length - 100);
      }

      localStorage.setItem('mia_logs', JSON.stringify(logs));
    } catch (error) {
      // Fallback to console if monitoring fails
      console.error('Failed to send log to monitoring:', error);
    }
  }

  /**
   * Get stored logs for debugging
   * @returns {Array} Array of log entries
   */
  getLogs() {
    try {
      return JSON.parse(localStorage.getItem('mia_logs') || '[]');
    } catch (error) {
      return [];
    }
  }

  /**
   * Clear stored logs
   */
  clearLogs() {
    try {
      localStorage.removeItem('mia_logs');
    } catch (error) {
      console.error('Failed to clear logs:', error);
    }
  }

  /**
   * Group related log messages
   * @param {string} groupName - Group name
   */
  group(groupName) {
    if (this.enableConsole) {
      console.group(`📁 ${groupName}`);
    }
  }

  /**
   * End log group
   */
  groupEnd() {
    if (this.enableConsole) {
      console.groupEnd();
    }
  }

  /**
   * Time an operation
   * @param {string} label - Timer label
   */
  time(label) {
    if (this.enableConsole) {
      console.time(`⏱️ ${label}`);
    }
  }

  /**
   * End timing an operation
   * @param {string} label - Timer label
   */
  timeEnd(label) {
    if (this.enableConsole) {
      console.timeEnd(`⏱️ ${label}`);
    }
  }
}

// Create singleton instance
export const logger = new Logger();

// Export for backwards compatibility
export default logger;

// Helper for quick development logging
export const log = {
  e: (message, data) => logger.error(message, data),
  w: (message, data) => logger.warn(message, data),
  i: (message, data) => logger.info(message, data),
  s: (message, data) => logger.success(message, data),
  d: (message, data) => logger.debug(message, data),
};

// Development helpers
if (process.env.NODE_ENV === 'development') {
  // Add logger to window for debugging
  window.logger = logger;
  window.log = log;

  // Add shortcut to view logs
  window.viewLogs = () => {
    console.table(logger.getLogs());
  };
}
