import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import { getQualifiedApplications, getSelectionResults, submitEvaluation } from "../../services/application.service";

const formatDate = (value) => {
  if (!value) return "-";

  try {
    return new Date(value).toLocaleString("vi-VN");
  } catch {
    return value;
  }
};

const getSelectionStatusDisplay = (status) => {
  const statusMap = {
    qualified: { label: "Qua vòng hồ sơ", color: "bg-slate-100 text-slate-700" },
    awarded: { label: "Nhận HB", color: "bg-emerald-100 text-emerald-700" },
    failed: { label: "Trượt xét chọn", color: "bg-rose-100 text-rose-700" },
  };

  const display = statusMap[status] || { label: status, color: "bg-slate-100 text-slate-700" };

  return (
    <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${display.color}`}>
      {display.label}
    </span>
  );
};

export default function SelectionPage() {
  const { id_hb } = useParams();

  const [detail, setDetail] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [isEvaluated, setIsEvaluated] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getQualifiedApplications(Number(id_hb));
      setDetail(data);
      setSelectedIds([]);
    } catch (err) {
      const message = err.message || "Không thể tải danh sách xét chọn.";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id_hb]);

  const rows = detail?.applications || [];

  const allSelected = useMemo(() => rows.length > 0 && selectedIds.length === rows.length, [rows, selectedIds]);

  const toggleOne = (id_hosodk) => {
    setSelectedIds((prev) =>
      prev.includes(id_hosodk) ? prev.filter((item) => item !== id_hosodk) : [...prev, id_hosodk],
    );
  };

  const toggleAll = () => {
    if (allSelected) {
      setSelectedIds([]);
      return;
    }

    setSelectedIds(rows.map((item) => item.id_hosodk));
  };

  const handleSubmit = async () => {
    if (!rows.length) {
      toast.error("Không có hồ sơ qualified để xét chọn.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const result = await submitEvaluation({
        id_hb: Number(id_hb),
        awardedIds: selectedIds,
        failedReason: "Không được chọn trong vòng xét chọn.",
      });

      toast.success("Đã lưu kết quả sinh viên nhận học bổng");
      setIsEvaluated(true);
      
      // Reload to show awarded/failed results
      const newData = await getSelectionResults(Number(id_hb));
      setDetail(newData);
      setSelectedIds([]);
    } catch (err) {
      const message = err.message || "Không thể chốt kết quả xét chọn.";
      setError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <ToastContainer position="top-right" autoClose={2200} hideProgressBar />

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-teal-700">Selection</p>
            <h2 className="mt-2 text-2xl font-bold text-slate-800">Chọn sinh viên nhận học bổng</h2>
            <p className="mt-2 text-sm text-slate-500">
              {isEvaluated
                ? "Kết quả xét chọn. Xanh = được trao học bổng, Đỏ = trượt xét chọn."
                : "Chỉ hiển thị hồ sơ đã qualified. Không chọn sẽ tự động failed."}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              to={`/admin/applications/${id_hb}`}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-teal-300 hover:text-teal-700"
            >
              Quay lại
            </Link>
            <button
              type="button"
              onClick={loadData}
              className="rounded-xl border border-teal-200 bg-teal-50 px-4 py-2 text-sm font-semibold text-teal-700 transition hover:bg-teal-100"
            >
              Tải lại
            </button>
          </div>
        </div>

        {error ? <p className="mt-4 text-sm font-medium text-rose-600">{error}</p> : null}
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
            {isEvaluated ? (
              <>
                Tổng sinh viên: <strong>{rows.length}</strong> |{" "}
                <strong className="text-emerald-600">
                  Đạt: {rows.filter((r) => r.trangthai === "awarded").length}
                </strong>{" "}
                |{" "}
                <strong className="text-rose-600">
                  Trượt: {rows.filter((r) => r.trangthai === "failed").length}
                </strong>
              </>
            ) : (
              <>
                Hồ sơ qualified: <strong>{rows.length}</strong> | Đã chọn: <strong>{selectedIds.length}</strong>
              </>
            )}
          </div>

          {!isEvaluated && (
            <button
              type="button"
              onClick={toggleAll}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-teal-300 hover:text-teal-700"
            >
              {allSelected ? "Bỏ chọn tất cả" : "Chọn tất cả"}
            </button>
          )}
        </div>

        <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200">
          <table className="min-w-full text-left">
            <thead className="bg-slate-50 text-sm text-slate-600">
              <tr>
                <th className="px-4 py-3">Chọn</th>
                <th className="px-4 py-3">Tên SV</th>
                <th className="px-4 py-3">MSSV</th>
                <th className="px-4 py-3">GPA</th>
                <th className="px-4 py-3">Điểm rèn luyện</th>
                <th className="px-4 py-3">Ngày nộp</th>
                <th className="px-4 py-3">Trạng thái xét chọn</th>
                <th className="px-4 py-3">Thao tác</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {loading ? (
                Array.from({ length: 4 }).map((_, index) => (
                  <tr key={`sel-skel-${index}`} className="border-t border-slate-100 animate-pulse">
                    <td className="px-4 py-4"><div className="h-4 w-4 rounded bg-slate-200" /></td>
                    <td className="px-4 py-4"><div className="h-4 w-36 rounded bg-slate-200" /></td>
                    <td className="px-4 py-4"><div className="h-4 w-20 rounded bg-slate-200" /></td>
                    <td className="px-4 py-4"><div className="h-4 w-16 rounded bg-slate-200" /></td>
                    <td className="px-4 py-4"><div className="h-4 w-20 rounded bg-slate-200" /></td>
                    <td className="px-4 py-4"><div className="h-4 w-28 rounded bg-slate-200" /></td>
                    <td className="px-4 py-4"><div className="h-6 w-28 rounded-full bg-slate-200" /></td>
                    <td className="px-4 py-4"><div className="h-6 w-20 rounded bg-slate-200" /></td>
                  </tr>
                ))
              ) : rows.length ? (
                rows.map((row) => (
                  <tr key={row.id_hosodk} className="border-t border-slate-100">
                    <td className="px-4 py-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(row.id_hosodk)}
                        onChange={() => toggleOne(row.id_hosodk)}
                        disabled={isEvaluated}
                        className="h-4 w-4 rounded border-slate-300 accent-teal-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                    </td>
                    <td className="px-4 py-4 font-semibold text-slate-800">{row.student.fullName}</td>
                    <td className="px-4 py-4 text-slate-600">{row.student.mssv}</td>
                    <td className="px-4 py-4 text-slate-700">{row.student.gpa}</td>
                    <td className="px-4 py-4 text-slate-700">{row.student.diem_rl}</td>
                    <td className="px-4 py-4 text-slate-600">{formatDate(row.submitted_at)}</td>
                    <td className="px-4 py-4">
                      {getSelectionStatusDisplay(row.trangthai)}
                    </td>
                    <td className="px-4 py-4">
                      <Link
                        to={`/admin/applications/${id_hb}/detail/${row.id_hosodk}?mode=view`}
                        className="text-sm font-semibold text-teal-600 transition hover:text-teal-700 hover:underline"
                      >
                        Chi tiết
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-slate-500">
                    Không có hồ sơ qualified nào để xét chọn.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex justify-end">
          {!isEvaluated && (
            <button
              type="button"
              disabled={saving || loading || !rows.length}
              onClick={handleSubmit}
              className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Chốt kết quả xét chọn
            </button>
          )}
        </div>
      </section>
    </div>
  );
}