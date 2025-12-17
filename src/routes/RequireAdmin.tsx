import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface Props {
  children: ReactNode;
}

const RequireAdmin = ({ children }: Props) => {
  const { user, role, loading } = useAuth();

  // رسالة تشخيصية لو معلق في التحميل
  if (loading) {
    return <div style={{padding: '20px', color: 'orange'}}>Loading Auth Status... (Checking role)</div>;
  }
  
  // لو مفيش يوزر مسجل دخول أصلاً
  if (!user) {
    console.log("No user found in session, redirecting to login...");
    return <Navigate to="/login/admin" replace />;
  }

  // لو اليوزر موجود بس الرول مش أدمن
  if (role !== 'admin') {
    console.log("User found but role is not admin. Role is:", role);
    return (
      <div style={{padding: '50px', textAlign: 'center'}}>
        <h1 style={{color: 'red'}}>عفواً! أنت لست أدمن</h1>
        <p>الدور الحالي في قاعدة البيانات: <b>{role || 'null'}</b></p>
        <button onClick={() => window.location.href='/landing'}>العودة للرئيسية</button>
      </div>
    );
  }

  // لو كل حاجة تمام، اعرض الداشبورد
  return <>{children}</>;
};

export default RequireAdmin;