import asyncHandler from "../utils/asyncHandler.js";
import {
  approveApplicationService,
  createClassService,
  createFacultyService,
  createMajorService,
  deleteClassService,
  deleteFacultyService,
  deleteMajorService,
  getAcademicStructureService,
  getApplicationDetailService,
  getApplicationsByScholarshipService,
  saveFieldReviewService,
  updateApplicationStatusService,
  selectScholarshipWinnersService,
  updateClassService,
  updateFacultyService,
  updateMajorService,
} from "../services/admin.service.js";
import { sendSuccess } from "../utils/response.js";

export const getApplicationsByScholarshipHandler = asyncHandler(async (req, res) => {
  const result = await getApplicationsByScholarshipService(req.params.hocbongId);
  return sendSuccess(res, "Lấy danh sách hồ sơ thành công", result);
});

export const getApplicationDetailHandler = asyncHandler(async (req, res) => {
  const result = await getApplicationDetailService(req.params.id);
  return sendSuccess(res, "Lấy chi tiết hồ sơ thành công", result);
});

export const saveReviewHandler = asyncHandler(async (req, res) => {
  await saveFieldReviewService({
    id_hosodk: req.body.id_hosodk,
    id_ad: req.user.id_ad,
    field_key: req.body.field_key,
    is_pass: req.body.is_pass,
    lydo: req.body.lydo,
  });

  return sendSuccess(res, "Lưu review thành công", true);
});

export const approveApplicationHandler = asyncHandler(async (req, res) => {
  const result = await approveApplicationService({ id_hosodk: req.body.id_hosodk });
  return sendSuccess(res, "Xét duyệt vòng 1 thành công", result);
});

export const updateApplicationStatusHandler = asyncHandler(async (req, res) => {
  const result = await updateApplicationStatusService({
    id_hosodk: req.body.id_hosodk,
    status: req.body.status,
    ly_do_tu_choi: req.body.ly_do_tu_choi,
  });

  return sendSuccess(res, "Cập nhật trạng thái hồ sơ thành công", result);
});

export const selectScholarshipHandler = asyncHandler(async (req, res) => {
  const result = await selectScholarshipWinnersService(req.body);
  return sendSuccess(res, "Xét chọn học bổng thành công", result);
});

export const getAcademicStructureHandler = asyncHandler(async (_req, res) => {
  const result = await getAcademicStructureService();
  return sendSuccess(res, "Lấy cấu trúc học thuật thành công", result);
});

export const createFacultyHandler = asyncHandler(async (req, res) => {
  const result = await createFacultyService({
    tenkhoa: req.body.tenkhoa,
    createdBy: req.user?.id_ad,
  });

  return sendSuccess(res, "Tạo khoa thành công", result, 201);
});

export const updateFacultyHandler = asyncHandler(async (req, res) => {
  const result = await updateFacultyService({
    idKhoa: Number(req.params.id),
    tenkhoa: req.body.tenkhoa,
  });

  return sendSuccess(res, "Cập nhật khoa thành công", result);
});

export const deleteFacultyHandler = asyncHandler(async (req, res) => {
  await deleteFacultyService(Number(req.params.id));
  return sendSuccess(res, "Xóa khoa thành công", true);
});

export const createMajorHandler = asyncHandler(async (req, res) => {
  const result = await createMajorService({
    ten_nganh: req.body.ten_nganh,
    id_khoa: Number(req.body.id_khoa),
    createdBy: req.user?.id_ad,
  });

  return sendSuccess(res, "Tạo ngành thành công", result, 201);
});

export const updateMajorHandler = asyncHandler(async (req, res) => {
  const result = await updateMajorService({
    idNganh: Number(req.params.id),
    ten_nganh: req.body.ten_nganh,
    id_khoa: Number(req.body.id_khoa),
  });

  return sendSuccess(res, "Cập nhật ngành thành công", result);
});

export const deleteMajorHandler = asyncHandler(async (req, res) => {
  await deleteMajorService(Number(req.params.id));
  return sendSuccess(res, "Xóa ngành thành công", true);
});

export const createClassHandler = asyncHandler(async (req, res) => {
  const result = await createClassService({
    tenlop: req.body.tenlop,
    id_nganh: Number(req.body.id_nganh),
    createdBy: req.user?.id_ad,
  });

  return sendSuccess(res, "Tạo lớp thành công", result, 201);
});

export const updateClassHandler = asyncHandler(async (req, res) => {
  const result = await updateClassService({
    idLop: Number(req.params.id),
    tenlop: req.body.tenlop,
    id_nganh: Number(req.body.id_nganh),
  });

  return sendSuccess(res, "Cập nhật lớp thành công", result);
});

export const deleteClassHandler = asyncHandler(async (req, res) => {
  await deleteClassService(Number(req.params.id));
  return sendSuccess(res, "Xóa lớp thành công", true);
});