import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface Props { children: ReactNode; }

const RequireAdmin = ({ children }: Props) => {
  const { user, role, loading } = useAuth();

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-gray-50">
      <p className="font-black animate-pulse text-purple-600">VERIFYING ADMIN ACCESS...</p>
    </div>
  );
  
  // فحص الرتبة من مصدرين لضمان الدخول
  const currentRole = role || user?.user_metadata?.role;

  if (!user) return <Navigate to="/login/admin" replace />;

  if (currentRole !== 'admin') {
    return (
      <div className="h-screen flex flex-col items-center justify-center text-center p-10">
        <h1 className="text-4xl font-black text-red-600 mb-4">ACCESS DENIED</h1>
        <p className="text-gray-500 mb-6">Current Role: <span className="text-black font-bold">{currentRole || 'Guest'}</span></p>
        <button 
          onClick={() => window.location.href='/landing'}
          className="bg-black text-white px-8 py-3 rounded-xl font-bold"
        >
          Return Home
        </button>
      </div>
    );
  }

  return <>{children}</>;
};

export default RequireAdmin;