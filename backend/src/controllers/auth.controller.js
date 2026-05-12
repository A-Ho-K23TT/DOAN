import asyncHandler from "../utils/asyncHandler.js";
import { login, registerStudent } from "../services/auth.service.js";
import { sendSuccess } from "../utils/response.js";

// 1. Handler Đăng nhập
export const loginHandler = asyncHandler(async (req, res) => {
  try {
    const result = await login(req.body);
    return sendSuccess(res, "Đăng nhập thành công", result);
  } catch (error) {
    // Đây là nơi bạn bắt lỗi thực tế khi chạy
    console.error("🔥 LỖI ĐĂNG NHẬP CHI TIẾT:", error);
    // Quăng lỗi ra để asyncHandler hoặc middleware xử lý lỗi trung tâm nhận diện
    throw error; 
  }
});

// 2. Handler Đăng ký
export const registerHandler = asyncHandler(async (req, res) => {
  const result = await registerStudent(req.body);
  return sendSuccess(res, "Đăng ký thành công", result, 201);
});
