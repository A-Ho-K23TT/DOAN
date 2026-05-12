import axios from 'axios';

// 1. Kiểm tra và lấy URL Backend từ biến môi trường
// Đảm bảo bạn đã đặt VITE_API_URL trong file .env (local) và Render Dashboard
const API_BASE_URL = import.meta.env.VITE_API_URL;

const SESSION_KEY = "qlhb_admin_session";

// 2. Khởi tạo instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Quan trọng để gửi Cookie/Session
  headers: {
    "Content-Type": "application/json",
  },
});

// 3. Hàm đọc Token an toàn
const readStoredToken = () => {
  try {
    const rawSession = localStorage.getItem(SESSION_KEY);
    if (!rawSession) return "";
    const parsed = JSON.parse(rawSession);
    return parsed?.token || parsed?.accessToken || "";
  } catch {
    return "";
  }
};

// 4. Interceptor cho Request (Tự động đính kèm Token)
apiClient.interceptors.request.use((config) => {
  const token = readStoredToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    config.headers.token = token; // Hỗ trợ cả 2 cách gửi token
  }

  // Xử lý tự động cho FormData (khi upload file)
  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  }

  return config;
});

// 5. Interceptor cho Response (Xử lý lỗi tập trung)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      "Lỗi kết nối hệ thống.";
    return Promise.reject(new Error(message));
  }
);

export const unwrapResponse = (response) => {
  return response?.data?.data ?? response?.data ?? null;
};

export default apiClient;
