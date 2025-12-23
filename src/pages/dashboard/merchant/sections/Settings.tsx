import { useState } from 'react';
import { supabase } from '../../../../lib/supabaseClient';
import { useAuth } from '../../../../contexts/AuthContext';
import { 
  Settings as SettingsIcon, Save, Globe, Palette, 
  MapPin, Clock, Camera, ShieldCheck, Loader2 
} from 'lucide-react';

const Settings = () => {
  const { dbUser, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [formData, setFormData] = useState({
    store_name: dbUser?.store_name || '',
    store_slug: dbUser?.store_slug || '',
    brand_color: dbUser?.brand_color || '#7C3AED',
    address: dbUser?.address || '',
    description: dbUser?.description || '',
    business_type: dbUser?.business_type || 'salon'
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const { error } = await supabase
        .from('users')
        .update(formData)
        .eq('id', dbUser?.id);

      if (error) throw error;
      
      await refreshUser();
      setMessage({ type: 'success', text: 'Settings updated successfully!' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tighter">Store Settings</h1>
          <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mt-1">Manage your brand identity and preferences</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={loading}
          className="flex items-center gap-2 px-8 py-3 bg-purple-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-purple-100 hover:bg-purple-700 transition-all disabled:opacity-50"
        >
          {loading ? <Loader2 className="animate-spin" size={18}/> : <Save size={18}/>}
          Save Changes
        </button>
      </div>

      {message.text && (
        <div className={`p-4 rounded-2xl font-bold text-sm border ${message.type === 'success' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Brand & Visuals */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] border border-gray-50 shadow-sm text-center">
            <div className="relative w-24 h-24 mx-auto mb-4">
              <div className="w-full h-full bg-gray-100 rounded-[2rem] flex items-center justify-center text-gray-300">
                <Camera size={32} />
              </div>
              <button className="absolute -bottom-2 -right-2 p-2 bg-white shadow-lg rounded-xl text-purple-600 border border-gray-50">
                <Camera size={16} />
              </button>
            </div>
            <h3 className="font-black text-gray-900">Store Logo</h3>
            <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">PNG or JPG max 2MB</p>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] border border-gray-50 shadow-sm">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 block">Brand Color</label>
            <div className="flex items-center gap-4">
              <input 
                type="color" 
                className="w-12 h-12 rounded-xl border-none cursor-pointer"
                value={formData.brand_color}
                onChange={(e) => setFormData({...formData, brand_color: e.target.value})}
              />
              <span className="font-mono font-bold text-gray-900 uppercase">{formData.brand_color}</span>
            </div>
          </div>
        </div>

        {/* Right Column: General Info */}
        <div className="md:col-span-2 space-y-6">
          <form className="bg-white p-10 rounded-[3rem] border border-gray-50 shadow-sm space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase ml-2 flex items-center gap-1">
                  <SettingsIcon size={12}/> Store Name
                </label>
                <input 
                  className="w-full p-4 bg-gray-50 rounded-2xl font-bold border-2 border-transparent focus:border-purple-600 outline-none transition-all"
                  value={formData.store_name}
                  onChange={(e) => setFormData({...formData, store_name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase ml-2 flex items-center gap-1">
                  <Globe size={12}/> Store Slug (URL)
                </label>
                <input 
                  disabled
                  className="w-full p-4 bg-gray-100 text-gray-400 rounded-2xl font-bold border-none outline-none cursor-not-allowed"
                  value={formData.store_slug}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase ml-2 flex items-center gap-1">
                <MapPin size={12}/> Business Address
              </label>
              <input 
                className="w-full p-4 bg-gray-50 rounded-2xl font-bold border-2 border-transparent focus:border-purple-600 outline-none transition-all"
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase ml-2">Description / About</label>
              <textarea 
                rows={4}
                className="w-full p-4 bg-gray-50 rounded-2xl font-bold border-2 border-transparent focus:border-purple-600 outline-none transition-all resize-none"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </div>

            <div className="pt-6 border-t border-gray-50 flex items-center gap-2 text-gray-400">
              <ShieldCheck size={16} className="text-green-500" />
              <p className="text-[10px] font-bold uppercase tracking-widest">Your store data is secured with SSL encryption</p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Settings;