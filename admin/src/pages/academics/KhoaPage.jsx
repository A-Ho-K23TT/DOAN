import { useEffect, useState } from "react";
import KhoaTable from "../../components/academics/KhoaTable";
import {
  createFacultyForView,
  deleteFacultyForView,
  getAcademicStructureForView,
  updateFacultyForView,
} from "../../services/user.service";
function KhoaPage() {
  const [academicStructure, setAcademicStructure] = useState({ khoa: [], nganh: [], lop: [] });
  const [tenkhoa, setTenkhoa] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const refreshAcademic = async () => {
    setLoading(true);

    try {
      const data = await getAcademicStructureForView();
      setAcademicStructure(data);
    } catch (err) {
      setError(err.message || "Khong the tai danh sach khoa.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshAcademic();
  }, []);

  const handleSubmit = async () => {
    if (!tenkhoa.trim()) {
      setError("Ten khoa khong duoc de trong.");
      return;
    }

    try {
      await createFacultyForView({ tenkhoa: tenkhoa.trim(), created_by: 1 });
      setTenkhoa("");
      await refreshAcademic();
      setError("");
    } catch (err) {
      setError(err.message || "Khong the tao khoa.");
    }
  };

  const handleEdit = async (row) => {
    const nextName = window.prompt("Nhap ten khoa moi", row.tenkhoa);

    if (nextName === null) {
      return;
    }

    const normalizedName = nextName.trim();
    if (!normalizedName) {
      setError("Ten khoa khong duoc de trong.");
      return;
    }

    try {
      await updateFacultyForView(row.id_khoa, {
        tenkhoa: normalizedName,
        created_by: row.created_by,
      });
      await refreshAcademic();
      setError("");
    } catch (err) {
      setError(err.message || "Khong the cap nhat khoa.");
    }
  };

  const handleDelete = async (row) => {
    const confirmed = window.confirm(`Ban co chac muon xoa khoa "${row.tenkhoa}"?`);

    if (!confirmed) {
      return;
    }

    try {
      await deleteFacultyForView(row.id_khoa);
      await refreshAcademic();
      setError("");
    } catch (err) {
      setError(err.message || "Khong the xoa khoa.");
    }
  };

  return (
    <div className="stack-lg">
      <div className="toolbar">
        <div>
          <h2>Quản lý khoa</h2>
          <p>Quản lý danh sách khoa và tạo mới.</p>
        </div>
      </div>

      <div className="org-card">
        <h3>Tạo khoa</h3>
        <div className="split-2">
          <input
            value={tenkhoa}
            onChange={(event) => setTenkhoa(event.target.value)}
            placeholder="Tên khoa"
          />
          <button type="button" className="btn btn-primary" onClick={handleSubmit}>
            Thêm khoa
          </button>
        </div>
      </div>

      {error ? <p className="error-text">{error}</p> : null}

      {loading ? <p className="error-text">Dang tai du lieu...</p> : null}

      <KhoaTable rows={academicStructure.khoa} onEdit={handleEdit} onDelete={handleDelete} />
    </div>
  );
}

export default KhoaPage;