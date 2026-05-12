const normalizeAnswer = (field, value) => {
  if (value === undefined || value === null || value === "") {
    return "(Không có dữ liệu)";
  }

  if (Array.isArray(value)) {
    return value.length ? value.join(", ") : "(Không có dữ liệu)";
  }

  if (typeof value === "object") {
    if (field.type === "file") {
      return value.fileName || value.ten_file_goc || value.name || "(File không hợp lệ)";
    }

    return JSON.stringify(value, null, 2);
  }

  return String(value);
};

const isFileAnswerObject = (value) => {
  return Boolean(value && typeof value === "object" && (value.fileUrl || value.file_url || value.fileName || value.ten_file_goc));
};

const toFileItems = (value) => {
  if (!value) return [];

  if (Array.isArray(value)) {
    return value
      .filter((item) => isFileAnswerObject(item))
      .map((item, index) => ({
        id: item.fileId || item.id || `preview-file-${index}`,
        name: item.fileName || item.ten_file_goc || item.name || `Tep ${index + 1}`,
        url: item.fileUrl || item.file_url || "",
      }));
  }

  if (isFileAnswerObject(value)) {
    return [
      {
        id: value.fileId || value.id || "preview-file-0",
        name: value.fileName || value.ten_file_goc || value.name || "Tap tin",
        url: value.fileUrl || value.file_url || "",
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

export default function DynamicFormPreview({ form, submission }) {
  const fields = Array.isArray(form?.fields) ? form.fields : [];
  const values = submission?.data_json && typeof submission.data_json === "object" ? submission.data_json : {};

  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="bg-linear-to-r from-teal-700 via-emerald-700 to-cyan-700 px-5 py-5 text-white">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/75">Google Form preview</p>
        <h3 className="mt-2 text-2xl font-bold">{form?.title || "Biểu mẫu đăng ký"}</h3>
        {form?.description ? <p className="mt-2 max-w-3xl text-sm leading-6 text-white/85">{form.description}</p> : null}
      </div>

      <div className="space-y-3 bg-slate-50 p-4 sm:p-5">
        {fields.length ? (
          fields.map((field) => (
            <article key={field.field_key || field.key} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-base font-semibold text-slate-800">{field.label}</p>
                  <p className="mt-1 text-xs text-slate-500">{field.field_key || field.key}</p>
                </div>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-600">
                  {String(field.type || "text")}
                </span>
              </div>

              {field.type === "file" && toFileItems(values[field.field_key || field.key]).length > 0 ? (
                <div className="mt-3 space-y-2 rounded-2xl bg-slate-50 p-4">
                  {toFileItems(values[field.field_key || field.key]).map((fileItem) => (
                    <div key={fileItem.id} className="rounded-lg border border-slate-200 bg-white p-3">
                      <p className="text-sm font-medium text-slate-700">{fileItem.name}</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => {
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
                          onClick={() => {
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
              ) : (
                <div className="mt-3 rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-700">
                  {normalizeAnswer(field, values[field.field_key || field.key])}
                </div>
              )}
            </article>
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
            Không có trường dữ liệu để hiển thị.
          </div>
        )}
      </div>
    </section>
  );
}