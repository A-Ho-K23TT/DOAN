import mysql from "mysql2/promise";
import "dotenv/config";

// 1. Cấu hình linh hoạt: Ưu tiên DATABASE_URL (Aiven), nếu không có mới dùng biến lẻ (Local)
const connectionConfig = process.env.DATABASE_URL 
  ? {
      uri: process.env.DATABASE_URL, // Sử dụng chuỗi mysql://...
      ssl: {
        rejectUnauthorized: false // BẮT BUỘC để kết nối Aiven từ Render
      }
    }
  : {
      host: process.env.MYSQL_HOST || "localhost",
      user: process.env.MYSQL_USER || "root",
      password: process.env.MYSQL_PASSWORD || "",
      database: process.env.MYSQL_DATABASE || "QLHB",
      port: Number(process.env.MYSQL_PORT || 3306),
    };

// 2. Tạo Pool kết nối
const pool = mysql.createPool({
  ...connectionConfig,
  waitForConnections: true,
  connectionLimit: Number(process.env.MYSQL_CONNECTION_LIMIT || 10),
  queueLimit: 0,
  dateStrings: true,
});

// 3. Log kiểm tra (Sẽ hiện trong tab Logs của Render)
console.log("🚀 Database Mode:", process.env.DATABASE_URL ? "CLOUD (Aiven)" : "LOCAL");

export const query = async (sql, params = []) => {
  try {
    const [rows] = await pool.query(sql, params);
    return rows;
  } catch (error) {
    console.error("❌ Lỗi truy vấn SQL:", error.message);
    throw error;
  }
};

export const getConnection = () => pool.getConnection();

export default pool;
