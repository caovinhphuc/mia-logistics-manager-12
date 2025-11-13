import axios from 'axios';
import { toast } from 'react-hot-toast';

// Base API URL
// Trong development với proxy: dùng relative URL
// Trong production: dùng absolute URL từ env
const getApiBaseUrl = () => {
  // Nếu có REACT_APP_API_URL, dùng nó (production)
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }

  // Nếu có REACT_APP_BACKEND_URL, dùng nó
  if (process.env.REACT_APP_BACKEND_URL) {
    return process.env.REACT_APP_BACKEND_URL;
  }

  // Development mode: dùng relative URL để proxy hoạt động
  // Proxy sẽ forward /api/* requests đến backend
  if (process.env.NODE_ENV === 'development') {
    return ''; // Relative URL - proxy sẽ handle
  }

  // Fallback
  return 'http://localhost:5050';
};

const API_BASE_URL = getApiBaseUrl();
const baseURL = API_BASE_URL ? `${API_BASE_URL}/api` : '/api';

// Create Axios instance với default config
const apiClient = axios.create({
  baseURL,
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Để gửi cookies nếu cần
});

// Request Interceptor - Thêm auth token, logging
apiClient.interceptors.request.use(
  (config) => {
    // Lấy token từ localStorage hoặc sessionStorage
    const token =
      localStorage.getItem('authToken') || sessionStorage.getItem('authToken');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log request trong development
    if (process.env.NODE_ENV === 'development') {
      console.log(
        `[API Request] ${config.method?.toUpperCase()} ${config.url}`,
        {
          data: config.data,
          params: config.params,
        }
      );
    }

    return config;
  },
  (error) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

// Response Interceptor - Xử lý errors, logging
apiClient.interceptors.response.use(
  (response) => {
    // Log response trong development
    if (process.env.NODE_ENV === 'development') {
      console.log(
        `[API Response] ${response.config.method?.toUpperCase()} ${response.config.url}`,
        {
          status: response.status,
          data: response.data,
        }
      );
    }

    // Nếu response có success: false, vẫn throw error
    if (response.data && response.data.success === false) {
      const error = new Error(
        response.data.error || response.data.message || 'Request failed'
      );
      error.response = response;
      return Promise.reject(error);
    }

    return response;
  },
  (error) => {
    // Xử lý lỗi từ server
    const errorMessage =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      'Có lỗi xảy ra. Vui lòng thử lại.';

    // Log error
    console.error('[API Error]', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message: errorMessage,
      data: error.response?.data,
    });

    // Hiển thị toast notification
    if (error.response) {
      // Server responded with error status
      switch (error.response.status) {
        case 401:
          // Unauthorized - có thể redirect đến login
          toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
          // Có thể dispatch logout action ở đây
          break;
        case 403:
          toast.error('Bạn không có quyền thực hiện thao tác này.');
          break;
        case 404:
          toast.error('Không tìm thấy dữ liệu.');
          break;
        case 500:
          toast.error('Lỗi server. Vui lòng thử lại sau.');
          break;
        default:
          toast.error(errorMessage);
      }
    } else if (error.request) {
      // Request was made but no response received
      toast.error(
        'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.'
      );
    } else {
      // Something else happened
      toast.error(errorMessage);
    }

    return Promise.reject(error);
  }
);

// Helper functions để dễ sử dụng
export const api = {
  get: (url, config = {}) => apiClient.get(url, config),
  post: (url, data, config = {}) => apiClient.post(url, data, config),
  put: (url, data, config = {}) => apiClient.put(url, data, config),
  patch: (url, data, config = {}) => apiClient.patch(url, data, config),
  delete: (url, config = {}) => apiClient.delete(url, config),
};

// Export default instance
export default apiClient;
