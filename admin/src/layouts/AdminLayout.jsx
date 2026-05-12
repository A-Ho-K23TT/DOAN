import { NavLink } from "react-router-dom";
import { useLocation } from "react-router-dom";

// AdminLayout.jsx: Khung layout chung cho toan bo trang admin.
const navItems = [
  { to: "/admin", label: "Tổng quan" },
  { to: "/admin/users", label: "Quản lý người dùng" },
  { to: "/admin/academics/khoa", label: "Quản lý Khoa" },
  { to: "/admin/academics/nganh", label: "Quản lý Ngành" },
  { to: "/admin/academics/lop", label: "Quản lý Lớp" },
  { to: "/admin/scholarships", label: "Quản lý học bổng" },
  { to: "/admin/applications", label: "Hồ sơ đăng ký" },
];

// AdminLayout: Render sidebar, topbar va noi dung ben trong.
function AdminLayout({ session, onLogout, children }) {
  const location = useLocation();
  const isFormBuilderPage = location.pathname.includes("/form-builder");

  return (
    <div className="app-shell">
      <aside className="side-panel">
        <div className="brand-block">
          <p className="brand-kicker">QLHB Admin</p>
          <h1>Quản lý học bổng</h1>
          <p className="brand-subtitle">Hệ thống quản trị sinh viên và tài khoản</p>
        </div>

        <nav className="main-nav" aria-label="Điều hướng chính">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `nav-item ${isActive ? "nav-item-active" : ""}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <main className="main-panel">
        <header className="topbar">
          <div>
            <p className="topbar-title">Xin chào, {session.profile.hoten}</p>
            <p className="topbar-subtitle">Vai trò: Admin</p>
          </div>
          <button type="button" className="btn btn-ghost" onClick={onLogout}>
            Đăng xuất
          </button>
        </header>
        <section className={isFormBuilderPage ? "builder-shell" : "content-panel"}>{children}</section>
      </main>
    </div>
  );
}

export default AdminLayout;
