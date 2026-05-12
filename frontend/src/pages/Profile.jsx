import { Link } from "react-router-dom";
import { useScholarship } from "../context/ScholarshipContext";

function Profile() {
  const { currentUser } = useScholarship();

  if (!currentUser) return null;

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN");
  };

  const getGenderText = (gender) => {
    if (gender === "nam") return "Nam";
    if (gender === "nu") return "Nữ";
    return "-";
  };

  const getStatusText = (status) => {
    if (status === 1) return "Hoạt động";
    if (status === 0) return "Vô hiệu";
    return "-";
  };

  return (
    <section className="profile-container stack-lg">
      <div className="profile-header">
        <h1>Chi tiết người dùng: {currentUser.hoten}</h1>
        <p className="profile-breadcrumb">
          {currentUser.studentAcademic?.tenkhoa || "N/A"} / 
          {currentUser.studentAcademic?.ten_nganh || "N/A"} / 
          {currentUser.tendangnhap}
        </p>
      </div>

      <div className="profile-section">
        <h3>Thông tin cơ bản</h3>
        <div className="info-grid">
          <div className="info-item">
            <span className="label">ID:</span>
            <span className="value">{currentUser.id_nd}</span>
          </div>
          <div className="info-item">
            <span className="label">Họ tên:</span>
            <span className="value">{currentUser.hoten}</span>
          </div>
          <div className="info-item">
            <span className="label">Email:</span>
            <span className="value">{currentUser.email || "-"}</span>
          </div>
          <div className="info-item">
            <span className="label">Mật khẩu:</span>
            <span className="value">***</span>
          </div>
          <div className="info-item">
            <span className="label">Tên đăng nhập:</span>
            <span className="value">{currentUser.tendangnhap}</span>
          </div>
          <div className="info-item">
            <span className="label">Vai trò:</span>
            <span className="value">Sinh viên</span>
          </div>
          <div className="info-item">
            <span className="label">Ngày sinh:</span>
            <span className="value">{formatDate(currentUser.ngaysinh)}</span>
          </div>
          <div className="info-item">
            <span className="label">Giới tính:</span>
            <span className="value">{getGenderText(currentUser.gioitinh)}</span>
          </div>
          <div className="info-item">
            <span className="label">Trạng thái:</span>
            <span className="value">{getStatusText(currentUser.trangthai)}</span>
          </div>
        </div>
      </div>

      {currentUser.studentProfile && (
        <div className="profile-section">
          <h3>Thông tin sinh viên</h3>
          <div className="info-grid">
            <div className="info-item">
              <span className="label">MSSV:</span>
              <span className="value">{currentUser.studentProfile.mssv}</span>
            </div>
            <div className="info-item">
              <span className="label">GPA:</span>
              <span className="value">{currentUser.studentProfile.gpa}</span>
            </div>
            <div className="info-item">
              <span className="label">Điểm rèn luyện:</span>
              <span className="value">{currentUser.studentProfile.diem_rl}</span>
            </div>
          </div>
        </div>
      )}

      {currentUser.studentAcademic && (
        <div className="profile-section">
          <h3>Thông tin học tập</h3>
          <div className="info-grid">
            <div className="info-item">
              <span className="label">Khoa:</span>
              <span className="value">{currentUser.studentAcademic.tenkhoa || "-"}</span>
            </div>
            <div className="info-item">
              <span className="label">Ngành:</span>
              <span className="value">{currentUser.studentAcademic.ten_nganh || "-"}</span>
            </div>
            <div className="info-item">
              <span className="label">Lớp:</span>
              <span className="value">{currentUser.studentAcademic.tenlop || "-"}</span>
            </div>
          </div>
        </div>
      )}

      <div className="profile-actions">
        <Link to="/change-password" className="btn btn-primary">
          Đổi mật khẩu
        </Link>
      </div>
    </section>
  );
}

export default Profile;
