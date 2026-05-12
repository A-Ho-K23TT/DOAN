import { ApiError } from "../utils/apiError.js";
import axios from "axios";
import fs from "fs";
import FormData from "form-data";
import {
  createApplication,
  createSubmission,
  findApplicationByScholarshipAndStudent,
  listMyApplications,
  markOldSubmissionsAsNotLatest,
  resetApplicationForResubmit,
  getReviewDetails,
  getLatestSubmission,
} from "../models/application.model.js";

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

  return {
    fileToken,
    fileUrl: fileInfoResp?.data?.original_file_url || fileInfoResp?.data?.cdn_url || `https://ucarecdn.com/${fileToken}/`,
  };
};

const cleanupTempFile = (file) => {
  if (!file?.path) return;

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

const parseSubmissionData = (dataJson) => {
  if (!dataJson) return {};
  if (typeof dataJson === "string") {
    try {
      return JSON.parse(dataJson);
    } catch {
      return {};
    }
  }

  return dataJson;
};

const replaceFileAnswersWithUploadcareRefs = async (dataJson, files = []) => {
  const submissionData = parseSubmissionData(dataJson);

  if (!Array.isArray(files) || files.length === 0) {
    return submissionData;
  }

  try {
    // Group files by questionId
    const filesByQuestion = {};
    for (const file of files) {
      const fieldName = String(file.fieldname || "");
      const questionId = fieldName.startsWith("file_") ? fieldName.slice(5) : fieldName;

      if (!questionId) continue;

      if (!filesByQuestion[questionId]) {
        filesByQuestion[questionId] = [];
      }
      filesByQuestion[questionId].push(file);
    }

    // Process each question's files
    for (const [questionId, questionFiles] of Object.entries(filesByQuestion)) {
      const previousValue = submissionData[questionId];
      const isMultipleFiles = Array.isArray(previousValue);

      if (isMultipleFiles) {
        // Multiple files: create array of file objects
        const fileObjectsArray = [];
        for (const file of questionFiles) {
          const uploaded = await uploadLocalFileToUploadcare(file);
          fileObjectsArray.push({
            fileName: normalizeFileName(file.originalname),
            fileId: uploaded.fileToken,
            fileUrl: uploaded.fileUrl,
            fileType: file.mimetype,
            size: file.size,
          });
        }
        submissionData[questionId] = fileObjectsArray;
      } else {
        // Single file: keep original structure (backward compatibility)
        // In case of multiple files uploaded to a single-file field, keep only the last one
        const lastFile = questionFiles[questionFiles.length - 1];
        const uploaded = await uploadLocalFileToUploadcare(lastFile);
        submissionData[questionId] = {
          ...(previousValue && typeof previousValue === "object" ? previousValue : {}),
          fileName: normalizeFileName(lastFile.originalname),
          fileId: uploaded.fileToken,
          fileUrl: uploaded.fileUrl,
          fileType: lastFile.mimetype,
          size: lastFile.size,
        };
      }
    }

    return submissionData;
  } finally {
    files.forEach(cleanupTempFile);
  }
};

export const submitApplicationService = async ({ id_hb, id_sv, data_json, files = [] }) => {
  if (!id_hb || !id_sv || !data_json) {
    throw new ApiError(400, "Thiếu dữ liệu nộp hồ sơ");
  }

  const submissionData = await replaceFileAnswersWithUploadcareRefs(data_json, files);

  const existing = await findApplicationByScholarshipAndStudent(id_hb, id_sv);

  let application;

  if (!existing) {
    application = await createApplication({ id_hb, id_sv, trangthai: "pending" });
  } else if (existing.trangthai === "need_edit") {
    application = await resetApplicationForResubmit(existing.id_hosodk);
  } else if (existing.trangthai === "pending") {
    throw new ApiError(409, "Hồ sơ đang chờ duyệt, không thể nộp lại");
  } else {
    throw new ApiError(409, "Hồ sơ đã tồn tại và không thể nộp lại");
  }

  await markOldSubmissionsAsNotLatest(application.id_hosodk);
  const submission = await createSubmission({ id_hosodk: application.id_hosodk, data_json: submissionData, is_latest: true, trangthai: 1 });

  return {
    id_hosodk: application.id_hosodk,
    id_hb: application.id_hb,
    id_sv: application.id_sv,
    ngaynop: application.ngaynop,
    trangthai: application.trangthai,
    submission,
  };
};

export const getMyApplicationsService = async ({ id_sv }) => {
  const rows = await listMyApplications(id_sv);

  return Promise.all(
    rows.map(async (row) => {
      const reviewDetails = await getReviewDetails(row.id_hosodk);
      const latestSubmission = await getLatestSubmission(row.id_hosodk);
      
      return {
        ...row,
        statusLabel:
          row.trangthai === "pending"
            ? "Chờ duyệt"
            : row.trangthai === "need_edit"
              ? "Cần chỉnh sửa"
              : row.trangthai === "qualified"
                ? "Qua vòng hồ sơ"
                : row.trangthai === "awarded"
                  ? "Được trao học bổng"
                  : row.trangthai === "failed"
                    ? "Trượt xét chọn"
                    : row.trangthai,
        statusCode: row.trangthai,
        scholarship: {
          id_hb: row.id_hb,
          tenhb: row.tenhb,
          han: row.han,
          giatri: row.giatri,
        },
        reviewDetails: reviewDetails || [],
        latestSubmission: latestSubmission || null,
      };
    })
  );
};