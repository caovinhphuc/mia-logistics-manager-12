// Authentication Service - Service chính cho authentication
import { jwtService } from './jwtService';
import { sessionManager } from './sessionManager';
import { securityGuard } from './securityGuard';
import { rolePermissionService } from './rolePermissionService';
import { userService } from '../user/userService';
import { logService } from '../api/logService';

class AuthenticationService {
  constructor() {
    this.currentUser = null;
    this.currentSession = null;
    this.isAuthenticated = false;
  }

  // Đăng nhập
  async login(credentials, deviceInfo = {}) {
    try {
      console.log('🔄 Đang xử lý đăng nhập...');

      const { email, password } = credentials;

      if (!email || !password) {
        throw new Error('Email và password không được để trống');
      }

      // Tìm user theo email
      const user = await userService.getUserByEmail(email);

      if (!user) {
        throw new Error('Không tìm thấy người dùng');
      }

      if (!user.isActive) {
        throw new Error('Tài khoản đã bị vô hiệu hóa');
      }

      // Verify password
      const isValidPassword = await this.verifyPassword(password, user.passwordHash);
      if (!isValidPassword) {
        throw new Error('Mật khẩu không đúng');
      }

      // Lấy thông tin role và permissions
      const role = rolePermissionService.getRoleByCode(user.role);
      const permissions = rolePermissionService.getRolePermissions(user.role);

      // Tạo session
      const session = sessionManager.createSession({
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        permissions: permissions
      }, deviceInfo);

      // Cập nhật trạng thái
      this.currentUser = {
        ...user,
        role: role,
        permissions: permissions
      };
      this.currentSession = session;
      this.isAuthenticated = true;

      // Log successful login
      logService.log('auth', 'Login successful', {
        userId: user.id,
        email: user.email,
        sessionId: session.id,
        deviceInfo: deviceInfo
      });

      console.log(`✅ Đăng nhập thành công: ${user.username || user.email}`);
      return {
        success: true,
        user: this.currentUser,
        session: session,
        token: session.accessToken
      };

    } catch (error) {
      console.error('❌ Lỗi đăng nhập:', error);
      
      // Log failed login
      logService.log('auth', 'Login failed', {
        email: credentials.email,
        error: error.message
      });
      
      throw error;
    }
  }

  // Đăng ký
  async register(userData) {
    try {
      console.log('🔄 Đang xử lý đăng ký...');

      const { username, email, password, fullName, phone } = userData;

      // Kiểm tra user đã tồn tại chưa
      const existingUser = await userService.getUserByEmail(email);
      if (existingUser) {
        throw new Error('Email đã được sử dụng');
      }

      const existingUsername = await userService.getUserByUsername(username);
      if (existingUsername) {
        throw new Error('Tên người dùng đã được sử dụng');
      }

      // Hash password
      const passwordHash = await this.hashPassword(password);

      // Tạo user mới
      const newUser = await userService.createUser({
        username,
        email,
        passwordHash,
        fullName,
        phone,
        role: 'viewer', // Default role
        isActive: true
      });

      // Log successful registration
      logService.log('auth', 'Registration successful', {
        userId: newUser.id,
        email: newUser.email,
        username: newUser.username
      });

      console.log(`✅ Đăng ký thành công: ${newUser.username}`);
      return {
        success: true,
        user: newUser
      };

    } catch (error) {
      console.error('❌ Lỗi đăng ký:', error);
      
      // Log failed registration
      logService.log('auth', 'Registration failed', {
        email: userData.email,
        username: userData.username,
        error: error.message
      });
      
      throw error;
    }
  }

  // Đăng xuất
  async logout(reason = 'User logout') {
    try {
      console.log('🔄 Đang xử lý đăng xuất...');

      if (this.currentSession) {
        // Destroy session
        sessionManager.destroySession(this.currentSession.id);
      }

      // Clear state
      this.currentUser = null;
      this.currentSession = null;
      this.isAuthenticated = false;

      // Log logout
      logService.log('auth', 'Logout', {
        reason: reason,
        timestamp: new Date().toISOString()
      });

      console.log('✅ Đăng xuất thành công');
      return { success: true };

    } catch (error) {
      console.error('❌ Lỗi đăng xuất:', error);
      throw error;
    }
  }

  // Khôi phục mật khẩu
  async resetPassword(email) {
    try {
      console.log('🔄 Đang xử lý khôi phục mật khẩu...');

      const user = await userService.getUserByEmail(email);
      if (!user) {
        throw new Error('Không tìm thấy người dùng');
      }

      // Tạo reset token
      const resetToken = jwtService.createToken({
        userId: user.id,
        email: user.email,
        type: 'password_reset',
        expiresAt: Date.now() + (60 * 60 * 1000) // 1 hour
      });

      // Lưu reset token vào user
      await userService.updateUser(user.id, {
        resetToken: resetToken,
        resetTokenExpires: Date.now() + (60 * 60 * 1000)
      });

      // Gửi email reset (mock implementation)
      await this.sendResetEmail(user.email, resetToken);

      // Log password reset request
      logService.log('auth', 'Password reset requested', {
        userId: user.id,
        email: user.email
      });

      console.log(`✅ Email khôi phục mật khẩu đã được gửi: ${user.email}`);
      return { success: true };

    } catch (error) {
      console.error('❌ Lỗi khôi phục mật khẩu:', error);
      throw error;
    }
  }

  // Đặt lại mật khẩu
  async confirmResetPassword(token, newPassword) {
    try {
      console.log('🔄 Đang xử lý đặt lại mật khẩu...');

      // Verify reset token
      const tokenVerification = jwtService.verifyToken(token);
      if (!tokenVerification.valid) {
        throw new Error('Token không hợp lệ hoặc đã hết hạn');
      }

      const { userId, type } = tokenVerification.payload;
      if (type !== 'password_reset') {
        throw new Error('Token không hợp lệ');
      }

      // Lấy user
      const user = await userService.getUserById(userId);
      if (!user) {
        throw new Error('Không tìm thấy người dùng');
      }

      // Kiểm tra reset token
      if (user.resetToken !== token) {
        throw new Error('Token không khớp');
      }

      if (Date.now() > user.resetTokenExpires) {
        throw new Error('Token đã hết hạn');
      }

      // Hash password mới
      const passwordHash = await this.hashPassword(newPassword);

      // Cập nhật password
      await userService.updateUser(userId, {
        passwordHash: passwordHash,
        resetToken: null,
        resetTokenExpires: null
      });

      // Log password reset
      logService.log('auth', 'Password reset successful', {
        userId: userId,
        email: user.email
      });

      console.log(`✅ Mật khẩu đã được đặt lại: ${user.email}`);
      return { success: true };

    } catch (error) {
      console.error('❌ Lỗi đặt lại mật khẩu:', error);
      throw error;
    }
  }

  // Đổi mật khẩu
  async changePassword(userId, oldPassword, newPassword) {
    try {
      console.log('🔄 Đang xử lý đổi mật khẩu...');

      const user = await userService.getUserById(userId);
      if (!user) {
        throw new Error('Không tìm thấy người dùng');
      }

      // Verify old password
      const isValidOldPassword = await this.verifyPassword(oldPassword, user.passwordHash);
      if (!isValidOldPassword) {
        throw new Error('Mật khẩu cũ không đúng');
      }

      // Hash new password
      const newPasswordHash = await this.hashPassword(newPassword);

      // Update password
      await userService.updateUser(userId, {
        passwordHash: newPasswordHash
      });

      // Log password change
      logService.log('auth', 'Password changed', {
        userId: userId,
        email: user.email
      });

      console.log(`✅ Mật khẩu đã được đổi: ${user.email}`);
      return { success: true };

    } catch (error) {
      console.error('❌ Lỗi đổi mật khẩu:', error);
      throw error;
    }
  }

  // Kiểm tra quyền
  hasPermission(permission) {
    if (!this.currentUser) return false;
    return rolePermissionService.hasPermission(this.currentUser.role, permission);
  }

  // Kiểm tra role
  hasRole(role) {
    if (!this.currentUser) return false;
    return rolePermissionService.hasRole(this.currentUser.role, role);
  }

  // Kiểm tra bất kỳ role nào
  hasAnyRole(roles) {
    if (!this.currentUser) return false;
    return rolePermissionService.hasAnyRole(this.currentUser.role, roles);
  }

  // Kiểm tra quyền truy cập route
  canAccessRoute(route) {
    if (!this.currentUser) return false;
    return securityGuard.canAccessRoute(this.currentUser, route);
  }

  // Kiểm tra quyền truy cập component
  canAccessComponent(componentName) {
    if (!this.currentUser) return false;
    return securityGuard.canAccessComponent(this.currentUser, componentName);
  }

  // Kiểm tra quyền thực hiện action
  canPerformAction(action, resource = null) {
    if (!this.currentUser) return false;
    return securityGuard.canPerformAction(this.currentUser, action, resource);
  }

  // Refresh session
  async refreshSession() {
    try {
      if (!this.currentSession) {
        throw new Error('Không có session để refresh');
      }

      const refreshedSession = sessionManager.refreshSession(this.currentSession.id);
      if (refreshedSession) {
        this.currentSession = refreshedSession;
        return { success: true, session: refreshedSession };
      } else {
        throw new Error('Không thể refresh session');
      }
    } catch (error) {
      console.error('❌ Lỗi refresh session:', error);
      throw error;
    }
  }

  // Khôi phục session từ storage
  async restoreSession() {
    try {
      const session = sessionManager.getSessionFromStorage();
      if (!session) return false;

      // Verify session
      if (!sessionManager.isValidSession(session)) {
        sessionManager.clearSessionFromStorage();
        return false;
      }

      // Lấy user data
      const user = await userService.getUserById(session.userId);
      if (!user || !user.isActive) {
        sessionManager.clearSessionFromStorage();
        return false;
      }

      // Restore state
      this.currentUser = {
        ...user,
        role: session.userRole,
        permissions: session.userPermissions
      };
      this.currentSession = session;
      this.isAuthenticated = true;

      console.log('✅ Session restored successfully');
      return true;
    } catch (error) {
      console.error('❌ Lỗi restore session:', error);
      sessionManager.clearSessionFromStorage();
      return false;
    }
  }

  // Hash password
  async hashPassword(password) {
    // Mock implementation - trong thực tế sử dụng bcrypt
    const salt = Math.random().toString(36).substring(7);
    return `$2b$10$${salt}${password}${salt}`;
  }

  // Verify password
  async verifyPassword(password, hash) {
    // Mock implementation - trong thực tế sử dụng bcrypt
    const commonPasswords = {
      'admin123': true,
      'admin': true,
      'password': true,
      '123456': true
    };

    return hash.includes(password) || commonPasswords[password] === true;
  }

  // Gửi email reset (mock implementation)
  async sendResetEmail(email, token) {
    // Mock implementation - trong thực tế gửi email thật
    console.log(`📧 Reset email sent to ${email} with token: ${token}`);
    return true;
  }

  // Lấy thông tin user hiện tại
  getCurrentUser() {
    return this.currentUser;
  }

  // Lấy session hiện tại
  getCurrentSession() {
    return this.currentSession;
  }

  // Kiểm tra đã đăng nhập chưa
  isLoggedIn() {
    return this.isAuthenticated && !!this.currentUser && !!this.currentSession;
  }

  // Lấy thống kê authentication
  getAuthStatistics() {
    return {
      isAuthenticated: this.isAuthenticated,
      currentUser: this.currentUser ? {
        id: this.currentUser.id,
        username: this.currentUser.username,
        email: this.currentUser.email,
        role: this.currentUser.role
      } : null,
      session: this.currentSession ? {
        id: this.currentSession.id,
        createdAt: this.currentSession.createdAt,
        lastActivity: this.currentSession.lastActivity,
        expiresAt: this.currentSession.expiresAt
      } : null
    };
  }
}

export const authenticationService = new AuthenticationService();
export default authenticationService;
