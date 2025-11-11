// Auth Service - Xử lý đăng nhập và xác thực
import { permissionService } from './permissionService';
import { roleService } from './roleService';
import { userService } from './userService';

export class AuthService {
  constructor() {
    this.currentUser = null;
    this.sessionToken = null;
  }

  // Hash password với bcrypt (mock implementation)
  async hashPassword(password) {
    // Trong thực tế, sử dụng bcrypt
    // const bcrypt = require('bcrypt');
    // return await bcrypt.hash(password, 10);

    // Mock hash cho demo
    return `$2b$10$${password}${Math.random().toString(36).substring(7)}`;
  }

  // Verify password với bcrypt (mock implementation)
  async verifyPassword(password, hash) {
    // Trong thực tế, sử dụng bcrypt
    // const bcrypt = require('bcrypt');
    // return await bcrypt.compare(password, hash);

    // Mock verify cho demo - kiểm tra các password phổ biến
    const commonPasswords = {
      'admin123': true,
      'admin': true,
      'password': true,
      '123456': true
    };

    // Nếu hash chứa password hoặc là password phổ biến
    return hash.includes(password) || commonPasswords[password] === true;
  }

  // Đăng nhập với username/email và password
  async login(credentials) {
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
        console.log('⚠️ User isActive:', user.isActive, 'Type:', typeof user.isActive);
        console.log('⚠️ User data:', user);
        throw new Error('Tài khoản đã bị vô hiệu hóa');
      }

      // Verify password
      console.log('🔍 Debug password verification:');
      console.log('- Input password:', password);
      console.log('- User password hash:', user.passwordHash);

      const isValidPassword = await this.verifyPassword(password, user.passwordHash);
      console.log('- Password valid:', isValidPassword);

      if (!isValidPassword) {
        throw new Error('Mật khẩu không đúng');
      }

      // Lấy thông tin role và permissions
      const role = await roleService.getRoleById(user.roleId);
      const permissions = await permissionService.getPermissionsByRole(user.roleId);

      // Tạo session token (mock JWT)
      const sessionToken = this.generateSessionToken(user);

      // Cập nhật last login (tạm thời disable vì lỗi Google Sheets API)
      // await userService.updateLastLogin(user.id);
      console.log('ℹ️ Bỏ qua cập nhật last_login do lỗi Google Sheets API');

      // Lưu thông tin user hiện tại
      this.currentUser = {
        ...user,
        role: role,
        permissions: permissions.map(p => p.permissionCode)
      };
      this.sessionToken = sessionToken;

      console.log(`✅ Đăng nhập thành công: ${user.username || user.email || 'Unknown'}`);

      return {
        success: true,
        user: this.currentUser,
        token: sessionToken
      };

    } catch (error) {
      console.error('❌ Lỗi đăng nhập:', error);
      throw error;
    }
  }

  // Đăng xuất
  async logout() {
    try {
      console.log('🔄 Đang xử lý đăng xuất...');

      this.currentUser = null;
      this.sessionToken = null;

      console.log('✅ Đăng xuất thành công');
      return { success: true };
    } catch (error) {
      console.error('❌ Lỗi đăng xuất:', error);
      throw error;
    }
  }

  // Kiểm tra quyền
  hasPermission(permissionCode) {
    if (!this.currentUser) {
      return false;
    }

    return this.currentUser.permissions.includes(permissionCode) ||
           this.currentUser.permissions.includes('read:all');
  }

  // Kiểm tra role
  hasRole(roleCode) {
    if (!this.currentUser) {
      return false;
    }

    return this.currentUser.role?.code === roleCode ||
           this.currentUser.role?.code === 'admin';
  }

  // Kiểm tra bất kỳ role nào
  hasAnyRole(roleCodes) {
    if (!this.currentUser) {
      return false;
    }

    return roleCodes.some(roleCode => this.hasRole(roleCode));
  }

  // Lấy thông tin user hiện tại
  getCurrentUser() {
    return this.currentUser;
  }

  // Kiểm tra đã đăng nhập chưa
  isAuthenticated() {
    return !!this.currentUser && !!this.sessionToken;
  }

  // Tạo session token (mock JWT)
  generateSessionToken(user) {
    const payload = {
      userId: user.id,
      username: user.username,
      role: user.roleId,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
    };

    // Mock JWT token
    return `mock_jwt_${btoa(JSON.stringify(payload))}`;
  }

  // Verify session token
  verifySessionToken(token) {
    try {
      if (!token || !token.startsWith('mock_jwt_')) {
        return false;
      }

      const payload = JSON.parse(atob(token.replace('mock_jwt_', '')));
      const now = Math.floor(Date.now() / 1000);

      if (payload.exp < now) {
        return false;
      }

      return true;
    } catch (error) {
      return false;
    }
  }

  // Refresh session
  async refreshSession() {
    if (!this.currentUser) {
      throw new Error('Chưa đăng nhập');
    }

    const user = await userService.getUserById(this.currentUser.id);
    if (!user || !user.isActive) {
      throw new Error('Tài khoản không hợp lệ');
    }

    const role = await roleService.getRoleById(user.roleId);
    const permissions = await permissionService.getPermissionsByRole(user.roleId);

    this.currentUser = {
      ...user,
      role: role,
      permissions: permissions.map(p => p.permissionCode)
    };

    this.sessionToken = this.generateSessionToken(user);

    return {
      success: true,
      user: this.currentUser,
      token: this.sessionToken
    };
  }

  // Đổi mật khẩu
  async changePassword(userId, oldPassword, newPassword) {
    try {
      const user = await userService.getUserById(userId);
      if (!user) {
        throw new Error('Không tìm thấy người dùng');
      }

      const isValidOldPassword = await this.verifyPassword(oldPassword, user.passwordHash);
      if (!isValidOldPassword) {
        throw new Error('Mật khẩu cũ không đúng');
      }

      const newPasswordHash = await this.hashPassword(newPassword);
      await userService.updateUser(userId, { password_hash: newPasswordHash });

      console.log('✅ Đổi mật khẩu thành công');
      return { success: true };
    } catch (error) {
      console.error('❌ Lỗi đổi mật khẩu:', error);
      throw error;
    }
  }

  // Reset password (admin only)
  async resetPassword(userId, newPassword) {
    try {
      if (!this.hasPermission('manage:users')) {
        throw new Error('Không có quyền reset mật khẩu');
      }

      const newPasswordHash = await this.hashPassword(newPassword);
      await userService.updateUser(userId, { password_hash: newPasswordHash });

      console.log('✅ Reset mật khẩu thành công');
      return { success: true };
    } catch (error) {
      console.error('❌ Lỗi reset mật khẩu:', error);
      throw error;
    }
  }
}

export const authService = new AuthService();
