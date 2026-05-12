import { useEffect, useMemo, useState } from "react";
import {
  createClassForView,
  deleteClassForView,
  getAcademicStructureForView,
  updateClassForView,
} from "../../services/user.service";
import LopTable from "../../components/academics/LopTable";

function LopPage() {
  const [academicStructure, setAcademicStructure] = useState({ khoa: [], nganh: [], lop: [] });
  const [form, setForm] = useState({ id_khoa: "", id_nganh: "", tenlop: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const loadAcademic = async () => {
    setLoading(true);

    try {
      setAcademicStructure(await getAcademicStructureForView());
    } catch (err) {
      setError(err.message || "Khong the tai danh sach lop.");
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

  const nganhById = useMemo(() => {
    return academicStructure.nganh.reduce((accumulator, item) => {
      accumulator[item.id_nganh] = item;
      return accumulator;
    }, {});
  }, [academicStructure.nganh]);

  const nganhOptions = useMemo(() => {
    if (!form.id_khoa) return [];
    return academicStructure.nganh.filter((item) => Number(item.id_khoa) === Number(form.id_khoa));
  }, [academicStructure.nganh, form.id_khoa]);

  const rows = useMemo(() => {
    return academicStructure.lop.map((item) => {
      const nganh = nganhById[item.id_nganh];
      return {
        ...item,
        ten_nganh: nganh?.ten_nganh || "-",
        tenkhoa: nganh ? khoaById[nganh.id_khoa] || "-" : "-",
      };
    });
  }, [academicStructure.lop, nganhById, khoaById]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    if (name === "id_khoa") {
      setForm((prev) => ({ ...prev, id_khoa: value, id_nganh: "" }));
      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!form.id_khoa || !form.id_nganh || !form.tenlop.trim()) {
      setError("Vui long chon khoa, nganh va nhap ten lop.");
      return;
    }

    try {
      await createClassForView({
        tenlop: form.tenlop.trim(),
        id_nganh: Number(form.id_nganh),
        created_by: 1,
      });
      setForm({ id_khoa: "", id_nganh: "", tenlop: "" });
      await loadAcademic();
      setError("");
    } catch (err) {
      setError(err.message || "Khong the tao lop.");
    }
  };

  const handleEdit = async (row) => {
    const nextName = window.prompt("Nhap ten lop moi", row.tenlop);

    if (nextName === null) {
      return;
    }

    const normalizedName = nextName.trim();
    if (!normalizedName) {
      setError("Ten lop khong duoc de trong.");
      return;
    }

    const nextMajor = window.prompt("Nhap ID nganh", String(row.id_nganh || ""));

    if (nextMajor === null) {
      return;
    }

    const idNganh = Number(nextMajor);
    if (!Number.isInteger(idNganh) || idNganh <= 0) {
      setError("ID nganh khong hop le.");
      return;
    }

    try {
      await updateClassForView(row.id_lop, {
        tenlop: normalizedName,
        id_nganh: idNganh,
        created_by: row.created_by,
      });
      await loadAcademic();
      setError("");
    } catch (err) {
      setError(err.message || "Khong the cap nhat lop.");
    }
  };

  const handleDelete = async (row) => {
    const confirmed = window.confirm(`Ban co chac muon xoa lop \"${row.tenlop}\"?`);

    if (!confirmed) {
      return;
    }

    try {
      await deleteClassForView(row.id_lop);
      await loadAcademic();
      setError("");
    } catch (err) {
      setError(err.message || "Khong the xoa lop.");
    }
  };

  return (
    <div className="stack-lg">
      <div className="toolbar">
        <div>
          <h2>Quan ly Lop</h2>
          <p>Quan ly danh sach lop va gan lop voi nganh.</p>
        </div>
      </div>

      <div className="org-card">
        <h3>Tao lop</h3>
        <div className="split-3">
          <select name="id_khoa" value={form.id_khoa} onChange={handleChange}>
            <option value="">Chon khoa</option>
            {academicStructure.khoa.map((item) => (
              <option key={item.id_khoa} value={item.id_khoa}>
                {item.tenkhoa}
              </option>
            ))}
          </select>
          <select name="id_nganh" value={form.id_nganh} onChange={handleChange} disabled={!form.id_khoa}>
            <option value="">Chon nganh</option>
            {nganhOptions.map((item) => (
              <option key={item.id_nganh} value={item.id_nganh}>
                {item.ten_nganh}
              </option>
            ))}
          </select>
          <input name="tenlop" value={form.tenlop} onChange={handleChange} placeholder="Ten lop" />
        </div>
        <div className="modal-actions" style={{ marginTop: "0.75rem" }}>
          <button type="button" className="btn btn-primary" onClick={handleSubmit}>
            Them lop
          </button>
        </div>
      </div>

      {error ? <p className="error-text">{error}</p> : null}

      {loading ? <p className="error-text">Dang tai du lieu...</p> : null}

      <LopTable rows={rows} onEdit={handleEdit} onDelete={handleDelete} />
    </div>
  );
}

export default LopPage;