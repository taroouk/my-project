import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';

import { useAuth } from './contexts/AuthContext';
import { useTheme } from './contexts/ThemeContext';

// PAGES & COMPONENTS
import Signup from './pages/Signup';
import BookingPage from './pages/BookingPage';
import Packages from './pages/Packages';
import LandingPage from './components/LandingPage';
import AdminLogin from './pages/admin/AdminLogin';
import MerchantLogin from './pages/auth/MerchantLogin';
import CustomerLogin from './pages/auth/CustomerLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import CustomerDashboard from './pages/dashboard/customer/CustomerDashboard';
import MerchantDashboard from './pages/dashboard/merchant/MerchantDashboard';
// تأكد أن PageLoader سليم، وإذا استمرت الصفحة بيضاء استبدله بـ div بسيط كما فعلت بالأسفل
import PageLoader from './components/PageLoader';

// GUARDS
import RequireAdmin from './routes/RequireAdmin';
import RoleGuard from './routes/RoleGuard';

function App() {
  const { user, role, loading } = useAuth();
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const [language, setLanguage] = useState<'ar' | 'en'>('ar');

  // ==========================================
  // معالجة حالة التحميل (تشخيص الأعطال)
  // ==========================================
  if (loading) {
    return (
      <div style={{ 
        height: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        background: isDarkMode ? '#111827' : '#f9fafb',
        color: isDarkMode ? '#fff' : '#000',
        fontFamily: 'sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div className="animate-spin" style={{ fontSize: '2rem', marginBottom: '10px' }}>⏳</div>
          <p>جاري تحميل النظام...</p>
          <p style={{ fontSize: '12px', opacity: 0.6 }}>Checking session & database role</p>
        </div>
      </div>
    ); 
  }

  const isAuthenticated = !!user;

  // توجيه المستخدم حسب دوره عند الدخول على الصفحة الرئيسية
  const HomePageRedirect = () => {
    console.log("Redirecting... User Role is:", role);
    if (role === 'admin') return <Navigate to="/admin" replace />;
    if (role === 'merchant') return <Navigate to="/dashboard/merchant" replace />;
    if (role === 'customer') return <Navigate to="/dashboard/customer" replace />;
    return <Navigate to="/landing" replace />;
  };

  return (
    <div className={isDarkMode ? 'dark' : ''}>
      <Routes>
        {/* المسار الرئيسي */}
        <Route 
          path="/" 
          element={isAuthenticated ? <HomePageRedirect /> : <Navigate to="/landing" replace />} 
        />

        {/* صفحة الهبوط */}
        <Route 
          path="/landing" 
          element={
            !isAuthenticated ? (
              <LandingPage 
                language={language} 
                setLanguage={setLanguage}
                onGetStarted={() => navigate('/signup')}
                onCustomerLogin={() => navigate('/login/customer')}
                onMerchantLogin={() => navigate('/login/merchant')}
              />
            ) : (
              <Navigate to="/" replace />
            )
          } 
        />

        <Route path="/signup" element={<Signup />} />

        {/* AUTH ROUTES */}
        <Route path="/login/admin" element={<AdminLogin />} />
        <Route path="/login/merchant" element={<MerchantLogin />} />
        <Route path="/login/customer" element={<CustomerLogin />} />

        {/* PROTECTED ROUTES */}
        <Route
          path="/admin/*"
          element={
            <RequireAdmin>
              <AdminDashboard />
            </RequireAdmin>
          }
        />

        <Route
          path="/dashboard/customer/*"
          element={
            <RoleGuard allowedRoles={['customer']}>
              <CustomerDashboard />
            </RoleGuard>
          }
        />

        <Route
          path="/dashboard/merchant/*"
          element={
            <RoleGuard allowedRoles={['merchant']}>
              <MerchantDashboard />
            </RoleGuard>
          }
        />

        {/* FALLBACK */}
        <Route path="/unauthorized" element={<div className="h-screen flex items-center justify-center">Unauthorized Access</div>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;