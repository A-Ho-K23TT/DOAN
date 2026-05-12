import { ApiError } from "../utils/apiError.js";
import { getScholarshipDeadlineStatus } from "../utils/date.js";
import { normalizeFormConfig, serializeFormConfig } from "../utils/normalizeFormConfig.js";
import path from "path";
import fs from "fs";
import axios from "axios";
import FormData from "form-data";
import {
  addScholarshipFile,
  createScholarship,
  deleteScholarshipFileById,
  deleteScholarship,
  getScholarshipFileById,
  getFormConfigRow,
  getScholarshipById,
  listScholarshipFiles,
  listScholarships,
  saveFormConfigRow,
  updateScholarship,
} from "../models/scholarship.model.js";

const enrichScholarship = (row) => {
  if (!row) {
    return null;
  }

  const deadlineInfo = getScholarshipDeadlineStatus(row.han);

  return {
    ...row,
    ...deadlineInfo,
  };
};

export const getAllScholarships = async () => {
  const rows = await listScholarships();

  return rows
    .map(enrichScholarship)
    .sort((a, b) => {
      if (a.sortPriority !== b.sortPriority) {
        return a.sortPriority - b.sortPriority;
      }

      return Number(b.id_hb) - Number(a.id_hb);
    });
};

export const getScholarshipDetail = async (idHb) => {
  const scholarship = enrichScholarship(await getScholarshipById(idHb));

  if (!scholarship) {
    throw new ApiError(404, "Không tìm thấy học bổng");
  }

  return scholarship;
};

export const createScholarshipService = async (payload) => {
  if (!payload.tenhb) {
    throw new ApiError(400, "Thiếu tên học bổng");
  }

  return enrichScholarship(await createScholarship(payload));
};

export const updateScholarshipService = async (idHb, payload) => {
  const scholarship = await updateScholarship(idHb, payload);

  if (!scholarship) {
    throw new ApiError(404, "Không tìm thấy học bổng");
  }

  return enrichScholarship(scholarship);
};

export const deleteScholarshipService = async (idHb) => {
  await deleteScholarship(idHb);
  return true;
};

export const getScholarshipFilesService = async (idHb) => {
  return listScholarshipFiles(idHb);
};

const uploadLocalFileToUploadcare = async (file) => {
  const pubKey = process.env.UPLOADCARE_PUBLIC_KEY;
  const secretKey = process.env.UPLOADCARE_SECRET_KEY;

  if (!pubKey || !secretKey) {
    throw new ApiError(500, "Uploadcare credentials are not configured on server");
  }

  const form = new FormData();
  form.append("UPLOADCARE_PUB_KEY", pubKey);
  form.append("UPLOADCARE_STORE", "1");
  form.append("file", fs.createReadStream(file.path));

  const uploadResp = await axios.post("https://upload.uploadcare.com/base/", form, {
    headers: form.getHeaders(),
    maxBodyLength: Infinity,
    maxContentLength: Infinity,
  });

  const fileToken = uploadResp?.data?.file || uploadResp?.data?.file_id || uploadResp?.data?.uuid || null;

  if (!fileToken) {
    throw new ApiError(502, "Uploadcare trả về token file không hợp lệ");
  }

  const fileInfoResp = await axios.get(`https://api.uploadcare.com/files/${fileToken}/`, {
    headers: {
      Accept: "application/vnd.uploadcare-v0.7+json",
      Authorization: `Uploadcare.Simple ${pubKey}:${secretKey}`,
    },
  });

  const cdnUrl =
    fileInfoResp?.data?.original_file_url ||
    fileInfoResp?.data?.cdn_url ||
    `https://ucarecdn.com/${fileToken}/`;

  return {
    fileToken,
    fileUrl: cdnUrl,
  };
};

const cleanupTempFile = (file) => {
  if (!file?.path) {
    return;
  }

  try {
    fs.unlinkSync(file.path);
  } catch {
    // Ignore cleanup errors for temp files.
  }
};

const normalizeFileName = (fileName) => {
  if (!fileName) return "file";

  try {
    const isUTF8Corrupted = /[\xC0-\xFF]/.test(fileName);
    if (isUTF8Corrupted) {
      return Buffer.from(fileName, "latin1").toString("utf8");
    }
    return fileName;
  } catch {
    return fileName;
  }
};

export const uploadScholarshipFilesService = async ({ id_hb, files = [] }) => {
  if (!id_hb) {
    throw new ApiError(400, "Thiếu id_hb");
  }

  if (!Array.isArray(files) || files.length === 0) {
    throw new ApiError(400, "Thiếu file upload");
  }

  const savedFiles = [];

  try {
    for (const file of files) {
      const uploaded = await uploadLocalFileToUploadcare(file);
      const saved = await addScholarshipFile({
        id_hb,
        ten_file_goc: normalizeFileName(file.originalname),
        file_url: uploaded.fileUrl,
        loai_file: path.extname(file.originalname) || file.mimetype,
        kich_thuoc: file.size,
      });

      savedFiles.push(saved);
    }

    return savedFiles.filter(Boolean);
  } finally {
    files.forEach(cleanupTempFile);
  }
};

export const uploadScholarshipFileService = async ({ id_hb, file }) => {
  const uploadedFiles = await uploadScholarshipFilesService({ id_hb, files: file ? [file] : [] });
  return uploadedFiles[0] || null;
};

export const deleteScholarshipFileService = async ({ id_hb, id_hb_files }) => {
  if (!id_hb_files) {
    throw new ApiError(400, "Thiếu id_hb_files");
  }

  await deleteScholarshipFileById(id_hb_files, id_hb || null);
  return true;
};

export const getScholarshipFileDownloadService = async ({ id_hb_files, id_hb = null }) => {
  if (!id_hb_files) {
    throw new ApiError(400, "Thiếu id_hb_files");
  }

  const fileRow = await getScholarshipFileById(id_hb_files, id_hb || null);

  if (!fileRow) {
    throw new ApiError(404, "Không tìm thấy file");
  }

  if (!fileRow.file_url) {
    throw new ApiError(404, "File chưa có đường dẫn tải xuống");
  }

  const fileResponse = await axios.get(fileRow.file_url, {
    responseType: "stream",
    maxBodyLength: Infinity,
    maxContentLength: Infinity,
  });

  return {
    fileRow,
    stream: fileResponse.data,
    contentType: fileResponse.headers?.["content-type"] || "application/octet-stream",
    contentLength: fileResponse.headers?.["content-length"] || null,
  };
};

export const getFormConfigService = async (idHb) => {
  const row = await getFormConfigRow(idHb);
  const config = normalizeFormConfig(row?.form_json);

  return serializeFormConfig(config);
};

export const saveFormConfigService = async (idHb, config) => {
  const normalized = serializeFormConfig(normalizeFormConfig(config));
  const row = await saveFormConfigRow(idHb, normalized);

  return {
    id_form: row.id_form,
    id_hb: row.id_hb,
    form_json: serializeFormConfig(normalizeFormConfig(row.form_json)),
  };
};