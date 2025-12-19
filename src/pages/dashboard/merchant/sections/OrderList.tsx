import { useEffect, useState } from 'react';
import { supabase } from '../../../../lib/supabaseClient';
import { useAuth } from '../../../../contexts/AuthContext';
import { ShoppingBag, Eye, Loader2, CheckCircle2, ChevronDown } from 'lucide-react';

interface Order {
  id: string;
  customer_name: string;
  total_price: number;
  status: 'pending' | 'shipped' | 'completed' | 'cancelled';
  created_at: string;
}

const OrderList = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error) setOrders(data || []);
    setLoading(false);
  };

  useEffect(() => { if (user) fetchOrders(); }, [user]);

  // دالة تحديث حالة الطلب في قاعدة البيانات
  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId);

    if (!error) {
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus as any } : o));
    }
    setUpdatingId(null);
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'shipped': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'completed': return 'bg-green-50 text-green-600 border-green-100';
      case 'cancelled': return 'bg-red-50 text-red-600 border-red-100';
      default: return 'bg-gray-50 text-gray-600 border-gray-100';
    }
  };

  return (
    <div className="animate-in fade-in duration-500 text-left">
      <div className="mb-10 flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black tracking-tight">Orders</h2>
          <p className="text-gray-500 mt-1">Manage delivery statuses and track sales.</p>
        </div>
        <div className="bg-purple-50 text-purple-700 px-4 py-2 rounded-2xl text-sm font-bold border border-purple-100">
          Total Orders: {orders.length}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] border border-gray-100 dark:border-gray-700 overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50/50 dark:bg-gray-900/50 text-gray-400 text-[10px] uppercase tracking-[0.15em] font-black">
            <tr>
              <th className="p-6">Order ID</th>
              <th className="p-6">Customer Name</th>
              <th className="p-6">Total Amount</th>
              <th className="p-6">Current Status</th>
              <th className="p-6">Date Purchased</th>
              <th className="p-6 text-center">Manage</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
            {loading ? (
              <tr><td colSpan={6} className="p-20 text-center"><Loader2 className="animate-spin mx-auto text-purple-600" /></td></tr>
            ) : orders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50/30 dark:hover:bg-gray-700/30 transition-colors group">
                <td className="p-6">
                  <span className="font-mono text-[11px] text-gray-400 bg-gray-50 dark:bg-gray-900 px-2 py-1 rounded-lg">
                    #{order.id.slice(0, 8)}
                  </span>
                </td>
                <td className="p-6 font-bold text-gray-900 dark:text-white">{order.customer_name || 'Anonymous'}</td>
                <td className="p-6 font-black text-purple-600">${order.total_price}</td>
                <td className="p-6">
                  <div className="relative inline-block">
                    {updatingId === order.id ? (
                      <Loader2 className="animate-spin text-purple-600 size-4" />
                    ) : (
                      <select 
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                        className={`appearance-none pl-3 pr-8 py-1.5 rounded-xl text-[10px] font-black uppercase border outline-none cursor-pointer transition-all ${getStatusStyle(order.status)}`}
                      >
                        <option value="pending">Pending</option>
                        <option value="shipped">Shipped</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    )}
                    <ChevronDown size={12} className="absolute right-2 top-2.5 pointer-events-none opacity-50" />
                  </div>
                </td>
                <td className="p-6 text-sm text-gray-500 font-medium">
                  {new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </td>
                <td className="p-6 text-center">
                  <button className="p-2.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-gray-700 rounded-xl transition-all">
                    <Eye size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrderList;