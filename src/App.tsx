import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';

// CONTEXTS
import { useAuth } from './contexts/AuthContext';
import { useTheme } from './contexts/ThemeContext';

// PAGES & COMPONENTS
import Signup from './pages/Signup';
import LandingPage from './components/LandingPage';
import StoreFront from './pages/store/StoreFront'; 
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
  const { user, dbUser, role, loading } = useAuth();
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const [language, setLanguage] = useState<'ar' | 'en'>('en');

  // --- Optimized Setup Check Logic ---
  const isSetupComplete = () => {
    // 1. Check Metadata (Fastest & Ignores RLS issues)
    const metadataComplete = user?.user_metadata?.setup_complete === true;
    
    // 2. Check Database record
    const dbComplete = dbUser?.setup_complete === true || !!dbUser?.store_slug;
    
    // 3. Check Session Persistence
    const sessionComplete = localStorage.getItem('servly_setup_done') === 'true';

    return metadataComplete || dbComplete || sessionComplete;
  };




  // Professional Loading Screen
  if (loading) {
    return (
      <div className={`h-screen flex items-center justify-center ${isDarkMode ? 'bg-[#030712] text-white' : 'bg-gray-50 text-black'}`}>
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm font-black uppercase tracking-[0.3em] animate-pulse text-indigo-600">Servly</p>
          <p className="text-[10px] text-gray-400 mt-2 font-bold uppercase tracking-widest">Synchronizing Workspace...</p>
        </div>
      </div>
    ); 
  }

  // --- Smart Home Page Redirect Logic ---
  const HomePageRedirect = () => {
    if (!user) {
      return (
        <LandingPage 
          language={language} 
          setLanguage={setLanguage}
          onGetStarted={() => navigate('/signup')}
          onCustomerLogin={() => navigate('/login/customer')}
          onMerchantLogin={() => navigate('/login/merchant')}
        />
      );
    }
    
    const activeRole = role || dbUser?.role || user.user_metadata?.role;

    if (activeRole === 'admin') return <Navigate to="/admin" replace />;
    
    if (activeRole === 'merchant') {
      return isSetupComplete() ? <Navigate to="/merchant" replace /> : <Navigate to="/merchant/setup" replace />;
    }
    
    if (activeRole === 'customer') return <Navigate to="/dashboard/customer" replace />;
    
    return <Navigate to="/unauthorized" replace />;
  };

  return (
    <div className={isDarkMode ? 'dark' : ''}>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePageRedirect />} />
        <Route path="/s/:slug" element={<StoreFront />} />
        <Route path="/signup" element={<Signup />} />
        
        {/* Auth Routes */}
        <Route path="/login/admin" element={<AdminLogin />} />
        <Route path="/login/merchant" element={<MerchantLogin />} />
        <Route path="/login/customer" element={<CustomerLogin />} />

        {/* --- Merchant Section --- */}
        <Route
          path="/merchant/setup"
          element={
            <RoleGuard allowedRoles={['merchant', 'admin']}>
              {/* Force redirect if already done */}
              {isSetupComplete() ? <Navigate to="/merchant" replace /> : <SetupStore />}
            </RoleGuard>
          }
        />
        
        <Route
          path="/merchant/*"
          element={
            <RoleGuard allowedRoles={['merchant', 'admin']}>
              {/* Force back to setup if not finished */}
              {isSetupComplete() ? <MerchantDashboard /> : <Navigate to="/merchant/setup" replace />}
            </RoleGuard>
          }
        />

        {/* --- Admin Section --- */}
        <Route
          path="/admin/*"
          element={
            <RequireAdmin>
              <AdminDashboard />
            </RequireAdmin>
          }
        />

        {/* --- Customer Section --- */}
        <Route
          path="/dashboard/customer/*"
          element={
            <RoleGuard allowedRoles={['customer', 'admin']}>
              <CustomerDashboard />
            </RoleGuard>
          }
        />

        {/* Access Denied Page */}
        <Route path="/unauthorized" element={
          <div className="h-screen flex flex-col items-center justify-center bg-white text-center px-6" dir="ltr">
            <div className="w-24 h-24 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mb-6 text-4xl font-bold italic shadow-inner">!</div>
            <h2 className="text-4xl font-black mb-2 uppercase tracking-tighter text-gray-900 italic">Access Denied</h2>
            <p className="text-gray-500 mb-8 font-bold max-w-sm">Your account doesn't have the necessary permissions to view this dashboard.</p>
            <button 
              onClick={() => navigate('/')} 
              className="bg-black text-white px-12 py-5 rounded-2xl font-black shadow-2xl hover:bg-gray-800 transition-all uppercase tracking-widest text-xs"
            >
              Back to Home
            </button>
          </div>
        } />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;