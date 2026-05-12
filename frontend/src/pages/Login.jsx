import { useState } from "react";
import { useScholarship } from "../context/ScholarshipContext";


function Login() {
  const { login } = useScholarship();
  const [form, setForm] = useState({ tendangnhap: "", matkhau: "" });

  const handleSubmit = (event) => {
    event.preventDefault();
    login(form);
  };

  return (
    <div className="narrow-card stack-md">
      <div>
        <h1>Đăng nhập sinh viên</h1>
        <p className="muted">Su dung tên đăng nhập va mat khau da duoc cap.</p>
      </div>

      {/* Sample accounts removed to hide demo credentials */}

      <form className="form-stack" onSubmit={handleSubmit}>
        <label className="field">
          <span>Tên Đăng nhập</span>
          <input
            value={form.tendangnhap}
            onChange={(event) => setForm((prev) => ({ ...prev, tendangnhap: event.target.value }))}
            placeholder="VD: aphuc.k23tt"
            required
          />
        </label>

        <label className="field">
          <span>Mật khẩu</span>
          <input
            type="password"
            value={form.matkhau}
            onChange={(event) => setForm((prev) => ({ ...prev, matkhau: event.target.value }))}
            placeholder="Nhap mat khau"
            required
          />
        </label>

        <button type="submit" className="btn btn-primary">
          Đăng nhập
        </button>
      </form>
    </div>
  );
}

export default Login;
