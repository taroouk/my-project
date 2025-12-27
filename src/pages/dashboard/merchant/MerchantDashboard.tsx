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
} from 'lucide-react';

// Sections
import ServiceList from './sections/ServiceList';
import ProductList from './sections/ProductList';
import BookingsManager from './sections/BookingsManager';
import OrderList from './sections/OrderList';
import CustomerList from './sections/CustomerList';
import Settings from './sections/Settings';
import NotificationCenter from './sections/components/NotificationCenter';

type TabId =
  | 'overview'
  | 'services'
  | 'products'
  | 'bookings'
  | 'orders'
  | 'customers'
  | 'settings';

type Currency = 'SAR' | 'EGP' | 'AED' | 'USD';

const MerchantDashboard = () => {
  const { user, dbUser, dbLoaded, loading, signOut } = useAuth();
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<TabId>(() => {
    const saved = localStorage.getItem('merchant_active_tab') as TabId | null;
    return saved ?? 'overview';
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // ✅ Overview stats (dynamic)
  const [overview, setOverview] = useState({
    revenue: 0,
    activeAppointments: 0,
    clients: 0,
    services: 0,
    products: 0,
  });
  const [overviewLoading, setOverviewLoading] = useState(false);

  useEffect(() => {
    localStorage.setItem('merchant_active_tab', activeTab);
  }, [activeTab]);

  // حماية الدخول
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

  // Tokens (Light/Dark)
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
    };
  }, [isDarkMode]);

  const Loading = () => (
    <div className={`h-screen flex items-center justify-center ${ui.mainBg}`}>
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className={`text-[10px] font-black uppercase tracking-widest ${ui.muted}`}>Loading dashboard...</p>
      </div>
    </div>
  );

  if (loading || !dbLoaded) return <Loading />;

  // بيانات المتجر + brand color + currency
  const storeName = (dbUser as any)?.store_name || (user?.user_metadata?.store_name as string) || 'Merchant';
  const storeSlug = (dbUser as any)?.store_slug || (user?.user_metadata?.store_slug as string) || '';
  const brandColor = (dbUser as any)?.brand_color || (user?.user_metadata?.brand_color as string) || '#6366F1';

  const currency: Currency =
    ((dbUser as any)?.currency as Currency) ||
    ((user?.user_metadata?.currency as Currency) || 'SAR');

  const formatMoney = (amount: number) => {
    // عرض العملة بشكل ثابت (بدون تعقيد locale)
    return `${amount.toFixed(2)} ${currency}`;
  };

  const menuItems = useMemo(
    () => [
      { id: 'overview' as const, label: 'Overview', icon: <LayoutDashboard size={20} /> },
      { id: 'services' as const, label: 'Services', icon: <Scissors size={20} /> },
      { id: 'products' as const, label: 'Products', icon: <Package size={20} /> },
      { id: 'bookings' as const, label: 'Appointments', icon: <Calendar size={20} /> },
      { id: 'orders' as const, label: 'Sales Ledger', icon: <ShoppingBag size={20} /> },
      { id: 'customers' as const, label: 'CRM', icon: <Users size={20} /> },
      { id: 'settings' as const, label: 'Settings', icon: <SettingsIcon size={20} /> },
    ],
    []
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

  // ✅ Fetch Overview from DB (only THIS merchant)
  const fetchOverview = async () => {
    if (!user?.id) return;

    try {
      setOverviewLoading(true);

      // 1) Services count
      const servicesReq = supabase
        .from('services')
        .select('id', { count: 'exact', head: true })
        .eq('merchant_id', user.id);

      // 2) Products count
      const productsReq = supabase
        .from('products')
        .select('id', { count: 'exact', head: true })
        .eq('merchant_id', user.id);

      // 3) Active bookings (pending + confirmed)
      const activeReq = supabase
        .from('bookings')
        .select('id', { count: 'exact', head: true })
        .eq('merchant_id', user.id)
        .in('status', ['pending', 'confirmed']);

      // 4) Unique clients by customer_id
      const clientsReq = supabase
        .from('bookings')
        .select('customer_id')
        .eq('merchant_id', user.id);

      // 5) Revenue (completed)
      // ملاحظة: لو join services مش شغال عندك، هنحسبها من bookings.total_price لو موجود
      const revenueReq = supabase
        .from('bookings')
        .select('price_snapshot')
        .eq('merchant_id', user.id)
        .eq('status', 'completed');


      const [servicesRes, productsRes, activeRes, clientsRes, revenueRes] = await Promise.all([
        servicesReq,
        productsReq,
        activeReq,
        clientsReq,
        revenueReq,
      ]);

      if (servicesRes.error) throw servicesRes.error;
      if (productsRes.error) throw productsRes.error;
      if (activeRes.error) throw activeRes.error;
      if (clientsRes.error) throw clientsRes.error;
      if (revenueRes.error) throw revenueRes.error;

      const uniqueClients = new Set(
        (clientsRes.data || [])
          .map((r: any) => r.customer_id)
          .filter(Boolean)
      );

      const revenue = (revenueRes.data || []).reduce((sum: number, row: any) => {
      return sum + Number(row?.price_snapshot || 0);
      }, 0);


      setOverview({
        revenue,
        activeAppointments: activeRes.count || 0,
        clients: uniqueClients.size,
        services: servicesRes.count || 0,
        products: productsRes.count || 0,
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
      case 'settings':
        return <Settings />;
      default:
        return (
          <div className="space-y-7 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* HERO */}
            <Card className="p-10">
              <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
                <div>
                  <h1 className={`text-4xl font-black tracking-tighter italic ${ui.title}`}>
                    Welcome, {storeName} 👋
                  </h1>
                  <p className={`mt-2 font-bold uppercase tracking-[0.22em] text-[10px] ${ui.muted}`}>
                    URL:{' '}
                    <span className={`${ui.text}`}>
                      servly.com/s/{storeSlug || 'pending...'}
                    </span>
                  </p>

                  <div className="mt-6 flex flex-wrap gap-3">
                    <span className={`px-3 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border ${ui.border} ${ui.surface2}`}>
                      Plan: Starter
                    </span>
                    <span className={`px-3 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border ${ui.border} ${ui.surface2}`}>
                      Status: Active
                    </span>
                    <span className={`px-3 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border ${ui.border} ${ui.surface2}`}>
                      Currency: {currency}
                    </span>
                    <button
                      type="button"
                      onClick={fetchOverview}
                      className={`px-3 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border ${ui.border} ${ui.surface2} ${ui.hoverSoft}`}
                    >
                      {overviewLoading ? 'Refreshing…' : 'Refresh'}
                    </button>
                  </div>
                </div>

                {storeSlug && (
                  <a
                    href={`/s/${encodeURIComponent((storeSlug || '').toLowerCase())}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 px-6 py-4 text-white rounded-2xl font-black text-xs shadow-xl transition-all hover:-translate-y-0.5"
                    style={{
                      backgroundColor: brandColor,
                      boxShadow: `0 14px 30px -10px ${brandColor}66`,
                    }}
                  >
                    <Store size={16} />
                    View Live Store
                    <ExternalLink size={14} />
                  </a>
                )}
              </div>
            </Card>

            {/* STATS */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
              <StatCard
                label="Gross Revenue"
                value={overviewLoading ? '...' : formatMoney(overview.revenue)}
                hint="Completed"
              />
              <StatCard
                label="Appointments"
                value={overviewLoading ? '...' : `${overview.activeAppointments}`}
                hint="Active"
              />
              <StatCard
                label="Clients"
                value={overviewLoading ? '...' : `${overview.clients}`}
                hint="CRM"
              />
              <StatCard
                label="Services"
                value={overviewLoading ? '...' : `${overview.services}`}
                hint="Listed"
              />
            </div>

            {/* SECOND ROW */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-10">
                <p className={`text-[10px] font-black uppercase tracking-[0.22em] ${ui.muted}`}>Products</p>
                <p className={`mt-4 text-4xl font-black tracking-tighter ${ui.title}`}>
                  {overviewLoading ? '...' : overview.products}
                </p>
                <p className={`mt-2 text-sm font-bold ${ui.muted}`}>Total products in your catalog.</p>
              </Card>

              <Card className="p-10">
                <p className={`text-[10px] font-black uppercase tracking-[0.22em] ${ui.muted}`}>Tips</p>
                <p className={`mt-4 text-lg font-black tracking-tight ${ui.title}`}>
                  Complete more bookings to unlock analytics
                </p>
                <p className={`mt-2 text-sm font-bold ${ui.muted}`}>
                  Revenue will increase automatically once bookings are marked as completed.
                </p>
              </Card>
            </div>

            <Card className="p-16 flex flex-col items-center justify-center text-center min-h-[320px]">
              <div
                className="w-24 h-24 rounded-full flex items-center justify-center mb-8"
                style={{ backgroundColor: brandColor + '15' }}
              >
                <TrendingUp size={46} style={{ color: brandColor }} />
              </div>
              <h3 className={`text-2xl font-black tracking-tight italic ${ui.title}`}>Analytics are warming up</h3>
              <p className={`mt-3 font-bold max-w-sm text-sm leading-relaxed ${ui.muted}`}>
                Once you receive your first booking, analytics will appear here.
              </p>
            </Card>
          </div>
        );
    }
  };

  return (
    <div className={`flex h-screen overflow-hidden font-sans ${ui.pageBg}`} dir="ltr">
      {/* SIDEBAR */}
      <aside
        className={`border-r ${ui.border} ${ui.surface} flex flex-col transition-all duration-300 ${
          isSidebarOpen ? 'w-80' : 'w-24'
        }`}
      >
        <div className="p-7 flex items-center gap-4">
          <div
            className="min-w-[48px] h-12 rounded-2xl flex items-center justify-center text-white font-black shadow-xl text-xl italic"
            style={{ backgroundColor: brandColor }}
          >
            S
          </div>
          {isSidebarOpen && (
            <div className="min-w-0">
              <p className={`font-black text-2xl tracking-tighter uppercase italic ${ui.title}`}>Servly</p>
              <p className={`text-[10px] font-black uppercase tracking-[0.22em] ${ui.muted}`}>Merchant</p>
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
                style={
                  isActive
                    ? { backgroundColor: brandColor, boxShadow: `0 18px 35px -18px ${brandColor}aa` }
                    : {}
                }
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
            {isSidebarOpen && <span className="text-sm uppercase tracking-widest">Logout</span>}
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <header
          className={`h-24 border-b ${ui.border} px-10 flex items-center justify-between sticky top-0 z-20 ${
            isDarkMode ? 'bg-[#020617]/80 backdrop-blur-xl' : 'bg-white/80 backdrop-blur-xl'
          }`}
        >
          <div className="flex items-center gap-6">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className={`p-3 rounded-xl transition-all border ${ui.borderSoft} ${ui.hoverSoft} ${ui.muted}`}
              aria-label="Toggle sidebar"
              title="Toggle sidebar"
            >
              <ChevronRight
                className={`transition-transform duration-300 ${isSidebarOpen ? 'rotate-180' : ''}`}
                size={20}
              />
            </button>
          </div>

          <div className="flex items-center gap-8">
            <NotificationCenter />

            <div className={`flex items-center gap-4 pl-8 border-l ${ui.border}`}>
              <div className="text-right hidden sm:block">
                <p className={`text-[11px] font-black uppercase tracking-tight ${ui.title}`}>
                  {(dbUser as any)?.full_name || 'Owner'}
                </p>
                <div className="flex items-center justify-end gap-1 mt-0.5">
                  <ShieldCheck size={10} style={{ color: brandColor }} />
                  <p className="text-[9px] font-black uppercase tracking-widest italic" style={{ color: brandColor }}>
                    Merchant Account
                  </p>
                </div>
              </div>

              <div
                className="w-12 h-12 rounded-2xl shadow-lg border-4 border-white flex items-center justify-center text-white font-black text-lg"
                style={{ backgroundColor: brandColor }}
              >
                {(dbUser as any)?.full_name?.charAt(0) || 'M'}
              </div>
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
