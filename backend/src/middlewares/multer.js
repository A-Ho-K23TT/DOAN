import fs from "fs";
import multer from "multer";
import path from "path";

const uploadDir = path.resolve(process.cwd(), "uploads");

fs.mkdirSync(uploadDir, { recursive: true });

const allowedMimeTypes = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => {
    callback(null, uploadDir);
  },
  filename: (_req, file, callback) => {
    const ext = path.extname(file.originalname);
    const safeName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    callback(null, safeName);
  },
});

const fileFilter = (_req, file, callback) => {
  if (allowedMimeTypes.has(file.mimetype)) {
    callback(null, true);
    return;
  }

  callback(new Error("Chỉ hỗ trợ file PDF, ảnh và Word"), false);
};

const upload = multer({ storage, fileFilter });

export default upload;
