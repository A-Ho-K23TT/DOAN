import { useEffect, useMemo, useState } from "react";
import * as applicationService from "../../services/application.service";
import { fetchScholarshipsForView } from "../../services/scholarship.service";

const formatDateTime = (value) => {
  if (!value) return "-";

  try {
    return new Date(value).toLocaleString("vi-VN");
  } catch {
    return value;
  }
};

const buildNeedEditReason = (fieldReviews) => {
  const failed = (fieldReviews || []).filter((item) => !item.isPass && item.reason.trim());
  if (!failed.length) return "";

  return failed.map((item) => `${item.label}: ${item.reason.trim()}`).join(" | ");
};

const toReviewPayload = (fieldReviews) => {
  return (fieldReviews || []).map((item) => ({
    field_key: item.key,
    is_pass: item.isPass,
    lydo: item.reason,
  }));
};

function AnswerView({ field }) {
  if (field.answer === undefined || field.answer === null || field.answer === "") {
    return <div className="answer-box muted">(Khong co du lieu)</div>;
  }

  if (Array.isArray(field.answer)) {
    return <div className="answer-box">{field.answer.length ? field.answer.join(", ") : "(Khong co du lieu)"}</div>;
  }

  if (typeof field.answer === "object") {
    if (field.type === "file") {
      return <div className="answer-box">{field.answer.fileName || "(File khong hop le)"}</div>;
    }

    return <pre className="json-box">{JSON.stringify(field.answer, null, 2)}</pre>;
  }

  return <div className="answer-box">{String(field.answer)}</div>;
}

function ApplicationReviewPage() {
  const [scholarships, setScholarships] = useState([]);
  const [selectedScholarshipId, setSelectedScholarshipId] = useState(null);
  const [applications, setApplications] = useState([]);
  const [selectedApplicationId, setSelectedApplicationId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [fieldReviews, setFieldReviews] = useState([]);
  const [globalReason, setGlobalReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const selectedScholarship = useMemo(() => {
    if (!selectedScholarshipId) return null;
    return scholarships.find((item) => Number(item.id) === Number(selectedScholarshipId)) || null;
  }, [scholarships, selectedScholarshipId]);

  const allPass = useMemo(() => {
    if (!fieldReviews.length) return false;
    return fieldReviews.every((item) => item.isPass);
  }, [fieldReviews]);

  const hasFailed = useMemo(() => {
    return fieldReviews.some((item) => !item.isPass);
  }, [fieldReviews]);

  const primaryAction = allPass ? "approve" : "need_edit";
  const primaryActionText = allPass ? "Xet duyet" : "Yeu cau chinh sua";

  const loadScholarships = async () => {
    setLoading(true);
    setError("");

    try {
      const rows = await fetchScholarshipsForView();
      setScholarships(rows.map((item) => ({
        id: item.id_hb || item.id,
        name: item.tenhb || item.name,
        deadline: item.han,
      })));
      if (!selectedScholarshipId && rows.length) {
        setSelectedScholarshipId(rows[0].id_hb || rows[0].id);
      }
    } catch (err) {
      setError(err.message || "Khong the tai danh sach hoc bong.");
    } finally {
      setLoading(false);
    }
  };

  const loadApplications = async (scholarshipId) => {
    setLoading(true);
    setError("");

    try {
      const { applications } = await applicationService.getScholarshipApplications(scholarshipId);
      const pending = (applications || []).filter((app) => app.trangthai === "pending");
      setApplications(pending.map((item) => ({
        id: item.id_hosodk,
        student: {
          fullName: item.student?.fullName || item.student?.hoten || "",
          mssv: item.student?.mssv || "",
        },
        submittedAt: item.ngaynop,
        statusText: item.statusLabel,
      })));
      setSelectedApplicationId(null);
      setDetail(null);
      setFieldReviews([]);
      setGlobalReason("");
    } catch (err) {
      setError(err.message || "Khong the tai danh sach ho so.");
    } finally {
      setLoading(false);
    }
  };

  const loadApplicationDetail = async (applicationId) => {
    setLoading(true);
    setError("");

    try {
      const data = await applicationService.getApplicationDetail(applicationId);
      setDetail({
        application: {
          id: data.application.id_hosodk,
          submittedAt: data.application.ngaynop,
        },
        student: {
          fullName: data.student.hoten,
          mssv: data.student.mssv,
        },
        form: {
          fields: (data.form.fields || []).map((field) => ({
            key: field.field_key || field.key,
            label: field.label,
            answer: field.answer,
            type: field.type,
          })),
        },
      });
      setFieldReviews(
        (data.form.fields || []).map((field) => ({
          key: field.field_key || field.key,
          label: field.label,
          isPass: true,
          reason: "",
        })),
      );
      setGlobalReason("");
    } catch (err) {
      setError(err.message || "Khong the tai chi tiet ho so.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadScholarships();
  }, []);

  useEffect(() => {
    if (!selectedScholarshipId) return;
    loadApplications(selectedScholarshipId);
  }, [selectedScholarshipId]);

  const updateFieldPass = (fieldKey, isPass) => {
    setFieldReviews((prev) =>
      prev.map((item) =>
        item.key === fieldKey
          ? {
              ...item,
              isPass,
              reason: isPass ? "" : item.reason,
            }
          : item,
      ),
    );
  };

  const updateFieldReason = (fieldKey, reason) => {
    setFieldReviews((prev) => prev.map((item) => (item.key === fieldKey ? { ...item, reason } : item)));
  };

  const handleSubmitReview = async (action) => {
    if (!detail?.application?.id) return;

    const needEditReason = action === "need_edit" ? buildNeedEditReason(fieldReviews) : globalReason;
    const status = action === "approve" || action === "qualified" ? "qualified" : action === "reject" || action === "rejected" ? "rejected" : "need_edit";

    setSubmitting(true);
    setError("");

    try {
      // Save field reviews
      await applicationService.saveReview({
        id_hosodk: detail.application.id,
        fieldReviews: toReviewPayload(fieldReviews),
        id_ad: 1,
      });

      // Update application status
      await applicationService.updateStatus({
        id_hosodk: detail.application.id,
        status: status,
        ly_do_tu_choi: needEditReason,
      });

      await loadApplications(selectedScholarshipId);
    } catch (err) {
      setError(err.message || "Khong the cap nhat ket qua duyet.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="stack-lg">
      <div className="toolbar">
        <div>
          <h2>Hồ sơ đăng ký học bổng</h2>
          <p>Chọn học bổng, chọn sinh viên, duyệt từng trường theo form động.</p>
        </div>
      </div>

      {error ? <p className="error-text">{error}</p> : null}

      <div className="review-grid">
        <section className="detail-card stack-lg">
          <h3>Danh sach hoc bong</h3>
          <div className="table-wrap">
            <table className="user-table">
              <thead>
                <tr>
                  <th>Hoc bong</th>
                  <th>Han</th>
                  <th>Cho duyet</th>
                </tr>
              </thead>
              <tbody>
                {scholarships.map((item) => (
                  <tr
                    key={item.id}
                    className={selectedScholarshipId === item.id ? "row-selected" : ""}
                    onClick={() => setSelectedScholarshipId(item.id)}
                  >
                    <td>
                      <p className="cell-title" style={{margin:0}}>{item.name}</p>
                    </td>
                    <td>{item.deadline || "-"}</td>
                    <td>{item.pendingCount}</td>
                  </tr>
                ))}
                {!scholarships.length ? (
                  <tr>
                    <td colSpan="3" className="empty-row">
                      {loading ? "Dang tai du lieu..." : "Khong co hoc bong."}
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>

        <section className="detail-card stack-lg">
          <h3>
            Ho so cho duyet {selectedScholarship ? (
              <span>- <span className="cell-title" style={{fontWeight:700}}>{selectedScholarship.name}</span></span>
            ) : ""}
          </h3>
          <div className="table-wrap">
            <table className="user-table">
              <thead>
                <tr>
                  <th>Ho ten</th>
                  <th>MSSV</th>
                  <th>Ngay nop</th>
                  <th>Trang thai</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((item) => (
                  <tr
                    key={item.id}
                    className={selectedApplicationId === item.id ? "row-selected" : ""}
                    onClick={() => {
                      setSelectedApplicationId(item.id);
                      loadApplicationDetail(item.id);
                    }}
                  >
                    <td>{item.student.fullName}</td>
                    <td>{item.student.mssv}</td>
                    <td>{formatDateTime(item.submittedAt)}</td>
                    <td>{item.statusText}</td>
                  </tr>
                ))}
                {!applications.length ? (
                  <tr>
                    <td colSpan="4" className="empty-row">
                      {selectedScholarshipId
                        ? "Khong co ho so dang cho duyet."
                        : "Vui long chon hoc bong."}
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {detail ? (
        <section className="detail-card stack-lg">
          <div className="toolbar">
            <div>
              <h3>Duyet ho so: {detail.student.fullName}</h3>
              <p>
                MSSV: {detail.student.mssv} | Nop luc: {formatDateTime(detail.application.submittedAt)}
              </p>
            </div>
          </div>

          <div className="stack-lg">
            {(detail.form.fields || []).map((field) => {
              const review = fieldReviews.find((item) => item.key === field.key);

              return (
                <article key={field.key} className="review-field-card">
                  <p className="review-field-label">{field.label}</p>
                  <AnswerView field={field} />

                  <div className="review-toggle-row">
                    <button
                      type="button"
                      className={`btn btn-mini ${review?.isPass ? "btn-primary" : "btn-ghost"}`}
                      onClick={() => updateFieldPass(field.key, true)}
                    >
                      Dat
                    </button>
                    <button
                      type="button"
                      className={`btn btn-mini ${!review?.isPass ? "btn-danger" : "btn-ghost"}`}
                      onClick={() => updateFieldPass(field.key, false)}
                    >
                      Khong dat
                    </button>
                  </div>

                  {!review?.isPass ? (
                    <label className="field">
                      <span>Lý do không đạt</span>
                      <textarea
                        rows={3}
                        value={review?.reason || ""}
                        onChange={(event) => updateFieldReason(field.key, event.target.value)}
                        placeholder="Nhâp lý do để sinh viên sửa hồ sơ"
                      />
                    </label>
                  ) : null}
                </article>
              );
            })}
          </div>

          <label className="field">
            <span>Lý do từ chối (chỉ dùng khi bấm Từ chối)</span>
            <textarea
              rows={3}
              value={globalReason}
              onChange={(event) => setGlobalReason(event.target.value)}
              placeholder="Nhập lý do từ chối hồ sơ"
            />
          </label>

          <div className="row-actions">
            <button
              type="button"
              className="btn btn-danger"
              disabled={submitting}
              onClick={() => handleSubmitReview("reject")}
            >
              Từ chối
            </button>
            <button
              type="button"
              className={allPass ? "btn btn-primary" : "btn btn-ghost"}
              disabled={submitting || (!allPass && !hasFailed)}
              onClick={() => handleSubmitReview(primaryAction)}
            >
              {primaryActionText}
            </button>
          </div>
        </section>
      ) : null}
    </div>
  );
}

export default ApplicationReviewPage;
