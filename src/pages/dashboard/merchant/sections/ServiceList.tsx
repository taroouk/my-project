import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../../../../lib/supabaseClient';
import { useAuth } from '../../../../contexts/AuthContext';
import { useTheme } from '../../../../contexts/ThemeContext';
import {
  Plus,
  Search,
  Trash2,
  Edit2,
  Package,
  Scissors,
  X,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Image as ImageIcon,
  AlignLeft,
  Clock,
} from 'lucide-react';

interface ServiceRow {
  id: string;
  merchant_id: string;
  name: string;
  description: string | null;
  price: number;
  duration: number;
  image_url: string | null;
  created_at?: string;
}

type ModalMode = 'create' | 'edit';

const ServiceList = () => {
  const { user, dbUser, dbLoaded, loading } = useAuth();
  const { isDarkMode } = useTheme();

  const [items, setItems] = useState<ServiceRow[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [search, setSearch] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [mode, setMode] = useState<ModalMode>('create');
  const [editingId, setEditingId] = useState<string | null>(null);

  const currency = (dbUser?.currency || 'SAR').toUpperCase();

  const ui = useMemo(() => {
    if (isDarkMode) {
      return {
        title: 'text-slate-50',
        muted: 'text-slate-400',
        surface: 'bg-[#020617]',
        border: 'border-slate-800',
        borderSoft: 'border-slate-900/60',
        input: 'bg-slate-900/40 border-slate-800 text-slate-100 placeholder:text-slate-500',
        btn: 'bg-indigo-600 hover:bg-indigo-700 text-white',
        btnSoft: 'bg-slate-900/40 hover:bg-slate-900/60 text-slate-200 border border-slate-800',
        danger: 'text-rose-300 hover:bg-rose-950/30',
        cardHover: 'hover:bg-slate-900/20',
        chip: 'bg-slate-900/50 text-slate-300 border border-slate-800',
      };
    }
    return {
      title: 'text-slate-900',
      muted: 'text-slate-500',
      surface: 'bg-white',
      border: 'border-slate-200',
      borderSoft: 'border-slate-100',
      input: 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400',
      btn: 'bg-indigo-600 hover:bg-indigo-700 text-white',
      btnSoft: 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200',
      danger: 'text-rose-600 hover:bg-rose-50',
      cardHover: 'hover:shadow-2xl hover:-translate-y-1',
      chip: 'bg-slate-100 text-slate-600 border border-slate-200',
    };
  }, [isDarkMode]);

  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    duration: '30',
    image_url: '',
  });

  const resetForm = () => {
    setForm({ name: '', description: '', price: '', duration: '30', image_url: '' });
    setEditingId(null);
  };

  useEffect(() => {
    if (!successMsg) return;
    const t = setTimeout(() => setSuccessMsg(null), 2500);
    return () => clearTimeout(t);
  }, [successMsg]);

  useEffect(() => {
    if (!user?.id || loading) return;
    fetchItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const fetchItems = async () => {
    if (!user?.id) return;

    setError(null);
    setPageLoading(true);
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('merchant_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setItems((data as ServiceRow[]) || []);
    } catch (err: any) {
      console.error('Fetch services error:', err?.message || err);
      setError(err?.message || 'Failed to load services.');
    } finally {
      setPageLoading(false);
    }
  };

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    if (!s) return items;
    return items.filter((it) => {
      return (
        it.name?.toLowerCase().includes(s) ||
        (it.description || '').toLowerCase().includes(s)
      );
    });
  }, [items, search]);

  const openCreate = () => {
    setMode('create');
    resetForm();
    setShowModal(true);
  };

  const openEdit = (row: ServiceRow) => {
    setMode('edit');
    setEditingId(row.id);
    setForm({
      name: row.name || '',
      description: row.description || '',
      price: String(row.price ?? ''),
      duration: String(row.duration ?? 30),
      image_url: row.image_url || '',
    });
    setShowModal(true);
  };

  const validate = () => {
    if (!user?.id) return 'No authenticated session.';
    if (!form.name.trim()) return 'Please enter service name.';
    const priceNum = Number(form.price);
    if (!Number.isFinite(priceNum) || priceNum < 0) return 'Please enter a valid price.';
    const durNum = Number(form.duration);
    if (!Number.isFinite(durNum) || durNum <= 0) return 'Please enter a valid duration.';
    return null;
  };

  const handleSave = async () => {
    const v = validate();
    if (v) {
      setError(v);
      return;
    }
    if (!user?.id) return;

    setError(null);
    setActionLoading(true);

    const payload = {
      merchant_id: user.id,
      name: form.name.trim(),
      description: form.description.trim() ? form.description.trim() : null,
      price: Number(form.price),
      duration: Number(form.duration),
      image_url: form.image_url.trim() ? form.image_url.trim() : null,
    };

    try {
      if (mode === 'create') {
        const { error } = await supabase.from('services').insert([payload]);
        if (error) throw error;
        setSuccessMsg('Service created');
      } else {
        if (!editingId) throw new Error('Missing id');
        const { error } = await supabase
          .from('services')
          .update({
            name: payload.name,
            description: payload.description,
            price: payload.price,
            duration: payload.duration,
            image_url: payload.image_url,
          })
          .eq('id', editingId)
          .eq('merchant_id', user.id);

        if (error) throw error;
        setSuccessMsg('Service updated');
      }

      setShowModal(false);
      resetForm();
      await fetchItems();
    } catch (err: any) {
      console.error('Save services error:', err?.message || err);
      setError(err?.message || 'Insert/Update failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const deleteItem = async (id: string) => {
    if (!user?.id) return;
    const ok = window.confirm('Delete this service?');
    if (!ok) return;

    setActionLoading(true);
    setError(null);
    try {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', id)
        .eq('merchant_id', user.id);

      if (error) throw error;
      setSuccessMsg('Service deleted');
      await fetchItems();
    } catch (err: any) {
      console.error('Delete services error:', err?.message || err);
      setError(err?.message || 'Delete failed.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading || !dbLoaded) {
    return (
      <div className="h-80 flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500" dir="ltr">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className={`text-3xl font-black tracking-tighter italic ${ui.title}`}>Services</h1>
          <p className={`font-bold text-[10px] uppercase tracking-[0.2em] mt-1 ${ui.muted}`}>
            Manage your service catalog
          </p>
        </div>

        <button onClick={openCreate} className={`px-8 py-4 rounded-2xl font-black flex items-center gap-2 shadow-xl transition-all active:scale-95 ${ui.btn}`}>
          <Plus size={20} /> Add Service
        </button>
      </div>

      {/* Alerts */}
      {(error || successMsg) && (
        <div className="space-y-3">
          {error && (
            <div className={`rounded-2xl border p-4 flex items-start gap-3 ${isDarkMode ? 'bg-rose-950/20 border-rose-900/40' : 'bg-rose-50 border-rose-100'}`}>
              <AlertCircle className={isDarkMode ? 'text-rose-300' : 'text-rose-600'} size={18} />
              <div className="flex-1">
                <p className={`text-sm font-black ${isDarkMode ? 'text-rose-200' : 'text-rose-700'}`}>Insert blocked</p>
                <p className={`text-xs font-bold mt-1 ${isDarkMode ? 'text-rose-300/90' : 'text-rose-600'}`}>{error}</p>
                <button onClick={fetchItems} className={`mt-3 text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl ${ui.btnSoft}`}>
                  Retry
                </button>
              </div>
            </div>
          )}

          {successMsg && (
            <div className={`rounded-2xl border p-4 flex items-center gap-3 ${isDarkMode ? 'bg-emerald-950/20 border-emerald-900/40' : 'bg-emerald-50 border-emerald-100'}`}>
              <CheckCircle2 className={isDarkMode ? 'text-emerald-300' : 'text-emerald-600'} size={18} />
              <p className={`text-sm font-black ${isDarkMode ? 'text-emerald-100' : 'text-emerald-700'}`}>{successMsg}</p>
            </div>
          )}
        </div>
      )}

      {/* Search */}
      <div className="relative group">
        <Search className={`absolute left-5 top-1/2 -translate-y-1/2 transition-colors ${isDarkMode ? 'text-slate-500 group-focus-within:text-indigo-400' : 'text-slate-300 group-focus-within:text-indigo-600'}`} size={20} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or description..."
          className={`w-full rounded-2xl pl-14 pr-5 py-4 font-bold outline-none border focus:ring-4 transition-all shadow-sm ${ui.input} ${isDarkMode ? 'focus:ring-indigo-500/15' : 'focus:ring-indigo-100'}`}
        />
      </div>

      {/* List */}
      {pageLoading ? (
        <div className="h-72 flex flex-col items-center justify-center gap-4">
          <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
          <p className={`text-[10px] font-black uppercase tracking-widest ${ui.muted}`}>Loading Services...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className={`${ui.surface} rounded-[3rem] p-16 text-center border-2 border-dashed ${ui.border} flex flex-col items-center`}>
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 ${isDarkMode ? 'bg-slate-900/40 text-slate-600' : 'bg-slate-50 text-slate-300'}`}>
            <Scissors size={40} />
          </div>
          <h3 className={`text-xl font-black mb-2 ${ui.title}`}>No services found</h3>
          <p className={`${ui.muted} font-bold mb-8 text-sm max-w-xs`}>Start adding services so customers can book.</p>
          <button onClick={openCreate} className={`px-10 py-4 rounded-2xl font-black transition-all shadow-lg ${ui.btn}`}>
            Create First Service
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filtered.map((s) => (
            <div key={s.id} className={`${ui.surface} p-6 rounded-[2.5rem] border ${ui.borderSoft} shadow-sm transition-all ${isDarkMode ? 'hover:bg-slate-900/20' : 'hover:shadow-2xl hover:-translate-y-1'}`}>
              <div className="flex justify-between items-start mb-5">
                <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-indigo-950/30 text-indigo-300 border-indigo-900/40' : 'bg-indigo-50 text-indigo-600 border-indigo-100'}`}>
                  <Scissors size={22} />
                </div>

                <div className="flex gap-1">
                  <button onClick={() => openEdit(s)} className={`p-2 rounded-xl transition-colors ${isDarkMode ? 'text-slate-400 hover:text-indigo-300 hover:bg-slate-900/40' : 'text-slate-400 hover:text-indigo-600 hover:bg-slate-50'}`}>
                    <Edit2 size={18} />
                  </button>
                  <button onClick={() => deleteItem(s.id)} disabled={actionLoading} className={`p-2 rounded-xl transition-colors ${ui.danger}`}>
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              <h3 className={`text-xl font-black mb-2 truncate ${ui.title}`}>{s.name}</h3>
              {s.description ? (
                <p className={`text-sm font-bold leading-relaxed mb-5 ${ui.muted}`}>{s.description}</p>
              ) : (
                <p className={`text-sm font-bold leading-relaxed mb-5 ${ui.muted}`}>No description</p>
              )}

              <div className={`pt-5 border-t ${ui.borderSoft} flex items-center justify-between`}>
                <div className="flex flex-col">
                  <span className={`text-[9px] font-black uppercase tracking-tighter ${ui.muted}`}>Price</span>
                  <div className={`${isDarkMode ? 'text-indigo-300' : 'text-indigo-600'} text-2xl font-black tracking-tighter`}>
                    <small className="text-xs mr-1 font-bold">{currency}</small>
                    {s.price}
                  </div>
                </div>

                <span className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase ${ui.chip}`}>
                  <Clock size={14} /> {s.duration} MIN
                </span>
              </div>

              {s.image_url && (
                <div className={`mt-5 rounded-2xl overflow-hidden border ${ui.borderSoft}`}>
                  <img src={s.image_url} alt={s.name} className="w-full h-40 object-cover" />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-md bg-black/40 animate-in fade-in duration-200">
          <div className={`${ui.surface} w-full max-w-xl rounded-[3rem] shadow-2xl overflow-hidden border ${ui.borderSoft}`}>
            <div className={`p-9 relative border-b ${ui.borderSoft}`} style={{ background: isDarkMode ? '#0b1220' : '#4F46E5' }}>
              <button
                onClick={() => {
                  setShowModal(false);
                  setError(null);
                }}
                className={`absolute right-7 top-7 rounded-xl p-2 transition-colors ${isDarkMode ? 'text-slate-200 hover:bg-slate-900/40' : 'text-white/90 hover:bg-white/10'}`}
              >
                <X size={22} />
              </button>

              <h3 className={`text-2xl font-black italic tracking-tighter ${isDarkMode ? 'text-slate-50' : 'text-white'}`}>
                {mode === 'create' ? 'New Service' : 'Edit Service'}
              </h3>
              <p className={`font-bold text-[10px] mt-2 uppercase tracking-[0.2em] ${isDarkMode ? 'text-slate-300' : 'text-indigo-100'}`}>
                Uses table columns: name, description, price, duration, image_url
              </p>
            </div>

            <div className="p-9 space-y-5">
              <div className="space-y-2">
                <label className={`text-[10px] font-black ml-2 uppercase tracking-widest ${ui.muted}`}>Name</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. Premium Haircut"
                  className={`w-full p-5 rounded-2xl font-bold outline-none border-2 focus:border-indigo-500 transition-all ${ui.input}`}
                />
              </div>

              <div className="space-y-2">
                <label className={`text-[10px] font-black ml-2 uppercase tracking-widest ${ui.muted}`}>Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  placeholder="Optional details..."
                  className={`w-full min-h-[110px] p-5 rounded-2xl font-bold outline-none border-2 focus:border-indigo-500 transition-all ${ui.input}`}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className={`text-[10px] font-black ml-2 uppercase tracking-widest ${ui.muted}`}>Price ({currency})</label>
                  <input
                    value={form.price}
                    onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))}
                    type="number"
                    placeholder="0.00"
                    className={`w-full p-5 rounded-2xl font-bold outline-none border-2 focus:border-indigo-500 transition-all ${ui.input}`}
                  />
                </div>
                <div className="space-y-2">
                  <label className={`text-[10px] font-black ml-2 uppercase tracking-widest ${ui.muted}`}>Duration (min)</label>
                  <input
                    value={form.duration}
                    onChange={(e) => setForm((p) => ({ ...p, duration: e.target.value }))}
                    type="number"
                    placeholder="30"
                    className={`w-full p-5 rounded-2xl font-bold outline-none border-2 focus:border-indigo-500 transition-all ${ui.input}`}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className={`text-[10px] font-black ml-2 uppercase tracking-widest ${ui.muted}`}>Image URL (optional)</label>
                <div className="relative">
                  <ImageIcon className={`absolute left-4 top-1/2 -translate-y-1/2 ${isDarkMode ? 'text-slate-500' : 'text-slate-300'}`} size={18} />
                  <input
                    value={form.image_url}
                    onChange={(e) => setForm((p) => ({ ...p, image_url: e.target.value }))}
                    placeholder="https://..."
                    className={`w-full pl-11 p-5 rounded-2xl font-bold outline-none border-2 focus:border-indigo-500 transition-all ${ui.input}`}
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-2">
                <button disabled={actionLoading} onClick={() => setShowModal(false)} className={`flex-1 py-5 rounded-2xl font-black uppercase text-xs tracking-widest ${ui.btnSoft}`}>
                  Cancel
                </button>
                <button disabled={actionLoading} onClick={handleSave} className={`flex-1 py-5 rounded-2xl font-black shadow-2xl flex items-center justify-center gap-2 uppercase text-xs tracking-widest ${ui.btn}`}>
                  {actionLoading ? <Loader2 className="animate-spin" size={20} /> : mode === 'create' ? 'Create' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className={`text-[10px] font-bold ${ui.muted}`}>
        Table: <span className="font-black">services</span> • merchant_id scoped
      </div>
    </div>
  );
};

export default ServiceList;
