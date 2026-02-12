import axios from 'axios';

// Tạo axios instance với cấu hình mặc định
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://api.example.com',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - thêm token vào header
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - xử lý lỗi chung
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      // Xử lý các mã lỗi HTTP
      switch (error.response.status) {
        case 401:
          // Unauthorized - xóa token và redirect về login
          localStorage.removeItem('token');
          window.location.href = '/login';
          break;
        case 403:
          console.error('Forbidden: Bạn không có quyền truy cập');
          break;
        case 404:
          console.error('Not Found: Tài nguyên không tồn tại');
          break;
        case 500:
          console.error('Server Error: Lỗi máy chủ');
          break;
        default:
          console.error('Error:', error.response.data.message || 'Đã xảy ra lỗi');
      }
    } else if (error.request) {
      console.error('Network Error: Không thể kết nối đến server');
    } else {
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
