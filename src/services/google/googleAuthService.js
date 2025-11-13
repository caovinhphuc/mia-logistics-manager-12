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
      console.log(
        '🔧 Google API temporarily disabled to avoid iframe sandboxing errors'
      );
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
      console.log(
        '🔧 Google API loading disabled to avoid iframe sandboxing errors'
      );
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
      console.log('🔐 ========================================');
      console.log('🔐 Bắt đầu quá trình đăng nhập...');
      console.log('🔐 Email:', email);
      console.log(
        '🔐 REACT_APP_USE_MOCK_DATA:',
        process.env.REACT_APP_USE_MOCK_DATA
      );
      console.log('🔐 NODE_ENV:', process.env.NODE_ENV);

      // Ưu tiên: Gọi backend API để login (dữ liệu thật từ Google Sheets)
      try {
        console.log('🔐 [STEP 1] Đang import authService...');
        let authService;
        try {
          const authModule = await import('../api/authService');
          authService = authModule.authService || authModule.default;
          console.log('🔐 [STEP 1.1] Import thành công:', {
            hasAuthService: !!authService,
            hasDefault: !!authModule.default,
            hasNamed: !!authModule.authService,
            moduleKeys: Object.keys(authModule),
          });
        } catch (importError) {
          console.error('❌ [STEP 1] Import authService failed:', importError);
          throw importError;
        }

        if (!authService) {
          throw new Error('authService không được export đúng cách');
        }

        console.log('🔐 [STEP 2] authService imported:', !!authService);
        console.log('🔐 [STEP 3] Gọi POST /api/auth/login với:', {
          email,
          password: '***',
        });
        const result = await authService.login(email, password);
        console.log('🔐 [STEP 4] Backend API response received:', {
          success: result.success,
          hasUser: !!result.user,
          error: result.error,
        });

        console.log('📡 Backend API response:', {
          success: result.success,
          hasUser: !!result.user,
          error: result.error,
        });

        if (result.success && result.user) {
          console.log('🔐 [STEP 5] Mapping user data...');
          // Map backend user data sang format frontend cần
          const sessionUser = {
            id: result.user.id,
            email: result.user.email,
            name: result.user.fullName || result.user.name,
            role: result.user.roleId || result.user.role || 'user',
            picture: result.user.avatarUrl || result.user.avatar_url || '',
            loginMethod: 'email',
            lastLogin:
              result.user.lastLogin ||
              result.user.last_login ||
              new Date().toISOString(),
            isActive:
              result.user.status === 'active' || result.user.isActive !== false,
          };

          this.currentUser = sessionUser;
          console.log(
            '✅ Đăng nhập thành công qua backend API:',
            sessionUser.email
          );
          console.log('🔐 ========================================');
          return sessionUser;
        } else {
          // API trả về error - không fallback, throw error ngay
          const errorMsg = result.error || 'Đăng nhập thất bại';
          console.error('❌ [STEP 6] Backend API trả về lỗi:', errorMsg);
          console.log('🔐 ========================================');
          throw new Error(errorMsg);
        }
      } catch (apiError) {
        // Log chi tiết lỗi
        console.error('❌ [ERROR] Backend API call failed:', {
          message: apiError.message,
          response: apiError.response?.data,
          status: apiError.response?.status,
          code: apiError.code,
          stack: apiError.stack,
        });

        // KHÔNG fallback về mock data hoặc Google Sheets trực tiếp
        // Chỉ dùng backend API - nếu fail thì throw error
        const errorMessage =
          apiError.response?.data?.error ||
          apiError.message ||
          'Không thể kết nối đến server. Vui lòng thử lại sau.';
        console.error('❌ Backend API không available:', errorMessage);
        console.error(
          '❌ Không fallback về mock data hoặc Google Sheets trực tiếp'
        );
        console.error(
          '❌ Vui lòng đảm bảo backend đang chạy và proxy hoạt động đúng'
        );
        throw new Error(errorMessage);
      }
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
