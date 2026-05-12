const formatAnswer = (field, value) => {
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

export default function ReviewField({ field, value, onChange }) {
  const isPass = value?.is_pass;
  const reason = value?.lydo || "";
  const answer = formatAnswer(field, field.answer);

  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-base font-semibold text-slate-800">{field.label}</p>
          <p className="mt-1 text-xs text-slate-500">{field.field_key || field.key}</p>
        </div>

        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-600">
          {String(field.type || "text")}
        </span>
      </div>

      <div className="mt-3 rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-700">
        {answer}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onChange(field.field_key || field.key, { is_pass: true, lydo: "" })}
          className={`inline-flex items-center rounded-xl border px-3 py-2 text-sm font-semibold transition ${
            isPass === true
              ? "border-emerald-600 bg-emerald-600 text-white"
              : "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
          }`}
        >
          ✔ Pass
        </button>

        <button
          type="button"
          onClick={() => onChange(field.field_key || field.key, { is_pass: false, lydo: reason })}
          className={`inline-flex items-center rounded-xl border px-3 py-2 text-sm font-semibold transition ${
            isPass === false
              ? "border-rose-600 bg-rose-600 text-white"
              : "border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100"
          }`}
        >
          ✖ Fail
        </button>
      </div>

      {isPass === false ? (
        <div className="mt-4">
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500" htmlFor={`reason-${field.field_key || field.key}`}>
            Lý do
          </label>
          <textarea
            id={`reason-${field.field_key || field.key}`}
            rows={3}
            value={reason}
            onChange={(event) => onChange(field.field_key || field.key, { is_pass: false, lydo: event.target.value })}
            className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-teal-500"
            placeholder="Nhập lý do để sinh viên chỉnh sửa"
          />
        </div>
      ) : null}
    </article>
  );
}