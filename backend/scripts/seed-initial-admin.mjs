import "dotenv/config";
import bcrypt from "bcrypt";
import mysql from "mysql2/promise";

const adminAccount = {
  hoten: "Nguyen Quang Tri",
  tendangnhap: "admin@kontum.udn.vn",
  email: "admin@kontum.udn.vn",
  password: "admin123",
  ngaysinh: "2005-04-25",
  gioitinh: "nam",
  mgv: "GV001",
  hoc_vi: "ThS",
  hoc_ham: "Giang vien",
};

const host = process.env.MYSQL_HOST ? process.env.MYSQL_HOST : "localhost";
const user = process.env.MYSQL_USER ? process.env.MYSQL_USER : "root";
const password = process.env.MYSQL_PASSWORD ? process.env.MYSQL_PASSWORD : "";
const database = process.env.MYSQL_DATABASE ? process.env.MYSQL_DATABASE : "QLHB";
const port = process.env.MYSQL_PORT ? Number(process.env.MYSQL_PORT) : 3306;

const pool = mysql.createPool({
  host,
  user,
  password,
  database,
  port,
  waitForConnections: true,
  connectionLimit: 1,
  queueLimit: 0,
});

const resolveAdminCode = async (connection) => {
  const candidates = [adminAccount.mgv, `${adminAccount.mgv}-1`, `${adminAccount.mgv}-2`, `${adminAccount.mgv}-INIT`];

  for (const candidate of candidates) {
    const [rows] = await connection.execute(
      `SELECT 1 AS exists_flag FROM admin WHERE mgv = ? LIMIT 1`,
      [candidate],
    );

    if (!rows.length) {
      return candidate;
    }
  }

  return `ADMIN-${Date.now()}`;
};

const connection = await pool.getConnection();

try {
  await connection.beginTransaction();

  const [rows] = await connection.execute(
    `SELECT n.id_nd, n.vaitro, a.id_ad
     FROM nguoidung n
     LEFT JOIN admin a ON a.id_nd = n.id_nd
     WHERE n.tendangnhap = ? OR n.email = ?
     LIMIT 1`,
    [adminAccount.tendangnhap, adminAccount.email],
  );

  const existing = rows[0];

  if (existing) {
    if (!existing.id_ad && existing.vaitro === "ad") {
      const adminCode = await resolveAdminCode(connection);

      await connection.execute(
        `INSERT INTO admin (id_nd, mgv, hoc_vi, hoc_ham)
         VALUES (?, ?, ?, ?)`,
        [existing.id_nd, adminCode, adminAccount.hoc_vi, adminAccount.hoc_ham],
      );

      console.log(`Inserted missing admin profile for account ${existing.id_nd} with code ${adminCode}`);
    } else {
      console.log(`Admin account already exists: ${existing.id_nd}`);
    }
  } else {
    const hashedPassword = await bcrypt.hash(adminAccount.password, 10);
    const adminCode = await resolveAdminCode(connection);

    const [userResult] = await connection.execute(
      `INSERT INTO nguoidung (hoten, tendangnhap, email, matkhau, vaitro, ngaysinh, gioitinh, trangthai)
       VALUES (?, ?, ?, ?, 'ad', ?, ?, 1)`,
      [
        adminAccount.hoten,
        adminAccount.tendangnhap,
        adminAccount.email,
        hashedPassword,
        adminAccount.ngaysinh,
        adminAccount.gioitinh,
      ],
    );

    await connection.execute(
      `INSERT INTO admin (id_nd, mgv, hoc_vi, hoc_ham)
       VALUES (?, ?, ?, ?)`,
      [userResult.insertId, adminCode, adminAccount.hoc_vi, adminAccount.hoc_ham],
    );

    console.log(`Created initial admin account: ${userResult.insertId} with code ${adminCode}`);
  }

  await connection.commit();
} catch (error) {
  await connection.rollback();
  console.error(error);
  process.exitCode = 1;
} finally {
  connection.release();
  await pool.end();
}