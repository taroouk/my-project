import { ReactNode, useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles: Array<'admin' | 'merchant' | 'customer'>;
}

const RoleGuard = ({ children, allowedRoles }: RoleGuardProps) => {
  const { user, role, dbUser, loading, dbLoaded } = useAuth();
  const location = useLocation();

  // لو dbLoaded ماخلصش بسرعة، ما نعلقش للأبد
  const [waitedTooLong, setWaitedTooLong] = useState(false);

  useEffect(() => {
    if (!user) return;
    if (dbLoaded) return;

    const t = setTimeout(() => setWaitedTooLong(true), 4000);
    return () => clearTimeout(t);
  }, [user, dbLoaded]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-[#030712]">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-10 w-10 bg-purple-600 rounded-full mb-4"></div>
          <p className="text-xs font-black text-purple-600">SECURE CHECK...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // استنى dbLoaded، لكن لو اتأخر زيادة استخدم metadata بدل ما نعلق
  if (!dbLoaded && !waitedTooLong) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-[#030712]">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-10 w-10 bg-purple-600 rounded-full mb-4"></div>
          <p className="text-xs font-black text-purple-600">LOADING PROFILE...</p>
          <p className="text-[10px] font-bold text-gray-400 mt-2 uppercase tracking-widest">Fetching permissions</p>
        </div>
      </div>
    );
  }

  const currentRole =
    (role || dbUser?.role || user.user_metadata?.role) as 'admin' | 'merchant' | 'customer' | undefined;

  if (!currentRole) {
    // لو لسه role مش واضح بعد المهلة → رجّعه للـ Home بدل ما يعلق
    return <Navigate to="/" replace />;
  }

  if (currentRole === 'admin') return <>{children}</>;

  if (!allowedRoles.includes(currentRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

export default RoleGuard;
