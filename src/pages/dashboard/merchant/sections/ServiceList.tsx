import { useState, useEffect } from 'react';
import { supabase } from '../../../../lib/supabaseClient';
import { useAuth } from '../../../../contexts/AuthContext';
import { 
  Plus, Clock, Users, Trash2, Scissors, 
  ChevronRight, Sparkles, X, DollarSign 
} from 'lucide-react';

interface Service {
  id: string;
  name: string;
  duration_minutes: number;
  buffer_time: number;
  price: number;
  capacity: number;
}

const ServiceList = () => {
  const { user } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '', duration_minutes: 30, buffer_time: 5, price: 0, capacity: 1
  });

  const fetchServices = async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase.from('services').select('*').eq('merchant_id', user?.id);
    if (data) setServices(data);
    setLoading(false);
  };

  useEffect(() => { fetchServices(); }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from('services').insert([{ ...formData, merchant_id: user?.id }]);
    if (!error) {
      setIsModalOpen(false);
      fetchServices();
      setFormData({ name: '', duration_minutes: 30, buffer_time: 5, price: 0, capacity: 1 });
    }
  };

  const deleteService = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      const { error } = await supabase.from('services').delete().eq('id', id);
      if (!error) fetchServices();
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
        <div>
          <h2 className="text-4xl font-black dark:text-white tracking-tight mb-2 flex items-center gap-3">
            Service Menu <Sparkles className="text-purple-500" size={28} />
          </h2>
          <p className="text-gray-400 font-bold">Design your offerings and optimize your schedule.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-purple-600 text-white px-10 py-5 rounded-[2rem] font-black shadow-2xl shadow-purple-200 hover:bg-purple-700 hover:-translate-y-1 transition-all active:scale-95 flex items-center gap-3"
        >
          <Plus size={24} strokeWidth={3} /> Create Service
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
           <div className="w-14 h-14 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
           <p className="text-gray-400 font-black uppercase tracking-widest text-xs">Polishing your menu...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map(s => (
            <div key={s.id} className="bg-white dark:bg-gray-900 p-10 rounded-[3.5rem] border border-gray-50 dark:border-gray-800 shadow-sm hover:shadow-[0_40px_80px_-15px_rgba(0,0,0,0.05)] transition-all duration-500 group relative overflow-hidden">
              
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-50 dark:bg-purple-900/10 rounded-bl-[5rem] -mr-16 -mt-16 group-hover:scale-110 transition-transform"></div>

              <div className="relative z-10">
                <div className="w-16 h-16 bg-purple-600 text-white rounded-[1.5rem] flex items-center justify-center mb-8 shadow-xl shadow-purple-100 dark:shadow-none transition-transform group-hover:rotate-12">
                  <Scissors size={32} />
                </div>
                
                <h4 className="font-black text-2xl mb-6 dark:text-white uppercase tracking-tighter group-hover:text-purple-600 transition-colors">
                  {s.name}
                </h4>
                
                <div className="space-y-4 mb-10">
                  <div className="flex items-center gap-3 text-sm font-bold text-gray-400 bg-gray-50 dark:bg-gray-800/50 w-fit px-4 py-2 rounded-2xl">
                    <Clock size={18} className="text-purple-400" /> {s.duration_minutes}m <span className="opacity-40">/</span> +{s.buffer_time}m rest
                  </div>
                  <div className="flex items-center gap-3 text-sm font-bold text-gray-400 bg-gray-50 dark:bg-gray-800/50 w-fit px-4 py-2 rounded-2xl">
                    <Users size={18} className="text-purple-400" /> Max {s.capacity} Guest{s.capacity > 1 ? 's' : ''}
                  </div>
                </div>

                <div className="flex justify-between items-center pt-8 border-t border-gray-50 dark:border-gray-800">
                  <div>
                    <span className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] block mb-1">Price</span>
                    <span className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter">${s.price}</span>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => deleteService(s.id)}
                      className="p-4 text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-2xl transition-all"
                    >
                      <Trash2 size={20}/>
                    </button>
                    <button className="p-4 bg-gray-50 dark:bg-gray-800 text-gray-400 rounded-2xl hover:bg-purple-600 hover:text-white transition-all">
                      <ChevronRight size={20} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Empty State Card */}
          {services.length === 0 && (
             <button 
                onClick={() => setIsModalOpen(true)}
                className="group border-4 border-dashed border-gray-100 dark:border-gray-800 rounded-[3.5rem] p-10 flex flex-col items-center justify-center text-center hover:border-purple-200 transition-all min-h-[400px]"
             >
                <div className="w-20 h-20 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6 group-hover:bg-purple-50 transition-colors">
                    <Plus size={40} className="text-gray-300 group-hover:text-purple-500" />
                </div>
                <h3 className="text-xl font-black text-gray-300 uppercase italic">Add your first service</h3>
             </button>
          )}
        </div>
      )}

      {/* Modal - المطور بشكل كامل */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-xl transition-all">
          <div className="bg-white dark:bg-gray-900 w-full max-w-xl rounded-[4rem] p-12 shadow-2xl animate-in zoom-in-95 duration-300 relative border border-white/20">
            
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-8 right-8 p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-2xl transition-all"
            >
              <X size={24} className="text-gray-400" />
            </button>

            <h3 className="text-3xl font-black mb-2 dark:text-white uppercase tracking-tighter">New Service</h3>
            <p className="text-gray-400 font-bold mb-10 italic">Configure your new offering</p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Service Details</label>
                <input 
                  required placeholder="Service Name (e.g., Luxury Fade)" 
                  className="w-full p-6 rounded-[2rem] bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-purple-500 dark:text-white outline-none font-bold text-lg transition-all"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Duration (Min)</label>
                  <div className="relative">
                    <Clock className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input type="number" className="w-full p-6 pl-14 rounded-[2rem] bg-gray-50 dark:bg-gray-800 border-none font-black" value={formData.duration_minutes} onChange={e => setFormData({...formData, duration_minutes: parseInt(e.target.value)})} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Buffer (Min)</label>
                  <input type="number" className="w-full p-6 rounded-[2rem] bg-gray-50 dark:bg-gray-800 border-none font-black text-purple-600" value={formData.buffer_time} onChange={e => setFormData({...formData, buffer_time: parseInt(e.target.value)})} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Price ($)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-6 top-1/2 -translate-y-1/2 text-emerald-500" size={20} />
                    <input type="number" className="w-full p-6 pl-14 rounded-[2rem] bg-gray-50 dark:bg-gray-800 border-none font-black text-gray-900 dark:text-white" value={formData.price} onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Capacity</label>
                  <div className="relative">
                    <Users className="absolute left-6 top-1/2 -translate-y-1/2 text-blue-500" size={20} />
                    <input type="number" className="w-full p-6 pl-14 rounded-[2rem] bg-gray-50 dark:bg-gray-800 border-none font-black" value={formData.capacity} onChange={e => setFormData({...formData, capacity: parseInt(e.target.value)})} />
                  </div>
                </div>
              </div>

              <button 
                type="submit" 
                className="w-full bg-purple-600 text-white py-6 rounded-[2rem] font-black text-lg shadow-2xl shadow-purple-200 hover:bg-purple-700 transition-all mt-6 active:scale-95"
              >
                Launch Service
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceList;