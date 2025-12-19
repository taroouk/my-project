import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface RoleGuardProps {
  children: JSX.Element;
  allowedRoles: ("admin" | "merchant" | "customer")[];
}

const RoleGuard = ({ children, allowedRoles }: RoleGuardProps) => {
  const { role, loading, user } = useAuth();
  const location = useLocation();

  // 1. أثناء التحميل، نظهر مؤشر انتظار لمنع القفز لصفحة unauthorized
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  // 2. إذا لم يكن هناك مستخدم مسجل إطلاقاً، نرجعه لصفحة تسجيل الدخول مع حفظ المكان الذي كان يقصده
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. التحقق المزدوج من الدور (من الـ state أو من الميتاداتا مباشرة)
  // هذا السطر هو "الأمان الإضافي" لمنع الـ Access Denied الخاطئ
  const effectiveRole = role || user.user_metadata?.role;

  if (!effectiveRole || !allowedRoles.includes(effectiveRole as any)) {
    console.warn(`Access Denied: Current Role "${effectiveRole}" is not in allowed:`, allowedRoles);
    return <Navigate to="/unauthorized" replace />;
  }

  // 4. إذا مر من كل الشروط، مبروك!
  return children;
};

export default RoleGuard;