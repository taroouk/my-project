import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../../../../lib/supabaseClient';
import { useAuth } from '../../../../contexts/AuthContext';
import { useTheme } from '../../../../contexts/ThemeContext';
import {
  Settings as SettingsIcon,
  Save,
  Globe,
  MapPin,
  ShieldCheck,
  Loader2,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Pencil,
  X,
} from 'lucide-react';

type Msg = { type: 'success' | 'error' | ''; text: string };

const Settings = () => {
  const { dbUser, updateProfile, refreshUser } = useAuth();
  const { isDarkMode } = useTheme();

  const brandColor =
    (dbUser?.brand_color as string) ||
    (dbUser as any)?.brand_colour ||
    '#7C3AED';

  const ui = useMemo(() => {
    if (isDarkMode) {
      return {
        page: 'text-slate-50',
        surface: 'bg-slate-950/40',
        border: 'border-slate-900/60',
        border2: 'border-slate-800',
        muted: 'text-slate-400',
        input:
          'bg-slate-900/35 border-slate-800 text-slate-100 placeholder:text-slate-500 focus:ring-indigo-500/20',
        inputDisabled:
          'bg-slate-900/20 text-slate-500 border-slate-800 cursor-not-allowed',
        btnSecondary:
          'bg-slate-900/35 border border-slate-800 text-slate-200 hover:bg-slate-900/55',
        cardShadow: 'shadow-[0_10px_30px_-20px_rgba(0,0,0,0.6)]',
        msgOk: 'bg-emerald-950/30 text-emerald-200 border-emerald-900/40',
        msgErr: 'bg-rose-950/30 text-rose-200 border-rose-900/40',
      };
    }

    return {
      page: 'text-gray-900',
      surface: 'bg-white',
      border: 'border-gray-50',
      border2: 'border-gray-100',
      muted: 'text-gray-400',
      input:
        'bg-gray-50/70 border-gray-100 text-gray-900 placeholder:text-gray-400 focus:ring-purple-100',
      inputDisabled:
        'bg-gray-100 text-gray-400 border-gray-100 cursor-not-allowed',
      btnSecondary:
        'bg-white border border-gray-100 text-gray-600 hover:bg-gray-50',
      cardShadow: 'shadow-sm',
      msgOk: 'bg-green-50 text-green-600 border-green-100',
      msgErr: 'bg-red-50 text-red-600 border-red-100',
    };
  }, [isDarkMode]);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<Msg>({ type: '', text: '' });
  const [slugEditable, setSlugEditable] = useState(false);

  // metadata keys fallback (بدون لوجو)
  const META_KEYS = {
    address: 'store_address',
    description: 'store_description',
    business_type: 'business_type',
  } as const;

  const [formData, setFormData] = useState({
    store_name: '',
    store_slug: '',
    brand_color: '#7C3AED',
    address: '',
    description: '',
    business_type: 'salon',
  });

  const getAuthMeta = async () => {
    const { data } = await supabase.auth.getUser();
    return data?.user?.user_metadata || {};
  };

  useEffect(() => {
    (async () => {
      const meta = await getAuthMeta();
      setFormData({
        store_name: (dbUser as any)?.store_name || '',
        store_slug: (dbUser as any)?.store_slug || '',
        brand_color: (dbUser as any)?.brand_color || '#7C3AED',
        address: (dbUser as any)?.address || meta?.[META_KEYS.address] || '',
        description: (dbUser as any)?.description || meta?.[META_KEYS.description] || '',
        business_type:
          (dbUser as any)?.business_type || meta?.[META_KEYS.business_type] || 'salon',
      });
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dbUser?.id]);

  const makeSlug = (name: string) =>
    name
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9\-]/g, '')
      .replace(/\-+/g, '-')
      .replace(/^\-+|\-+$/g, '');

  const resetForm = async () => {
    const meta = await getAuthMeta();
    setFormData({
      store_name: (dbUser as any)?.store_name || '',
      store_slug: (dbUser as any)?.store_slug || '',
      brand_color: (dbUser as any)?.brand_color || '#7C3AED',
      address: (dbUser as any)?.address || meta?.[META_KEYS.address] || '',
      description: (dbUser as any)?.description || meta?.[META_KEYS.description] || '',
      business_type:
        (dbUser as any)?.business_type || meta?.[META_KEYS.business_type] || 'salon',
    });

    setMessage({ type: '', text: '' });
    setSlugEditable(false);
  };

  const validate = () => {
    if (!formData.store_name.trim()) return 'Store name is required.';
    if (!formData.brand_color) return 'Brand color is required.';
    if (slugEditable && !formData.store_slug.trim())
      return 'Store slug is required if editing is enabled.';
    return '';
  };

  const stripMissingColumns = (errMsg: string, payload: Record<string, any>) => {
    const m = errMsg.match(/Could not find the '(.+?)' column/);
    const missing = m?.[1];
    if (!missing) return payload;
    const cloned = { ...payload };
    delete cloned[missing];
    return cloned;
  };

  const saveToAuthMetadata = async (extra?: Record<string, any>) => {
    const metaPayload: Record<string, any> = {
      [META_KEYS.address]: formData.address?.trim() || null,
      [META_KEYS.description]: formData.description?.trim() || null,
      [META_KEYS.business_type]: formData.business_type || null,
      ...(extra || {}),
    };

    const { error } = await supabase.auth.updateUser({ data: metaPayload });
    if (error) console.warn('Metadata update failed:', error.message);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    const err = validate();
    if (err) {
      setMessage({ type: 'error', text: err });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    let payload: Record<string, any> = {
      store_name: formData.store_name.trim(),
      brand_color: formData.brand_color,
    };

    if (slugEditable) payload.store_slug = makeSlug(formData.store_slug);

    // optional columns (might not exist)
    payload.address = formData.address?.trim() || null;
    payload.description = formData.description?.trim() || null;
    payload.business_type = formData.business_type || null;

    try {
      let res = await updateProfile(payload as any);

      if (res?.error) {
        if (res.error.includes("Could not find the '") && res.error.includes('column')) {
          payload = stripMissingColumns(res.error, payload);
          res = await updateProfile(payload as any);
          if (res?.error) throw new Error(res.error);

          await saveToAuthMetadata();
        } else {
          throw new Error(res.error);
        }
      } else {
        await saveToAuthMetadata();
      }

      await refreshUser();
      setMessage({ type: 'success', text: 'Settings updated successfully!' });
      setSlugEditable(false);
    } catch (err2: any) {
      setMessage({ type: 'error', text: err2?.message || 'Something went wrong.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500 ${ui.page}`} dir="ltr">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className={`text-3xl font-black tracking-tighter ${ui.page}`}>Store Settings</h1>
          <p className={`${ui.muted} font-bold text-xs uppercase tracking-widest mt-1`}>
            Manage your brand identity and preferences
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={resetForm}
            className={`px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${ui.btnSecondary}`}
          >
            <span className="flex items-center gap-2">
              <RotateCcw size={16} /> Reset
            </span>
          </button>

          <button
            form="settings-form"
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-8 py-3 rounded-2xl font-black text-sm shadow-xl transition-all disabled:opacity-50"
            style={{
              backgroundColor: brandColor,
              color: 'white',
              boxShadow: `0 18px 35px -18px ${brandColor}88`,
            }}
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            Save Changes
          </button>
        </div>
      </div>

      {/* Message */}
      {message.text && (
        <div
          className={`p-4 rounded-2xl font-bold text-sm border flex items-start gap-3 ${
            message.type === 'success' ? ui.msgOk : ui.msgErr
          }`}
        >
          {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
          <div className="flex-1">{message.text}</div>
          <button
            onClick={() => setMessage({ type: '', text: '' })}
            className="opacity-70 hover:opacity-100 transition"
            aria-label="Dismiss"
          >
            <X size={16} />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="md:col-span-1 space-y-6">
          {/* Brand color */}
          <div className={`${ui.surface} p-8 rounded-[2.5rem] border ${ui.border} ${ui.cardShadow}`}>
            <label className={`text-[10px] font-black uppercase tracking-widest mb-4 block ${ui.muted}`}>
              Brand Color
            </label>

            <div className="flex items-center gap-4">
              <input
                type="color"
                className="w-12 h-12 rounded-xl border-none cursor-pointer bg-transparent"
                value={formData.brand_color}
                onChange={(e) => setFormData({ ...formData, brand_color: e.target.value })}
              />
              <span className={`font-mono font-bold uppercase ${ui.page}`}>{formData.brand_color}</span>
            </div>

            <div
              className="mt-6 rounded-2xl p-4 border"
              style={{
                borderColor: isDarkMode ? '#1F2937' : '#EEF2FF',
                backgroundColor: `${formData.brand_color}14`,
              }}
            >
              <p
                className="text-[10px] font-black uppercase tracking-widest"
                style={{ color: isDarkMode ? '#C7D2FE' : '#4F46E5' }}
              >
                Preview
              </p>
              <div className="mt-3 flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl" style={{ backgroundColor: formData.brand_color }} />
                <div className="flex-1">
                  <div
                    className="h-2 rounded-full"
                    style={{ backgroundColor: isDarkMode ? 'rgba(148,163,184,0.25)' : '#E5E7EB' }}
                  />
                  <div
                    className="h-2 rounded-full mt-2 w-2/3"
                    style={{ backgroundColor: isDarkMode ? 'rgba(148,163,184,0.18)' : '#F3F4F6' }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="md:col-span-2 space-y-6">
          <form
            id="settings-form"
            onSubmit={handleSave}
            className={`${ui.surface} p-10 rounded-[3rem] border ${ui.border} ${ui.cardShadow} space-y-6`}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Store Name */}
              <div className="space-y-2">
                <label className={`text-[10px] font-black uppercase ml-2 flex items-center gap-1 ${ui.muted}`}>
                  <SettingsIcon size={12} /> Store Name
                </label>
                <input
                  className={`w-full p-4 rounded-2xl font-bold border outline-none transition-all focus:ring-4 ${ui.input}`}
                  value={formData.store_name}
                  onChange={(e) => {
                    const v = e.target.value;
                    setFormData((p) => ({
                      ...p,
                      store_name: v,
                      store_slug: slugEditable ? p.store_slug : p.store_slug || makeSlug(v),
                    }));
                  }}
                  placeholder="Your store name"
                />
              </div>

              {/* Store Slug */}
              <div className="space-y-2">
                <label className={`text-[10px] font-black uppercase ml-2 flex items-center gap-2 ${ui.muted}`}>
                  <Globe size={12} /> Store Slug (URL)
                  <button
                    type="button"
                    onClick={() => setSlugEditable((v) => !v)}
                    className={`ml-auto px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${ui.border2} ${
                      slugEditable ? 'text-white' : ui.muted
                    }`}
                    style={slugEditable ? { backgroundColor: brandColor, borderColor: 'transparent' } : {}}
                  >
                    <span className="flex items-center gap-1.5">
                      <Pencil size={12} /> {slugEditable ? 'Editing' : 'Edit'}
                    </span>
                  </button>
                </label>

                <input
                  disabled={!slugEditable}
                  className={`w-full p-4 rounded-2xl font-bold border outline-none transition-all ${
                    slugEditable ? ui.input : ui.inputDisabled
                  }`}
                  value={formData.store_slug}
                  onChange={(e) => setFormData({ ...formData, store_slug: e.target.value })}
                  placeholder="my-store"
                />

                <p className={`text-[10px] font-bold ${ui.muted}`}>
                  Live URL: <span className={ui.page}>/s/{formData.store_slug || 'your-slug'}</span>
                </p>
              </div>
            </div>

            {/* Address */}
            <div className="space-y-2">
              <label className={`text-[10px] font-black uppercase ml-2 flex items-center gap-1 ${ui.muted}`}>
                <MapPin size={12} /> Business Address
              </label>
              <input
                className={`w-full p-4 rounded-2xl font-bold border outline-none transition-all focus:ring-4 ${ui.input}`}
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Street / City / Country"
              />
              <p className={`text-[10px] font-bold ${ui.muted}`}>
                If DB column is missing, it will be saved in metadata.
              </p>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className={`text-[10px] font-black uppercase ml-2 ${ui.muted}`}>Description / About</label>
              <textarea
                rows={4}
                className={`w-full p-4 rounded-2xl font-bold border outline-none transition-all resize-none focus:ring-4 ${ui.input}`}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Tell customers what makes your business special..."
              />
              <p className={`text-[10px] font-bold ${ui.muted}`}>
                If DB column is missing, it will be saved in metadata.
              </p>
            </div>

            {/* Security note */}
            <div
              className={`pt-6 border-t flex items-center gap-2 ${
                isDarkMode ? 'border-slate-900/60' : 'border-gray-50'
              } ${ui.muted}`}
            >
              <ShieldCheck size={16} className="text-green-500" />
              <p className="text-[10px] font-bold uppercase tracking-widest">
                Your store data is secured with SSL encryption
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Settings;
