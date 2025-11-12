import CryptoJS from 'crypto-js';

class SessionService {
  constructor() {
    this.encryptionKey =
      process.env.REACT_APP_ENCRYPTION_KEY || 'mia-logistics-default-key-2024';
    this.sessionKey = 'mia-session';
    this.sessionTimeout =
      parseInt(process.env.REACT_APP_SESSION_TIMEOUT) || 3600000; // 1 hour
  }

  createSession(user) {
    try {
      const sessionData = {
        id: this.generateSessionId(),
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          picture: user.picture,
          loginMethod: user.loginMethod,
        },
        createdAt: new Date().toISOString(),
        lastActivity: new Date().toISOString(),
        expiresAt: new Date(Date.now() + this.sessionTimeout).toISOString(),
        ipAddress: this.getClientIP(),
        userAgent: navigator.userAgent,
        isActive: true,
      };

      // Encrypt session data
      const encryptedSession = this.encryptData(sessionData);

      // Store in localStorage
      localStorage.setItem(this.sessionKey, encryptedSession);

      // Store session ID in sessionStorage for tab-specific tracking
      sessionStorage.setItem('mia-session-id', sessionData.id);

      console.log('Session created:', sessionData.id);
      return sessionData;
    } catch (error) {
      console.error('Failed to create session:', error);
      throw error;
    }
  }

  getSession() {
    try {
      const encryptedSession = localStorage.getItem(this.sessionKey);
      if (!encryptedSession) {
        return null;
      }

      const sessionData = this.decryptData(encryptedSession);

      // Check if session is expired
      if (new Date() > new Date(sessionData.expiresAt)) {
        this.clearSession();
        return null;
      }

      return sessionData;
    } catch (error) {
      console.error('Failed to get session:', error);
      this.clearSession(); // Clear corrupted session
      return null;
    }
  }

  updateSession(updates) {
    try {
      const session = this.getSession();
      if (!session) {
        throw new Error('No active session');
      }

      const updatedSession = {
        ...session,
        ...updates,
        lastActivity: new Date().toISOString(),
      };

      const encryptedSession = this.encryptData(updatedSession);
      localStorage.setItem(this.sessionKey, encryptedSession);

      return updatedSession;
    } catch (error) {
      console.error('Failed to update session:', error);
      throw error;
    }
  }

  refreshSession() {
    try {
      const session = this.getSession();
      if (!session) {
        return null;
      }

      const refreshedSession = {
        ...session,
        lastActivity: new Date().toISOString(),
        expiresAt: new Date(Date.now() + this.sessionTimeout).toISOString(),
      };

      const encryptedSession = this.encryptData(refreshedSession);
      localStorage.setItem(this.sessionKey, encryptedSession);

      return refreshedSession;
    } catch (error) {
      console.error('Failed to refresh session:', error);
      throw error;
    }
  }

  clearSession() {
    try {
      localStorage.removeItem(this.sessionKey);
      sessionStorage.removeItem('mia-session-id');
      console.log('Session cleared');
    } catch (error) {
      console.error('Failed to clear session:', error);
    }
  }

  isValidSession(session) {
    if (!session) return false;

    // Check expiration
    if (new Date() > new Date(session.expiresAt)) {
      return false;
    }

    // Check if session is active
    if (!session.isActive) {
      return false;
    }

    // Check session structure
    if (!session.user || !session.user.id || !session.user.role) {
      return false;
    }

    return true;
  }

  generateSessionId() {
    return 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  encryptData(data) {
    const jsonString = JSON.stringify(data);
    const encrypted = CryptoJS.AES.encrypt(
      jsonString,
      this.encryptionKey
    ).toString();
    return encrypted;
  }

  decryptData(encryptedData) {
    const decrypted = CryptoJS.AES.decrypt(encryptedData, this.encryptionKey);
    const jsonString = decrypted.toString(CryptoJS.enc.Utf8);
    return JSON.parse(jsonString);
  }

  getClientIP() {
    // In a real application, you would get this from the server
    // For demo purposes, return a placeholder
    return '127.0.0.1';
  }

  // Security utilities
  isSessionHijacked(session) {
    // Check for session hijacking indicators
    const currentUserAgent = navigator.userAgent;

    if (session.userAgent !== currentUserAgent) {
      console.warn('Possible session hijacking detected: User agent mismatch');
      return true;
    }

    return false;
  }

  validateSessionSecurity(session) {
    // Additional security checks
    if (this.isSessionHijacked(session)) {
      this.clearSession();
      throw new Error('Session security violation detected');
    }

    return true;
  }

  // Activity tracking
  trackActivity(activity) {
    try {
      const session = this.getSession();
      if (!session) return;

      const activities = this.getActivityLog() || [];
      activities.push({
        timestamp: new Date().toISOString(),
        activity,
        sessionId: session.id,
        userId: session.user.id,
      });

      // Keep only last 100 activities
      const recentActivities = activities.slice(-100);

      localStorage.setItem(
        'mia-activity-log',
        JSON.stringify(recentActivities)
      );
    } catch (error) {
      console.error('Failed to track activity:', error);
    }
  }

  getActivityLog() {
    try {
      const log = localStorage.getItem('mia-activity-log');
      return log ? JSON.parse(log) : [];
    } catch (error) {
      console.error('Failed to get activity log:', error);
      return [];
    }
  }

  clearActivityLog() {
    localStorage.removeItem('mia-activity-log');
  }

  // Multi-tab session management
  synchronizeSession() {
    // Listen for storage events to sync sessions across tabs
    window.addEventListener('storage', (event) => {
      if (event.key === this.sessionKey) {
        // Session was updated in another tab
        if (!event.newValue) {
          // Session was cleared in another tab
          window.location.reload();
        }
      }
    });
  }

  // Session statistics
  getSessionStats() {
    const session = this.getSession();
    if (!session) return null;

    const now = new Date();
    const createdAt = new Date(session.createdAt);
    const lastActivity = new Date(session.lastActivity);
    const expiresAt = new Date(session.expiresAt);

    return {
      sessionId: session.id,
      userId: session.user.id,
      duration: now - createdAt,
      timeToExpiry: expiresAt - now,
      lastActivityTime: now - lastActivity,
      isExpired: now > expiresAt,
      activitiesCount: this.getActivityLog().filter(
        (a) => a.sessionId === session.id
      ).length,
    };
  }
}

export const sessionService = new SessionService();
