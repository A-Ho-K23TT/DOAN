import { useEffect, useState } from "react";

const normalizeDateValue = (value) => {
  if (!value) {
    return "";
  }

  if (typeof value === "string") {
    return value.length >= 10 ? value.slice(0, 10) : value;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toISOString().slice(0, 10);
};

// ScholarshipFormModal: Form tao/sua hoc bong trong modal.
function ScholarshipFormModal({ open, onClose, onSubmit, editingScholarship, loading }) {
  const [form, setForm] = useState({
    tenhb: "",
    mota: "",
    giatri: "",
    han: "",
    doituong: "",
    soluong: "",
    trangthai: "dang_mo",
  });

  // Dong bo du lieu khi chuyen sang edit mode.
  useEffect(() => {
    if (!editingScholarship) {
      setForm({
        tenhb: "",
        mota: "",
        giatri: "",
        han: "",
        doituong: "",
        soluong: "",
        trangthai: "dang_mo",
      });
      return;
    }

    setForm({
      tenhb: editingScholarship.name || "",
      mota: editingScholarship.description || "",
      giatri: editingScholarship.value ?? "",
      han: normalizeDateValue(editingScholarship.deadline || editingScholarship.han),
      doituong: editingScholarship.targetGroup || "",
      soluong: editingScholarship.quantity ?? "",
      trangthai: editingScholarship.dbStatus || "dang_mo",
    });
  }, [editingScholarship, open]);

  // handleChange: Cap nhat state form theo input.
  const handleChange = (key, value) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // handleSubmit: Gui form len page cha de create/update.
  const handleSubmit = (event) => {
    event.preventDefault();

    onSubmit({
      ...form,
      tenhb: form.tenhb.trim(),
      mota: form.mota.trim(),
      doituong: form.doituong.trim(),
      han: normalizeDateValue(form.han),
      giatri: form.giatri === "" ? "" : Number(form.giatri),
      soluong: form.soluong === "" ? "" : Number(form.soluong),
      trangthai: form.trangthai,
    });
  };

  if (!open) return null;

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal-card">
        <div className="modal-header">
          <h3>{editingScholarship ? "Cập nhật học bổng" : "Tạo học bổng"}</h3>
          <button type="button" className="btn btn-mini" onClick={onClose}>
            Đóng
          </button>
        </div>

        <form className="form-stack" onSubmit={handleSubmit}>
          <label className="field">
            <span>Tên học bổng</span>
            <input
              value={form.tenhb}
              onChange={(event) => handleChange("tenhb", event.target.value)}
              placeholder="Nhập tên học bổng"
              required
            />
          </label>

          <label className="field">
            <span>Mô tả</span>
            <textarea
              value={form.mota}
              onChange={(event) => handleChange("mota", event.target.value)}
              placeholder="Mô tả ngắn"
              rows={3}
            />
          </label>

          <div className="split-2">
            <label className="field">
              <span>Giá trị (VND)</span>
              <input
                type="number"
                min="0"
                value={form.giatri}
                onChange={(event) => handleChange("giatri", event.target.value)}
                placeholder="5000000"
                required
              />
            </label>

            <label className="field">
              <span>Hạn nộp</span>
              <input
                type="date"
                value={form.han}
                onChange={(event) => handleChange("han", event.target.value)}
                required
              />
            </label>
          </div>

          <div className="split-2">
            <label className="field">
              <span>Số lượng</span>
              <input
                type="number"
                min="0"
                value={form.soluong}
                onChange={(event) => handleChange("soluong", event.target.value)}
              />
            </label>

            <label className="field">
              <span>Trạng thái DB</span>
              <select
                value={form.trangthai}
                onChange={(event) => handleChange("trangthai", event.target.value)}
              >
                <option value="dang_mo">Đang mở</option>
                <option value="da_dong">Đã đóng</option>
              </select>
            </label>
          </div>

          <label className="field">
            <span>Đối tượng</span>
            <input
              value={form.doituong}
              onChange={(event) => handleChange("doituong", event.target.value)}
              placeholder="Sinh viên nam 2 trở lên"
            />
          </label>

          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose} disabled={loading}>
              Hủy
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Đang lưu..." : editingScholarship ? "Cập nhật" : "Tạo mới"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ScholarshipFormModal;
