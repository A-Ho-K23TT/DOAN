import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useScholarship } from "../context/ScholarshipContext";

function ChangePassword() {
  const navigate = useNavigate();
  const { changePassword } = useScholarship();

  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    setError("");

    if (form.newPassword.length < 6) {
      setError("Mat khau moi phai co it nhat 6 ky tu");
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      setError("Xac nhan mat khau khong khop");
      return;
    }

    const ok = changePassword(form.currentPassword, form.newPassword);
    if (!ok) return;

    navigate("/profile");
  };

  return (
    <section className="narrow-card">
      <h1>Đổi mật khẩu</h1>

      <form className="form-stack" onSubmit={handleSubmit}>
        <label className="field">
          <span>Mật khẩu hiện tại</span>
          <input
            type="password"
            value={form.currentPassword}
            onChange={(event) => setForm((prev) => ({ ...prev, currentPassword: event.target.value }))}
            required
          />
        </label>

        <label className="field">
          <span>Mật khẩu mới</span>
          <input
            type="password"
            value={form.newPassword}
            onChange={(event) => setForm((prev) => ({ ...prev, newPassword: event.target.value }))}
            required
          />
        </label>

        <label className="field">
          <span>Xác nhận mật khẩu mới</span>
          <input
            type="password"
            value={form.confirmPassword}
            onChange={(event) => setForm((prev) => ({ ...prev, confirmPassword: event.target.value }))}
            required
          />
        </label>

        {error ? <p className="error-text">{error}</p> : null}

        <button type="submit" className="btn btn-primary">
          Cập nhật mật khẩu
        </button>
      </form>
    </section>
  );
}

export default ChangePassword;
