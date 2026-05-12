import { fetchScholarshipsForView } from "./scholarship.service";
import { getApplicationDetail, getScholarshipApplications, saveReview, updateStatus } from "./application.service";

export const fetchScholarshipsForReview = async () => {
  const scholarships = await fetchScholarshipsForView();

  return Promise.all(
    scholarships.map(async (scholarship) => {
      const detail = await getScholarshipApplications(scholarship.id);
      const pendingCount = (detail.applications || []).filter((item) => String(item.trangthai) === "pending").length;

      return {
        id: scholarship.id,
        name: scholarship.name,
        deadline: scholarship.deadline || "",
        pendingCount,
      };
    }),
  );
};

export const fetchPendingApplicationsByScholarship = async (scholarshipId) => {
  const detail = await getScholarshipApplications(Number(scholarshipId));

  return (detail.applications || [])
    .filter((item) => String(item.trangthai) === "pending")
    .map((item) => ({
      id: Number(item.id_hosodk),
      scholarshipId: Number(item.id_hb),
      submittedAt: item.ngaynop,
      submitCount: Number(item.submitCount || 0),
      status: item.trangthai,
      statusText: item.statusLabel,
      student: {
        fullName: item.student.fullName,
        mssv: item.student.mssv,
        username: item.student.username,
        email: item.student.email,
      },
    }));
};

export const fetchApplicationReviewDetail = async (applicationId) => {
  const detail = await getApplicationDetail(Number(applicationId));

  return {
    scholarship: {
      id: Number(detail.scholarship.id_hb),
      name: detail.scholarship.tenhb,
    },
    application: {
      id: Number(detail.application.id_hosodk),
      status: detail.application.trangthai,
      submittedAt: detail.application.ngaynop,
      rejectReason: detail.application.ly_do_tu_choi || "",
    },
    student: {
      fullName: detail.student.hoten,
      mssv: detail.student.mssv,
      username: detail.student.hoten,
      email: detail.student.email,
    },
    form: {
      title: detail.form.title || "Biểu mẫu đăng ký",
      description: detail.form.description || "",
      fields: (detail.form.fields || []).map((field) => ({
        key: field.key,
        label: field.label,
        type: field.type,
        review: field.review
          ? {
              isPass: Boolean(field.review.is_pass),
              reason: field.review.lydo || "",
            }
          : null,
      })),
    },
  };
};

export const submitApplicationReview = async ({ applicationId, action, fields, reason, adminId }) => {
  const fieldReviews = (fields || []).map((field) => ({
    field_key: field.field_key || field.key,
    is_pass: Boolean(field.is_pass),
    lydo: String(field.lydo || field.reason || "").trim(),
  }));

  await saveReview({
    id_hosodk: Number(applicationId),
    fieldReviews,
    id_ad: Number(adminId || 1),
  });

  await updateStatus({
    id_hosodk: Number(applicationId),
    status: action,
    ly_do_tu_choi: String(reason || "").trim(),
  });

  return true;
};

export const fetchReviewApplicationDetail = fetchApplicationReviewDetail;
export const saveApplicationReview = saveReview;
export const updateApplicationStatus = updateStatus;

export { fetchScholarshipsForReview as getScholarshipsForReview, getApplicationDetail as fetchRawApplicationDetail };