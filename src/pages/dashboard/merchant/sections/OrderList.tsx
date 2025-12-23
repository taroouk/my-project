import { useState, useEffect } from 'react';
import { supabase } from '../../../../lib/supabaseClient';
import { useAuth } from '../../../../contexts/AuthContext';
import { 
  ShoppingBag, Receipt, ArrowUpRight, 
  Clock, CheckCircle2, Filter, Search, 
  Download, MoreHorizontal, CreditCard
} from 'lucide-react';

const OrderList = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Note: Data will be dynamic once Payment Integration is completed in Week 6
  return (
    <div className="space-y-8 animate-in fade-in duration-700" dir="ltr">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[2.5rem] border border-gray-50 shadow-sm">
        <div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tighter italic">Sales Ledger</h2>
          <p className="text-gray-400 font-bold text-[10px] uppercase tracking-[0.2em] mt-1">Track your invoices, bookings, and payments</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-6 py-3 bg-gray-50 text-gray-500 rounded-2xl font-black text-xs hover:bg-gray-100 transition-all border border-gray-100">
            <Download size={16} /> Export CSV
          </button>
          <button className="p-3 bg-purple-600 text-white rounded-2xl shadow-xl shadow-purple-100 hover:bg-purple-700 transition-all">
            <Filter size={20} />
          </button>
        </div>
      </div>

      {/* Quick Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[2rem] border border-gray-50 shadow-sm">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Revenue</p>
            <h3 className="text-2xl font-black text-gray-900">450.00 <small className="text-xs text-purple-600">SAR</small></h3>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-gray-50 shadow-sm">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Active Bookings</p>
            <h3 className="text-2xl font-black text-gray-900">12</h3>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-gray-50 shadow-sm">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Product Sales</p>
            <h3 className="text-2xl font-black text-gray-900">08</h3>
        </div>
      </div>

      {/* Sales Table */}
      <div className="bg-white rounded-[2.5rem] border border-gray-50 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex items-center relative">
            <Search className="absolute left-10 text-gray-300" size={18} />
            <input 
                type="text" 
                placeholder="Search by Invoice ID or Customer Name..." 
                className="w-full pl-12 pr-6 py-3 bg-gray-50/50 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-purple-100 transition-all"
            />
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Invoice ID</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Customer</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Type</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Amount</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {[1, 2, 3, 4, 5].map((i) => (
                <tr key={i} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-8 py-6 font-black text-gray-900 text-sm">#INV-990{i}</td>
                  <td className="px-8 py-6">
                    <p className="text-sm font-bold text-gray-700">Test Customer {i}</p>
                    <p className="text-[9px] text-gray-400 font-bold uppercase">Via Online Pay</p>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`flex items-center gap-1.5 text-[9px] font-black w-fit px-3 py-1 rounded-full border ${
                        i % 2 === 0 
                        ? 'text-purple-600 bg-purple-50 border-purple-100' 
                        : 'text-blue-600 bg-blue-50 border-blue-100'
                    }`}>
                      {i % 2 === 0 ? <Clock size={12}/> : <ShoppingBag size={12}/>}
                      {i % 2 === 0 ? 'SERVICE BOOKING' : 'PRODUCT SALE'}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                        <span className="font-black text-gray-900">150.00 <small className="text-[10px] text-gray-400 italic">SAR</small></span>
                        <span className="text-[9px] font-bold text-gray-300">Incl. VAT</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-1.5 text-green-600 font-black text-[10px] uppercase bg-green-50 w-fit px-3 py-1 rounded-lg border border-green-100">
                      <CheckCircle2 size={12} /> Paid
                    </div>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <button className="p-2 text-gray-300 hover:text-purple-600 transition-all hover:bg-white rounded-xl shadow-sm">
                        <ArrowUpRight size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OrderList;