import { useEffect, useState } from 'react';
import { supabase } from '../../../../lib/supabaseClient';
import { useAuth } from '../../../../contexts/AuthContext';
import { 
  Users, 
  TrendingUp, 
  ShoppingBag, 
  DollarSign, 
  Award, 
  ArrowUpRight,
  Search
} from 'lucide-react';

interface Customer {
  full_name: string;
  total_spent: number;
  orders_count: number;
  last_visit: string;
}

const CustomerList = () => {
  const { user } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchCustomers = async () => {
      if (!user) return;
      setLoading(true);
      
      // جلب المواعيد (Bookings) المرتبطة بهذا التاجر لحساب الإحصائيات
      const { data, error } = await supabase
        .from('bookings')
        .select('customer_name, total_price, start_time')
        .eq('merchant_id', user.id);

      if (!error && data) {
        const stats = data.reduce((acc: any, curr) => {
          const name = curr.customer_name || 'Guest';
          if (!acc[name]) {
            acc[name] = { 
              full_name: name, 
              total_spent: 0, 
              orders_count: 0,
              last_visit: curr.start_time 
            };
          }
          acc[name].total_spent += curr.total_price || 0;
          acc[name].orders_count += 1;
          // تحديث تاريخ آخر زيارة إذا كان الموعد أحدث
          if (new Date(curr.start_time) > new Date(acc[name].last_visit)) {
            acc[name].last_visit = curr.start_time;
          }
          return acc;
        }, {});
        
        // ترتيب العملاء حسب الأكثر إنفاقاً
        const sortedCustomers = (Object.values(stats) as Customer[])
          .sort((a, b) => b.total_spent - a.total_spent);
          
        setCustomers(sortedCustomers);
      }
      setLoading(false);
    };
    fetchCustomers();
  }, [user]);

  const filteredCustomers = customers.filter(c => 
    c.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
      
      {/* Header & Search */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-12 gap-8">
        <div>
          <h2 className="text-4xl font-black dark:text-white tracking-tighter uppercase mb-2">
            Customer Insights
          </h2>
          <p className="text-gray-400 font-bold italic flex items-center gap-2">
            <TrendingUp size={18} className="text-emerald-500" /> 
            Tracking {customers.length} unique customers and their habits.
          </p>
        </div>

        <div className="relative w-full lg:w-96">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text"
            placeholder="Search by name..."
            className="w-full pl-14 pr-6 py-5 rounded-[2rem] bg-white dark:bg-gray-900 border-none shadow-sm focus:ring-4 focus:ring-purple-500/10 font-bold transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
           <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
           <p className="text-gray-400 font-black uppercase tracking-widest text-xs">Analyzing behavior...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {filteredCustomers.map((c, i) => (
            <div key={i} className="bg-white dark:bg-gray-900 p-8 rounded-[3.5rem] border border-gray-50 dark:border-gray-800 shadow-sm hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.05)] transition-all duration-500 group relative overflow-hidden">
              
              {/* Top Section: Profile */}
              <div className="flex items-center gap-5 mb-8 relative z-10">
                <div className="w-16 h-16 rounded-[1.5rem] bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-gray-800 text-purple-600 flex items-center justify-center font-black text-2xl shadow-inner group-hover:scale-110 transition-transform">
                  {c.full_name[0]}
                </div>
                <div>
                  <h4 className="font-black text-xl dark:text-white uppercase tracking-tighter">{c.full_name}</h4>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase ${
                      c.total_spent > 500 ? 'bg-amber-100 text-amber-600' : 'bg-gray-100 text-gray-400'
                    }`}>
                      {c.total_spent > 500 ? 'VIP Member' : 'Regular'}
                    </span>
                  </div>
                </div>
                <button className="ml-auto p-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-gray-300 hover:text-purple-600 transition-colors">
                  <ArrowUpRight size={20} />
                </button>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4 relative z-10">
                <div className="bg-gray-50/50 dark:bg-gray-800/50 p-6 rounded-[2rem] border border-gray-100/50 dark:border-gray-700/30">
                  <div className="flex items-center gap-2 mb-2">
                    <ShoppingBag size={14} className="text-purple-400" />
                    <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">Orders</p>
                  </div>
                  <p className="font-black text-3xl dark:text-white tracking-tighter">{c.orders_count}</p>
                </div>

                <div className="bg-emerald-50/30 dark:bg-emerald-900/10 p-6 rounded-[2rem] border border-emerald-50 dark:border-emerald-900/20">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign size={14} className="text-emerald-500" />
                    <p className="text-[10px] text-emerald-600/50 uppercase font-black tracking-widest">Revenue</p>
                  </div>
                  <p className="font-black text-3xl text-emerald-600 tracking-tighter leading-none">
                    <span className="text-sm mr-0.5">$</span>{c.total_spent.toFixed(0)}
                  </p>
                </div>
              </div>

              {/* Bottom Info */}
              <div className="mt-6 pt-6 border-t border-gray-50 dark:border-gray-800 flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-gray-300">
                <div className="flex items-center gap-2">
                   <Award size={14} className={c.orders_count >= 5 ? "text-purple-500" : "text-gray-200"} />
                   {c.orders_count >= 5 ? "Loyalty Pro" : "Building Loyalty"}
                </div>
                <span>Active Client</span>
              </div>

              {/* Decorative Background Icon */}
              <Users className="absolute -right-4 -bottom-4 text-gray-50 dark:text-gray-800/20 w-32 h-32 -z-0 group-hover:text-purple-50 transition-colors duration-500" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomerList;