import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import PageLoader from '../components/PageLoader';

interface Props {
  children: ReactNode;
  allowedRoles: Array<'admin' | 'merchant' | 'customer'>;
}

const RoleGuard = ({ children, allowedRoles }: Props) => {
  const { user, role, loading } = useAuth();

  if (loading) return <PageLoader>{children}</PageLoader>;

  if (!user || !role || !allowedRoles.includes(role)) {
    return <Navigate to="/landing" replace />;
  }

  return <>{children}</>;
};

export default RoleGuard;