import { Navigate, NavLink, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import ScholarshipDetail from "./pages/ScholarshipDetail.jsx";
import MyApplications from "./pages/MyApplications.jsx";
import Profile from "./pages/Profile.jsx";
import ChangePassword from "./pages/ChangePassword.jsx";
import ScholarshipApply from "./pages/ScholarshipApply.jsx";
import Navbar from "./components/Navbar.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import { useScholarship } from "./context/ScholarshipContext.jsx";

const sidebarLinkClass = ({ isActive }) => (isActive ? "sidebar-link sidebar-link-active" : "sidebar-link");

// AppLayout: chỉ còn chịu trách nhiệm layout + router, dữ liệu và logic
// đã được tách sang ScholarshipContext (useScholarship)
function AppLayout() {
  const { currentUser } = useScholarship();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="student-layout">
        <aside className="student-sidebar" aria-label="Menu sinh vien">
          <nav className="sidebar-nav">
            <NavLink to="/" end className={sidebarLinkClass}>
              Học bổng
            </NavLink>
            <NavLink to="/my-applications" className={sidebarLinkClass}>
              Theo dõi hồ sơ
            </NavLink>
          </nav>
        </aside>

        <main className="student-main">
          <div className="student-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={currentUser ? <Navigate to="/" replace /> : <Login />} />
              <Route path="/scholarships" element={<Navigate to="/" replace />} />
              <Route path="/scholarships/:id" element={<ScholarshipDetail />} />
              <Route
                path="/scholarships/:id/apply"
                element={
                  <ProtectedRoute>
                    <ScholarshipApply />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-applications"
                element={
                  <ProtectedRoute>
                    <MyApplications />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/change-password"
                element={
                  <ProtectedRoute>
                    <ChangePassword />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </div>
        </main>
      </div>

      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
    </div>
  );
}

function App() {
  return <AppLayout />;
}

export default App;
