import apiClient, { unwrapResponse } from "./apiClient";

export const STATUS = {
  PENDING: "pending",
  NEED_EDIT: "need_edit",
  REJECTED: "rejected",
  QUALIFIED: "qualified",
  AWARDED: "awarded",
  FAILED: "failed",
};

const DAY_MS = 24 * 60 * 60 * 1000;

const mapDeadlineMeta = (deadline) => {
  if (!deadline) {
    return { code: "unknown", label: "Không rõ hạn", tone: "gray", remainingDays: null };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const deadlineDate = new Date(deadline);
  if (Number.isNaN(deadlineDate.getTime())) {
    return { code: "unknown", label: "Không rõ hạn", tone: "gray", remainingDays: null };
  }

  deadlineDate.setHours(0, 0, 0, 0);
  const remainingDays = Math.round((deadlineDate.getTime() - today.getTime()) / DAY_MS);

  if (remainingDays < 0) {
    return { code: "expired", label: "Hết hạn", tone: "gray", remainingDays };
  }

  if (remainingDays <= 7) {
    return { code: "expiring", label: "Sắp hết hạn", tone: "orange", remainingDays };
  }

  return { code: "active", label: "Còn hạn", tone: "green", remainingDays };
};

const normalizeScholarship = (scholarship) => {
  const deadlineMeta = mapDeadlineMeta(scholarship?.han || scholarship?.deadline);

  return {
    id_hb: Number(scholarship?.id_hb ?? scholarship?.id),
    tenhb: scholarship?.tenhb ?? scholarship?.name ?? "",
    han: scholarship?.han ?? scholarship?.deadline ?? "",
    deadlineStatus: deadlineMeta.code,
    deadlineLabel: deadlineMeta.label,
    deadlineTone: deadlineMeta.tone,
    remainingDays: deadlineMeta.remainingDays,
  };
};

const normalizeStudent = (student) => ({
  fullName: student?.fullName ?? student?.hoten ?? "",
  username: student?.username ?? student?.tendangnhap ?? "",
  mssv: student?.mssv ?? "",
  email: student?.email ?? "",
  gpa: student?.gpa ?? student?.GPA ?? 0,
  diem_rl: student?.diem_rl ?? student?.diemRL ?? 0,
});

const normalizeApplicationRow = (row) => {
  const statusCode = String(row?.trangthai ?? row?.status ?? STATUS.PENDING);
  const statusLabel = row?.statusLabel ?? row?.status_label ?? row?.statusText ?? ({
    pending: "Chờ duyệt",
    need_edit: "Cần chỉnh sửa",
    rejected: "Bị từ chối",
    qualified: "Qua vòng hồ sơ",
    awarded: "Được trao học bổng",
    failed: "Trượt xét chọn",
  }[statusCode] || "Chờ duyệt");

  return {
    id_hosodk: Number(row?.id_hosodk ?? row?.id),
    id_hb: Number(row?.id_hb ?? row?.scholarshipId),
    id_sv: Number(row?.id_sv ?? row?.studentId),
    ngaynop: row?.ngaynop ?? row?.submittedAt ?? "",
    trangthai: statusCode,
    submitCount: Number(row?.submitCount ?? 0),
    statusLabel,
    statusTone: row?.statusTone ?? "yellow",
    statusCode,
    ly_do_tu_choi: row?.ly_do_tu_choi ?? "",
    student: normalizeStudent(row?.student || row?.sinhvien || row),
  };
};

const normalizeReviewField = (field) => ({
  id: field?.id,
  key: field?.field_key ?? field?.key,
  label: field?.label ?? "",
  type: field?.type ?? "text",
  required: Boolean(field?.required),
  answer: field?.answer,
  review: field?.review
    ? {
        is_pass: Boolean(field.review.is_pass ?? field.review.isPass),
        lydo: String(field.review.lydo ?? field.review.reason ?? ""),
      }
    : null,
});

export const getApplications = async () => {
  const response = await apiClient.get("/scholarships");
  const scholarships = unwrapResponse(response) || [];
  return Array.isArray(scholarships) ? scholarships.map(normalizeScholarship) : [];
};

export const getScholarshipApplications = async (id_hb) => {
  const response = await apiClient.get(`/admin/applications/${id_hb}`);
  const payload = unwrapResponse(response) || {};
  const scholarship = normalizeScholarship(payload.scholarship || { id_hb });
  const applications = Array.isArray(payload.applications) ? payload.applications.map(normalizeApplicationRow) : [];

  return {
    scholarship,
    applications,
  };
};

export const getApplicationDetail = async (id) => {
  const response = await apiClient.get(`/admin/applications/detail/${id}`);
  const detail = unwrapResponse(response) || {};

  const scholarship = detail.scholarship || {};
  const application = detail.application || {};
  const student = detail.student || {};
  const form = detail.form || {};
  const submission = detail.submission || null;

  return {
    scholarship: {
      id_hb: Number(scholarship.id_hb ?? scholarship.id ?? 0),
      tenhb: scholarship.tenhb ?? scholarship.name ?? "",
      han: scholarship.han ?? "",
      scholarship_status: scholarship.scholarship_status ?? "",
    },
    application: {
      id_hosodk: Number(application.id_hosodk ?? application.id ?? 0),
      id_hb: Number(application.id_hb ?? scholarship.id_hb ?? 0),
      id_sv: Number(application.id_sv ?? student.id_sv ?? 0),
      trangthai: String(application.trangthai ?? application.status ?? STATUS.PENDING),
      ngaynop: application.ngaynop ?? application.submittedAt ?? "",
      ly_do_tu_choi: application.ly_do_tu_choi ?? application.rejectReason ?? "",
      submitCount: Number(application.submitCount ?? 0),
    },
    student: {
      id_nd: Number(student.id_nd ?? 0),
      id_sv: Number(student.id_sv ?? student.svId ?? 0),
      hoten: student.hoten ?? student.fullName ?? "",
      mssv: student.mssv ?? "",
      email: student.email ?? "",
      gpa: student.gpa ?? 0,
      diem_rl: student.diem_rl ?? 0,
      id_lop: student.id_lop ?? null,
    },
    submission: submission
      ? {
          ...submission,
          data_json: submission.data_json || submission.answerMap || {},
        }
      : null,
    form: {
      title: form.title || "Biểu mẫu đăng ký",
      description: form.description || "",
      fields: Array.isArray(form.fields) ? form.fields.map(normalizeReviewField) : [],
    },
    review_detail: Array.isArray(detail.review_detail) ? detail.review_detail : [],
  };
};

export const saveReview = async ({ id_hosodk, fieldReviews = [], id_ad = 1 }) => {
  for (const field of fieldReviews) {
    await apiClient.post("/admin/review", {
      id_hosodk: Number(id_hosodk),
      id_ad: Number(id_ad),
      field_key: String(field.field_key || field.key || "").trim(),
      is_pass: Boolean(field.is_pass ?? field.isPass),
      lydo: String(field.lydo ?? field.reason ?? "").trim(),
    });
  }

  return true;
};

export const updateStatus = async ({ id_hosodk, status, ly_do_tu_choi = "" }) => {
  const normalizedStatus = String(status || "");

  if (normalizedStatus === STATUS.QUALIFIED) {
    await apiClient.post("/admin/approve", {
      id_hosodk: Number(id_hosodk),
    });

    return true;
  }

  if (normalizedStatus === STATUS.NEED_EDIT) {
    await apiClient.post("/admin/application-status", {
      id_hosodk: Number(id_hosodk),
      status: normalizedStatus,
      ly_do_tu_choi: String(ly_do_tu_choi || "").trim(),
    });

    return true;
  }

  if (normalizedStatus === STATUS.REJECTED) {
    await apiClient.post("/admin/application-status", {
      id_hosodk: Number(id_hosodk),
      status: normalizedStatus,
      ly_do_tu_choi: String(ly_do_tu_choi || "").trim(),
    });

    return true;
  }

  await apiClient.post("/admin/application-status", {
    id_hosodk: Number(id_hosodk),
    status: normalizedStatus,
    ly_do_tu_choi: String(ly_do_tu_choi || "").trim(),
  });

  return true;
};

export const getQualifiedApplications = async (id_hb) => {
  const response = await apiClient.get(`/admin/applications/${id_hb}`);
  const payload = unwrapResponse(response) || {};
  const scholarship = normalizeScholarship(payload.scholarship || { id_hb });
  const applications = Array.isArray(payload.applications)
    ? payload.applications
        .filter((row) => String(row?.trangthai ?? row?.statusCode) === STATUS.QUALIFIED)
        .map((row) => ({
          id_hosodk: Number(row.id_hosodk ?? row.id),
          id_hb: Number(row.id_hb ?? id_hb),
          trangthai: String(row.trangthai ?? row.statusCode ?? STATUS.QUALIFIED),
          submitted_at: row.ngaynop ?? row.submittedAt ?? "",
          student: normalizeStudent(row.student || row),
          submission: row.submission || null,
        }))
        .sort((a, b) => {
          const gpaDiff = Number(b.student.gpa || 0) - Number(a.student.gpa || 0);
          if (gpaDiff !== 0) return gpaDiff;
          return Number(b.student.diem_rl || 0) - Number(a.student.diem_rl || 0);
        })
    : [];

  return {
    scholarship,
    applications,
  };
};

export const getSelectionResults = async (id_hb) => {
  const response = await apiClient.get(`/admin/applications/${id_hb}`);
  const payload = unwrapResponse(response) || {};
  const scholarship = normalizeScholarship(payload.scholarship || { id_hb });
  const applications = Array.isArray(payload.applications)
    ? payload.applications
        .filter((row) => {
          const status = String(row?.trangthai ?? row?.statusCode);
          return [STATUS.QUALIFIED, STATUS.AWARDED, STATUS.FAILED].includes(status);
        })
        .map((row) => ({
          id_hosodk: Number(row.id_hosodk ?? row.id),
          id_hb: Number(row.id_hb ?? id_hb),
          trangthai: String(row.trangthai ?? row.statusCode ?? STATUS.QUALIFIED),
          submitted_at: row.ngaynop ?? row.submittedAt ?? "",
          student: normalizeStudent(row.student || row),
          submission: row.submission || null,
        }))
        .sort((a, b) => {
          const gpaDiff = Number(b.student.gpa || 0) - Number(a.student.gpa || 0);
          if (gpaDiff !== 0) return gpaDiff;
          return Number(b.student.diem_rl || 0) - Number(a.student.diem_rl || 0);
        })
    : [];

  return {
    scholarship,
    applications,
  };
};

export const submitEvaluation = async ({ id_hb, awardedIds = [], failedReason = "Không được chọn trong vòng xét chọn." }) => {
  const response = await apiClient.post("/admin/select", {
    hocbongId: Number(id_hb),
    selectedIds: awardedIds.map((item) => Number(item)),
    failedReason,
  });

  const payload = unwrapResponse(response) || {};

  return {
    ...payload,
    awardedCount: Number(payload.awardedCount ?? payload.awarded?.length ?? awardedIds.length),
    failedCount: Number(payload.failedCount ?? payload.failed?.length ?? 0),
  };
};