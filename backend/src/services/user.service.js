import {
  createAdminProfile,
  createStudentProfile,
  createUser,
  deleteUser,
  getUserById,
  listUsers,
  updateAdminProfile,
  updateStudentProfile,
  updateUser,
  updateUserRole,
  updateUserVisibility,
} from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";

/**
 * List users service
 */
export const listUsersService = async (filters = {}) => {
  try {
    const users = await listUsers(filters);
    return users.map((user) => ({
      id_nd: user.id_nd,
      hoten: user.hoten,
      tendangnhap: user.tendangnhap,
      email: user.email,
      matkhau: user.matkhau,
      vaitro: user.vaitro,
      ngaysinh: user.ngaysinh,
      gioitinh: user.gioitinh,
      trangthai: user.trangthai,
      ngaytao: user.ngaytao,
      adminProfile: user.id_ad
        ? {
            id_ad: user.id_ad,
            mgv: user.mgv,
            hoc_vi: user.hoc_vi,
            hoc_ham: user.hoc_ham,
            id_khoa: user.admin_id_khoa,
            tenkhoa: user.admin_tenkhoa,
          }
        : null,
      studentProfile: user.sv_id
        ? {
            sv_id: user.sv_id,
            mssv: user.mssv,
            gpa: user.gpa,
            diem_rl: user.diem_rl,
            id_lop: user.id_lop,
          }
        : null,
      studentAcademic: user.sv_id
        ? {
            id_khoa: user.student_khoa_id,
            id_nganh: user.id_nganh,
            id_lop: user.id_lop,
            tenlop: user.tenlop,
            ten_nganh: user.ten_nganh,
            tenkhoa: user.student_tenkhoa,
          }
        : null,
    }));
  } catch (error) {
    throw new ApiError(500, "Lỗi khi lấy danh sách người dùng");
  }
};

/**
 * Get user by ID service
 */
export const getUserByIdService = async (idNd) => {
  try {
    const user = await getUserById(idNd);

    if (!user) {
      throw new ApiError(404, "Không tìm thấy người dùng");
    }

    return {
      id_nd: user.id_nd,
      hoten: user.hoten,
      tendangnhap: user.tendangnhap,
      email: user.email,
      matkhau: user.matkhau,
      vaitro: user.vaitro,
      ngaysinh: user.ngaysinh,
      gioitinh: user.gioitinh,
      trangthai: user.trangthai,
      ngaytao: user.ngaytao,
      adminProfile: user.id_ad
        ? {
            id_ad: user.id_ad,
            mgv: user.mgv,
            hoc_vi: user.hoc_vi,
            hoc_ham: user.hoc_ham,
            id_khoa: user.admin_id_khoa,
            tenkhoa: user.admin_tenkhoa,
          }
        : null,
      studentProfile: user.sv_id
        ? {
            sv_id: user.sv_id,
            mssv: user.mssv,
            gpa: user.gpa,
            diem_rl: user.diem_rl,
            id_lop: user.id_lop,
          }
        : null,
      studentAcademic: user.sv_id
        ? {
            id_khoa: user.student_khoa_id,
            id_nganh: user.id_nganh,
            id_lop: user.id_lop,
            tenlop: user.tenlop,
            ten_nganh: user.ten_nganh,
            tenkhoa: user.student_tenkhoa,
          }
        : null,
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Step 1 - Create base user account in nguoidung
 */
export const createUserService = async (payload) => {
  const { hoten, tendangnhap, email, password, vaitro = "sv", ngaysinh, gioitinh } = payload;

  if (!hoten || !tendangnhap || !password) {
    throw new ApiError(400, "Thiếu thông tin bắt buộc");
  }

  try {
    const user = await createUser({
      hoten,
      tendangnhap,
      email,
      password,
      vaitro,
      ngaysinh,
      gioitinh,
    });

    return {
      id_nd: user.id_nd,
      hoten: user.hoten,
      tendangnhap: user.tendangnhap,
      email: user.email,
      vaitro: user.vaitro,
      ngaysinh: user.ngaysinh,
      gioitinh: user.gioitinh,
    };
  } catch (error) {
    throw new ApiError(500, "Lỗi khi tạo người dùng: " + error.message);
  }
};

/**
 * Step 2 - Create role profile in admin/sinhvien
 */
export const createUserProfileService = async (idNd, payload) => {
  const baseUser = await getUserById(idNd);

  if (!baseUser) {
    throw new ApiError(404, "Không tìm thấy người dùng");
  }

  if (baseUser.vaitro === "ad") {
    const { mgv, hoc_vi, hoc_ham, id_khoa } = payload;

    if (!mgv) {
      throw new ApiError(400, "Thiếu mã giảng viên");
    }

    if (!id_khoa) {
      throw new ApiError(400, "Thiếu khoa cho tài khoản admin");
    }

    try {
      const user = await createAdminProfile({
        id_nd: idNd,
        mgv,
        hoc_vi,
        hoc_ham,
        id_khoa,
      });

      return getUserByIdService(user.id_nd);
    } catch (error) {
      throw new ApiError(500, "Lỗi khi tạo hồ sơ admin: " + error.message);
    }
  }

  const { id_lop, mssv, gpa, diem_rl } = payload;

  if (!id_lop) {
    throw new ApiError(400, "Thiếu lớp cho sinh viên");
  }

  if (!mssv) {
    throw new ApiError(400, "Thiếu mã số sinh viên");
  }

  try {
    const user = await createStudentProfile({
      id_nd: idNd,
      id_lop,
      mssv,
      gpa,
      diem_rl,
    });

    return getUserByIdService(user.id_nd);
  } catch (error) {
    throw new ApiError(500, "Lỗi khi tạo hồ sơ sinh viên: " + error.message);
  }
};

/**
 * Step 2 - Update role profile in admin/sinhvien
 */
export const updateUserProfileService = async (idNd, payload) => {
  const baseUser = await getUserById(idNd);

  if (!baseUser) {
    throw new ApiError(404, "Không tìm thấy người dùng");
  }

  if (baseUser.vaitro === "ad") {
    const { mgv, hoc_vi, hoc_ham, id_khoa } = payload;

    try {
      const user = await updateAdminProfile({
        id_nd: idNd,
        mgv,
        hoc_vi,
        hoc_ham,
        id_khoa,
      });

      return getUserByIdService(user.id_nd);
    } catch (error) {
      throw new ApiError(500, "Lỗi khi cập nhật hồ sơ admin: " + error.message);
    }
  }

  const { id_lop, mssv, gpa, diem_rl } = payload;

  try {
    const user = await updateStudentProfile({
      id_nd: idNd,
      id_lop,
      mssv,
      gpa,
      diem_rl,
    });

    return getUserByIdService(user.id_nd);
  } catch (error) {
    throw new ApiError(500, "Lỗi khi cập nhật hồ sơ sinh viên: " + error.message);
  }
};


/**
 * Update user service
 */
export const updateUserService = async (idNd, payload) => {
  const { hoten, email, matkhau, ngaysinh, gioitinh, trangthai, vaitro } = payload;

  try {
    // Update basic info - only include fields that are provided
    const updateData = {
      hoten,
      email,
      password: matkhau, // Convert matkhau to password for model
      ngaysinh,
      gioitinh,
      trangthai,
    };

    let user = await updateUser(idNd, updateData);

    // Update role if provided
    if (vaitro) {
      user = await updateUserRole(idNd, vaitro);
    }

    return {
      id_nd: user.id_nd,
      hoten: user.hoten,
      tendangnhap: user.tendangnhap,
      email: user.email,
      vaitro: user.vaitro,
      trangthai: user.trangthai,
    };
  } catch (error) {
    throw new ApiError(500, "Lỗi khi cập nhật người dùng");
  }
};

/**
 * Delete user service
 */
export const deleteUserService = async (idNd) => {
  try {
    await deleteUser(idNd);
    return { success: true };
  } catch (error) {
    throw new ApiError(500, "Lỗi khi xóa người dùng");
  }
};

/**
 * Update user visibility service
 */
export const updateUserVisibilityService = async (idNd, trangthai) => {
  try {
    const user = await updateUserVisibility(idNd, trangthai);
    return {
      id_nd: user.id_nd,
      trangthai: user.trangthai,
    };
  } catch (error) {
    throw new ApiError(500, "Lỗi khi cập nhật trạng thái người dùng");
  }
};
