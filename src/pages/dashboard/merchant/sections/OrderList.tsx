import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../../../../lib/supabaseClient';
import { useAuth } from '../../../../contexts/AuthContext';
import { useTheme } from '../../../../contexts/ThemeContext';
import {
  ShoppingBag,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  Filter,
  Search,
  Download,
  Loader2,
  AlertCircle,
  ReceiptText,
  CreditCard,
} from 'lucide-react';

type OrderType = 'service' | 'product';
type OrderStatus = 'paid' | 'pending' | 'failed' | 'refunded';

interface OrderRow {
  id: string;
  merchant_id: string;

  invoice_id?: string | null;
  customer_name?: string | null;
  type?: OrderType | null;

  amount?: number | null;
  currency?: string | null;

  status?: OrderStatus | string | null;
  source?: string | null;

  created_at?: string | null;
}

const OrderList = () => {
  const { user, dbUser } = useAuth();
  const { isDarkMode } = useTheme();

  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  const currencyFallback = (dbUser?.currency || 'SAR').toUpperCase();

  const ui = useMemo(() => {
    if (isDarkMode) {
      return {
        page: 'bg-[#0B1220]',
        surface: 'bg-slate-950/40',
        borderSoft: 'border-slate-900/60',
        text: 'text-slate-50',
        muted: 'text-slate-400',
        muted2: 'text-slate-500',
        input:
          'bg-slate-900/40 border-slate-800 text-slate-100 placeholder:text-slate-500',
        btn: 'bg-indigo-600 hover:bg-indigo-700 text-white',
        btnSoft:
          'bg-slate-900/40 hover:bg-slate-900/60 text-slate-200 border border-slate-800',
        tableHead: 'bg-slate-900/30',
        rowHover: 'hover:bg-slate-900/20',
        chip: 'bg-slate-900/40 border border-slate-800 text-slate-300',
        success: 'bg-emerald-950/20 border-emerald-900/40 text-emerald-200',
        warn: 'bg-amber-950/20 border-amber-900/40 text-amber-200',
        danger: 'bg-rose-950/20 border-rose-900/40 text-rose-200',
      };
    }

    return {
      page: 'bg-[#F8FAFC]',
      surface: 'bg-white',
      borderSoft: 'border-gray-50',
      text: 'text-gray-900',
      muted: 'text-gray-500',
      muted2: 'text-gray-400',
      input:
        'bg-gray-50/50 border-gray-100 text-gray-900 placeholder:text-gray-400',
      btn: 'bg-indigo-600 hover:bg-indigo-700 text-white',
      btnSoft: 'bg-gray-50 hover:bg-gray-100 text-gray-600 border border-gray-100',
      tableHead: 'bg-gray-50/50',
      rowHover: 'hover:bg-gray-50/50',
      chip: 'bg-gray-50 border border-gray-100 text-gray-500',
      success: 'bg-green-50 border-green-100 text-green-700',
      warn: 'bg-amber-50 border-amber-100 text-amber-700',
      danger: 'bg-rose-50 border-rose-100 text-rose-700',
    };
  }, [isDarkMode]);

  // CSV helpers (بديل replaceAll)
  const csvEscape = (value: any) => {
    const raw = String(value ?? '');
    const needsQuotes =
      raw.includes(',') || raw.includes('"') || raw.includes('\n') || raw.includes('\r');
    const escaped = raw.split('"').join('""'); // بدل replaceAll
    return needsQuotes ? `"${escaped}"` : escaped;
  };

  useEffect(() => {
    if (!user?.id) return;

    fetchOrders();

    // Realtime updates (اختياري)
    const channel = supabase
      .channel('orders_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders', filter: `merchant_id=eq.${user.id}` },
        () => fetchOrders()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const fetchOrders = async () => {
    if (!user?.id) return;

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .schema('public')
        .from('orders')
        .select('*')
        .eq('merchant_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setOrders((data as OrderRow[]) || []);
    } catch (err: any) {
      console.error('Fetch orders error:', err?.message || err);
      setOrders([]);
      setError(err?.message || 'Could not load orders.');
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return orders;

    return orders.filter((o) => {
      const invoice = (o.invoice_id || o.id || '').toLowerCase();
      const customer = (o.customer_name || '').toLowerCase();
      const source = (o.source || '').toLowerCase();
      const status = (o.status || '').toLowerCase();
      const type = (o.type || '').toLowerCase();
      return invoice.includes(q) || customer.includes(q) || source.includes(q) || status.includes(q) || type.includes(q);
    });
  }, [orders, query]);

  const summary = useMemo(() => {
    const totalRevenue = orders.reduce((sum, o) => sum + Number(o.amount || 0), 0);
    const serviceCount = orders.filter((o) => o.type === 'service').length;
    const productCount = orders.filter((o) => o.type === 'product').length;
    const paidCount = orders.filter((o) => String(o.status).toLowerCase() === 'paid').length;
    return { totalRevenue, serviceCount, productCount, paidCount };
  }, [orders]);

  const exportCSV = async () => {
    try {
      setActionLoading(true);

      const rows = filtered.map((o) => ({
        invoice_id: o.invoice_id || o.id,
        customer_name: o.customer_name || '',
        type: o.type || '',
        amount: o.amount ?? '',
        currency: (o.currency || currencyFallback).toUpperCase(),
        status: o.status || '',
        source: o.source || '',
        created_at: o.created_at || '',
      }));

      if (rows.length === 0) return;

      const headers = Object.keys(rows[0]);
      const csv =
        headers.join(',') +
        '\n' +
        rows.map((r) => headers.map((h) => csvEscape((r as any)[h])).join(',')).join('\n');

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `sales_ledger_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();

      URL.revokeObjectURL(url);
    } finally {
      setActionLoading(false);
    }
  };

  const badgeForStatus = (status: string) => {
    const s = status.toLowerCase();
    if (s === 'paid') return ui.success;
    if (s === 'pending') return ui.warn;
    if (s === 'failed') return ui.danger;
    if (s === 'refunded') return ui.warn;
    return ui.chip;
  };

  const labelForType = (t?: string | null) => {
    const type = (t || '').toLowerCase();
    if (type === 'service') return { label: 'SERVICE BOOKING', icon: <Clock size={12} /> };
    if (type === 'product') return { label: 'PRODUCT SALE', icon: <ShoppingBag size={12} /> };
    return { label: 'ORDER', icon: <ReceiptText size={12} /> };
  };

  return (
    <div className={`space-y-8 animate-in fade-in duration-500 ${ui.page}`} dir="ltr">
      {/* Header */}
      <div className={`flex flex-col md:flex-row md:items-center justify-between gap-6 ${ui.surface} p-8 rounded-[2.5rem] border ${ui.borderSoft} shadow-sm`}>
        <div>
          <h2 className={`text-3xl font-black tracking-tighter italic ${ui.text}`}>Sales Ledger</h2>
          <p className={`${ui.muted} font-bold text-[10px] uppercase tracking-[0.2em] mt-1`}>
            Track your invoices, bookings, and payments
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={exportCSV}
            disabled={actionLoading || filtered.length === 0}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-xs transition-all ${ui.btnSoft} disabled:opacity-50`}
          >
            {actionLoading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
            Export CSV
          </button>

          <button onClick={fetchOrders} className={`p-3 rounded-2xl shadow-xl transition-all ${ui.btn}`} title="Refresh">
            <Filter size={20} />
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className={`rounded-2xl border p-5 flex items-start gap-3 ${isDarkMode ? 'bg-rose-950/20 border-rose-900/40' : 'bg-rose-50 border-rose-100'}`}>
          <AlertCircle className={isDarkMode ? 'text-rose-300' : 'text-rose-600'} size={18} />
          <div className="flex-1">
            <p className={`text-sm font-black ${isDarkMode ? 'text-rose-200' : 'text-rose-700'}`}>Database error</p>
            <p className={`text-xs font-bold mt-1 ${isDarkMode ? 'text-rose-300/90' : 'text-rose-600'}`}>{error}</p>

            <button onClick={fetchOrders} className={`mt-3 text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl ${ui.btnSoft}`}>
              RETRY
            </button>

            <p className={`mt-3 text-[10px] font-bold ${ui.muted}`}>
              Tip: enable RLS policies for <span className="font-black">orders</span> (select/insert/update/delete for merchant_id = auth.uid()).
            </p>
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className={`${ui.surface} p-6 rounded-[2rem] border ${ui.borderSoft} shadow-sm`}>
          <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${ui.muted2}`}>Total Revenue</p>
          <h3 className={`text-2xl font-black ${ui.text}`}>
            {summary.totalRevenue.toFixed(2)}{' '}
            <small className={`text-xs ${isDarkMode ? 'text-indigo-300' : 'text-indigo-600'}`}>{currencyFallback}</small>
          </h3>
          <p className={`text-[10px] font-bold mt-2 ${ui.muted}`}>Paid orders: {summary.paidCount}</p>
        </div>

        <div className={`${ui.surface} p-6 rounded-[2rem] border ${ui.borderSoft} shadow-sm`}>
          <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${ui.muted2}`}>Service Bookings</p>
          <h3 className={`text-2xl font-black ${ui.text}`}>{summary.serviceCount}</h3>
          <p className={`text-[10px] font-bold mt-2 ${ui.muted}`}>Bookings invoices</p>
        </div>

        <div className={`${ui.surface} p-6 rounded-[2rem] border ${ui.borderSoft} shadow-sm`}>
          <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${ui.muted2}`}>Product Sales</p>
          <h3 className={`text-2xl font-black ${ui.text}`}>{summary.productCount}</h3>
          <p className={`text-[10px] font-bold mt-2 ${ui.muted}`}>Retail invoices</p>
        </div>
      </div>

      {/* Table */}
      <div className={`${ui.surface} rounded-[2.5rem] border ${ui.borderSoft} shadow-sm overflow-hidden`}>
        <div className={`p-6 border-b ${ui.borderSoft} flex items-center relative`}>
          <Search className={`absolute left-10 ${isDarkMode ? 'text-slate-500' : 'text-gray-300'}`} size={18} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by Invoice ID, Customer, Status..."
            className={`w-full pl-12 pr-6 py-3 rounded-xl text-sm font-bold outline-none border focus:ring-2 transition-all ${ui.input} ${
              isDarkMode ? 'focus:ring-indigo-500/20' : 'focus:ring-indigo-100'
            }`}
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className={ui.tableHead}>
              <tr>
                <th className={`px-8 py-5 text-[10px] font-black uppercase tracking-widest ${ui.muted2}`}>Invoice ID</th>
                <th className={`px-8 py-5 text-[10px] font-black uppercase tracking-widest ${ui.muted2}`}>Customer</th>
                <th className={`px-8 py-5 text-[10px] font-black uppercase tracking-widest ${ui.muted2}`}>Type</th>
                <th className={`px-8 py-5 text-[10px] font-black uppercase tracking-widest ${ui.muted2}`}>Amount</th>
                <th className={`px-8 py-5 text-[10px] font-black uppercase tracking-widest ${ui.muted2}`}>Status</th>
                <th className={`px-8 py-5 text-[10px] font-black uppercase tracking-widest ${ui.muted2} text-center`}>Action</th>
              </tr>
            </thead>

            <tbody className={`${isDarkMode ? 'divide-y divide-slate-900/60' : 'divide-y divide-gray-50'}`}>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-8 py-16">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <Loader2 className="animate-spin text-indigo-600" size={28} />
                      <p className={`text-[10px] font-black uppercase tracking-widest ${ui.muted}`}>Loading ledger...</p>
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-8 py-16">
                    <div className="flex flex-col items-center justify-center gap-3 text-center">
                      <div className={`${isDarkMode ? 'bg-slate-900/30 text-slate-500 border border-slate-800' : 'bg-gray-50 text-gray-300 border border-gray-100'} w-14 h-14 rounded-2xl flex items-center justify-center`}>
                        <CreditCard size={28} />
                      </div>
                      <p className={`text-sm font-black ${ui.text}`}>No orders yet</p>
                      <p className={`text-xs font-bold ${ui.muted}`}>Once payments/bookings start, invoices will appear here.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((o) => {
                  const typeMeta = labelForType(o.type);
                  const cur = (o.currency || currencyFallback).toUpperCase();
                  const invoice = o.invoice_id || `#${String(o.id).slice(0, 8).toUpperCase()}`;
                  const customer = o.customer_name || 'Walk-in / Online';
                  const source = o.source || 'Online Pay';
                  const status = String(o.status || 'paid');
                  const amount = Number(o.amount || 0);

                  return (
                    <tr key={o.id} className={`transition-colors ${ui.rowHover} group`}>
                      <td className={`px-8 py-6 font-black text-sm ${ui.text}`}>{invoice}</td>

                      <td className="px-8 py-6">
                        <p className={`text-sm font-bold ${isDarkMode ? 'text-slate-200' : 'text-gray-700'}`}>{customer}</p>
                        <p className={`text-[9px] font-bold uppercase ${ui.muted}`}>Via {source}</p>
                      </td>

                      <td className="px-8 py-6">
                        <span className={`flex items-center gap-1.5 text-[9px] font-black w-fit px-3 py-1 rounded-full border ${ui.chip}`}>
                          {typeMeta.icon}
                          {typeMeta.label}
                        </span>
                      </td>

                      <td className="px-8 py-6">
                        <div className="flex flex-col">
                          <span className={`font-black ${ui.text}`}>
                            {amount.toFixed(2)} <small className={`text-[10px] italic ${ui.muted}`}>{cur}</small>
                          </span>
                          <span className={`text-[9px] font-bold ${ui.muted2}`}>Incl. VAT</span>
                        </div>
                      </td>

                      <td className="px-8 py-6">
                        <div className={`flex items-center gap-1.5 font-black text-[10px] uppercase w-fit px-3 py-1 rounded-lg border ${badgeForStatus(status)}`}>
                          <CheckCircle2 size={12} /> {status}
                        </div>
                      </td>

                      <td className="px-8 py-6 text-center">
                        <button
                          className={`${
                            isDarkMode
                              ? 'text-slate-400 hover:text-indigo-300 hover:bg-slate-900/40 border border-slate-800'
                              : 'text-gray-300 hover:text-indigo-600 hover:bg-white border border-gray-100'
                          } p-2 rounded-xl shadow-sm transition-all`}
                          title="Open invoice"
                        >
                          <ArrowUpRight size={18} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className={`px-8 py-4 border-t ${ui.borderSoft} flex items-center justify-between`}>
          <p className={`text-[10px] font-bold ${ui.muted}`}>
            Table: <span className="font-black">public.orders</span> • merchant scoped
          </p>
          <div className={`text-[10px] font-bold ${ui.muted}`}>
            Showing <span className="font-black">{filtered.length}</span> / {orders.length}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderList;
