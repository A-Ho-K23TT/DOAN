import bcrypt from "bcrypt";
import { query } from "../config/db.js";

/**
 * List all users with optional filtering
 */
export const listUsers = async (filters = {}) => {
  let sql = `
    SELECT 
      n.id_nd, 
      n.hoten, 
      n.tendangnhap, 
      n.email, 
      n.matkhau,
      n.vaitro, 
      n.ngaysinh, 
      n.gioitinh, 
      n.trangthai,
      n.ngaytao,
      a.id_ad,
      a.mgv,
      a.hoc_vi,
      a.hoc_ham,
      a.id_khoa AS admin_id_khoa,
      sv.sv_id,
      sv.mssv,
      sv.gpa,
      sv.diem_rl,
      sv.id_lop,
      ng.id_nganh,
      k_ad.id_khoa AS admin_khoa_id,
      k_ad.tenkhoa AS admin_tenkhoa,
      k_sv.id_khoa AS student_khoa_id,
      k_sv.tenkhoa AS student_tenkhoa,
      ng.ten_nganh,
      l.tenlop
    FROM nguoidung n
    LEFT JOIN admin a ON a.id_nd = n.id_nd
    LEFT JOIN sinhvien sv ON sv.id_nd = n.id_nd
    LEFT JOIN lop l ON l.id_lop = sv.id_lop
    LEFT JOIN nganh ng ON ng.id_nganh = l.id_nganh
    LEFT JOIN khoa k_ad ON k_ad.id_khoa = a.id_khoa
    LEFT JOIN khoa k_sv ON k_sv.id_khoa = ng.id_khoa
    WHERE 1=1
  `;

  const params = [];

  if (filters.vaitro) {
    sql += ` AND n.vaitro = ?`;
    params.push(filters.vaitro);
  }

  if (filters.trangthai !== undefined) {
    sql += ` AND n.trangthai = ?`;
    params.push(filters.trangthai);
  }

  if (filters.search) {
    sql += ` AND (n.hoten LIKE ? OR n.tendangnhap LIKE ? OR n.email LIKE ?)`;
    const searchTerm = `%${filters.search}%`;
    params.push(searchTerm, searchTerm, searchTerm);
  }

  sql += ` ORDER BY n.ngaytao DESC LIMIT 100`;

  return query(sql, params);
};

/**
 * Get user by ID
 */
export const getUserById = async (idNd) => {
  const rows = await query(
    `
    SELECT 
      n.id_nd, 
      n.hoten, 
      n.tendangnhap, 
      n.email, 
      n.matkhau,
      n.vaitro, 
      n.ngaysinh, 
      n.gioitinh, 
      n.trangthai,
      n.ngaytao,
      a.id_ad,
      a.mgv,
      a.hoc_vi,
      a.hoc_ham,
      a.id_khoa AS admin_id_khoa,
      sv.sv_id,
      sv.mssv,
      sv.gpa,
      sv.diem_rl,
      sv.id_lop,
      ng.id_nganh,
      k_ad.id_khoa AS admin_khoa_id,
      k_ad.tenkhoa AS admin_tenkhoa,
      k_sv.id_khoa AS student_khoa_id,
      k_sv.tenkhoa AS student_tenkhoa,
      ng.ten_nganh,
      l.tenlop
    FROM nguoidung n
    LEFT JOIN admin a ON a.id_nd = n.id_nd
    LEFT JOIN sinhvien sv ON sv.id_nd = n.id_nd
    LEFT JOIN lop l ON l.id_lop = sv.id_lop
    LEFT JOIN nganh ng ON ng.id_nganh = l.id_nganh
    LEFT JOIN khoa k_ad ON k_ad.id_khoa = a.id_khoa
    LEFT JOIN khoa k_sv ON k_sv.id_khoa = ng.id_khoa
    WHERE n.id_nd = ?
    LIMIT 1
    `,
    [idNd]
  );

  return rows[0] || null;
};

/**
 * Create new user
 */
export const createUser = async ({
  hoten,
  tendangnhap,
  email,
  password,
  vaitro = "sv",
  ngaysinh = null,
  gioitinh = null,
  transthai = 1,
}) => {
  const hashedPassword = await bcrypt.hash(password, 10);

  const result = await query(
    `
    INSERT INTO nguoidung (hoten, tendangnhap, email, matkhau, vaitro, ngaysinh, gioitinh, trangthai)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [hoten, tendangnhap, email, hashedPassword, vaitro, ngaysinh, gioitinh, transthai]
  );

  return getUserById(result.insertId);
};

export const createAdminProfile = async ({ id_nd, mgv, hoc_vi = null, hoc_ham = null, id_khoa = null }) => {
  await query(
    `
    INSERT INTO admin (id_nd, mgv, hoc_vi, hoc_ham, id_khoa)
    VALUES (?, ?, ?, ?, ?)
    `,
    [id_nd, mgv, hoc_vi, hoc_ham, id_khoa]
  );

  return getUserById(id_nd);
};

export const createStudentProfile = async ({ id_nd, mssv, gpa = 0, diem_rl = 0, id_lop }) => {
  await query(
    `
    INSERT INTO sinhvien (id_nd, mssv, gpa, diem_rl, id_lop)
    VALUES (?, ?, ?, ?, ?)
    `,
    [id_nd, mssv, gpa, diem_rl, id_lop]
  );

  return getUserById(id_nd);
};

/**
 * Update admin profile
 */
export const updateAdminProfile = async ({ id_nd, mgv, hoc_vi = null, hoc_ham = null, id_khoa = null }) => {
  const updates = [];
  const params = [];

  if (mgv !== undefined) {
    updates.push(`mgv = ?`);
    params.push(mgv);
  }

  if (hoc_vi !== undefined) {
    updates.push(`hoc_vi = ?`);
    params.push(hoc_vi);
  }

  if (hoc_ham !== undefined) {
    updates.push(`hoc_ham = ?`);
    params.push(hoc_ham);
  }

  if (id_khoa !== undefined) {
    updates.push(`id_khoa = ?`);
    params.push(id_khoa);
  }

  if (updates.length === 0) {
    return getUserById(id_nd);
  }

  params.push(id_nd);
  await query(`UPDATE admin SET ${updates.join(", ")} WHERE id_nd = ?`, params);

  return getUserById(id_nd);
};

/**
 * Update student profile
 */
export const updateStudentProfile = async ({ id_nd, mssv, gpa = null, diem_rl = null, id_lop }) => {
  const updates = [];
  const params = [];

  if (mssv !== undefined) {
    updates.push(`mssv = ?`);
    params.push(mssv);
  }

  if (gpa !== undefined) {
    updates.push(`gpa = ?`);
    params.push(gpa);
  }

  if (diem_rl !== undefined) {
    updates.push(`diem_rl = ?`);
    params.push(diem_rl);
  }

  if (id_lop !== undefined) {
    updates.push(`id_lop = ?`);
    params.push(id_lop);
  }

  if (updates.length === 0) {
    return getUserById(id_nd);
  }

  params.push(id_nd);
  await query(`UPDATE sinhvien SET ${updates.join(", ")} WHERE id_nd = ?`, params);

  return getUserById(id_nd);
};

/**
 * Update user
 */
export const updateUser = async (
  idNd,
  {
    hoten,
    email,
    password,
    ngaysinh,
    gioitinh,
    trangthai,
  }
) => {
  const updates = [];
  const params = [];

  if (hoten !== undefined) {
    updates.push(`hoten = ?`);
    params.push(hoten);
  }

  if (email !== undefined) {
    updates.push(`email = ?`);
    params.push(email);
  }

  if (password !== undefined) {
    const hashedPassword = await bcrypt.hash(password, 10);
    updates.push(`matkhau = ?`);
    params.push(hashedPassword);
  }

  if (ngaysinh !== undefined) {
    updates.push(`ngaysinh = ?`);
    params.push(ngaysinh);
  }

  if (gioitinh !== undefined) {
    updates.push(`gioitinh = ?`);
    params.push(gioitinh);
  }

  if (trangthai !== undefined) {
    updates.push(`trangthai = ?`);
    params.push(trangthai);
  }

  if (!updates.length) {
    return getUserById(idNd);
  }

  params.push(idNd);

  await query(
    `UPDATE nguoidung SET ${updates.join(", ")} WHERE id_nd = ?`,
    params
  );

  return getUserById(idNd);
};

/**
 * Delete user
 */
export const deleteUser = async (idNd) => {
  await query(`DELETE FROM nguoidung WHERE id_nd = ?`, [idNd]);
  return true;
};

/**
 * Update user role
 */
export const updateUserRole = async (idNd, vaitro) => {
  await query(`UPDATE nguoidung SET vaitro = ? WHERE id_nd = ?`, [vaitro, idNd]);
  return getUserById(idNd);
};

/**
 * Update user visibility (trangthai)
 */
export const updateUserVisibility = async (idNd, trangthai) => {
  await query(`UPDATE nguoidung SET trangthai = ? WHERE id_nd = ?`, [trangthai, idNd]);
  return getUserById(idNd);
};
