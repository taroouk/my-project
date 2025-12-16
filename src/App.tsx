import { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';

import { useAuth } from './contexts/AuthContext';
import { useTheme } from './contexts/ThemeContext';

// ================= PAGES =================
import Signup from './pages/Signup';
import BookingPage from './pages/BookingPage';
import Packages from './pages/Packages';

// ================= LANDING =================
import LandingPage from './components/LandingPage';

// ================= AUTH =================
import AdminLogin from './pages/admin/AdminLogin';
import MerchantLogin from './pages/auth/MerchantLogin';
import CustomerLogin from './pages/auth/CustomerLogin';

// ================= DASHBOARDS =================
import AdminDashboard from './pages/admin/AdminDashboard';
import CustomerDashboard from './pages/dashboard/customer/CustomerDashboard';
import MerchantDashboard from './pages/dashboard/merchant/MerchantDashboard';

// ================= COMMON COMPONENTS =================
import HRDashboard from './components/HRDashboard';
import LoyaltySystem from './components/LoyaltySystem';
import WebsiteBuilder from './components/WebsiteBuilder';
import ContactPage from './components/ContactPage';
import FAQPage from './components/FAQPage';
import PageLoader from './components/PageLoader';
import SubscriptionPlans from './components/SubscriptionPlans';

// ================= GUARDS =================
import RequireAdmin from './routes/RequireAdmin';
import RoleGuard from './routes/RoleGuard';

function App() {
  const [language, setLanguage] = useState<'ar' | 'en'>('ar');
  const [isDemo, setIsDemo] = useState(false);

  const { user, role, signOut } = useAuth();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const navigate = useNavigate();

  const isAuthenticated = !!user || isDemo;

  useEffect(() => {
    const demoStatus = localStorage.getItem('isDemo');
    if (demoStatus === 'true') {
      setIsDemo(true);
    }
  }, []);

  const handleLogout = async () => {
    if (isDemo) {
      setIsDemo(false);
      localStorage.removeItem('isDemo');
    } else {
      await signOut();
    }
    navigate('/');
  };

  // ================= HOME (AFTER LOGIN) =================
  const HomePage = () => (
    <div className={`min-h-screen ${language === 'ar' ? 'rtl' : 'ltr'}`}>
      <header className="p-4 flex justify-between items-center bg-white shadow">
        <h1 className="font-bold text-lg">Servly</h1>

        <div className="flex items-center gap-4">
          <button onClick={toggleDarkMode}>
            {isDarkMode ? <Sun /> : <Moon />}
          </button>

          <button
            onClick={handleLogout}
            className="text-red-600 font-medium"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="p-6">
        <h2 className="text-xl font-semibold mb-2">Welcome</h2>
        <p className="text-gray-600">Role: {role}</p>
      </main>
    </div>
  );

  return (
    <Routes>

      {/* ================= PUBLIC ================= */}
      <Route
        path="/"
        element={
          isAuthenticated ? <HomePage /> : <Navigate to="/landing" />
        }
      />

      <Route
        path="/landing"
        element={
          !isAuthenticated ? (
            <LandingPage
              onMerchantLogin={() => navigate('/login/merchant')}
              onCustomerLogin={() => navigate('/login/customer')}
              onGetStarted={() => navigate('/signup')}
              language={language}
              setLanguage={setLanguage}
            />
          ) : (
            <Navigate to="/" />
          )
        }
      />

      <Route path="/signup" element={<Signup />} />

      {/* ================= AUTH ================= */}
      <Route path="/login/admin" element={<AdminLogin />} />
      <Route path="/login/merchant" element={<MerchantLogin />} />
      <Route path="/login/customer" element={<CustomerLogin />} />

      {/* ================= ADMIN ================= */}
      <Route
        path="/admin/*"
        element={
          <RequireAdmin>
            <AdminDashboard onClose={handleLogout} />
          </RequireAdmin>
        }
      />

      {/* ================= CUSTOMER ================= */}
      <Route
        path="/dashboard/customer/*"
        element={
          <RoleGuard allowedRoles={['customer']}>
            <CustomerDashboard onClose={handleLogout} />
          </RoleGuard>
        }
      />

      {/* ================= MERCHANT ================= */}
      <Route
        path="/dashboard/merchant/*"
        element={
          <RoleGuard allowedRoles={['merchant']}>
            <MerchantDashboard onClose={handleLogout} />
          </RoleGuard>
        }
      />

      {/* ================= COMMON PAGES ================= */}
      <Route path="/hr" element={<PageLoader><HRDashboard /></PageLoader>} />
      <Route path="/loyalty" element={<PageLoader><LoyaltySystem /></PageLoader>} />
      <Route path="/website" element={<PageLoader><WebsiteBuilder /></PageLoader>} />
      <Route path="/contact" element={<PageLoader><ContactPage /></PageLoader>} />
      <Route path="/faq" element={<PageLoader><FAQPage /></PageLoader>} />
      <Route path="/subscriptions" element={<PageLoader><SubscriptionPlans /></PageLoader>} />
      <Route path="/booking" element={<PageLoader><BookingPage /></PageLoader>} />
      <Route path="/packages" element={<PageLoader><Packages /></PageLoader>} />

      {/* ================= FALLBACK ================= */}
      <Route path="*" element={<Navigate to="/" />} />

    </Routes>
  );
}

export default App;
