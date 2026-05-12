import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  createScholarshipForView,
  deleteScholarshipForView,
  fetchScholarshipsForView,
  updateScholarshipForView,
} from "../../services/scholarship.service";
import ScholarshipFormModal from "./ScholarshipFormModal";

// ScholarshipManagementPage: Trang CRUD hoc bong cho admin.
function ScholarshipManagementPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // loadData: Tai danh sach hoc bong khi vao trang.
  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const result = await fetchScholarshipsForView();
      setItems(result);
    } catch (err) {
      setError(err.message || "Khong the tai danh sach hoc bong.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // filteredItems: Loc theo keyword tren ten va mo ta.
  const filteredItems = useMemo(() => {
    const q = keyword.trim().toLowerCase();
    if (!q) return items;

    return items.filter((item) => {
      return (
        item.name.toLowerCase().includes(q) ||
        String(item.description || "")
          .toLowerCase()
          .includes(q)
      );
    });
  }, [items, keyword]);

  // handleCreate: Mo modal tao hoc bong.
  const handleCreate = () => {
    setEditingItem(null);
    setOpenModal(true);
  };

  // handleEdit: Mo modal sua hoc bong.
  const handleEdit = (item) => {
    setEditingItem(item);
    setOpenModal(true);
  };

  // handleDelete: Xac nhan va xoa hoc bong.
  const handleDelete = async (item) => {
    const ok = window.confirm(`Xoa hoc bong ${item.name}?`);
    if (!ok) return;

    setLoading(true);
    setError("");
    try {
      const next = await deleteScholarshipForView(item.id);
      setItems(next);
    } catch (err) {
      setError(err.message || "Khong the xoa hoc bong.");
    } finally {
      setLoading(false);
    }
  };

  // handleSubmit: Tao/sua hoc bong tu modal.
  const handleSubmit = async (form) => {
    setLoading(true);
    setError("");
    try {
      if (editingItem) {
        const next = await updateScholarshipForView(editingItem.id, form);
        setItems(next);
      } else {
        const created = await createScholarshipForView(form);
        const next = await fetchScholarshipsForView();
        setItems(next);
        setOpenModal(false);
        setEditingItem(null);
        navigate(`/admin/scholarships/${created.id}?setupStep=files`);
        return;
      }

      setOpenModal(false);
      setEditingItem(null);
    } catch (err) {
      setError(err.message || "Luu hoc bong that bai.");
    } finally {
      setLoading(false);
    }
  };

  // formatCurrency: Hien thi gia tri hoc bong theo VND.
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("vi-VN").format(Number(value || 0));
  };

  return (
    <div className="stack-lg">
      <div className="toolbar">
        <div>
          <h2>Quản lý học bổng</h2>
          <p>CRUD học bổng + quản lý chi tiết Files/Form cho từng học bổng.</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={handleCreate}>
          Thêm học bổng
        </button>
      </div>

      <div className="filters">
        <input
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          placeholder="Tìm theo tên hoặc mô tả học bổng"
        />
      </div>

      {error ? <p className="error-text">{error}</p> : null}

      <div className="table-wrap">
        <table className="user-table scholarship-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tên học bổng</th>
              <th>Giá trị</th>
              <th>Hạn nộp</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map((item) => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>
                  <p className="cell-title">{item.name}</p>
                  <p className="cell-sub">{item.description || "Không có mô tả"}</p>
                </td>
                <td>{formatCurrency(item.value)} VND</td>
                <td>{item.deadline}</td>
                <td>
                  <span className={`status-pill status-${item.status}`}>{item.statusText}</span>
                </td>
                <td>
                  <div className="row-actions">
                    <button
                      type="button"
                      className="btn btn-mini"
                      onClick={() => navigate(`/admin/scholarships/${item.id}`)}
                    >
                      Chi tiết
                    </button>
                    <button type="button" className="btn btn-mini" onClick={() => handleEdit(item)}>
                      sửa
                    </button>
                    <button
                      type="button"
                      className="btn btn-danger btn-mini"
                      onClick={() => handleDelete(item)}
                    >
                      Xóa
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!filteredItems.length ? (
              <tr>
                <td colSpan="6" className="empty-row">
                  {loading ? "Đang tải dữ liệu..." : "Không có học bổng phù hợp."}
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <ScholarshipFormModal
        open={openModal}
        onClose={() => {
          setOpenModal(false);
          setEditingItem(null);
        }}
        onSubmit={handleSubmit}
        editingScholarship={editingItem}
        loading={loading}
      />
    </div>
  );
}

export default ScholarshipManagementPage;
