import { useMemo, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import AdminLayout from "./layouts/AdminLayout";
import DashboardPage from "./pages/DashboardPage";
import KhoaPage from "./pages/academics/KhoaPage";
import LopPage from "./pages/academics/LopPage";
import NganhPage from "./pages/academics/NganhPage";
import ApplicationDetail from "./pages/applications/ApplicationDetail";
import Applications from "./pages/applications/Applications";
import EvaluateScholarship from "./pages/applications/EvaluateScholarship";
import ReviewApplication from "./pages/applications/ReviewApplication";
import SelectionPage from "./pages/applications/SelectionPage";
import LoginPage from "./pages/auth/LoginPage";
import FormBuilderPage from "./pages/scholarships/FormBuilderPage";
import ScholarshipDetailPage from "./pages/scholarships/ScholarshipDetailPage";
import ScholarshipManagementPage from "./pages/scholarships/ScholarshipManagementPage";
import UserDetailPage from "./pages/users/UserDetailPage";
import UserManagementPage from "./pages/users/UserManagementPage";
import { loadSession, signInAdmin, signOut } from "./services/auth.service";

// App: Root admin app, dieu huong login va route quan tri.
function App() {
  const [session, setSession] = useState(() => loadSession());

  const isLoggedIn = useMemo(() => Boolean(session?.token), [session]);

  const handleLogin = async (username, password) => {
    const nextSession = await signInAdmin(username, password);
    setSession(nextSession);
  };

  const handleLogout = () => {
    signOut();
    setSession(null);
  };

  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    //<div className="h-full">
    <AdminLayout session={session} onLogout={handleLogout}>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/admin" element={<DashboardPage />} />
        <Route path="/users" element={<UserManagementPage />} />
        <Route path="/admin/users" element={<UserManagementPage />} />
        <Route path="/admin/users/:id" element={<UserDetailPage />} />
        <Route path="/admin/academics/khoa" element={<KhoaPage />} />
        <Route path="/admin/academics/nganh" element={<NganhPage />} />
        <Route path="/admin/academics/lop" element={<LopPage />} />
        <Route path="/admin/applications" element={<Applications />} />
        <Route path="/admin/applications/:id_hb" element={<ApplicationDetail />} />
        <Route path="/admin/applications/:id_hb/detail/:id_hosodk" element={<ReviewApplication />} />
        <Route path="/admin/applications/:id_hb/:id_hosodk" element={<ReviewApplication />} />
        <Route path="/admin/applications/:id_hb/select" element={<SelectionPage />} />
        <Route path="/admin/scholarships" element={<ScholarshipManagementPage />} />
        <Route path="/admin/scholarships/:id" element={<ScholarshipDetailPage />} />
        <Route path="/admin/scholarships/:id/form-builder" element={<FormBuilderPage />} />
        <Route path="/admin/scholarships/:id/evaluate" element={<EvaluateScholarship />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AdminLayout>
    //</div>
  );
}

export default App;
