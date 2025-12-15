import { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';
import { useAuth } from './contexts/AuthContext';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { useTheme } from './contexts/ThemeContext';

// Pages
import Login from './pages/Login';
import Signup from './pages/Signup';
import LandingPage from './components/LandingPage';
import BookingPage from './pages/BookingPage';
import Packages from './pages/Packages';

// Auth
import AdminLogin from './pages/admin/AdminLogin';
import MerchantLogin from './pages/auth/MerchantLogin';
import CustomerLogin from './pages/auth/CustomerLogin';

// Dashboards
import AdminDashboard from './pages/admin/AdminDashboard';
import CustomerDashboard from "./pages/dashboard/customer/CustomerDashboard";
import MerchantDashboard from "./pages/dashboard/merchant/MerchantDashboard";

// Components
import HRDashboard from './components/HRDashboard';
import LoyaltySystem from './components/LoyaltySystem';
import WebsiteBuilder from './components/WebsiteBuilder';
import ContactPage from './components/ContactPage';
import FAQPage from './components/FAQPage';
import PageLoader from './components/PageLoader';
import SubscriptionPlans from './components/SubscriptionPlans';

// Guards
import RequireAdmin from './routes/RequireAdmin';

function App() {
  const [language, setLanguage] = useState<'ar' | 'en'>('ar');
  const [showContactModal, setShowContactModal] = useState(false);
  const [isDemo, setIsDemo] = useState(false);

  const { user, role, signOut } = useAuth();
  const navigate = useNavigate();
  const { isDarkMode, toggleDarkMode } = useTheme();

  const isAuthenticated = !!user || isDemo;

  useEffect(() => {
    const demoStatus = localStorage.getItem('isDemo');
    if (demoStatus === 'true') setIsDemo(true);
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

  const HomePage = () => (
    <div className={`min-h-screen ${language === 'ar' ? 'rtl' : 'ltr'}`}>
      <header className="p-4 flex justify-between bg-white shadow">
        <h1>Servly</h1>
        <div className="flex gap-3">
          <button onClick={toggleDarkMode}>
            {isDarkMode ? <Sun /> : <Moon />}
          </button>
          <button onClick={handleLogout} className="text-red-600">
            Logout
          </button>
        </div>
      </header>
      <main className="p-6">
        <h2>Welcome</h2>
        <p>Role: {role}</p>
      </main>
    </div>
  );

  return (
    <Routes>

      {/* ================= PUBLIC WEBSITE ================= */}
      <Route path="/" element={isAuthenticated ? <HomePage /> : <Navigate to="/landing" />} />

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

      {/* ================= ADMIN (HIDDEN & PROTECTED) ================= */}
      <Route
        path="/admin/*"
        element={
          <RequireAdmin>
            <AdminDashboard onClose={handleLogout} />
          </RequireAdmin>
        } 
      />

      {/* ================= DASHBOARDS ================= */}  
      <Route path="/dashboard/customer" element={<CustomerDashboard />} />
      <Route path="/dashboard/merchant" element={<MerchantDashboard />} />

      {/* ================= COMMON ================= */}
      <Route path="/hr" element={<PageLoader><HRDashboard /></PageLoader>} />
      <Route path="/loyalty" element={<PageLoader><LoyaltySystem /></PageLoader>} />
      <Route path="/website" element={<PageLoader><WebsiteBuilder /></PageLoader>} />
      <Route path="/contact" element={<PageLoader><ContactPage /></PageLoader>} />
      <Route path="/faq" element={<PageLoader><FAQPage /></PageLoader>} />
      <Route path="/subscriptions" element={<PageLoader><SubscriptionPlans /></PageLoader>} />
      <Route path="/booking" element={<PageLoader><BookingPage /></PageLoader>} />
      <Route path="/packages" element={<PageLoader><Packages /></PageLoader>} />

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;
