import { query } from "../config/db.js";

export const listFaculties = async () => {
  return query(
    `SELECT id_khoa, tenkhoa, created_by
     FROM khoa
     ORDER BY id_khoa DESC`
  );
};

export const listMajors = async () => {
  return query(
    `SELECT id_nganh, ten_nganh, id_khoa, created_by
     FROM nganh
     ORDER BY id_nganh DESC`
  );
};

export const listClasses = async () => {
  return query(
    `SELECT id_lop, tenlop, id_nganh, created_by
     FROM lop
     ORDER BY id_lop DESC`
  );
};

export const getFacultyById = async (idKhoa) => {
  const rows = await query(
    `SELECT id_khoa, tenkhoa, created_by
     FROM khoa
     WHERE id_khoa = ?
     LIMIT 1`,
    [idKhoa]
  );

  return rows[0] || null;
};

export const getMajorById = async (idNganh) => {
  const rows = await query(
    `SELECT id_nganh, ten_nganh, id_khoa, created_by
     FROM nganh
     WHERE id_nganh = ?
     LIMIT 1`,
    [idNganh]
  );

  return rows[0] || null;
};

export const getClassById = async (idLop) => {
  const rows = await query(
    `SELECT id_lop, tenlop, id_nganh, created_by
     FROM lop
     WHERE id_lop = ?
     LIMIT 1`,
    [idLop]
  );

  return rows[0] || null;
};

export const createFaculty = async ({ tenkhoa, created_by = null }) => {
  const result = await query(
    `INSERT INTO khoa (tenkhoa, created_by)
     VALUES (?, ?)`,
    [tenkhoa, created_by]
  );

  return getFacultyById(result.insertId);
};

export const updateFaculty = async (idKhoa, { tenkhoa }) => {
  await query(
    `UPDATE khoa
     SET tenkhoa = ?
     WHERE id_khoa = ?`,
    [tenkhoa, idKhoa]
  );

  return getFacultyById(idKhoa);
};

export const deleteFaculty = async (idKhoa) => {
  await query("DELETE FROM khoa WHERE id_khoa = ?", [idKhoa]);
  return true;
};

export const createMajor = async ({ ten_nganh, id_khoa, created_by = null }) => {
  const result = await query(
    `INSERT INTO nganh (ten_nganh, id_khoa, created_by)
     VALUES (?, ?, ?)`,
    [ten_nganh, id_khoa, created_by]
  );

  return getMajorById(result.insertId);
};

export const updateMajor = async (idNganh, { ten_nganh, id_khoa }) => {
  await query(
    `UPDATE nganh
     SET ten_nganh = ?, id_khoa = ?
     WHERE id_nganh = ?`,
    [ten_nganh, id_khoa, idNganh]
  );

  return getMajorById(idNganh);
};

export const deleteMajor = async (idNganh) => {
  await query("DELETE FROM nganh WHERE id_nganh = ?", [idNganh]);
  return true;
};

export const createClass = async ({ tenlop, id_nganh, created_by = null }) => {
  const result = await query(
    `INSERT INTO lop (tenlop, id_nganh, created_by)
     VALUES (?, ?, ?)`,
    [tenlop, id_nganh, created_by]
  );

  return getClassById(result.insertId);
};

export const updateClass = async (idLop, { tenlop, id_nganh }) => {
  await query(
    `UPDATE lop
     SET tenlop = ?, id_nganh = ?
     WHERE id_lop = ?`,
    [tenlop, id_nganh, idLop]
  );

  return getClassById(idLop);
};

export const deleteClass = async (idLop) => {
  await query("DELETE FROM lop WHERE id_lop = ?", [idLop]);
  return true;
};

export const countMajorsByFaculty = async (idKhoa) => {
  const rows = await query("SELECT COUNT(*) AS count FROM nganh WHERE id_khoa = ?", [idKhoa]);
  return Number(rows[0]?.count || 0);
};

export const countClassesByMajor = async (idNganh) => {
  const rows = await query("SELECT COUNT(*) AS count FROM lop WHERE id_nganh = ?", [idNganh]);
  return Number(rows[0]?.count || 0);
};
