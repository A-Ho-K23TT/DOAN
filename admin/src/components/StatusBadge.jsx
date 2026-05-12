const STATUS_META = {
  pending: { label: "Chờ duyệt", className: "border-amber-200 bg-amber-100 text-amber-700" },
  need_edit: { label: "Cần sửa", className: "border-rose-200 bg-rose-100 text-rose-700" },
  qualified: { label: "Qua vòng hồ sơ", className: "border-blue-200 bg-blue-100 text-blue-700" },
  awarded: { label: "Đạt học bổng", className: "border-emerald-200 bg-emerald-100 text-emerald-700" },
  failed: { label: "Trượt xét chọn", className: "border-slate-200 bg-slate-100 text-slate-700" },
  rejected: { label: "Từ chối", className: "border-rose-200 bg-rose-100 text-rose-700" },
  revised: { label: "Đã sửa - Chờ duyệt", className: "border-amber-200 bg-amber-100 text-amber-700" },
  expiring: { label: "Sắp hết hạn", className: "border-amber-200 bg-amber-100 text-amber-700" },
  active: { label: "Còn hạn", className: "border-emerald-200 bg-emerald-100 text-emerald-700" },
  expired: { label: "Hết hạn", className: "border-slate-200 bg-slate-100 text-slate-700" },
  unknown: { label: "Không rõ", className: "border-slate-200 bg-slate-100 text-slate-700" },
};

export default function StatusBadge({ status, label, className = "" }) {
  const meta = STATUS_META[String(status || "").trim()] || STATUS_META.unknown;

  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${meta.className} ${className}`.trim()}>
      {label || meta.label}
    </span>
  );
}