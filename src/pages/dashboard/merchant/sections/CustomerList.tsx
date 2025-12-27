import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../../../../lib/supabaseClient';
import { useAuth } from '../../../../contexts/AuthContext';
import { useTheme } from '../../../../contexts/ThemeContext';
import {
  Search,
  Filter,
  Gift,
  Crown,
  Loader2,
  ArrowUpRight,
  AlertCircle,
  X,
  UserPlus,
  Phone,
  User as UserIcon,
  Mail,
  Pencil,
  Trash2,
} from 'lucide-react';

type DBUser = {
  id: string;
  email: string | null;
  full_name: string | null;
  phone: string | null;
  role: 'admin' | 'merchant' | 'customer';
  loyalty_points?: number | null;
};

type BookingRow = {
  customer_id: string;
  appointment_time: string | null;
  created_at: string | null;
  status: string | null;
};

type CustomerRow = {
  id: string; // public.users.id
  full_name: string;
  email?: string;
  phone?: string;
  total_bookings: number;
  loyalty_points: number;
  last_visit: string;
};

const CustomerList = () => {
  const { user } = useAuth();
  const { isDarkMode } = useTheme();

  const [customers, setCustomers] = useState<CustomerRow[]>([]);
  const [loading, setLoading] = useState(true);

  const [actionLoading, setActionLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [notice, setNotice] = useState<string | null>(null);

  // Add modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ full_name: '', phone: '', email: '' });

  // Edit modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editCustomerId, setEditCustomerId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ full_name: '', phone: '', email: '' });

  const ui = useMemo(() => {
    if (isDarkMode) {
      return {
        page: 'bg-[#0B1220]',
        surface: 'bg-slate-950/40',
        borderSoft: 'border-slate-900/60',
        text: 'text-slate-50',
        muted: 'text-slate-400',
        muted2: 'text-slate-500',
        input: 'bg-slate-900/40 border-slate-800 text-slate-100 placeholder:text-slate-500',
        btn: 'bg-indigo-600 hover:bg-indigo-700 text-white',
        btnSoft: 'bg-slate-900/40 hover:bg-slate-900/60 text-slate-200 border border-slate-800',
        tableHead: 'bg-slate-900/30',
        rowHover: 'hover:bg-slate-900/20',
        noticeBox: 'bg-amber-950/20 border-amber-900/40 text-amber-200',
        modalBackdrop: 'bg-black/50',
        modalSurface: 'bg-slate-950 border border-slate-800',
        danger: 'bg-rose-600 hover:bg-rose-700 text-white',
        dangerSoft: 'text-rose-300 hover:text-rose-200',
      };
    }
    return {
      page: 'bg-[#F8FAFC]',
      surface: 'bg-white',
      borderSoft: 'border-gray-50',
      text: 'text-gray-900',
      muted: 'text-gray-500',
      muted2: 'text-gray-400',
      input: 'bg-gray-50/50 border-gray-100 text-gray-900 placeholder:text-gray-400',
      btn: 'bg-purple-600 hover:bg-purple-700 text-white',
      btnSoft: 'bg-white hover:bg-gray-50 text-gray-600 border border-gray-100',
      tableHead: 'bg-gray-50/50',
      rowHover: 'hover:bg-gray-50/50',
      noticeBox: 'bg-amber-50 border-amber-100 text-amber-700',
      modalBackdrop: 'bg-black/20',
      modalSurface: 'bg-white border border-gray-100',
      danger: 'bg-rose-600 hover:bg-rose-700 text-white',
      dangerSoft: 'text-rose-500 hover:text-rose-600',
    };
  }, [isDarkMode]);

  const formatDate = (iso: string | null | undefined) => {
    if (!iso) return '-';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '-';
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' });
  };

  const normalizePhone = (phone: string) => phone.split(' ').join('').trim();

  useEffect(() => {
    if (user?.id) fetchCRM();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

 const fetchCRM = async () => {
  if (!user?.id) return;

  setLoading(true);
  setNotice(null);

  try {
    // ✅ 1) bookings الخاصة بالتاجر + join على users (customer)
    const { data: bookingsData, error: bookingsErr } = await supabase
      .schema("public")
      .from("bookings")
      .select(
        `
          customer_id,
          appointment_time,
          created_at,
          status,
          customer:users!bookings_customer_id_fkey (
            id,
            email,
            full_name,
            phone,
            role,
            loyalty_points
          )
        `
      )
      .eq("merchant_id", user.id)
      .not("customer_id", "is", null);

    if (bookingsErr) throw bookingsErr;

    const rows = (bookingsData || []) as any[];

    // ✅ 2) Aggregate فقط للـ customers اللي ظهروا في حجوزات التاجر
    const agg: Record<
      string,
      {
        user: DBUser;
        total: number;
        last: string | null;
      }
    > = {};

    for (const r of rows) {
      const cid: string | null = r.customer_id ?? null;
      const cu: DBUser | null = r.customer ?? null; // alias customer من join
      if (!cid || !cu) continue;

      // لو العميل مش customer فعلاً تجاهله
      if (cu.role !== "customer") continue;

      if (!agg[cid]) {
        agg[cid] = { user: cu, total: 0, last: null };
      }

      agg[cid].total += 1;

      const t = (r.appointment_time as string | null) || (r.created_at as string | null);
      if (t) {
        if (!agg[cid].last || new Date(t).getTime() > new Date(agg[cid].last!).getTime()) {
          agg[cid].last = t;
        }
      }
    }

    const list: CustomerRow[] = Object.values(agg).map((x) => ({
      id: x.user.id,
      full_name: x.user.full_name?.trim() || "Customer",
      email: x.user.email || "",
      phone: x.user.phone || "",
      total_bookings: x.total,
      loyalty_points: Number(x.user.loyalty_points || 0),
      last_visit: formatDate(x.last),
    }));

    list.sort((a, b) => b.total_bookings - a.total_bookings);
    setCustomers(list);

    if (list.length === 0) setNotice("No customers yet. Add a customer or wait for bookings.");
  } catch (err: any) {
    console.error("CRM fetch error:", err?.message || err);
    setCustomers([]);
    setNotice(err?.message || "Could not load CRM data. Check RLS for bookings/users join.");
  } finally {
    setLoading(false);
  }
};


  // ===== ADD via RPC create_customer =====
  const handleAddCustomer = async () => {
    if (!user?.id) return;

    const fullName = newCustomer.full_name.trim();
    const phone = normalizePhone(newCustomer.phone);
    const email = newCustomer.email.trim() || null;

    if (!fullName) {
      setNotice('Please enter customer full name.');
      return;
    }

    setActionLoading(true);
    setNotice(null);

    try {
      const { error } = await supabase.rpc('create_customer', {
        p_full_name: fullName,
        p_phone: phone || null,
        p_email: email,
      });

      if (error) throw error;

      setShowAddModal(false);
      setNewCustomer({ full_name: '', phone: '', email: '' });

      await fetchCRM();
      setNotice('Customer created successfully ✅');
    } catch (err: any) {
      console.error('create_customer error:', err?.message || err);
      setNotice(err?.message || 'Could not create customer.');
    } finally {
      setActionLoading(false);
    }
  };

  // ===== EDIT via RPC update_customer =====
  const openEdit = (c: CustomerRow) => {
    setEditCustomerId(c.id);
    setEditForm({
      full_name: c.full_name || '',
      phone: c.phone || '',
      email: c.email || '',
    });
    setShowEditModal(true);
  };

  const handleUpdateCustomer = async () => {
    if (!editCustomerId) return;

    const fullName = editForm.full_name.trim();
    const phone = normalizePhone(editForm.phone);
    const email = editForm.email.trim() || null;

    if (!fullName) {
      setNotice('Full name is required.');
      return;
    }

    setActionLoading(true);
    setNotice(null);

    try {
      const { data, error } = await supabase.rpc('update_customer', {
        p_customer_id: editCustomerId,
        p_full_name: fullName,
        p_phone: phone || null,
        p_email: email,
      });

      if (error) throw error;
      if (!data) throw new Error('Update failed.');

      setShowEditModal(false);
      setEditCustomerId(null);

      await fetchCRM();
      setNotice('Customer updated ✅');
    } catch (err: any) {
      console.error('update_customer error:', err?.message || err);
      setNotice(err?.message || 'Could not update customer.');
    } finally {
      setActionLoading(false);
    }
  };

  // ===== DELETE via RPC delete_customer_with_bookings =====
  const handleDeleteCustomer = async (customerId: string) => {
    const ok = window.confirm('Delete this customer? If they have bookings, they will be deleted too.');
    if (!ok) return;

    setActionLoading(true);
    setNotice(null);

    try {
      const { data, error } = await supabase.rpc('delete_customer_with_bookings', {
        p_customer_id: customerId,
      });

      if (error) throw error;
      if (!data) throw new Error('Delete failed.');

      await fetchCRM();
      setNotice('Customer deleted ✅');
    } catch (err: any) {
      console.error('delete_customer_with_bookings error:', err?.message || err);
      setNotice(err?.message || 'Could not delete customer.');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredCustomers = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter((c) => {
      const n = c.full_name.toLowerCase();
      const p = (c.phone || '').toLowerCase();
      const e = (c.email || '').toLowerCase();
      return n.includes(q) || p.includes(q) || e.includes(q);
    });
  }, [customers, searchTerm]);

  const vipCount = useMemo(() => customers.filter((c) => c.total_bookings > 3).length, [customers]);
  const totalPoints = useMemo(() => customers.reduce((sum, c) => sum + (c.loyalty_points || 0), 0), [customers]);

  return (
    <div className={`space-y-8 animate-in fade-in duration-500 ${ui.page}`} dir="ltr">
      {/* Header */}
      <div className={`flex flex-col md:flex-row justify-between items-start md:items-center gap-6 ${ui.surface} p-8 rounded-[2.5rem] border ${ui.borderSoft} shadow-sm`}>
        <div>
          <h2 className={`text-3xl font-black tracking-tighter italic ${ui.text}`}>Customer Database (CRM)</h2>
          <p className={`${ui.muted} font-bold text-[10px] uppercase tracking-[0.2em] mt-1`}>
            Manage customers, loyalty points, and engagement
          </p>
        </div>

        <div className="flex gap-3">
          <button onClick={fetchCRM} className={`px-6 py-4 rounded-2xl font-black text-xs transition-all ${ui.btnSoft}`}>
            Refresh
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className={`px-8 py-4 rounded-2xl font-black flex items-center gap-2 shadow-xl transition-all active:scale-95 ${ui.btn}`}
          >
            <UserPlus size={18} /> Add New Customer
          </button>
        </div>
      </div>

      {/* Notice */}
      {notice && (
        <div className={`rounded-2xl border p-5 flex items-start gap-3 ${ui.noticeBox}`}>
          <AlertCircle size={18} />
          <div className="flex-1">
            <p className="text-sm font-black">Notice</p>
            <p className="text-xs font-bold mt-1 opacity-90">{notice}</p>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className={`${ui.surface} p-8 rounded-[2rem] border ${ui.borderSoft} shadow-sm`}>
          <p className={`text-[10px] font-black uppercase tracking-widest ${ui.muted2}`}>Total Clients</p>
          <h4 className={`text-4xl font-black mt-2 ${isDarkMode ? 'text-indigo-200' : 'text-purple-600'}`}>{customers.length}</h4>
        </div>

        <div className={`${ui.surface} p-8 rounded-[2rem] border ${ui.borderSoft} shadow-sm`}>
          <p className={`text-[10px] font-black uppercase tracking-widest ${ui.muted2}`}>VIP Members</p>
          <h4 className={`text-4xl font-black mt-2 ${isDarkMode ? 'text-amber-200' : 'text-amber-500'}`}>{vipCount}</h4>
        </div>

        <div className={`${ui.surface} p-8 rounded-[2rem] border ${ui.borderSoft} shadow-sm`}>
          <p className={`text-[10px] font-black uppercase tracking-widest ${ui.muted2}`}>Loyalty Points Issued</p>
          <h4 className={`text-4xl font-black mt-2 ${isDarkMode ? 'text-emerald-200' : 'text-emerald-500'}`}>{totalPoints}</h4>
        </div>
      </div>

      {/* Table */}
      <div className={`${ui.surface} rounded-[3rem] border ${ui.borderSoft} shadow-sm overflow-hidden`}>
        <div className={`p-8 border-b ${ui.borderSoft} flex flex-col md:flex-row gap-6`}>
          <div className="flex-1 relative group">
            <Search className={`absolute left-5 top-1/2 -translate-y-1/2 ${isDarkMode ? 'text-slate-500' : 'text-gray-300'}`} size={20} />
            <input
              placeholder="Search by name, phone, or email..."
              className={`w-full pl-14 pr-6 py-4 rounded-2xl font-bold outline-none border focus:ring-4 transition-all ${ui.input} ${
                isDarkMode ? 'focus:ring-indigo-500/20' : 'focus:ring-purple-50'
              }`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <button className={`px-8 py-4 rounded-2xl font-black flex items-center justify-center gap-2 transition-all ${ui.btnSoft}`}>
            <Filter size={18} /> Advanced Filters
          </button>
        </div>

        {loading ? (
          <div className="p-20 text-center">
            <Loader2 className="animate-spin mx-auto text-indigo-500 mb-4" size={32} />
            <p className={`text-[10px] font-black uppercase tracking-widest ${ui.muted}`}>Syncing Records...</p>
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="p-24 text-center">
            <p className={`font-black italic ${ui.muted}`}>No customer data available yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className={ui.tableHead}>
                <tr>
                  <th className={`px-10 py-5 text-[10px] font-black uppercase tracking-widest ${ui.muted2}`}>Client</th>
                  <th className={`px-10 py-5 text-[10px] font-black uppercase tracking-widest ${ui.muted2} text-center`}>Bookings</th>
                  <th className={`px-10 py-5 text-[10px] font-black uppercase tracking-widest ${ui.muted2}`}>Points</th>
                  <th className={`px-10 py-5 text-[10px] font-black uppercase tracking-widest ${ui.muted2}`}>Last Visit</th>
                  <th className={`px-10 py-5 text-[10px] font-black uppercase tracking-widest ${ui.muted2} text-right`}>Actions</th>
                </tr>
              </thead>

              <tbody className={`${isDarkMode ? 'divide-y divide-slate-900/60' : 'divide-y divide-gray-50'}`}>
                {filteredCustomers.map((c) => (
                  <tr key={c.id} className={`transition-colors group ${ui.rowHover}`}>
                    <td className="px-10 py-6">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black shadow-lg ${isDarkMode ? 'bg-indigo-600' : 'bg-purple-600'}`}>
                          {c.full_name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className={`font-black truncate ${isDarkMode ? 'text-slate-100' : 'text-gray-900'}`}>{c.full_name}</p>
                          <div className={`text-[10px] font-bold uppercase tracking-widest mt-1 ${ui.muted}`}>
                            {c.phone ? `📞 ${c.phone}` : ''}
                            {c.email ? `  •  ✉️ ${c.email}` : ''}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-10 py-6 text-center">
                      <span className={`${isDarkMode ? 'bg-slate-900/40 border-slate-800 text-slate-200' : 'bg-blue-50 border-blue-100 text-blue-600'} border px-4 py-1.5 rounded-full text-[10px] font-black uppercase`}>
                        {c.total_bookings}
                      </span>
                    </td>

                    <td className="px-10 py-6">
                      <div className={`flex items-center gap-2 font-black ${isDarkMode ? 'text-emerald-200' : 'text-emerald-600'}`}>
                        <Gift size={16} className={isDarkMode ? 'text-emerald-300' : 'text-emerald-400'} />
                        <span className="text-lg">{c.loyalty_points}</span>
                        <span className={`text-[10px] font-bold ${ui.muted2}`}>PTS</span>
                      </div>
                    </td>

                    <td className="px-10 py-6">
                      <span className={`text-sm font-bold italic ${isDarkMode ? 'text-slate-200' : 'text-gray-600'}`}>{c.last_visit}</span>
                    </td>

                    <td className="px-10 py-6 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          disabled={actionLoading}
                          onClick={() => openEdit(c)}
                          className={`p-3 rounded-xl border transition-all ${
                            isDarkMode
                              ? 'border-slate-800 text-slate-300 hover:bg-slate-900/40 hover:text-indigo-300'
                              : 'border-gray-100 text-gray-400 hover:bg-white hover:text-purple-600'
                          }`}
                          title="Edit"
                        >
                          <Pencil size={18} />
                        </button>

                        <button
                          disabled={actionLoading}
                          onClick={() => handleDeleteCustomer(c.id)}
                          className={`p-3 rounded-xl border transition-all ${
                            isDarkMode
                              ? 'border-slate-800 text-rose-300 hover:bg-rose-950/30'
                              : 'border-gray-100 text-rose-500 hover:bg-rose-50'
                          }`}
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>

                        <button
                          className={`p-3 rounded-xl border transition-all ${
                            isDarkMode
                              ? 'border-slate-800 text-slate-400 hover:bg-slate-900/40 hover:text-indigo-300'
                              : 'border-gray-100 text-gray-300 hover:bg-white hover:text-purple-600'
                          }`}
                          title="Open"
                        >
                          <ArrowUpRight size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className={`fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-md ${ui.modalBackdrop}`}>
          <div className={`w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden ${ui.modalSurface}`}>
            <div className={`${isDarkMode ? 'bg-slate-900/60' : 'bg-purple-600'} p-8 text-white relative`}>
              <button onClick={() => setShowAddModal(false)} className="absolute right-6 top-6 p-2 rounded-xl bg-white/10 hover:bg-white/20 transition" aria-label="Close">
                <X size={18} />
              </button>
              <h3 className="text-2xl font-black italic tracking-tight">Add Customer</h3>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-90 mt-2">Create CRM customer</p>
            </div>

            <div className="p-8 space-y-6">
              <div className="space-y-2">
                <label className={`${ui.muted2} text-[10px] font-black uppercase tracking-widest flex items-center gap-2`}>
                  <UserIcon size={14} /> Full Name
                </label>
                <input
                  value={newCustomer.full_name}
                  onChange={(e) => setNewCustomer((p) => ({ ...p, full_name: e.target.value }))}
                  placeholder="e.g. Ahmed Ali"
                  className={`w-full px-5 py-4 rounded-2xl font-bold outline-none border ${ui.input}`}
                />
              </div>

              <div className="space-y-2">
                <label className={`${ui.muted2} text-[10px] font-black uppercase tracking-widest flex items-center gap-2`}>
                  <Phone size={14} /> Phone (optional)
                </label>
                <input
                  value={newCustomer.phone}
                  onChange={(e) => setNewCustomer((p) => ({ ...p, phone: e.target.value }))}
                  placeholder="e.g. +9665xxxxxxx"
                  className={`w-full px-5 py-4 rounded-2xl font-bold outline-none border ${ui.input}`}
                />
              </div>

              <div className="space-y-2">
                <label className={`${ui.muted2} text-[10px] font-black uppercase tracking-widest flex items-center gap-2`}>
                  <Mail size={14} /> Email (optional)
                </label>
                <input
                  value={newCustomer.email}
                  onChange={(e) => setNewCustomer((p) => ({ ...p, email: e.target.value }))}
                  placeholder="e.g. customer@mail.com"
                  className={`w-full px-5 py-4 rounded-2xl font-bold outline-none border ${ui.input}`}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowAddModal(false)} className={`flex-1 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${ui.btnSoft}`} disabled={actionLoading}>
                  Cancel
                </button>
                <button onClick={handleAddCustomer} className={`flex-1 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${ui.btn}`} disabled={actionLoading}>
                  {actionLoading ? <Loader2 className="animate-spin" size={18} /> : 'Save Customer'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className={`fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-md ${ui.modalBackdrop}`}>
          <div className={`w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden ${ui.modalSurface}`}>
            <div className={`${isDarkMode ? 'bg-slate-900/60' : 'bg-indigo-600'} p-8 text-white relative`}>
              <button onClick={() => setShowEditModal(false)} className="absolute right-6 top-6 p-2 rounded-xl bg-white/10 hover:bg-white/20 transition" aria-label="Close">
                <X size={18} />
              </button>
              <h3 className="text-2xl font-black italic tracking-tight">Edit Customer</h3>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-90 mt-2">Update name / phone / email</p>
            </div>

            <div className="p-8 space-y-6">
              <div className="space-y-2">
                <label className={`${ui.muted2} text-[10px] font-black uppercase tracking-widest flex items-center gap-2`}>
                  <UserIcon size={14} /> Full Name
                </label>
                <input
                  value={editForm.full_name}
                  onChange={(e) => setEditForm((p) => ({ ...p, full_name: e.target.value }))}
                  className={`w-full px-5 py-4 rounded-2xl font-bold outline-none border ${ui.input}`}
                />
              </div>

              <div className="space-y-2">
                <label className={`${ui.muted2} text-[10px] font-black uppercase tracking-widest flex items-center gap-2`}>
                  <Phone size={14} /> Phone
                </label>
                <input
                  value={editForm.phone}
                  onChange={(e) => setEditForm((p) => ({ ...p, phone: e.target.value }))}
                  className={`w-full px-5 py-4 rounded-2xl font-bold outline-none border ${ui.input}`}
                />
              </div>

              <div className="space-y-2">
                <label className={`${ui.muted2} text-[10px] font-black uppercase tracking-widest flex items-center gap-2`}>
                  <Mail size={14} /> Email
                </label>
                <input
                  value={editForm.email}
                  onChange={(e) => setEditForm((p) => ({ ...p, email: e.target.value }))}
                  className={`w-full px-5 py-4 rounded-2xl font-bold outline-none border ${ui.input}`}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowEditModal(false)} className={`flex-1 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${ui.btnSoft}`} disabled={actionLoading}>
                  Cancel
                </button>
                <button onClick={handleUpdateCustomer} className={`flex-1 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${ui.btn}`} disabled={actionLoading}>
                  {actionLoading ? <Loader2 className="animate-spin" size={18} /> : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerList;
