import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const RequireAdmin = ({ children }: { children: JSX.Element }) => {
  const { user, role, loading } = useAuth();

  if (loading) return null;

  if (!user || role !== 'admin') {
    return <Navigate to="/login/admin" replace />;
  }

  return children;
};

export default RequireAdmin;
