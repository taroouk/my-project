import { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Users, 
  Store, 
  BarChart3, 
  ShieldCheck, 
  AlertCircle,
  TrendingUp,
  DollarSign,
  LogOut,
  ArrowUpRight,
  Activity
} from 'lucide-react';

const AdminDashboard = () => {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [merchants, setMerchants] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalMerchants: 0,
    totalCustomers: 0,
    revenue: 45200,
    commissions: 8400
  });

  useEffect(() => {
    const fetchAdminData = async () => {
      setLoading(true);
      // 1. جلب إحصائيات المستخدمين
      const { data: usersData } = await supabase.from('users').select('role');
      const mCount = usersData?.filter(u => u.role === 'merchant').length || 0;
      const cCount = usersData?.filter(u => u.role === 'customer').length || 0;

      // 2. جلب قائمة التجار وتفاصيلهم
      const { data: mList } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'merchant')
        .order('created_at', { ascending: false });

      setStats(prev => ({ ...prev, totalMerchants: mCount, totalCustomers: cCount }));
      setMerchants(mList || []);
      setLoading(false);
    };

    fetchAdminData();
  }, []);

  const handleLogout = async () => {
    await signOut();
    navigate('/login/admin');
  };

  return (
    <div className="flex h-screen bg-[#F4F7FE] dark:bg-gray-950 overflow-hidden font-sans text-gray-900 dark:text-gray-100">
      
      {/* 1. Sidebar المحترف */}
      <aside className="w-72 bg-gray-900 text-white flex flex-col p-8 shadow-2xl relative z-20">
        <div className="flex items-center gap-3 mb-12">
          <div className="w-10 h-10 bg-purple-600 rounded-2xl flex items-center justify-center font-black shadow-lg shadow-purple-500/30">S</div>
          <span className="text-2xl font-black uppercase tracking-tighter">Servly Admin</span>
        </div>

        <nav className="flex-1 space-y-3">
          {[
            { name: 'Dashboard', path: '/admin', icon: BarChart3 },
            { name: 'Merchants', path: '/admin/merchants', icon: Store },
            { name: 'Global Users', path: '/admin/users', icon: Users },
            { name: 'Revenue', path: '/admin/revenue', icon: DollarSign },
          ].map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-4 px-5 py-4 rounded-2xl font-bold transition-all ${
                location.pathname === item.path 
                ? 'bg-purple-600 shadow-xl shadow-purple-900/40 text-white' 
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <item.icon size={22} />
              {item.name}
            </Link>
          ))}
        </nav>

        <button 
          onClick={handleLogout}
          className="mt-auto flex items-center gap-4 px-5 py-4 text-gray-500 font-bold hover:text-red-400 transition-all border-t border-gray-800 pt-6"
        >
          <LogOut size={22} /> Logout
        </button>
      </aside>

      {/* 2. Main Content */}
      <main className="flex-1 overflow-y-auto relative">
        {/* Header */}
        <header className="px-10 py-8 sticky top-0 bg-[#F4F7FE]/80 dark:bg-gray-950/80 backdrop-blur-md z-10 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tight">Main Command Center</h1>
            <p className="text-gray-400 font-bold text-xs mt-1">REAL-TIME PLATFORM MONITORING</p>
          </div>
          <div className="flex items-center gap-4">
             <div className="bg-green-500/10 text-green-500 px-4 py-2 rounded-full text-[10px] font-black uppercase border border-green-500/20 flex items-center gap-2">
                <Activity size={14} className="animate-pulse" /> System Online
             </div>
             <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center text-purple-600">
                <ShieldCheck size={24} />
             </div>
          </div>
        </header>

        <div className="px-10 pb-10">
          <Routes>
            <Route path="/" element={
              <div className="space-y-10 animate-in fade-in duration-700">
                
                {/* Stats Cards: التقارير المالية والإحصائيات */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    { label: 'Total Revenue', val: `$${stats.revenue.toLocaleString()}`, icon: TrendingUp, color: 'text-blue-500', border: 'border-blue-500' },
                    { label: 'Active Stores', val: stats.totalMerchants, icon: Store, color: 'text-purple-500', border: 'border-purple-500' },
                    { label: 'Total Commissions', val: `$${stats.commissions.toLocaleString()}`, icon: DollarSign, color: 'text-green-500', border: 'border-green-500' },
                    { label: 'Customers', val: stats.totalCustomers, icon: Users, color: 'text-orange-500', border: 'border-orange-500' },
                  ].map((s, i) => (
                    <div key={i} className={`bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] border-l-8 ${s.border} shadow-sm group hover:scale-105 transition-all cursor-default`}>
                      <div className="flex justify-between items-start mb-4">
                         <s.icon size={28} className={s.color} />
                         <ArrowUpRight size={18} className="text-gray-200 group-hover:text-gray-400" />
                      </div>
                      <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em]">{s.label}</p>
                      <h3 className="text-3xl font-black mt-2 tracking-tighter">{s.val}</h3>
                    </div>
                  ))}
                </div>

                {/* Financial Insights & Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* الرسم البياني لنمو المنصة */}
                  <div className="bg-white dark:bg-gray-900 p-10 rounded-[3rem] shadow-sm border border-gray-100 dark:border-gray-800 relative">
                    <h3 className="text-xl font-black mb-8 flex items-center gap-2">
                       <BarChart3 size={20} className="text-purple-600" /> Platform Growth
                    </h3>
                    <div className="h-48 flex items-end gap-3 px-2">
                       {[30, 50, 40, 90, 60, 85, 100].map((h, i) => (
                         <div key={i} className="flex-1 bg-gray-50 dark:bg-gray-800 rounded-t-2xl relative group">
                            <div className="absolute bottom-0 w-full bg-purple-600/20 rounded-t-2xl h-full" />
                            <div className="absolute bottom-0 w-full bg-purple-600 rounded-t-2xl transition-all duration-1000 group-hover:bg-purple-400" style={{ height: `${h}%` }}>
                               <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] font-bold px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">+{h}% Growth</span>
                            </div>
                         </div>
                       ))}
                    </div>
                    <div className="flex justify-between mt-6 text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">
                       <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span><span>Jul</span>
                    </div>
                  </div>

                  {/* تنبيهات النظام System Alerts */}
                  <div className="bg-white dark:bg-gray-900 p-10 rounded-[3rem] shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
                    <h3 className="text-xl font-black mb-8 flex items-center gap-2">
                       <AlertCircle size={20} className="text-red-500" /> Critical Alerts
                    </h3>
                    <div className="space-y-4">
                       {[
                         { msg: 'Server Load high at 88%', time: 'Just now', type: 'error' },
                         { msg: 'New Pro Merchant: BarberX', time: '12m ago', type: 'info' },
                         { msg: 'Daily Backup completed', time: '2h ago', type: 'success' },
                         { msg: 'Payment API synchronized', time: '5h ago', type: 'info' },
                       ].map((alert, i) => (
                         <div key={i} className="flex items-center gap-4 p-5 rounded-[1.5rem] bg-gray-50 dark:bg-gray-800/50 border border-transparent hover:border-gray-200 transition-all">
                            <div className={`w-2 h-2 rounded-full ${alert.type === 'error' ? 'bg-red-500' : 'bg-green-500'}`} />
                            <div className="flex-1">
                               <p className="text-sm font-bold">{alert.msg}</p>
                               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-0.5">{alert.time}</p>
                            </div>
                         </div>
                       ))}
                    </div>
                  </div>
                </div>

                {/* جدول التجار الشامل */}
                <div className="bg-white dark:bg-gray-900 rounded-[3rem] p-10 shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
                  <div className="flex justify-between items-center mb-8">
                     <h3 className="text-2xl font-black tracking-tighter uppercase">Merchant Network</h3>
                     <button className="text-xs font-black text-purple-600 hover:underline">Download Report (CSV)</button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-gray-100 dark:border-gray-800">
                          <th className="pb-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Business Name</th>
                          <th className="pb-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Live URL</th>
                          <th className="pb-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Subscription</th>
                          <th className="pb-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Join Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                        {loading ? [1,2,3].map(i => <tr key={i} className="animate-pulse"><td colSpan={4} className="py-4 bg-gray-50 rounded-xl my-2"></td></tr>) : 
                        merchants.map((m) => (
                          <tr key={m.id} className="group hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all">
                            <td className="py-6 pr-4">
                               <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center font-black">
                                     {m.company_name?.charAt(0) || 'M'}
                                  </div>
                                  <span className="font-black dark:text-white uppercase tracking-tighter">{m.company_name || 'Unnamed Store'}</span>
                               </div>
                            </td>
                            <td className="py-6">
                               <span className="text-xs font-bold text-gray-400">servly.com/store/</span>
                               <span className="text-xs font-black text-purple-500">{m.store_slug || '---'}</span>
                            </td>
                            <td className="py-6">
                               <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${m.store_slug ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                                 {m.store_slug ? 'Pro Active' : 'Setup Pending'}
                               </span>
                            </td>
                            <td className="py-6 text-gray-400 text-xs font-medium italic">
                               {new Date(m.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            } />

            <Route path="/merchants" element={<div className="p-20 text-center font-black text-gray-300 italic">Merchant Management Coming Soon...</div>} />
            <Route path="/revenue" element={<div className="p-20 text-center font-black text-gray-300 italic">Financial Breakdown Coming Soon...</div>} />
          </Routes>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;