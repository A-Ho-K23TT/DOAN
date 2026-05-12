import { Link } from "react-router-dom";
import { useScholarship } from "../context/ScholarshipContext";

function Navbar() {
  const { currentUser, logout } = useScholarship();

  return (
    <header className="topbar-wrap">
      <div className="topbar">
        <Link to="/" className="brand">
          Học bổng sinh viên
        </Link>

      <div className="topbar-user">
        {!currentUser ? (
          <Link to="/login" className="btn btn-primary btn-small">
            Đăng nhập
          </Link>
        ) : (
          <>
            <div className="user-pill">
              <strong>{currentUser.hoten}</strong>
              <span>MSSV: {currentUser.studentProfile?.mssv}</span>
            </div>
            <Link to="/profile" className="btn btn-ghost btn-small">
              Hồ sơ
            </Link>
            <button type="button" className="btn btn-danger btn-small" onClick={logout}>
              Đăng xuất
            </button>
          </>
        )}
      </div>
      </div>
    </header>
  );
}

export default Navbar;
