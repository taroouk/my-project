import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

interface RoleGuardProps {
  allowedRoles: Array<"admin" | "merchant" | "customer">;
  children: JSX.Element;
}

const RoleGuard = ({ allowedRoles, children }: RoleGuardProps) => {
  const { user, role, loading } = useAuth();

  if (loading) return null;

  if (!user || !role) {
    return <Navigate to="/" replace />;
  }

  if (!allowedRoles.includes(role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default RoleGuard;
