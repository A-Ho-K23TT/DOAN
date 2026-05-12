import bcrypt from "bcrypt";
import { getConnection, query } from "../config/db.js";

export const findAccountByIdentifier = async (identifier) => {
  const rows = await query(
    `SELECT n.id_nd, n.hoten, n.tendangnhap, n.email, n.matkhau, n.vaitro, n.ngaysinh, n.gioitinh, n.trangthai,
            s.sv_id, s.mssv, s.gpa, s.diem_rl, s.id_lop,
            l.tenlop, ng.id_nganh, ng.ten_nganh, k.id_khoa, k.tenkhoa,
            a.id_ad, a.mgv, a.hoc_vi, a.hoc_ham
     FROM nguoidung n
     LEFT JOIN sinhvien s ON s.id_nd = n.id_nd
      LEFT JOIN lop l ON l.id_lop = s.id_lop
      LEFT JOIN nganh ng ON ng.id_nganh = l.id_nganh
      LEFT JOIN khoa k ON k.id_khoa = ng.id_khoa
     LEFT JOIN admin a ON a.id_nd = n.id_nd
     WHERE n.tendangnhap = ? OR n.email = ?
     LIMIT 1`,
    [identifier, identifier]
  );

  return rows[0] || null;
};

export const findAccountById = async (idNd) => {
  const rows = await query(
    `SELECT n.id_nd, n.hoten, n.tendangnhap, n.email, n.vaitro, n.ngaysinh, n.gioitinh, n.trangthai,
            s.sv_id, s.mssv, s.gpa, s.diem_rl, s.id_lop,
            l.tenlop, ng.id_nganh, ng.ten_nganh, k.id_khoa, k.tenkhoa,
            a.id_ad, a.mgv, a.hoc_vi, a.hoc_ham
      LEFT JOIN lop l ON l.id_lop = s.id_lop
      LEFT JOIN nganh ng ON ng.id_nganh = l.id_nganh
      LEFT JOIN khoa k ON k.id_khoa = ng.id_khoa
     FROM nguoidung n
     LEFT JOIN sinhvien s ON s.id_nd = n.id_nd
     LEFT JOIN admin a ON a.id_nd = n.id_nd
     WHERE n.id_nd = ?
     LIMIT 1`,
    [idNd]
  );

  return rows[0] || null;
};

export const createStudentAccount = async ({ hoten, mssv, email, password, ngaysinh = null, gioitinh = null, id_lop = null, gpa = 0, diem_rl = 0 }) => {
  const connection = await getConnection();

  try {
    await connection.beginTransaction();

    const hashedPassword = await bcrypt.hash(password, 10);
    const [userResult] = await connection.execute(
      `INSERT INTO nguoidung (hoten, tendangnhap, email, matkhau, vaitro, ngaysinh, gioitinh, trangthai)
       VALUES (?, ?, ?, ?, 'sv', ?, ?, 1)`,
      [hoten, mssv, email || null, hashedPassword, ngaysinh, gioitinh]
    );

    const idNd = userResult.insertId;

    await connection.execute(
      `INSERT INTO sinhvien (id_nd, mssv, gpa, diem_rl, id_lop)
       VALUES (?, ?, ?, ?, ?)`,
      [idNd, mssv, gpa, diem_rl, id_lop]
    );

    await connection.commit();
    return findAccountById(idNd);
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};
