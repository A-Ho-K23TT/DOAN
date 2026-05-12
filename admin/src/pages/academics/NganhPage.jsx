import { useEffect, useMemo, useState } from "react";
import {
  createMajorForView,
  deleteMajorForView,
  getAcademicStructureForView,
  updateMajorForView,
} from "../../services/user.service";
import NganhTable from "../../components/academics/NganhTable";

function NganhPage() {
  const [academicStructure, setAcademicStructure] = useState({ khoa: [], nganh: [], lop: [] });
  const [form, setForm] = useState({ id_khoa: "", ten_nganh: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const loadAcademic = async () => {
    setLoading(true);

    try {
      setAcademicStructure(await getAcademicStructureForView());
    } catch (err) {
      setError(err.message || "Khong the tai danh sach nganh.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAcademic();
  }, []);

  const khoaById = useMemo(() => {
    return academicStructure.khoa.reduce((accumulator, item) => {
      accumulator[item.id_khoa] = item.tenkhoa;
      return accumulator;
    }, {});
  }, [academicStructure.khoa]);

  const rows = useMemo(() => {
    return academicStructure.nganh.map((item) => ({
      ...item,
      tenkhoa: khoaById[item.id_khoa] || "-",
    }));
  }, [academicStructure.nganh, khoaById]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!form.id_khoa || !form.ten_nganh.trim()) {
      setError("Vui long chon khoa va nhap ten nganh.");
      return;
    }

    try {
      await createMajorForView({
        ten_nganh: form.ten_nganh.trim(),
        id_khoa: Number(form.id_khoa),
        created_by: 1,
      });
      setForm({ id_khoa: "", ten_nganh: "" });
      await loadAcademic();
      setError("");
    } catch (err) {
      setError(err.message || "Khong the tao nganh.");
    }
  };

  const handleEdit = async (row) => {
    const nextName = window.prompt("Nhap ten nganh moi", row.ten_nganh);

    if (nextName === null) {
      return;
    }

    const normalizedName = nextName.trim();
    if (!normalizedName) {
      setError("Ten nganh khong duoc de trong.");
      return;
    }

    const nextFaculty = window.prompt("Nhap ID khoa", String(row.id_khoa || ""));

    if (nextFaculty === null) {
      return;
    }

    const idKhoa = Number(nextFaculty);
    if (!Number.isInteger(idKhoa) || idKhoa <= 0) {
      setError("ID khoa khong hop le.");
      return;
    }

    try {
      await updateMajorForView(row.id_nganh, {
        ten_nganh: normalizedName,
        id_khoa: idKhoa,
        created_by: row.created_by,
      });
      await loadAcademic();
      setError("");
    } catch (err) {
      setError(err.message || "Khong the cap nhat nganh.");
    }
  };

  const handleDelete = async (row) => {
    const confirmed = window.confirm(`Ban co chac muon xoa nganh \"${row.ten_nganh}\"?`);

    if (!confirmed) {
      return;
    }

    try {
      await deleteMajorForView(row.id_nganh);
      await loadAcademic();
      setError("");
    } catch (err) {
      setError(err.message || "Khong the xoa nganh.");
    }
  };

  return (
    <div className="stack-lg">
      <div className="toolbar">
        <div>
          <h2>Quan ly Nganh</h2>
          <p>Quan ly danh sach nganh va gan nganh voi khoa.</p>
        </div>
      </div>

      <div className="org-card">
        <h3>Tao nganh</h3>
        <div className="split-3">
          <select name="id_khoa" value={form.id_khoa} onChange={handleChange}>
            <option value="">Chon khoa</option>
            {academicStructure.khoa.map((item) => (
              <option key={item.id_khoa} value={item.id_khoa}>
                {item.tenkhoa}
              </option>
            ))}
          </select>
          <input name="ten_nganh" value={form.ten_nganh} onChange={handleChange} placeholder="Ten nganh" />
          <button type="button" className="btn btn-primary" onClick={handleSubmit}>
            Them nganh
          </button>
        </div>
      </div>

      {error ? <p className="error-text">{error}</p> : null}

      {loading ? <p className="error-text">Dang tai du lieu...</p> : null}

      <NganhTable rows={rows} onEdit={handleEdit} onDelete={handleDelete} />
    </div>
  );
}

export default NganhPage;