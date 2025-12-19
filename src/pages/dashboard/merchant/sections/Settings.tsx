import { useState, useEffect } from 'react';
import { supabase } from '../../../../lib/supabaseClient';
import { useAuth } from '../../../../contexts/AuthContext';
import { 
  Save, 
  Store, 
  Globe, 
  Briefcase, 
  CheckCircle2, 
  AlertCircle,
  Palette
} from 'lucide-react';

const Settings = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [formData, setFormData] = useState({
    company_name: '',
    store_slug: '',
    business_type: ''
  });

  useEffect(() => {
    if (user?.user_metadata) {
      setFormData({
        company_name: user.user_metadata.company_name || '',
        store_slug: user.user_metadata.store_slug || '',
        business_type: user.user_metadata.business_type || ''
      });
    }
  }, [user]);

  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    const { error } = await supabase.auth.updateUser({
      data: { 
        company_name: formData.company_name,
        store_slug: formData.store_slug.toLowerCase().replace(/\s+/g, '-'),
        business_type: formData.business_type
      }
    });

    if (error) {
      setMessage({ type: 'error', text: error.message });
    } else {
      setMessage({ type: 'success', text: 'Settings updated successfully! Your store is now live with new identity.' });
    }
    setLoading(false);
  };

  return (
    <div className="max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="mb-12">
        <h2 className="text-4xl font-black dark:text-white tracking-tighter uppercase mb-2">Store Identity</h2>
        <p className="text-gray-400 font-bold italic text-lg">Control how your business appears to the world.</p>
      </div>

      <form onSubmit={handleUpdateSettings} className="space-y-8">
        
        {/* Status Messages */}
        {message.text && (
          <div className={`p-6 rounded-[2rem] flex items-center gap-4 animate-in zoom-in-95 ${
            message.type === 'success' ? 'bg-emerald-50 text-emerald-600 border-2 border-emerald-100' : 'bg-red-50 text-red-600 border-2 border-red-100'
          }`}>
            {message.type === 'success' ? <CheckCircle2 /> : <AlertCircle />}
            <p className="font-black uppercase tracking-tight">{message.text}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Business Name */}
          <div className="bg-white dark:bg-gray-900 p-10 rounded-[3rem] border border-gray-50 dark:border-gray-800 shadow-sm space-y-4">
            <div className="w-14 h-14 bg-purple-50 dark:bg-purple-900/20 text-purple-600 rounded-2xl flex items-center justify-center mb-4">
              <Store size={28} />
            </div>
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Brand Name</label>
            <input 
              type="text"
              placeholder="e.g., Gent's Lounge"
              className="w-full p-5 rounded-2xl bg-gray-50 dark:bg-gray-800 border-none outline-none focus:ring-4 focus:ring-purple-500/10 font-bold text-lg transition-all"
              value={formData.company_name}
              onChange={(e) => setFormData({...formData, company_name: e.target.value})}
            />
          </div>

          {/* Store Slug (URL) */}
          <div className="bg-white dark:bg-gray-900 p-10 rounded-[3rem] border border-gray-50 dark:border-gray-800 shadow-sm space-y-4">
            <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-2xl flex items-center justify-center mb-4">
              <Globe size={28} />
            </div>
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Store URL Slug</label>
            <div className="relative">
               <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 font-bold">servly.com/</span>
               <input 
                type="text"
                placeholder="my-store-name"
                className="w-full p-5 pl-32 rounded-2xl bg-gray-50 dark:bg-gray-800 border-none outline-none focus:ring-4 focus:ring-blue-500/10 font-bold text-lg transition-all lowercase"
                value={formData.store_slug}
                onChange={(e) => setFormData({...formData, store_slug: e.target.value})}
              />
            </div>
          </div>

          {/* Business Type */}
          <div className="bg-white dark:bg-gray-900 p-10 rounded-[3rem] border border-gray-50 dark:border-gray-800 shadow-sm space-y-4">
            <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-2xl flex items-center justify-center mb-4">
              <Briefcase size={28} />
            </div>
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Industry</label>
            <select 
              className="w-full p-5 rounded-2xl bg-gray-50 dark:bg-gray-800 border-none outline-none focus:ring-4 focus:ring-emerald-500/10 font-bold text-lg appearance-none transition-all"
              value={formData.business_type}
              onChange={(e) => setFormData({...formData, business_type: e.target.value})}
            >
              <option value="">Select Category</option>
              <option value="Barbershop">Barbershop</option>
              <option value="Beauty Salon">Beauty Salon</option>
              <option value="Gym & Fitness">Gym & Fitness</option>
              <option value="Medical Clinic">Medical Clinic</option>
            </select>
          </div>

          {/* Design Customization placeholder */}
          <div className="bg-purple-600 p-10 rounded-[3rem] shadow-xl shadow-purple-200 flex flex-col justify-center text-white relative overflow-hidden group">
             <Palette size={120} className="absolute -right-8 -bottom-8 opacity-10 group-hover:rotate-12 transition-transform duration-700" />
             <h4 className="text-2xl font-black uppercase mb-2 italic">Store Design</h4>
             <p className="font-bold opacity-80 mb-6">Custom colors and themes are coming in the next update.</p>
             <div className="flex gap-2">
                <div className="w-8 h-8 rounded-full bg-white/20 border-2 border-white"></div>
                <div className="w-8 h-8 rounded-full bg-black/20"></div>
                <div className="w-8 h-8 rounded-full bg-blue-500/20"></div>
             </div>
          </div>

        </div>

        <div className="flex justify-end pt-10">
          <button 
            disabled={loading}
            className="bg-black dark:bg-white dark:text-black text-white px-12 py-6 rounded-[2rem] font-black text-xl shadow-2xl flex items-center gap-4 hover:-translate-y-2 active:scale-95 transition-all disabled:opacity-50"
          >
            {loading ? 'SAVING...' : (
              <>
                <Save size={24} strokeWidth={3} /> Update Profile
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Settings;