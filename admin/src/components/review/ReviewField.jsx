import { memo, useState } from "react";

const isFileAnswerObject = (value) => {
  return Boolean(value && typeof value === "object" && (value.fileUrl || value.file_url || value.fileName || value.ten_file_goc));
};

const toFileItems = (answer) => {
  if (!answer) return [];

  if (Array.isArray(answer)) {
    return answer
      .filter((item) => isFileAnswerObject(item))
      .map((item, index) => ({
        id: item.fileId || item.id || `file-${index}`,
        name: item.fileName || item.ten_file_goc || item.name || `Tep ${index + 1}`,
        url: item.fileUrl || item.file_url || "",
      }));
  }

  if (isFileAnswerObject(answer)) {
    return [
      {
        id: answer.fileId || answer.id || "file-0",
        name: answer.fileName || answer.ten_file_goc || answer.name || "Tap tin",
        url: answer.fileUrl || answer.file_url || "",
      },
    ];
  }

  return [];
};

const downloadByUrl = async (url, fileName) => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Khong the tai tep");
    }

    const blob = await response.blob();
    const objectUrl = window.URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = objectUrl;
    anchor.download = fileName || "download";
    anchor.target = "_blank";
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    window.URL.revokeObjectURL(objectUrl);
  } catch {
    window.open(url, "_blank", "noopener,noreferrer");
  }
};

const toText = (answer, fieldType) => {
  if (answer === null || answer === undefined || answer === "") {
    return "(Không có dữ liệu)";
  }

  if (Array.isArray(answer)) {
    return answer.length ? answer.join(", ") : "(Không có dữ liệu)";
  }

  if (typeof answer === "object") {
    if (fieldType === "file") {
      return answer.fileName || answer.name || "(File không hợp lệ)";
    }
    
    // Extract value from structured answers like { "value": "kha" }
    if (answer.value !== undefined) {
      return String(answer.value);
    }
    
    // For other objects, try to extract meaningful content
    if (answer.text !== undefined) {
      return String(answer.text);
    }
    if (answer.label !== undefined) {
      return String(answer.label);
    }

    return JSON.stringify(answer, null, 2);
  }

  return String(answer);
};

function ReviewField({ field, value, onChange }) {
  const isPass = Boolean(value?.is_pass);
  const reason = value?.lydo || "";
  const reviewTone = value ? (isPass ? "pass" : "fail") : "neutral";
  const [openModal, setOpenModal] = useState(false);
  const [draftIsPass, setDraftIsPass] = useState(isPass);
  const [draftReason, setDraftReason] = useState(reason);
  const viewOnly = !onChange;
  const fileItems = field.type === "file" ? toFileItems(field.answer) : [];

  const openReviewModal = () => {
    if (viewOnly) return;
    setDraftIsPass(isPass);
    setDraftReason(reason);
    setOpenModal(true);
  };

  const closeReviewModal = () => {
    setOpenModal(false);
  };

  const onConfirmReview = () => {
    const nextReason = draftIsPass ? "" : String(draftReason || "").trim();
    if (!draftIsPass && !nextReason) {
      return;
    }

    onChange(field.key, { is_pass: draftIsPass, lydo: nextReason });
    setOpenModal(false);
  };

  return (
    <>
      <article
        onClick={openReviewModal}
        className={`${viewOnly ? "cursor-default" : "cursor-pointer"} rounded-2xl border p-4 shadow-sm transition ${
          reviewTone === "pass"
            ? "border-emerald-300 bg-emerald-50/70 hover:border-emerald-400"
            : reviewTone === "fail"
              ? "border-rose-300 bg-rose-50/70 hover:border-rose-400"
              : "border-slate-200 bg-white hover:border-[#6C5CE7]"
        }`}
      >
        <div className="mb-3">
          <p
            className={`text-left text-sm font-semibold ${
              reviewTone === "pass" ? "text-emerald-800" : reviewTone === "fail" ? "text-rose-800" : "text-slate-800"
            }`}
          >
            {field.label}
          </p>
        </div>

        <div
          className={`rounded-xl border p-3 ${
            reviewTone === "pass"
              ? "border-emerald-200 bg-white"
              : reviewTone === "fail"
                ? "border-rose-200 bg-white"
                : "border-slate-200 bg-white"
          }`}
        >
          {field.type === "file" && fileItems.length > 0 ? (
            <div className="space-y-2">
              {fileItems.map((fileItem) => (
                <div key={fileItem.id} className="rounded-lg border border-slate-200 p-2">
                  <p
                    className={`text-sm font-medium ${
                      reviewTone === "pass" ? "text-emerald-900" : reviewTone === "fail" ? "text-rose-900" : "text-slate-700"
                    }`}
                  >
                    {fileItem.name}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        if (fileItem.url) {
                          window.open(fileItem.url, "_blank", "noopener,noreferrer");
                        }
                      }}
                      disabled={!fileItem.url}
                      className="rounded-md border border-slate-200 px-2 py-1 text-xs font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Xem truoc
                    </button>
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        if (fileItem.url) {
                          downloadByUrl(fileItem.url, fileItem.name);
                        }
                      }}
                      disabled={!fileItem.url}
                      className="rounded-md border border-slate-200 px-2 py-1 text-xs font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Tai ve
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : typeof field.answer === "object" && field.answer !== null && field.type !== "file" && !field.answer.value && !field.answer.text && !field.answer.label ? (
            <pre
              className={`overflow-auto whitespace-pre-wrap wrap-break-word text-xs ${
                reviewTone === "pass" ? "text-emerald-900" : reviewTone === "fail" ? "text-rose-900" : "text-slate-700"
              }`}
            >
              {toText(field.answer, field.type)}
            </pre>
          ) : (
            <p
              className={`whitespace-pre-wrap wrap-break-word text-sm ${
                reviewTone === "pass" ? "text-emerald-900" : reviewTone === "fail" ? "text-rose-900" : "text-slate-700"
              }`}
            >
              {toText(field.answer, field.type)}
            </p>
          )}
        </div>
      </article>

      {openModal ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/45 p-4">
          <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-5 shadow-xl">
            <h3 className="text-lg font-bold text-slate-800">Đánh giá câu hỏi</h3>
            <p className="mt-2 text-sm font-semibold text-slate-700">{field.label}</p>

            <div className="mt-4 flex items-center gap-2">
              <button
                type="button"
                className={`inline-flex items-center rounded-xl border px-3 py-2 text-sm font-medium transition ${
                  draftIsPass
                    ? "border-[#6C5CE7] bg-[#6C5CE7] text-white"
                    : "border-slate-200 bg-white text-slate-700 hover:border-[#6C5CE7]"
                }`}
                onClick={() => setDraftIsPass(true)}
              >
                Đạt
              </button>

              <button
                type="button"
                className={`inline-flex items-center rounded-xl border px-3 py-2 text-sm font-medium transition ${
                  !draftIsPass
                    ? "border-rose-500 bg-rose-500 text-white"
                    : "border-slate-200 bg-white text-slate-700 hover:border-rose-500"
                }`}
                onClick={() => setDraftIsPass(false)}
              >
                Không đạt
              </button>
            </div>

            {!draftIsPass ? (
              <div className="mt-4">
                <label htmlFor={`reason-${field.key}`} className="mb-1 block text-xs font-medium text-slate-600">
                  Lý do không đạt
                </label>
                <textarea
                  id={`reason-${field.key}`}
                  rows={3}
                  value={draftReason}
                  onChange={(event) => setDraftReason(event.target.value)}
                  placeholder="Nhập lý do để sinh viên chỉnh sửa"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-[#6C5CE7]"
                />
              </div>
            ) : null}

            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={closeReviewModal}
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700"
              >
                Đóng popup
              </button>
              <button
                type="button"
                onClick={onConfirmReview}
                disabled={!draftIsPass && !String(draftReason || "").trim()}
                className="rounded-xl bg-[#6C5CE7] px-3 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                Đồng ý
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

export default memo(ReviewField);
