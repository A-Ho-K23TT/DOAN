import asyncHandler from "../utils/asyncHandler.js";
import { login, registerStudent } from "../services/auth.service.js";
import { sendSuccess } from "../utils/response.js";

export const loginHandler = asyncHandler(async (req, res) => {
  const result = await login(req.body);
  return sendSuccess(res, "Đăng nhập thành công", result);
});

export const registerHandler = asyncHandler(async (req, res) => {
  const result = await registerStudent(req.body);
  return sendSuccess(res, "Đăng ký thành công", result, 201);
});

try {
  export const loginHandler = asyncHandler(async (req, res) => {
  const result = await login(req.body);
  return sendSuccess(res, "Đăng nhập thành công", result);
});
} catch (error) {
  console.error("🔥 LỖI ĐĂNG NHẬP CHI TIẾT:", error); // THÊM DÒNG NÀY
  res.status(500).json({ success: false, message: "Đã xảy ra lỗi máy chủ" });
}