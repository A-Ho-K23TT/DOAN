import { getConnection, query } from "../config/db.js";

export const findApplicationById = async (idHosodk) => {
  const rows = await query(
    `SELECT hs.id_hosodk, hs.id_hb, hs.id_sv, hs.trangthai, hs.ngaynop, hs.ketqua, hs.ly_do_tu_choi, hs.ngay_xet_duyet, hs.ngay_xet_chon,
            sv.sv_id, sv.mssv, sv.gpa, sv.diem_rl, sv.id_lop,
            nd.id_nd, nd.hoten, nd.tendangnhap, nd.email, nd.ngaysinh, nd.gioitinh,
            hb.tenhb, hb.han, hb.trangthai AS scholarship_status
     FROM hsdangky hs
     INNER JOIN sinhvien sv ON sv.sv_id = hs.id_sv
     INNER JOIN nguoidung nd ON nd.id_nd = sv.id_nd
     INNER JOIN hocbong hb ON hb.id_hb = hs.id_hb
     WHERE hs.id_hosodk = ?
     LIMIT 1`,
    [idHosodk]
  );

  return rows[0] || null;
};

export const findApplicationByScholarshipAndStudent = async (idHb, idSv) => {
  const rows = await query(
    `SELECT * FROM hsdangky
     WHERE id_hb = ? AND id_sv = ?
     ORDER BY id_hosodk DESC
     LIMIT 1`,
    [idHb, idSv]
  );

  return rows[0] || null;
};

export const createApplication = async ({ id_hb, id_sv, trangthai = "pending" }) => {
  const connection = await getConnection();

  try {
    const [result] = await connection.execute(
      `INSERT INTO hsdangky (id_hb, id_sv, trangthai, ngaynop, ketqua)
       VALUES (?, ?, ?, NOW(), FALSE)`,
      [id_hb, id_sv, trangthai]
    );

    return findApplicationById(result.insertId);
  } finally {
    connection.release();
  }
};

export const resetApplicationForResubmit = async (idHosodk) => {
  const connection = await getConnection();

  try {
    await connection.beginTransaction();

    await connection.execute(
      `UPDATE hsdangky
       SET trangthai = 'pending', ketqua = FALSE, ly_do_tu_choi = NULL,
           ngay_xet_duyet = NULL, ngay_xet_chon = NULL, ngaynop = NOW()
       WHERE id_hosodk = ?`,
      [idHosodk]
    );

    await connection.execute("UPDATE submit_config SET is_latest = FALSE WHERE id_hosodk = ?", [idHosodk]);
    await connection.execute(
      `DELETE rd
       FROM review_detail rd
       INNER JOIN submit_config sc ON sc.id_submit = rd.id_submit
       WHERE sc.id_hosodk = ?`,
      [idHosodk]
    );

    await connection.commit();
    return findApplicationById(idHosodk);
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

export const createSubmission = async ({ id_hosodk, data_json, trangthai = 1, is_latest = true }) => {
  const connection = await getConnection();

  try {
    const [result] = await connection.execute(
      `INSERT INTO submit_config (id_hosodk, data_json, is_latest, trangthai, submitted_at)
       VALUES (?, ?, ?, ?, NOW())`,
      [id_hosodk, JSON.stringify(data_json), is_latest ? 1 : 0, trangthai]
    );

    const rows = await query(
      `SELECT id_submit, id_hosodk, data_json, is_latest, trangthai, submitted_at
       FROM submit_config
       WHERE id_submit = ?
       LIMIT 1`,
      [result.insertId]
    );

    return rows[0] || null;
  } finally {
    connection.release();
  }
};

export const markOldSubmissionsAsNotLatest = async (idHosodk) => {
  await query("UPDATE submit_config SET is_latest = FALSE WHERE id_hosodk = ?", [idHosodk]);
};

export const getLatestSubmission = async (idHosodk) => {
  const rows = await query(
    `SELECT id_submit, id_hosodk, data_json, is_latest, trangthai, submitted_at
     FROM submit_config
     WHERE id_hosodk = ? AND is_latest = 1
     ORDER BY id_submit DESC
     LIMIT 1`,
    [idHosodk]
  );

  if (rows[0]) {
    return rows[0];
  }

  const fallbackRows = await query(
    `SELECT id_submit, id_hosodk, data_json, is_latest, trangthai, submitted_at
     FROM submit_config
     WHERE id_hosodk = ?
     ORDER BY id_submit DESC
     LIMIT 1`,
    [idHosodk]
  );

  return fallbackRows[0] || null;
};

export const listMyApplications = async (idSv) => {
  return query(
    `SELECT hs.id_hosodk, hs.id_hb, hs.id_sv, hs.trangthai, hs.ngaynop, hs.ketqua, hs.ly_do_tu_choi, hs.ngay_xet_duyet, hs.ngay_xet_chon,
            hb.tenhb, hb.han, hb.giatri,
            COALESCE((SELECT COUNT(*) FROM submit_config sc WHERE sc.id_hosodk = hs.id_hosodk), 0) AS submit_count,
            COALESCE((SELECT COUNT(*)
                      FROM review_detail rd
                      INNER JOIN submit_config sc ON sc.id_submit = rd.id_submit
                      WHERE sc.id_hosodk = hs.id_hosodk), 0) AS review_count
     FROM hsdangky hs
     INNER JOIN hocbong hb ON hb.id_hb = hs.id_hb
     WHERE hs.id_sv = ?
     ORDER BY hs.id_hosodk DESC`,
    [idSv]
  );
};

export const listApplicationsByScholarship = async (idHb) => {
  return query(
    `SELECT hs.id_hosodk, hs.id_hb, hs.id_sv, hs.trangthai, hs.ngaynop, hs.ketqua, hs.ly_do_tu_choi, hs.ngay_xet_duyet, hs.ngay_xet_chon,
            nd.id_nd, nd.hoten, nd.tendangnhap, nd.email,
            sv.mssv, sv.gpa, sv.diem_rl, sv.id_lop,
            COALESCE((SELECT COUNT(*) FROM submit_config sc WHERE sc.id_hosodk = hs.id_hosodk), 0) AS submit_count,
            CASE
              WHEN hs.trangthai = 'pending' THEN 'Chờ duyệt'
              WHEN hs.trangthai = 'need_edit' THEN 'Cần chỉnh sửa'
              WHEN hs.trangthai = 'rejected' THEN 'Bị từ chối'
              WHEN hs.trangthai = 'qualified' THEN 'Qua vòng hồ sơ'
              WHEN hs.trangthai = 'awarded' THEN 'Được trao học bổng'
              WHEN hs.trangthai = 'failed' THEN 'Trượt xét chọn'
              ELSE hs.trangthai
            END AS status_label
     FROM hsdangky hs
     INNER JOIN sinhvien sv ON sv.sv_id = hs.id_sv
     INNER JOIN nguoidung nd ON nd.id_nd = sv.id_nd
     WHERE hs.id_hb = ?
     ORDER BY hs.id_hosodk DESC`,
    [idHb]
  );
};

export const listQualifiedApplications = async (idHb) => {
  return query(
    `SELECT hs.id_hosodk, hs.id_hb, hs.id_sv, hs.trangthai, hs.ngaynop,
            nd.hoten, nd.tendangnhap, nd.email, sv.mssv, sv.gpa, sv.diem_rl
     FROM hsdangky hs
     INNER JOIN sinhvien sv ON sv.sv_id = hs.id_sv
     INNER JOIN nguoidung nd ON nd.id_nd = sv.id_nd
     WHERE hs.id_hb = ? AND hs.trangthai = 'qualified'
     ORDER BY hs.id_hosodk ASC`,
    [idHb]
  );
};

export const upsertReviewDetail = async ({ id_hosodk, id_ad, field_key, is_pass, lydo }) => {
  const connection = await getConnection();

  try {
    await connection.beginTransaction();

    const submissionRows = await connection.execute(
      `SELECT id_submit
       FROM submit_config
       WHERE id_hosodk = ?
       ORDER BY id_submit DESC
       LIMIT 1`,
      [id_hosodk]
    );

    const idSubmit = submissionRows[0]?.[0]?.id_submit;

    if (!idSubmit) {
      throw new Error("Không tìm thấy submission để lưu review");
    }

    await connection.execute(
      `DELETE rd
       FROM review_detail rd
       WHERE rd.id_submit = ? AND rd.field_key = ?`,
      [idSubmit, field_key]
    );
    await connection.execute(
      `INSERT INTO review_detail (id_submit, id_ad, field_key, is_pass, lydo, review_at)
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [idSubmit, id_ad, field_key, Boolean(is_pass) ? 1 : 0, lydo || null]
    );

    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

export const getReviewDetails = async (idHosodk) => {
  const rows = await query(
    `SELECT
       rd.id_review,
       rd.id_submit,
       rd.id_ad,
       rd.field_key,
       rd.is_pass,
       rd.lydo,
       rd.review_at,
       sc.data_json,
       fc.form_json
     FROM review_detail rd
     INNER JOIN submit_config sc ON sc.id_submit = rd.id_submit
     INNER JOIN hsdangky hs ON hs.id_hosodk = sc.id_hosodk
     LEFT JOIN form_config fc ON fc.id_hb = hs.id_hb
     WHERE sc.id_hosodk = ?
     ORDER BY rd.id_review ASC`,
    [idHosodk]
  );

  // Process the results to extract label and student answer
  return rows.map(row => {
    let fieldLabel = row.field_key; // fallback
    let studentAnswer = null;

    try {
      // Extract student answer from data_json
      let dataJson = row.data_json;
      if (row.data_json && typeof row.data_json === 'string') {
        dataJson = JSON.parse(row.data_json);
      }

      if (dataJson && typeof dataJson === 'object') {
        const rawAnswer = dataJson[row.field_key];

        if (rawAnswer !== undefined && rawAnswer !== null) {
          if (typeof rawAnswer === 'object') {
            if (rawAnswer.value !== undefined) {
              studentAnswer = rawAnswer.value;
            } else if (rawAnswer.label !== undefined) {
              studentAnswer = rawAnswer.label;
            } else if (Array.isArray(rawAnswer)) {
              studentAnswer = rawAnswer.join(", ");
            } else {
              studentAnswer = JSON.stringify(rawAnswer);
            }
          } else {
            studentAnswer = String(rawAnswer);
          }
        }
      }

      // Extract label from form_json
      let formJson = row.form_json;
      if (row.form_json && typeof row.form_json === 'string') {
        formJson = JSON.parse(row.form_json);
      }

      if (formJson && formJson.fields && Array.isArray(formJson.fields)) {
        const field = formJson.fields.find(f => f.key === row.field_key);
        if (field && field.label) {
          fieldLabel = field.label;
        }
      }
    } catch (error) {
      console.warn('Error parsing JSON for review detail:', error.message);
      // Keep defaults if parsing fails
    }

    return {
      id_review: row.id_review,
      id_submit: row.id_submit,
      id_ad: row.id_ad,
      field_key: row.field_key,
      is_pass: row.is_pass,
      lydo: row.lydo,
      review_at: row.review_at,
      field_label: fieldLabel,
      student_answer: studentAnswer
    };
  });
};

export const updateApplicationStatus = async ({ id_hosodk, trangthai, ly_do_tu_choi = null }) => {
  const payload = {
    trangthai,
    ly_do_tu_choi,
    ngay_xet_duyet: ["qualified", "need_edit", "rejected", "pending"].includes(trangthai) ? new Date() : undefined,
    ketqua: trangthai === "awarded",
    ngay_xet_chon: ["awarded", "failed"].includes(trangthai) ? new Date() : undefined,
  };

  const fields = [];
  const values = [];

  for (const [key, value] of Object.entries(payload)) {
    if (value !== undefined) {
      fields.push(`${key} = ?`);
      values.push(value);
    }
  }

  values.push(id_hosodk);
  await query(`UPDATE hsdangky SET ${fields.join(", ")} WHERE id_hosodk = ?`, values);
  return findApplicationById(id_hosodk);
};

export const setSelectionStatus = async ({ id_hosodk, awarded }) => {
  await query(
    `UPDATE hsdangky
     SET trangthai = ?, ketqua = ?, ngay_xet_chon = NOW()
     WHERE id_hosodk = ?`,
    [awarded ? "awarded" : "failed", awarded ? 1 : 0, id_hosodk]
  );
};