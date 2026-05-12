import apiClient, { unwrapResponse } from "./apiClient";

const normalizeUser = (user) => {
  const role = String(user?.vaitro || user?.role || "sv");
  const fullName = user?.hoten || user?.name || user?.fullName || "";
  const username = user?.tendangnhap || user?.username || user?.email || "";

  // Get faculty name from appropriate location
  let facultyName = "";
  if (role === "ad" || role === "admin") {
    facultyName = user?.adminProfile?.tenkhoa || user?.tenkhoa || "";
  } else {
    facultyName = user?.studentAcademic?.tenkhoa || user?.tenkhoa || "";
  }

  return {
    id: user?.id_nd ?? user?.id ?? user?._id,
    fullName,
    username,
    email: user?.email || "",
    password: user?.matkhau || user?.password || "",
    role,
    roleText: role === "ad" || role === "admin" ? "Admin" : "Sinh vien",
    gender: user?.gioitinh || user?.gender || "",
    birthday: user?.ngaysinh || user?.birthday || "",
    createdAt: user?.ngaytao || user?.createdAt || "",
    isVisible: user?.isVisible !== undefined ? Boolean(user.isVisible) : Number(user?.trangthai ?? 1) === 1,
    adminProfile: user?.adminProfile || null,
    studentProfile: user?.studentProfile || null,
    studentAcademic: user?.studentAcademic || null,
    infoText:
      role === "ad" || role === "admin"
        ? [user?.adminProfile?.mgv, user?.adminProfile?.tenkhoa, user?.adminProfile?.hoc_vi, user?.adminProfile?.hoc_ham]
            .filter(Boolean)
            .join(" | ")
        : [user?.studentAcademic?.tenkhoa, user?.studentAcademic?.ten_nganh, user?.studentAcademic?.tenlop]
            .filter(Boolean)
            .join(" / "),
  };
};

const normalizeAcademicStructure = (payload) => {
  if (!payload || typeof payload !== "object") {
    return { khoa: [], nganh: [], lop: [] };
  }

  return {
    khoa: Array.isArray(payload.khoa) ? payload.khoa : Array.isArray(payload.faculties) ? payload.faculties : [],
    nganh: Array.isArray(payload.nganh) ? payload.nganh : Array.isArray(payload.majors) ? payload.majors : [],
    lop: Array.isArray(payload.lop) ? payload.lop : Array.isArray(payload.classes) ? payload.classes : [],
  };
};

const mapUserPayload = (payload) => ({
  hoten: String(payload.hoten || payload.name || "").trim(),
  tendangnhap: String(payload.tendangnhap || payload.username || "").trim(),
  email: String(payload.email || "").trim() || null,
  password: String(payload.matkhau || payload.password || "").trim() || undefined,
  vaitro: String(payload.vaitro || payload.role || "sv").toLowerCase() === "ad" ? "ad" : "sv",
  ngaysinh: String(payload.ngaysinh || payload.birthday || "").trim() || null,
  gioitinh: String(payload.gioitinh || payload.gender || "").trim() || null,
});

const mapProfilePayload = (payload = {}) => ({
  mgv: String(payload.mgv || "").trim() || null,
  hoc_vi: String(payload.hoc_vi || "").trim() || null,
  hoc_ham: String(payload.hoc_ham || "").trim() || null,
  id_khoa: payload.id_khoa ? Number(payload.id_khoa) : null,
  id_lop: payload.id_lop ? Number(payload.id_lop) : null,
  mssv: String(payload.mssv || "").trim() || null,
  gpa: payload.gpa === "" || payload.gpa === undefined || payload.gpa === null ? null : Number(payload.gpa),
  diem_rl: payload.diem_rl === "" || payload.diem_rl === undefined || payload.diem_rl === null ? null : Number(payload.diem_rl),
});

const mapAcademicPayload = (payload) => ({
  ...payload,
  created_by: Number(payload.created_by || 1),
});

export const fetchUsers = async (params = {}) => {
  const response = await apiClient.get("/admin/users", { params });
  const data = unwrapResponse(response);
  const rows = Array.isArray(data) ? data : Array.isArray(data?.users) ? data.users : Array.isArray(data?.data) ? data.data : [];
  return rows.map(normalizeUser);
};

export const getUsersForView = async (params = {}) => fetchUsers(params);

export const getUserByIdForView = async (id) => {
  const response = await apiClient.get(`/admin/users/${id}`);
  const data = unwrapResponse(response);
  return data ? normalizeUser(data.user || data) : null;
};

export const fetchAcademicStructure = async () => {
  try {
    const response = await apiClient.get("/admin/academics");
    return normalizeAcademicStructure(unwrapResponse(response));
  } catch {
    return { khoa: [], nganh: [], lop: [] };
  }
};

export const getAcademicStructureForView = async () => fetchAcademicStructure();

export const createFacultyForView = async (payload) => {
  await apiClient.post("/admin/academics/khoa", mapAcademicPayload(payload));
  return getAcademicStructureForView();
};

export const updateFacultyForView = async (id, payload) => {
  await apiClient.put(`/admin/academics/khoa/${id}`, mapAcademicPayload(payload));
  return getAcademicStructureForView();
};

export const deleteFacultyForView = async (id) => {
  await apiClient.delete(`/admin/academics/khoa/${id}`);
  return getAcademicStructureForView();
};

export const createMajorForView = async (payload) => {
  await apiClient.post("/admin/academics/nganh", mapAcademicPayload(payload));
  return getAcademicStructureForView();
};

export const updateMajorForView = async (id, payload) => {
  await apiClient.put(`/admin/academics/nganh/${id}`, mapAcademicPayload(payload));
  return getAcademicStructureForView();
};

export const deleteMajorForView = async (id) => {
  await apiClient.delete(`/admin/academics/nganh/${id}`);
  return getAcademicStructureForView();
};

export const createClassForView = async (payload) => {
  await apiClient.post("/admin/academics/lop", mapAcademicPayload(payload));
  return getAcademicStructureForView();
};

export const updateClassForView = async (id, payload) => {
  await apiClient.put(`/admin/academics/lop/${id}`, mapAcademicPayload(payload));
  return getAcademicStructureForView();
};

export const deleteClassForView = async (id) => {
  await apiClient.delete(`/admin/academics/lop/${id}`);
  return getAcademicStructureForView();
};

export const createUserAccount = async (payload) => {
  await apiClient.post("/admin/users", mapUserPayload(payload));
  return getUsersForView();
};

export const createUserAccountBasic = async (payload) => {
  const response = await apiClient.post("/admin/users", mapUserPayload(payload));
  const data = unwrapResponse(response);
  return normalizeUser(data?.user || data);
};

export const createUserRoleProfile = async (id, payload) => {
  if (!id && id !== 0) {
    throw new Error("Khong tim thay ID nguoi dung o buoc 2.");
  }

  const body = mapProfilePayload(payload);

  try {
    const response = await apiClient.post(`/admin/users/${id}/profile`, body);
    const data = unwrapResponse(response);
    return normalizeUser(data?.user || data);
  } catch (error) {
    // Backward-compatible fallback when backend still uses old profile endpoint shape.
    if (!String(error?.message || "").toLowerCase().includes("endpoint")) {
      throw error;
    }

    const fallbackResponse = await apiClient.post(`/admin/users/profile/${id}`, body);
    const fallbackData = unwrapResponse(fallbackResponse);
    return normalizeUser(fallbackData?.user || fallbackData);
  }
};

export const updateUserRoleProfile = async (id, payload) => {
  if (!id && id !== 0) {
    throw new Error("Khong tim thay ID nguoi dung o buoc 2.");
  }

  const body = mapProfilePayload(payload);

  try {
    const response = await apiClient.put(`/admin/users/${id}/profile`, body);
    const data = unwrapResponse(response);
    return normalizeUser(data?.user || data);
  } catch (error) {
    // Backward-compatible fallback when backend still uses old profile endpoint shape.
    if (!String(error?.message || "").toLowerCase().includes("endpoint")) {
      throw error;
    }

    const fallbackResponse = await apiClient.put(`/admin/users/profile/${id}`, body);
    const fallbackData = unwrapResponse(fallbackResponse);
    return normalizeUser(fallbackData?.user || fallbackData);
  }
};

export const updateUserAccount = async (id, payload) => {
  await apiClient.put(`/admin/users/${id}`, mapUserPayload(payload));
  return getUsersForView();
};

export const setUserRole = async (id, role) => {
  await apiClient.put(`/admin/users/${id}`, {
    role: String(role || "sv").toLowerCase() === "ad" ? "admin" : "user",
  });

  return getUsersForView();
};

export const setAccountVisibility = async (id, visible) => {
  await apiClient.put(`/admin/users/${id}`, {
    isVisible: Boolean(visible),
    trangthai: visible ? 1 : 0,
  });

  return getUsersForView();
};

export const deleteUserAccount = async (id) => {
  await apiClient.delete(`/admin/users/${id}`);
  return getUsersForView();
};