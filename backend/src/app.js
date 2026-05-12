import cors from "cors";
import express from "express";
import fs from "fs";
import path from "path";
import adminRoutes from "./routes/admin.routes.js";
import applicationRoutes from "./routes/application.routes.js";
import authRoutes from "./routes/auth.routes.js";
import fileRoutes from "./routes/file.routes.js";
import formRoutes from "./routes/form.routes.js";
import scholarshipRoutes from "./routes/scholarship.routes.js";
import userRoutes from "./routes/user.routes.js";

const app = express();
const uploadDir = path.resolve(process.cwd(), "uploads");

fs.mkdirSync(uploadDir, { recursive: true });

// app.use(
//   cors({
//     origin: true,
//     credentials: true,
//   })
// );

const allowedOrigins = [
  'https://admin-zbg7.onrender.com', // Thay bằng link thật của bạn trên Render
  'https://da-pm.onrender.com',    // Thay bằng link thật của bạn trên Render
  'http://localhost:5173',             // Mặc định của Vite local
  'http://localhost:3000'
];

app.use(cors({
  origin: function (origin, callback) {
    // Cho phép các request không có origin (như Postman) hoặc có trong whitelist
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Chặn bởi CORS: Origin không hợp lệ!'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(uploadDir));

app.get("/", (_req, res) => {
  res.json({ success: true, message: "API Working" });
});

app.get("/health", (_req, res) => {
  res.json({ success: true, message: "OK" });
});

app.use("/auth", authRoutes);
app.use("/scholarships", scholarshipRoutes);
app.use("/files", fileRoutes);
app.use("/form", formRoutes);
app.use("/applications", applicationRoutes);
app.use("/admin", adminRoutes);
app.use("/admin/users", userRoutes);

app.use((_req, res) => {
  res.status(404).json({ success: false, message: "Endpoint không tồn tại" });
});

app.use((error, _req, res, _next) => {
  const statusCode = error.statusCode || 500;
  const message = error.message || "Đã xảy ra lỗi máy chủ";

  return res.status(statusCode).json({
    success: false,
    message,
    details: process.env.NODE_ENV === "production" ? undefined : error.details || error.stack,
  });
});

export default app;