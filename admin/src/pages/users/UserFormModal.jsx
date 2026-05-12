import { useEffect, useMemo, useState } from "react";

const emptyForm = {
  hoten: "",
  tendangnhap: "",
  email: "",
  matkhau: "",
  vaitro: "sv",
  ngaysinh: "",
  gioitinh: "",
  mgv: "",
  hoc_vi: "",
  hoc_ham: "",
  gpa: "",
  diem_rl: "",
  id_khoa: "",
  id_nganh: "",
  id_lop: "",
  mssv: "",
};

function UserFormModal({ open, onClose, onSubmit, editingUser, initialForm, academicStructure }) {
  const [form, setForm] = useState(initialForm || emptyForm);
  const [step, setStep] = useState(1);
  const [createdUserId, setCreatedUserId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const title = useMemo(() => (editingUser ? "Cap nhat tai khoan" : "Them tai khoan"), [editingUser]);
  const isAdminRole = form.vaitro === "ad";

  const khoaOptions = academicStructure?.khoa || [];
  const lopOptions = useMemo(() => academicStructure?.lop || [], [academicStructure?.lop]);

  const selectedClass = useMemo(
    () => (academicStructure?.lop || []).find((item) => Number(item.id_lop) === Number(form.id_lop)) || null,
    [academicStructure?.lop, form.id_lop]
  );

  const selectedMajor = useMemo(
    () => (academicStructure?.nganh || []).find((item) => Number(item.id_nganh) === Number(selectedClass?.id_nganh)) || null,
    [academicStructure?.nganh, selectedClass?.id_nganh]
  );

  const selectedFaculty = useMemo(
    () => (academicStructure?.khoa || []).find((item) => Number(item.id_khoa) === Number(selectedMajor?.id_khoa)) || null,
    [academicStructure?.khoa, selectedMajor?.id_khoa]
  );

  useEffect(() => {
    setForm(initialForm || emptyForm);
    setStep(1);
    setCreatedUserId(null);
    setError("");
  }, [initialForm, open]);

  useEffect(() => {
    if (form.vaitro !== "sv" || !selectedClass || !selectedMajor) return;

    setForm((prev) => ({
      ...prev,
      id_nganh: String(selectedMajor.id_nganh),
      id_khoa: String(selectedMajor.id_khoa),
    }));
  }, [form.vaitro, selectedClass, selectedMajor]);

  if (!open) return null;

  const handleChange = (event) => {
    const { name, value } = event.target;

    if (name === "vaitro") {
      setForm((prev) => ({
        ...prev,
        vaitro: value,
        id_khoa: "",
        id_nganh: "",
        id_lop: "",
        mgv: "",
        hoc_vi: "",
        hoc_ham: "",
        gpa: "",
        diem_rl: "",
        mssv: prev.mssv || prev.tendangnhap,
      }));
      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validateStep1Add = () => {
    if (!form.hoten || !form.tendangnhap || !form.matkhau) {
      throw new Error("Vui long nhap cac truong bat buoc o buoc 1.");
    }
  };

  const validateStep1Edit = () => {
    // Không bắt buộc gì khi edit - admin có thể sửa bất kỳ trường nào
  };

  const validateStep2Add = () => {
    if (isAdminRole) {
      if (!form.mgv) throw new Error("Vui long nhap ma giang vien.");
      if (!form.id_khoa) throw new Error("Vui long chon khoa cho admin.");
      return;
    }

    if (!form.id_lop) throw new Error("Vui long chon lop cho sinh vien.");
    if (form.gpa === "" || form.diem_rl === "") {
      throw new Error("Vui long nhap GPA va diem ren luyen.");
    }
  };

  const validateStep2Edit = () => {
    // Không bắt buộc gì khi edit - admin có thể sửa bất kỳ trường nào
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");

      // Edit mode - Step 1: update basic user info
      if (editingUser && step === 1) {
        validateStep1Edit();

        const result = await onSubmit({
          action: "update-basic",
          data: {
            hoten: form.hoten,
            tendangnhap: form.tendangnhap,
            email: form.email,
            matkhau: form.matkhau || undefined,
            vaitro: form.vaitro,
            ngaysinh: form.ngaysinh,
            gioitinh: form.gioitinh,
          },
        });

        if (!result?.id) {
          throw new Error("Khong nhan duoc ID khi cap nhat buoc 1.");
        }

        setStep(2);
        return;
      }

      // Edit mode - Step 2: update profile
      if (editingUser && step === 2) {
        validateStep2Edit();

        await onSubmit({
          action: "update-profile",
          data: {
            vaitro: form.vaitro,
            mgv: form.mgv,
            hoc_vi: form.hoc_vi,
            hoc_ham: form.hoc_ham,
            id_khoa: form.id_khoa,
            id_lop: form.id_lop,
            mssv: form.mssv || form.tendangnhap,
            gpa: form.gpa,
            diem_rl: form.diem_rl,
          },
        });
        return;
      }

      // Add mode - Step 1: create basic user
      if (step === 1) {
        validateStep1Add();

        const created = await onSubmit({
          action: "create-basic",
          data: {
            hoten: form.hoten,
            tendangnhap: form.tendangnhap,
            email: form.email,
            matkhau: form.matkhau,
            vaitro: form.vaitro,
            ngaysinh: form.ngaysinh,
            gioitinh: form.gioitinh,
          },
        });

        if (!created?.id) {
          throw new Error("Khong nhan duoc ID nguoi dung sau buoc 1.");
        }

        setCreatedUserId(created.id);
        setStep(2);
        return;
      }

      // Add mode - Step 2: create profile
      validateStep2Add();

      await onSubmit({
        action: "create-profile",
        userId: createdUserId,
        data: {
          vaitro: form.vaitro,
          mgv: form.mgv,
          hoc_vi: form.hoc_vi,
          hoc_ham: form.hoc_ham,
          id_khoa: form.id_khoa,
          id_lop: form.id_lop,
          mssv: form.mssv || form.tendangnhap,
          gpa: form.gpa,
          diem_rl: form.diem_rl,
        },
      });
    } catch (err) {
      setError(err.message || "Thao tac that bai.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <div className="modal-card" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Dong
          </button>
        </div>

        <div className="step-badge">Buoc {step}/2</div>

        <form className="form-grid" onSubmit={handleSubmit}>
          {step === 1 ? (
            <>
              <label className="field">
                <span>Họ tên *</span>
                <input name="hoten" value={form.hoten} onChange={handleChange} />
              </label>

              <label className="field">
                <span>Tên đăng nhập *</span>
                <input
                  name="tendangnhap"
                  value={form.tendangnhap}
                  onChange={handleChange}
                  disabled={Boolean(editingUser) || step === 2}
                />
              </label>

              <label className="field">
                <span>Email</span>
                <input name="email" value={form.email} onChange={handleChange} />
              </label>

              <label className="field">
                <span>Mật khẩu {editingUser ? "(để trống nếu không đổi)" : "*"}</span>
                <input
                  name="matkhau"
                  type="password"
                  value={form.matkhau}
                  onChange={handleChange}
                  disabled={step === 2}
                />
              </label>

              <label className="field">
                <span>Vai trò</span>
                <select name="vaitro" value={form.vaitro} onChange={handleChange} disabled={step === 2}>
                  <option value="sv">Sinh viên</option>
                  <option value="ad">Admin</option>
                </select>
              </label>

              <label className="field">
                <span>Ngày sinh</span>
                <input name="ngaysinh" type="date" value={form.ngaysinh} onChange={handleChange} />
              </label>

              <label className="field">
                <span>Giới tính</span>
                <select name="gioitinh" value={form.gioitinh} onChange={handleChange}>
                  <option value="">Chọn</option>
                  <option value="nam">Nam</option>
                  <option value="nu">Nữ</option>
                </select>
              </label>
            </>
          ) : null}

          {step === 2 && isAdminRole ? (
            <>
              <label className="field">
                <span>Mã giảng viên *</span>
                <input name="mgv" value={form.mgv} onChange={handleChange} />
              </label>

              <label className="field">
                <span>Khoa *</span>
                <select name="id_khoa" value={form.id_khoa} onChange={handleChange}>
                  <option value="">Chọn khoa</option>
                  {khoaOptions.map((item) => (
                    <option key={item.id_khoa} value={item.id_khoa}>
                      {item.tenkhoa}
                    </option>
                  ))}
                </select>
              </label>

              <label className="field">
                <span>Học vị</span>
                <input name="hoc_vi" value={form.hoc_vi} onChange={handleChange} />
              </label>

              <label className="field">
                <span>Học hàm</span>
                <input name="hoc_ham" value={form.hoc_ham} onChange={handleChange} />
              </label>
            </>
          ) : null}

          {step === 2 && !isAdminRole ? (
            <>
              <label className="field">
                <span>Lớp *</span>
                <select name="id_lop" value={form.id_lop} onChange={handleChange}>
                  <option value="">Chọn lớp</option>
                  {lopOptions.map((item) => (
                    <option key={item.id_lop} value={item.id_lop}>
                      {item.tenlop}
                    </option>
                  ))}
                </select>
              </label>

              <label className="field">
                <span>Ngành</span>
                <input value={selectedMajor?.ten_nganh || ""} readOnly placeholder="Tự động theo lớp" />
              </label>

              <label className="field">
                <span>Khoa</span>
                <input value={selectedFaculty?.tenkhoa || ""} readOnly placeholder="Tự động theo lớp" />
              </label>

              <label className="field">
                <span>MSSV</span>
                <input name="mssv" value={form.mssv} onChange={handleChange} placeholder="Mặc định = tên đăng nhập" />
              </label>

              <label className="field">
                <span>GPA *</span>
                <input name="gpa" type="number" min="0" max="4" step="0.01" value={form.gpa} onChange={handleChange} />
              </label>

              <label className="field">
                <span>Điểm rèn luyện *</span>
                <input
                  name="diem_rl"
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  value={form.diem_rl}
                  onChange={handleChange}
                />
              </label>
            </>
          ) : null}

          {error ? <p className="error-text grid-full">{error}</p> : null}

          <div className="modal-actions">
            {step === 2 ? (
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => {
                  setStep(1);
                  setError("");
                }}
                disabled={saving}
              >
                Quay lại
              </button>
            ) : null}

            <button type="submit" className="btn btn-primary" disabled={saving}>
              {step === 1 ? "Tiếp tục" : editingUser ? "Lưu thay đổi" : "Hoàn tất"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default UserFormModal;
