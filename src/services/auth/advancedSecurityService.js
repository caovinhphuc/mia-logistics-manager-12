// Advanced Security Service - Advanced security policies and threat detection
import { logService } from '../api/logService';
import { jwtService } from './jwtService';

class AdvancedSecurityService {
  constructor() {
    this.securityPolicies = {
      password: {
        minLength: 8,
        maxLength: 128,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChars: true,
        maxAttempts: 5,
        lockoutDuration: 900000, // 15 minutes
        historyCount: 5,
        expiryDays: 90
      },
      session: {
        maxDuration: 86400000, // 24 hours
        idleTimeout: 1800000, // 30 minutes
        maxConcurrentSessions: 3,
        requireReauthForSensitive: true,
        sensitiveOperations: ['delete', 'admin', 'financial']
      },
      device: {
        maxDevices: 5,
        requireDeviceVerification: true,
        deviceTrustDuration: 2592000000, // 30 days
        suspiciousDeviceDetection: true
      },
      location: {
        maxDistance: 1000, // 1km
        allowMultipleLocations: true,
        requireLocationVerification: false,
        geoFencing: false
      },
      ip: {
        maxAttemptsPerIP: 10,
        blockDuration: 3600000, // 1 hour
        whitelist: [],
        blacklist: [],
        suspiciousIPDetection: true
      },
      rateLimiting: {
        login: { requests: 5, window: 900000 }, // 5 requests per 15 minutes
        api: { requests: 100, window: 900000 }, // 100 requests per 15 minutes
        passwordReset: { requests: 3, window: 3600000 }, // 3 requests per hour
        registration: { requests: 3, window: 3600000 } // 3 requests per hour
      }
    };
    
    this.threatDetection = {
      bruteForce: {
        enabled: true,
        maxAttempts: 10,
        timeWindow: 900000, // 15 minutes
        blockDuration: 3600000 // 1 hour
      },
      suspiciousActivity: {
        enabled: true,
        multipleFailedLogins: 5,
        unusualLocation: true,
        unusualTime: true,
        rapidRequests: 20
      },
      anomalyDetection: {
        enabled: true,
        loginPattern: true,
        behaviorAnalysis: true,
        deviceFingerprinting: true
      }
    };
    
    this.securityEvents = new Map();
    this.blockedIPs = new Map();
    this.suspiciousActivities = new Map();
    this.deviceFingerprints = new Map();
    this.userBehaviors = new Map();
  }

  // Validate password against security policies
  validatePassword(password, userId = null) {
    const policy = this.securityPolicies.password;
    const violations = [];

    // Length validation
    if (password.length < policy.minLength) {
      violations.push(`Password must be at least ${policy.minLength} characters long`);
    }
    if (password.length > policy.maxLength) {
      violations.push(`Password must be no more than ${policy.maxLength} characters long`);
    }

    // Character requirements
    if (policy.requireUppercase && !/[A-Z]/.test(password)) {
      violations.push('Password must contain at least one uppercase letter');
    }
    if (policy.requireLowercase && !/[a-z]/.test(password)) {
      violations.push('Password must contain at least one lowercase letter');
    }
    if (policy.requireNumbers && !/\d/.test(password)) {
      violations.push('Password must contain at least one number');
    }
    if (policy.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      violations.push('Password must contain at least one special character');
    }

    // Check against common passwords
    if (this.isCommonPassword(password)) {
      violations.push('Password is too common and easily guessable');
    }

    // Check password history
    if (userId && this.isPasswordInHistory(userId, password)) {
      violations.push('Password cannot be reused from recent history');
    }

    return {
      valid: violations.length === 0,
      violations,
      strength: this.calculatePasswordStrength(password)
    };
  }

  // Calculate password strength
  calculatePasswordStrength(password) {
    let score = 0;
    const policy = this.securityPolicies.password;

    // Length score
    if (password.length >= policy.minLength) score += 1;
    if (password.length >= 12) score += 1;
    if (password.length >= 16) score += 1;

    // Character variety score
    if (/[a-z]/.test(password)) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/\d/.test(password)) score += 1;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1;

    // Complexity bonus
    if (password.length >= 8 && /[a-zA-Z]/.test(password) && /\d/.test(password)) {
      score += 1;
    }

    // Convert score to strength level
    if (score >= 8) return 'very-strong';
    if (score >= 6) return 'strong';
    if (score >= 4) return 'medium';
    if (score >= 2) return 'weak';
    return 'very-weak';
  }

  // Check if password is common
  isCommonPassword(password) {
    const commonPasswords = [
      'password', '123456', 'password123', 'admin', 'qwerty',
      'letmein', 'welcome', 'monkey', '1234567890', 'abc123',
      'Password1', 'password1', '123456789', '12345678', '12345'
    ];
    
    return commonPasswords.includes(password.toLowerCase());
  }

  // Check password history
  isPasswordInHistory(userId, password) {
    const history = this.getPasswordHistory(userId);
    return history.some(hash => this.comparePassword(password, hash));
  }

  // Get password history
  getPasswordHistory(userId) {
    // Mock implementation - in production, fetch from database
    return JSON.parse(localStorage.getItem(`password_history_${userId}`) || '[]');
  }

  // Add password to history
  addPasswordToHistory(userId, passwordHash) {
    const history = this.getPasswordHistory(userId);
    history.push(passwordHash);
    
    // Keep only recent history
    const policy = this.securityPolicies.password;
    if (history.length > policy.historyCount) {
      history.shift();
    }
    
    localStorage.setItem(`password_history_${userId}`, JSON.stringify(history));
  }

  // Compare password with hash
  comparePassword(password, hash) {
    // Mock implementation - in production, use proper password hashing
    return password === hash;
  }

  // Validate session security
  validateSessionSecurity(session, userId) {
    const policy = this.securityPolicies.session;
    const violations = [];

    // Check session duration
    if (Date.now() - session.createdAt > policy.maxDuration) {
      violations.push('Session has expired');
    }

    // Check idle timeout
    if (Date.now() - session.lastActivity > policy.idleTimeout) {
      violations.push('Session has timed out due to inactivity');
    }

    // Check concurrent sessions
    const concurrentSessions = this.getConcurrentSessions(userId);
    if (concurrentSessions.length > policy.maxConcurrentSessions) {
      violations.push('Too many concurrent sessions');
    }

    return {
      valid: violations.length === 0,
      violations
    };
  }

  // Get concurrent sessions
  getConcurrentSessions(userId) {
    // Mock implementation - in production, query database
    const sessions = JSON.parse(localStorage.getItem('active_sessions') || '[]');
    return sessions.filter(s => s.userId === userId && s.expiresAt > Date.now());
  }

  // Validate device security
  validateDeviceSecurity(deviceInfo, userId) {
    const policy = this.securityPolicies.device;
    const violations = [];

    // Check device limit
    const userDevices = this.getUserDevices(userId);
    if (userDevices.length >= policy.maxDevices) {
      violations.push('Maximum number of devices exceeded');
    }

    // Check device verification
    if (policy.requireDeviceVerification) {
      const device = this.getDeviceInfo(deviceInfo);
      if (!device || !device.verified) {
        violations.push('Device verification required');
      }
    }

    // Check suspicious device
    if (this.isSuspiciousDevice(deviceInfo, userId)) {
      violations.push('Suspicious device detected');
    }

    return {
      valid: violations.length === 0,
      violations
    };
  }

  // Get user devices
  getUserDevices(userId) {
    // Mock implementation - in production, query database
    return JSON.parse(localStorage.getItem(`user_devices_${userId}`) || '[]');
  }

  // Get device info
  getDeviceInfo(deviceInfo) {
    const fingerprint = this.generateDeviceFingerprint(deviceInfo);
    return this.deviceFingerprints.get(fingerprint);
  }

  // Generate device fingerprint
  generateDeviceFingerprint(deviceInfo) {
    const data = [
      deviceInfo.userAgent,
      deviceInfo.platform,
      deviceInfo.language,
      deviceInfo.timezone,
      deviceInfo.screenResolution,
      deviceInfo.colorDepth
    ].join('|');
    
    // Simple hash function
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return hash.toString();
  }

  // Check if device is suspicious
  isSuspiciousDevice(deviceInfo, userId) {
    const fingerprint = this.generateDeviceFingerprint(deviceInfo);
    const suspiciousDevices = this.suspiciousActivities.get('suspicious_devices') || [];
    
    return suspiciousDevices.includes(fingerprint);
  }

  // Validate location security
  validateLocationSecurity(location, userId) {
    const policy = this.securityPolicies.location;
    const violations = [];

    if (!policy.allowMultipleLocations) {
      const userLocations = this.getUserLocations(userId);
      const isNewLocation = !this.isLocationKnown(location, userLocations);
      
      if (isNewLocation) {
        violations.push('New location detected');
      }
    }

    return {
      valid: violations.length === 0,
      violations
    };
  }

  // Get user locations
  getUserLocations(userId) {
    // Mock implementation - in production, query database
    return JSON.parse(localStorage.getItem(`user_locations_${userId}`) || '[]');
  }

  // Check if location is known
  isLocationKnown(location, knownLocations) {
    return knownLocations.some(known => 
      this.calculateDistance(location, known) <= this.securityPolicies.location.maxDistance
    );
  }

  // Calculate distance between locations
  calculateDistance(loc1, loc2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.deg2rad(loc2.lat - loc1.lat);
    const dLon = this.deg2rad(loc2.lon - loc1.lon);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(loc1.lat)) * Math.cos(this.deg2rad(loc2.lat)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    return distance;
  }

  // Convert degrees to radians
  deg2rad(deg) {
    return deg * (Math.PI/180);
  }

  // Validate IP security
  validateIPSecurity(ip, userId) {
    const policy = this.securityPolicies.ip;
    const violations = [];

    // Check blacklist
    if (policy.blacklist.includes(ip)) {
      violations.push('IP address is blacklisted');
    }

    // Check rate limiting
    const ipAttempts = this.getIPAttempts(ip);
    if (ipAttempts >= policy.maxAttemptsPerIP) {
      violations.push('Too many attempts from this IP address');
    }

    // Check suspicious IP
    if (this.isSuspiciousIP(ip)) {
      violations.push('Suspicious IP address detected');
    }

    return {
      valid: violations.length === 0,
      violations
    };
  }

  // Get IP attempts
  getIPAttempts(ip) {
    const attempts = this.securityEvents.get(`ip_${ip}`) || [];
    const now = Date.now();
    const recentAttempts = attempts.filter(attempt => now - attempt.timestamp < 3600000); // 1 hour
    return recentAttempts.length;
  }

  // Check if IP is suspicious
  isSuspiciousIP(ip) {
    const suspiciousIPs = this.suspiciousActivities.get('suspicious_ips') || [];
    return suspiciousIPs.includes(ip);
  }

  // Rate limiting
  checkRateLimit(userId, action, ip) {
    const policy = this.securityPolicies.rateLimiting[action];
    if (!policy) return { allowed: true };

    const key = `rate_limit_${action}_${userId || ip}`;
    const attempts = this.securityEvents.get(key) || [];
    const now = Date.now();
    const recentAttempts = attempts.filter(attempt => now - attempt.timestamp < policy.window);

    if (recentAttempts.length >= policy.requests) {
      return { 
        allowed: false, 
        reason: `Rate limit exceeded for ${action}`,
        resetTime: recentAttempts[0].timestamp + policy.window
      };
    }

    return { allowed: true };
  }

  // Record rate limit attempt
  recordRateLimitAttempt(userId, action, ip) {
    const key = `rate_limit_${action}_${userId || ip}`;
    const attempts = this.securityEvents.get(key) || [];
    attempts.push({ timestamp: Date.now(), ip, userId });
    this.securityEvents.set(key, attempts);
  }

  // Threat detection
  detectThreats(userId, action, context) {
    const threats = [];

    // Brute force detection
    if (this.detectBruteForce(userId, context)) {
      threats.push({
        type: 'brute_force',
        severity: 'high',
        description: 'Multiple failed login attempts detected'
      });
    }

    // Suspicious activity detection
    if (this.detectSuspiciousActivity(userId, context)) {
      threats.push({
        type: 'suspicious_activity',
        severity: 'medium',
        description: 'Unusual activity pattern detected'
      });
    }

    // Anomaly detection
    if (this.detectAnomalies(userId, context)) {
      threats.push({
        type: 'anomaly',
        severity: 'low',
        description: 'Behavioral anomaly detected'
      });
    }

    return threats;
  }

  // Detect brute force
  detectBruteForce(userId, context) {
    const policy = this.threatDetection.bruteForce;
    if (!policy.enabled) return false;

    const attempts = this.getFailedAttempts(userId);
    const now = Date.now();
    const recentAttempts = attempts.filter(attempt => now - attempt.timestamp < policy.timeWindow);

    return recentAttempts.length >= policy.maxAttempts;
  }

  // Get failed attempts
  getFailedAttempts(userId) {
    const attempts = this.securityEvents.get(`failed_attempts_${userId}`) || [];
    return attempts;
  }

  // Record failed attempt
  recordFailedAttempt(userId, context) {
    const attempts = this.getFailedAttempts(userId);
    attempts.push({ timestamp: Date.now(), context });
    this.securityEvents.set(`failed_attempts_${userId}`, attempts);
  }

  // Detect suspicious activity
  detectSuspiciousActivity(userId, context) {
    const policy = this.threatDetection.suspiciousActivity;
    if (!policy.enabled) return false;

    // Check for multiple failed logins
    const failedAttempts = this.getFailedAttempts(userId);
    if (failedAttempts.length >= policy.multipleFailedLogins) {
      return true;
    }

    // Check for unusual location
    if (policy.unusualLocation && this.isUnusualLocation(userId, context.location)) {
      return true;
    }

    // Check for unusual time
    if (policy.unusualTime && this.isUnusualTime(context.timestamp)) {
      return true;
    }

    // Check for rapid requests
    if (this.isRapidRequests(userId, policy.rapidRequests)) {
      return true;
    }

    return false;
  }

  // Check if location is unusual
  isUnusualLocation(userId, location) {
    const userLocations = this.getUserLocations(userId);
    return !this.isLocationKnown(location, userLocations);
  }

  // Check if time is unusual
  isUnusualTime(timestamp) {
    const hour = new Date(timestamp).getHours();
    return hour < 6 || hour > 22; // Unusual if outside 6 AM - 10 PM
  }

  // Check for rapid requests
  isRapidRequests(userId, threshold) {
    const requests = this.getUserRequests(userId);
    const now = Date.now();
    const recentRequests = requests.filter(req => now - req.timestamp < 60000); // 1 minute
    
    return recentRequests.length >= threshold;
  }

  // Get user requests
  getUserRequests(userId) {
    return this.securityEvents.get(`user_requests_${userId}`) || [];
  }

  // Record user request
  recordUserRequest(userId, request) {
    const requests = this.getUserRequests(userId);
    requests.push({ timestamp: Date.now(), request });
    this.securityEvents.set(`user_requests_${userId}`, requests);
  }

  // Detect anomalies
  detectAnomalies(userId, context) {
    const policy = this.threatDetection.anomalyDetection;
    if (!policy.enabled) return false;

    // Login pattern analysis
    if (policy.loginPattern && this.analyzeLoginPattern(userId, context)) {
      return true;
    }

    // Behavior analysis
    if (policy.behaviorAnalysis && this.analyzeBehavior(userId, context)) {
      return true;
    }

    // Device fingerprinting
    if (policy.deviceFingerprinting && this.analyzeDeviceFingerprint(userId, context)) {
      return true;
    }

    return false;
  }

  // Analyze login pattern
  analyzeLoginPattern(userId, context) {
    const userBehavior = this.userBehaviors.get(userId) || {};
    const loginPattern = userBehavior.loginPattern || {};
    
    // Check for unusual login times
    const hour = new Date(context.timestamp).getHours();
    const usualHours = loginPattern.usualHours || [];
    
    if (usualHours.length > 0 && !usualHours.includes(hour)) {
      return true;
    }

    return false;
  }

  // Analyze behavior
  analyzeBehavior(userId, context) {
    const userBehavior = this.userBehaviors.get(userId) || {};
    
    // Check for unusual request patterns
    const requestPattern = userBehavior.requestPattern || {};
    const currentPattern = this.getRequestPattern(context);
    
    if (this.isPatternAnomalous(requestPattern, currentPattern)) {
      return true;
    }

    return false;
  }

  // Analyze device fingerprint
  analyzeDeviceFingerprint(userId, context) {
    const deviceFingerprint = this.generateDeviceFingerprint(context.deviceInfo);
    const userDevices = this.getUserDevices(userId);
    
    // Check if device is new
    const isNewDevice = !userDevices.some(device => device.fingerprint === deviceFingerprint);
    
    return isNewDevice;
  }

  // Get request pattern
  getRequestPattern(context) {
    return {
      userAgent: context.deviceInfo?.userAgent,
      ip: context.ip,
      location: context.location,
      timestamp: context.timestamp
    };
  }

  // Check if pattern is anomalous
  isPatternAnomalous(usualPattern, currentPattern) {
    // Simple anomaly detection - in production, use ML algorithms
    return false;
  }

  // Block IP address
  blockIPAddress(ip, reason, duration = 3600000) {
    this.blockedIPs.set(ip, {
      blockedAt: Date.now(),
      reason,
      duration,
      expiresAt: Date.now() + duration
    });

    // Log IP block
    logService.log('security', 'IP address blocked', {
      ip,
      reason,
      duration,
      timestamp: new Date().toISOString()
    });

    console.log(`🚫 IP address blocked: ${ip} - ${reason}`);
  }

  // Check if IP is blocked
  isIPBlocked(ip) {
    const blockInfo = this.blockedIPs.get(ip);
    if (!blockInfo) return false;

    if (Date.now() > blockInfo.expiresAt) {
      this.blockedIPs.delete(ip);
      return false;
    }

    return true;
  }

  // Get security statistics
  getSecurityStatistics() {
    const now = Date.now();
    const last24Hours = now - 86400000;

    const blockedIPs = Array.from(this.blockedIPs.values());
    const recentBlocks = blockedIPs.filter(block => block.blockedAt > last24Hours);

    const securityEvents = Array.from(this.securityEvents.values());
    const recentEvents = securityEvents.filter(event => 
      event.some(e => e.timestamp > last24Hours)
    );

    return {
      blockedIPs: {
        total: blockedIPs.length,
        last24Hours: recentBlocks.length,
        active: blockedIPs.filter(block => block.expiresAt > now).length
      },
      securityEvents: {
        total: securityEvents.length,
        last24Hours: recentEvents.length
      },
      threatDetection: {
        bruteForce: this.threatDetection.bruteForce.enabled,
        suspiciousActivity: this.threatDetection.suspiciousActivity.enabled,
        anomalyDetection: this.threatDetection.anomalyDetection.enabled
      }
    };
  }
}

export const advancedSecurityService = new AdvancedSecurityService();
export default advancedSecurityService;
