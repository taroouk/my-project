import { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';
import { useAuth } from './components/AuthProvider';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';

// Pages
import Login from './pages/Login';
import Signup from './pages/Signup';
import LandingPage from './components/LandingPage';
import BookingPage from './pages/BookingPage';
import Packages from './pages/Packages';

// Components
import HRDashboard from './components/HRDashboard';
import LoyaltySystem from './components/LoyaltySystem';
import WebsiteBuilder from './components/WebsiteBuilder';
import ContactPage from './components/ContactPage';
import FAQPage from './components/FAQPage';
import PageLoader from './components/PageLoader';
import AdminDashboard from './components/AdminDashboard';
import SubscriptionPlans from './components/SubscriptionPlans';
import { useTheme } from './contexts/ThemeContext';

function App() {
  const [language, setLanguage] = useState<'ar' | 'en'>('ar');
  const [showContactModal, setShowContactModal] = useState(false);
  const [isDemo, setIsDemo] = useState(false);

  const { user, signOut } = useAuth();
  const isAuthenticated = !!user || isDemo;
  const navigate = useNavigate();
  const { isDarkMode, toggleDarkMode } = useTheme();

  const [userRole, setUserRole] = useState<'admin' | 'merchant' | 'customer' | null>(null);

  useEffect(() => {
    const demoStatus = localStorage.getItem('isDemo');
    if (demoStatus === 'true') setIsDemo(true);

    // Set role based on user metadata if available
    if (user) {
      setUserRole((user as any).role || 'customer'); // assuming role stored in metadata
    }
  }, [user]);

  const handleLogout = async () => {
    if (isDemo) {
      setIsDemo(false);
      localStorage.removeItem('isDemo');
    } else {
      await signOut();
    }
    setUserRole(null);
    navigate('/');
  };

  const translations = {
    ar: { welcome: 'مرحباً بك', contactUs: 'تواصل معنا', phone: 'الهاتف', email: 'البريد الإلكتروني', address: 'العنوان' },
    en: { welcome: 'Welcome', contactUs: 'Contact Us', phone: 'Phone', email: 'Email', address: 'Address' }
  };
  const t = translations[language];

  const ContactModal = () => (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black/50" onClick={() => setShowContactModal(false)} />
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full">
          <h3 className="text-xl font-bold mb-4">{t.contactUs}</h3>
          <p>{t.phone}: +20 100 123 4567</p>
          <p>{t.email}: info@servly.com</p>
          <p>{t.address}: Cairo, Egypt</p>
          <button onClick={() => setShowContactModal(false)} className="mt-4 w-full bg-purple-600 text-white rounded py-2">Close</button>
        </div>
      </div>
    </div>
  );

  const HomePage = () => (
    <div className={`min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 text-gray-900 dark:text-gray-100 ${language === 'ar' ? 'rtl' : 'ltr'}`}>
      <header className="p-4 flex justify-between items-center bg-white shadow">
        <h1 className="font-bold">Servly</h1>
        <div className="flex gap-3">
          <button onClick={toggleDarkMode}>{isDarkMode ? <Sun /> : <Moon />}</button>
          <select value={language} onChange={(e) => setLanguage(e.target.value as 'ar' | 'en')}>
            <option value="ar">AR</option>
            <option value="en">EN</option>
          </select>
          <button onClick={handleLogout} className="text-red-600">Logout</button>
        </div>
      </header>
      <main className="p-6">
        <h2 className="text-2xl font-bold">{t.welcome}</h2>
        <p>Role: {userRole}</p>
      </main>
    </div>
  );

  return (
    <div className="relative">
      <Routes>
        <Route path="/" element={isAuthenticated ? <HomePage /> : <Navigate to="/landing" />} />
        <Route path="/landing" element={!isAuthenticated ? <LandingPage onGetStarted={() => navigate('/auth')} onAdminLogin={() => navigate('/admin')} /> : <Navigate to="/" />} />
        <Route path="/auth" element={!isAuthenticated ? <Login /> : <Navigate to="/" />} />
        <Route path="/signup" element={<Signup />} />

        {/* Role-based Dashboards */}
        <Route path="/admin" element={userRole === 'admin' ? <AdminDashboard onClose={() => navigate('/')} /> : <Navigate to="/" />} />
        <Route path="/merchant" element={userRole === 'merchant' ? <PageLoader><WebsiteBuilder /></PageLoader> : <Navigate to="/" />} />
        <Route path="/customer" element={userRole === 'customer' ? <PageLoader><BookingPage /></PageLoader> : <Navigate to="/" />} />

        {/* Common Pages */}
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

      {showContactModal && <ContactModal />}
    </div>
  );
}

export default App;
