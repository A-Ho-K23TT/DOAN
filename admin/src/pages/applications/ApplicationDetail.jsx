import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import StatusBadge from "../../components/StatusBadge";
import { getScholarshipApplications } from "../../services/application.service";

const formatDate = (value) => {
  if (!value) return "-";

  try {
    return new Date(value).toLocaleString("vi-VN");
  } catch {
    return value;
  }
};

export default function ApplicationDetail() {
  const { id_hb } = useParams();
  const navigate = useNavigate();
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadData = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getScholarshipApplications(Number(id_hb));
      setDetail(data);
    } catch (err) {
      const message = err.message || "Không thể tải danh sách hồ sơ.";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id_hb]);

  const summary = useMemo(() => {
    const rows = detail?.applications || [];
    return rows.reduce(
      (acc, item) => {
        acc.total += 1;
        acc[item.trangthai] = (acc[item.trangthai] || 0) + 1;
        return acc;
      },
      { total: 0, pending: 0, need_edit: 0, qualified: 0, awarded: 0, failed: 0 },
    );
  }, [detail]);

  const scholarship = detail?.scholarship;

  return (
    <div className="space-y-4">
      <ToastContainer position="top-right" autoClose={2200} hideProgressBar />

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-teal-700">Danh sách sinh viên</p>
            <h2 className="mt-2 text-2xl font-bold text-slate-800">{scholarship?.tenhb || "Đang tải học bổng..."}</h2>
            <p className="mt-2 text-sm text-slate-500">Chỉ duyệt hồ sơ và chuyển sang xét chọn sau khi đạt qualified.</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => navigate(`/admin/applications/${id_hb}/select`)}
              className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
            >
              Xét chọn
            </button>
            <Link
              to="/admin/applications"
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-teal-300 hover:text-teal-700"
            >
              Quay lại
            </Link>
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-5">
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">Tổng hồ sơ</p>
            <p className="mt-1 text-2xl font-bold text-slate-800">{summary.total}</p>
          </div>
          <div className="rounded-2xl bg-amber-50 p-4">
            <p className="text-xs uppercase tracking-wide text-amber-700">pending</p>
            <p className="mt-1 text-2xl font-bold text-amber-800">{summary.pending}</p>
          </div>
          <div className="rounded-2xl bg-rose-50 p-4">
            <p className="text-xs uppercase tracking-wide text-rose-700">need_edit</p>
            <p className="mt-1 text-2xl font-bold text-rose-800">{summary.need_edit}</p>
          </div>
          <div className="rounded-2xl bg-blue-50 p-4">
            <p className="text-xs uppercase tracking-wide text-blue-700">qualified</p>
            <p className="mt-1 text-2xl font-bold text-blue-800">{summary.qualified}</p>
          </div>
          <div className="rounded-2xl bg-slate-100 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">awarded / failed</p>
            <p className="mt-1 text-2xl font-bold text-slate-800">{summary.awarded + summary.failed}</p>
          </div>
        </div>

        {error ? <p className="mt-4 text-sm font-medium text-rose-600">{error}</p> : null}
      </section>

      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead className="bg-slate-50 text-sm text-slate-600">
              <tr>
                <th className="px-4 py-3">Tên SV</th>
                <th className="px-4 py-3">MSSV</th>
                <th className="px-4 py-3">GPA</th>
                <th className="px-4 py-3">Trạng thái hồ sơ</th>
                <th className="px-4 py-3 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {loading ? (
                Array.from({ length: 4 }).map((_, index) => (
                  <tr key={`detail-skel-${index}`} className="border-t border-slate-100 animate-pulse">
                    <td className="px-4 py-4"><div className="h-4 w-40 rounded bg-slate-200" /></td>
                    <td className="px-4 py-4"><div className="h-4 w-24 rounded bg-slate-200" /></td>
                    <td className="px-4 py-4"><div className="h-4 w-16 rounded bg-slate-200" /></td>
                    <td className="px-4 py-4"><div className="h-6 w-28 rounded-full bg-slate-200" /></td>
                    <td className="px-4 py-4 text-right"><div className="ml-auto h-9 w-28 rounded-xl bg-slate-200" /></td>
                  </tr>
                ))
              ) : detail?.applications?.length ? (
                detail.applications.map((row) => (
                  <tr key={row.id_hosodk} className="border-t border-slate-100">
                    <td className="px-4 py-4">
                      <p className="font-semibold text-slate-800">{row.student.fullName}</p>
                      <p className="mt-1 text-xs text-slate-500">Nộp: {formatDate(row.ngaynop)}</p>
                    </td>
                    <td className="px-4 py-4 text-slate-600">{row.student.mssv}</td>
                    <td className="px-4 py-4 text-slate-700">{row.student.gpa}</td>
                    <td className="px-4 py-4">
                      <StatusBadge status={row.statusCode || row.trangthai} label={row.statusLabel} />
                    </td>
                    <td className="px-4 py-4 text-right">
                      <Link
                        to={`/admin/applications/${id_hb}/${row.id_hosodk}`}
                        className="inline-flex rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-teal-300 hover:text-teal-700"
                      >
                        Xem chi tiết
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-slate-500">
                    Chưa có hồ sơ nào cho học bổng này.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}