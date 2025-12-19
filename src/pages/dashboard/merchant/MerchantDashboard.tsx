import { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Calendar, Scissors, Users, Settings, 
  LogOut, TrendingUp, Clock, Bell, Plus, ExternalLink,
  Globe, Save, AlertCircle
} from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../lib/supabaseClient';
import ServiceList from './sections/ServiceList';
import BookingsManager from './sections/BookingsManager';
import CustomerList from './sections/CustomerList';

const MerchantDashboard = () => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // States
  const [stats, setStats] = useState({ revenue: 0, bookingsCount: 0, servicesCount: 0 });
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      // إذا لم يتم العثور على مستخدم بعد، ننتظر قليلاً ثم نغلق التحميل
      if (!user?.id) {
        setTimeout(() => setLoadingStats(false), 2000);
        return;
      }

      try {
        setLoadingStats(true);
        
        // 1. جلب المواعيد والخدمات المرتبطة بها
        const { data: bookings, error: bError } = await supabase
          .from('bookings')
          .select('*, services(name)')
          .eq('merchant_id', user.id)
          .order('created_at', { ascending: false });

        if (bookings) {
          const totalRevenue = bookings
            .filter(b => b.status === 'completed' || b.status === 'confirmed')
            .reduce((acc, curr) => acc + (curr.total_price || 0), 0);
          
          setStats(prev => ({
            ...prev,
            revenue: totalRevenue,
            bookingsCount: bookings.length
          }));
          setRecentBookings(bookings.slice(0, 4));
        }

        // 2. جلب عدد الخدمات
        const { count, error: sError } = await supabase
          .from('services')
          .select('*', { count: 'exact', head: true })
          .eq('merchant_id', user.id);
        
        if (!sError) {
          setStats(prev => ({ ...prev, servicesCount: count || 0 }));
        }

      } catch (err) {
        console.error("Dashboard Sync Error:", err);
      } finally {
        setLoadingStats(false);
      }
    };

    fetchDashboardData();
  }, [user?.id]);

  const menuItems = [
    { name: 'Overview', path: '/merchant', icon: LayoutDashboard },
    { name: 'Bookings', path: '/merchant/bookings', icon: Calendar },
    { name: 'Services', path: '/merchant/services', icon: Scissors },
    { name: 'Customers', path: '/merchant/customers', icon: Users },
    { name: 'Settings', path: '/merchant/settings', icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-[#F4F7FE] dark:bg-gray-950 overflow-hidden font-sans">
      
      {/* Sidebar */}
      <aside className="w-80 bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 flex flex-col p-8">
        <div className="flex items-center gap-4 mb-12 px-2">
          <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center text-white text-2xl font-black shadow-xl">S</div>
          <span className="text-2xl font-black tracking-tighter dark:text-white uppercase italic">Servly</span>
        </div>

        <nav className="flex-1 space-y-3">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-4 px-5 py-4 rounded-3xl font-bold transition-all duration-300 ${
                  isActive 
                  ? 'bg-black text-white shadow-2xl translate-x-2' 
                  : 'text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-black'
                }`}
              >
                <item.icon size={22} strokeWidth={isActive ? 3 : 2} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <button 
          onClick={() => signOut()}
          className="mt-auto flex items-center gap-4 px-5 py-4 text-gray-400 font-bold hover:text-red-500 transition-all"
        >
          <LogOut size={22} /> Sign Out
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-y-auto">
        <header className="px-12 py-8 flex justify-between items-center bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl sticky top-0 z-20 border-b border-gray-100/50">
          <div>
            <h1 className="text-3xl font-black dark:text-white tracking-tight uppercase">
              {user?.user_metadata?.company_name || 'Business Console'}
            </h1>
            <a href={`/store/${user?.user_metadata?.store_slug}`} target="_blank" className="text-xs text-purple-600 font-black flex items-center gap-1 uppercase tracking-widest mt-1 hover:underline">
              View Your Public Store <ExternalLink size={12} />
            </a>
          </div>
          <div className="flex items-center gap-4">
             <div className="text-right hidden sm:block">
                <p className="text-sm font-black dark:text-white">{user?.user_metadata?.full_name || 'Merchant'}</p>
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Store Admin</p>
             </div>
             <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center font-black text-black border-2 border-white shadow-sm uppercase">
                {user?.email?.[0]}
             </div>
          </div>
        </header>

        <div className="p-12 max-w-[1600px]">
          <Routes>
            <Route path="/" element={
              <div className="space-y-12 animate-in fade-in duration-700">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {[
                    { label: 'Revenue', val: `$${stats.revenue}`, icon: TrendingUp, color: 'text-emerald-500' },
                    { label: 'Total Bookings', val: stats.bookingsCount, icon: Calendar, color: 'text-purple-600' },
                    { label: 'Active Services', val: stats.servicesCount, icon: Scissors, color: 'text-blue-500' },
                  ].map((s, i) => (
                    <div key={i} className="bg-white dark:bg-gray-900 p-10 rounded-[3rem] shadow-sm border border-gray-100 dark:border-gray-800 transition-transform hover:-translate-y-1">
                      <s.icon className={`${s.color} mb-6`} size={32} />
                      <p className="text-gray-400 font-black text-[10px] uppercase tracking-widest mb-1">{s.label}</p>
                      <h3 className="text-4xl font-black dark:text-white">
                        {loadingStats ? <span className="animate-pulse">...</span> : s.val}
                      </h3>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                  {/* Recent Activity Table */}
                  <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-[4rem] p-12 shadow-sm border border-gray-100 dark:border-gray-800">
                    <div className="flex justify-between items-center mb-10">
                        <h3 className="text-2xl font-black uppercase italic tracking-tighter">Recent Activity</h3>
                        <button onClick={() => navigate('/merchant/bookings')} className="text-xs font-black uppercase text-gray-400 hover:text-black">View All</button>
                    </div>
                    <div className="space-y-6">
                      {recentBookings.length > 0 ? recentBookings.map((b) => (
                        <div key={b.id} className="flex items-center justify-between p-5 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-[2rem] transition-all border border-transparent hover:border-gray-100">
                          <div className="flex items-center gap-5">
                            <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center font-black text-xl uppercase text-gray-400">
                                {b.customer_name?.[0] || 'C'}
                            </div>
                            <div>
                              <p className="font-black uppercase text-sm">{b.customer_name || 'Guest Customer'}</p>
                              <p className="text-xs text-gray-400 font-bold tracking-tight">{b.services?.name || 'Service Appointment'}</p>
                            </div>
                          </div>
                          <div className="text-right">
                              <span className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full ${
                                b.status === 'confirmed' ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-50 text-gray-400'
                              }`}>
                                {b.status}
                              </span>
                          </div>
                        </div>
                      )) : (
                        <div className="flex flex-col items-center py-20 text-gray-300">
                            <AlertCircle size={48} className="mb-4 opacity-20" />
                            <p className="font-black uppercase tracking-widest italic">No activity recorded yet</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Quick Action Card */}
                  <div className="bg-black rounded-[4rem] p-10 text-white flex flex-col justify-between shadow-2xl shadow-gray-200">
                     <div>
                        <h4 className="text-3xl font-black uppercase italic tracking-tighter mb-4 leading-none">Ready to <br/> Expand?</h4>
                        <p className="text-gray-400 font-bold text-sm leading-relaxed mb-8">Add more services to offer your clients a wider variety of options.</p>
                     </div>
                     <button onClick={() => navigate('/merchant/services')} className="w-full py-5 bg-white text-black rounded-[2rem] font-black hover:scale-105 transition-all flex items-center justify-center gap-2">
                        <Plus size={20} strokeWidth={3} /> Add New Service
                     </button>
                  </div>
                </div>
              </div>
            } />

            <Route path="/services" element={<ServiceList />} />
            <Route path="/bookings" element={<BookingsManager />} />
            <Route path="/customers" element={<CustomerList />} />
            
            <Route path="/settings" element={
              <div className="max-w-4xl animate-in slide-in-from-bottom-4 duration-500">
                <h2 className="text-4xl font-black mb-12 uppercase tracking-tighter italic">Store Identity</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="bg-white dark:bg-gray-900 p-10 rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-sm">
                      <Globe className="text-blue-500 mb-6" size={32} />
                      <label className="text-[10px] font-black text-gray-400 uppercase block mb-3 tracking-widest">Public Store Link</label>
                      <div className="flex items-center gap-2 bg-gray-50 p-4 rounded-2xl font-bold text-gray-500 text-sm overflow-hidden">
                        servly.com/store/{user?.user_metadata?.store_slug || 'your-link'}
                      </div>
                   </div>
                   <div className="bg-white dark:bg-gray-900 p-10 rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col justify-center">
                      <p className="text-gray-300 font-black uppercase text-xs tracking-widest text-center leading-loose">
                        Advanced branding & <br/> color customization <br/> <span className="text-purple-500">coming soon</span>
                      </p>
                   </div>
                </div>
                <button className="mt-12 bg-black text-white px-12 py-5 rounded-[2rem] font-black shadow-2xl flex items-center gap-3 hover:scale-105 transition-all">
                  <Save size={20} /> Save All Changes
                </button>
              </div>
            } />
          </Routes>
        </div>
      </main>
    </div>
  );
};

export default MerchantDashboard;