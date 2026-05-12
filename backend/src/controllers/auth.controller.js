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