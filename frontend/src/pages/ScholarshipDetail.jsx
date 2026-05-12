import { useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useScholarship } from "../context/ScholarshipContext";

const formatMoney = (value) => `${new Intl.NumberFormat("vi-VN").format(Number(value || 0))} VND`;

const getFileUrl = (file) => file?.file_url || file?.fileUrl || "";

const getDownloadFileName = (file) => file?.ten_file_goc || file?.fileName || "download";

const downloadFileByUrl = async (url, fileName) => {
  const response = await fetch(url, { mode: "cors" });

  if (!response.ok) {
    throw new Error("Không thể tải file");
  }

  const blob = await response.blob();
  const objectUrl = window.URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = objectUrl;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.URL.revokeObjectURL(objectUrl);
};

function ScholarshipDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser, getScholarshipById, getScholarshipFiles } = useScholarship();

  const scholarship = getScholarshipById(id);
  const files = useMemo(() => getScholarshipFiles(id), [getScholarshipFiles, id]);

  if (!scholarship) {
    return (
      <section className="narrow-card">
        <h2>Không tìm thấy học bổng</h2>
        <button type="button" className="btn btn-ghost" onClick={() => navigate("/")}>Quay lại</button>
      </section>
    );
  }

  const handleApply = () => {
    if (!currentUser) {
      toast.warning("Bạn chưa đăng nhập, hãy đăng nhập");
      return;
    }
    navigate(`/scholarships/${id}/apply`);
  };

  const handleDownload = async (file) => {
    const url = getFileUrl(file);
    if (!url) {
      toast.error("File chưa có đường dẫn tải về");
      return;
    }

    try {
      await downloadFileByUrl(url, getDownloadFileName(file));
    } catch {
      window.open(url, "_blank", "noopener,noreferrer");
      toast.info("Đang mở file ở tab mới vì trình duyệt không tải trực tiếp được");
    }
  };

  return (
    <div className="stack-lg">
      <section className="detail-card">
        <div className="card-head">
          <span className={`pill pill-${scholarship.priority.color}`}>{scholarship.priority.text}</span>
          {scholarship.resultBadge ? (
            <span className={`pill pill-result-${scholarship.resultBadge.tone}`}>{scholarship.resultBadge.text}</span>
          ) : null}
        </div>

        <h1 className="font-semibold">{scholarship.tenhb}</h1>
        <p>{scholarship.mota || "Không có mô tả"}</p>

        <div className="detail-grid">
          <div>
            <strong>Đối tượng:</strong> {scholarship.doituong || "Khong gioi han"}
          </div>
          <div>
            <strong>Số lượng:</strong> {scholarship.soluong}
          </div>
          <div>
            <strong>Giá trị:</strong> {formatMoney(scholarship.giatri)}
          </div>
          <div>
            <strong>Hạn nộp:</strong> {scholarship.han || "Chua xac dinh"}
          </div>
        </div>

        <div className="row-actions">
          <button type="button" className="btn btn-primary" onClick={handleApply}>
            Đăng ký học bổng
          </button>
          <Link to="/" className="btn btn-ghost">
            Về sanh sách
          </Link>
        </div>
      </section>

      <section className="detail-card">
        <h2>File đính kèm</h2>
        <p className="muted">Có thể xem trước hoặc tải về.</p>

        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Tên file</th>
                <th>Loại</th>
                <th>Dung lượng</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {files.map((file) => {
                const previewUrl = getFileUrl(file);
                return (
                  <tr key={file.id_hb_files}>
                    <td>{file.ten_file_goc}</td>
                    <td>{file.loai_file}</td>
                    <td>{Math.ceil(Number(file.kich_thuoc || 0) / 1024)} KB</td>
                    <td>
                      <div className="row-actions">
                        <a className="btn btn-mini" href={previewUrl || "#"} target="_blank" rel="noreferrer" onClick={(event) => {
                          if (!previewUrl) {
                            event.preventDefault();
                            toast.error("File chưa có đường dẫn xem trước");
                          }
                        }}>
                          Xem trước
                        </a>
                        <button type="button" className="btn btn-ghost btn-mini" onClick={() => handleDownload(file)}>
                          Tải về
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {!files.length ? (
                <tr>
                  <td colSpan="4" className="empty-row">
                    Học bổng này chưa có file đính kèm.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default ScholarshipDetail;
