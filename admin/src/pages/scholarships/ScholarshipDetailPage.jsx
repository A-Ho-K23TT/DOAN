import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  deleteFileForScholarship,
  downloadFileForScholarship,
  fetchFilesByScholarshipForView,
  fetchFormConfigForView,
  findScholarshipByIdForView,
  uploadFileForScholarship,
} from "../../services/scholarship.service";

// ScholarshipDetailPage: Trang detail hoc bong voi 3 tab Thong tin | Files | Form.
function ScholarshipDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const setupStep = searchParams.get("setupStep");

  const [activeTab, setActiveTab] = useState(setupStep === "files" ? "files" : setupStep === "form" ? "form" : "info");
  const [scholarship, setScholarship] = useState(null);
  const [files, setFiles] = useState([]);
  const [formConfig, setFormConfig] = useState({ title: "", description: "", fields: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedFilesForUpload, setSelectedFilesForUpload] = useState([]);

  // loadDetail: Tai thong tin hoc bong + files + form config.
  const loadDetail = async () => {
    setLoading(true);
    setError("");

    try {
      const [item, fileRows, formRows] = await Promise.all([
        findScholarshipByIdForView(id),
        fetchFilesByScholarshipForView(id),
        fetchFormConfigForView(id),
      ]);

      setScholarship(item);
      setFiles(fileRows);
      setFormConfig(formRows);
    } catch (err) {
      setError(err.message || "Khong the tai detail hoc bong.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDetail();
  }, [id]);

  useEffect(() => {
    if (setupStep === "files") {
      setActiveTab("files");
      return;
    }

    if (setupStep === "form") {
      setActiveTab("form");
    }
  }, [setupStep]);

  // fileCountText: Text mo ta so file trong tab Files.
  const fileCountText = useMemo(() => {
    return `${files.length} file`;
  }, [files]);

  // handleUpload: store the selected files and wait for user confirmation
  const handleUpload = (event) => {
    const selectedFiles = Array.from(event.target.files || []);
    if (!selectedFiles.length) return;

    setSelectedFilesForUpload(selectedFiles);
    event.target.value = "";
  };

  const handleConfirmUpload = async () => {
    if (!selectedFilesForUpload.length) return;

    setLoading(true);
    setError("");
    try {
      const next = await uploadFileForScholarship(id, selectedFilesForUpload);
      setFiles(next);
      setSelectedFilesForUpload([]);
    } catch (err) {
      setError(err.message || "Upload file that bai.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSelectedFile = () => {
    setSelectedFilesForUpload([]);
  };

  // handleDeleteFile: Xoa file va refresh list.
  const handleDeleteFile = async (file) => {
    const ok = window.confirm(`Xoa file ${file.fileName}?`);
    if (!ok) return;

    setLoading(true);
    setError("");
    try {
      const next = await deleteFileForScholarship(id, file.id);
      setFiles(next);
    } catch (err) {
      setError(err.message || "Khong the xoa file.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadFile = async (file) => {
    setLoading(true);
    setError("");

    try {
      await downloadFileForScholarship(id, file);
    } catch (err) {
      setError(err.message || "Khong the tai file.");
    } finally {
      setLoading(false);
    }
  };

  if (!scholarship && !loading) {
    return (
      <div className="stack-lg">
        <div className="toolbar">
          <h2>Khong tim thay hoc bong</h2>
          <button type="button" className="btn btn-ghost" onClick={() => navigate("/admin/scholarships")}>
            Quay lai danh sach
          </button>
        </div>
        {error ? <p className="error-text">{error}</p> : null}
      </div>
    );
  }

  return (
    <div className="stack-lg">
      <div className="toolbar">
        <div>
          <h2>Chi tiết học bổng #{scholarship?.id}</h2>
          <p className="cell-title">{scholarship?.name}</p>
        </div>
        <div className="row-actions">
          <button type="button" className="btn btn-ghost" onClick={() => navigate("/admin/scholarships")}>
            Danh sách
          </button>
          <Link to={`/admin/scholarships/${id}/form-builder`} className="btn btn-primary">
            Mở Form Builder
          </Link>
        </div>
      </div>

      {error ? <p className="error-text">{error}</p> : null}

      {setupStep ? (
        <section className="detail-card">
          <p>
            <strong>Flow tạo học bổng:</strong> Bước 1 đã hoàn tất. Tiếp tục Bước 2 (upload file) và Bước 3 (tạo form động).
          </p>
          <div className="row-actions" style={{ marginTop: "0.75rem" }}>
            <button type="button" className="btn btn-mini" onClick={() => setActiveTab("files")}>
              Bước 2: Upload file
            </button>
            <button
              type="button"
              className="btn btn-primary btn-mini"
              onClick={() => navigate(`/admin/scholarships/${id}/form-builder`)}
            >
              Bước 3: Tạo form
            </button>
          </div>
        </section>
      ) : null}

      <div className="tabs-row">
        <button
          type="button"
          className={`tab-btn ${activeTab === "info" ? "tab-btn-active" : ""}`}
          onClick={() => setActiveTab("info")}
        >
          Thông tin
        </button>
        <button
          type="button"
          className={`tab-btn ${activeTab === "files" ? "tab-btn-active" : ""}`}
          onClick={() => setActiveTab("files")}
        >
          Files ({fileCountText})
        </button>
        <button
          type="button"
          className={`tab-btn ${activeTab === "form" ? "tab-btn-active" : ""}`}
          onClick={() => setActiveTab("form")}
        >
          Form
        </button>
      </div>

      {activeTab === "info" ? (
        <section className="detail-card">
          <p>
            <strong>Tên:</strong> <strong>{scholarship?.name}</strong>
          </p>
          <p>
            <strong>Mô tả:</strong> {scholarship?.description || "Khong co mo ta"}
          </p>
          <p>
            <strong>Giá trị:</strong> {new Intl.NumberFormat("vi-VN").format(scholarship?.value || 0)} VND
          </p>
          <p>
            <strong>Hạn nộp:</strong> {scholarship?.deadline}
          </p>
          <p>
            <strong>Trạng thái:</strong> {scholarship?.statusText}
          </p>
        </section>
      ) : null}

      {activeTab === "files" ? (
        <section className="detail-card stack-lg">
          <div className="toolbar">
            <p>Quản lý file đính kèm học bổng.</p>
            <div className="row-actions">
              <label className="btn btn-primary file-picker-btn">
                Chọn nhiều file
                <input type="file" multiple onChange={handleUpload} className="hidden-input" accept=".pdf,.doc,.docx,image/*" />
              </label>
              {selectedFilesForUpload.length ? (
                <div style={{ display: "inline-flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
                  <span>{selectedFilesForUpload.length} file đã chọn</span>
                  <button type="button" className="btn btn-primary btn-mini" onClick={handleConfirmUpload}>
                    Done
                  </button>
                  <button type="button" className="btn btn-ghost btn-mini" onClick={handleCancelSelectedFile}>
                    Cancel
                  </button>
                </div>
              ) : null}
              <button
                type="button"
                className="btn btn-mini"
                onClick={() => navigate(`/admin/scholarships/${id}/form-builder`)}
              >
                Tiếp tục tạo form
              </button>
            </div>
          </div>

          <div className="table-wrap">
            <table className="user-table">
              <thead>
                <tr>
                  <th>Tên file</th>
                  <th>Loại</th>
                  <th>Dung lượng</th>
                  <th>Ngày tạo</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {files.map((file) => (
                  <tr key={file.id}>
                    <td>{file.fileName}</td>
                    <td>{file.extension}</td>
                    <td>{Math.ceil(file.size / 1024)} KB</td>
                    <td>{new Date(file.createdAt).toLocaleString("vi-VN")}</td>
                    <td>
                      <div className="row-actions">
                        <a href={file.fileUrl} className="btn btn-mini" target="_blank" rel="noreferrer">
                          Mở link
                        </a>
                        <button type="button" className="btn btn-mini" onClick={() => handleDownloadFile(file)}>
                          Tải xuống
                        </button>
                        <button
                          type="button"
                          className="btn btn-danger btn-mini"
                          onClick={() => handleDeleteFile(file)}
                        >
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!files.length ? (
                  <tr>
                    <td colSpan="5" className="empty-row">
                      Chưa có file nào.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {activeTab === "form" ? (
        <section className="detail-card stack-lg">
          <p>Xem nhanh cấu hình form hiện tại (preview read-only).</p>
          <pre className="json-box">{JSON.stringify(formConfig, null, 2)}</pre>
        </section>
      ) : null}
    </div>
  );
}

export default ScholarshipDetailPage;
