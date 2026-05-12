import asyncHandler from "../utils/asyncHandler.js";
import {
  createScholarshipService,
  deleteScholarshipService,
  getAllScholarships,
  getScholarshipDetail,
  updateScholarshipService,
} from "../services/scholarship.service.js";
import { sendSuccess } from "../utils/response.js";

export const listScholarshipsHandler = asyncHandler(async (req, res) => {
  const scholarships = await getAllScholarships();
  return sendSuccess(res, "Lấy danh sách học bổng thành công", scholarships);
});

export const getScholarshipHandler = asyncHandler(async (req, res) => {
  const scholarship = await getScholarshipDetail(req.params.id);
  return sendSuccess(res, "Lấy chi tiết học bổng thành công", scholarship);
});

export const createScholarshipHandler = asyncHandler(async (req, res) => {
  const payload = {
    ...req.body,
    id_ad: req.body?.id_ad || req.user?.id_ad || null,
  };
  const scholarship = await createScholarshipService(payload);
  return sendSuccess(res, "Tạo học bổng thành công", scholarship, 201);
});

export const updateScholarshipHandler = asyncHandler(async (req, res) => {
  const scholarship = await updateScholarshipService(req.params.id, req.body);
  return sendSuccess(res, "Cập nhật học bổng thành công", scholarship);
});

export const deleteScholarshipHandler = asyncHandler(async (req, res) => {
  await deleteScholarshipService(req.params.id);
  return sendSuccess(res, "Xóa học bổng thành công", true);
});