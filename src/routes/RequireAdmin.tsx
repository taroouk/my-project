import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const RequireAdmin = ({ children }: { children: ReactNode }) => {
  const { user, role, loading } = useAuth();
  const location = useLocation();

  // 1. حالة التحميل: ننتظر حتى نتأكد من هوية المستخدم
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

  // 2. التحقق من الدور (Role): نقرأ من الـ State أو من ميتاداتا المستخدم مباشرة
  const currentRole = role || user?.user_metadata?.role;

  // 3. إذا لم يكن مسجلاً أو ليس أدمن، يتم تحويله لصفحة تسجيل دخول الأدمن
  if (!user || currentRole !== 'admin') {
    console.warn("Access Denied: User is not an admin", { role: currentRole });
    return <Navigate to="/login/admin" state={{ from: location }} replace />;
  }

  // 4. إذا كان أدمن، يتم السماح له بالدخول
  return <>{children}</>;
};

export default RequireAdmin;