import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import DynamicFormPreview from "../../components/DynamicFormPreview";
import ReviewField from "../../components/ReviewField";
import StatusBadge from "../../components/StatusBadge";
import { fetchReviewApplicationDetail, saveApplicationReview, updateApplicationStatus } from "../../services/review.service";

const buildNeedEditReason = (fields, values) => {
  return fields
    .filter((item) => values[item.field_key || item.key]?.is_pass === false)
    .map((item) => {
      const reason = String(values[item.field_key || item.key]?.lydo || "").trim();
      return reason ? `${item.label}: ${reason}` : "";
    })
    .filter(Boolean)
    .join(" | ");
};

export default function ReviewPage() {
  const { id_hb, id_hosodk } = useParams();
  const navigate = useNavigate();

  const [detail, setDetail] = useState(null);
  const [reviews, setReviews] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadData = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await fetchReviewApplicationDetail(Number(id_hosodk));
      setDetail(data);

      const nextReviews = Object.fromEntries(
        (data.form.fields || []).map((field) => {
          const review = field.review;
          return [
            field.field_key || field.key,
            {
              is_pass: review ? Boolean(review.is_pass) : null,
              lydo: review?.lydo || "",
            },
          ];
        }),
      );

      setReviews(nextReviews);
    } catch (err) {
      const message = err.message || "Không thể tải chi tiết hồ sơ.";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id_hosodk]);

  const fields = detail?.form?.fields || [];

  const hasUnreviewedField = useMemo(
    () => fields.some((field) => reviews[field.field_key || field.key]?.is_pass === null),
    [fields, reviews],
  );

  const allPass = useMemo(
    () => fields.length > 0 && fields.every((field) => reviews[field.field_key || field.key]?.is_pass === true),
    [fields, reviews],
  );

  const hasFail = useMemo(
    () => fields.some((field) => reviews[field.field_key || field.key]?.is_pass === false),
    [fields, reviews],
  );

  const updateFieldReview = (fieldKey, value) => {
    setReviews((prev) => ({
      ...prev,
      [fieldKey]: value,
    }));
  };

  const validateReviews = () => {
    const invalid = fields.find((field) => {
      const item = reviews[field.field_key || field.key];
      return item?.is_pass === false && !String(item.lydo || "").trim();
    });

    if (invalid) {
      throw new Error(`Vui lòng nhập lý do cho trường ${invalid.label}.`);
    }
  };

  const saveReviewData = async () => {
    const payload = fields.map((field) => ({
      field_key: field.field_key || field.key,
      is_pass: Boolean(reviews[field.field_key || field.key]?.is_pass),
      lydo: String(reviews[field.field_key || field.key]?.lydo || "").trim(),
    }));

    await saveApplicationReview({
      id_hosodk: Number(id_hosodk),
      fieldReviews: payload,
      id_ad: 1,
    });
  };

  const handleApprove = async () => {
    if (hasUnreviewedField || !allPass) {
      toast.error("Cần chấm tất cả field và tất cả phải Pass trước khi xét duyệt.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      await saveReviewData();
      await updateApplicationStatus({ id_hosodk: Number(id_hosodk), status: "qualified" });
      toast.success("Đã chuyển hồ sơ sang qualified.");
      navigate(`/admin/applications/${id_hb}`);
    } catch (err) {
      const message = err.message || "Không thể xét duyệt hồ sơ.";
      setError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const handleNeedEdit = async () => {
    if (hasUnreviewedField || !hasFail) {
      toast.error("Cần chấm tất cả field và phải có ít nhất 1 field Fail.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      validateReviews();
      const reason = buildNeedEditReason(fields, reviews);

      await saveReviewData();
      await updateApplicationStatus({
        id_hosodk: Number(id_hosodk),
        status: "need_edit",
        ly_do_tu_choi: reason,
      });

      toast.success("Đã chuyển hồ sơ sang need_edit.");
      navigate(`/admin/applications/${id_hb}`);
    } catch (err) {
      const message = err.message || "Không thể yêu cầu sửa hồ sơ.";
      setError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const actionDisabled = saving || loading || !detail;

  return (
    <div className="space-y-4">
      <ToastContainer position="top-right" autoClose={2200} hideProgressBar />

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-teal-700">Review chi tiết</p>
            <h2 className="mt-2 text-2xl font-bold text-slate-800">{detail?.scholarship?.tenhb || "Đang tải hồ sơ..."}</h2>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <StatusBadge status={detail?.application?.status} />
              <span className="text-sm text-slate-500">
                {detail?.student?.fullName || ""}
                {detail?.student?.mssv ? ` - ${detail.student.mssv}` : ""}
              </span>
            </div>
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

      {loading ? (
        <div className="space-y-3 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={`review-skel-${index}`} className="h-32 animate-pulse rounded-2xl bg-slate-100" />
          ))}
        </div>
      ) : null}

      {!loading && detail ? (
        <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
          <DynamicFormPreview form={detail.form} submission={detail.submission} />

          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-teal-700">Review từng field</p>
                <h3 className="mt-2 text-xl font-bold text-slate-800">Đánh giá hồ sơ</h3>
              </div>

              <div className="flex flex-wrap gap-2">
                <StatusBadge status={hasUnreviewedField ? "pending" : allPass ? "qualified" : hasFail ? "need_edit" : "pending"} />
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {fields.map((field) => (
                <ReviewField
                  key={field.field_key || field.key}
                  field={field}
                  value={reviews[field.field_key || field.key]}
                  onChange={updateFieldReview}
                />
              ))}
            </div>

            <div className="mt-5 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
              <p className="font-semibold text-slate-800">Điều kiện xử lý</p>
              <p className="mt-1">Pass toàn bộ field để mở nút xét duyệt. Chỉ cần một field Fail để mở nút yêu cầu sửa.</p>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                disabled={actionDisabled || hasUnreviewedField || !allPass}
                onClick={handleApprove}
                className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Xét duyệt
              </button>
              <button
                type="button"
                disabled={actionDisabled || hasUnreviewedField || !hasFail}
                onClick={handleNeedEdit}
                className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Yêu cầu sửa
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}