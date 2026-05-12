import { Link } from "react-router-dom";
import StatusBadge from "../../components/StatusBadge";

export default function ApplicationList({ rows, loading }) {
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left">
          <thead className="bg-slate-50 text-sm text-slate-600">
            <tr>
              <th className="px-4 py-3">Tên học bổng</th>
              <th className="px-4 py-3">Hạn</th>
              <th className="px-4 py-3">Trạng thái</th>
              <th className="px-4 py-3 text-right">Hành động</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {loading ? (
              Array.from({ length: 4 }).map((_, index) => (
                <tr key={`app-skel-${index}`} className="border-t border-slate-100 animate-pulse">
                  <td className="px-4 py-4"><div className="h-4 w-44 rounded bg-slate-200" /></td>
                  <td className="px-4 py-4"><div className="h-4 w-24 rounded bg-slate-200" /></td>
                  <td className="px-4 py-4"><div className="h-6 w-28 rounded-full bg-slate-200" /></td>
                  <td className="px-4 py-4 text-right"><div className="ml-auto h-9 w-28 rounded-xl bg-slate-200" /></td>
                </tr>
              ))
            ) : rows.length ? (
              rows.map((row) => (
                <tr key={row.id_hb} className="border-t border-slate-100">
                  <td className="px-4 py-4">
                    <p className="font-semibold text-slate-800">{row.tenhb}</p>
                    <p className="mt-1 text-xs text-slate-500">ID: {row.id_hb}</p>
                  </td>
                  <td className="px-4 py-4 text-slate-600">{row.han || "-"}</td>
                  <td className="px-4 py-4">
                    <StatusBadge status={row.deadlineStatus} label={row.deadlineLabel} />
                  </td>
                  <td className="px-4 py-4 text-right">
                    <Link
                      to={`/admin/applications/${row.id_hb}`}
                      className="inline-flex rounded-xl bg-teal-700 px-3 py-2 text-sm font-semibold text-white transition hover:bg-teal-800"
                    >
                      Xem hồ sơ
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-4 py-12 text-center text-slate-500">
                  Không có học bổng nào để hiển thị.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}