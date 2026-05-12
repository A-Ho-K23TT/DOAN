import { ApiError } from "../utils/apiError.js";
import {
  countClassesByMajor,
  countMajorsByFaculty,
  createClass,
  createFaculty,
  createMajor,
  deleteClass,
  deleteFaculty,
  deleteMajor,
  getClassById,
  getFacultyById,
  getMajorById,
  listClasses,
  listFaculties,
  listMajors,
  updateClass,
  updateFaculty,
  updateMajor,
} from "../models/academic.model.js";
import {
  findApplicationById,
  getLatestSubmission,
  getReviewDetails,
  listApplicationsByScholarship,
  listQualifiedApplications,
  setSelectionStatus,
  updateApplicationStatus,
  upsertReviewDetail,
} from "../models/application.model.js";
import { getFormConfigService, getScholarshipDetail } from "./scholarship.service.js";

const parseJson = (value) => {
  if (!value) {
    return null;
  }

  if (typeof value === "string") {
    return JSON.parse(value);
  }

  return value;
};

const pickSubmissionAnswer = (submissionData, field) => {
  if (!submissionData || !field) {
    return null;
  }

  const possibleKeys = [field.key, field.field_key, field.id].filter(Boolean).map((item) => String(item));

  for (const key of possibleKeys) {
    if (Object.prototype.hasOwnProperty.call(submissionData, key)) {
      return submissionData[key];
    }
  }

  return null;
};

export const getApplicationsByScholarshipService = async (idHb) => {
  const scholarship = await getScholarshipDetail(idHb);
  const applications = await listApplicationsByScholarship(idHb);

  return {
    scholarship,
    applications: applications.map((row) => ({
      ...row,
      student: {
        id_nd: row.id_nd,
        id_sv: row.id_sv,
        fullName: row.hoten,
        mssv: row.mssv,
        email: row.email,
        gpa: row.gpa,
        diem_rl: row.diem_rl,
      },
    })),
  };
};

export const getApplicationDetailService = async (idHosodk) => {
  const application = await findApplicationById(idHosodk);

  if (!application) {
    throw new ApiError(404, "Không tìm thấy hồ sơ");
  }

  const submission = await getLatestSubmission(idHosodk);
  const reviewDetail = await getReviewDetails(idHosodk);
  const form = await getFormConfigService(application.id_hb);
  const submissionData = parseJson(submission?.data_json);

  return {
    application,
    scholarship: {
      id_hb: application.id_hb,
      tenhb: application.tenhb,
      han: application.han,
      scholarship_status: application.scholarship_status,
    },
    student: {
      id_nd: application.id_nd,
      id_sv: application.sv_id,
      hoten: application.hoten,
      mssv: application.mssv,
      email: application.email,
      gpa: application.gpa,
      diem_rl: application.diem_rl,
      id_lop: application.id_lop,
    },
    submission: submission
      ? {
          ...submission,
          data_json: submissionData,
        }
      : null,
    form: {
      ...form,
      fields: form.fields.map((field) => {
        const review = reviewDetail.find((item) => item.field_key === field.key) || null;

        return {
          ...field,
          answer: pickSubmissionAnswer(submissionData, field),
          review,
        };
      }),
    },
    review_detail: reviewDetail,
  };
};

export const saveFieldReviewService = async ({ id_hosodk, id_ad, field_key, is_pass, lydo }) => {
  if (!id_hosodk || !field_key) {
    throw new ApiError(400, "Thiếu id_hosodk hoặc field_key");
  }

  await upsertReviewDetail({ id_hosodk, id_ad, field_key, is_pass, lydo });
  return true;
};

export const updateApplicationStatusService = async ({ id_hosodk, status, ly_do_tu_choi = null }) => {
  if (!id_hosodk) {
    throw new ApiError(400, "Thiếu id_hosodk");
  }

  if (!status) {
    throw new ApiError(400, "Thiếu trạng thái cần cập nhật");
  }

  return updateApplicationStatus({
    id_hosodk,
    trangthai: status,
    ly_do_tu_choi,
  });
};

export const approveApplicationService = async ({ id_hosodk }) => {
  const detail = await getApplicationDetailService(id_hosodk);
  const fields = detail.form.fields;

  if (!fields.length) {
    throw new ApiError(400, "Chưa có cấu hình form để xét duyệt");
  }

  const hasMissingReview = fields.some((field) => !field.review);
  const hasFail = fields.some((field) => field.review && !field.review.is_pass);

  if (hasMissingReview) {
    throw new ApiError(400, "Vui lòng review đầy đủ từng field trước khi xét duyệt");
  }

  if (hasFail) {
    return updateApplicationStatus({ id_hosodk, trangthai: "need_edit" });
  }

  return updateApplicationStatus({ id_hosodk, trangthai: "qualified" });
};

export const selectScholarshipWinnersService = async ({ hocbongId, selectedIds = [] }) => {
  if (!hocbongId) {
    throw new ApiError(400, "Thiếu hocbongId");
  }

  const qualifiedRows = await listQualifiedApplications(hocbongId);
  const qualifiedIds = qualifiedRows.map((row) => row.id_hosodk);

  for (const idHosodk of qualifiedIds) {
    await setSelectionStatus({ id_hosodk: idHosodk, awarded: selectedIds.includes(idHosodk) });
  }

  const awarded = qualifiedIds.filter((id) => selectedIds.includes(id));
  const failed = qualifiedIds.filter((id) => !selectedIds.includes(id));

  return {
    awarded,
    failed,
    awardedCount: awarded.length,
    failedCount: failed.length,
  };
};

export const getAcademicStructureService = async () => {
  const [khoa, nganh, lop] = await Promise.all([listFaculties(), listMajors(), listClasses()]);

  return {
    khoa,
    nganh,
    lop,
  };
};

export const createFacultyService = async ({ tenkhoa, createdBy }) => {
  if (!String(tenkhoa || "").trim()) {
    throw new ApiError(400, "Thiếu tên khoa");
  }

  return createFaculty({
    tenkhoa: String(tenkhoa).trim(),
    created_by: createdBy || null,
  });
};

export const updateFacultyService = async ({ idKhoa, tenkhoa }) => {
  const existing = await getFacultyById(idKhoa);

  if (!existing) {
    throw new ApiError(404, "Không tìm thấy khoa");
  }

  if (!String(tenkhoa || "").trim()) {
    throw new ApiError(400, "Thiếu tên khoa");
  }

  return updateFaculty(idKhoa, { tenkhoa: String(tenkhoa).trim() });
};

export const deleteFacultyService = async (idKhoa) => {
  const existing = await getFacultyById(idKhoa);

  if (!existing) {
    throw new ApiError(404, "Không tìm thấy khoa");
  }

  const totalMajors = await countMajorsByFaculty(idKhoa);

  if (totalMajors > 0) {
    throw new ApiError(400, "Không thể xóa khoa vì vẫn còn ngành trực thuộc");
  }

  await deleteFaculty(idKhoa);
  return true;
};

export const createMajorService = async ({ ten_nganh, id_khoa, createdBy }) => {
  if (!String(ten_nganh || "").trim()) {
    throw new ApiError(400, "Thiếu tên ngành");
  }

  if (!id_khoa) {
    throw new ApiError(400, "Thiếu id_khoa");
  }

  const faculty = await getFacultyById(id_khoa);

  if (!faculty) {
    throw new ApiError(404, "Khoa không tồn tại");
  }

  return createMajor({
    ten_nganh: String(ten_nganh).trim(),
    id_khoa: Number(id_khoa),
    created_by: createdBy || null,
  });
};

export const updateMajorService = async ({ idNganh, ten_nganh, id_khoa }) => {
  const existing = await getMajorById(idNganh);

  if (!existing) {
    throw new ApiError(404, "Không tìm thấy ngành");
  }

  if (!String(ten_nganh || "").trim()) {
    throw new ApiError(400, "Thiếu tên ngành");
  }

  if (!id_khoa) {
    throw new ApiError(400, "Thiếu id_khoa");
  }

  const faculty = await getFacultyById(id_khoa);

  if (!faculty) {
    throw new ApiError(404, "Khoa không tồn tại");
  }

  return updateMajor(idNganh, {
    ten_nganh: String(ten_nganh).trim(),
    id_khoa: Number(id_khoa),
  });
};

export const deleteMajorService = async (idNganh) => {
  const existing = await getMajorById(idNganh);

  if (!existing) {
    throw new ApiError(404, "Không tìm thấy ngành");
  }

  const totalClasses = await countClassesByMajor(idNganh);

  if (totalClasses > 0) {
    throw new ApiError(400, "Không thể xóa ngành vì vẫn còn lớp trực thuộc");
  }

  await deleteMajor(idNganh);
  return true;
};

export const createClassService = async ({ tenlop, id_nganh, createdBy }) => {
  if (!String(tenlop || "").trim()) {
    throw new ApiError(400, "Thiếu tên lớp");
  }

  if (!id_nganh) {
    throw new ApiError(400, "Thiếu id_nganh");
  }

  const major = await getMajorById(id_nganh);

  if (!major) {
    throw new ApiError(404, "Ngành không tồn tại");
  }

  return createClass({
    tenlop: String(tenlop).trim(),
    id_nganh: Number(id_nganh),
    created_by: createdBy || null,
  });
};

export const updateClassService = async ({ idLop, tenlop, id_nganh }) => {
  const existing = await getClassById(idLop);

  if (!existing) {
    throw new ApiError(404, "Không tìm thấy lớp");
  }

  if (!String(tenlop || "").trim()) {
    throw new ApiError(400, "Thiếu tên lớp");
  }

  if (!id_nganh) {
    throw new ApiError(400, "Thiếu id_nganh");
  }

  const major = await getMajorById(id_nganh);

  if (!major) {
    throw new ApiError(404, "Ngành không tồn tại");
  }

  return updateClass(idLop, {
    tenlop: String(tenlop).trim(),
    id_nganh: Number(id_nganh),
  });
};

export const deleteClassService = async (idLop) => {
  const existing = await getClassById(idLop);

  if (!existing) {
    throw new ApiError(404, "Không tìm thấy lớp");
  }

  await deleteClass(idLop);
  return true;
};