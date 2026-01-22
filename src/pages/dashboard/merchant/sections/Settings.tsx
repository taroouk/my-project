import React, { useEffect, useMemo, useState } from 'react';
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
  Upload,
  Image as ImageIcon,
  Trash2,
} from 'lucide-react';

import { useMerchantLang } from '../useMerchantLang';
import {
  BUSINESS_CATEGORIES,
  type BusinessCategoryValue,
  splitBusinessCategory,
} from './businessCategories';

type Msg = { type: 'success' | 'error' | ''; text: string };

const Settings = () => {
  const { dbUser, updateProfile, refreshUser } = useAuth();
  const { t, dir } = useMerchantLang();
  const { isDarkMode } = useTheme();

  const brandColor =
    (dbUser?.brand_color as string) || (dbUser as any)?.brand_colour || '#7C3AED';

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

  // ===== Logo (NEW) =====
  const BUCKET = 'merchant-logos';

  const [logoUrl, setLogoUrl] = useState<string>(''); // may be full URL or path
  const [logoUploading, setLogoUploading] = useState(false);

  // metadata keys fallback
  const META_KEYS = {
    address: 'store_address',
    description: 'store_description',
    business_type: 'business_type',
    logo_path: 'store_logo_path', // NEW
  } as const;

  const [formData, setFormData] = useState({
    store_name: '',
    store_slug: '',
    brand_color: '#7C3AED',
    address: '',
    description: '',
    business_type: 'salon',
  });

  // Business category (supports predefined + custom)
  const [bizTypeValue, setBizTypeValue] = useState<BusinessCategoryValue>('salon');
  const [bizTypeCustom, setBizTypeCustom] = useState('');

  const getAuthMeta = async () => {
    const { data } = await supabase.auth.getUser();
    return data?.user?.user_metadata || {};
  };

  const makeSlug = (name: string) =>
    name
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9\-]/g, '')
      .replace(/\-+/g, '-')
      .replace(/^\-+|\-+$/g, '');

  // Convert stored value (path or url) to usable <img src>
  const toLogoSrc = (v: string) => {
    const raw = (v || '').trim();
    if (!raw) return '';
    if (raw.startsWith('http://') || raw.startsWith('https://')) return raw;

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(raw);
    return data?.publicUrl || '';
  };

  useEffect(() => {
    (async () => {
      const meta = await getAuthMeta();

      setFormData({
        store_name: (dbUser as any)?.store_name || '',
        store_slug: (dbUser as any)?.store_slug || '',
        brand_color: (dbUser as any)?.brand_color || '#7C3AED',
        address: (dbUser as any)?.address || meta?.[META_KEYS.address] || '',
        description:
          (dbUser as any)?.description || meta?.[META_KEYS.description] || '',
        business_type:
          (dbUser as any)?.business_type ||
          meta?.[META_KEYS.business_type] ||
          'salon',
      });

      const btRaw: string =
        (dbUser as any)?.business_type ||
        meta?.[META_KEYS.business_type] ||
        'salon';
      const bt = splitBusinessCategory(btRaw);
      setBizTypeValue(bt.value);
      setBizTypeCustom(bt.customText);

      // logo from DB or metadata (NEW)
      const fromDb = (dbUser as any)?.logo_url || (dbUser as any)?.logo_path || '';
      const fromMeta = meta?.[META_KEYS.logo_path] || '';
      setLogoUrl(fromDb || fromMeta || '');
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dbUser?.id]);

  const resetForm = async () => {
    const meta = await getAuthMeta();

    setFormData({
      store_name: (dbUser as any)?.store_name || '',
      store_slug: (dbUser as any)?.store_slug || '',
      brand_color: (dbUser as any)?.brand_color || '#7C3AED',
      address: (dbUser as any)?.address || meta?.[META_KEYS.address] || '',
      description:
        (dbUser as any)?.description || meta?.[META_KEYS.description] || '',
      business_type:
        (dbUser as any)?.business_type ||
        meta?.[META_KEYS.business_type] ||
        'salon',
    });

    const btRaw: string =
      (dbUser as any)?.business_type || meta?.[META_KEYS.business_type] || 'salon';
    const bt = splitBusinessCategory(btRaw);
    setBizTypeValue(bt.value);
    setBizTypeCustom(bt.customText);

    const fromDb = (dbUser as any)?.logo_url || (dbUser as any)?.logo_path || '';
    const fromMeta = meta?.[META_KEYS.logo_path] || '';
    setLogoUrl(fromDb || fromMeta || '');

    setMessage({ type: '', text: '' });
    setSlugEditable(false);
  };

  const validate = () => {
    if (!formData.store_name.trim())
      return t('Store name is required.', 'اسم المتجر مطلوب.');
    if (!formData.brand_color)
      return t('Brand color is required.', 'لون العلامة التجارية مطلوب.');
    if (slugEditable && !formData.store_slug.trim())
      return t(
        'Store slug is required if editing is enabled.',
        'رابط المتجر مطلوب عند تفعيل التعديل.'
      );
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

  // ===== Logo upload (NEW) =====
  const onPickLogo = async (file?: File | null) => {
    if (!file) return;

    try {
      setLogoUploading(true);
      setMessage({ type: '', text: '' });

      // validate type
      const okTypes = ['image/png', 'image/jpeg', 'image/webp'];
      if (!okTypes.includes(file.type)) {
        setMessage({
          type: 'error',
          text: t(
            'Please upload PNG/JPG/WebP image.',
            'من فضلك ارفع صورة PNG أو JPG أو WebP.'
          ),
        });
        return;
      }

      // validate size (2MB)
      const max = 2 * 1024 * 1024;
      if (file.size > max) {
        setMessage({
          type: 'error',
          text: t('Max size is 2MB.', 'أقصى حجم 2MB.'),
        });
        return;
      }

      const merchantId = (dbUser as any)?.id;
      if (!merchantId) {
        setMessage({
          type: 'error',
          text: t('Missing merchant id.', 'معرّف التاجر غير موجود.'),
        });
        return;
      }

      // ثابت عشان ما يحصلش لخبطة امتداد
      const path = `logos/${merchantId}/logo.png`;

      // upload (upsert to replace old)
      const { error: upErr } = await supabase.storage
        .from(BUCKET)
        .upload(path, file, {
          upsert: true,
          cacheControl: '3600',
          contentType: file.type,
        });

      if (upErr) throw upErr;

      // save path in auth metadata (so we can read it everywhere)
      await saveToAuthMetadata({ [META_KEYS.logo_path]: path });

      // set local state (store path, not full url)
      setLogoUrl(path);

      // refresh auth/db user
      await refreshUser();

      setMessage({
        type: 'success',
        text: t('Logo updated successfully!', 'تم تحديث اللوجو بنجاح!'),
      });
    } catch (e: any) {
      console.error('Logo upload error:', e?.message || e);
      setMessage({
        type: 'error',
        text: e?.message || t('Logo upload failed.', 'فشل رفع اللوجو.'),
      });
    } finally {
      setLogoUploading(false);
    }
  };

  const removeLogo = async () => {
    try {
      setLogoUploading(true);
      setMessage({ type: '', text: '' });

      const merchantId = (dbUser as any)?.id;
      if (!merchantId) return;

      const path = `logos/${merchantId}/logo.png`;

      // delete from storage (ignore errors)
      await supabase.storage.from(BUCKET).remove([path]);

      // clear metadata
      await saveToAuthMetadata({ [META_KEYS.logo_path]: null });

      setLogoUrl('');
      await refreshUser();

      setMessage({
        type: 'success',
        text: t('Logo removed.', 'تم حذف اللوجو.'),
      });
    } catch (e: any) {
      setMessage({
        type: 'error',
        text: e?.message || t('Could not remove logo.', 'لم يتم حذف اللوجو.'),
      });
    } finally {
      setLogoUploading(false);
    }
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
        if (
          res.error.includes("Could not find the '") &&
          res.error.includes('column')
        ) {
          payload = stripMissingColumns(res.error, payload);
          res = await updateProfile(payload as any);
          if (res?.error) throw new Error(res.error);

          await saveToAuthMetadata(); // store non-db fields in metadata
        } else {
          throw new Error(res.error);
        }
      } else {
        await saveToAuthMetadata(); // store non-db fields in metadata
      }

      await refreshUser();
      setMessage({
        type: 'success',
        text: t(
          'Settings updated successfully!',
          'تم تحديث الإعدادات بنجاح!'
        ),
      });
      setSlugEditable(false);
    } catch (err2: any) {
      setMessage({
        type: 'error',
        text: err2?.message || t('Something went wrong.', 'حدث خطأ ما.'),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500 ${ui.page}`}
      dir={dir}
    >
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className={`text-3xl font-black tracking-tighter ${ui.page}`}>
            {t('Store Settings', 'إعدادات المتجر')}
          </h1>
          <p className={`${ui.muted} font-bold text-xs uppercase tracking-widest mt-1`}>
            {t(
              'Manage your brand identity and preferences',
              'إدارة هوية متجرك وتفضيلاتك'
            )}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={resetForm}
            className={`px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${ui.btnSecondary}`}
          >
            <span className="flex items-center gap-2">
              <RotateCcw size={16} /> {t('Reset', 'إعادة ضبط')}
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
            {t('Save Changes', 'حفظ التغييرات')}
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
            aria-label={t('Dismiss', 'إغلاق')}
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
              {t('Brand Color', 'لون العلامة التجارية')}
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
                {t('Preview', 'معاينة')}
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

          {/* Store Logo (NEW) */}
          <div className={`${ui.surface} p-8 rounded-[2.5rem] border ${ui.border} ${ui.cardShadow}`}>
            <label className={`text-[10px] font-black uppercase tracking-widest mb-4 block ${ui.muted}`}>
              {t('Store Logo', 'لوجو المتجر')}
            </label>

            <div className="flex items-center gap-4">
              <div
                className={`w-16 h-16 rounded-2xl overflow-hidden border ${ui.border2} flex items-center justify-center`}
                style={{ borderColor: isDarkMode ? '#1F2937' : '#E5E7EB' }}
              >
                {logoUrl ? (
                  // key to bust cache
                  <img
                    key={toLogoSrc(logoUrl) + '?v=' + String(Date.now()).slice(-6)}
                    src={toLogoSrc(logoUrl)}
                    alt="logo"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // fallback: clear to avoid broken image spam
                      console.warn('Logo failed to load:', logoUrl, toLogoSrc(logoUrl));
                      (e.currentTarget as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <ImageIcon size={26} className={isDarkMode ? 'text-slate-600' : 'text-gray-300'} />
                )}
              </div>

              <div className="flex-1">
                <p className={`text-xs font-black ${ui.page}`}>
                  {t('Upload your brand logo', 'ارفع لوجو متجرك')}
                </p>
                <p className={`text-[10px] font-bold ${ui.muted}`}>
                  {t('PNG / JPG / WebP up to 2MB', 'PNG / JPG / WebP حتى 2MB')}
                </p>

                <div className="mt-3 flex gap-2">
                  <label
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl font-black text-[10px] uppercase tracking-widest cursor-pointer transition-all ${
                      isDarkMode
                        ? 'bg-slate-900/40 border border-slate-800 text-slate-200 hover:bg-slate-900/60'
                        : 'bg-gray-50 border border-gray-100 text-gray-700 hover:bg-gray-100'
                    } ${logoUploading ? 'opacity-60 pointer-events-none' : ''}`}
                  >
                    {logoUploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                    {t('Upload', 'رفع')}
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      className="hidden"
                      onChange={(e) => onPickLogo(e.target.files?.[0] || null)}
                    />
                  </label>

                  {logoUrl ? (
                    <button
                      type="button"
                      onClick={removeLogo}
                      disabled={logoUploading}
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${
                        isDarkMode
                          ? 'bg-rose-950/30 border border-rose-900/40 text-rose-200 hover:bg-rose-950/45'
                          : 'bg-rose-50 border border-rose-100 text-rose-700 hover:bg-rose-100/70'
                      }`}
                    >
                      <Trash2 size={14} />
                      {t('Remove', 'حذف')}
                    </button>
                  ) : null}
                </div>
              </div>
            </div>

            <p className={`mt-4 text-[10px] font-bold ${ui.muted}`}>
              {t(
                'Tip: If you see 400 error, make sure the bucket is public OR use signed URLs.',
                'ملحوظة: لو ظهر خطأ 400 تأكد إن الباكت Public أو استخدم Signed URLs.'
              )}
            </p>
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
                  <SettingsIcon size={12} /> {t('Store Name', 'اسم المتجر')}
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
                  placeholder={t('Your store name', 'اسم متجرك')}
                />
              </div>

              {/* Store Slug */}
              <div className="space-y-2">
                <label className={`text-[10px] font-black uppercase ml-2 flex items-center gap-2 ${ui.muted}`}>
                  <Globe size={12} /> {t('Store Slug (URL)', 'رابط المتجر (Slug)')}
                  <button
                    type="button"
                    onClick={() => setSlugEditable((v) => !v)}
                    className={`ml-auto px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${ui.border2} ${
                      slugEditable ? 'text-white' : ui.muted
                    }`}
                    style={slugEditable ? { backgroundColor: brandColor, borderColor: 'transparent' } : {}}
                  >
                    <span className="flex items-center gap-1.5">
                      <Pencil size={12} /> {slugEditable ? t('Editing', 'جارٍ التعديل') : t('Edit', 'تعديل')}
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
                  placeholder={t('my-store', 'my-store')}
                />

                <p className={`text-[10px] font-bold ${ui.muted}`}>
                  {t('Live URL', 'الرابط المباشر')}:{' '}
                  <span className={ui.page}>
                    /s/{formData.store_slug || t('your-slug', 'your-slug')}
                  </span>
                </p>
              </div>
            </div>

            {/* Address */}
            <div className="space-y-2">
              <label className={`text-[10px] font-black uppercase ml-2 flex items-center gap-1 ${ui.muted}`}>
                <MapPin size={12} /> {t('Business Address', 'عنوان النشاط')}
              </label>
              <input
                className={`w-full p-4 rounded-2xl font-bold border outline-none transition-all focus:ring-4 ${ui.input}`}
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder={t('Street / City / Country', 'الشارع / المدينة / الدولة')}
              />
              <p className={`text-[10px] font-bold ${ui.muted}`}>
                {t(
                  'If DB column is missing, it will be saved in metadata.',
                  'إذا لم يكن العمود موجودًا في قاعدة البيانات سيتم حفظه في الـ metadata.'
                )}
              </p>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className={`text-[10px] font-black uppercase ml-2 ${ui.muted}`}>
                {t('Description / About', 'الوصف / نبذة')}
              </label>
              <textarea
                rows={4}
                className={`w-full p-4 rounded-2xl font-bold border outline-none transition-all resize-none focus:ring-4 ${ui.input}`}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder={t(
                  'Tell customers what makes your business special...',
                  'عرّف العملاء ما الذي يميز نشاطك...'
                )}
              />
              <p className={`text-[10px] font-bold ${ui.muted}`}>
                {t(
                  'If DB column is missing, it will be saved in metadata.',
                  'إذا لم يكن العمود موجودًا في قاعدة البيانات سيتم حفظه في الـ metadata.'
                )}
              </p>
            </div>

            {/* Business Category */}
            <div className="space-y-2">
              <label className={`text-[10px] font-black uppercase ml-2 flex items-center gap-1 ${ui.muted}`}>
                {t('Business Category', 'تصنيف النشاط')}
              </label>

              <>
                <select
                  className={`w-full p-4 rounded-2xl font-bold border outline-none transition-all focus:ring-4 ${ui.input}`}
                  value={bizTypeValue}
                  onChange={(e) => {
                    const v = e.target.value as BusinessCategoryValue;
                    setBizTypeValue(v);

                    if (v === 'other') {
                      // keep current custom text
                      setFormData((p) => ({ ...p, business_type: bizTypeCustom }));
                      return;
                    }

                    // preset category
                    setBizTypeCustom('');
                    setFormData((p) => ({ ...p, business_type: v }));
                  }}
                >
                  {BUSINESS_CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {t(c.en, c.ar)}
                    </option>
                  ))}
                </select>

                {bizTypeValue === 'other' && (
                  <input
                    className={`w-full p-4 rounded-2xl font-bold border outline-none transition-all focus:ring-4 ${ui.input}`}
                    value={bizTypeCustom}
                    onChange={(e) => {
                      const v = e.target.value;
                      setBizTypeCustom(v);
                      setFormData((p) => ({ ...p, business_type: v }));
                    }}
                    placeholder={t('Type your category', 'اكتب تصنيف نشاطك')}
                  />
                )}

                <p className={`text-[10px] font-bold ${ui.muted}`}>
                  {t(
                    'You can choose a preset category or type your own if it is not listed.',
                    'يمكنك اختيار تصنيف جاهز أو كتابة تصنيفك إذا لم يكن موجوداً.'
                  )}
                </p>
              </>
            </div>

            {/* Security note */}
            <div
              className={`pt-6 border-t flex items-center gap-2 ${
                isDarkMode ? 'border-slate-900/60' : 'border-gray-50'
              } ${ui.muted}`}
            >
              <ShieldCheck size={16} className="text-green-500" />
              <p className="text-[10px] font-bold uppercase tracking-widest">
                {t('Your store data is secured with SSL encryption', 'بيانات متجرك مؤمنة بتشفير SSL')}
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Settings;
