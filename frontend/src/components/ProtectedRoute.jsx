import { Navigate, useLocation } from "react-router-dom";
import { useScholarship } from "../context/ScholarshipContext";

function ProtectedRoute({ children }) {
  const { currentUser } = useScholarship();
  const location = useLocation();

  if (!currentUser) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return children;
}

export default ProtectedRoute;
