import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../../contexts/ThemeContext';
import { supabase } from '../../../lib/supabaseClient';

import {
  LayoutDashboard,
  Scissors,
  Package,
  Calendar,
  ShoppingBag,
  Users,
  Settings as SettingsIcon,
  LogOut,
  ChevronRight,
  ExternalLink,
  Store,
  TrendingUp,
  ShieldCheck,
  Moon,
  Sun,
  Languages,
  Coins, // ✅ NEW (Loyalty)
} from 'lucide-react';

// ✅ NEW
import LogoAvatar from '../../../components/LogoAvatar';

// Sections
import ServiceList from './sections/ServiceList';
import ProductList from './sections/ProductList';
import BookingsManager from './sections/BookingsManager';
import OrderList from './sections/OrderList';
import CustomerList from './sections/CustomerList';
import Settings from './sections/Settings';
import NotificationCenter from './sections/components/NotificationCenter';

// ✅ NEW (Loyalty Settings page)
import MerchantLoyaltySettings from './sections/MerchantLoyaltySettings';

type TabId =
  | 'overview'
  | 'services'
  | 'products'
  | 'bookings'
  | 'orders'
  | 'customers'
  | 'loyalty' // ✅ NEW
  | 'settings';

type Currency = 'SAR' | 'EGP' | 'AED' | 'USD';

type Lang = 'en' | 'ar';

const LS_LANG = 'servly_lang';

const MerchantDashboard = () => {
  const { user, dbUser, dbLoaded, loading, signOut } = useAuth();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const navigate = useNavigate();

  const [lang, setLang] = useState<Lang>(() => {
    const saved = (localStorage.getItem(LS_LANG) as Lang | null) || null;
    return saved === 'ar' ? 'ar' : 'en';
  });

  const t = useMemo(() => {
    const dict: Record<Lang, Record<string, string>> = {
      en: {
        Overview: 'Overview',
        Services: 'Services',
        Products: 'Products',
        Appointments: 'Appointments',
        'Sales Ledger': 'Sales Ledger',
        CRM: 'CRM',
        Loyalty: 'Loyalty', // ✅ NEW
        Settings: 'Settings',

        Refresh: 'Refresh',
        'Refreshing…': 'Refreshing…',
        'Loading dashboard...': 'Loading dashboard...',
        Merchant: 'Merchant',
        Logout: 'Logout',
        'Toggle sidebar': 'Toggle sidebar',
        'View Live Store': 'View Live Store',
        URL: 'URL',
        Plan: 'Plan',
        Starter: 'Starter',
        Status: 'Status',
        Active: 'Active',
        Currency: 'Currency',
        'Merchant Account': 'Merchant Account',

        'Welcome, {storeName} 👋': 'Welcome, {storeName} 👋',
        'Gross Revenue': 'Gross Revenue',
        Completed: 'Completed',
        AppointmentsStat: 'Appointments',
        ActiveHint: 'Active',
        Clients: 'Clients',
        'CRM Hint': 'CRM',
        Listed: 'Listed',
        Tips: 'Tips',
        ProductsCard: 'Products',
        'Total products in your catalog.': 'Total products in your catalog.',
        'Complete more bookings to unlock analytics': 'Complete more bookings to unlock analytics',
        'Revenue will increase automatically once bookings are marked as completed.':
          'Revenue will increase automatically once bookings are marked as completed.',
        'Analytics are warming up': 'Analytics are warming up',
        'Once you receive your first booking, analytics will appear here.':
          'Once you receive your first booking, analytics will appear here.',

        'Theme: Dark': 'Theme: Dark',
        'Theme: Light': 'Theme: Light',
        'Language: AR': 'Language: AR',
        'Language: EN': 'Language: EN',

        // ✅ Overview shortcuts
        Inbox: 'Inbox',
        'Live Requests': 'Live Requests',
        'Manage bookings and orders in real-time from here.':
          'Manage bookings and orders in real-time from here.',
        Open: 'Open',
        'Latest Bookings': 'Latest Bookings',
        'Latest Orders': 'Latest Orders',
      },
      ar: {
        Overview: 'نظرة عامة',
        Services: 'الخدمات',
        Products: 'المنتجات',
        Appointments: 'المواعيد',
        'Sales Ledger': 'سجل المبيعات',
        CRM: 'العملاء',
        Loyalty: 'الولاء', // ✅ NEW
        Settings: 'الإعدادات',

        Refresh: 'تحديث',
        'Refreshing…': 'جارٍ التحديث…',
        'Loading dashboard...': 'جارٍ تحميل لوحة التحكم...',
        Merchant: 'تاجر',
        Logout: 'تسجيل الخروج',
        'Toggle sidebar': 'إظهار/إخفاء القائمة',
        'View Live Store': 'عرض المتجر',
        URL: 'الرابط',
        Plan: 'الخطة',
        Starter: 'Starter',
        Status: 'الحالة',
        Active: 'نشط',
        Currency: 'العملة',
        'Merchant Account': 'حساب تاجر',

        'Welcome, {storeName} 👋': 'أهلاً، {storeName} 👋',
        'Gross Revenue': 'إجمالي الإيراد',
        Completed: 'مكتمل',
        AppointmentsStat: 'المواعيد',
        ActiveHint: 'نشط',
        Clients: 'العملاء',
        'CRM Hint': 'CRM',
        Listed: 'مدرج',
        Tips: 'نصائح',
        ProductsCard: 'المنتجات',
        'Total products in your catalog.': 'إجمالي المنتجات داخل الكتالوج.',
        'Complete more bookings to unlock analytics': 'أكمل المزيد من الحجوزات لتفعيل التحليلات',
        'Revenue will increase automatically once bookings are marked as completed.':
          'سيزيد الإيراد تلقائياً عند وضع الحجوزات على أنها مكتملة.',
        'Analytics are warming up': 'التحليلات قيد التجهيز',
        'Once you receive your first booking, analytics will appear here.':
          'بمجرد استلام أول حجز ستظهر التحليلات هنا.',

        'Theme: Dark': 'الوضع: داكن',
        'Theme: Light': 'الوضع: فاتح',
        'Language: AR': 'اللغة: عربي',
        'Language: EN': 'اللغة: English',

        // ✅ Overview shortcuts
        Inbox: 'الوارد',
        'Live Requests': 'طلبات لحظية',
        'Manage bookings and orders in real-time from here.':
          'تابع الحجوزات والطلبات أول بأول من هنا مع إمكانية القبول/الرفض.',
        Open: 'فتح',
        'Latest Bookings': 'أحدث الحجوزات',
        'Latest Orders': 'أحدث الطلبات',
      },
    };

    const tr = (key: string, vars?: Record<string, string>) => {
      const s = dict[lang][key] ?? key;
      if (!vars) return s;
      return Object.keys(vars).reduce((acc, k) => acc.replace(`{${k}}`, vars[k]), s);
    };

    return tr;
  }, [lang]);

  useEffect(() => {
    localStorage.setItem(LS_LANG, lang);
    document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('lang', lang);
    window.dispatchEvent(new CustomEvent('servly:lang', { detail: lang }));
  }, [lang]);

  useEffect(() => {
    const handler = (e: Event) => {
      try {
        const detail = (e as CustomEvent).detail as Lang | undefined;
        if (!detail) return;
        setLang(detail === 'ar' ? 'ar' : 'en');
      } catch {}
    };

    window.addEventListener('servly:lang', handler as any);
    return () => window.removeEventListener('servly:lang', handler as any);
  }, []);

  const dir = lang === 'ar' ? 'rtl' : 'ltr';

  const [activeTab, setActiveTab] = useState<TabId>(() => {
    const saved = localStorage.getItem('merchant_active_tab') as TabId | null;
    return saved ?? 'overview';
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const [overview, setOverview] = useState({
    revenue: 0,
    activeAppointments: 0,
    clients: 0,
    services: 0,
    products: 0,
  });
  const [overviewLoading, setOverviewLoading] = useState(false);

  // ✅ Analytics (derived from DB) — must match what the Overview UI reads
  const [analytics, setAnalytics] = useState({
    bookingRevenue: 0,
    ordersRevenue: 0,
    revenueServicePct: 0,
    revenueProductPct: 0,
    completedBookings: 0,
    ordersCount: 0,
    avgBookingValue: 0,
    avgOrderValue: 0,
  });

  useEffect(() => {
    localStorage.setItem('merchant_active_tab', activeTab);
  }, [activeTab]);

  useEffect(() => {
    if (!loading && !user) navigate('/', { replace: true });
  }, [loading, user, navigate]);

  const isSetupComplete = useMemo(() => {
    const metadataComplete = user?.user_metadata?.setup_complete === true;
    const dbComplete = (dbUser as any)?.setup_complete === true || !!(dbUser as any)?.store_slug;
    const sessionComplete = localStorage.getItem('servly_setup_done') === 'true';
    return metadataComplete || dbComplete || sessionComplete;
  }, [user, dbUser]);

  useEffect(() => {
    if (!loading && dbLoaded && user && !isSetupComplete) {
      navigate('/merchant/setup', { replace: true });
    }
  }, [loading, dbLoaded, user, isSetupComplete, navigate]);

  const ui = useMemo(() => {
    if (isDarkMode) {
      return {
        pageBg: 'bg-[#030712] text-slate-100',
        surface: 'bg-[#020617]',
        surface2: 'bg-[#0b1220]',
        border: 'border-slate-800',
        borderSoft: 'border-slate-900/60',
        muted: 'text-slate-400',
        text: 'text-slate-100',
        title: 'text-slate-50',
        hover: 'hover:bg-slate-800/60',
        hoverSoft: 'hover:bg-slate-900/40',
        chip: 'bg-slate-900/50 text-slate-300',
        input: 'bg-slate-900/40 border-slate-800 text-slate-100',
        mainBg: 'bg-[#030712]',
        topbarBg: 'bg-[#020617]/80 backdrop-blur-xl',
        iconBtn: 'border-slate-800 text-slate-300 hover:bg-slate-900/40 hover:text-slate-50',
      };
    }
    return {
      pageBg: 'bg-[#F8FAFC] text-slate-900',
      surface: 'bg-white',
      surface2: 'bg-slate-50',
      border: 'border-slate-200',
      borderSoft: 'border-slate-100',
      muted: 'text-slate-500',
      text: 'text-slate-900',
      title: 'text-slate-900',
      hover: 'hover:bg-slate-100',
      hoverSoft: 'hover:bg-slate-50',
      chip: 'bg-slate-100 text-slate-600',
      input: 'bg-white border-slate-200 text-slate-900',
      mainBg: 'bg-[#F8FAFC]',
      topbarBg: 'bg-white/80 backdrop-blur-xl',
      iconBtn: 'border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900',
    };
  }, [isDarkMode]);

  const Loading = () => (
    <div className={`h-screen flex items-center justify-center ${ui.mainBg}`}>
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className={`text-[10px] font-black uppercase tracking-widest ${ui.muted}`}>{t('Loading dashboard...')}</p>
      </div>
    </div>
  );

  if (loading || !dbLoaded) return <Loading />;

  const storeName =
    (dbUser as any)?.store_name || (user?.user_metadata?.store_name as string) || 'Merchant';
  const storeSlug =
    (dbUser as any)?.store_slug || (user?.user_metadata?.store_slug as string) || '';
  const brandColor =
    (dbUser as any)?.brand_color || (user?.user_metadata?.brand_color as string) || '#6366F1';

  const currency: Currency =
    ((dbUser as any)?.currency as Currency) || ((user?.user_metadata?.currency as Currency) || 'SAR');

  const formatMoney = (amount: number) => `${amount.toFixed(2)} ${currency}`;

  // ✅ pick logo from dbUser or auth metadata
  const logoUrl =
    (dbUser as any)?.logo_url ||
    (dbUser as any)?.store_logo_url ||
    (dbUser as any)?.logo_path ||
    (user?.user_metadata?.store_logo_url as string) ||
    (user?.user_metadata?.logo_url as string) ||
    (user?.user_metadata?.logo_path as string) ||
    null;

  const menuItems = useMemo(
    () => [
      { id: 'overview' as const, label: t('Overview'), icon: <LayoutDashboard size={20} /> },
      { id: 'services' as const, label: t('Services'), icon: <Scissors size={20} /> },
      { id: 'products' as const, label: t('Products'), icon: <Package size={20} /> },
      { id: 'bookings' as const, label: t('Appointments'), icon: <Calendar size={20} /> },
      { id: 'orders' as const, label: t('Sales Ledger'), icon: <ShoppingBag size={20} /> },
      { id: 'customers' as const, label: t('CRM'), icon: <Users size={20} /> },
      { id: 'loyalty' as const, label: t('Loyalty'), icon: <Coins size={20} /> }, // ✅ NEW
      { id: 'settings' as const, label: t('Settings'), icon: <SettingsIcon size={20} /> },
    ],
    [t]
  );

  const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
    <div className={`${ui.surface} border ${ui.borderSoft} rounded-3xl shadow-sm ${className}`}>{children}</div>
  );

  const StatCard = ({ label, value, hint }: { label: string; value: string; hint: string }) => (
    <Card className="p-7 hover:shadow-xl transition-all">
      <div className="flex items-start justify-between">
        <p className={`text-[10px] font-black uppercase tracking-[0.22em] ${ui.muted}`}>{label}</p>
        <span className={`text-[9px] font-black px-2.5 py-1 rounded-lg ${ui.chip}`}>{hint}</span>
      </div>
      <div className="mt-4">
        <p className={`text-3xl font-black tracking-tighter ${ui.title}`}>{value}</p>
      </div>
    </Card>
  );

  const fetchOverview = async () => {
    if (!user?.id) return;

    try {
      setOverviewLoading(true);

      const servicesReq = supabase
        .from('services')
        .select('id', { count: 'exact', head: true })
        .eq('merchant_id', user.id);

      const productsReq = supabase
        .from('products')
        .select('id', { count: 'exact', head: true })
        .eq('merchant_id', user.id);

      const activeReq = supabase
        .from('bookings')
        .select('id', { count: 'exact', head: true })
        .eq('merchant_id', user.id)
        .in('status', ['pending', 'confirmed']);

      const clientsReq = supabase.from('bookings').select('customer_id').eq('merchant_id', user.id);

      const revenueReq = supabase
        .from('bookings')
        .select('price_snapshot, status')
        .eq('merchant_id', user.id)
        // ✅ count ALL non-cancelled money for services (pending/confirmed/completed)
        .neq('status', 'cancelled');

      // ✅ add product revenue from orders (amount)
      const ordersRevenueReq = supabase
        .from('orders')
        .select('amount, currency, status')
        .eq('merchant_id', user.id)
        // ✅ count ALL non-cancelled money for products
        .neq('status', 'cancelled');

      const [servicesRes, productsRes, activeRes, clientsRes, revenueRes, ordersRevenueRes] = await Promise.all([
        servicesReq,
        productsReq,
        activeReq,
        clientsReq,
        revenueReq,
        ordersRevenueReq,
      ]);

      if (servicesRes.error) throw servicesRes.error;
      if (productsRes.error) throw productsRes.error;
      if (activeRes.error) throw activeRes.error;
      if (clientsRes.error) throw clientsRes.error;
      if (revenueRes.error) throw revenueRes.error;
      if ((ordersRevenueRes as any)?.error) throw (ordersRevenueRes as any).error;

      const uniqueClients = new Set((clientsRes.data || []).map((r: any) => r.customer_id).filter(Boolean));

      const bookingRevenue = (revenueRes.data || []).reduce(
        (sum: number, row: any) => sum + Number(row?.price_snapshot || 0),
        0
      );

      const ordersRevenue = ((ordersRevenueRes as any)?.data || []).reduce(
        (sum: number, row: any) => sum + Number(row?.amount || 0),
        0
      );

      const revenue = bookingRevenue + ordersRevenue;

      setOverview({
        revenue,
        activeAppointments: activeRes.count || 0,
        clients: uniqueClients.size,
        services: servicesRes.count || 0,
        products: productsRes.count || 0,
      });

      // ✅ Analytics derived from the same queries above (no extra backend changes)
      const completedBookings = ((revenueRes.data as any[]) || []).length;
      const ordersCount = (((ordersRevenueRes as any)?.data) as any[] | undefined)?.length || 0;

      const safeBookingRev = Number(bookingRevenue || 0);
      const safeOrdersRev = Number(ordersRevenue || 0);
      const safeTotal = Math.max(0, safeBookingRev + safeOrdersRev);

      const avgBookingValue = completedBookings ? safeBookingRev / completedBookings : 0;
      const avgOrderValue = ordersCount ? safeOrdersRev / ordersCount : 0;

      // percentages for Overview “analysis” cards
      const revenueServicePct = safeTotal ? (safeBookingRev / safeTotal) * 100 : 0;
      const revenueProductPct = safeTotal ? (safeOrdersRev / safeTotal) * 100 : 0;

      setAnalytics({
        bookingRevenue: safeBookingRev,
        ordersRevenue: safeOrdersRev,
        revenueServicePct,
        revenueProductPct,
        completedBookings,
        ordersCount,
        avgBookingValue,
        avgOrderValue,
      });
    } catch (err: any) {
      console.error('fetchOverview error:', err?.message || err);
    } finally {
      setOverviewLoading(false);
    }
  };

  useEffect(() => {
    if (!user?.id) return;
    if (activeTab !== 'overview') return;
    fetchOverview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, user?.id]);

  const renderContent = () => {
    switch (activeTab) {
      case 'services':
        return <ServiceList />;
      case 'products':
        return <ProductList />;
      case 'bookings':
        return <BookingsManager />;
      case 'orders':
        return <OrderList />;
      case 'customers':
        return <CustomerList />;
      case 'loyalty': // ✅ NEW
        return <MerchantLoyaltySettings />;
      case 'settings':
        return <Settings />;
      default:
        return (
          <div className="space-y-7 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Card className="p-10">
              <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
                <div>
                  <h1 className={`text-4xl font-black tracking-tighter italic ${ui.title}`}>
                    {t('Welcome, {storeName} 👋', { storeName })}
                  </h1>
                  <p className={`mt-2 font-bold uppercase tracking-[0.22em] text-[10px] ${ui.muted}`}>
                    {t('URL')}: <span className={`${ui.text}`}>servly.com/s/{storeSlug || 'pending...'}</span>
                  </p>

                  <div className="mt-6 flex flex-wrap gap-3">
                    <span className={`px-3 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border ${ui.border} ${ui.surface2}`}>
                      {t('Plan')}: {t('Starter')}
                    </span>
                    <span className={`px-3 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border ${ui.border} ${ui.surface2}`}>
                      {t('Status')}: {t('Active')}
                    </span>
                    <span className={`px-3 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border ${ui.border} ${ui.surface2}`}>
                      {t('Currency')}: {currency}
                    </span>
                    <button
                      type="button"
                      onClick={fetchOverview}
                      className={`px-3 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border ${ui.border} ${ui.surface2} ${ui.hoverSoft}`}
                    >
                      {overviewLoading ? t('Refreshing…') : t('Refresh')}
                    </button>
                  </div>
                </div>

                {storeSlug && (
                  <a
                    href={`/s/${encodeURIComponent((storeSlug || '').toLowerCase())}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 px-6 py-4 text-white rounded-2xl font-black text-xs shadow-xl transition-all hover:-translate-y-0.5"
                    style={{ backgroundColor: brandColor, boxShadow: `0 14px 30px -10px ${brandColor}66` }}
                  >
                    <Store size={16} />
                    {t('View Live Store')}
                    <ExternalLink size={14} />
                  </a>
                )}
              </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
              <StatCard label={t('Gross Revenue')} value={overviewLoading ? '...' : formatMoney(overview.revenue)} hint={t('Completed')} />
              <StatCard label={t('AppointmentsStat')} value={overviewLoading ? '...' : `${overview.activeAppointments}`} hint={t('ActiveHint')} />
              <StatCard label={t('Clients')} value={overviewLoading ? '...' : `${overview.clients}`} hint={t('CRM Hint')} />
              <StatCard label={t('Services')} value={overviewLoading ? '...' : `${overview.services}`} hint={t('Listed')} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-10">
                <p className={`text-[10px] font-black uppercase tracking-[0.22em] ${ui.muted}`}>{t('ProductsCard')}</p>
                <p className={`mt-4 text-4xl font-black tracking-tighter ${ui.title}`}>{overviewLoading ? '...' : overview.products}</p>
                <p className={`mt-2 text-sm font-bold ${ui.muted}`}>{t('Total products in your catalog.')}</p>
              </Card>
            </div>

            {/* ✅ Inbox / Live Requests (Bookings + Orders) */}
            <Card className="p-10">
              <div className="flex items-start justify-between gap-6 flex-wrap">
                <div className="min-w-0">
                  <p className={`text-[10px] font-black uppercase tracking-[0.22em] ${ui.muted}`}>{t('Inbox')}</p>
                  <h3 className={`mt-3 text-2xl font-black tracking-tight italic ${ui.title}`}>{t('Live Requests')}</h3>
                  <p className={`mt-2 font-bold max-w-3xl text-sm leading-relaxed ${ui.muted}`}>
                    {t('Manage bookings and orders in real-time from here.')}
                  </p>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('bookings')}
                    className={`px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border ${ui.border} ${ui.surface2} ${ui.hoverSoft}`}
                  >
                    {t('Open')} • {t('Appointments')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('orders')}
                    className={`px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border ${ui.border} ${ui.surface2} ${ui.hoverSoft}`}
                  >
                    {t('Open')} • {t('Sales Ledger')}
                  </button>
                </div>
              </div>

              <div className="mt-8 grid grid-cols-1 xl:grid-cols-5 gap-6">
  {/* ✅ Bookings (3/5) */}
  <div className={`xl:col-span-3 p-6 rounded-3xl border ${ui.border} ${ui.surface}`}>
    <div className="flex items-center justify-between gap-4 mb-4">
      <p className={`text-[10px] font-black uppercase tracking-[0.22em] ${ui.muted}`}>{t('Latest Bookings')}</p>
      <button
        type="button"
        onClick={() => setActiveTab('bookings')}
        className={`px-3 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border ${ui.border} ${ui.surface2} ${ui.hoverSoft}`}
      >
        {t('Open')}
      </button>
    </div>

    <div className="max-h-[760px] overflow-y-auto overflow-x-visible pr-2">
      <BookingsManager />
    </div>
  </div>

  {/* ✅ Orders (2/5)*/}
  <div className={`xl:col-span-2 p-6 rounded-3xl border ${ui.border} ${ui.surface}`}>
    <div className="flex items-center justify-between gap-4 mb-4">
      <p className={`text-[10px] font-black uppercase tracking-[0.22em] ${ui.muted}`}>{t('Latest Orders')}</p>
      <button
        type="button"
        onClick={() => setActiveTab('orders')}
        className={`px-3 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border ${ui.border} ${ui.surface2} ${ui.hoverSoft}`}
      >
        {t('Open')}
      </button>
    </div>

    <div className="max-h-[760px] overflow-y-auto overflow-x-visible pr-2">
      <OrderList />
    </div>
  </div>
</div>

            </Card>
          </div>
        );
    }
  };

  return (
    <div className={`flex h-screen overflow-hidden font-sans ${ui.pageBg}`} dir={dir}>
      <aside className={`border-r ${ui.border} ${ui.surface} flex flex-col transition-all duration-300 ${isSidebarOpen ? 'w-80' : 'w-24'}`}>
        <div className="p-7 flex items-center gap-4">
          {/* ✅ Sidebar logo instead of "S" */}
          <LogoAvatar
            logoUrl={logoUrl}
            brandColor={brandColor}
            fallbackText="S"
            size={48}
            className="min-w-[48px] h-12"
          />

          {isSidebarOpen && (
            <div className="min-w-0">
              <p className={`font-black text-2xl tracking-tighter uppercase italic ${ui.title}`}>Servly</p>
              <p className={`text-[10px] font-black uppercase tracking-[0.22em] ${ui.muted}`}>{t('Merchant')}</p>
            </div>
          )}
        </div>

        <nav className="flex-1 px-4 space-y-2 overflow-y-auto pb-6">
          {menuItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-black transition-all group border ${
                  isActive ? 'text-white border-transparent shadow-2xl' : `${ui.borderSoft} ${ui.hover}`
                }`}
                style={isActive ? { backgroundColor: brandColor, boxShadow: `0 18px 35px -18px ${brandColor}aa` } : {}}
              >
                <span className="shrink-0 transition-transform group-hover:scale-110">{item.icon}</span>
                {isSidebarOpen && <span className="text-sm tracking-tight">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        <div className={`p-6 border-t ${ui.border}`}>
          <button
            onClick={async () => {
              await signOut();
              navigate('/', { replace: true });
            }}
            className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-black transition-all ${
              isDarkMode ? 'text-rose-300 hover:bg-rose-950/30' : 'text-rose-600 hover:bg-rose-50'
            }`}
          >
            <LogOut size={20} className="shrink-0" />
            {isSidebarOpen && <span className="text-sm uppercase tracking-widest">{t('Logout')}</span>}
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <header className={`h-24 border-b ${ui.border} px-10 flex items-center justify-between sticky top-0 z-20 ${ui.topbarBg}`}>
          <div className="flex items-center gap-6">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className={`p-3 rounded-xl transition-all border ${ui.borderSoft} ${ui.hoverSoft} ${ui.muted}`}
              aria-label={t('Toggle sidebar')}
              title={t('Toggle sidebar')}
            >
              <ChevronRight className={`transition-transform duration-300 ${isSidebarOpen ? 'rotate-180' : ''}`} size={20} />
            </button>

            <button
              type="button"
              onClick={toggleDarkMode}
              className={`p-3 rounded-xl transition-all border ${ui.iconBtn}`}
              title={isDarkMode ? t('Theme: Dark') : t('Theme: Light')}
              aria-label={isDarkMode ? t('Theme: Dark') : t('Theme: Light')}
            >
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <button
              type="button"
              onClick={() => setLang((p) => (p === 'en' ? 'ar' : 'en'))}
              className={`p-3 rounded-xl transition-all border ${ui.iconBtn}`}
              title={lang === 'ar' ? t('Language: AR') : t('Language: EN')}
              aria-label={lang === 'ar' ? t('Language: AR') : t('Language: EN')}
            >
              <Languages size={18} />
            </button>
          </div>

          <div className="flex items-center gap-8">
            <NotificationCenter />

            <div className={`flex items-center gap-4 pl-8 border-l ${ui.border}`}>
              <div className="text-right hidden sm:block">
                <p className={`text-[11px] font-black uppercase tracking-tight ${ui.title}`}>{(dbUser as any)?.full_name || 'Owner'}</p>
                <div className="flex items-center justify-end gap-1 mt-0.5">
                  <ShieldCheck size={10} style={{ color: brandColor }} />
                  <p className="text-[9px] font-black uppercase tracking-widest italic" style={{ color: brandColor }}>
                    {t('Merchant Account')}
                  </p>
                </div>
              </div>

              {/* ✅ Top-right avatar logo instead of first letter */}
              <LogoAvatar
                logoUrl={logoUrl}
                brandColor={brandColor}
                fallbackText={((dbUser as any)?.full_name?.charAt(0) || 'M')}
                size={48}
                className="w-12 h-12 shadow-lg"
                borderClassName="border-4 border-white flex items-center justify-center"
              />
            </div>
          </div>
        </header>

        <div className={`flex-1 overflow-y-auto p-10 ${ui.mainBg}`}>
          <div className="max-w-7xl mx-auto pb-24">{renderContent()}</div>
        </div>
      </main>
    </div>
  );
};

export default MerchantDashboard;


// Loyalty UI additions: subscribers & recent redeems (read-only)
