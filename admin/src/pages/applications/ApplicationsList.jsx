import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import { getApplications, STATUS } from "../../services/application.service";
import "react-toastify/dist/ReactToastify.css";

const STATUS_FILTERS = [
  { value: "all", label: "Tất cả" },
  { value: STATUS.PENDING, label: "Chờ duyệt" },
  { value: STATUS.NEED_EDIT, label: "Cần sửa" },
  { value: STATUS.REJECTED, label: "Từ chối" },
  { value: STATUS.QUALIFIED, label: "Qua vòng hồ sơ" },
  { value: STATUS.AWARDED, label: "Đạt học bổng" },
  { value: STATUS.FAILED, label: "Trượt xét chọn" },
];

const STATUS_CLASS = {
  yellow: "bg-amber-100 text-amber-700 border-amber-200",
  orange: "bg-orange-100 text-orange-700 border-orange-200",
  red: "bg-rose-100 text-rose-700 border-rose-200",
  blue: "bg-blue-100 text-blue-700 border-blue-200",
  green: "bg-emerald-100 text-emerald-700 border-emerald-200",
  gray: "bg-slate-100 text-slate-700 border-slate-200",
};

const formatDate = (value) => {
  if (!value) return "-";
  try {
    return new Date(value).toLocaleString("vi-VN");
  } catch {
    return value;
  }
};

function SkeletonRows() {
  return Array.from({ length: 5 }).map((_, idx) => (
    <tr key={`sk-${idx}`} className="animate-pulse">
      <td className="px-4 py-3">
        <div className="h-4 w-36 rounded bg-slate-200" />
      </td>
      <td className="px-4 py-3">
        <div className="h-4 w-40 rounded bg-slate-200" />
      </td>
      <td className="px-4 py-3">
        <div className="h-4 w-32 rounded bg-slate-200" />
      </td>
      <td className="px-4 py-3">
        <div className="h-6 w-28 rounded-full bg-slate-200" />
      </td>
      <td className="px-4 py-3">
        <div className="h-8 w-20 rounded-xl bg-slate-200" />
      </td>
    </tr>
  ));
}

export default function ApplicationsList() {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState(STATUS.PENDING);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadData = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getApplications({ status: statusFilter });
      setRows(data);
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
  }, [statusFilter]);

  const summary = useMemo(() => {
    const counter = {
      total: rows.length,
      pending: 0,
      qualified: 0,
    };

    rows.forEach((item) => {
      if (item.status === STATUS.PENDING) counter.pending += 1;
      if (item.status === STATUS.QUALIFIED) counter.qualified += 1;
    });

    return counter;
  }, [rows]);

  return (
    <div className="space-y-4">
      <ToastContainer position="top-right" autoClose={2200} hideProgressBar />

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Hồ sơ đăng ký học bổng</h2>
            <p className="mt-1 text-sm text-slate-500">Mặc định hiển thị hồ sơ Chờ duyệt để xử lý xét duyệt trước khi sang xét chọn.</p>
          </div>

          <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
            <span>Tổng:</span>
            <strong>{summary.total}</strong>
            <span className="text-slate-400">|</span>
            <span>Chờ duyệt:</span>
            <strong>{summary.pending}</strong>
            <span className="text-slate-400">|</span>
            <span>Qualified:</span>
            <strong>{summary.qualified}</strong>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <label htmlFor="statusFilter" className="text-sm font-medium text-slate-700">
              Trạng thái
            </label>
            <select
              id="statusFilter"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#6C5CE7]"
            >
              {STATUS_FILTERS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={loadData}
            className="rounded-xl border border-[#6C5CE7] px-3 py-2 text-sm font-semibold text-[#6C5CE7] transition hover:bg-[#6C5CE7]/5"
          >
            Tải lại
          </button>
        </div>

        {error ? <p className="mb-3 text-sm text-rose-600">{error}</p> : null}

        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full min-w-215 text-left">
            <thead className="bg-slate-50 text-sm text-slate-600">
              <tr>
                <th className="px-4 py-3">Sinh viên</th>
                <th className="px-4 py-3">Học bổng</th>
                <th className="px-4 py-3">Ngày nộp</th>
                <th className="px-4 py-3">Trạng thái</th>
                <th className="px-4 py-3">Hành động</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {loading ? <SkeletonRows /> : null}

              {!loading && !rows.length ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-slate-500">
                    <p className="text-base font-semibold text-slate-700">Không có hồ sơ phù hợp bộ lọc</p>
                    <p className="mt-1">Hãy đổi trạng thái lọc hoặc chờ sinh viên nộp hồ sơ.</p>
                  </td>
                </tr>
              ) : null}

              {!loading
                ? rows.map((row) => (
                    <tr key={row.id_hosodk} className="border-t border-slate-100">
                      <td className="px-4 py-3">
                        <p className="font-semibold text-slate-800">{row.student.fullName}</p>
                        <p className="text-xs text-slate-500">{row.student.mssv}</p>
                      </td>
                      <td className="px-4 py-3 text-slate-700">{row.scholarship.tenhb}</td>
                      <td className="px-4 py-3 text-slate-600">{formatDate(row.submitted_at)}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${STATUS_CLASS[row.statusTone] || STATUS_CLASS.gray}`}>
                          {row.statusLabel}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => navigate(`/admin/applications/${row.id_hosodk}`)}
                            className="rounded-xl bg-[#6C5CE7] px-3 py-2 text-xs font-semibold text-white transition hover:opacity-95"
                          >
                            Xét duyệt
                          </button>
                          {row.status === STATUS.QUALIFIED ? (
                            <Link
                              to={`/admin/scholarships/${row.id_hb}/evaluate`}
                              className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-[#6C5CE7] hover:text-[#6C5CE7]"
                            >
                              Xét chọn
                            </Link>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ))
                : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
