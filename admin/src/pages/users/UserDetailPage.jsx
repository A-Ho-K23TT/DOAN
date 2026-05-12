import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  deleteUserAccount,
  getAcademicStructureForView,
  getUserByIdForView,
  setAccountVisibility,
  setUserRole,
  updateUserAccount,
} from "../../services/user.service";
import UserFormModal from "./UserFormModal";

function DetailRow({ label, value }) {
  return (
    <div>
      <strong>{label}:</strong> {value || "-"}
    </div>
  );
}

export default function UserDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [academicStructure, setAcademicStructure] = useState({ khoa: [], nganh: [], lop: [] });
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadData = async () => {
    setLoading(true);
    setError("");

    try {
      const [nextUser, nextAcademic] = await Promise.all([getUserByIdForView(id), getAcademicStructureForView()]);
      setUser(nextUser);
      setAcademicStructure(nextAcademic);
    } catch (err) {
      setError(err.message || "Khong the tai chi tiet nguoi dung.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const initialForm = useMemo(() => {
    if (!user) {
      return {
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
    }

    return {
      hoten: user.fullName,
      tendangnhap: user.username,
      email: user.email,
      matkhau: "",
      vaitro: user.role,
      ngaysinh: user.birthday || "",
      gioitinh: user.gender || "",
      mgv: user.adminProfile?.mgv || "",
      hoc_vi: user.adminProfile?.hoc_vi || "",
      hoc_ham: user.adminProfile?.hoc_ham || "",
      gpa: user.studentProfile?.gpa !== undefined ? String(user.studentProfile.gpa ?? "") : "",
      diem_rl: user.studentProfile?.diem_rl !== undefined ? String(user.studentProfile.diem_rl ?? "") : "",
      id_khoa: user.role === "ad"
        ? (user.adminProfile?.id_khoa ? String(user.adminProfile.id_khoa) : "")
        : (user.studentAcademic?.id_khoa ? String(user.studentAcademic.id_khoa) : ""),
      id_nganh: user.studentAcademic?.id_nganh ? String(user.studentAcademic.id_nganh) : "",
      id_lop: user.studentAcademic?.id_lop ? String(user.studentAcademic.id_lop) : "",
      mssv: user.studentProfile?.mssv || user.username,
    };
  }, [user]);

  if (loading) {
    return (
      <div className="stack-lg">
        <div className="toolbar">
          <div>
            <h2>Chi tiết người dùng</h2>
            <p>Đang tải dữ liệu...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="stack-lg">
        <div className="toolbar">
          <div>
            <h2>Chi tiết người dùng</h2>
            <p>Không tìm thấy dữ liệu.</p>
          </div>
          <Link to="/admin/users" className="btn btn-ghost btn-mini">
            Quay lại danh sách
          </Link>
        </div>
      </div>
    );
  }

  const handleEdit = () => {
    setShowModal(true);
  };

  const handleSubmit = async (form) => {
    await updateUserAccount(user.id, form);
    await loadData();
    setShowModal(false);
  };

  const handleToggleVisibility = async () => {
    await setAccountVisibility(user.id, !user.isVisible);
    await loadData();
  };

  const handleChangeRole = async () => {
    const nextRole = user.role === "ad" ? "sv" : "ad";
    await setUserRole(user.id, nextRole);
    await loadData();
  };

  const handleDelete = async () => {
    if (!window.confirm(`Xoa tai khoan ${user.username}?`)) return;
    await deleteUserAccount(user.id);
    navigate("/admin/users");
  };

  return (
    <div className="stack-lg">
      <div className="toolbar">
        <div>
          <h2>Chi tiết người dùng: {user.fullName}</h2>
          <p>{user.infoText || "Chưa có thông tin bổ sung"}</p>
        </div>
        <Link to="/admin/users" className="btn btn-ghost btn-mini">
          Quay lại danh sách
        </Link>
      </div>

      <div className="org-card stack-lg">
        {/* Common fields for all users */}
        <div className="detail-section">
          <h3 style={{ marginTop: 0, marginBottom: "12px", fontSize: "16px", fontWeight: "600" }}>Thông tin cơ bản</h3>
          <div className="split-3">
            <DetailRow label="ID" value={user.id} />
            <DetailRow label="Họ tên" value={user.fullName} />
            <DetailRow label="Tên đăng nhập" value={user.username} />
            <DetailRow label="Email" value={user.email || "-"} />
            <DetailRow label="Mật khẩu" value={user.password ? "***" : "-"} />
            <DetailRow label="Vai trò" value={user.roleText} />
            <DetailRow label="Ngày sinh" value={user.birthday || "-"} />
            <DetailRow label="Giới tính" value={user.gender ? (user.gender === "nam" ? "Nam" : "Nữ") : "-"} />
            <DetailRow label="Trạng thái" value={user.isVisible ? "Hoạt động" : "Bị khóa"} />
          </div>
        </div>

        {/* Student-specific fields */}
        {user.role === "sv" && user.studentProfile && (
          <div className="detail-section">
            <h3 style={{ marginTop: "24px", marginBottom: "12px", fontSize: "16px", fontWeight: "600" }}>
              Thông tin sinh viên
            </h3>
            <div className="split-3">
              <DetailRow label="MSSV" value={user.studentProfile.mssv || "-"} />
              <DetailRow label="GPA" value={user.studentProfile.gpa !== null && user.studentProfile.gpa !== undefined ? user.studentProfile.gpa.toFixed(2) : "-"} />
              <DetailRow label="Điểm rèn luyện" value={user.studentProfile.diem_rl || "-"} />
            </div>
          </div>
        )}

        {/* Academic structure for students */}
        {user.role === "sv" && user.studentAcademic && (
          <div className="detail-section">
            <h3 style={{ marginTop: "24px", marginBottom: "12px", fontSize: "16px", fontWeight: "600" }}>
              Thông tin học tập
            </h3>
            <div className="split-3">
              <DetailRow label="Khoa" value={user.studentAcademic.tenkhoa || "-"} />
              <DetailRow label="Ngành" value={user.studentAcademic.ten_nganh || "-"} />
              <DetailRow label="Lớp" value={user.studentAcademic.tenlop || "-"} />
            </div>
          </div>
        )}

        {/* Admin-specific fields */}
        {user.role === "ad" && user.adminProfile && (
          <div className="detail-section">
            <h3 style={{ marginTop: "24px", marginBottom: "12px", fontSize: "16px", fontWeight: "600" }}>
              Thông tin giảng viên
            </h3>
            <div className="split-3">
              <DetailRow label="Mã giảng viên (MGV)" value={user.adminProfile.mgv || "-"} />
              <DetailRow label="Học vị" value={user.adminProfile.hoc_vi || "-"} />
              <DetailRow label="Học hàm" value={user.adminProfile.hoc_ham || "-"} />
              <DetailRow label="Khoa" value={user.adminProfile.tenkhoa || "-"} />
            </div>
          </div>
        )}

        <div className="row-actions">
          <button type="button" className="btn btn-mini" onClick={handleEdit}>
            Sửa
          </button>
          <button type="button" className="btn btn-mini" onClick={handleToggleVisibility}>
            {user.isVisible ? "Khoa" : "Mở khóa"}
          </button>
          <button type="button" className="btn btn-mini" onClick={handleChangeRole}>
            Đổi quyền
          </button>
          <button type="button" className="btn btn-danger btn-mini" onClick={handleDelete}>
            Xóa
          </button>
        </div>
      </div>

      <UserFormModal
        key={`detail-edit-${user.id}`}
        open={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleSubmit}
        editingUser={user}
        initialForm={initialForm}
        academicStructure={academicStructure}
      />
    </div>
  );
}