import apiClient, { unwrapResponse } from "./apiClient";

const SCHOLARSHIP_STATUS = {
  ACTIVE: "active",
  EXPIRING: "expiring",
  EXPIRED: "expired",
};

const normalizeDateValue = (value) => {
  if (!value) {
    return "";
  }

  if (typeof value === "string") {
    return value.length >= 10 ? value.slice(0, 10) : value;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toISOString().slice(0, 10);
};

const mapDeadlineMeta = (deadline) => {
  if (!deadline) {
    return {
      code: "unknown",
      label: "Không rõ hạn",
      tone: "gray",
      remainingDays: null,
    };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const deadlineDate = new Date(deadline);
  if (Number.isNaN(deadlineDate.getTime())) {
    return {
      code: "unknown",
      label: "Không rõ hạn",
      tone: "gray",
      remainingDays: null,
    };
  }

  deadlineDate.setHours(0, 0, 0, 0);
  const remainingDays = Math.round((deadlineDate.getTime() - today.getTime()) / (24 * 60 * 60 * 1000));

  if (remainingDays < 0) {
    return {
      code: SCHOLARSHIP_STATUS.EXPIRED,
      label: "Hết hạn",
      tone: "gray",
      remainingDays,
    };
  }

  if (remainingDays <= 7) {
    return {
      code: SCHOLARSHIP_STATUS.EXPIRING,
      label: "Sắp hết hạn",
      tone: "orange",
      remainingDays,
    };
  }

  return {
    code: SCHOLARSHIP_STATUS.ACTIVE,
    label: "Còn hạn",
    tone: "green",
    remainingDays,
  };
};

const normalizeScholarship = (scholarship) => {
  const deadlineMeta = mapDeadlineMeta(scholarship?.han || scholarship?.deadline);
  const statusValue = String(scholarship?.trangthai || scholarship?.status || "dang_mo");

  return {
    id: scholarship?.id_hb ?? scholarship?.id ?? scholarship?.idHb,
    name: scholarship?.tenhb ?? scholarship?.name ?? "",
    description: scholarship?.mota ?? scholarship?.description ?? "",
    value: Number(scholarship?.giatri ?? scholarship?.value ?? 0),
    deadline: normalizeDateValue(scholarship?.han ?? scholarship?.deadline ?? ""),
    quantity: Number(scholarship?.soluong ?? scholarship?.quantity ?? 0),
    targetGroup: scholarship?.doituong ?? scholarship?.targetGroup ?? "",
    dbStatus: statusValue,
    status:
      deadlineMeta.code === "active" && statusValue === "dang_mo"
        ? SCHOLARSHIP_STATUS.ACTIVE
        : deadlineMeta.code,
    statusText:
      deadlineMeta.code === SCHOLARSHIP_STATUS.ACTIVE
        ? "Active"
        : deadlineMeta.code === SCHOLARSHIP_STATUS.EXPIRING
          ? "Expiring"
          : deadlineMeta.code === SCHOLARSHIP_STATUS.EXPIRED
            ? "Expired"
            : deadlineMeta.label,
    deadlineStatus: deadlineMeta.code,
    deadlineLabel: deadlineMeta.label,
    deadlineTone: deadlineMeta.tone,
    remainingDays: deadlineMeta.remainingDays,
    createdAt: scholarship?.ngaytao || scholarship?.createdAt || "",
  };
};

const normalizeFile = (file) => ({
  id: file?.id_hb_files ?? file?.id ?? file?.id_file,
  scholarshipId: file?.id_hb ?? file?.scholarshipId,
  fileName: file?.ten_file_goc ?? file?.file_name ?? file?.fileName ?? "",
  fileUrl: file?.file_url ?? file?.url ?? "",
  extension: file?.loai_file ?? file?.extension ?? "",
  size: Number(file?.kich_thuoc ?? file?.size ?? 0),
  createdAt: file?.ngaytao ?? file?.createdAt ?? "",
});

const normalizeFormField = (field, index) => ({
  id: field?.id || field?.field_key || `field-${index + 1}`,
  field_key: String(field?.field_key || field?.key || `field_${index + 1}`),
  label: String(field?.label || field?.title || `Câu hỏi ${index + 1}`),
  type: String(field?.type || "text").toLowerCase(),
  required: Boolean(field?.required),
  options: Array.isArray(field?.options) ? field.options : [],
  rows: Array.isArray(field?.rows) ? field.rows : [],
  columns: Array.isArray(field?.columns) ? field.columns : [],
  fileTypes: Array.isArray(field?.fileTypes) ? field.fileTypes : [],
  scaleMin: field?.scaleMin ?? field?.min ?? 1,
  scaleMax: field?.scaleMax ?? field?.max ?? 5,
  review: field?.review || null,
});

const normalizeFormConfig = (rawForm) => {
  if (!rawForm) {
    return { title: "", description: "", fields: [] };
  }

  if (Array.isArray(rawForm)) {
    return {
      title: "",
      description: "",
      fields: rawForm.map((field, index) => normalizeFormField(field, index)),
    };
  }

  return {
    title: String(rawForm.title || rawForm.form_title || "").trim(),
    description: String(rawForm.description || rawForm.form_description || "").trim(),
    fields: Array.isArray(rawForm.fields) ? rawForm.fields.map((field, index) => normalizeFormField(field, index)) : [],
  };
};

const toFormPayload = (form) => {
  const normalized = normalizeFormConfig(form);

  return {
    title: normalized.title,
    description: normalized.description,
    fields: normalized.fields.map((field) => ({
      id: field.id,
      field_key: field.field_key,
      label: field.label,
      type: field.type,
      required: Boolean(field.required),
      options: Array.isArray(field.options) ? field.options : [],
      rows: Array.isArray(field.rows) ? field.rows : [],
      columns: Array.isArray(field.columns) ? field.columns : [],
      fileTypes: Array.isArray(field.fileTypes) ? field.fileTypes : [],
      scaleMin: Number(field.scaleMin ?? 1),
      scaleMax: Number(field.scaleMax ?? 5),
    })),
  };
};

export const fetchScholarshipsForView = async () => {
  const response = await apiClient.get("/scholarships");
  const scholarships = unwrapResponse(response) || [];
  return Array.isArray(scholarships) ? scholarships.map(normalizeScholarship) : [];
};

export const createScholarshipForView = async (payload) => {
  const response = await apiClient.post("/scholarships", payload);
  const created = unwrapResponse(response);
  return normalizeScholarship(created);
};

export const updateScholarshipForView = async (id, payload) => {
  await apiClient.put(`/scholarships/${id}`, payload);
  return fetchScholarshipsForView();
};

export const deleteScholarshipForView = async (id) => {
  await apiClient.delete(`/scholarships/${id}`);
  return fetchScholarshipsForView();
};

export const findScholarshipByIdForView = async (id) => {
  const response = await apiClient.get(`/scholarships/${id}`);
  const scholarship = unwrapResponse(response);
  return scholarship ? normalizeScholarship(scholarship) : null;
};

export const fetchFilesByScholarshipForView = async (scholarshipId) => {
  const response = await apiClient.get(`/scholarships/${scholarshipId}/files`);
  const files = unwrapResponse(response) || [];
  return Array.isArray(files) ? files.map(normalizeFile) : [];
};

export const uploadFileForScholarship = async (scholarshipId, fileLikeList) => {
  const formData = new FormData();
  formData.append("id_hb", String(scholarshipId));
  const files = Array.isArray(fileLikeList) ? fileLikeList : [fileLikeList];

  files.filter(Boolean).forEach((fileLike) => {
    formData.append("files", fileLike);
  });

  await apiClient.post("/files/upload", formData);

  return fetchFilesByScholarshipForView(scholarshipId);
};

export const deleteFileForScholarship = async (scholarshipId, fileId) => {
  await apiClient.delete(`/files/${fileId}`, {
    data: {
      id_hb: scholarshipId,
    },
  });

  return fetchFilesByScholarshipForView(scholarshipId);
};

const parseFileNameFromDisposition = (contentDisposition) => {
  if (!contentDisposition) {
    return "";
  }

  const utf8Match = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8Match?.[1]) {
    try {
      return decodeURIComponent(utf8Match[1]);
    } catch {
      return utf8Match[1];
    }
  }

  const asciiMatch = contentDisposition.match(/filename=\"?([^\";]+)\"?/i);
  return asciiMatch?.[1] || "";
};

export const downloadFileForScholarship = async (scholarshipId, file) => {
  const response = await apiClient.get(`/files/${file.id}/download`, {
    params: {
      id_hb: scholarshipId,
    },
    responseType: "blob",
  });

  const blob = new Blob([response.data], {
    type: response.headers?.["content-type"] || file?.mimeType || "application/octet-stream",
  });

  const downloadUrl = window.URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = downloadUrl;
  anchor.download = parseFileNameFromDisposition(response.headers?.["content-disposition"]) || file.fileName || "download";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.URL.revokeObjectURL(downloadUrl);
};

export const fetchFormConfigForView = async (scholarshipId) => {
  const response = await apiClient.get(`/form/${scholarshipId}`);
  return normalizeFormConfig(unwrapResponse(response));
};

export const saveFormConfigForView = async (scholarshipId, form) => {
  const payload = toFormPayload(form);
  await apiClient.post(`/form/${scholarshipId}`, payload);
  return fetchFormConfigForView(scholarshipId);
};

export { normalizeFormConfig };