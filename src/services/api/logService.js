import { googleSheetsService } from '../google/googleSheetsService';

class LogService {
  constructor() {
    this.logLevel = process.env.REACT_APP_LOG_LEVEL || 'info';
    this.logToConsole = process.env.REACT_APP_LOG_TO_CONSOLE !== 'false';
    this.logToGoogleSheets = process.env.REACT_APP_LOG_TO_GOOGLE_SHEETS === 'true';
    this.logToLocalStorage = process.env.REACT_APP_LOG_TO_LOCAL_STORAGE !== 'false';
    this.localLogKey = 'mia-logs';
    this.maxLocalLogs = parseInt(process.env.REACT_APP_MAX_LOCAL_LOGS) || 1000;
    this.logRetentionDays = parseInt(process.env.REACT_APP_LOG_RETENTION_DAYS) || 7;
    this.batchSize = parseInt(process.env.REACT_APP_LOG_BATCH_SIZE) || 50;

    // Log levels
    this.levels = {
      error: 0,
      warn: 1,
      info: 2,
      debug: 3,
      trace: 4,
    };

    // Performance tracking
    this.performanceMetrics = new Map();
    this.startTime = Date.now();

    // Log batching for Google Sheets
    this.logBatch = [];
    this.batchTimeout = null;
    this.batchDelay = 5000; // 5 seconds

    // Initialize real-time logging in development
    if (process.env.NODE_ENV === 'development') {
      this.startRealTimeLogging();
    }
  }

  log(category, message, data = {}, level = 'info', options = {}) {
    try {
      const {
        skipConsole = false,
        skipStorage = false,
        skipGoogleSheets = false,
        tags = [],
        correlationId = null,
        performance = false
      } = options;

      // Check if we should log this level
      if (this.levels[level] > this.levels[this.logLevel]) {
        return null;
      }

    const logEntry = {
        id: this.generateLogId(),
      timestamp: new Date().toISOString(),
        level: level.toUpperCase(),
        category: category.toUpperCase(),
        message,
        data: this.sanitizeData(data),
        tags: Array.isArray(tags) ? tags : [tags],
        correlationId,
      userAgent: navigator.userAgent,
      url: window.location.href,
        userId: this.getCurrentUserId(),
        sessionId: this.getCurrentSessionId(),
        appVersion: process.env.REACT_APP_VERSION || '1.0.0',
        environment: process.env.NODE_ENV,
        performance: performance ? this.getPerformanceMetrics() : null,
        memory: this.getMemoryUsage(),
        networkStatus: navigator.onLine ? 'online' : 'offline',
      };

      // Log to console if enabled and not skipped
      if (this.logToConsole && !skipConsole) {
        this.logToConsoleOutput(logEntry);
      }

      // Store locally if enabled and not skipped
      if (this.logToLocalStorage && !skipStorage) {
        this.storeLogLocally(logEntry);
      }

      // Send to Google Sheets if enabled and not skipped
      if (this.logToGoogleSheets && !skipGoogleSheets) {
        this.addToBatch(logEntry);
      }

      // Performance tracking
      if (performance) {
        this.trackPerformance(category, logEntry);
      }

      return logEntry;
    } catch (error) {
      console.error('Logging failed:', error);
      return null;
    }
  }

  error(category, message, data = {}, options = {}) {
    return this.log(category, message, data, 'error', options);
  }

  warn(category, message, data = {}, options = {}) {
    return this.log(category, message, data, 'warn', options);
  }

  info(category, message, data = {}, options = {}) {
    return this.log(category, message, data, 'info', options);
  }

  debug(category, message, data = {}, options = {}) {
    return this.log(category, message, data, 'debug', options);
  }

  trace(category, message, data = {}, options = {}) {
    return this.log(category, message, data, 'trace', options);
  }

  logToConsoleOutput(logEntry) {
    const { level, category, message, data, tags, correlationId } = logEntry;
    const timestamp = new Date(logEntry.timestamp).toLocaleTimeString();

    let consoleMessage = `[${timestamp}] ${level} [${category}] ${message}`;

    if (tags && tags.length > 0) {
      consoleMessage += ` [${tags.join(', ')}]`;
    }

    if (correlationId) {
      consoleMessage += ` [${correlationId}]`;
    }

    const logData = data ? (typeof data === 'string' ? JSON.parse(data) : data) : {};

    switch (level) {
      case 'ERROR':
        console.error(consoleMessage, logData);
        break;
      case 'WARN':
        console.warn(consoleMessage, logData);
        break;
      case 'DEBUG':
        console.debug(consoleMessage, logData);
        break;
      case 'TRACE':
        console.trace(consoleMessage, logData);
        break;
      default:
        console.log(consoleMessage, logData);
    }
  }

  storeLogLocally(logEntry) {
    try {
      const logs = this.getLocalLogs();
      logs.push(logEntry);

      // Keep only the most recent logs
      const recentLogs = logs.slice(-this.maxLocalLogs);

      // Clean up old logs
      const cutoffDate = new Date(Date.now() - (this.logRetentionDays * 24 * 60 * 60 * 1000));
      const filteredLogs = recentLogs.filter(log => new Date(log.timestamp) > cutoffDate);

      localStorage.setItem(this.localLogKey, JSON.stringify(filteredLogs));
    } catch (error) {
      console.error('Failed to store log locally:', error);
    }
  }

  getLocalLogs() {
    try {
      const logs = localStorage.getItem(this.localLogKey);
      return logs ? JSON.parse(logs) : [];
    } catch (error) {
      console.error('Failed to get local logs:', error);
      return [];
    }
  }

  clearLocalLogs() {
    try {
      localStorage.removeItem(this.localLogKey);
      console.log('Local logs cleared');
    } catch (error) {
      console.error('Failed to clear local logs:', error);
    }
  }

  addToBatch(logEntry) {
    this.logBatch.push(logEntry);

    // If batch is full, send immediately
    if (this.logBatch.length >= this.batchSize) {
      this.flushBatch();
      return;
    }

    // Set timeout to send batch after delay
    if (!this.batchTimeout) {
      this.batchTimeout = setTimeout(() => {
        this.flushBatch();
      }, this.batchDelay);
    }
  }

  async flushBatch() {
    if (this.logBatch.length === 0) return;

    try {
      await this.logToGoogleSheetsBatch([...this.logBatch]);
      this.logBatch = [];
    } catch (error) {
      console.error('Failed to flush log batch:', error);
    } finally {
      if (this.batchTimeout) {
        clearTimeout(this.batchTimeout);
        this.batchTimeout = null;
      }
    }
  }

  async logToGoogleSheetsAsync(logEntry) {
    try {
      // Don't wait for this to complete to avoid blocking
      setTimeout(async () => {
        try {
          await this.logToGoogleSheets(logEntry);
        } catch (error) {
          console.error('Failed to log to Google Sheets:', error);
        }
      }, 100);
    } catch (error) {
      console.error('Failed to queue Google Sheets log:', error);
    }
  }

  async logToGoogleSheets(logEntry) {
    try {
      if (!googleSheetsService.isConnected) {
        return;
      }

      const rowData = [
        logEntry.timestamp,
        logEntry.level,
        logEntry.category,
        logEntry.message,
        logEntry.data,
        logEntry.tags ? logEntry.tags.join(',') : '',
        logEntry.correlationId || '',
        logEntry.userId || '',
        logEntry.sessionId || '',
        logEntry.url,
        logEntry.userAgent,
        logEntry.appVersion,
        logEntry.environment,
        logEntry.memory ? JSON.stringify(logEntry.memory) : '',
        logEntry.networkStatus,
      ];

      await googleSheetsService.appendData('System_Logs', [rowData]);
    } catch (error) {
      console.error('Failed to log to Google Sheets:', error);
      // Don't throw here to avoid recursive logging
    }
  }

  async logToGoogleSheetsBatch(logEntries) {
    try {
      if (!googleSheetsService.isConnected || logEntries.length === 0) {
        return;
      }

      const rowsData = logEntries.map(logEntry => [
        logEntry.timestamp,
        logEntry.level,
        logEntry.category,
        logEntry.message,
        logEntry.data,
        logEntry.tags ? logEntry.tags.join(',') : '',
        logEntry.correlationId || '',
        logEntry.userId || '',
        logEntry.sessionId || '',
        logEntry.url,
        logEntry.userAgent,
        logEntry.appVersion,
        logEntry.environment,
        logEntry.memory ? JSON.stringify(logEntry.memory) : '',
        logEntry.networkStatus,
      ]);

      await googleSheetsService.appendData('System_Logs', rowsData);
    } catch (error) {
      console.error('Failed to log batch to Google Sheets:', error);
      throw error;
    }
  }

  generateLogId() {
    return 'log_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
  }

  getCurrentUserId() {
    try {
      const session = JSON.parse(localStorage.getItem('mia-session') || '{}');
      return session.user?.id || null;
    } catch {
      return null;
    }
  }

  getCurrentSessionId() {
    try {
      return sessionStorage.getItem('mia-session-id') || null;
    } catch {
      return null;
    }
  }

  sanitizeData(data) {
    try {
      // Remove sensitive information
      const sensitiveKeys = ['password', 'token', 'secret', 'key', 'auth'];
      const sanitized = JSON.parse(JSON.stringify(data));

      const sanitizeObject = (obj) => {
        if (typeof obj !== 'object' || obj === null) return obj;

        if (Array.isArray(obj)) {
          return obj.map(sanitizeObject);
        }

        const result = {};
        for (const [key, value] of Object.entries(obj)) {
          if (sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive))) {
            result[key] = '[REDACTED]';
          } else {
            result[key] = sanitizeObject(value);
          }
        }
        return result;
      };

      return JSON.stringify(sanitizeObject(sanitized));
    } catch (error) {
      return JSON.stringify({ error: 'Failed to sanitize data', originalError: error.message });
    }
  }

  getMemoryUsage() {
    try {
      if ('memory' in performance) {
        return {
          usedJSHeapSize: performance.memory.usedJSHeapSize,
          totalJSHeapSize: performance.memory.totalJSHeapSize,
          jsHeapSizeLimit: performance.memory.jsHeapSizeLimit,
        };
      }
      return null;
    } catch {
      return null;
    }
  }

  getPerformanceMetrics() {
    try {
      const metrics = {
        uptime: Date.now() - this.startTime,
        timestamp: Date.now(),
      };

      // Add custom performance metrics
      for (const [key, value] of this.performanceMetrics.entries()) {
        metrics[key] = value;
      }

      return metrics;
    } catch {
      return null;
    }
  }

  trackPerformance(category, logEntry) {
    try {
      const key = `${category}_${logEntry.level}`;
      const current = this.performanceMetrics.get(key) || { count: 0, totalTime: 0 };
      current.count++;
      current.totalTime += Date.now() - this.startTime;
      this.performanceMetrics.set(key, current);
    } catch (error) {
      console.error('Failed to track performance:', error);
    }
  }

  // Log analysis utilities
  getLogsByCategory(category, hours = 24) {
    const logs = this.getLocalLogs();
    const cutoff = new Date(Date.now() - (hours * 60 * 60 * 1000));

    return logs.filter(log =>
      log.category === category.toUpperCase() &&
      new Date(log.timestamp) > cutoff
    );
  }

  getLogsByLevel(level, hours = 24) {
    const logs = this.getLocalLogs();
    const cutoff = new Date(Date.now() - (hours * 60 * 60 * 1000));

    return logs.filter(log =>
      log.level === level.toUpperCase() &&
      new Date(log.timestamp) > cutoff
    );
  }

  getLogsByTag(tag, hours = 24) {
    const logs = this.getLocalLogs();
    const cutoff = new Date(Date.now() - (hours * 60 * 60 * 1000));

    return logs.filter(log =>
      log.tags && log.tags.includes(tag) &&
      new Date(log.timestamp) > cutoff
    );
  }

  getErrorLogs(hours = 24) {
    return this.getLogsByLevel('error', hours);
  }

  getLogStats(hours = 24) {
    const logs = this.getLocalLogs();
    const cutoff = new Date(Date.now() - (hours * 60 * 60 * 1000));
    const recentLogs = logs.filter(log => new Date(log.timestamp) > cutoff);

    const stats = {
      total: recentLogs.length,
      byLevel: {},
      byCategory: {},
      byTag: {},
      errors: 0,
      warnings: 0,
      averageResponseTime: 0,
      memoryUsage: this.getMemoryUsage(),
    };

    recentLogs.forEach(log => {
      // Count by level
      stats.byLevel[log.level] = (stats.byLevel[log.level] || 0) + 1;

      // Count by category
      stats.byCategory[log.category] = (stats.byCategory[log.category] || 0) + 1;

      // Count by tags
      if (log.tags && log.tags.length > 0) {
        log.tags.forEach(tag => {
          stats.byTag[tag] = (stats.byTag[tag] || 0) + 1;
        });
      }

      // Count errors and warnings
      if (log.level === 'ERROR') stats.errors++;
      if (log.level === 'WARN') stats.warnings++;
    });

    return stats;
  }

  // Specific logging methods for MIA Logistics
  logUserAction(action, details = {}, options = {}) {
    this.info('USER_ACTION', `User performed: ${action}`, details, {
      ...options,
      tags: ['user-action', ...(options.tags || [])],
    });
  }

  logTransportEvent(event, transportId, details = {}, options = {}) {
    this.info('TRANSPORT', `Transport ${transportId}: ${event}`, details, {
      ...options,
      tags: ['transport', 'logistics', ...(options.tags || [])],
      correlationId: `transport_${transportId}`,
    });
  }

  logWarehouseEvent(event, itemCode, details = {}, options = {}) {
    this.info('WAREHOUSE', `Warehouse item ${itemCode}: ${event}`, details, {
      ...options,
      tags: ['warehouse', 'inventory', ...(options.tags || [])],
      correlationId: `warehouse_${itemCode}`,
    });
  }

  logSystemEvent(event, details = {}, options = {}) {
    this.info('SYSTEM', event, details, {
      ...options,
      tags: ['system', ...(options.tags || [])],
    });
  }

  logSecurityEvent(event, details = {}, options = {}) {
    this.warn('SECURITY', event, details, {
      ...options,
      tags: ['security', 'audit', ...(options.tags || [])],
    });
  }

  logGoogleApiEvent(service, action, details = {}, options = {}) {
    this.info('GOOGLE_API', `${service}: ${action}`, details, {
      ...options,
      tags: ['google-api', service.toLowerCase(), ...(options.tags || [])],
      correlationId: `google_${service}_${action}`,
    });
  }

  logPerformance(operation, duration, details = {}, options = {}) {
    this.info('PERFORMANCE', `Operation ${operation} took ${duration}ms`, details, {
      ...options,
      tags: ['performance', 'timing', ...(options.tags || [])],
      performance: true,
    });
  }

  logError(category, error, context = {}, options = {}) {
    const errorDetails = {
      message: error.message,
      stack: error.stack,
      name: error.name,
      ...context,
    };

    this.error(category, `Error occurred: ${error.message}`, errorDetails, {
      ...options,
      tags: ['error', 'exception', ...(options.tags || [])],
    });
  }

  // Export logs
  exportLogs(format = 'json', hours = 24, filters = {}) {
    let logs = this.getLocalLogs();
    const cutoff = new Date(Date.now() - (hours * 60 * 60 * 1000));
    logs = logs.filter(log => new Date(log.timestamp) > cutoff);

    // Apply filters
    if (filters.level) {
      logs = logs.filter(log => log.level === filters.level.toUpperCase());
    }
    if (filters.category) {
      logs = logs.filter(log => log.category === filters.category.toUpperCase());
    }
    if (filters.tags && filters.tags.length > 0) {
      logs = logs.filter(log =>
        log.tags && filters.tags.some(tag => log.tags.includes(tag))
      );
    }

    if (format === 'csv') {
      return this.exportLogsAsCSV(logs);
    }

    return JSON.stringify(logs, null, 2);
  }

  exportLogsAsCSV(logs) {
    const headers = [
      'Timestamp', 'Level', 'Category', 'Message', 'Data', 'Tags',
      'Correlation ID', 'User ID', 'Session ID', 'URL', 'App Version', 'Environment'
    ];
    const csvRows = [headers.join(',')];

    logs.forEach(log => {
      const row = [
        log.timestamp,
        log.level,
        log.category,
        `"${log.message.replace(/"/g, '""')}"`,
        `"${log.data.replace(/"/g, '""')}"`,
        log.tags ? `"${log.tags.join(';').replace(/"/g, '""')}"` : '',
        log.correlationId || '',
        log.userId || '',
        log.sessionId || '',
        `"${log.url.replace(/"/g, '""')}"`,
        log.appVersion || '',
        log.environment || '',
      ];
      csvRows.push(row.join(','));
    });

    return csvRows.join('\n');
  }

  // Real-time logging for development
  startRealTimeLogging() {
    if (process.env.NODE_ENV === 'development') {
      // Override console methods to capture all logs
      const originalConsole = { ...console };

      console.log = (...args) => {
        this.debug('CONSOLE', args.join(' '), {}, {
          skipConsole: true,
          tags: ['console', 'development'],
        });
        originalConsole.log(...args);
      };

      console.error = (...args) => {
        this.error('CONSOLE', args.join(' '), {}, {
          skipConsole: true,
          tags: ['console', 'development'],
        });
        originalConsole.error(...args);
      };

      console.warn = (...args) => {
        this.warn('CONSOLE', args.join(' '), {}, {
          skipConsole: true,
          tags: ['console', 'development'],
        });
        originalConsole.warn(...args);
      };

      console.debug = (...args) => {
        this.debug('CONSOLE', args.join(' '), {}, {
          skipConsole: true,
          tags: ['console', 'development'],
        });
        originalConsole.debug(...args);
      };
    }
  }

  // Utility methods
  async flushAllLogs() {
    await this.flushBatch();
  }

  setLogLevel(level) {
    if (this.levels[level] !== undefined) {
      this.logLevel = level;
      this.info('SYSTEM', `Log level changed to ${level}`, {});
    }
  }

  getLogLevel() {
    return this.logLevel;
  }

  // Cleanup method
  cleanup() {
    this.flushAllLogs();
    this.clearLocalLogs();
    this.performanceMetrics.clear();
  }
}

export const logService = new LogService();
