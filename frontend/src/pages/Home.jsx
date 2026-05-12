import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useScholarship } from "../context/ScholarshipContext";

const formatMoney = (value) => `${new Intl.NumberFormat("vi-VN").format(Number(value || 0))} VND`;

function Home() {
  const navigate = useNavigate();
  const { scholarships, currentUser } = useScholarship();

  const handleApplyClick = (scholarshipId) => {
    if (!currentUser) {
      toast.warning("Bạn chưa đăng nhập");
      return;
    }

    navigate(`/scholarships/${scholarshipId}/apply`);
  };

  return (
    <div className="stack-lg">
      <section className="hero">
        <p className="hero-kicker">Danh sách học bổng</p>
        <h1>Xem và đăng ký các chương trình học bổng</h1>
        <p>
          Thứ tự hiển thị ưu tiên: <strong>Sắp hết hạn</strong> -&gt; <strong>Còn hạn</strong> -&gt; <strong>Hết hạn</strong>.
          Nếu đã có kết quả, hệ thống sẽ hiển thị badge Đạt/Trượt ngay trên từng học bổng.
        </p>
      </section>

      <section className="cards-grid">
        {scholarships.map((item) => (
          <article key={item.id_hb} className="scholarship-card">
            <div className="card-head">
              <span className={`pill pill-${item.priority.color}`}>{item.priority.text}</span>
              {item.resultBadge ? (
                <span className={`pill pill-result-${item.resultBadge.tone}`}>{item.resultBadge.text}</span>
              ) : null}
            </div>

            <h3 className="font-semibold">{item.tenhb}</h3>
            <p className="muted">{item.mota || "Khong co mo ta"}</p>

            <div className="card-meta">
              <span>Giá trị: {formatMoney(item.giatri)}</span>
              <span>Hạn nộp: {item.han || "Chưa xác định"}</span>
            </div>

            <div className="row-actions">
              <Link to={`/scholarships/${item.id_hb}`} className="btn btn-ghost btn-small">
                Xem chi tiết
              </Link>
              <button
                type="button"
                className="btn btn-primary btn-small"
                onClick={() => handleApplyClick(item.id_hb)}
              >
                Đăng ký
              </button>
            </div>
          </article>
        ))}

        {!scholarships.length ? <p>Chưa có học bổng nào.</p> : null}
      </section>
    </div>
  );
}

export default Home;
