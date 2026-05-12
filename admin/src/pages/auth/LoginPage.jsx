import { useState } from "react";

const defaultForm = {
  username: "admin@kontum.udn.vn",
  password: "admin123",
};

function LoginPage({ onLogin }) {
  const [form, setForm] = useState(defaultForm);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await onLogin(form.username, form.password);
      setError("");
    } catch (err) {
      setError(err.message || "Dang nhap that bai.");
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <p className="login-kicker">Quản lý học bổng sinh viên</p>
        <h1>Đăng nhập hệ thống admin</h1>
        <p className="login-hint">Tài khoản mẫu: admin@kontum.udn.vn / admin123</p>

        <form onSubmit={handleSubmit} className="form-stack">
          <label className="field">
            <span>Tên đăng nhập</span>
            <input
              name="username"
              value={form.username}
              onChange={handleChange}
              placeholder="Nhap email admin"
              autoComplete="username"
            />
          </label>

          <label className="field">
            <span>Mật khẩu</span>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Nhap mat khau"
              autoComplete="current-password"
            />
          </label>

          {error ? <p className="error-text">{error}</p> : null}
          <button type="submit" className="btn btn-primary">Đăng nhập</button>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
