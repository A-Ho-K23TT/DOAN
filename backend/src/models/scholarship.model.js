import { getConnection, query } from "../config/db.js";

export const listScholarships = async () => {
  return query(
    `SELECT hb.id_hb, hb.tenhb, hb.doituong, hb.mota, hb.soluong, hb.giatri, hb.han, hb.trangthai,
            hb.id_ad, hb.ngaytao,
            COALESCE(nd.hoten, '') AS created_by_name,
            COALESCE((SELECT COUNT(*) FROM hb_files f WHERE f.id_hb = hb.id_hb), 0) AS file_count,
            COALESCE((SELECT COUNT(*) FROM hsdangky dk WHERE dk.id_hb = hb.id_hb), 0) AS application_count
     FROM hocbong hb
     LEFT JOIN admin a ON a.id_ad = hb.id_ad
     LEFT JOIN nguoidung nd ON nd.id_nd = a.id_nd
     ORDER BY hb.id_hb DESC`
  );
};

export const getScholarshipById = async (idHb) => {
  const rows = await query(
    `SELECT hb.id_hb, hb.tenhb, hb.doituong, hb.mota, hb.soluong, hb.giatri, hb.han, hb.trangthai,
            hb.id_ad, hb.ngaytao,
            COALESCE(nd.hoten, '') AS created_by_name
     FROM hocbong hb
     LEFT JOIN admin a ON a.id_ad = hb.id_ad
     LEFT JOIN nguoidung nd ON nd.id_nd = a.id_nd
     WHERE hb.id_hb = ?
     LIMIT 1`,
    [idHb]
  );

  return rows[0] || null;
};

export const createScholarship = async ({ tenhb, doituong = null, mota = null, soluong = null, giatri = null, han = null, trangthai = "dang_mo", id_ad = null }) => {
  const connection = await getConnection();

  try {
    const [result] = await connection.execute(
      `INSERT INTO hocbong (tenhb, doituong, mota, soluong, giatri, han, trangthai, id_ad)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [tenhb, doituong, mota, soluong, giatri, han, trangthai, id_ad]
    );

    return getScholarshipById(result.insertId);
  } finally {
    connection.release();
  }
};

export const updateScholarship = async (idHb, payload) => {
  const fields = [];
  const values = [];

  for (const [key, value] of Object.entries(payload)) {
    if (value !== undefined) {
      fields.push(`${key} = ?`);
      values.push(value);
    }
  }

  if (!fields.length) {
    return getScholarshipById(idHb);
  }

  values.push(idHb);
  await query(`UPDATE hocbong SET ${fields.join(", ")} WHERE id_hb = ?`, values);
  return getScholarshipById(idHb);
};

export const deleteScholarship = async (idHb) => {
  await query("DELETE FROM hocbong WHERE id_hb = ?", [idHb]);
  return true;
};

export const listScholarshipFiles = async (idHb) => {
  return query(
    `SELECT id_hb_files, id_hb, ten_file_goc, file_url, loai_file, kich_thuoc, ngaytao
     FROM hb_files
     WHERE id_hb = ?
     ORDER BY id_hb_files DESC`,
    [idHb]
  );
};

export const getScholarshipFileById = async (idHbFiles, idHb = null) => {
  const conditions = ["id_hb_files = ?"];
  const values = [idHbFiles];

  if (idHb) {
    conditions.push("id_hb = ?");
    values.push(idHb);
  }

  const rows = await query(
    `SELECT id_hb_files, id_hb, ten_file_goc, file_url, loai_file, kich_thuoc, ngaytao
     FROM hb_files
     WHERE ${conditions.join(" AND ")}
     LIMIT 1`,
    values
  );

  return rows[0] || null;
};

export const addScholarshipFile = async ({ id_hb, ten_file_goc, file_url, loai_file, kich_thuoc }) => {
  const connection = await getConnection();

  try {
    const [result] = await connection.execute(
      `INSERT INTO hb_files (id_hb, ten_file_goc, file_url, loai_file, kich_thuoc)
       VALUES (?, ?, ?, ?, ?)`,
      [id_hb, ten_file_goc, file_url, loai_file, kich_thuoc]
    );

    const rows = await query(
      `SELECT id_hb_files, id_hb, ten_file_goc, file_url, loai_file, kich_thuoc, ngaytao
       FROM hb_files
       WHERE id_hb_files = ?
       LIMIT 1`,
      [result.insertId]
    );

    return rows[0] || null;
  } finally {
    connection.release();
  }
};

export const deleteScholarshipFileById = async (idHbFiles, idHb = null) => {
  const conditions = ["id_hb_files = ?"];
  const values = [idHbFiles];

  if (idHb) {
    conditions.push("id_hb = ?");
    values.push(idHb);
  }

  await query(`DELETE FROM hb_files WHERE ${conditions.join(" AND ")}`, values);
  return true;
};

export const getFormConfigRow = async (idHb) => {
  const rows = await query(
    `SELECT id_form, id_hb, form_json
     FROM form_config
     WHERE id_hb = ?
     ORDER BY id_form DESC
     LIMIT 1`,
    [idHb]
  );

  return rows[0] || null;
};

export const saveFormConfigRow = async (idHb, formJson) => {
  const connection = await getConnection();

  try {
    const existing = await query("SELECT id_form FROM form_config WHERE id_hb = ? LIMIT 1", [idHb]);

    if (existing.length) {
      await connection.execute("UPDATE form_config SET form_json = ? WHERE id_hb = ?", [JSON.stringify(formJson), idHb]);
      return getFormConfigRow(idHb);
    }

    await connection.execute("INSERT INTO form_config (id_hb, form_json) VALUES (?, ?)", [idHb, JSON.stringify(formJson)]);
    return getFormConfigRow(idHb);
  } finally {
    connection.release();
  }
};