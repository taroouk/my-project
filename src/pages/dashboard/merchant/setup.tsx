import { useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { 
  ArrowRight, Palette, Layers, 
  Layout, Sparkles, Rows, Grid2X2, 
  CreditCard, LayoutList, GalleryVertical, AlignLeft 
} from 'lucide-react';
import { supabase } from '../../../lib/supabaseClient';

const SetupStore = () => {
  const { updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    store_name: '',
    store_slug: '',
    theme_preference: 'grid', 
    brand_color: '#6366F1',
    currency: 'SAR' 
  });

  const layouts = [
    { 
      id: 'grid', label: 'Modern Grid', desc: 'Visual & Balanced', icon: <Grid2X2 size={18}/>,
      preview: (color: string) => (
        <div className="grid grid-cols-2 gap-1 w-8">
          <div className="h-3 rounded-[2px]" style={{backgroundColor: color}}/>
          <div className="h-3 rounded-[2px] bg-gray-200"/>
          <div className="h-3 rounded-[2px] bg-gray-200"/>
          <div className="h-3 rounded-[2px] bg-gray-200"/>
        </div>
      )
    },
    { 
      id: 'list', label: 'Classic List', desc: 'Clear & Minimal', icon: <Rows size={18}/>,
      preview: (color: string) => (
        <div className="space-y-1 w-8">
          <div className="h-2 w-full rounded-[2px]" style={{backgroundColor: color}}/>
          <div className="h-2 w-full rounded-[2px] bg-gray-200"/>
          <div className="h-2 w-full rounded-[2px] bg-gray-200"/>
        </div>
      )
    },
    { 
      id: 'cards', label: 'Elite Cards', desc: 'Large Previews', icon: <CreditCard size={18}/>,
      preview: (color: string) => (
        <div className="space-y-1 w-8">
          <div className="h-4 w-full rounded-[2px]" style={{backgroundColor: color}}/>
          <div className="h-3 w-full rounded-[2px] bg-gray-200"/>
        </div>
      )
    }
  ];

  const brandColors = [
    { name: 'Indigo', hex: '#6366F1' }, { name: 'Rose', hex: '#F43F5E' },
    { name: 'Emerald', hex: '#10B981' }, { name: 'Amber', hex: '#F59E0B' },
    { name: 'Sky', hex: '#0EA5E9' }, { name: 'Black', hex: '#111827' },
  ];

  const handleCompleteSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.store_name) return;
    setLoading(true);

    try {
      // 1. تحديث جدول public.users بالبيانات الكاملة
      const { error: profileError } = await updateProfile({ 
        store_name: formData.store_name,
        store_slug: formData.store_slug,
        theme_preference: formData.theme_preference,
        brand_color: formData.brand_color,
        currency: formData.currency as any,
        setup_complete: true 
      });

      if (profileError) throw new Error(profileError);

      // 2. تحديث ميتاداتا المستخدم في Auth (مهم جداً للـ Protection Routes)
      await supabase.auth.updateUser({
        data: { 
          setup_complete: true,
          store_name: formData.store_name 
        }
      });

      // 3. التوجه للداشبورد مباشرة
      window.location.assign('/merchant');

    } catch (err: any) {
      console.error("Setup Final Error:", err.message);
      alert("خطأ في حفظ البيانات: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col lg:flex-row font-sans" dir="ltr">
      
      {/* القسم الأيسر: الإعدادات */}
      <div className="flex-1 p-8 md:p-12 lg:p-16 overflow-y-auto">
        <div className="max-w-2xl mx-auto space-y-10">
          
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center text-white shadow-xl rotate-3">
              <Sparkles size={24}/>
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-gray-900 uppercase leading-none">Storefront Editor</h1>
              <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] mt-2">Personalize Your Business</p>
            </div>
          </div>

          <form onSubmit={handleCompleteSetup} className="space-y-10">
            
            {/* 01. الهوية والعملة */}
            <div className="space-y-4">
              <label className="text-[11px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-2">
                <Layers size={14}/> 01. Store Identity & Currency
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input 
                  required 
                  className="w-full p-4 bg-white rounded-xl font-bold border-2 border-transparent focus:border-black shadow-sm transition-all outline-none"
                  placeholder="Store Name" 
                  value={formData.store_name} 
                  onChange={(e) => setFormData({...formData, store_name: e.target.value, store_slug: e.target.value.toLowerCase().replace(/\s+/g, '-')})} 
                />
                
                <select 
                  className="w-full p-4 bg-white rounded-xl font-bold border-2 border-transparent focus:border-black shadow-sm outline-none appearance-none"
                  value={formData.currency}
                  onChange={(e) => setFormData({...formData, currency: e.target.value})}
                >
                  <option value="SAR">🇸🇦 Saudi Riyal (SAR)</option>
                  <option value="EGP">🇪🇬 Egyptian Pound (EGP)</option>
                  <option value="AED">🇦🇪 UAE Dirham (AED)</option>
                  <option value="USD">🇺🇸 US Dollar (USD)</option>
                </select>
              </div>
            </div>

            {/* 02. نمط العرض (Layout) */}
            <div className="space-y-4">
              <label className="text-[11px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-2">
                <Layout size={14}/> 02. Design Layout
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {layouts.map((l) => (
                  <button 
                    key={l.id} 
                    type="button" 
                    onClick={() => setFormData({...formData, theme_preference: l.id})}
                    className={`p-5 rounded-xl border-2 transition-all flex flex-col items-center text-center gap-4 ${
                      formData.theme_preference === l.id 
                      ? 'border-black bg-white shadow-lg scale-[1.02]' 
                      : 'border-gray-100 bg-gray-50 hover:border-gray-200'
                    }`}
                  >
                    {l.preview(formData.brand_color)}
                    <div>
                      <p className="text-[10px] font-black text-gray-900 uppercase leading-none">{l.label}</p>
                      <p className="text-[8px] font-bold text-gray-400 uppercase mt-1">{l.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* 03. لون البراند */}
            <div className="space-y-4">
              <label className="text-[11px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-2">
                <Palette size={14}/> 03. Primary Brand Color
              </label>
              <div className="flex flex-wrap gap-3 p-4 bg-white rounded-2xl shadow-sm border border-gray-50">
                {brandColors.map(c => (
                  <button 
                    key={c.hex} 
                    type="button" 
                    onClick={() => setFormData({...formData, brand_color: c.hex})}
                    className={`w-10 h-10 rounded-full transition-all border-4 ${
                      formData.brand_color === c.hex ? 'border-black scale-110 shadow-md' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: c.hex }} 
                  />
                ))}
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-5 bg-black text-white rounded-2xl font-black text-sm tracking-[0.2em] shadow-2xl hover:bg-gray-800 transition-all flex items-center justify-center gap-4 disabled:opacity-50"
            >
              {loading ? "SAVING DATA..." : <>FINISH SETUP <ArrowRight size={20}/></>}
            </button>
          </form>
        </div>
      </div>

      {/* القسم الأيمن: المعاينة المباشرة (Live Preview) */}
      <div className="hidden lg:flex flex-1 bg-gray-100 items-center justify-center p-12 border-l border-gray-200">
        <div className="w-full max-w-[280px] aspect-[9/19] bg-gray-900 rounded-[3rem] p-3 shadow-2xl border-[8px] border-gray-800 relative">
          <div className="w-full h-full bg-white rounded-[2.2rem] overflow-hidden flex flex-col">
            
            {/* واجهة المتجر في المعاينة */}
            <div className="h-32 flex flex-col items-center justify-center p-6 text-white" style={{ backgroundColor: formData.brand_color }}>
              <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl mb-2 flex items-center justify-center font-bold">
                {formData.store_name?.charAt(0) || "S"}
              </div>
              <p className="text-[9px] font-black uppercase tracking-widest truncate w-full px-2 text-center">
                {formData.store_name || "Store Name"}
              </p>
            </div>
            
            <div className="p-4 flex-1 bg-gray-50 space-y-4">
              <div className="h-2 w-16 bg-gray-200 rounded-full"></div>
              <div className="grid grid-cols-2 gap-2">
                {[1,2,3,4].map(i => (
                  <div key={i} className="bg-white p-2 rounded-lg border border-gray-100">
                    <div className="aspect-square rounded bg-gray-50 mb-1" style={{ backgroundColor: i===1 ? formData.brand_color + '15' : '' }}></div>
                    <div className="h-1 w-full bg-gray-100 rounded"></div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 border-t border-gray-100">
              <div className="h-8 w-full rounded-lg" style={{ backgroundColor: formData.brand_color, opacity: 0.8 }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SetupStore;