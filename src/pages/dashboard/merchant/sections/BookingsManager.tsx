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
  RefreshCw,
  CircleDot,
  Check,
} from 'lucide-react';

import { useMerchantLang } from '../useMerchantLang';

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
  created_at: string; // ✅ keep for UI or sorting if needed
};

const toMoney = (v: number) => {
  const n = Number(v || 0);
  return n.toFixed(2);
};

const BookingsManager = () => {
  const { user, dbUser } = useAuth();
  const { t, dir, lang } = useMerchantLang();
  const { isDarkMode } = useTheme();

  const brandColor =
    (dbUser?.brand_color as string) ||
    (user?.user_metadata?.brand_color as string) ||
    '#6366F1';

  const currency =
    (dbUser?.currency as string) ||
    (user?.user_metadata?.currency as string) ||
    'SAR';

  const [bookings, setBookings] = useState<BookingUI[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [lastRefreshAt, setLastRefreshAt] = useState<number | null>(null);

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

  const statusLabel = (s: FilterKey) => {
    if (s === 'all') return t('All', 'الكل');
    if (s === 'pending') return t('Pending', 'قيد الانتظار');
    if (s === 'confirmed') return t('Confirmed', 'مؤكد');
    if (s === 'completed') return t('Completed', 'مكتمل');
    if (s === 'cancelled') return t('Cancelled', 'ملغي');
    return String(s);
  };

  const formatDateTime = (iso: string | null) => {
    if (!iso) return { date: '-', time: '-' };
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return { date: '-', time: '-' };

    const locale = lang === 'ar' ? 'ar-EG' : 'en-US';
    const date = d.toLocaleDateString(locale, {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
    });
    const time = d.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });

    return { date, time };
  };

  useEffect(() => {
    if (user?.id) fetchBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, filter]);

  // ✅ NEWEST FIRST (created_at desc) so latest always on top
  const fetchBookings = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);

      let q = supabase
        .schema('public')
        .from('bookings')
        .select('id, merchant_id, customer_id, service_id, appointment_time, status, notes, created_at')
        .eq('merchant_id', user.id)
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        q = q.eq('status', filter);
      }

      const { data, error } = await q;
      if (error) throw error;

      const rows: BookingDB[] = (data || []) as any;

      const customerIds = Array.from(new Set(rows.map((r) => r.customer_id).filter(Boolean) as string[]));
      const serviceIds = Array.from(new Set(rows.map((r) => r.service_id).filter(Boolean) as string[]));

      const customersMap = new Map<string, CustomerMini>();
      if (customerIds.length > 0) {
        const { data: cu, error: cuErr } = await supabase
          .schema('public')
          .from('users')
          .select('id, full_name, phone')
          .in('id', customerIds);

        if (cuErr) {
          console.warn('customers fetch blocked:', (cuErr as any)?.message || cuErr);
        } else {
          (cu || []).forEach((c: any) => customersMap.set(c.id, c));
        }
      }

      const servicesMap = new Map<string, ServiceMini>();
      if (serviceIds.length > 0) {
        const { data: se, error: seErr } = await supabase
          .schema('public')
          .from('services')
          .select('id, name, price, duration')
          .in('id', serviceIds)
          .eq('merchant_id', user.id);

        if (seErr) {
          console.warn('services fetch blocked:', (seErr as any)?.message || seErr);
        } else {
          (se || []).forEach((s: any) => servicesMap.set(s.id, s));
        }
      }

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
            customer_name: customer?.full_name?.trim() || t('Customer', 'عميل'),
            customer_phone: customer?.phone?.trim() || '-',
            service_id: r.service_id as string,
            service_name: service?.name?.trim() || t('Service', 'خدمة'),
            service_price: Number(service?.price || 0),
            service_duration: Number(service?.duration || 0),
            appointment_time: r.appointment_time || '',
            booking_date: dt.date,
            booking_time: dt.time,
            status: safeStatus,
            notes: r.notes || '',
            created_at: r.created_at || '',
          };
        });

      setBookings(formatted);
      setLastRefreshAt(Date.now());
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
      alert(t('Status update failed: ', 'فشل تحديث الحالة: ') + (err?.message || t('Unknown error', 'خطأ غير معروف')));
    } finally {
      setActionLoading(false);
    }
  };

  const loadLookup = async () => {
    if (!user?.id) return;

    try {
      setLookupLoading(true);

      const [{ data: cu, error: cuErr }, { data: se, error: seErr }] = await Promise.all([
        supabase
          .schema('public')
          .from('users')
          .select('id, full_name, phone')
          .eq('role', 'customer')
          .order('created_at', { ascending: false }),
        supabase
          .schema('public')
          .from('services')
          .select('id, name, price, duration')
          .eq('merchant_id', user.id)
          .order('created_at', { ascending: false }),
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
      alert(t('Please select customer, service, and time.', 'من فضلك اختر العميل والخدمة والوقت.'));
      return;
    }

    try {
      setActionLoading(true);

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
      alert(t('Create booking failed: ', 'فشل إنشاء الحجز: ') + (err?.message || t('Unknown error', 'خطأ غير معروف')));
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

  const counts = useMemo(() => {
    const base = { all: 0, pending: 0, confirmed: 0, completed: 0, cancelled: 0 } as Record<FilterKey, number>;
    base.all = bookings.length;
    for (const b of bookings) {
      if (b.status in base) base[b.status as BookingStatus] += 1;
    }
    return base;
  }, [bookings]);

  const lastRefreshLabel = useMemo(() => {
    if (!lastRefreshAt) return '';
    const d = new Date(lastRefreshAt);
    const locale = lang === 'ar' ? 'ar-EG' : 'en-US';
    return d.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
  }, [lastRefreshAt, lang]);

  return (
    <div className={`space-y-8 animate-in fade-in duration-500 ${ui.pageText}`} dir={dir}>
      {/* Header */}
      <div className={`${ui.surface} p-8 rounded-[2.5rem] border ${ui.border} shadow-sm`}>
        <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-6">
          <div className="min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className={`text-3xl font-black tracking-tighter italic ${ui.pageText}`}>
                {t('Appointment Manager', 'إدارة المواعيد')}
              </h2>
              <span
                className={`px-3 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.22em] border ${ui.border} ${
                  isDarkMode ? 'bg-slate-900/30 text-slate-300' : 'bg-gray-50 text-gray-500'
                }`}
              >
                <CircleDot size={12} className="inline-block -mt-0.5" /> {t('Total', 'الإجمالي')}: {counts.all}
              </span>
            </div>

            <p className={`${ui.muted} font-bold text-[10px] uppercase tracking-[0.2em] mt-2`}>
              {t(
                'Manage, confirm, complete, and cancel appointments from one place.',
                'تابع الحجوزات وقم بالتأكيد/الإلغاء/الإكمال من مكان واحد.'
              )}
            </p>

            {lastRefreshLabel ? (
              <p className={`${ui.muted} font-bold text-[10px] uppercase tracking-[0.22em] mt-2`}>
                {t('Last update', 'آخر تحديث')}: <span className={ui.pageText}>{lastRefreshLabel}</span>
              </p>
            ) : null}
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={fetchBookings}
              disabled={loading}
              className={`px-6 py-4 rounded-2xl font-black text-xs flex items-center justify-center gap-2 border transition-all active:scale-95 disabled:opacity-60 ${
                isDarkMode
                  ? 'bg-slate-900/30 border-slate-800 text-slate-200 hover:bg-slate-900/40'
                  : 'bg-white border-gray-100 text-gray-700 hover:bg-gray-50'
              }`}
              aria-label={t('Refresh', 'تحديث')}
              title={t('Refresh', 'تحديث')}
            >
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
              {t('Refresh', 'تحديث')}
            </button>

            <button
              onClick={openAdd}
              className="px-6 py-4 rounded-2xl font-black text-xs flex items-center justify-center gap-2 shadow-xl active:scale-95 transition-all"
              style={{ backgroundColor: brandColor, color: 'white' }}
            >
              <Plus size={18} /> {t('Add Booking', 'إضافة حجز')}
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="mt-7 flex flex-wrap gap-2">
          {([
            { key: 'all' as const, label: t('All', 'الكل'), count: counts.all },
            { key: 'pending' as const, label: t('Pending', 'قيد الانتظار'), count: counts.pending },
            { key: 'confirmed' as const, label: t('Confirmed', 'مؤكد'), count: counts.confirmed },
            { key: 'completed' as const, label: t('Completed', 'مكتمل'), count: counts.completed },
            { key: 'cancelled' as const, label: t('Cancelled', 'ملغي'), count: counts.cancelled },
          ] as const).map((item) => (
            <button
              key={item.key}
              onClick={() => setFilter(item.key)}
              className={`px-4 py-3 rounded-2xl border font-black text-[10px] uppercase tracking-[0.22em] transition-all ${
                filter === item.key
                  ? isDarkMode
                    ? 'bg-slate-950 border-slate-800 text-indigo-200 shadow-sm'
                    : 'bg-white border-gray-100 text-indigo-600 shadow-sm'
                  : isDarkMode
                  ? 'bg-slate-900/20 border-slate-800 text-slate-300 hover:bg-slate-900/30'
                  : 'bg-gray-50 border-gray-100 text-gray-600 hover:bg-white'
              }`}
            >
              {item.label} <span className={`${filter === item.key ? '' : ui.muted}`}>({item.count})</span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="mt-6 relative">
          <Search className={`absolute left-5 top-1/2 -translate-y-1/2 ${isDarkMode ? 'text-slate-500' : 'text-gray-300'}`} size={18} />
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t('Search by customer / phone / service...', 'ابحث بالعميل / الهاتف / الخدمة...')}
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
            <p className={`text-[10px] font-black uppercase tracking-[0.3em] ${ui.muted}`}>{t('Syncing Calendar...', 'جارٍ مزامنة المواعيد...')}</p>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className={`${isDarkMode ? 'bg-slate-900/20 border-slate-800' : 'bg-gray-50 border-gray-100'} rounded-[3rem] p-24 text-center border-2 border-dashed`}>
            <Calendar size={64} className="mx-auto mb-6" style={{ color: isDarkMode ? '#334155' : '#E5E7EB' }} />
            <h3 className={`text-xl font-black ${ui.pageText}`}>{t('No bookings found', 'لا توجد حجوزات')}</h3>
            <p className={`${ui.muted} font-bold mt-2 text-sm max-w-xs mx-auto`}>
              {t('Add a booking from “Add Booking” or wait for customers to book.', 'أضف حجز من زر “إضافة حجز” أو انتظر العملاء يقوموا بالحجز.')}
            </p>
          </div>
        ) : (
          filteredBookings.map((b) => (
            <div
              key={b.id}
              className={`${ui.surface} rounded-[2.5rem] border ${ui.border} shadow-sm hover:shadow-2xl transition-all group relative overflow-hidden ${ui.cardHover}`}
            >
              {/* Accent */}
              <div
                className="absolute top-0 left-0 w-full h-1.5"
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

              <div className="p-6 md:p-8">
                {/* Top row */}
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                  <div className="flex items-start gap-4 min-w-0">
                    <div className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center shrink-0 border-2 ${statusStyle(b.status)} transition-transform group-hover:rotate-2`}>
                      <User size={26} />
                    </div>

                    <div className="min-w-0">
                      <h3 className={`text-xl md:text-2xl font-black tracking-tight truncate ${ui.pageText}`}>{b.customer_name}</h3>

                      <div className="mt-2 flex flex-wrap gap-2">
                        <span
                          className={`inline-flex items-center gap-2 font-black text-[10px] uppercase tracking-widest px-3 py-2 rounded-2xl border ${
                            isDarkMode ? 'bg-slate-900/30 border-slate-800 text-indigo-200' : 'bg-indigo-50 border-indigo-100 text-indigo-600'
                          }`}
                        >
                          <Scissors size={14} strokeWidth={3} />
                          <span className="truncate max-w-[220px]">{b.service_name}</span>
                        </span>

                        <span
                          className={`inline-flex items-center gap-2 font-bold text-[10px] uppercase tracking-widest px-3 py-2 rounded-2xl border ${
                            isDarkMode ? 'bg-slate-900/30 border-slate-800 text-slate-200' : 'bg-gray-50 border-gray-100 text-gray-600'
                          }`}
                        >
                          <Phone size={14} />
                          {b.customer_phone}
                        </span>

                        {b.service_duration ? (
                          <span
                            className={`inline-flex items-center gap-2 font-bold text-[10px] uppercase tracking-widest px-3 py-2 rounded-2xl border ${
                              isDarkMode ? 'bg-slate-900/30 border-slate-800 text-slate-200' : 'bg-gray-50 border-gray-100 text-gray-600'
                            }`}
                          >
                            <Clock size={14} />
                            {b.service_duration}m
                          </span>
                        ) : null}
                      </div>

                      {b.notes ? (
                        <div className={`mt-3 flex items-start gap-2 rounded-2xl border px-4 py-3 ${isDarkMode ? 'bg-slate-900/20 border-slate-800 text-slate-200' : 'bg-gray-50 border-gray-100 text-gray-700'}`}>
                          <MessageSquare size={16} className={ui.muted} />
                          <p className="text-sm font-bold leading-relaxed line-clamp-2">{b.notes}</p>
                        </div>
                      ) : null}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className={`px-5 py-3 rounded-2xl font-black text-[10px] uppercase tracking-[0.22em] border-2 ${statusStyle(b.status)}`}>
                      {statusLabel(b.status)}
                    </div>
                  </div>
                </div>

                {/* Details + Actions */}
                <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div className={`rounded-3xl border p-5 ${isDarkMode ? 'bg-slate-900/20 border-slate-800' : 'bg-gray-50 border-gray-100'}`}>
                    <p className={`text-[10px] font-black uppercase tracking-[0.22em] ${ui.muted}`}>{t('Schedule', 'الموعد')}</p>
                    <div className="mt-3 space-y-2">
                      <div className="flex items-center justify-between gap-4">
                        <span className={`text-sm font-bold ${ui.muted}`}>{t('Date', 'التاريخ')}</span>
                        <span className={`text-sm font-black ${ui.pageText}`}>{b.booking_date}</span>
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <span className={`text-sm font-bold ${ui.muted}`}>{t('Time', 'الوقت')}</span>
                        <span
                          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-2xl text-sm font-black border ${
                            isDarkMode ? 'bg-slate-950/40 border-slate-800 text-indigo-200' : 'bg-white border-gray-100 text-indigo-600'
                          }`}
                        >
                          <Clock size={14} />
                          {b.booking_time}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className={`rounded-3xl border p-5 ${isDarkMode ? 'bg-slate-900/20 border-slate-800' : 'bg-gray-50 border-gray-100'}`}>
                    <p className={`text-[10px] font-black uppercase tracking-[0.22em] ${ui.muted}`}>{t('Summary', 'الملخص')}</p>
                    <div className="mt-3 space-y-2">
                      <div className="flex items-center justify-between gap-4">
                        <span className={`text-sm font-bold ${ui.muted}`}>{t('Value', 'القيمة')}</span>
                        <span className={`text-sm font-black ${ui.pageText}`}>
                          {toMoney(b.service_price)} <span className={ui.muted}>{currency}</span>
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <span className={`text-sm font-bold ${ui.muted}`}>{t('Service', 'الخدمة')}</span>
                        <span className={`text-sm font-black ${ui.pageText} truncate max-w-[240px]`}>{b.service_name}</span>
                      </div>
                    </div>
                  </div>

                  <div className={`rounded-3xl border p-5 ${isDarkMode ? 'bg-slate-900/20 border-slate-800' : 'bg-gray-50 border-gray-100'}`}>
                    <p className={`text-[10px] font-black uppercase tracking-[0.22em] ${ui.muted}`}>{t('Actions', 'الإجراءات')}</p>

                    <div className="mt-4 space-y-3">
                      {b.status === 'pending' ? (
                        <>
                          <button
                            disabled={actionLoading}
                            onClick={() => updateStatus(b.id, 'confirmed')}
                            className="w-full px-5 py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-white shadow-lg transition-all active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2"
                            style={{ backgroundColor: '#10B981' }}
                          >
                            <CheckCircle2 size={18} />
                            {t('Confirm', 'تأكيد')}
                          </button>

                          <button
                            disabled={actionLoading}
                            onClick={() => updateStatus(b.id, 'cancelled')}
                            className={`w-full px-5 py-4 rounded-2xl font-black text-xs uppercase tracking-widest border transition-all active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2 ${
                              isDarkMode
                                ? 'bg-slate-950/30 border-slate-800 text-slate-200 hover:bg-rose-950/30 hover:text-rose-200'
                                : 'bg-white border-gray-100 text-gray-700 hover:bg-rose-50 hover:text-rose-700'
                            }`}
                          >
                            <XCircle size={18} />
                            {t('Cancel', 'إلغاء')}
                          </button>
                        </>
                      ) : b.status === 'confirmed' ? (
                        <>
                          <button
                            disabled={actionLoading}
                            onClick={() => updateStatus(b.id, 'completed')}
                            className="w-full px-5 py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-white shadow-xl transition-all active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2"
                            style={{ backgroundColor: brandColor }}
                          >
                            <Check size={18} />
                            {t('Complete', 'إكمال')}
                          </button>

                          <button
                            disabled={actionLoading}
                            onClick={() => updateStatus(b.id, 'cancelled')}
                            className={`w-full px-5 py-4 rounded-2xl font-black text-xs uppercase tracking-widest border transition-all active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2 ${
                              isDarkMode
                                ? 'bg-slate-950/30 border-slate-800 text-slate-200 hover:bg-rose-950/30 hover:text-rose-200'
                                : 'bg-white border-gray-100 text-gray-700 hover:bg-rose-50 hover:text-rose-700'
                            }`}
                          >
                            <XCircle size={18} />
                            {t('Cancel', 'إلغاء')}
                          </button>
                        </>
                      ) : (
                        <div className={`flex items-center gap-3 px-4 py-4 rounded-2xl border ${isDarkMode ? 'bg-slate-950/30 border-slate-800 text-slate-200' : 'bg-white border-gray-100 text-gray-700'}`}>
                          <CircleDot size={18} className={ui.muted} />
                          <div className="min-w-0">
                            <p className="text-sm font-black truncate">
                              {b.status === 'completed'
                                ? t('This booking is completed.', 'هذا الحجز مكتمل.')
                                : t('This booking is cancelled.', 'هذا الحجز ملغي.')}
                            </p>
                            <p className={`text-xs font-bold ${ui.muted}`}>{t('No action needed.', 'لا توجد إجراءات مطلوبة.')}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
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
                aria-label={t('Close', 'إغلاق')}
              >
                <X size={18} />
              </button>

              <h3 className="text-2xl font-black italic tracking-tight">{t('Create Booking', 'إنشاء حجز')}</h3>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-90 mt-2">
                {t(
                  'Insert into bookings (customer_id / service_id / appointment_time / status / notes)',
                  'إضافة في bookings (customer_id / service_id / appointment_time / status / notes)'
                )}
              </p>
            </div>

            <div className="p-8 space-y-6">
              {lookupLoading ? (
                <div className="py-10 text-center">
                  <Loader2 className="animate-spin mx-auto mb-3" size={28} style={{ color: brandColor }} />
                  <p className={`text-[10px] font-black uppercase tracking-widest ${ui.muted}`}>
                    {t('Loading customers & services...', 'جارٍ تحميل العملاء والخدمات...')}
                  </p>
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <label className={`text-[10px] font-black uppercase tracking-widest ${ui.muted2}`}>{t('Customer', 'العميل')}</label>
                    <select
                      value={newBooking.customer_id}
                      onChange={(e) => setNewBooking((p) => ({ ...p, customer_id: e.target.value }))}
                      className={`w-full px-5 py-4 rounded-2xl font-bold outline-none border ${ui.input}`}
                    >
                      <option value="">{t('Select customer...', 'اختر العميل...')}</option>
                      {customers.map((c) => (
                        <option key={c.id} value={c.id}>
                          {(c.full_name || t('Customer', 'عميل')) + (c.phone ? ` • ${c.phone}` : '')}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className={`text-[10px] font-black uppercase tracking-widest ${ui.muted2}`}>{t('Service', 'الخدمة')}</label>
                    <select
                      value={newBooking.service_id}
                      onChange={(e) => setNewBooking((p) => ({ ...p, service_id: e.target.value }))}
                      className={`w-full px-5 py-4 rounded-2xl font-bold outline-none border ${ui.input}`}
                    >
                      <option value="">{t('Select service...', 'اختر الخدمة...')}</option>
                      {services.map((s) => (
                        <option key={s.id} value={s.id}>
                          {(s.name || t('Service', 'خدمة')) +
                            ` • ${toMoney(Number(s.price || 0))} ${currency}` +
                            (s.duration ? ` • ${s.duration}m` : '')}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className={`text-[10px] font-black uppercase tracking-widest ${ui.muted2}`}>{t('Appointment Time', 'وقت الموعد')}</label>
                    <input
                      type="datetime-local"
                      value={newBooking.appointment_local}
                      onChange={(e) => setNewBooking((p) => ({ ...p, appointment_local: e.target.value }))}
                      className={`w-full px-5 py-4 rounded-2xl font-bold outline-none border ${ui.input}`}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className={`text-[10px] font-black uppercase tracking-widest ${ui.muted2}`}>{t('Notes (optional)', 'ملاحظات (اختياري)')}</label>
                    <textarea
                      value={newBooking.notes}
                      onChange={(e) => setNewBooking((p) => ({ ...p, notes: e.target.value }))}
                      rows={3}
                      placeholder={t('e.g. customer prefers morning slot...', 'مثال: العميل يفضل الفترة الصباحية...')}
                      className={`w-full px-5 py-4 rounded-2xl font-bold outline-none border ${ui.input}`}
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => setShowAddModal(false)}
                      className={`flex-1 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
                        isDarkMode
                          ? 'bg-slate-900/40 border border-slate-800 text-slate-200 hover:bg-slate-900/60'
                          : 'bg-gray-50 border border-gray-100 text-gray-600 hover:bg-gray-100'
                      }`}
                      disabled={actionLoading}
                    >
                      {t('Cancel', 'إلغاء')}
                    </button>

                    <button
                      onClick={createBooking}
                      className="flex-1 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all text-white flex items-center justify-center gap-2 disabled:opacity-60"
                      style={{ backgroundColor: brandColor }}
                      disabled={actionLoading}
                    >
                      {actionLoading ? <Loader2 className="animate-spin" size={18} /> : t('Create Booking', 'إنشاء حجز')}
                    </button>
                  </div>

                  <p className={`text-[10px] font-bold ${ui.muted}`}>
                    {t(
                      'If you see “permission denied / violates RLS”, you need RLS policies on bookings/services/users.',
                      'إذا ظهر “permission denied / violates RLS”، فأنت تحتاج سياسات RLS على bookings/services/users.'
                    )}
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
