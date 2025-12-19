import { useState } from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';

import { useAuth } from './contexts/AuthContext';
import { useTheme } from './contexts/ThemeContext';

// PAGES & COMPONENTS
import Signup from './pages/Signup';
import LandingPage from './components/LandingPage';
import StoreFront from './pages/store/StoreFront'; 
import DynamicStore from './pages/store/DynamicStore';
import SetupStore from './pages/dashboard/merchant/setup'; 
import AdminLogin from './pages/admin/AdminLogin';
import MerchantLogin from './pages/auth/MerchantLogin';
import CustomerLogin from './pages/auth/CustomerLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import CustomerDashboard from './pages/dashboard/customer/CustomerDashboard';
import MerchantDashboard from './pages/dashboard/merchant/MerchantDashboard'; 

// GUARDS
import RequireAdmin from './routes/RequireAdmin';
import RoleGuard from './routes/RoleGuard';

function App() {
  const { user, role, loading } = useAuth();
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const [language, setLanguage] = useState<'ar' | 'en'>('en');

  // ==========================================
  // 1. شاشة التحميل (Loading State)
  // ==========================================
  if (loading) {
    return (
      <div className={`h-screen flex items-center justify-center ${isDarkMode ? 'bg-[#030712] text-white' : 'bg-gray-50 text-black'}`}>
        <div className="text-center">
          <div className="animate-spin text-5xl mb-4 text-purple-600">🌀</div>
          <p className="text-lg font-black uppercase tracking-widest animate-pulse">Servly is Synchronizing...</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-6 text-xs text-gray-500 underline block mx-auto"
          >
            Force Refresh
          </button>
        </div>
      </div>
    ); 
  }

  // ==========================================
  // 2. منطق التوجيه الذكي (The Brain)
  // ==========================================
  const HomePageRedirect = () => {
    if (!user) return <Navigate to="/landing" replace />;
    
    // الأولوية للرول القادم من الداتا بيز ثم الميتاداتا
    const activeRole = role || user.user_metadata?.role;

    if (activeRole === 'admin') return <Navigate to="/admin" replace />;
    
    if (activeRole === 'merchant') {
      const hasCompletedSetup = user.user_metadata?.setup_complete || !!user.user_metadata?.store_slug;
      if (!hasCompletedSetup) {
        return <Navigate to="/merchant/setup" replace />;
      }
      return <Navigate to="/merchant" replace />;
    }
    
    if (activeRole === 'customer') return <Navigate to="/dashboard/customer" replace />;
    
    return <Navigate to="/landing" replace />;
  };

  return (
    <div className={isDarkMode ? 'dark' : ''}>
      <Routes>
        {/* الصفحة الرئيسية توجه المستخدم حسب دوره */}
        <Route path="/" element={<HomePageRedirect />} />

        {/* المسارات العامة */}
        <Route 
          path="/landing" 
          element={
            <LandingPage 
              language={language} 
              setLanguage={setLanguage}
              onGetStarted={() => navigate('/signup')}
              onCustomerLogin={() => navigate('/login/customer')}
              onMerchantLogin={() => navigate('/login/merchant')}
            />
          } 
        />

        <Route path="/store" element={<StoreFront />} />
        <Route path="/store/:slug" element={<DynamicStore />} />

        {/* صفحات تسجيل الدخول */}
        <Route path="/signup" element={<Signup />} />
        <Route path="/login/admin" element={<AdminLogin />} />
        <Route path="/login/merchant" element={<MerchantLogin />} />
        <Route path="/login/customer" element={<CustomerLogin />} />

        {/* مسارات التاجر (Merchant) */}
        <Route
          path="/merchant/setup"
          element={
            <RoleGuard allowedRoles={['merchant', 'admin']}>
              <SetupStore />
            </RoleGuard>
          }
        />
        
        <Route
          path="/merchant/*"
          element={
            <RoleGuard allowedRoles={['merchant', 'admin']}>
              <MerchantDashboard />
            </RoleGuard>
          }
        />

        {/* مسارات الأدمن (Admin) */}
        <Route
          path="/admin/*"
          element={
            <RequireAdmin>
              <AdminDashboard />
            </RequireAdmin>
          }
        />

        {/* مسارات العميل (Customer) */}
        <Route
          path="/dashboard/customer/*"
          element={
            <RoleGuard allowedRoles={['customer', 'admin']}>
              <CustomerDashboard />
            </RoleGuard>
          }
        />

        {/* صفحة منع الدخول */}
        <Route path="/unauthorized" element={
          <div className="h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-950 text-center px-6 transition-colors">
            <h1 className="text-9xl font-black text-red-500 opacity-10 mb-4 absolute">403</h1>
            <div className="relative z-10">
              <h2 className="text-4xl font-black mb-2 dark:text-white">ACCESS DENIED</h2>
              <p className="text-gray-500 max-w-sm mx-auto mb-8 font-bold">
                Your role "{role || user?.user_metadata?.role || 'Guest'}" doesn't have permissions here.
              </p>
              <button 
                onClick={() => navigate('/')} 
                className="bg-purple-600 text-white px-10 py-4 rounded-2xl font-black shadow-xl hover:bg-purple-700 transition-all active:scale-95"
              >
                RETURN HOME
              </button>
            </div>
          </div>
        } />
        
        {/* أي مسار غير موجود يرجع للرئيسية */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;