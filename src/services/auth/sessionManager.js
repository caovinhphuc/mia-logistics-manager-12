// Session Manager - Quản lý sessions
import { jwtService } from './jwtService';
import { logService } from '../api/logService';

class SessionManager {
  constructor() {
    this.sessions = new Map();
    this.maxSessions = 100;
    this.sessionTimeout = 24 * 60 * 60 * 1000; // 24 hours
    this.cleanupInterval = 60 * 60 * 1000; // 1 hour
    this.startCleanupTimer();
  }

  // Tạo session mới
  createSession(user, deviceInfo = {}) {
    try {
      const sessionId = this.generateSessionId();
      const now = Date.now();
      
      const session = {
        id: sessionId,
        userId: user.id,
        userRole: user.role,
        userPermissions: user.permissions || [],
        createdAt: now,
        lastActivity: now,
        expiresAt: now + this.sessionTimeout,
        deviceInfo: {
          userAgent: deviceInfo.userAgent || navigator.userAgent,
          ip: deviceInfo.ip || 'unknown',
          platform: deviceInfo.platform || 'unknown',
          browser: deviceInfo.browser || 'unknown',
          ...deviceInfo
        },
        isActive: true,
        refreshToken: jwtService.createRefreshToken(user.id),
        accessToken: jwtService.createToken({
          userId: user.id,
          role: user.role,
          permissions: user.permissions || [],
          sessionId: sessionId
        })
      };

      // Lưu session
      this.sessions.set(sessionId, session);
      
      // Lưu vào localStorage
      this.saveSessionToStorage(session);
      
      // Log session creation
      logService.log('auth', 'Session created', {
        userId: user.id,
        sessionId: sessionId,
        deviceInfo: session.deviceInfo
      });

      console.log('✅ Session created successfully:', sessionId);
      return session;
    } catch (error) {
      console.error('❌ Error creating session:', error);
      throw new Error('Failed to create session');
    }
  }

  // Lấy session theo ID
  getSession(sessionId) {
    if (!sessionId) return null;
    
    const session = this.sessions.get(sessionId);
    if (!session) return null;
    
    // Kiểm tra session có hết hạn không
    if (Date.now() > session.expiresAt) {
      this.destroySession(sessionId);
      return null;
    }
    
    return session;
  }

  // Lấy session từ storage
  getSessionFromStorage() {
    try {
      const sessionData = localStorage.getItem('mia_auth_session');
      if (!sessionData) return null;
      
      const session = JSON.parse(sessionData);
      
      // Kiểm tra session có hợp lệ không
      if (!this.isValidSession(session)) {
        this.clearSessionFromStorage();
        return null;
      }
      
      return session;
    } catch (error) {
      console.error('❌ Error getting session from storage:', error);
      this.clearSessionFromStorage();
      return null;
    }
  }

  // Cập nhật session
  updateSession(sessionId, updates) {
    const session = this.sessions.get(sessionId);
    if (!session) return null;
    
    const updatedSession = {
      ...session,
      ...updates,
      lastActivity: Date.now()
    };
    
    this.sessions.set(sessionId, updatedSession);
    this.saveSessionToStorage(updatedSession);
    
    return updatedSession;
  }

  // Refresh session
  refreshSession(sessionId) {
    const session = this.sessions.get(sessionId);
    if (!session) return null;
    
    try {
      // Tạo access token mới
      const newAccessToken = jwtService.createToken({
        userId: session.userId,
        role: session.userRole,
        permissions: session.userPermissions,
        sessionId: sessionId
      });
      
      // Cập nhật session
      const updatedSession = this.updateSession(sessionId, {
        accessToken: newAccessToken,
        lastActivity: Date.now()
      });
      
      console.log('✅ Session refreshed successfully:', sessionId);
      return updatedSession;
    } catch (error) {
      console.error('❌ Error refreshing session:', error);
      return null;
    }
  }

  // Xóa session
  destroySession(sessionId) {
    const session = this.sessions.get(sessionId);
    if (session) {
      // Log session destruction
      logService.log('auth', 'Session destroyed', {
        userId: session.userId,
        sessionId: sessionId,
        duration: Date.now() - session.createdAt
      });
    }
    
    this.sessions.delete(sessionId);
    this.clearSessionFromStorage();
    
    console.log('✅ Session destroyed:', sessionId);
    return true;
  }

  // Xóa tất cả sessions của user
  destroyUserSessions(userId) {
    const userSessions = Array.from(this.sessions.values())
      .filter(session => session.userId === userId);
    
    userSessions.forEach(session => {
      this.destroySession(session.id);
    });
    
    console.log(`✅ Destroyed ${userSessions.length} sessions for user:`, userId);
    return userSessions.length;
  }

  // Kiểm tra session có hợp lệ không
  isValidSession(session) {
    if (!session || !session.id || !session.userId) return false;
    
    // Kiểm tra session có tồn tại trong memory không
    const memorySession = this.sessions.get(session.id);
    if (!memorySession) return false;
    
    // Kiểm tra session có hết hạn không
    if (Date.now() > session.expiresAt) return false;
    
    // Kiểm tra access token
    const tokenVerification = jwtService.verifyToken(session.accessToken);
    if (!tokenVerification.valid) return false;
    
    return true;
  }

  // Lưu session vào storage
  saveSessionToStorage(session) {
    try {
      localStorage.setItem('mia_auth_session', JSON.stringify(session));
    } catch (error) {
      console.error('❌ Error saving session to storage:', error);
    }
  }

  // Xóa session khỏi storage
  clearSessionFromStorage() {
    try {
      localStorage.removeItem('mia_auth_session');
    } catch (error) {
      console.error('❌ Error clearing session from storage:', error);
    }
  }

  // Tạo session ID
  generateSessionId() {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2);
    return `session_${timestamp}_${random}`;
  }

  // Lấy tất cả sessions của user
  getUserSessions(userId) {
    return Array.from(this.sessions.values())
      .filter(session => session.userId === userId);
  }

  // Lấy session statistics
  getSessionStatistics() {
    const now = Date.now();
    const activeSessions = Array.from(this.sessions.values())
      .filter(session => session.isActive && now < session.expiresAt);
    
    const expiredSessions = Array.from(this.sessions.values())
      .filter(session => now >= session.expiresAt);
    
    const sessionsByRole = activeSessions.reduce((acc, session) => {
      acc[session.userRole] = (acc[session.userRole] || 0) + 1;
      return acc;
    }, {});
    
    return {
      totalSessions: this.sessions.size,
      activeSessions: activeSessions.length,
      expiredSessions: expiredSessions.length,
      sessionsByRole,
      averageSessionDuration: this.calculateAverageSessionDuration(),
      oldestSession: this.getOldestSession(),
      newestSession: this.getNewestSession()
    };
  }

  // Tính toán thời gian session trung bình
  calculateAverageSessionDuration() {
    const now = Date.now();
    const activeSessions = Array.from(this.sessions.values())
      .filter(session => session.isActive && now < session.expiresAt);
    
    if (activeSessions.length === 0) return 0;
    
    const totalDuration = activeSessions.reduce((acc, session) => {
      return acc + (now - session.createdAt);
    }, 0);
    
    return totalDuration / activeSessions.length;
  }

  // Lấy session cũ nhất
  getOldestSession() {
    const sessions = Array.from(this.sessions.values());
    if (sessions.length === 0) return null;
    
    return sessions.reduce((oldest, current) => {
      return current.createdAt < oldest.createdAt ? current : oldest;
    });
  }

  // Lấy session mới nhất
  getNewestSession() {
    const sessions = Array.from(this.sessions.values());
    if (sessions.length === 0) return null;
    
    return sessions.reduce((newest, current) => {
      return current.createdAt > newest.createdAt ? current : newest;
    });
  }

  // Cleanup expired sessions
  cleanupExpiredSessions() {
    const now = Date.now();
    const expiredSessions = Array.from(this.sessions.entries())
      .filter(([id, session]) => now >= session.expiresAt);
    
    expiredSessions.forEach(([id, session]) => {
      this.destroySession(id);
    });
    
    console.log(`🧹 Cleaned up ${expiredSessions.length} expired sessions`);
    return expiredSessions.length;
  }

  // Bắt đầu cleanup timer
  startCleanupTimer() {
    setInterval(() => {
      this.cleanupExpiredSessions();
    }, this.cleanupInterval);
  }

  // Dừng cleanup timer
  stopCleanupTimer() {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }
  }

  // Lấy session theo device
  getSessionsByDevice(deviceInfo) {
    return Array.from(this.sessions.values())
      .filter(session => {
        return session.deviceInfo.userAgent === deviceInfo.userAgent &&
               session.deviceInfo.platform === deviceInfo.platform;
      });
  }

  // Kiểm tra session limit
  checkSessionLimit(userId) {
    const userSessions = this.getUserSessions(userId);
    return userSessions.length < this.maxSessions;
  }

  // Force logout tất cả sessions
  forceLogoutAll() {
    const sessionCount = this.sessions.size;
    this.sessions.clear();
    this.clearSessionFromStorage();
    
    console.log(`🚪 Force logged out ${sessionCount} sessions`);
    return sessionCount;
  }

  // Export sessions data
  exportSessions() {
    return Array.from(this.sessions.values()).map(session => ({
      id: session.id,
      userId: session.userId,
      userRole: session.userRole,
      createdAt: session.createdAt,
      lastActivity: session.lastActivity,
      expiresAt: session.expiresAt,
      deviceInfo: session.deviceInfo
    }));
  }

  // Import sessions data
  importSessions(sessionsData) {
    try {
      sessionsData.forEach(sessionData => {
        this.sessions.set(sessionData.id, sessionData);
      });
      
      console.log(`📥 Imported ${sessionsData.length} sessions`);
      return true;
    } catch (error) {
      console.error('❌ Error importing sessions:', error);
      return false;
    }
  }
}

export const sessionManager = new SessionManager();
export default sessionManager;
