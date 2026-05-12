import apiClient, { unwrapResponse } from "./apiClient";

const SESSION_KEY = "qlhb_admin_session";

const readSession = () => {
  try {
    const rawSession = localStorage.getItem(SESSION_KEY);
    if (!rawSession) return null;

    return JSON.parse(rawSession);
  } catch {
    return null;
  }
};

const writeSession = (session) => {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
};

export const loadSession = () => readSession();

export const clearSession = () => {
  localStorage.removeItem(SESSION_KEY);
};

export const signInAdmin = async (username, password) => {
  if (!username || !password) {
    throw new Error("Vui lòng nhập đầy đủ thông tin.");
  }

  const response = await apiClient.post("/auth/login", {
    identifier: username,
    username,
    password,
  });

  const data = unwrapResponse(response) || {};
  const token = data.accessToken || data.token;
  const profile = data.profile || data.user || null;

  if (!token) {
    throw new Error("Đăng nhập thất bại.");
  }

  if (profile?.vaitro && profile.vaitro !== "ad") {
    throw new Error("Tài khoản không có quyền admin.");
  }

  const session = {
    token,
    accessToken: token,
    profile: profile || {
      hoten: username,
      tendangnhap: username,
      vaitro: "ad",
    },
  };

  writeSession(session);
  return session;
};

export const signOut = () => {
  clearSession();
};