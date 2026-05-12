import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  createUserAccountBasic,
  createUserRoleProfile,
  deleteUserAccount,
  getAcademicStructureForView,
  getUsersForView,
  setAccountVisibility,
  setUserRole,
  updateUserAccount,
  updateUserRoleProfile,
} from "../../services/user.service";
import UserFormModal from "./UserFormModal";

function UserManagementPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [users, setUsers] = useState([]);
  const [academicStructure, setAcademicStructure] = useState({ khoa: [], nganh: [], lop: [] });
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [error, setError] = useState("");

  const loadData = async () => {
    setLoading(true);
    setError("");

    try {
      const [nextUsers, nextAcademic] = await Promise.all([getUsersForView(), getAcademicStructureForView()]);
      setUsers(nextUsers);
      setAcademicStructure(nextAcademic);
    } catch (err) {
      setError(err.message || "Khong the tai danh sach nguoi dung.");
    } finally {
      setLoading(false);
    }
  };

  const initialForm = useMemo(() => {
    if (!editingUser) {
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
      hoten: editingUser.fullName,
      tendangnhap: editingUser.username,
      email: editingUser.email,
      matkhau: "",
      vaitro: editingUser.role,
      ngaysinh: editingUser.birthday || "",
      gioitinh: editingUser.gender || "",
      mgv: editingUser.adminProfile?.mgv || "",
      hoc_vi: editingUser.adminProfile?.hoc_vi || "",
      hoc_ham: editingUser.adminProfile?.hoc_ham || "",
      gpa: editingUser.studentProfile?.gpa !== undefined ? String(editingUser.studentProfile.gpa ?? "") : "",
      diem_rl: editingUser.studentProfile?.diem_rl !== undefined ? String(editingUser.studentProfile.diem_rl ?? "") : "",
      id_khoa: editingUser.role === "ad"
        ? (editingUser.adminProfile?.id_khoa ? String(editingUser.adminProfile.id_khoa) : "")
        : (editingUser.studentAcademic?.id_khoa ? String(editingUser.studentAcademic.id_khoa) : ""),
      id_nganh: editingUser.studentAcademic?.id_nganh ? String(editingUser.studentAcademic.id_nganh) : "",
      id_lop: editingUser.studentAcademic?.id_lop ? String(editingUser.studentAcademic.id_lop) : "",
      mssv: editingUser.studentProfile?.mssv || editingUser.username,
    };
  }, [editingUser]);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchKeyword =
        user.fullName.toLowerCase().includes(keyword.toLowerCase()) ||
        user.username.toLowerCase().includes(keyword.toLowerCase()) ||
        user.email.toLowerCase().includes(keyword.toLowerCase());

      const matchRole = roleFilter === "all" ? true : user.role === roleFilter;
      return matchKeyword && matchRole;
    });
  }, [users, keyword, roleFilter]);

  const refreshAll = async () => {
    await loadData();
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const editUserId = location.state?.editUserId;
    if (!editUserId || !users.length) return;

    const target = users.find((user) => Number(user.id) === Number(editUserId)) || null;
    if (target) {
      setEditingUser(target);
      setShowModal(true);
    }

    navigate("/admin/users", { replace: true });
  }, [location.state, users, navigate]);

  const handleCreate = () => {
    setEditingUser(null);
    setShowModal(true);
  };

  const handleEdit = (user) => {
    if (!user) return;
    setEditingUser(user);
    setShowModal(true);
  };

  const handleSubmit = async (form) => {
    // Step 1 of adding new account
    if (form?.action === "create-basic") {
      const created = await createUserAccountBasic(form.data || {});
      return created;
    }

    // Step 2 of adding new account
    if (form?.action === "create-profile") {
      await createUserRoleProfile(form.userId, form.data || {});
      await refreshAll();
      setShowModal(false);
      setEditingUser(null);
      return null;
    }

    // Step 1 of editing account
    if (form?.action === "update-basic") {
      await updateUserAccount(editingUser.id, form.data || {});
      return { id: editingUser.id };
    }

    // Step 2 of editing account
    if (form?.action === "update-profile") {
      await updateUserRoleProfile(editingUser.id, form.data || {});
      await refreshAll();
      setShowModal(false);
      setEditingUser(null);
      return null;
    }

    // Backward compatibility for old form without action (should not happen with new UI)
    if (editingUser) {
      await updateUserAccount(editingUser.id, form);
      await refreshAll();
      setShowModal(false);
      setEditingUser(null);
      return null;
    }

    return null;
  };

  const handleToggleVisibility = async (user) => {
    await setAccountVisibility(user.id, !user.isVisible);
    await refreshAll();
  };

  const handleChangeRole = async (user) => {
    const nextRole = user.role === "ad" ? "sv" : "ad";
    await setUserRole(user.id, nextRole);
    await refreshAll();
  };

  const handleDelete = async (user) => {
    if (!window.confirm(`Xoa tai khoan ${user.username}?`)) return;
    await deleteUserAccount(user.id);
    await refreshAll();
  };

  return (
    <div className="stack-lg">
      <div className="toolbar">
        <div>
          <h2>Quản lý người dùng</h2>
          <p>Thêm, sửa, xóa, khóa tài khoản và phân quyền sv/ad</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={handleCreate}>
          Thêm tài khoản
        </button>
      </div>

      <div className="filters">
        <input
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          placeholder="Tim theo ten, username, email"
        />
        <select value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)}>
          <option value="all">Tất cả vai trò</option>
          <option value="ad">Admin</option>
          <option value="sv">Sinh viên</option>
        </select>
      </div>

      {error ? <p className="error-text">{error}</p> : null}

      <div className="table-wrap">
        <table className="user-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Họ tên</th>
              <th>Tên đăng nhập</th>
              <th>Email</th>
              <th>Vai trò</th>
              <th>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="empty-row">
                  Dang tai du lieu...
                </td>
              </tr>
            ) : filteredUsers.map((user) => (
              <tr
                key={user.id}
                onClick={() => navigate(`/admin/users/${user.id}`)}
                style={{ cursor: "pointer" }}
              >
                <td>{user.id}</td>
                <td>{user.fullName}</td>
                <td>{user.username}</td>
                <td>{user.email || "-"}</td>
                <td>{user.roleText}</td>
                <td>
                  <span className={`status-pill ${user.isVisible ? "active" : "hidden"}`}>
                    {user.isVisible ? "Hoạt động" : "Bị khóa"}
                  </span>
                </td>
              </tr>
            ))}
            {!loading && !filteredUsers.length ? (
              <tr>
                <td colSpan="6" className="empty-row">
                  Không có dữ liệu phù hợp.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <UserFormModal
        key={editingUser ? `edit-${editingUser.id}` : "create-user"}
        open={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingUser(null);
          setError("");
        }}
        onSubmit={handleSubmit}
        editingUser={editingUser}
        initialForm={initialForm}
        academicStructure={academicStructure}
      />
    </div>
  );
}

export default UserManagementPage;
