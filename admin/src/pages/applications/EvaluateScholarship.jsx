import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import { getQualifiedApplications, submitEvaluation } from "../../services/application.service";
import "react-toastify/dist/ReactToastify.css";

const formatDate = (value) => {
  if (!value) return "-";
  try {
    return new Date(value).toLocaleString("vi-VN");
  } catch {
    return value;
  }
};

export default function EvaluateScholarship() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [rows, setRows] = useState([]);
  const [selected, setSelected] = useState([]);
  const [failedReason, setFailedReason] = useState("Không được chọn trong vòng xét chọn.");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const loadData = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getQualifiedApplications(id);
      setRows(data);
      setSelected([]);
    } catch (err) {
      const message = err.message || "Không thể tải danh sách hồ sơ qualified.";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const allSelected = useMemo(() => {
    if (!rows.length) return false;
    return selected.length === rows.length;
  }, [rows, selected]);

  const toggleAll = () => {
    if (allSelected) {
      setSelected([]);
      return;
    }

    setSelected(rows.map((item) => item.id_hosodk));
  };

  const toggleOne = (id_hosodk) => {
    setSelected((prev) => {
      if (prev.includes(id_hosodk)) {
        return prev.filter((item) => item !== id_hosodk);
      }

      return [...prev, id_hosodk];
    });
  };

  const onSubmitEvaluation = async () => {
    if (!rows.length) {
      toast.error("Không có hồ sơ qualified để xét chọn.");
      return;
    }

    if (!window.confirm("Xác nhận chốt kết quả xét chọn? Thao tác này sẽ cập nhật awarded/failed.")) {
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const result = await submitEvaluation({
        id_hb: Number(id),
        awardedIds: selected,
        failedReason,
      });

      toast.success(`Đã cập nhật: ${result.awardedCount} đạt, ${result.failedCount} trượt.`);
      navigate("/admin/applications");
    } catch (err) {
      const message = err.message || "Không thể hoàn tất xét chọn.";
      setError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <ToastContainer position="top-right" autoClose={2200} hideProgressBar />

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Xét chọn học bổng</h2>
            <p className="mt-1 text-sm text-slate-500">Chỉ hiển thị hồ sơ trạng thái qualified của học bổng hiện tại.</p>
          </div>

          <div className="flex gap-2">
            <Link
              to="/admin/applications"
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700"
            >
              Về hồ sơ
            </Link>
            <button
              type="button"
              onClick={loadData}
              className="rounded-xl border border-[#6C5CE7] px-3 py-2 text-sm font-semibold text-[#6C5CE7]"
            >
              Tải lại
            </button>
          </div>
        </div>
      </div>

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</div>
      ) : null}

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
            Tổng hồ sơ qualified: <strong>{rows.length}</strong> | Chọn đạt: <strong>{selected.length}</strong>
          </div>

          <button
            type="button"
            onClick={toggleAll}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700"
          >
            {allSelected ? "Bỏ chọn tất cả" : "Chọn tất cả"}
          </button>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full min-w-205 text-left">
            <thead className="bg-slate-50 text-sm text-slate-600">
              <tr>
                <th className="px-4 py-3">Chọn</th>
                <th className="px-4 py-3">Sinh viên</th>
                <th className="px-4 py-3">MSSV</th>
                <th className="px-4 py-3">GPA</th>
                <th className="px-4 py-3">Điểm RL</th>
                <th className="px-4 py-3">Ngày nộp</th>
                <th className="px-4 py-3">Thao tác</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {loading
                ? Array.from({ length: 5 }).map((_, idx) => (
                    <tr key={`ev-sk-${idx}`} className="animate-pulse border-t border-slate-100">
                      <td className="px-4 py-3">
                        <div className="h-4 w-4 rounded bg-slate-200" />
                      </td>
                      <td className="px-4 py-3">
                        <div className="h-4 w-36 rounded bg-slate-200" />
                      </td>
                      <td className="px-4 py-3">
                        <div className="h-4 w-24 rounded bg-slate-200" />
                      </td>
                      <td className="px-4 py-3">
                        <div className="h-4 w-16 rounded bg-slate-200" />
                      </td>
                      <td className="px-4 py-3">
                        <div className="h-4 w-16 rounded bg-slate-200" />
                      </td>
                      <td className="px-4 py-3">
                        <div className="h-4 w-28 rounded bg-slate-200" />
                      </td>
                      <td className="px-4 py-3">
                        <div className="h-4 w-20 rounded bg-slate-200" />
                      </td>
                    </tr>
                  ))
                : null}

              {!loading && !rows.length ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-slate-500">
                    Chưa có hồ sơ nào đủ điều kiện qualified để xét chọn.
                  </td>
                </tr>
              ) : null}

              {!loading
                ? rows.map((row) => (
                    <tr key={row.id_hosodk} className="border-t border-slate-100">
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selected.includes(row.id_hosodk)}
                          onChange={() => toggleOne(row.id_hosodk)}
                          className="h-4 w-4 rounded border-slate-300 accent-[#6C5CE7]"
                        />
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-800">{row.student.fullName}</td>
                      <td className="px-4 py-3 text-slate-600">{row.student.mssv}</td>
                      <td className="px-4 py-3 text-slate-700">{row.student.gpa}</td>
                      <td className="px-4 py-3 text-slate-700">{row.student.diem_rl}</td>
                      <td className="px-4 py-3 text-slate-600">{formatDate(row.submitted_at)}</td>
                      <td className="px-4 py-3">
                        <Link
                          to={`/admin/applications/${id}/detail/${row.id_hosodk}?mode=view`}
                          className="rounded-lg border border-[#6C5CE7] px-2 py-1 text-xs font-semibold text-[#6C5CE7] hover:bg-[#6C5CE7] hover:text-white"
                        >
                          Chi tiết
                        </Link>
                      </td>
                    </tr>
                  ))
                : null}
            </tbody>
          </table>
        </div>

        <div className="mt-4">
          <label htmlFor="failedReason" className="mb-1 block text-sm font-semibold text-slate-700">
            Lý do cho hồ sơ không được chọn
          </label>
          <textarea
            id="failedReason"
            rows={3}
            value={failedReason}
            onChange={(event) => setFailedReason(event.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#6C5CE7]"
          />
        </div>

        <div className="mt-4 flex justify-end">
          <button
            type="button"
            disabled={submitting || loading || !rows.length}
            onClick={onSubmitEvaluation}
            className="rounded-xl bg-[#6C5CE7] px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            Chốt kết quả xét chọn
          </button>
        </div>
      </div>
    </div>
  );
}
