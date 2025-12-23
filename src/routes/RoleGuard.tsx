import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles: Array<'admin' | 'merchant' | 'customer'>;
}

const RoleGuard = ({ children, allowedRoles }: RoleGuardProps) => {
  const { user, role, loading } = useAuth();
  const location = useLocation();

  // 1. شاشة انتظار أثناء التحقق من البيانات
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

  // 2. الحصول على الدور الحالي (من قاعدة البيانات أو الميتاداتا)
  const currentRole = role || user?.user_metadata?.role;

  // 3. إذا لم يسجل دخول، يتم تحويله لصفحة الـ Landing
  if (!user) {
    return <Navigate to="/landing" state={{ from: location }} replace />;
  }

  // 4. التحقق إذا كان دوره مسموحاً له بدخول هذه الصفحة
  // ملاحظة: الأدمن (admin) مسموح له بدخول كل شيء عادةً كـ Superuser
  if (!allowedRoles.includes(currentRole as any) && currentRole !== 'admin') {
    console.error("Permission Denied for role:", currentRole);
    return <Navigate to="/unauthorized" replace />;
  }

  // 5. إذا كان كل شيء تمام، اعرض الصفحة
  return <>{children}</>;
};

export default RoleGuard;