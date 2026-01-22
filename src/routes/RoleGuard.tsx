import { ReactNode, useEffect, useMemo, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles: Array<"admin" | "merchant" | "customer">;
}

const RoleGuard = ({ children, allowedRoles }: RoleGuardProps) => {
  const { user, role, dbUser, loading, dbLoaded } = useAuth();
  const location = useLocation();

  // ✅ مهلة صغيرة لو الدور مش ظاهر (بدون تعليق للأبد)
  const [fallbackTimeout, setFallbackTimeout] = useState(false);

  // ✅ احسب الدور فورًا من أي مصدر متاح (حتى لو dbLoaded=false)
  const currentRole = useMemo(() => {
    return (role ||
      dbUser?.role ||
      (user?.user_metadata?.role as any)) as "admin" | "merchant" | "customer" | undefined;
  }, [role, dbUser?.role, user?.user_metadata]);

  useEffect(() => {
    // reset عند تغيير المستخدم
    setFallbackTimeout(false);

    if (!user) return;

    // لو عندنا currentRole خلاص، مفيش داعي للمهلة
    if (currentRole) return;

    const t = window.setTimeout(() => setFallbackTimeout(true), 2500);
    return () => window.clearTimeout(t);
  }, [user?.id, currentRole]);

  // ✅ لو auth لسه بيجهز session
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

  // ✅ لو مفيش user أصلاً
  if (!user) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  /**
   * ✅ أهم نقطة:
   * لو role موجود (حتى من metadata) — كمل فورًا
   * متستناش dbLoaded لأن DB fetch ممكن يتأخر/يتحجب ويعمل loading للأبد.
   */
  if (currentRole) {
    // admin مسموح دائمًا (زي كودك)
    if (currentRole === "admin") return <>{children}</>;

    if (!allowedRoles.includes(currentRole)) {
      return <Navigate to="/unauthorized" replace />;
    }

    return <>{children}</>;
  }

  /**
   * ✅ لو الدور مش موجود خالص:
   * - استنى dbLoaded شوية (لو هيجي)
   * - لو اتأخر: رجّعه Home بدل ما يعلق.
   */
  if (!dbLoaded && !fallbackTimeout) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-[#030712]">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-10 w-10 bg-purple-600 rounded-full mb-4"></div>
          <p className="text-xs font-black text-purple-600">LOADING PROFILE...</p>
          <p className="text-[10px] font-bold text-gray-400 mt-2 uppercase tracking-widest">
            Fetching permissions
          </p>
        </div>
      </div>
    );
  }

  // ✅ لو بعد المهلة ولسه مفيش role -> Home
  return <Navigate to="/" replace />;
};

export default RoleGuard;
