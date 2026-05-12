import apiClient, { unwrapResponse } from "./apiClient";

export const listScholarships = async () => {
  const res = await apiClient.get("/scholarships");
  return unwrapResponse(res) || [];
};

export const getScholarshipById = async (id) => {
  const res = await apiClient.get(`/scholarships/${id}`);
  return unwrapResponse(res);
};

export const getFilesByScholarship = async (id) => {
  const res = await apiClient.get(`/scholarships/${id}/files`);
  return unwrapResponse(res) || [];
};

export const getFormByScholarship = async (id) => {
  const res = await apiClient.get(`/form/${id}`);
  return unwrapResponse(res) || { title: "", description: "", fields: [] };
};

export const loginStudent = async (tendangnhap, matkhau) => {
  const res = await apiClient.post(`/auth/login`, { identifier: tendangnhap, password: matkhau });
  const data = unwrapResponse(res);
  // backend returns { accessToken, profile }
  if (data?.accessToken) {
    localStorage.setItem("qlhb_student_session", JSON.stringify({ token: data.accessToken, profile: data.profile }));
  }
  return data?.profile || null;
};

export const listApplicationsByStudent = async () => {
  const res = await apiClient.get(`/applications/my`);
  return unwrapResponse(res) || [];
};

export const submitScholarshipApplication = async (payload) => {
  const res = await apiClient.post(`/applications`, payload);
  return unwrapResponse(res);
};

export const getLatestSubmissionByApplication = async (id_hosodk) => {
  // backend doesn't expose a specific endpoint; get application details via my applications
  const rows = await listApplicationsByStudent();
  const matched = rows.find((r) => Number(r.id_hosodk) === Number(id_hosodk));
  return matched?.latestSubmission || null;
};

export const findApplicationByScholarshipAndStudent = async (id_hb) => {
  const rows = await listApplicationsByStudent();
  return rows.find((r) => Number(r.id_hb) === Number(id_hb)) || null;
};

export const listReviewDetailsByApplication = async (id_hosodk) => {
  const rows = await listApplicationsByStudent();
  const matched = rows.find((r) => Number(r.id_hosodk) === Number(id_hosodk));
  return matched?.reviewDetails || [];
};
