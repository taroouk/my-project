import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const RequireAdmin = ({ children }: { children: ReactNode }) => {
  const { user, role, dbUser, loading, dbLoaded } = useAuth();
  const location = useLocation();

  // 1) Auth loading
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-white dark:bg-[#030712]">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600 mb-4"></div>
          <p className="text-sm font-bold text-gray-500 animate-pulse">VERIFYING ADMIN PRIVILEGES...</p>
        </div>
      </div>
    );
  }

  // 2) لو مفيش user أصلاً → روح login
  if (!user) {
    return <Navigate to="/login/admin" state={{ from: location }} replace />;
  }

  // 3) لو user موجود ولسه dbUser ماخلصش → استنى هنا عشان ما نعملش redirect غلط
  if (!dbLoaded) {
    return (
      <div className="h-screen flex items-center justify-center bg-white dark:bg-[#030712]">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600 mb-4"></div>
          <p className="text-sm font-bold text-gray-500 animate-pulse">LOADING ACCOUNT...</p>
        </div>
      </div>
    );
  }

  // 4) التحقق من الدور من أكثر من مصدر
  const currentRole = role || dbUser?.role || user.user_metadata?.role;

  if (currentRole !== 'admin') {
    console.warn('Access Denied: User is not an admin', { role: currentRole });
    return <Navigate to="/login/admin" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default RequireAdmin;
