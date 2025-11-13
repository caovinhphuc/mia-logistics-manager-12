/**
 * Authentication Service
 * Gọi backend API để xác thực user thay vì dùng mock data
 */
import apiClient from './apiClient';
import { auth as authEndpoints } from './endpoints';

class AuthService {
  /**
   * Login với email và password
   * @param {string} email
   * @param {string} password
   * @returns {Promise<{success: boolean, user?: object, error?: string}>}
   */
  async login(email, password) {
    try {
      const response = await apiClient.post(authEndpoints.login(), {
        email,
        password,
      });

      if (response.data.success && response.data.user) {
        // Lưu token nếu có
        if (response.data.token) {
          localStorage.setItem('authToken', response.data.token);
        }

        return {
          success: true,
          user: response.data.user,
        };
      }

      return {
        success: false,
        error: response.data.error || 'Đăng nhập thất bại',
      };
    } catch (error) {
      console.error('❌ Login API error:', error);
      return {
        success: false,
        error:
          error.response?.data?.error ||
          error.message ||
          'Không thể kết nối đến server',
      };
    }
  }

  /**
   * Logout
   * @returns {Promise<{success: boolean}>}
   */
  async logout() {
    try {
      await apiClient.post(authEndpoints.logout());
      localStorage.removeItem('authToken');
      return { success: true };
    } catch (error) {
      console.error('❌ Logout API error:', error);
      // Vẫn xóa token dù API fail
      localStorage.removeItem('authToken');
      return { success: true };
    }
  }

  /**
   * Lấy thông tin user hiện tại
   * @param {string} userId
   * @returns {Promise<{success: boolean, user?: object, error?: string}>}
   */
  async getCurrentUser(userId) {
    try {
      const response = await apiClient.get(authEndpoints.me(), {
        params: { userId },
        headers: {
          'x-user-id': userId,
        },
      });

      return {
        success: true,
        user: response.data,
      };
    } catch (error) {
      console.error('❌ Get current user API error:', error);
      return {
        success: false,
        error:
          error.response?.data?.error ||
          error.message ||
          'Không thể lấy thông tin user',
      };
    }
  }

  /**
   * Đổi mật khẩu
   * @param {string} userId
   * @param {string} oldPassword
   * @param {string} newPassword
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async changePassword(userId, oldPassword, newPassword) {
    try {
      const response = await apiClient.put(authEndpoints.changePassword(), {
        userId,
        oldPassword,
        newPassword,
      });

      return {
        success: response.data.success || false,
        error: response.data.error,
      };
    } catch (error) {
      console.error('❌ Change password API error:', error);
      return {
        success: false,
        error:
          error.response?.data?.error ||
          error.message ||
          'Không thể đổi mật khẩu',
      };
    }
  }

  /**
   * Đăng ký user mới
   * @param {object} userData - {email, password, fullName, roleId?}
   * @returns {Promise<{success: boolean, user?: object, error?: string}>}
   */
  async register(userData) {
    try {
      const response = await apiClient.post(authEndpoints.register(), userData);

      if (response.data.success && response.data.user) {
        return {
          success: true,
          user: response.data.user,
        };
      }

      return {
        success: false,
        error: response.data.error || 'Đăng ký thất bại',
      };
    } catch (error) {
      console.error('❌ Register API error:', error);
      return {
        success: false,
        error:
          error.response?.data?.error ||
          error.message ||
          'Không thể đăng ký',
      };
    }
  }
}

export const authService = new AuthService();
export default authService;

