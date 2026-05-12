import asyncHandler from "../utils/asyncHandler.js";
import {
  deleteScholarshipFileService,
  getScholarshipFileDownloadService,
  getScholarshipFilesService,
  uploadScholarshipFilesService,
} from "../services/scholarship.service.js";
import { sendSuccess } from "../utils/response.js";

export const getScholarshipFilesHandler = asyncHandler(async (req, res) => {
  const files = await getScholarshipFilesService(req.params.id);
  return sendSuccess(res, "Lấy danh sách file thành công", files);
});

export const uploadScholarshipFileHandler = asyncHandler(async (req, res) => {
  const files = await uploadScholarshipFilesService({ id_hb: req.body.id_hb, files: req.files || [] });

  return sendSuccess(res, "Upload file thành công", files, 201);
});

export const deleteScholarshipFileHandler = asyncHandler(async (req, res) => {
  await deleteScholarshipFileService({
    id_hb_files: req.params.id,
    id_hb: req.body?.id_hb,
  });

  return sendSuccess(res, "Xóa file thành công", true);
});

export const downloadScholarshipFileHandler = asyncHandler(async (req, res) => {
  const { fileRow, stream, contentType, contentLength } = await getScholarshipFileDownloadService({
    id_hb_files: req.params.id,
    id_hb: req.query?.id_hb,
  });

  const fileName = fileRow.ten_file_goc || `file-${fileRow.id_hb_files}`;
  const encodedFileName = encodeURIComponent(fileName).replace(/%20/g, " ");

  res.setHeader("Content-Type", contentType);
  res.setHeader("Content-Disposition", `attachment; filename*=UTF-8''${encodedFileName}`);

  if (contentLength) {
    res.setHeader("Content-Length", contentLength);
  }

  stream.on("error", () => {
    if (!res.headersSent) {
      res.status(502).json({ success: false, message: "Không thể tải file từ nguồn lưu trữ" });
      return;
    }

    res.destroy();
  });

  stream.pipe(res);
});