import { useEffect, useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Scissors, Package, Calendar, 
  ShoppingBag, Users, Settings as SettingsIcon, 
  LogOut, Search, ExternalLink, ChevronRight, 
  TrendingUp, Store, ShieldCheck 
} from 'lucide-react';

// Sections
import ServiceList from './sections/ServiceList';
import ProductList from './sections/ProductList';
import BookingsManager from './sections/BookingsManager';
import OrderList from './sections/OrderList';
import CustomerList from './sections/CustomerList';
import Settings from './sections/Settings';
import NotificationCenter from './sections/components/NotificationCenter';

const MerchantDashboard = () => {
  // تم استخراج كل شيء في سطر واحد لتجنب خطأ التكرار (Redeclare)
  const { dbUser, loading, user, refreshUser, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // جلب البيانات فور التحميل
  useEffect(() => {
    if (user) {
      refreshUser();
    }
  }, [user, refreshUser]);

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // تحديد اسم المتجر واللون (مع نظام البدائل لضمان الظهور)
  const storeName = dbUser?.store_name || user?.user_metadata?.store_name || 'Merchant';
  const storeSlug = dbUser?.store_slug || user?.user_metadata?.store_slug || '';
  const brandColor = dbUser?.brand_color || user?.user_metadata?.brand_color || '#6366F1';

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard size={20}/> },
    { id: 'services', label: 'Services', icon: <Scissors size={20}/> },
    { id: 'products', label: 'Products', icon: <Package size={20}/> },
    { id: 'bookings', label: 'Appointments', icon: <Calendar size={20}/> },
    { id: 'orders', label: 'Sales Ledger', icon: <ShoppingBag size={20}/> },
    { id: 'customers', label: 'CRM', icon: <Users size={20}/> },
    { id: 'settings', label: 'Settings', icon: <SettingsIcon size={20}/> },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'services': return <ServiceList />;
      case 'products': return <ProductList />;
      case 'bookings': return <BookingsManager />;
      case 'orders': return <OrderList />;
      case 'customers': return <CustomerList />;
      case 'settings': return <Settings />;
      default: return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          {/* Welcome Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-white p-10 rounded-[2.5rem] border border-gray-50 shadow-sm">
            <div>
              <h1 className="text-4xl font-black text-gray-900 tracking-tighter italic">
                Welcome, {storeName} 👋
              </h1>
              <p className="text-gray-400 font-bold mt-1 uppercase tracking-[0.2em] text-[10px]">
                URL: <span className="text-gray-900">servly.com/s/{storeSlug || 'pending...'}</span>
              </p>
            </div>
            {storeSlug && (
              <a 
                href={`/s/${storeSlug}`} 
                target="_blank" 
                rel="noreferrer"
                className="flex items-center gap-2 px-6 py-4 text-white rounded-2xl font-black text-xs shadow-xl transition-all hover:-translate-y-1"
                style={{ backgroundColor: brandColor, boxShadow: `0 10px 20px -5px ${brandColor}44` }}
              >
                <Store size={16}/> View Live Store <ExternalLink size={14}/>
              </a>
            )}
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <QuickStat label="Gross Revenue" value="0.00 SAR" color="text-emerald-600" trend="+0%" />
            <QuickStat label="Appointments" value="0" color="text-indigo-600" trend="Active" />
            <QuickStat label="Clients" value="0" color="text-blue-600" trend="CRM" />
            <QuickStat label="Points" value={`${dbUser?.loyalty_points || 0}`} color="text-orange-500" trend="Issued" />
          </div>

          <div className="bg-white p-16 rounded-[3rem] border border-gray-50 flex flex-col items-center justify-center text-center min-h-[450px] shadow-sm">
             <div className="w-24 h-24 rounded-full flex items-center justify-center mb-8 animate-pulse" style={{ backgroundColor: brandColor + '15' }}>
                <TrendingUp size={48} style={{ color: brandColor }} />
             </div>
             <h3 className="text-2xl font-black text-gray-900 mb-3 tracking-tight italic">Analytics are warming up</h3>
             <p className="text-gray-400 font-bold max-w-sm text-sm leading-relaxed">
                Once you receive your first booking, analytics will appear here.
             </p>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC] font-sans overflow-hidden" dir="ltr">
      <aside className={`bg-white border-r border-gray-100 flex flex-col transition-all duration-500 ${isSidebarOpen ? 'w-80' : 'w-24'}`}>
        <div className="p-8 flex items-center gap-4 mb-6">
          <div className="min-w-[48px] h-12 rounded-2xl flex items-center justify-center text-white font-black shadow-xl text-xl italic" style={{ backgroundColor: brandColor }}>S</div>
          {isSidebarOpen && <span className="font-black text-2xl tracking-tighter text-gray-900 uppercase italic">Servly</span>}
        </div>

        <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-black transition-all group ${
                activeTab === item.id ? 'text-white shadow-2xl' : 'text-gray-400 hover:bg-gray-50'
              }`}
              style={activeTab === item.id ? { backgroundColor: brandColor, boxShadow: `0 10px 20px -5px ${brandColor}66` } : {}}
            >
              <span className="shrink-0 transition-transform group-hover:scale-110">{item.icon}</span>
              {isSidebarOpen && <span className="text-sm tracking-tight">{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-gray-50">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-5 py-4 text-rose-500 font-black hover:bg-rose-50 rounded-2xl transition-all"
          >
            <LogOut size={20} className="shrink-0"/>
            {isSidebarOpen && <span className="text-sm uppercase tracking-widest">Logout</span>}
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <header className="h-24 bg-white/80 backdrop-blur-xl border-b border-gray-100 px-10 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-6">
             <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-3 bg-gray-50 text-gray-400 hover:text-indigo-600 rounded-xl transition-all">
                <ChevronRight className={`transition-transform duration-500 ${isSidebarOpen ? 'rotate-180' : ''}`} size={20} />
             </button>
          </div>
          <div className="flex items-center gap-8">
            <NotificationCenter />
            <div className="flex items-center gap-4 pl-8 border-l border-gray-100">
               <div className="text-right hidden sm:block">
                  <p className="text-[11px] font-black text-gray-900 uppercase tracking-tight">{dbUser?.full_name || 'Owner'}</p>
                  <div className="flex items-center justify-end gap-1 mt-0.5">
                    <ShieldCheck size={10} style={{ color: brandColor }} />
                    <p className="text-[9px] font-black uppercase tracking-widest italic" style={{ color: brandColor }}>Verified Pro</p>
                  </div>
               </div>
               <div className="w-12 h-12 rounded-2xl shadow-lg border-4 border-white flex items-center justify-center text-white font-black text-lg" style={{ backgroundColor: brandColor }}>
                  {dbUser?.full_name?.charAt(0) || 'M'}
               </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-10 bg-[#F8FAFC]">
          <div className="max-w-7xl mx-auto pb-24">
            {renderContent()}
          </div>
        </div>
      </main>
    </div>
  );
};

const QuickStat = ({ label, value, color, trend }: { label: string, value: string, color: string, trend: string }) => (
  <div className="bg-white p-8 rounded-[2.5rem] border border-gray-50 shadow-sm hover:shadow-xl transition-all">
    <div className="flex justify-between items-start mb-4">
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{label}</p>
      <span className="text-[8px] font-black bg-gray-50 text-gray-400 px-2 py-1 rounded-md italic">{trend}</span>
    </div>
    <h4 className={`text-3xl font-black ${color} tracking-tighter`}>{value}</h4>
  </div>
);

export default MerchantDashboard;