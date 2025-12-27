import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../../../../lib/supabaseClient';
import { useAuth } from '../../../../contexts/AuthContext';
import { useTheme } from '../../../../contexts/ThemeContext';
import {
  Calendar,
  Clock,
  User,
  CheckCircle2,
  XCircle,
  Phone,
  Loader2,
  Scissors,
  Search,
  Plus,
  X,
  MessageSquare,
} from 'lucide-react';

type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';
type FilterKey = 'all' | BookingStatus;

type BookingDB = {
  id: string;
  merchant_id: string;
  customer_id: string | null;
  service_id: string | null;
  appointment_time: string | null;
  status: string | null;
  notes: string | null;
  created_at: string | null;
};

type CustomerMini = {
  id: string;
  full_name: string | null;
  phone: string | null;
};

type ServiceMini = {
  id: string;
  name: string | null;
  price: number | null;
  duration: number | null;
};

type BookingUI = {
  id: string;
  customer_id: string;
  customer_name: string;
  customer_phone: string;
  service_id: string;
  service_name: string;
  service_price: number;
  service_duration: number;
  appointment_time: string; // ISO
  booking_date: string;
  booking_time: string;
  status: BookingStatus;
  notes: string;
};

const toMoney = (v: number) => {
  // عرض بسيط بدون Intl عشان مايحصلش مشاكل
  const n = Number(v || 0);
  return n.toFixed(2);
};

const BookingsManager = () => {
  const { user, dbUser } = useAuth();
  const { isDarkMode } = useTheme();

  const brandColor =
    (dbUser?.brand_color as string) ||
    (user?.user_metadata?.brand_color as string) ||
    '#6366F1';

  const [bookings, setBookings] = useState<BookingUI[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [filter, setFilter] = useState<FilterKey>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Add Booking Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [customers, setCustomers] = useState<CustomerMini[]>([]);
  const [services, setServices] = useState<ServiceMini[]>([]);
  const [lookupLoading, setLookupLoading] = useState(false);

  const [newBooking, setNewBooking] = useState({
    customer_id: '',
    service_id: '',
    appointment_local: '', // datetime-local
    notes: '',
    status: 'pending' as BookingStatus,
  });

  const ui = useMemo(() => {
    if (isDarkMode) {
      return {
        pageText: 'text-slate-50',
        surface: 'bg-slate-950/40',
        border: 'border-slate-900/60',
        muted: 'text-slate-400',
        muted2: 'text-slate-500',
        input: 'bg-slate-900/40 border-slate-800 text-slate-100 placeholder:text-slate-500',
        soft: 'bg-slate-900/30 border-slate-800 text-slate-200',
        cardHover: 'hover:bg-slate-900/20',
        modalBackdrop: 'bg-black/55',
        modalSurface: 'bg-slate-950 border border-slate-800',
      };
    }
    return {
      pageText: 'text-gray-900',
      surface: 'bg-white',
      border: 'border-gray-50',
      muted: 'text-gray-400',
      muted2: 'text-gray-300',
      input: 'bg-gray-50/60 border-gray-100 text-gray-900 placeholder:text-gray-400',
      soft: 'bg-gray-50 border-gray-100 text-gray-600',
      cardHover: 'hover:bg-gray-50/40',
      modalBackdrop: 'bg-black/20',
      modalSurface: 'bg-white border border-gray-100',
    };
  }, [isDarkMode]);

  const statusStyle = (status: BookingStatus) => {
    // badge + avatar style
    if (isDarkMode) {
      switch (status) {
        case 'confirmed':
          return 'bg-emerald-950/30 text-emerald-200 border-emerald-900/40';
        case 'pending':
          return 'bg-amber-950/30 text-amber-200 border-amber-900/40';
        case 'cancelled':
          return 'bg-rose-950/30 text-rose-200 border-rose-900/40';
        case 'completed':
          return 'bg-blue-950/30 text-blue-200 border-blue-900/40';
        default:
          return 'bg-slate-900/30 text-slate-200 border-slate-800';
      }
    }

    switch (status) {
      case 'confirmed':
        return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'pending':
        return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'cancelled':
        return 'bg-rose-50 text-rose-600 border-rose-100';
      case 'completed':
        return 'bg-blue-50 text-blue-600 border-blue-100';
      default:
        return 'bg-gray-50 text-gray-600 border-gray-100';
    }
  };

  const formatDateTime = (iso: string | null) => {
    if (!iso) return { date: '-', time: '-' };
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return { date: '-', time: '-' };

    const date = d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' });
    const time = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    return { date, time };
  };

  useEffect(() => {
    if (user?.id) fetchBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, filter]);

  const fetchBookings = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);

      let q = supabase
        .schema('public')
        .from('bookings')
        .select('id, merchant_id, customer_id, service_id, appointment_time, status, notes, created_at')
        .eq('merchant_id', user.id)
        .order('appointment_time', { ascending: true });

      if (filter !== 'all') {
        q = q.eq('status', filter);
      }

      const { data, error } = await q;
      if (error) throw error;

      const rows: BookingDB[] = (data || []) as any;

      // Collect ids to hydrate (بدون reliance على FK relations)
      const customerIds = Array.from(
        new Set(rows.map((r) => r.customer_id).filter(Boolean) as string[])
      );
      const serviceIds = Array.from(
        new Set(rows.map((r) => r.service_id).filter(Boolean) as string[])
      );

      // Fetch customers
      const customersMap = new Map<string, CustomerMini>();
      if (customerIds.length > 0) {
        const { data: cu, error: cuErr } = await supabase
          .schema('public')
          .from('users')
          .select('id, full_name, phone')
          .in('id', customerIds);

        if (cuErr) throw cuErr;

        (cu || []).forEach((c: any) => customersMap.set(c.id, c));
      }

      // Fetch services (merchant-owned)
      const servicesMap = new Map<string, ServiceMini>();
      if (serviceIds.length > 0) {
        const { data: se, error: seErr } = await supabase
          .schema('public')
          .from('services')
          .select('id, name, price, duration')
          .in('id', serviceIds)
          .eq('merchant_id', user.id);

        if (seErr) throw seErr;

        (se || []).forEach((s: any) => servicesMap.set(s.id, s));
      }

      // Build UI list
      const formatted: BookingUI[] = rows
        .filter((r) => !!r.customer_id && !!r.service_id)
        .map((r) => {
          const customer = customersMap.get(r.customer_id as string);
          const service = servicesMap.get(r.service_id as string);

          const dt = formatDateTime(r.appointment_time);

          const st = (r.status || 'pending').toLowerCase() as BookingStatus;
          const safeStatus: BookingStatus =
            st === 'pending' || st === 'confirmed' || st === 'completed' || st === 'cancelled'
              ? st
              : 'pending';

          return {
            id: r.id,
            customer_id: r.customer_id as string,
            customer_name: customer?.full_name?.trim() || 'Customer',
            customer_phone: customer?.phone?.trim() || '-',
            service_id: r.service_id as string,
            service_name: service?.name?.trim() || 'Service',
            service_price: Number(service?.price || 0),
            service_duration: Number(service?.duration || 0),
            appointment_time: r.appointment_time || '',
            booking_date: dt.date,
            booking_time: dt.time,
            status: safeStatus,
            notes: r.notes || '',
          };
        });

      setBookings(formatted);
    } catch (err: any) {
      console.error('Error fetching bookings:', err?.message || err);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, newStatus: BookingStatus) => {
    if (!user?.id) return;

    try {
      setActionLoading(true);

      const { error } = await supabase
        .schema('public')
        .from('bookings')
        .update({ status: newStatus })
        .eq('id', id)
        .eq('merchant_id', user.id);

      if (error) throw error;

      await fetchBookings();
    } catch (err: any) {
      alert('Status update failed: ' + (err?.message || 'Unknown error'));
    } finally {
      setActionLoading(false);
    }
  };

  // Load lookup data for modal (customers + services)
  const loadLookup = async () => {
    if (!user?.id) return;

    try {
      setLookupLoading(true);

      const [{ data: cu, error: cuErr }, { data: se, error: seErr }] = await Promise.all([
        supabase.schema('public').from('users').select('id, full_name, phone').eq('role', 'customer').order('created_at', { ascending: false }),
        supabase.schema('public').from('services').select('id, name, price, duration').eq('merchant_id', user.id).order('created_at', { ascending: false }),
      ]);

      if (cuErr) throw cuErr;
      if (seErr) throw seErr;

      setCustomers((cu || []) as any);
      setServices((se || []) as any);
    } catch (err: any) {
      console.error('Lookup loading error:', err?.message || err);
      setCustomers([]);
      setServices([]);
    } finally {
      setLookupLoading(false);
    }
  };

  const openAdd = async () => {
    setShowAddModal(true);
    await loadLookup();
  };

  const createBooking = async () => {
    if (!user?.id) return;

    const customer_id = newBooking.customer_id;
    const service_id = newBooking.service_id;
    const appointment_local = newBooking.appointment_local;

    if (!customer_id || !service_id || !appointment_local) {
      alert('Please select customer, service, and time.');
      return;
    }

    try {
      setActionLoading(true);

      // datetime-local -> ISO
      const iso = new Date(appointment_local).toISOString();

      const payload = {
        merchant_id: user.id,
        customer_id,
        service_id,
        appointment_time: iso,
        status: newBooking.status,
        notes: newBooking.notes?.trim() || null,
      };

      const { error } = await supabase.schema('public').from('bookings').insert([payload]);
      if (error) throw error;

      setShowAddModal(false);
      setNewBooking({ customer_id: '', service_id: '', appointment_local: '', notes: '', status: 'pending' });

      await fetchBookings();
    } catch (err: any) {
      alert('Create booking failed: ' + (err?.message || 'Unknown error'));
    } finally {
      setActionLoading(false);
    }
  };

  const filteredBookings = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return bookings;
    return bookings.filter((b) => {
      const a = (b.customer_name || '').toLowerCase();
      const p = (b.customer_phone || '').toLowerCase();
      const s = (b.service_name || '').toLowerCase();
      return a.includes(q) || p.includes(q) || s.includes(q);
    });
  }, [bookings, searchTerm]);

  return (
    <div className={`space-y-8 animate-in fade-in duration-500 ${ui.pageText}`} dir="ltr">
      {/* Header */}
      <div className={`${ui.surface} p-8 rounded-[2.5rem] border ${ui.border} shadow-sm`}>
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div>
            <h2 className={`text-3xl font-black tracking-tighter italic ${ui.pageText}`}>Appointment Manager</h2>
            <p className={`${ui.muted} font-bold text-[10px] uppercase tracking-[0.2em] mt-1`}>
              Bookings come from bookings table (appointment_time / customer_id / service_id)
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className={`flex flex-wrap p-1.5 rounded-2xl border ${ui.border} ${isDarkMode ? 'bg-slate-900/30' : 'bg-gray-50'}`}>
              {(['all', 'pending', 'confirmed', 'completed', 'cancelled'] as FilterKey[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-5 py-2.5 rounded-xl font-black text-[10px] transition-all uppercase tracking-widest ${
                    filter === f
                      ? isDarkMode
                        ? 'bg-slate-950 text-indigo-200 shadow-sm'
                        : 'bg-white text-indigo-600 shadow-sm'
                      : isDarkMode
                        ? 'text-slate-400 hover:text-slate-200'
                        : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            <button
              onClick={openAdd}
              className="px-6 py-4 rounded-2xl font-black text-xs flex items-center gap-2 shadow-xl active:scale-95 transition-all"
              style={{ backgroundColor: brandColor, color: 'white' }}
            >
              <Plus size={18} /> Add Booking
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="mt-6 relative">
          <Search className={`absolute left-5 top-1/2 -translate-y-1/2 ${isDarkMode ? 'text-slate-500' : 'text-gray-300'}`} size={18} />
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by customer / phone / service..."
            className={`w-full pl-12 pr-5 py-4 rounded-2xl font-bold outline-none border ${ui.input} ${
              isDarkMode ? 'focus:ring-4 focus:ring-indigo-500/20' : 'focus:ring-4 focus:ring-indigo-50'
            }`}
          />
        </div>
      </div>

      {/* List */}
      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="py-24 text-center flex flex-col items-center gap-4">
            <Loader2 className="animate-spin" size={32} style={{ color: brandColor }} />
            <p className={`text-[10px] font-black uppercase tracking-[0.3em] ${ui.muted}`}>
              Syncing Calendar...
            </p>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className={`${isDarkMode ? 'bg-slate-900/20 border-slate-800' : 'bg-gray-50 border-gray-100'} rounded-[3rem] p-24 text-center border-2 border-dashed`}>
            <Calendar size={64} className="mx-auto mb-6" style={{ color: isDarkMode ? '#334155' : '#E5E7EB' }} />
            <h3 className={`text-xl font-black ${ui.pageText}`}>No bookings found</h3>
            <p className={`${ui.muted} font-bold mt-2 text-sm max-w-xs mx-auto`}>
              Add a booking from “Add Booking” or wait for customers to book.
            </p>
          </div>
        ) : (
          filteredBookings.map((b) => (
            <div
              key={b.id}
              className={`${ui.surface} p-6 md:p-8 rounded-[2.5rem] border ${ui.border} shadow-sm hover:shadow-2xl transition-all group relative overflow-hidden ${ui.cardHover}`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                {/* Identity */}
                <div className="flex items-center gap-6 flex-1 min-w-0">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 border-2 transition-transform group-hover:rotate-3 ${statusStyle(b.status)}`}>
                    <User size={28} />
                  </div>

                  <div className="min-w-0">
                    <h3 className={`text-xl font-black mb-1 truncate ${ui.pageText}`}>{b.customer_name}</h3>

                    <div className="flex flex-wrap gap-2">
                      <span className={`flex items-center gap-1.5 font-black text-[9px] uppercase px-3 py-1.5 rounded-lg border ${isDarkMode ? 'bg-slate-900/30 border-slate-800 text-indigo-200' : 'bg-indigo-50 border-indigo-100 text-indigo-600'}`}>
                        <Scissors size={12} strokeWidth={3} /> {b.service_name}
                      </span>

                      <span className={`flex items-center gap-1.5 font-bold text-[9px] uppercase px-3 py-1.5 rounded-lg border ${isDarkMode ? 'bg-slate-900/30 border-slate-800 text-slate-300' : 'bg-gray-50 border-gray-100 text-gray-500'}`}>
                        <Phone size={12} /> {b.customer_phone}
                      </span>

                      {b.notes ? (
                        <span className={`flex items-center gap-1.5 font-bold text-[9px] uppercase px-3 py-1.5 rounded-lg border ${isDarkMode ? 'bg-slate-900/30 border-slate-800 text-slate-300' : 'bg-gray-50 border-gray-100 text-gray-500'}`}>
                          <MessageSquare size={12} /> notes
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>

                {/* Scheduling */}
                <div className={`flex items-center gap-10 px-0 lg:px-10 lg:border-x ${isDarkMode ? 'border-slate-900/60' : 'border-gray-50'}`}>
                  <div className="text-left min-w-[120px]">
                    <p className={`text-[9px] font-black uppercase tracking-widest mb-1 ${ui.muted2}`}>Date</p>
                    <p className={`font-black text-sm ${ui.pageText}`}>{b.booking_date}</p>
                  </div>

                  <div className="text-left min-w-[130px]">
                    <p className={`text-[9px] font-black uppercase tracking-widest mb-1 ${ui.muted2}`}>Time Slot</p>
                    <div className={`flex items-center gap-1.5 font-black px-3 py-1 rounded-lg text-sm w-fit border ${isDarkMode ? 'bg-slate-900/30 border-slate-800 text-indigo-200' : 'bg-indigo-50/50 border-indigo-100 text-indigo-600'}`}>
                      <Clock size={14} /> {b.booking_time}
                    </div>
                  </div>

                  <div className="text-left min-w-[130px]">
                    <p className={`text-[9px] font-black uppercase tracking-widest mb-1 ${ui.muted2}`}>Value</p>
                    <p className={`font-black text-sm ${ui.pageText}`}>
                      {toMoney(b.service_price)} <span className={ui.muted}>SAR</span>
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">
                  {b.status === 'pending' && (
                    <>
                      <button
                        disabled={actionLoading}
                        onClick={() => updateStatus(b.id, 'confirmed')}
                        className="p-4 text-white rounded-2xl font-black shadow-lg transition-all active:scale-90 disabled:opacity-60"
                        style={{ backgroundColor: '#10B981' }}
                        title="Confirm Booking"
                      >
                        <CheckCircle2 size={20} />
                      </button>

                      <button
                        disabled={actionLoading}
                        onClick={() => updateStatus(b.id, 'cancelled')}
                        className={`p-4 rounded-2xl font-black transition-all disabled:opacity-60 ${
                          isDarkMode
                            ? 'bg-slate-900/30 text-slate-300 hover:text-rose-200 hover:bg-rose-950/30 border border-slate-800'
                            : 'bg-gray-50 text-gray-500 hover:bg-rose-50 hover:text-rose-600 border border-gray-100'
                        }`}
                        title="Cancel Booking"
                      >
                        <XCircle size={20} />
                      </button>
                    </>
                  )}

                  {b.status === 'confirmed' && (
                    <>
                      <button
                        disabled={actionLoading}
                        onClick={() => updateStatus(b.id, 'completed')}
                        className="px-8 py-4 text-white rounded-2xl font-black shadow-xl transition-all active:scale-95 text-xs uppercase tracking-widest disabled:opacity-60"
                        style={{ backgroundColor: brandColor }}
                      >
                        Complete Session
                      </button>

                      <button
                        disabled={actionLoading}
                        onClick={() => updateStatus(b.id, 'cancelled')}
                        className={`p-4 rounded-2xl font-black transition-all disabled:opacity-60 ${
                          isDarkMode
                            ? 'bg-slate-900/30 text-slate-300 hover:text-rose-200 hover:bg-rose-950/30 border border-slate-800'
                            : 'bg-gray-50 text-gray-500 hover:bg-rose-50 hover:text-rose-600 border border-gray-100'
                        }`}
                        title="Cancel Booking"
                      >
                        <XCircle size={20} />
                      </button>
                    </>
                  )}

                  <div className={`px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest border-2 ${statusStyle(b.status)}`}>
                    {b.status}
                  </div>
                </div>
              </div>

              {/* Left Accent */}
              <div
                className="absolute top-0 left-0 w-1.5 h-full"
                style={{
                  backgroundColor:
                    b.status === 'confirmed'
                      ? '#34D399'
                      : b.status === 'pending'
                      ? '#FBBF24'
                      : b.status === 'completed'
                      ? '#60A5FA'
                      : '#FB7185',
                }}
              />
            </div>
          ))
        )}
      </div>

      {/* Add Booking Modal */}
      {showAddModal && (
        <div className={`fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-md ${ui.modalBackdrop}`}>
          <div className={`w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden ${ui.modalSurface}`}>
            <div className="p-8 text-white relative" style={{ backgroundColor: brandColor }}>
              <button
                onClick={() => setShowAddModal(false)}
                className="absolute right-6 top-6 p-2 rounded-xl bg-white/10 hover:bg-white/20 transition"
                aria-label="Close"
              >
                <X size={18} />
              </button>

              <h3 className="text-2xl font-black italic tracking-tight">Create Booking</h3>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-90 mt-2">
                Insert into bookings (customer_id / service_id / appointment_time / status / notes)
              </p>
            </div>

            <div className="p-8 space-y-6">
              {lookupLoading ? (
                <div className="py-10 text-center">
                  <Loader2 className="animate-spin mx-auto mb-3" size={28} style={{ color: brandColor }} />
                  <p className={`text-[10px] font-black uppercase tracking-widest ${ui.muted}`}>Loading customers & services...</p>
                </div>
              ) : (
                <>
                  {/* Customer */}
                  <div className="space-y-2">
                    <label className={`text-[10px] font-black uppercase tracking-widest ${ui.muted2}`}>Customer</label>
                    <select
                      value={newBooking.customer_id}
                      onChange={(e) => setNewBooking((p) => ({ ...p, customer_id: e.target.value }))}
                      className={`w-full px-5 py-4 rounded-2xl font-bold outline-none border ${ui.input}`}
                    >
                      <option value="">Select customer...</option>
                      {customers.map((c) => (
                        <option key={c.id} value={c.id}>
                          {(c.full_name || 'Customer') + (c.phone ? ` • ${c.phone}` : '')}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Service */}
                  <div className="space-y-2">
                    <label className={`text-[10px] font-black uppercase tracking-widest ${ui.muted2}`}>Service</label>
                    <select
                      value={newBooking.service_id}
                      onChange={(e) => setNewBooking((p) => ({ ...p, service_id: e.target.value }))}
                      className={`w-full px-5 py-4 rounded-2xl font-bold outline-none border ${ui.input}`}
                    >
                      <option value="">Select service...</option>
                      {services.map((s) => (
                        <option key={s.id} value={s.id}>
                          {(s.name || 'Service') + ` • ${toMoney(Number(s.price || 0))} SAR` + (s.duration ? ` • ${s.duration}m` : '')}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Time */}
                  <div className="space-y-2">
                    <label className={`text-[10px] font-black uppercase tracking-widest ${ui.muted2}`}>Appointment Time</label>
                    <input
                      type="datetime-local"
                      value={newBooking.appointment_local}
                      onChange={(e) => setNewBooking((p) => ({ ...p, appointment_local: e.target.value }))}
                      className={`w-full px-5 py-4 rounded-2xl font-bold outline-none border ${ui.input}`}
                    />
                  </div>

                  {/* Notes */}
                  <div className="space-y-2">
                    <label className={`text-[10px] font-black uppercase tracking-widest ${ui.muted2}`}>Notes (optional)</label>
                    <textarea
                      value={newBooking.notes}
                      onChange={(e) => setNewBooking((p) => ({ ...p, notes: e.target.value }))}
                      rows={3}
                      placeholder="e.g. customer prefers morning slot..."
                      className={`w-full px-5 py-4 rounded-2xl font-bold outline-none border ${ui.input}`}
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => setShowAddModal(false)}
                      className={`flex-1 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
                        isDarkMode ? 'bg-slate-900/40 border border-slate-800 text-slate-200 hover:bg-slate-900/60' : 'bg-gray-50 border border-gray-100 text-gray-600 hover:bg-gray-100'
                      }`}
                      disabled={actionLoading}
                    >
                      Cancel
                    </button>

                    <button
                      onClick={createBooking}
                      className="flex-1 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all text-white flex items-center justify-center gap-2 disabled:opacity-60"
                      style={{ backgroundColor: brandColor }}
                      disabled={actionLoading}
                    >
                      {actionLoading ? <Loader2 className="animate-spin" size={18} /> : 'Create Booking'}
                    </button>
                  </div>

                  <p className={`text-[10px] font-bold ${ui.muted}`}>
                    لو ظهر لك “permission denied / violates RLS”، يبقى محتاج RLS policies على bookings/services/users.
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingsManager;
