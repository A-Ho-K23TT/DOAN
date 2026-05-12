import bcrypt from "bcrypt";
import validator from "validator";
import { createStudentAccount, findAccountByIdentifier } from "../models/auth.model.js";
import { ApiError } from "../utils/apiError.js";
import { signAccessToken } from "../utils/token.js";

const buildProfile = (account) => {
  if (!account) {
    return null;
  }

  return {
    id_nd: account.id_nd,
    hoten: account.hoten,
    tendangnhap: account.tendangnhap,
    email: account.email,
    vaitro: account.vaitro,
      ngaysinh: account.ngaysinh,
      gioitinh: account.gioitinh,
      trangthai: account.trangthai,
    studentProfile: account.sv_id
      ? {
          sv_id: account.sv_id,
          mssv: account.mssv,
          gpa: account.gpa,
          diem_rl: account.diem_rl,
          id_lop: account.id_lop,
        }
      : null,
        studentAcademic: account.sv_id
          ? {
              id_khoa: account.id_khoa,
              tenkhoa: account.tenkhoa,
              id_nganh: account.id_nganh,
              ten_nganh: account.ten_nganh,
              tenlop: account.tenlop,
            }
          : null,
    adminProfile: account.id_ad
      ? {
          id_ad: account.id_ad,
          mgv: account.mgv,
          hoc_vi: account.hoc_vi,
          hoc_ham: account.hoc_ham,
        }
      : null,
  };
};

export const login = async (payload) => {
  const identifier = payload.identifier || payload.email || payload.username || payload.tendangnhap || payload.mssv;
  const password = payload.password;

  if (!identifier || !password) {
    throw new ApiError(400, "Thiếu thông tin đăng nhập");
  }

  const account = await findAccountByIdentifier(identifier);

  if (!account) {
    throw new ApiError(404, "Tài khoản không tồn tại");
  }

  const isMatch = await bcrypt.compare(password, account.matkhau);

  if (!isMatch) {
    throw new ApiError(401, "Sai thông tin đăng nhập");
  }

  return {
    accessToken: signAccessToken({ id_nd: account.id_nd, vaitro: account.vaitro }),
    profile: buildProfile(account),
  };
};

export const registerStudent = async (payload) => {
  const { hoten, mssv, email, password, ngaysinh, gioitinh, id_lop, gpa, diem_rl } = payload;

  if (!hoten || !mssv || !password) {
    throw new ApiError(400, "Thiếu họ tên, MSSV hoặc mật khẩu");
  }

  if (email && !validator.isEmail(email)) {
    throw new ApiError(400, "Email không hợp lệ");
  }

  if (password.length < 8) {
    throw new ApiError(400, "Mật khẩu phải có ít nhất 8 ký tự");
  }

  const account = await createStudentAccount({ hoten, mssv, email, password, ngaysinh, gioitinh, id_lop, gpa, diem_rl });

  return {
    accessToken: signAccessToken({ id_nd: account.id_nd, vaitro: account.vaitro }),
    profile: buildProfile(account),
  };
};