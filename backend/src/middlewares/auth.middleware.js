import { query } from "../config/db.js";
import { verifyAccessToken } from "../utils/token.js";

const getTokenFromRequest = (req) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }

  return req.headers.token || req.headers["x-access-token"] || null;
};

export const verifyToken = async (req, res, next) => {
  try {
    const token = getTokenFromRequest(req);

    if (!token) {
      return res.status(401).json({ success: false, message: "Thiếu token đăng nhập" });
    }

    const payload = verifyAccessToken(token);
    const rows = await query(
      `SELECT n.id_nd, n.hoten, n.tendangnhap, n.email, n.vaitro, n.trangthai,
              s.sv_id, s.mssv, s.gpa, s.diem_rl, s.id_lop,
              a.id_ad, a.mgv, a.hoc_vi, a.hoc_ham
       FROM nguoidung n
       LEFT JOIN sinhvien s ON s.id_nd = n.id_nd
       LEFT JOIN admin a ON a.id_nd = n.id_nd
       WHERE n.id_nd = ?
       LIMIT 1`,
      [payload.id_nd]
    );

    if (!rows.length) {
      return res.status(401).json({ success: false, message: "Tài khoản không còn tồn tại" });
    }

    req.user = rows[0];
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: "Token không hợp lệ", details: error.message });
  }
};