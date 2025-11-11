// Google Authentication Service
import { log } from '../logging/logger';

class GoogleAuthService {
  constructor() {
    this.isInitialized = false;
    this.authInstance = null;
    this.currentUser = null;
  }

  // Khởi tạo Google Auth
  async initialize() {
    if (this.isInitialized) return;

    try {
      // Check if Google services are enabled
      if (
        process.env.REACT_APP_ENABLE_GOOGLE_SHEETS === 'false' ||
        process.env.REACT_APP_GOOGLE_CLIENT_ID === 'disabled'
      ) {
        console.log('🔧 Google API disabled in environment configuration');
        this.isInitialized = true;
        this.authInstance = null;
        return;
      }

      // Temporarily disable Google API to avoid iframe sandboxing errors
      console.log('🔧 Google API temporarily disabled to avoid iframe sandboxing errors');
      this.isInitialized = true;
      this.authInstance = null;

      // Skip Google API loading for now
      // await this.loadGoogleAPI();
      // await window.gapi.load('auth2', async () => { ... });
    } catch (error) {
      console.error('Lỗi khởi tạo Google Auth:', error);
      this.isInitialized = true;
      this.authInstance = null;
    }
  }

  // Load Google API script - DISABLED to avoid iframe sandboxing errors
  loadGoogleAPI() {
    return new Promise((resolve, reject) => {
      // Skip loading Google API to avoid iframe sandboxing errors
      console.log('🔧 Google API loading disabled to avoid iframe sandboxing errors');
      resolve();
    });
  }

  // Đăng nhập với Google
  async loginWithGoogle(googleToken = null) {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      let authResult;

      if (googleToken) {
        // Sử dụng token có sẵn
        authResult = await this.authInstance.signIn();
      } else {
        // Đăng nhập mới
        authResult = await this.authInstance.signIn();
      }

      const profile = authResult.getBasicProfile();
      const authResponse = authResult.getAuthResponse();

      const user = {
        id: profile.getId(),
        email: profile.getEmail(),
        name: profile.getName(),
        imageUrl: profile.getImageUrl(),
        role: 'user', // Mặc định role
        permissions: ['read:all'], // Mặc định permissions
        googleToken: authResponse.access_token,
        googleRefreshToken: authResponse.refresh_token,
        loginMethod: 'google',
      };

      this.currentUser = user;
      return user;
    } catch (error) {
      console.error('Lỗi đăng nhập Google:', error);
      throw new Error('Đăng nhập Google thất bại: ' + error.message);
    }
  }

  // Đăng nhập thông thường (email/password)
  async login(email, password) {
    try {
      console.log('🔐 Bắt đầu quá trình đăng nhập...');

      // Import userService dynamically to avoid circular dependency
      const { userService } = await import('../user/userService');

      // Tìm user trong database
      const user = await userService.getUserByEmail(email);

      if (!user) {
        throw new Error('Không tìm thấy người dùng với email này');
      }

      // Kiểm tra trạng thái tài khoản
      if (!user.isActive) {
        throw new Error('Tài khoản đã bị vô hiệu hóa');
      }

      // Validate password
      const bcrypt = await import('bcryptjs');
      const isValidPassword = await bcrypt.compare(password, user.passwordHash);

      if (!isValidPassword) {
        throw new Error('Mật khẩu không đúng');
      }

      // Cập nhật thông tin đăng nhập
      const loginTime = new Date().toISOString();
      await userService.updateLastLogin(user.id);

      // Tạo user object cho session
      const sessionUser = {
        id: user.id,
        email: user.email,
        name: user.fullName,
        role: user.role || 'user',
        picture: user.avatarUrl,
        loginMethod: 'email',
        lastLogin: loginTime,
        isActive: user.isActive,
      };

      this.currentUser = sessionUser;
      console.log('✅ Đăng nhập thành công:', sessionUser.email);

      return sessionUser;
    } catch (error) {
      console.error('❌ Lỗi đăng nhập:', error);
      throw error;
    }
  }

  // Đăng xuất
  async logout() {
    try {
      if (this.authInstance && this.authInstance.isSignedIn.get()) {
        await this.authInstance.signOut();
      }

      this.currentUser = null;
    } catch (error) {
      console.error('Lỗi đăng xuất:', error);
      // Vẫn xóa user local
      this.currentUser = null;
    }
  }

  // Lấy thông tin user hiện tại
  getCurrentUser() {
    return this.currentUser;
  }

  // Kiểm tra có phải Google user không
  isGoogleUser() {
    return this.currentUser?.loginMethod === 'google';
  }

  // Kiểm tra đã đăng nhập chưa
  isSignedIn() {
    return !!this.currentUser;
  }

  // Lấy access token
  getAccessToken() {
    if (!this.isSignedIn()) return null;

    if (this.isGoogleUser()) {
      return this.currentUser.googleToken;
    }

    return this.currentUser.accessToken;
  }

  // Lấy auth headers
  async getAuthHeaders() {
    // Check if we're in mock mode
    if (!this.authInstance) {
      log.mockMode('No auth instance available, returning mock headers');
      return {
        Authorization: `Bearer mock-token`,
        'Content-Type': 'application/json',
      };
    }

    const token = this.getAccessToken();
    if (!token) {
      log.mockMode('No access token available, returning mock headers');
      return {
        Authorization: `Bearer mock-token`,
        'Content-Type': 'application/json',
      };
    }

    return {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  // Làm mới token
  async refreshToken() {
    try {
      if (!this.isGoogleUser()) {
        throw new Error('Chỉ hỗ trợ refresh token cho Google user');
      }

      if (!this.authInstance) {
        await this.initialize();
      }

      const authInstance = this.authInstance;
      const user = authInstance.currentUser.get();

      if (user.isSignedIn()) {
        const authResponse = user.getAuthResponse(true); // Force refresh
        this.currentUser.googleToken = authResponse.access_token;
        return authResponse.access_token;
      }

      throw new Error('User chưa đăng nhập');
    } catch (error) {
      console.error('Lỗi refresh token:', error);
      throw error;
    }
  }

  // Kiểm tra quyền truy cập
  hasPermission(permission) {
    if (!this.currentUser) return false;

    return (
      this.currentUser.permissions?.includes(permission) ||
      this.currentUser.permissions?.includes('read:all') ||
      this.currentUser.role === 'admin'
    );
  }

  // Kiểm tra vai trò
  hasRole(role) {
    if (!this.currentUser) return false;

    return this.currentUser.role === role || this.currentUser.role === 'admin';
  }

  // Cập nhật thông tin user
  updateUser(userData) {
    if (this.currentUser) {
      this.currentUser = { ...this.currentUser, ...userData };
    }
  }

  // Lấy thông tin profile
  getProfile() {
    if (!this.currentUser) return null;

    return {
      id: this.currentUser.id,
      email: this.currentUser.email,
      name: this.currentUser.name,
      imageUrl: this.currentUser.imageUrl,
      role: this.currentUser.role,
      permissions: this.currentUser.permissions,
    };
  }

  // Kiểm tra kết nối
  async checkConnection() {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      return this.authInstance && this.authInstance.isSignedIn.get();
    } catch (error) {
      console.error('Lỗi kiểm tra kết nối:', error);
      return false;
    }
  }

  // Lấy thông tin kết nối
  getConnectionInfo() {
    return {
      isInitialized: this.isInitialized,
      isSignedIn: this.isSignedIn(),
      isGoogleUser: this.isGoogleUser(),
      hasAuthInstance: !!this.authInstance,
    };
  }
}

// Tạo instance duy nhất
export const googleAuthService = new GoogleAuthService();
