import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../../../../lib/supabaseClient';
import { useAuth } from '../../../../contexts/AuthContext';
import { useTheme } from '../../../../contexts/ThemeContext';
import {
  Package,
  Plus,
  Search,
  Trash2,
  Edit3,
  Loader2,
  ShoppingCart,
  AlertTriangle,
  ArrowUpRight,
  X,
  CheckCircle2,
  AlertCircle,
  Image as ImageIcon,
  AlignLeft,
} from 'lucide-react';

interface ProductRow {
  id: string;
  merchant_id: string;
  name: string;
  description: string | null;
  price: number;
  stock_quantity: number;
  image_url: string | null;
  created_at?: string;
}

type ModalMode = 'create' | 'edit';

const ProductList = () => {
  const { user, dbUser, dbLoaded, loading } = useAuth();
  const { isDarkMode } = useTheme();

  const [products, setProducts] = useState<ProductRow[]>([]);
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
        chip: 'bg-slate-900/50 text-slate-300 border border-slate-800',
        danger: 'text-rose-300 hover:bg-rose-950/30',
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
      chip: 'bg-slate-100 text-slate-600 border border-slate-200',
      danger: 'text-rose-600 hover:bg-rose-50',
    };
  }, [isDarkMode]);

  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    stock_quantity: '0',
    image_url: '',
  });

  const resetForm = () => {
    setForm({ name: '', description: '', price: '', stock_quantity: '0', image_url: '' });
    setEditingId(null);
  };

  // toast auto hide
  useEffect(() => {
    if (!successMsg) return;
    const t = setTimeout(() => setSuccessMsg(null), 2500);
    return () => clearTimeout(t);
  }, [successMsg]);

  useEffect(() => {
    if (!user?.id || loading) return;
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const fetchProducts = async () => {
    if (!user?.id) return;
    setError(null);
    setPageLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('merchant_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts((data as ProductRow[]) || []);
    } catch (err: any) {
      console.error('Fetch products error:', err?.message || err);
      setError(err?.message || 'Failed to load products.');
    } finally {
      setPageLoading(false);
    }
  };

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    if (!s) return products;
    return products.filter((p) => {
      return (
        p.name?.toLowerCase().includes(s) ||
        (p.description || '').toLowerCase().includes(s)
      );
    });
  }, [products, search]);

  const stats = useMemo(() => {
    const total = products.length;
    const low = products.filter((p) => p.stock_quantity <= 5 && p.stock_quantity > 0).length;
    const out = products.filter((p) => p.stock_quantity === 0).length;
    return { total, low, out };
  }, [products]);

  const openCreate = () => {
    setMode('create');
    resetForm();
    setShowModal(true);
  };

  const openEdit = (p: ProductRow) => {
    setMode('edit');
    setEditingId(p.id);
    setForm({
      name: p.name || '',
      description: p.description || '',
      price: String(p.price ?? ''),
      stock_quantity: String(p.stock_quantity ?? 0),
      image_url: p.image_url || '',
    });
    setShowModal(true);
  };

  const validate = () => {
    if (!user?.id) return 'No authenticated session.';
    if (!form.name.trim()) return 'Please enter product name.';
    const priceNum = Number(form.price);
    if (!Number.isFinite(priceNum) || priceNum < 0) return 'Please enter a valid price.';
    const stockNum = Number(form.stock_quantity);
    if (!Number.isFinite(stockNum) || stockNum < 0) return 'Please enter a valid stock quantity.';
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
      stock_quantity: Number(form.stock_quantity),
      image_url: form.image_url.trim() ? form.image_url.trim() : null,
    };

    try {
      if (mode === 'create') {
        const { error } = await supabase.from('products').insert([payload]);
        if (error) throw error;
        setSuccessMsg('Product created');
      } else {
        if (!editingId) throw new Error('Missing id');
        const { error } = await supabase
          .from('products')
          .update({
            name: payload.name,
            description: payload.description,
            price: payload.price,
            stock_quantity: payload.stock_quantity,
            image_url: payload.image_url,
          })
          .eq('id', editingId)
          .eq('merchant_id', user.id);

        if (error) throw error;
        setSuccessMsg('Product updated');
      }

      setShowModal(false);
      resetForm();
      await fetchProducts();
    } catch (err: any) {
      console.error('Save product error:', err?.message || err);
      setError(err?.message || 'Insert/Update failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const deleteProduct = async (id: string) => {
    if (!user?.id) return;
    const ok = window.confirm('Delete this product?');
    if (!ok) return;

    setActionLoading(true);
    setError(null);

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id)
        .eq('merchant_id', user.id);

      if (error) throw error;

      setSuccessMsg('Product deleted');
      await fetchProducts();
    } catch (err: any) {
      console.error('Delete product error:', err?.message || err);
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
      <div className={`${ui.surface} p-8 rounded-[2.5rem] border ${ui.borderSoft} shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6`}>
        <div>
          <h2 className={`text-3xl font-black tracking-tighter italic ${ui.title}`}>Physical Products</h2>
          <p className={`text-[10px] font-bold uppercase tracking-[0.2em] mt-1 ${ui.muted}`}>
            Manage your inventory and direct sales
          </p>
        </div>

        <button onClick={openCreate} className={`px-8 py-4 rounded-2xl font-black flex items-center justify-center gap-2 transition-all shadow-xl active:scale-95 ${ui.btn}`}>
          <Plus size={20} /> Add Product
        </button>
      </div>

      {/* Alerts */}
      {(error || successMsg) && (
        <div className="space-y-3">
          {error && (
            <div className={`rounded-2xl border p-4 flex items-start gap-3 ${isDarkMode ? 'bg-rose-950/20 border-rose-900/40' : 'bg-rose-50 border-rose-100'}`}>
              <AlertCircle className={isDarkMode ? 'text-rose-300' : 'text-rose-600'} size={18} />
              <div className="flex-1">
                <p className={`text-sm font-black ${isDarkMode ? 'text-rose-200' : 'text-rose-700'}`}>Action blocked</p>
                <p className={`text-xs font-bold mt-1 ${isDarkMode ? 'text-rose-300/90' : 'text-rose-600'}`}>{error}</p>
                <button onClick={fetchProducts} className={`mt-3 text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl ${ui.btnSoft}`}>
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

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`${ui.surface} p-6 rounded-3xl border ${ui.borderSoft} flex items-center gap-4`}>
          <div className={`${isDarkMode ? 'bg-indigo-950/30 text-indigo-300 border border-indigo-900/40' : 'bg-indigo-50 text-indigo-600 border border-indigo-100'} w-12 h-12 rounded-2xl flex items-center justify-center`}>
            <Package size={24} />
          </div>
          <div>
            <p className={`text-[10px] font-black uppercase ${ui.muted}`}>Total SKUs</p>
            <p className={`text-xl font-black ${ui.title}`}>{stats.total}</p>
          </div>
        </div>

        <div className={`${ui.surface} p-6 rounded-3xl border ${ui.borderSoft} flex items-center gap-4`}>
          <div className={`${isDarkMode ? 'bg-amber-950/20 text-amber-300 border border-amber-900/40' : 'bg-amber-50 text-amber-600 border border-amber-100'} w-12 h-12 rounded-2xl flex items-center justify-center`}>
            <AlertTriangle size={24} />
          </div>
          <div>
            <p className={`text-[10px] font-black uppercase ${ui.muted}`}>Low Stock</p>
            <p className={`${isDarkMode ? 'text-amber-200' : 'text-amber-700'} text-xl font-black`}>{stats.low} Items</p>
          </div>
        </div>

        <div className={`${ui.surface} p-6 rounded-3xl border ${ui.borderSoft} flex items-center gap-4`}>
          <div className={`${isDarkMode ? 'bg-rose-950/20 text-rose-300 border border-rose-900/40' : 'bg-rose-50 text-rose-600 border border-rose-100'} w-12 h-12 rounded-2xl flex items-center justify-center`}>
            <ShoppingCart size={24} />
          </div>
          <div>
            <p className={`text-[10px] font-black uppercase ${ui.muted}`}>Out of Stock</p>
            <p className={`${isDarkMode ? 'text-rose-200' : 'text-rose-700'} text-xl font-black`}>{stats.out} Items</p>
          </div>
        </div>
      </div>

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

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {pageLoading ? (
          <div className="col-span-full h-64 flex flex-col items-center justify-center gap-4">
            <Loader2 className="animate-spin text-indigo-600" size={32} />
            <p className={`text-[10px] font-black uppercase tracking-widest ${ui.muted}`}>Scanning Warehouse...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className={`col-span-full ${isDarkMode ? 'bg-slate-900/20 border-slate-800' : 'bg-slate-50 border-slate-100'} rounded-[3rem] p-20 text-center border-2 border-dashed flex flex-col items-center`}>
            <div className={`${ui.surface} w-20 h-20 rounded-full flex items-center justify-center ${isDarkMode ? 'text-slate-600 border border-slate-800' : 'text-slate-300 shadow-sm'} mb-6`}>
              <Package size={40} />
            </div>
            <h3 className={`text-xl font-black mb-2 ${ui.title}`}>No products found</h3>
            <p className={`${ui.muted} font-bold mb-8 text-sm max-w-xs`}>Add products to start selling.</p>
            <button onClick={openCreate} className={`px-8 py-4 rounded-2xl font-black transition-all ${ui.btn}`}>
              Add your first product
            </button>
          </div>
        ) : (
          filtered.map((p) => {
            const qty = Number(p.stock_quantity ?? 0);
            const badge =
              qty > 10
                ? isDarkMode
                  ? 'bg-emerald-950/20 text-emerald-200 border-emerald-900/40'
                  : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                : qty > 0
                ? isDarkMode
                  ? 'bg-amber-950/20 text-amber-200 border-amber-900/40'
                  : 'bg-amber-50 text-amber-600 border-amber-100'
                : isDarkMode
                ? 'bg-rose-950/20 text-rose-200 border-rose-900/40'
                : 'bg-rose-50 text-rose-600 border-rose-100';

            return (
              <div key={p.id} className={`${ui.surface} p-5 rounded-[2.5rem] border ${ui.borderSoft} shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all group relative`}>
                <div className="absolute top-6 right-6 z-10 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                  <button
                    onClick={() => openEdit(p)}
                    className={`${isDarkMode ? 'bg-slate-900/60 text-slate-200 hover:text-indigo-300 border border-slate-800' : 'bg-white text-slate-500 hover:text-indigo-600 border border-slate-100'} p-2 rounded-xl shadow-sm transition-colors`}
                    title="Edit"
                  >
                    <Edit3 size={16} />
                  </button>
                  <button
                    onClick={() => deleteProduct(p.id)}
                    disabled={actionLoading}
                    className={`${isDarkMode ? 'bg-slate-900/60 text-slate-200 hover:text-rose-300 border border-slate-800' : 'bg-white text-slate-500 hover:text-rose-600 border border-slate-100'} p-2 rounded-xl shadow-sm transition-colors`}
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className={`${isDarkMode ? 'bg-slate-900/30 border-slate-800' : 'bg-slate-50 border-slate-100'} w-full h-48 rounded-[2rem] mb-6 flex items-center justify-center overflow-hidden relative border`}>
                  {p.image_url ? (
                    <img src={p.image_url} alt={p.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  ) : (
                    <Package size={48} className={isDarkMode ? 'text-slate-600' : 'text-slate-300'} />
                  )}
                </div>

                <div className="space-y-3">
                  <h3 className={`font-black text-lg tracking-tight truncate ${ui.title}`}>{p.name}</h3>
                  {p.description ? (
                    <p className={`text-sm font-bold leading-relaxed ${ui.muted}`}>{p.description}</p>
                  ) : (
                    <p className={`text-sm font-bold leading-relaxed ${ui.muted}`}>No description</p>
                  )}

                  <div className="flex justify-between items-end pt-2">
                    <div className="flex flex-col">
                      <span className={`text-[9px] font-black uppercase tracking-tighter ${ui.muted}`}>Price</span>
                      <span className={`${isDarkMode ? 'text-indigo-300' : 'text-indigo-600'} text-2xl font-black tracking-tighter`}>
                        <small className="text-[10px] mr-1">{currency}</small>
                        {p.price}
                      </span>
                    </div>

                    <span className={`text-[9px] font-black px-3 py-1.5 rounded-xl border ${badge}`}>
                      {qty === 0 ? 'Out of Stock' : `Stock: ${qty}`}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => openEdit(p)}
                  className={`w-full mt-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                    isDarkMode
                      ? 'bg-slate-900/40 text-slate-300 hover:bg-indigo-600 hover:text-white border border-slate-800'
                      : 'bg-slate-50 text-slate-500 hover:bg-indigo-600 hover:text-white border border-slate-100'
                  }`}
                >
                  Quick Edit <ArrowUpRight size={14} />
                </button>
              </div>
            );
          })
        )}
      </div>

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
                {mode === 'create' ? 'New Product' : 'Edit Product'}
              </h3>
              <p className={`font-bold text-[10px] mt-2 uppercase tracking-[0.2em] ${isDarkMode ? 'text-slate-300' : 'text-indigo-100'}`}>
                Uses columns: name, description, price, stock_quantity, image_url
              </p>
            </div>

            <div className="p-9 space-y-5">
              <div className="space-y-2">
                <label className={`text-[10px] font-black ml-2 uppercase tracking-widest ${ui.muted}`}>Name</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. Shampoo"
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
                  <label className={`text-[10px] font-black ml-2 uppercase tracking-widest ${ui.muted}`}>Stock Quantity</label>
                  <input
                    value={form.stock_quantity}
                    onChange={(e) => setForm((p) => ({ ...p, stock_quantity: e.target.value }))}
                    type="number"
                    placeholder="0"
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

              {error && (
                <div className={`rounded-2xl border p-4 flex items-start gap-3 ${isDarkMode ? 'bg-rose-950/20 border-rose-900/40' : 'bg-rose-50 border-rose-100'}`}>
                  <AlertCircle className={isDarkMode ? 'text-rose-300' : 'text-rose-600'} size={18} />
                  <p className={`text-xs font-bold ${isDarkMode ? 'text-rose-200' : 'text-rose-700'}`}>{error}</p>
                </div>
              )}

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
        Table: <span className="font-black">products</span> • uses <span className="font-black">stock_quantity</span> • merchant scoped
      </div>
    </div>
  );
};

export default ProductList;
