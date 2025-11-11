// Audit Logging Service - Comprehensive audit logging for security and compliance
import { logService } from '../api/logService';

class AuditLoggingService {
  constructor() {
    this.auditLogs = new Map();
    this.logRetention = {
      authentication: 2555, // 7 years in days
      authorization: 2555,
      dataAccess: 1095, // 3 years in days
      system: 365, // 1 year in days
      security: 2555, // 7 years in days
    };

    this.logLevels = {
      CRITICAL: 1,
      HIGH: 2,
      MEDIUM: 3,
      LOW: 4,
      INFO: 5,
    };

    this.auditCategories = {
      AUTHENTICATION: 'authentication',
      AUTHORIZATION: 'authorization',
      DATA_ACCESS: 'data_access',
      DATA_MODIFICATION: 'data_modification',
      SYSTEM_EVENT: 'system_event',
      SECURITY_EVENT: 'security_event',
      ADMIN_ACTION: 'admin_action',
      USER_ACTION: 'user_action',
      API_ACCESS: 'api_access',
      FILE_ACCESS: 'file_access',
    };

    this.sensitiveOperations = [
      'delete',
      'update',
      'create',
      'modify',
      'export',
      'import',
      'admin',
      'financial',
      'personal',
      'confidential',
    ];

    this.startAuditLogging();
  }

  // Start audit logging
  startAuditLogging() {
    console.log('📋 Starting audit logging service...');

    // Initialize audit log storage
    this.initializeAuditStorage();

    // Start log cleanup process
    this.startLogCleanup();

    // Start log aggregation
    this.startLogAggregation();

    console.log('✅ Audit logging service started');
  }

  // Initialize audit storage
  initializeAuditStorage() {
    // Create audit log structure
    this.auditLogs.set('authentication', []);
    this.auditLogs.set('authorization', []);
    this.auditLogs.set('data_access', []);
    this.auditLogs.set('data_modification', []);
    this.auditLogs.set('system_event', []);
    this.auditLogs.set('security_event', []);
    this.auditLogs.set('admin_action', []);
    this.auditLogs.set('user_action', []);
    this.auditLogs.set('api_access', []);
    this.auditLogs.set('file_access', []);
  }

  // Log authentication event
  logAuthenticationEvent(event, details) {
    const auditLog = {
      id: this.generateAuditId(),
      timestamp: new Date().toISOString(),
      category: this.auditCategories.AUTHENTICATION,
      event,
      level: this.getLogLevel(event),
      userId: details.userId,
      sessionId: details.sessionId,
      ipAddress: details.ipAddress,
      userAgent: details.userAgent,
      success: details.success,
      details: {
        method: details.method,
        provider: details.provider,
        deviceInfo: details.deviceInfo,
        location: details.location,
        riskScore: details.riskScore,
      },
      metadata: {
        version: '1.0',
        source: 'authentication_service',
        correlationId: details.correlationId,
      },
    };

    this.addAuditLog(auditLog);
    this.sendToExternalAudit(auditLog);

    console.log(`📋 Authentication audit: ${event} - ${details.userId}`);
  }

  // Log authorization event
  logAuthorizationEvent(event, details) {
    const auditLog = {
      id: this.generateAuditId(),
      timestamp: new Date().toISOString(),
      category: this.auditCategories.AUTHORIZATION,
      event,
      level: this.getLogLevel(event),
      userId: details.userId,
      sessionId: details.sessionId,
      ipAddress: details.ipAddress,
      resource: details.resource,
      action: details.action,
      success: details.success,
      details: {
        permission: details.permission,
        role: details.role,
        reason: details.reason,
        resourceType: details.resourceType,
      },
      metadata: {
        version: '1.0',
        source: 'authorization_service',
        correlationId: details.correlationId,
      },
    };

    this.addAuditLog(auditLog);
    this.sendToExternalAudit(auditLog);

    console.log(`📋 Authorization audit: ${event} - ${details.userId} - ${details.resource}`);
  }

  // Log data access event
  logDataAccessEvent(event, details) {
    const auditLog = {
      id: this.generateAuditId(),
      timestamp: new Date().toISOString(),
      category: this.auditCategories.DATA_ACCESS,
      event,
      level: this.getLogLevel(event),
      userId: details.userId,
      sessionId: details.sessionId,
      ipAddress: details.ipAddress,
      resource: details.resource,
      action: details.action,
      success: details.success,
      details: {
        dataType: details.dataType,
        recordCount: details.recordCount,
        sensitiveData: details.sensitiveData,
        exportFormat: details.exportFormat,
        filters: details.filters,
      },
      metadata: {
        version: '1.0',
        source: 'data_access_service',
        correlationId: details.correlationId,
      },
    };

    this.addAuditLog(auditLog);
    this.sendToExternalAudit(auditLog);

    console.log(`📋 Data access audit: ${event} - ${details.userId} - ${details.resource}`);
  }

  // Log data modification event
  logDataModificationEvent(event, details) {
    const auditLog = {
      id: this.generateAuditId(),
      timestamp: new Date().toISOString(),
      category: this.auditCategories.DATA_MODIFICATION,
      event,
      level: this.getLogLevel(event),
      userId: details.userId,
      sessionId: details.sessionId,
      ipAddress: details.ipAddress,
      resource: details.resource,
      action: details.action,
      success: details.success,
      details: {
        dataType: details.dataType,
        recordId: details.recordId,
        changes: details.changes,
        beforeValue: details.beforeValue,
        afterValue: details.afterValue,
        sensitiveData: details.sensitiveData,
      },
      metadata: {
        version: '1.0',
        source: 'data_modification_service',
        correlationId: details.correlationId,
      },
    };

    this.addAuditLog(auditLog);
    this.sendToExternalAudit(auditLog);

    console.log(`📋 Data modification audit: ${event} - ${details.userId} - ${details.resource}`);
  }

  // Log system event
  logSystemEvent(event, details) {
    const auditLog = {
      id: this.generateAuditId(),
      timestamp: new Date().toISOString(),
      category: this.auditCategories.SYSTEM_EVENT,
      event,
      level: this.getLogLevel(event),
      userId: details.userId,
      sessionId: details.sessionId,
      ipAddress: details.ipAddress,
      details: {
        component: details.component,
        operation: details.operation,
        status: details.status,
        error: details.error,
        performance: details.performance,
      },
      metadata: {
        version: '1.0',
        source: 'system_service',
        correlationId: details.correlationId,
      },
    };

    this.addAuditLog(auditLog);
    this.sendToExternalAudit(auditLog);

    console.log(`📋 System audit: ${event} - ${details.component}`);
  }

  // Log security event
  logSecurityEvent(event, details) {
    const auditLog = {
      id: this.generateAuditId(),
      timestamp: new Date().toISOString(),
      category: this.auditCategories.SECURITY_EVENT,
      event,
      level: this.getLogLevel(event),
      userId: details.userId,
      sessionId: details.sessionId,
      ipAddress: details.ipAddress,
      details: {
        threatType: details.threatType,
        severity: details.severity,
        source: details.source,
        target: details.target,
        action: details.action,
        blocked: details.blocked,
        riskScore: details.riskScore,
      },
      metadata: {
        version: '1.0',
        source: 'security_service',
        correlationId: details.correlationId,
      },
    };

    this.addAuditLog(auditLog);
    this.sendToExternalAudit(auditLog);

    console.log(`📋 Security audit: ${event} - ${details.threatType} - ${details.severity}`);
  }

  // Log admin action
  logAdminAction(event, details) {
    const auditLog = {
      id: this.generateAuditId(),
      timestamp: new Date().toISOString(),
      category: this.auditCategories.ADMIN_ACTION,
      event,
      level: this.getLogLevel(event),
      userId: details.userId,
      sessionId: details.sessionId,
      ipAddress: details.ipAddress,
      targetUserId: details.targetUserId,
      action: details.action,
      success: details.success,
      details: {
        adminRole: details.adminRole,
        targetRole: details.targetRole,
        changes: details.changes,
        reason: details.reason,
        approvalRequired: details.approvalRequired,
      },
      metadata: {
        version: '1.0',
        source: 'admin_service',
        correlationId: details.correlationId,
      },
    };

    this.addAuditLog(auditLog);
    this.sendToExternalAudit(auditLog);

    console.log(`📋 Admin action audit: ${event} - ${details.userId} - ${details.action}`);
  }

  // Log user action
  logUserAction(event, details) {
    const auditLog = {
      id: this.generateAuditId(),
      timestamp: new Date().toISOString(),
      category: this.auditCategories.USER_ACTION,
      event,
      level: this.getLogLevel(event),
      userId: details.userId,
      sessionId: details.sessionId,
      ipAddress: details.ipAddress,
      action: details.action,
      success: details.success,
      details: {
        resource: details.resource,
        method: details.method,
        parameters: details.parameters,
        result: details.result,
      },
      metadata: {
        version: '1.0',
        source: 'user_service',
        correlationId: details.correlationId,
      },
    };

    this.addAuditLog(auditLog);
    this.sendToExternalAudit(auditLog);

    console.log(`📋 User action audit: ${event} - ${details.userId} - ${details.action}`);
  }

  // Log API access
  logAPIAccess(event, details) {
    const auditLog = {
      id: this.generateAuditId(),
      timestamp: new Date().toISOString(),
      category: this.auditCategories.API_ACCESS,
      event,
      level: this.getLogLevel(event),
      userId: details.userId,
      sessionId: details.sessionId,
      ipAddress: details.ipAddress,
      endpoint: details.endpoint,
      method: details.method,
      success: details.success,
      details: {
        requestId: details.requestId,
        responseCode: details.responseCode,
        responseTime: details.responseTime,
        requestSize: details.requestSize,
        responseSize: details.responseSize,
        userAgent: details.userAgent,
      },
      metadata: {
        version: '1.0',
        source: 'api_service',
        correlationId: details.correlationId,
      },
    };

    this.addAuditLog(auditLog);
    this.sendToExternalAudit(auditLog);

    console.log(`📋 API access audit: ${event} - ${details.endpoint} - ${details.method}`);
  }

  // Log file access
  logFileAccess(event, details) {
    const auditLog = {
      id: this.generateAuditId(),
      timestamp: new Date().toISOString(),
      category: this.auditCategories.FILE_ACCESS,
      event,
      level: this.getLogLevel(event),
      userId: details.userId,
      sessionId: details.sessionId,
      ipAddress: details.ipAddress,
      filePath: details.filePath,
      action: details.action,
      success: details.success,
      details: {
        fileSize: details.fileSize,
        fileType: details.fileType,
        checksum: details.checksum,
        sensitive: details.sensitive,
        downloadCount: details.downloadCount,
      },
      metadata: {
        version: '1.0',
        source: 'file_service',
        correlationId: details.correlationId,
      },
    };

    this.addAuditLog(auditLog);
    this.sendToExternalAudit(auditLog);

    console.log(`📋 File access audit: ${event} - ${details.filePath} - ${details.action}`);
  }

  // Add audit log
  addAuditLog(auditLog) {
    const category = auditLog.category;
    const logs = this.auditLogs.get(category) || [];
    logs.push(auditLog);
    this.auditLogs.set(category, logs);

    // Store in localStorage for persistence
    this.storeAuditLog(auditLog);
  }

  // Store audit log
  storeAuditLog(auditLog) {
    try {
      const storedLogs = JSON.parse(localStorage.getItem('audit_logs') || '[]');
      storedLogs.push(auditLog);

      // Keep only recent logs (last 1000)
      if (storedLogs.length > 1000) {
        storedLogs.splice(0, storedLogs.length - 1000);
      }

      localStorage.setItem('audit_logs', JSON.stringify(storedLogs));
    } catch (error) {
      console.error('Error storing audit log:', error);
    }
  }

  // Send to external audit system
  sendToExternalAudit(auditLog) {
    // In production, send to external audit system
    if (process.env.REACT_APP_EXTERNAL_AUDIT_ENABLED === 'true') {
      // Send to SIEM system
      this.sendToSIEM(auditLog);

      // Send to compliance system
      this.sendToCompliance(auditLog);

      // Send to security monitoring
      this.sendToSecurityMonitoring(auditLog);
    }
  }

  // Send to SIEM system
  sendToSIEM(auditLog) {
    // Mock implementation - in production, send to actual SIEM
    console.log(`📊 SIEM: ${auditLog.category} - ${auditLog.event}`);
  }

  // Send to compliance system
  sendToCompliance(auditLog) {
    // Mock implementation - in production, send to compliance system
    console.log(`📊 Compliance: ${auditLog.category} - ${auditLog.event}`);
  }

  // Send to security monitoring
  sendToSecurityMonitoring(auditLog) {
    // Mock implementation - in production, send to security monitoring
    console.log(`📊 Security: ${auditLog.category} - ${auditLog.event}`);
  }

  // Get log level
  getLogLevel(event) {
    const criticalEvents = [
      'login_failed',
      'unauthorized_access',
      'data_breach',
      'system_compromise',
    ];
    const highEvents = ['password_change', 'role_change', 'admin_action', 'sensitive_data_access'];
    const mediumEvents = ['user_creation', 'user_deletion', 'permission_change', 'data_export'];
    const lowEvents = ['user_login', 'user_logout', 'data_view', 'file_access'];

    if (criticalEvents.some((e) => event.includes(e))) return this.logLevels.CRITICAL;
    if (highEvents.some((e) => event.includes(e))) return this.logLevels.HIGH;
    if (mediumEvents.some((e) => event.includes(e))) return this.logLevels.MEDIUM;
    if (lowEvents.some((e) => event.includes(e))) return this.logLevels.LOW;

    return this.logLevels.INFO;
  }

  // Generate audit ID
  generateAuditId() {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `audit_${timestamp}_${random}`;
  }

  // Start log cleanup
  startLogCleanup() {
    // Run cleanup every 24 hours
    setInterval(() => {
      this.cleanupOldLogs();
    }, 86400000);
  }

  // Cleanup old logs
  cleanupOldLogs() {
    console.log('🧹 Cleaning up old audit logs...');

    const now = Date.now();

    for (const [category, logs] of this.auditLogs.entries()) {
      const retentionDays = this.logRetention[category] || 365;
      const retentionMs = retentionDays * 24 * 60 * 60 * 1000;

      const filteredLogs = logs.filter((log) => {
        const logTime = new Date(log.timestamp).getTime();
        return now - logTime < retentionMs;
      });

      this.auditLogs.set(category, filteredLogs);
    }

    console.log('✅ Audit log cleanup completed');
  }

  // Start log aggregation
  startLogAggregation() {
    // Run aggregation every hour
    setInterval(() => {
      this.aggregateLogs();
    }, 3600000);
  }

  // Aggregate logs
  aggregateLogs() {
    console.log('📊 Aggregating audit logs...');

    const now = new Date();
    const lastHour = new Date(now.getTime() - 3600000);

    const aggregatedData = {
      timestamp: now.toISOString(),
      period: '1h',
      categories: {},
      totals: {
        totalEvents: 0,
        criticalEvents: 0,
        highEvents: 0,
        mediumEvents: 0,
        lowEvents: 0,
        infoEvents: 0,
      },
    };

    for (const [category, logs] of this.auditLogs.entries()) {
      const recentLogs = logs.filter((log) => new Date(log.timestamp) > lastHour);

      aggregatedData.categories[category] = {
        count: recentLogs.length,
        events: recentLogs.map((log) => ({
          id: log.id,
          event: log.event,
          level: log.level,
          timestamp: log.timestamp,
        })),
      };

      aggregatedData.totals.totalEvents += recentLogs.length;

      recentLogs.forEach((log) => {
        switch (log.level) {
          case this.logLevels.CRITICAL:
            aggregatedData.totals.criticalEvents++;
            break;
          case this.logLevels.HIGH:
            aggregatedData.totals.highEvents++;
            break;
          case this.logLevels.MEDIUM:
            aggregatedData.totals.mediumEvents++;
            break;
          case this.logLevels.LOW:
            aggregatedData.totals.lowEvents++;
            break;
          case this.logLevels.uthLevels.INFO:
            aggregatedData.totals.infoEvents++;
            break;
        }
      });
    }

    this.storeAggregatedData(aggregatedData);
    console.log('✅ Audit log aggregation completed');
  }

  // Store aggregated data
  storeAggregatedData(data) {
    try {
      const storedData = JSON.parse(localStorage.getItem('audit_aggregated') || '[]');
      storedData.push(data);

      // Keep only recent aggregations (last 168 = 1 week)
      if (storedData.length > 168) {
        storedData.splice(0, storedData.length - 168);
      }

      localStorage.setItem('audit_aggregated', JSON.stringify(storedData));
    } catch (error) {
      console.error('Error storing aggregated data:', error);
    }
  }

  // Get audit logs
  getAuditLogs(category, filters = {}) {
    const logs = this.auditLogs.get(category) || [];

    let filteredLogs = logs;

    // Apply filters
    if (filters.userId) {
      filteredLogs = filteredLogs.filter((log) => log.userId === filters.userId);
    }

    if (filters.startDate) {
      filteredLogs = filteredLogs.filter(
        (log) => new Date(log.timestamp) >= new Date(filters.startDate)
      );
    }

    if (filters.endDate) {
      filteredLogs = filteredLogs.filter(
        (log) => new Date(log.timestamp) <= new Date(filters.endDate)
      );
    }

    if (filters.level) {
      filteredLogs = filteredLogs.filter((log) => log.level === filters.level);
    }

    if (filters.event) {
      filteredLogs = filteredLogs.filter((log) => log.event.includes(filters.event));
    }

    return filteredLogs;
  }

  // Get audit statistics
  getAuditStatistics() {
    const stats = {
      totalLogs: 0,
      categories: {},
      levels: {
        critical: 0,
        high: 0,
        medium: 0,
        low: 0,
        info: 0,
      },
      recentActivity: {
        last24Hours: 0,
        last7Days: 0,
        last30Days: 0,
      },
    };

    const now = new Date();
    const last24Hours = new Date(now.getTime() - 86400000);
    const last7Days = new Date(now.getTime() - 604800000);
    const last30Days = new Date(now.getTime() - 2592000000);

    for (const [category, logs] of this.auditLogs.entries()) {
      stats.categories[category] = logs.length;
      stats.totalLogs += logs.length;

      logs.forEach((log) => {
        switch (log.level) {
          case this.logLevels.CRITICAL:
            stats.levels.critical++;
            break;
          case this.logLevels.HIGH:
            stats.levels.high++;
            break;
          case this.logLevels.MEDIUM:
            stats.levels.medium++;
            break;
          case this.logLevels.LOW:
            stats.levels.low++;
            break;
          case this.logLevels.INFO:
            stats.levels.info++;
            break;
        }

        const logTime = new Date(log.timestamp);
        if (logTime > last24Hours) stats.recentActivity.last24Hours++;
        if (logTime > last7Days) stats.recentActivity.last7Days++;
        if (logTime > last30Days) stats.recentActivity.last30Days++;
      });
    }

    return stats;
  }

  // Export audit logs
  exportAuditLogs(category, format = 'json', filters = {}) {
    const logs = this.getAuditLogs(category, filters);

    switch (format) {
      case 'json':
        return JSON.stringify(logs, null, 2);
      case 'csv':
        return this.convertToCSV(logs);
      case 'xml':
        return this.convertToXML(logs);
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }

  // Convert to CSV
  convertToCSV(logs) {
    if (logs.length === 0) return '';

    const headers = Object.keys(logs[0]);
    const csvRows = [headers.join(',')];

    logs.forEach((log) => {
      const values = headers.map((header) => {
        const value = log[header];
        return typeof value === 'object' ? JSON.stringify(value) : value;
      });
      csvRows.push(values.join(','));
    });

    return csvRows.join('\n');
  }

  // Convert to XML
  convertToXML(logs) {
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<auditLogs>\n';

    logs.forEach((log) => {
      xml += '  <auditLog>\n';
      Object.entries(log).forEach(([key, value]) => {
        xml += `    <${key}>${typeof value === 'object' ? JSON.stringify(value) : value}</${key}>\n`;
      });
      xml += '  </auditLog>\n';
    });

    xml += '</auditLogs>';
    return xml;
  }
}

export const auditLoggingService = new AuditLoggingService();
export default auditLoggingService;
