import { useState, useEffect } from 'react';
import { supabase } from '../../../../lib/supabaseClient';
import { useAuth } from '../../../../contexts/AuthContext';
import { 
  Users, Search, Mail, Phone, Calendar, 
  Star, MoreVertical, UserPlus, Filter, Gift,
  Crown, Loader2, ArrowUpRight
} from 'lucide-react';

interface Customer {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  total_bookings: number;
  loyalty_points: number;
  last_visit: string;
}

const CustomerList = () => {
  const { user } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (user?.id) fetchCustomers();
  }, [user]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      // Fetching unique customers from the bookings table
      const { data, error } = await supabase
        .from('bookings')
        .select('customer_name, customer_phone, total_price, created_at')
        .eq('merchant_id', user?.id);

      if (error) throw error;

      // Grouping logic to create a unique Customer Database (CRM)
      const uniqueCustomers = data.reduce((acc: any, curr: any) => {
        if (!acc[curr.customer_phone]) {
          acc[curr.customer_phone] = {
            id: Math.random().toString(36).substr(2, 9),
            full_name: curr.customer_name,
            phone: curr.customer_phone,
            total_bookings: 1,
            loyalty_points: Math.floor(curr.total_price / 10), // Example: 1 point for every 10 SAR
            last_visit: new Date(curr.created_at).toLocaleDateString('en-US')
          };
        } else {
          acc[curr.customer_phone].total_bookings += 1;
          acc[curr.customer_phone].loyalty_points += Math.floor(curr.total_price / 10);
        }
        return acc;
      }, {});

      setCustomers(Object.values(uniqueCustomers));
    } catch (err) {
      console.error("Error fetching customers:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter(c => 
    c.full_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.phone.includes(searchTerm)
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700" dir="ltr">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-8 rounded-[2.5rem] border border-gray-50 shadow-sm">
        <div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tighter italic">Customer Database (CRM)</h2>
          <p className="text-gray-400 font-bold text-[10px] uppercase tracking-[0.2em] mt-1">Manage relationships and loyalty programs</p>
        </div>
        <button className="bg-purple-600 text-white px-8 py-4 rounded-2xl font-black flex items-center gap-2 shadow-xl shadow-purple-100 hover:bg-purple-700 hover:-translate-y-1 transition-all active:scale-95">
          <UserPlus size={20} /> Add New Customer
        </button>
      </div>

      {/* CRM Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[2rem] border border-gray-50 shadow-sm relative overflow-hidden group">
           <Users className="absolute -right-4 -top-4 text-purple-50 w-24 h-24 group-hover:scale-110 transition-transform" />
           <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest relative z-10">Total Clients</p>
           <h4 className="text-4xl font-black text-purple-600 mt-2 relative z-10">{customers.length}</h4>
        </div>
        <div className="bg-white p-8 rounded-[2rem] border border-gray-50 shadow-sm relative overflow-hidden group">
           <Crown className="absolute -right-4 -top-4 text-amber-50 w-24 h-24 group-hover:scale-110 transition-transform" />
           <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest relative z-10">VIP Members</p>
           <h4 className="text-4xl font-black text-amber-500 mt-2 relative z-10">
             {customers.filter(c => c.total_bookings > 3).length}
           </h4>
        </div>
        <div className="bg-white p-8 rounded-[2rem] border border-gray-50 shadow-sm relative overflow-hidden group">
           <Gift className="absolute -right-4 -top-4 text-emerald-50 w-24 h-24 group-hover:scale-110 transition-transform" />
           <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest relative z-10">Loyalty Points Issued</p>
           <h4 className="text-4xl font-black text-emerald-500 mt-2 relative z-10">
             {customers.reduce((sum, c) => sum + c.loyalty_points, 0)}
           </h4>
        </div>
      </div>

      {/* Main List Section */}
      <div className="bg-white rounded-[3rem] border border-gray-50 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-gray-50 flex flex-col md:row gap-6">
           <div className="flex-1 relative group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-purple-600 transition-colors" size={20}/>
              <input 
                placeholder="Search by name or mobile number..." 
                className="w-full pl-14 pr-6 py-4 bg-gray-50/50 rounded-2xl font-bold outline-none focus:ring-4 focus:ring-purple-50 transition-all border border-transparent focus:border-purple-100"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
           </div>
           <button className="px-8 py-4 bg-white border border-gray-100 rounded-2xl font-black text-gray-500 flex items-center justify-center gap-2 hover:bg-gray-50 transition-all">
              <Filter size={18}/> Advanced Filters
           </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="px-10 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Client Identity</th>
                <th className="px-10 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Engagement</th>
                <th className="px-10 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Reward Points</th>
                <th className="px-10 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Recent Activity</th>
                <th className="px-10 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={5} className="p-20 text-center"><Loader2 className="animate-spin mx-auto text-purple-600 mb-4" size={32}/><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Syncing Records...</p></td></tr>
              ) : filteredCustomers.length === 0 ? (
                <tr><td colSpan={5} className="p-32 text-center text-gray-300 font-bold italic border-2 border-dashed border-gray-50 m-4 rounded-[2rem]">No customer data available yet</td></tr>
              ) : (
                filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50/50 transition-colors group cursor-pointer">
                    <td className="px-10 py-6">
                       <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl flex items-center justify-center text-white font-black shadow-lg shadow-purple-100 group-hover:scale-110 transition-transform">
                             {customer.full_name.charAt(0)}
                          </div>
                          <div>
                             <p className="font-black text-gray-900 group-hover:text-purple-600 transition-colors">{customer.full_name}</p>
                             <p className="text-[10px] text-gray-400 font-bold tracking-widest uppercase mt-1">{customer.phone}</p>
                          </div>
                       </div>
                    </td>
                    <td className="px-10 py-6 text-center">
                       <span className="bg-blue-50 text-blue-600 border border-blue-100 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter">
                         {customer.total_bookings} Bookings
                       </span>
                    </td>
                    <td className="px-10 py-6">
                       <div className="flex items-center gap-2 text-emerald-600 font-black">
                          <Gift size={16} className="text-emerald-400"/>
                          <span className="text-lg">{customer.loyalty_points}</span>
                          <span className="text-[10px] text-gray-300 font-bold tracking-tighter">PTS</span>
                       </div>
                    </td>
                    <td className="px-10 py-6">
                       <div className="flex flex-col">
                          <span className="text-sm text-gray-600 font-bold italic">{customer.last_visit}</span>
                          <span className="text-[9px] text-gray-300 font-black uppercase">Last Invoice Paid</span>
                       </div>
                    </td>
                    <td className="px-10 py-6 text-right">
                       <button className="p-3 text-gray-300 hover:text-purple-600 hover:bg-white rounded-xl shadow-sm transition-all">
                         <ArrowUpRight size={20}/>
                       </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CustomerList;