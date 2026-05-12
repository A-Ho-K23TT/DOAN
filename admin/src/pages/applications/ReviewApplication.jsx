import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import ReviewFormRenderer from "../../components/review/ReviewFormRenderer";
import { getApplicationDetail, saveReview, updateStatus } from "../../services/application.service";
import "react-toastify/dist/ReactToastify.css";

const formatDate = (value) => {
  if (!value) return "-";
  try {
    return new Date(value).toLocaleString("vi-VN");
  } catch {
    return value;
  }
};

function RejectConfirmModal({ open, onCancel, onConfirm, reason, onReasonChange }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/45 p-4">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-5 shadow-xl">
        <h3 className="text-lg font-bold text-slate-800">Xác nhận từ chối hồ sơ</h3>
        <p className="mt-1 text-sm text-slate-500">Lý do từ chối sẽ lưu vào hsdangky.ly_do_tu_choi.</p>

        <textarea
          rows={4}
          value={reason}
          onChange={(event) => onReasonChange(event.target.value)}
          placeholder="Nhập lý do từ chối"
          className="mt-4 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-rose-400"
        />

        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-xl bg-rose-600 px-3 py-2 text-sm font-semibold text-white"
          >
            Xác nhận từ chối
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ReviewApplication() {
  const { id_hb, id_hosodk } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const viewOnly = searchParams.get("mode") === "view";

  const [detail, setDetail] = useState(null);
  const [reviews, setReviews] = useState({});
  const [rejectReason, setRejectReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);

  const loadDetail = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getApplicationDetail(id_hosodk);
      setDetail(data);

      const initialReviews = Object.fromEntries(
        (data.form.fields || []).map((field) => [
          field.key,
          {
            is_pass: Boolean(field.review?.is_pass),
            lydo: field.review?.lydo || "",
          },
        ]),
      );

      setReviews(initialReviews);
      setRejectReason(data.application.ly_do_tu_choi || "");
    } catch (err) {
      const message = err.message || "Không thể tải chi tiết hồ sơ.";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDetail();
  }, [id_hosodk]);

  const allPass = useMemo(() => {
    const values = Object.values(reviews);
    if (!values.length) return false;
    return values.every((item) => item.is_pass);
  }, [reviews]);

  const handleFieldChange = (fieldKey, nextValue) => {
    setReviews((prev) => ({
      ...prev,
      [fieldKey]: nextValue,
    }));
  };

  const getReviewPayload = () => {
    return Object.entries(reviews).map(([field_key, review]) => ({
      field_key,
      is_pass: Boolean(review.is_pass),
      lydo: String(review.lydo || "").trim(),
    }));
  };

  const validateBeforeSubmit = () => {
    const invalid = Object.values(reviews).find((item) => !item.is_pass && !String(item.lydo || "").trim());
    if (invalid) {
      throw new Error("Có trường Không đạt nhưng chưa nhập lý do.");
    }
  };

  const onSaveReview = async () => {
    setSaving(true);
    setError("");

    try {
      validateBeforeSubmit();

      await saveReview({
        id_hosodk: Number(id_hosodk),
        fieldReviews: getReviewPayload(),
        id_ad: 1,
      });

      // Check if all fields have been reviewed
      const totalFields = detail.form.fields.length;
      const reviewedFields = Object.keys(reviews).length;
      const allReviewed = totalFields === reviewedFields;

      // If all fields are reviewed, auto-update status
      if (allReviewed) {
        if (allPass) {
          // All fields pass - approve
          await updateStatus({
            id_hosodk: Number(id_hosodk),
            status: "qualified",
          });
          toast.success("Tất cả câu hỏi đạt - Hồ sơ đã được duyệt");
        } else {
          // At least one field fails - mark as need_edit
          await updateStatus({
            id_hosodk: Number(id_hosodk),
            status: "need_edit",
          });
          toast.success("Đã lưu review - Hồ sơ cần chỉnh sửa");
        }
      } else {
        toast.success("Đã lưu review");
      }
    } catch (err) {
      const message = err.message || "Không thể lưu review.";
      setError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const onApprove = async () => {
    if (!allPass) {
      toast.error("Chỉ được duyệt hồ sơ khi tất cả field đều Đạt.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      await saveReview({
        id_hosodk: Number(id_hosodk),
        fieldReviews: getReviewPayload(),
        id_ad: 1,
      });

      await updateStatus({
        id_hosodk: Number(id_hosodk),
        status: "qualified",
      });

      toast.success("Hồ sơ đã được duyệt");
    } catch (err) {
      const message = err.message || "Không thể duyệt hồ sơ.";
      setError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const onReject = async () => {
    if (!String(rejectReason || "").trim()) {
      toast.error("Vui lòng nhập lý do từ chối.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      await updateStatus({
        id_hosodk: Number(id_hosodk),
        status: "rejected",
        ly_do_tu_choi: rejectReason,
      });

      setShowRejectModal(false);
      toast.success("Hồ sơ đã bị từ chối");
    } catch (err) {
      const message = err.message || "Không thể từ chối hồ sơ.";
      setError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <ToastContainer position="top-right" autoClose={2200} hideProgressBar />

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Xét duyệt hồ sơ chi tiết</h2>
            <p className="mt-1 text-sm text-slate-500">
              {viewOnly
                ? "Chế độ xem - Hiển thị các câu hỏi và kết quả đã được xét duyệt."
                : "Duyệt theo từng câu hỏi trong form, lưu review vào review_detail."}
            </p>
          </div>

          <div className="flex gap-2">
            <Link
              to={viewOnly ? `/admin/scholarships/${id_hb}/evaluate` : "/admin/applications"}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700"
            >
              {viewOnly ? "Quay lại xét chọn" : "Quay lại danh sách"}
            </Link>
            <button
              type="button"
              onClick={loadDetail}
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

      {loading ? (
        <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={`r-skeleton-${idx}`} className="h-24 animate-pulse rounded-xl bg-slate-100" />
          ))}
        </div>
      ) : null}

      {!loading && detail ? (
        <>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <p className="text-sm text-slate-500">Sinh viên</p>
                <p className="font-semibold text-slate-800">{detail.student.fullName}</p>
                <p className="text-sm text-slate-600">{detail.student.mssv}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Học bổng</p>
                <p className="font-semibold text-slate-800">{detail.scholarship.tenhb}</p>
                <p className="text-sm text-slate-600">Nộp lúc: {formatDate(detail.application.ngaynop)}</p>
              </div>
            </div>

            <div className="mt-3 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-sm text-slate-600">
              <strong>Form:</strong> {detail.form.title}
              {detail.form.description ? <span> - {detail.form.description}</span> : null}
            </div>
          </div>

          <ReviewFormRenderer fields={detail.form.fields || []} reviews={reviews} onChange={viewOnly ? null : handleFieldChange} />

          {!viewOnly ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={saving}
                  onClick={onSaveReview}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Yêu cầu chỉnh sửa
                </button>

                <button
                  type="button"
                  disabled={saving || !allPass}
                  onClick={onApprove}
                  className="rounded-xl bg-[#6C5CE7] px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Duyệt hồ sơ
                </button>

                <button
                  type="button"
                  disabled={saving}
                  onClick={() => setShowRejectModal(true)}
                  className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Từ chối
                </button>
              </div>
            </div>
          ) : null}
        </>
      ) : null}

      {!loading && !detail ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-500">
          Không tìm thấy dữ liệu hồ sơ để xét duyệt.
        </div>
      ) : null}

      <RejectConfirmModal
        open={showRejectModal}
        reason={rejectReason}
        onReasonChange={setRejectReason}
        onCancel={() => setShowRejectModal(false)}
        onConfirm={onReject}
      />
    </div>
  );
}
