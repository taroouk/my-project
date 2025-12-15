// src/guards/RequireAdmin.tsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

interface Props {
  children: JSX.Element;
}

const RequireAdmin = ({ children }: Props) => {
  const { user, role, loading } = useAuth();

  // لسه بيجيب الداتا
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  // مش مسجل دخول
  if (!user) {
    return <Navigate to="/admin-login" replace />;
  }

  // مسجل بس مش Admin
  if (role !== "admin") {
    return <Navigate to="/" replace />;
  }

  // Admin → يدخل
  return children;
};

export default RequireAdmin;
