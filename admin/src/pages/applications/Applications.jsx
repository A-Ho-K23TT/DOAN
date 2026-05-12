import { useEffect, useMemo, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import ApplicationList from "./ApplicationList";
import { getApplications } from "../../services/application.service";

export default function Applications() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadData = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getApplications();
      setRows(data);
    } catch (err) {
      const message = err.message || "Không thể tải danh sách học bổng.";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const summary = useMemo(() => {
    return rows.reduce(
      (acc, item) => {
        acc.total += 1;
        if (item.deadlineStatus === "expiring") acc.expiring += 1;
        if (item.deadlineStatus === "active") acc.active += 1;
        if (item.deadlineStatus === "expired") acc.expired += 1;
        return acc;
      },
      { total: 0, expiring: 0, active: 0, expired: 0 },
    );
  }, [rows]);

  return (
    <div className="space-y-4">
      <ToastContainer position="top-right" autoClose={2200} hideProgressBar />

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-teal-700">Admin / Applications</p>
            <h2 className="mt-2 text-2xl font-bold text-slate-800">Xét duyệt và xét chọn học bổng</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
              Danh sách học bổng đang hoạt động, kèm trạng thái hạn nộp để vào luồng xét duyệt hồ sơ.
            </p>
          </div>

          <button
            type="button"
            onClick={loadData}
            className="rounded-xl border border-teal-200 bg-teal-50 px-3 py-2 text-sm font-semibold text-teal-700 transition hover:bg-teal-100"
          >
            Tải lại
          </button>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-4">
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">Tổng</p>
            <p className="mt-1 text-2xl font-bold text-slate-800">{summary.total}</p>
          </div>
          <div className="rounded-2xl bg-amber-50 p-4">
            <p className="text-xs uppercase tracking-wide text-amber-700">Sắp hết hạn</p>
            <p className="mt-1 text-2xl font-bold text-amber-800">{summary.expiring}</p>
          </div>
          <div className="rounded-2xl bg-emerald-50 p-4">
            <p className="text-xs uppercase tracking-wide text-emerald-700">Còn hạn</p>
            <p className="mt-1 text-2xl font-bold text-emerald-800">{summary.active}</p>
          </div>
          <div className="rounded-2xl bg-slate-100 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">Hết hạn</p>
            <p className="mt-1 text-2xl font-bold text-slate-800">{summary.expired}</p>
          </div>
        </div>

        {error ? <p className="mt-4 text-sm font-medium text-rose-600">{error}</p> : null}
      </section>

      <ApplicationList rows={rows} loading={loading} />
    </div>
  );
}