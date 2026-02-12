import axios from 'axios';

// Tạo axios instance để gọi backend local (không gọi trực tiếp API bên ngoài)
const axiosInstance = axios.create({
  // Ưu tiên dùng Vite proxy để tránh hardcode localhost (hữu ích khi truy cập bằng IP/LAN/mobile)
  // Nếu cần override thì set VITE_BACKEND_URL trong .env
  baseURL: import.meta.env.VITE_BACKEND_URL || '/api',
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
