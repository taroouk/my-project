import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../lib/supabaseClient';
import { useAuth } from '../../../contexts/AuthContext';
import { Rocket, Palette, Globe, CheckCircle2, ArrowRight, Store, Loader2 } from 'lucide-react';

const SetupStore = () => {
  const { user, refreshUser } = useAuth(); // استدعينا refreshUser التي أضفناها في الملف الأول
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    company_name: '',
    brand_color: '#7c3aed',
    brand_tagline: 'Premium Services, Exceptional Experience.'
  });

  const storeSlug = formData.company_name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');

  const handleFinish = async () => {
    if (!formData.company_name) return alert("Please enter your business name");
    if (!user?.id) return alert("User session not found. Please re-login.");
    
    setIsSubmitting(true);
    
    try {
      // 1. تحديث الـ Metadata في Auth أولاً (لأنها الأهم للـ Guard)
      const { error: authError } = await supabase.auth.updateUser({
        data: { 
          store_slug: storeSlug,
          setup_complete: true,
          role: 'merchant',
          company_name: formData.company_name
        }
      });

      if (authError) throw authError;

      // 2. تحديث بيانات الجدول في قاعدة البيانات (حتى لو فشل، الـ Metadata ستحميك)
      const { error: dbError } = await supabase
        .from('users')
        .update({
          company_name: formData.company_name,
          store_slug: storeSlug,
          role: 'merchant',
          brand_color: formData.brand_color,
          brand_tagline: formData.brand_tagline
        })
        .eq('id', user.id);

      if (dbError) {
        console.warn("Database update failed, but Auth metadata was saved:", dbError.message);
      }

      // 3. تحديث حالة الـ Context يدوياً قبل الانتقال
      if (refreshUser) await refreshUser();

      // 4. الانتقال لصفحة التاجر باستخدام إعادة تحميل صلبة لضمان نظافة الحالة
      window.location.href = '/merchant';

    } catch (err: any) {
      console.error("Setup Crash:", err);
      alert(err.message || "Error saving settings. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFDFF] flex overflow-hidden">
      <div className="w-full lg:w-1/2 p-12 flex flex-col justify-center bg-white shadow-2xl z-10 border-r border-gray-100">
        <div className="max-w-md mx-auto w-full">
          <div className="flex items-center gap-2 text-purple-600 font-black mb-12 tracking-tighter">
            <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center text-white">
               <Rocket size={20} />
            </div>
            <span>SERVLY BUILDER</span>
          </div>

          {step === 1 && (
            <div className="animate-in slide-in-from-left duration-500">
              <h1 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">Let's name your brand.</h1>
              <p className="text-gray-500 mb-10 text-lg">This is the name your customers will see on your public store.</p>
              
              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black uppercase text-gray-400 ml-2 mb-2 block">Business Name</label>
                  <input 
                    autoFocus
                    placeholder="e.g. Barber Pro, Glow Spa" 
                    className="w-full p-5 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-purple-600 focus:bg-white outline-none transition-all text-lg font-bold shadow-inner"
                    value={formData.company_name}
                    onChange={(e) => setFormData({...formData, company_name: e.target.value})}
                  />
                </div>
                
                {formData.company_name && (
                  <div className="flex items-center gap-3 p-5 bg-purple-50 rounded-2xl border border-purple-100 text-purple-700 animate-in zoom-in-95">
                    <Globe size={20} className="shrink-0" />
                    <span className="text-sm font-bold truncate">servly.com/store/{storeSlug}</span>
                  </div>
                )}

                <button 
                  disabled={!formData.company_name}
                  onClick={() => setStep(2)} 
                  className="w-full py-5 bg-black text-white rounded-2xl font-black text-lg flex items-center justify-center gap-2 hover:bg-gray-800 disabled:opacity-30 transition-all shadow-xl"
                >
                  Continue to Style <ArrowRight size={20}/>
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="animate-in slide-in-from-right duration-500">
              <h1 className="text-4xl font-black mb-4 tracking-tight">Style your site.</h1>
              <p className="text-gray-500 mb-10 text-lg">Choose a color that matches your brand personality.</p>
              
              <div className="grid grid-cols-5 gap-4 mb-10">
                {['#7c3aed', '#000000', '#ec4899', '#10b981', '#3b82f6'].map(color => (
                  <button 
                    key={color}
                    onClick={() => setFormData({...formData, brand_color: color})}
                    className={`h-14 rounded-2xl border-4 transition-all ${formData.brand_color === color ? 'border-purple-200 scale-110 shadow-lg' : 'border-transparent opacity-60 hover:opacity-100'}`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>

              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black uppercase text-gray-400 ml-2 mb-2 block">Brand Tagline</label>
                  <input 
                    placeholder="e.g. The best haircuts in Cairo" 
                    className="w-full p-5 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-purple-600 focus:bg-white outline-none transition-all font-bold"
                    value={formData.brand_tagline}
                    onChange={(e) => setFormData({...formData, brand_tagline: e.target.value})}
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    disabled={isSubmitting}
                    onClick={() => setStep(1)} 
                    className="px-8 py-5 bg-gray-100 text-gray-500 rounded-2xl font-black hover:bg-gray-200 transition-all"
                  >
                    Back
                  </button>
                  <button 
                    disabled={isSubmitting || !formData.company_name}
                    onClick={handleFinish} 
                    className="flex-1 py-5 bg-purple-600 text-white rounded-2xl font-black text-lg shadow-2xl shadow-purple-100 flex items-center justify-center gap-2 hover:bg-purple-700 active:scale-95 transition-all disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <Loader2 className="animate-spin" size={22} />
                    ) : (
                      <>Launch Store <CheckCircle2 size={22}/></>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="hidden lg:flex w-1/2 bg-gray-50 items-center justify-center p-20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />

        <div className="w-[360px] h-[720px] bg-white rounded-[3.5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] border-[12px] border-gray-900 overflow-hidden relative">
          <div className="h-8 bg-gray-900 w-1/3 mx-auto rounded-b-3xl absolute top-0 left-1/2 -translate-x-1/2 z-20" />
          
          <div className="h-full overflow-y-auto bg-gray-50">
             <div className="h-48 flex flex-col items-center justify-center text-white p-6 transition-all duration-700" style={{ backgroundColor: formData.brand_color }}>
                <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-4">
                  <Store size={32} />
                </div>
                <h3 className="font-black text-xl uppercase tracking-tighter text-center line-clamp-1">
                  {formData.company_name || 'My Brand'}
                </h3>
             </div>

             <div className="p-6 space-y-4">
                <div className="text-center mb-6">
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-relaxed">
                     {formData.brand_tagline}
                   </p>
                </div>
                {[1, 2, 3].map(i => (
                  <div key={i} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center opacity-40">
                    <div className="space-y-2">
                      <div className="w-24 h-3 bg-gray-100 rounded-full" />
                      <div className="w-16 h-2 bg-gray-50 rounded-full" />
                    </div>
                    <div className="w-10 h-10 bg-gray-50 rounded-xl" />
                  </div>
                ))}
             </div>
             
             <div className="absolute bottom-10 left-6 right-6 p-4 rounded-2xl shadow-lg shadow-black/5 bg-white border border-gray-100">
                <div className="w-full h-12 rounded-xl flex items-center justify-center text-white font-black text-xs" style={{ backgroundColor: formData.brand_color }}>
                  BOOK AN APPOINTMENT
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SetupStore;