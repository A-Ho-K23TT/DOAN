import { Link } from "react-router-dom";
import { useScholarship } from "../context/ScholarshipContext";

const statusMap = {
  pending: { text: "Chờ duyệt", tone: "pending" },
  need_edit: { text: "Cần chỉnh sửa", tone: "warning" },
  rejected: { text: "Loại hồ sơ", tone: "danger" },
  qualified: { text: "Qua vòng hồ sơ", tone: "ok" },
  awarded: { text: "Đạt học bổng", tone: "success" },
  failed: { text: "Trượt xét chọn", tone: "danger" },
};

function MyApplications() {
  const { myApplications, scholarships } = useScholarship();
  const scholarshipMap = new Map(scholarships.map((item) => [Number(item.id_hb), item]));

  return (
    <div className="stack-lg">
      <section className="hero compact-hero">
        <p className="hero-kicker">Theo dõi hồ sơ</p>
        <h1>Tiến độ xét duyệt từng trường</h1>
        <p>Trường bị reject sẽ hiện lý do cụ thể và nút chỉnh sửa để nộp lại.</p>
      </section>

      {!myApplications.length ? (
        <section className="detail-card">
          <p>Bạn chưa nộp hồ sơ nào.</p>
          <Link to="/scholarships" className="btn btn-primary btn-small">
            Xem học bổng
          </Link>
        </section>
      ) : null}

      {myApplications.map((application) => {
        const scholarship = scholarshipMap.get(Number(application.id_hb));
        const statusInfo = statusMap[application.trangthai] || {
          text: application.trangthai,
          tone: "pending",
        };

        return (
          <section key={application.id_hosodk} className="detail-card stack-md">
            <div className="row-between">
              <div>
                <h2 className="font-semibold">{scholarship?.tenhb || `Học bổng #${application.id_hb}`}</h2>
                <p className="muted">Nộp lần cuối: {new Date(application.ngaynop).toLocaleString("vi-VN")}</p>
              </div>
              <div className="row-actions">
                <span className={`pill pill-${statusInfo.tone}`}>{statusInfo.text}</span>
                {application.ketqua || application.trangthai === "awarded" ? (
                  <span className="pill pill-result-pass">Dat</span>
                ) : ["rejected", "failed"].includes(application.trangthai) ? (
                  <span className="pill pill-result-fail">Truot</span>
                ) : null}
              </div>
            </div>

            {application.ly_do_tu_choi ? (
              <div className="alert alert-danger">Ly do: {application.ly_do_tu_choi}</div>
            ) : null}

            <div className="table-wrap">
              <table className="data-table compact-table">
                <thead>
                  <tr>
                    <th>Câu hỏi</th>
                    <th>Trả lời</th>
                    <th>Kết quả</th>
                    <th>Nhận xét</th>
                  </tr>
                </thead>
                <tbody>
                  {(application.reviewDetails || [])
                    .filter((item) => !item.is_pass)
                    .map((item) => (
                      <tr key={item.id_review}>
                        <td>{item.field_label || item.field_key || 'Câu hỏi không xác định'}</td>
                        <td>{item.student_answer || '-'}</td>
                        <td>
                          <span className="pill pill-danger">Không đạt</span>
                        </td>
                        <td>{item.lydo || '-'}</td>
                      </tr>
                    ))}
                  {!(application.reviewDetails || []).some((item) => !item.is_pass) ? (
                    <tr>
                      <td colSpan="4" className="empty-row">
                        Không có nhận xét không đạt cho hồ sơ này.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>

            {application.trangthai === "need_edit" ? (
              <div className="row-actions">
                <Link to={`/scholarships/${application.id_hb}/apply`} className="btn btn-warning btn-small">
                  Chỉnh sửa hồ sơ
                </Link>
              </div>
            ) : null}
          </section>
        );
      })}
    </div>
  );
}

export default MyApplications;
