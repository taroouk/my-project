import { useState, useEffect } from 'react';
import { Building2, Users, Gift, Globe, CreditCard, BarChart3, Wallet, Home, Phone, Mail, MapPin, Languages, MessageCircle, Sun, Moon } from 'lucide-react';
import { useAuthContext } from './components/AuthProvider';
import { Routes, Route, Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import HRDashboard from './components/HRDashboard';
import LoyaltySystem from './components/LoyaltySystem';
import WebsiteBuilder from './components/WebsiteBuilder';
import ContactPage from './components/ContactPage';
import FAQPage from './components/FAQPage';
import PageLoader from './components/PageLoader';
import AdminDashboard from './components/AdminDashboard';
import SubscriptionPlans from './components/SubscriptionPlans';
import AuthPages from './components/AuthPages';
import LandingPage from './components/LandingPage';
import BookingPage from './components/BookingPage';
import { useTheme } from './contexts/ThemeContext';

function App() {
  const [showAdminDashboard, setShowAdminDashboard] = useState(false);
  const [userType, setUserType] = useState<'client' | 'admin'>('client');
  const [language, setLanguage] = useState<'ar' | 'en'>('ar');
  const [currency, setCurrency] = useState<'SAR' | 'EGP' | 'USD'>('SAR');
  const [showContactModal, setShowContactModal] = useState(false);
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    const demoStatus = localStorage.getItem('isDemo');
    if (demoStatus === 'true') {
      setIsDemo(true);
    }
  }, []);

  const { user, userProfile, signOut } = useAuthContext();
  const isAuthenticated = !!user || isDemo;
  const navigate = useNavigate();
  const location = useLocation();

  // Translation object
  // prettier-ignore
  const translations = {
    ar: {
      // Header
      welcome: 'مرحباً بك',
      userName: 'أحمد محمد',

      // Stats
      totalEmployees: 'إجمالي الموظفين',
      loyaltyPoints: 'نقاط الولاء',
      activeWebsites: 'المواقع النشطة',
      monthlyRevenue: 'الإيرادات الشهرية',
      thisMonth: 'هذا الشهر',
      thisWeek: 'هذا الأسبوع',
      newWebsites: 'مواقع جديدة',
      fromLastMonth: 'من الشهر الماضي',

      // Features
      hrManagement: 'إدارة الموارد البشرية',
      hrDescription: 'نظام شامل لإدارة الموظفين والحضور والانصراف والرواتب والمواعيد',
      loyaltySystem: 'نظام نقاط الولاء',
      loyaltyDescription: 'نظام متكامل للمكافآت ونقاط الولاء مع دعم Apple Wallet للعروض والخصومات',
      websiteBuilder: 'منشئ المواقع',
      websiteDescription: 'قم ببناء موقعك الإلكتروني وربطه بالدومين الخاص بك مع إمكانيات تخصيص كاملة',
      analyticsReports: 'التحليلات والتقارير',
      analyticsDescription: 'تحليلات شاملة لجميع العمليات مع تقارير مفصلة',
      subscriptionPlans: 'خطط الاشتراك',
      subscriptionDescription: 'اختر الخطة المناسبة لاحتياجات عملك من الخطط المتنوعة',
      mobileApp: 'التطبيق المحمول',
      mobileDescription: 'تطبيق محمول للموظفين والعملاء مع دعم Apple Wallet',

      // Quick Actions
      quickActions: 'الإجراءات السريعة',
      addEmployee: 'إضافة موظف جديد',
      createOffer: 'إنشاء عرض جديد',
      createWebsite: 'إنشاء موقع جديد',
      viewReports: 'عرض التقارير',

      // Tags
      employeeManagement: 'إدارة الموظفين',
      attendance: 'الحضور والانصراف',
      salaries: 'الرواتب',
      loyaltyPointsTag: 'نقاط الولاء',
      rewards: 'المكافآت',
      appleWallet: 'Apple Wallet',
      customDesign: 'تصميم مخصص',
      domainConnection: 'ربط الدومين',
      contentManagement: 'إدارة المحتوى',
      hrReports: 'تقارير HR',
      loyaltyStats: 'إحصائيات الولاء',
      websitePerformance: 'أداء المواقع',
      basic: 'أساسية',
      professional: 'احترافية',
      enterprise: 'مؤسسية',
      iosAndroid: 'iOS & Android',
      instantNotifications: 'إشعارات فورية',

      // Contact
      contactUs: 'تواصل معنا',
      phone: 'الهاتف',
      email: 'البريد الإلكتروني',
      address: 'العنوان'
    },
    en: {
      // Header
      welcome: 'Welcome',
      userName: 'Ahmed Mohamed',

      // Stats
      totalEmployees: 'Total Employees',
      loyaltyPoints: 'Loyalty Points',
      activeWebsites: 'Active Websites',
      monthlyRevenue: 'Monthly Revenue',
      thisMonth: 'this month',
      thisWeek: 'this week',
      newWebsites: 'new websites',
      fromLastMonth: 'from last month',

      // Features
      hrManagement: 'HR Management',
      hrDescription: 'Comprehensive system for managing employees, attendance, salaries and appointments',
      loyaltySystem: 'Loyalty System',
      loyaltyDescription: 'Integrated rewards and loyalty points system with Apple Wallet support for offers and discounts',
      websiteBuilder: 'Website Builder',
      websiteDescription: 'Build your website and connect it to your custom domain with full customization capabilities',
      analyticsReports: 'Analytics & Reports',
      analyticsDescription: 'Comprehensive analytics for all operations with detailed reports',
      subscriptionPlans: 'Subscription Plans',
      subscriptionDescription: 'Choose the right plan for your business needs from various plans',
      mobileApp: 'Mobile App',
      mobileDescription: 'Mobile app for employees and customers with Apple Wallet support',

      // Quick Actions
      quickActions: 'Quick Actions',
      addEmployee: 'Add New Employee',
      createOffer: 'Create New Offer',
      createWebsite: 'Create New Website',
      viewReports: 'View Reports',

      // Tags
      employeeManagement: 'Employee Management',
      attendance: 'Attendance',
      salaries: 'Salaries',
      loyaltyPointsTag: 'Loyalty Points',
      rewards: 'Rewards',
      appleWallet: 'Apple Wallet',
      customDesign: 'Custom Design',
      domainConnection: 'Domain Connection',
      contentManagement: 'Content Management',
      hrReports: 'HR Reports',
      loyaltyStats: 'Loyalty Statistics',
      websitePerformance: 'Website Performance',
      basic: 'Basic',
      professional: 'Professional',
      enterprise: 'Enterprise',
      iosAndroid: 'iOS & Android',
      instantNotifications: 'Instant Notifications',

      // Contact
      contactUs: 'Contact Us',
      phone: 'Phone',
      email: 'Email',
      address: 'Address'
    }
  };

  const t = translations[language];

  // Currency formatting
  const formatCurrency = (amount: number) => {
    const symbols = {
      SAR: 'ر.س',
      EGP: 'ج.م',
      USD: '$'
    };

    const rates = {
      SAR: 1,
      EGP: 15.5, // 1 SAR = 15.5 EGP
      USD: 0.27  // 1 SAR = 0.27 USD
    };

    const convertedAmount = Math.round(amount * rates[currency]);
    return `${symbols[currency]} ${convertedAmount.toLocaleString()} `;
  };

  // Contact Modal Component
  const ContactModal = () => (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowContactModal(false)} />
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative backdrop-blur-xl bg-white/95 rounded-3xl border border-white/20 shadow-xl p-8 max-w-md w-full">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-purple-800 rounded-3xl mx-auto mb-4 flex items-center justify-center">
              <MessageCircle className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">{t.contactUs}</h3>
            <p className="text-gray-600">Servly - {language === 'ar' ? 'شركة تصميم المواقع' : 'Website Design Company'}</p>
          </div>

          <div className="space-y-4 mb-6">
            <div className="flex items-center space-x-4 p-4 bg-purple-50 rounded-xl">
              <Phone className="w-6 h-6 text-purple-600" />
              <div>
                <p className="font-medium text-gray-900">{t.phone}</p>
                <p className="text-gray-600">+20 100 123 4567</p>
              </div>
            </div>

            <div className="flex items-center space-x-4 p-4 bg-purple-50 rounded-xl">
              <Mail className="w-6 h-6 text-purple-600" />
              <div>
                <p className="font-medium text-gray-900">{t.email}</p>
                <p className="text-gray-600">info@servly.com</p>
              </div>
            </div>

            <div className="flex items-center space-x-4 p-4 bg-purple-50 rounded-xl">
              <MapPin className="w-6 h-6 text-purple-600" />
              <div>
                <p className="font-medium text-gray-900">{t.address}</p>
                <p className="text-gray-600">{language === 'ar' ? 'القاهرة، مصر' : 'Cairo, Egypt'}</p>
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowContactModal(false)}
            className="w-full py-3 px-6 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 transition-colors"
          >
            {language === 'ar' ? 'إغلاق' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );

  const { isDarkMode, toggleDarkMode } = useTheme();

  const handleLogin = (type: 'client' | 'admin', demo: boolean = false) => {
    setUserType(type);
    if (demo) {
      setIsDemo(true);
      localStorage.setItem('isDemo', 'true');
    }
    if (type === 'client') {
      navigate('/');
    } else {
      setShowAdminDashboard(true);
      navigate('/admin');
    }
  };

  const handleLogout = async () => {
    if (isDemo) {
      setIsDemo(false);
      localStorage.removeItem('isDemo');
    } else {
      await signOut();
    }
    setShowAdminDashboard(false);
    setUserType('client');
    navigate('/');
  };

  const HomePage = () => {
    return (
      <div className={`min - h - screen bg - gradient - to - br from - purple - 50 via - white to - purple - 50 dark: from - gray - 900 dark: via - gray - 950 dark: to - gray - 900 text - gray - 900 dark: text - gray - 100 ${language === 'ar' ? 'rtl' : 'ltr'} `}>
        {/* Header */}
        <header className="backdrop-blur-xl bg-white/60 dark:bg-gray-800/60 border-b border-white/20 dark:border-gray-700 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-purple-800 rounded-2xl flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Servly</h1>
              </div>
              <div className="flex items-center space-x-4 space-x-reverse"> {/* Added space-x-reverse for RTL */}
                {/* Dark Mode Toggle */}
                <button
                  onClick={toggleDarkMode}
                  className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>
                {/* Language Selector */}
                <div className="flex items-center space-x-2 bg-white/60 dark:bg-gray-700/60 rounded-xl p-2">
                  <Languages className="w-4 h-4 text-gray-600" />
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value as 'ar' | 'en')}
                    className="bg-transparent text-sm font-medium text-gray-700 dark:text-gray-300 border-none outline-none cursor-pointer"
                  >
                    <option value="ar">العربية</option>
                    <option value="en">English</option>
                  </select>
                </div>

                {/* Currency Selector */}
                <div className="flex items-center space-x-2 bg-white/60 dark:bg-gray-700/60 rounded-xl p-2">
                  <CreditCard className="w-4 h-4 text-gray-600" />
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value as 'SAR' | 'EGP' | 'USD')}
                    className="bg-transparent text-sm font-medium text-gray-700 dark:text-gray-300 border-none outline-none cursor-pointer"
                  >
                    <option value="SAR">ر.س SAR</option>
                    <option value="EGP">ج.م EGP</option>
                    <option value="USD">$ USD</option>
                  </select>
                </div>

                <div className="text-right text-gray-600 dark:text-gray-300">
                  <p className="text-sm text-gray-600">{t.welcome}</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {userProfile?.full_name || user?.email || t.userName}
                  </p>
                </div>
                <div className="relative group">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full flex items-center justify-center cursor-pointer">
                    <span className="text-purple-800 font-semibold">
                      {userProfile?.full_name?.charAt(0) || user?.email?.charAt(0) || 'أ'}
                    </span>
                  </div>
                  {/* Dropdown Menu */}
                  <div className="absolute left-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="p-2">
                      <button
                        onClick={handleLogout}
                        className="w-full text-right px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      >
                        تسجيل الخروج
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-6 py-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="backdrop-blur-xl bg-white/60 dark:bg-gray-800/60 rounded-3xl border border-white/20 dark:border-gray-700 shadow-lg dark:shadow-none p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">{t.totalEmployees}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">0</p>
                  <p className="text-xs text-gray-500 mt-1">{language === 'ar' ? 'لا توجد بيانات' : 'No data yet'}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-700 dark:to-purple-900 rounded-2xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="backdrop-blur-xl bg-white/60 dark:bg-gray-800/60 rounded-3xl border border-white/20 dark:border-gray-700 shadow-lg dark:shadow-none p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">{t.loyaltyPoints}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">0</p>
                  <p className="text-xs text-gray-500 mt-1">{language === 'ar' ? 'لا توجد بيانات' : 'No data yet'}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-700 dark:to-purple-900 rounded-2xl flex items-center justify-center">
                  <Gift className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="backdrop-blur-xl bg-white/60 dark:bg-gray-800/60 rounded-3xl border border-white/20 dark:border-gray-700 shadow-lg dark:shadow-none p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">{t.activeWebsites}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">0</p>
                  <p className="text-xs text-gray-500 mt-1">{language === 'ar' ? 'لا توجد بيانات' : 'No data yet'}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-700 dark:to-purple-900 rounded-2xl flex items-center justify-center">
                  <Globe className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="backdrop-blur-xl bg-white/60 dark:bg-gray-800/60 rounded-3xl border border-white/20 dark:border-gray-700 shadow-lg dark:shadow-none p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">{t.monthlyRevenue}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(0)}</p>
                  <p className="text-xs text-gray-500 mt-1">{language === 'ar' ? 'لا توجد بيانات' : 'No data yet'}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-700 dark:to-purple-900 rounded-2xl flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 text-gray-900 dark:text-gray-100">
            {/* HR Management */}
            <Link
              to="/hr"
              className="backdrop-blur-xl bg-white/60 dark:bg-gray-800/60 rounded-3xl border border-white/20 dark:border-gray-700 shadow-lg dark:shadow-none hover:shadow-xl dark:hover:shadow-none transition-all duration-300 cursor-pointer group p-8"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-purple-800 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{t.hrManagement}</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">{t.hrDescription}</p>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">{t.employeeManagement}</span>
                <span className="px-3 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">{t.attendance}</span>
                <span className="px-3 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">{t.salaries}</span>
              </div>
            </Link>

            {/* Loyalty System */}
            <Link
              to="/loyalty"
              className="backdrop-blur-xl bg-white/60 dark:bg-gray-800/60 rounded-3xl border border-white/20 dark:border-gray-700 shadow-lg dark:shadow-none hover:shadow-xl dark:hover:shadow-none transition-all duration-300 cursor-pointer group p-8"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-purple-800 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Gift className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{t.loyaltySystem}</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">{t.loyaltyDescription}</p>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">{t.loyaltyPointsTag}</span>
                <span className="px-3 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">{t.rewards}</span>
                <span className="px-3 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">{t.appleWallet}</span>
              </div>
            </Link>

            {/* Website Builder */}
            <Link
              to="/website"
              className="backdrop-blur-xl bg-white/60 dark:bg-gray-800/60 rounded-3xl border border-white/20 dark:border-gray-700 shadow-lg dark:shadow-none hover:shadow-xl dark:hover:shadow-none transition-all duration-300 cursor-pointer group p-8"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-purple-800 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Globe className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{t.websiteBuilder}</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">{t.websiteDescription}</p>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">{t.customDesign}</span>
                <span className="px-3 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">{t.domainConnection}</span>
                <span className="px-3 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">{t.contentManagement}</span>
              </div>
            </Link>

            {/* Analytics & Reports */}
            <div className="backdrop-blur-xl bg-white/60 dark:bg-gray-800/60 rounded-3xl border border-white/20 dark:border-gray-700 shadow-lg dark:shadow-none p-8">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-purple-800 rounded-3xl flex items-center justify-center mb-6">
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{t.analyticsReports}</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">{t.analyticsDescription}</p>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">{t.hrReports}</span>
                <span className="px-3 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">{t.loyaltyStats}</span>
                <span className="px-3 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">{t.websitePerformance}</span>
              </div>
            </div>

            {/* Subscriptions */}
            <Link
              to="/subscriptions"
              className="backdrop-blur-xl bg-white/60 dark:bg-gray-800/60 rounded-3xl border border-white/20 dark:border-gray-700 shadow-lg dark:shadow-none hover:shadow-xl dark:hover:shadow-none transition-all duration-300 cursor-pointer group p-8"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-purple-800 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <CreditCard className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{t.subscriptionPlans}</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">{t.subscriptionDescription}</p>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">{t.basic}</span>
                <span className="px-3 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">{t.professional}</span>
                <span className="px-3 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">{t.enterprise}</span>
              </div>
            </Link>

            {/* Mobile App Feature */}
            <div className="backdrop-blur-xl bg-white/60 dark:bg-gray-800/60 rounded-3xl border border-white/20 dark:border-gray-700 shadow-lg dark:shadow-none p-8">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-purple-800 rounded-3xl flex items-center justify-center mb-6">
                <Wallet className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{t.mobileApp}</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">{t.mobileDescription}</p>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">{t.iosAndroid}</span>
                <span className="px-3 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">{t.appleWallet}</span>
                <span className="px-3 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">{t.instantNotifications}</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-8 backdrop-blur-xl bg-white/60 dark:bg-gray-800/60 rounded-3xl border border-white/20 dark:border-gray-700 shadow-lg dark:shadow-none p-8">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">{t.quickActions}</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <button className="flex items-center space-x-3 bg-purple-50 hover:bg-purple-100 rounded-2xl p-4 transition-colors">
                <Users className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-medium text-purple-800">{t.addEmployee}</span>
              </button>
              <Link
                to="/loyalty"
                className="flex items-center space-x-3 bg-purple-50 hover:bg-purple-100 rounded-2xl p-4 transition-colors"
              >
                <Gift className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-medium text-purple-800">{t.createOffer}</span>
              </Link>
              <Link
                to="/website"
                className="flex items-center space-x-3 bg-purple-50 hover:bg-purple-100 rounded-2xl p-4 transition-colors"
              >
                <Globe className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-medium text-purple-800">{t.createWebsite}</span>
              </Link>
              <button
                onClick={() => alert(language === 'ar' ? 'عرض التقارير قريباً!' : 'Reports coming soon!')}
                className="flex items-center space-x-3 bg-purple-50 hover:bg-purple-100 rounded-2xl p-4 transition-colors"
              >
                <BarChart3 className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-medium text-purple-800">{t.viewReports}</span>
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  };

  return (
    <div className="relative">
      <Routes>
        <Route path="/" element={
          isAuthenticated ? <HomePage /> : <Navigate to="/landing" />
        } />
        <Route path="/landing" element={
          !isAuthenticated ? <LandingPage onGetStarted={() => navigate('/auth')} onAdminLogin={() => navigate('/admin-auth')} /> : <Navigate to="/" />
        } />
        <Route path="/auth" element={
          !isAuthenticated ? <AuthPages onLogin={(demo) => handleLogin('client', demo)} /> : <Navigate to="/" />
        } />
        <Route path="/admin-auth" element={
          !isAuthenticated ? <AuthPages onLogin={(demo) => handleLogin('admin', demo)} isAdmin={true} /> : <Navigate to="/admin" />
        } />
        <Route path="/admin" element={
          showAdminDashboard ? <AdminDashboard onClose={() => { setShowAdminDashboard(false); navigate('/'); }} /> : <Navigate to="/" />
        } />
        <Route path="/hr" element={
          <PageLoader loadingText="جاري تحميل نظام الموارد البشرية...">
            <HRDashboard />
          </PageLoader>
        } />
        <Route path="/loyalty" element={
          <PageLoader loadingText="جاري تحميل نظام نقاط الولاء...">
            <LoyaltySystem />
          </PageLoader>
        } />
        <Route path="/website" element={
          <PageLoader loadingText="جاري تحميل منشئ المواقع...">
            <WebsiteBuilder />
          </PageLoader>
        } />
        <Route path="/contact" element={
          <PageLoader loadingText="جاري تحميل صفحة التواصل...">
            <ContactPage />
          </PageLoader>
        } />
        <Route path="/faq" element={
          <PageLoader loadingText="جاري تحميل الأسئلة الشائعة...">
            <FAQPage />
          </PageLoader>
        } />
        <Route path="/subscriptions" element={
          <PageLoader loadingText="جاري تحميل خطط الاشتراك...">
            <SubscriptionPlans />
          </PageLoader>
        } />
        <Route path="/booking" element={
          <PageLoader loadingText="جاري تحميل صفحة الحجز...">
            <BookingPage />
          </PageLoader>
        } />
      </Routes>

      {/* Navigation */}
      {isAuthenticated && !showAdminDashboard && (
        <nav className="fixed bottom-6 left-1/2 transform -translate-x-1/2 backdrop-blur-xl bg-white/80 rounded-2xl border border-white/20 shadow-lg p-2 z-50">
          <div className="flex items-center space-x-2">
            <Link
              to="/"
              className={`p - 3 rounded - xl transition - all ${location.pathname === '/' ? 'bg-purple-100 text-purple-600' : 'text-gray-600 hover:bg-gray-100'} `}
            >
              <Home className="w-5 h-5" />
            </Link>
            <Link
              to="/hr"
              className={`p - 3 rounded - xl transition - all ${location.pathname === '/hr' ? 'bg-purple-100 text-purple-600' : 'text-gray-600 hover:bg-gray-100'} `}
            >
              <Users className="w-5 h-5" />
            </Link>
            <Link
              to="/loyalty"
              className={`p - 3 rounded - xl transition - all ${location.pathname === '/loyalty' ? 'bg-purple-100 text-purple-600' : 'text-gray-600 hover:bg-gray-100'} `}
            >
              <Gift className="w-5 h-5" />
            </Link>
            <Link
              to="/website"
              className={`p - 3 rounded - xl transition - all ${location.pathname === '/website' ? 'bg-purple-100 text-purple-600' : 'text-gray-600 hover:bg-gray-100'} `}
            >
              <Globe className="w-5 h-5" />
            </Link>
            <Link
              to="/subscriptions"
              className={`p - 3 rounded - xl transition - all ${location.pathname === '/subscriptions' ? 'bg-purple-100 text-purple-600' : 'text-gray-600 hover:bg-gray-100'} `}
            >
              <CreditCard className="w-5 h-5" />
            </Link>
          </div>
        </nav>
      )}

      {/* Contact Us Button */}
      {isAuthenticated && userType === 'client' && !showAdminDashboard && (
        <Link
          to="/contact"
          className="fixed bottom-6 right-6 w-12 h-12 bg-gradient-to-br from-purple-600 to-purple-800 rounded-full shadow-lg flex items-center justify-center text-white hover:scale-110 transition-transform z-50"
          title={t.contactUs}
        >
          <MessageCircle className="w-5 h-5" />
        </Link>
      )}

      {/* Contact Modal */}
      {showContactModal && <ContactModal />}
    </div>
  );
}

export default App;