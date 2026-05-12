import asyncHandler from "../utils/asyncHandler.js";
import { getFormConfigService, saveFormConfigService } from "../services/scholarship.service.js";
import { sendSuccess } from "../utils/response.js";

export const getFormHandler = asyncHandler(async (req, res) => {
  const form = await getFormConfigService(req.params.hocbongId);
  return sendSuccess(res, "Lấy form thành công", form);
});

export const saveFormHandler = asyncHandler(async (req, res) => {
  const form = await saveFormConfigService(req.params.hocbongId, req.body);
  return sendSuccess(res, "Lưu form thành công", form);
});