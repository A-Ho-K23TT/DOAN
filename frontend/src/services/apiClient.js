import axios from "axios";

const normalizeBackendUrl = (url) => String(url || "http://localhost:4000").replace(/\/+$/, "").replace(/\/api$/, "");

const API_BASE_URL = normalizeBackendUrl(import.meta.env.VITE_BACKEND_URL);
const SESSION_KEY = "qlhb_student_session";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

const readStoredToken = () => {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return "";
    const parsed = JSON.parse(raw);
    return parsed?.token || parsed?.accessToken || parsed?.jwt || "";
  } catch {
    return "";
  }
};

apiClient.interceptors.request.use((config) => {
  const token = readStoredToken();
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (typeof FormData !== "undefined" && config.data instanceof FormData) {
    config.headers = config.headers || {};
    if (typeof config.headers.delete === "function") {
      config.headers.delete("Content-Type");
    } else {
      delete config.headers["Content-Type"];
      delete config.headers["content-type"];
    }
  }

  return config;
});

apiClient.interceptors.response.use((res) => res, (err) => {
  const message = err.response?.data?.message || err.response?.data?.error || err.message || "Không thể kết nối API.";
  return Promise.reject(new Error(message));
});

export const unwrapResponse = (response) => {
  const payload = response?.data;
  if (payload && typeof payload === "object" && "data" in payload) return payload.data;
  return payload ?? null;
};

export default apiClient;
