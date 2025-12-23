import { useState, useEffect } from 'react';
import { supabase } from '../../../../lib/supabaseClient';
import { useAuth } from '../../../../contexts/AuthContext';
import { 
  Plus, Search, Filter, MoreVertical, 
  Clock, Tag, Trash2, Edit2, 
  Package, Scissors, X, Loader2, AlertCircle
} from 'lucide-react';

// Strict Type Definitions
type ItemType = 'service' | 'product' | 'subscription';

interface Service {
  id: string;
  name: string;
  price: number;
  duration: number;
  category: string;
  type: ItemType;
  status: 'active' | 'draft';
}

const ServiceList = () => {
  const { user } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  
  // New Item State
  const [newService, setNewService] = useState({
    name: '',
    price: '',
    duration: '30',
    category: '',
    type: 'service' as ItemType
  });

  useEffect(() => {
    if (user?.id) {
      fetchServices();
    }
  }, [user]);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('merchant_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setServices(data || []);
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddService = async () => {
    if (!newService.name || !newService.price) {
      alert("Please enter both Name and Price");
      return;
    }
    
    try {
      setActionLoading(true);
      const { error } = await supabase.from('services').insert([{
        merchant_id: user?.id,
        name: newService.name,
        price: parseFloat(newService.price),
        duration: parseInt(newService.duration),
        category: newService.category || 'General',
        type: newService.type,
        status: 'active'
      }]);

      if (error) throw error;
      
      setShowAddModal(false);
      fetchServices();
      setNewService({ name: '', price: '', duration: '30', category: '', type: 'service' });
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const deleteService = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;
    try {
      const { error } = await supabase.from('services').delete().eq('id', id);
      if (error) throw error;
      fetchServices();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700" dir="ltr">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tighter italic">Catalog Management</h1>
          <p className="text-gray-400 font-bold text-[10px] uppercase tracking-[0.2em] mt-1">Manage your services and products catalog</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-purple-600 text-white px-8 py-4 rounded-2xl font-black flex items-center justify-center gap-2 shadow-xl shadow-purple-100 hover:bg-purple-700 hover:-translate-y-1 transition-all active:scale-95"
        >
          <Plus size={20} /> Add New Item
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-3 relative group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-purple-600 transition-colors" size={20} />
          <input 
            type="text" 
            placeholder="Search by name, category, or type..." 
            className="w-full bg-white border border-gray-100 rounded-2xl pl-14 pr-5 py-4 font-bold outline-none focus:ring-4 focus:ring-purple-50 transition-all shadow-sm"
          />
        </div>
        <button className="bg-white border border-gray-100 rounded-2xl font-black text-gray-500 flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors shadow-sm">
          <Filter size={18} /> Filters
        </button>
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="h-96 flex flex-col items-center justify-center gap-4">
          <Loader2 className="w-10 h-10 text-purple-600 animate-spin" />
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Loading Catalog...</p>
        </div>
      ) : services.length === 0 ? (
        <div className="bg-white rounded-[3rem] p-24 text-center border-2 border-dashed border-gray-100 flex flex-col items-center">
           <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-200 mb-6">
              <Package size={40} />
           </div>
           <h3 className="text-xl font-black text-gray-900 mb-2">No items found</h3>
           <p className="text-gray-400 font-bold mb-8 text-sm max-w-xs">Your catalog is empty. Start adding services or products for your customers.</p>
           <button onClick={() => setShowAddModal(true)} className="bg-gray-900 text-white px-10 py-4 rounded-2xl font-black hover:bg-black transition-all shadow-lg">Create First Item</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <div key={service.id} className="bg-white p-6 rounded-[2.5rem] border border-gray-50 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all group relative overflow-hidden">
               <div className="flex justify-between items-start mb-6">
                  <div className={`p-4 rounded-2xl ${service.type === 'service' ? 'bg-indigo-50 text-indigo-600' : 'bg-orange-50 text-orange-600'}`}>
                     {service.type === 'service' ? <Scissors size={24}/> : <Package size={24}/>}
                  </div>
                  <div className="flex gap-1">
                    <button className="p-2 text-gray-300 hover:text-purple-600 transition-colors"><Edit2 size={18}/></button>
                    <button 
                      onClick={() => deleteService(service.id)}
                      className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={18}/>
                    </button>
                  </div>
               </div>
               
               <h3 className="text-xl font-black text-gray-900 mb-2 truncate">{service.name}</h3>
               <div className="flex items-center gap-3 text-gray-400 font-black text-[9px] mb-8 uppercase tracking-widest">
                  <span className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100"><Clock size={12}/> {service.duration} MIN</span>
                  <span className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100"><Tag size={12}/> {service.category}</span>
               </div>

               <div className="pt-6 border-t border-gray-50 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black text-gray-300 uppercase tracking-tighter">Investment</span>
                    <div className="text-2xl font-black text-purple-600 tracking-tighter">
                      <small className="text-xs mr-1 font-bold">SAR</small>{service.price}
                    </div>
                  </div>
                  <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase ${service.status === 'active' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                    {service.status}
                  </div>
               </div>
            </div>
          ))}
        </div>
      )}

      {/* Add New Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-md bg-black/20 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-xl rounded-[3.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300 border border-white/20">
            <div className="p-10 bg-purple-600 text-white relative">
               <button onClick={() => setShowAddModal(false)} className="absolute right-8 top-8 hover:rotate-90 transition-transform">
                  <X size={24} />
               </button>
               <h3 className="text-3xl font-black italic tracking-tighter">New Catalog Item.</h3>
               <p className="text-purple-100 font-bold text-[10px] mt-2 uppercase tracking-[0.2em]">Define your new service or product offering</p>
            </div>
            
            <div className="p-10 space-y-8">
              {/* Type Selection */}
              <div className="grid grid-cols-2 gap-4">
                 <button 
                  type="button"
                  onClick={() => setNewService({...newService, type: 'service'})}
                  className={`p-6 rounded-[2rem] border-4 font-black transition-all flex flex-col items-center ${newService.type === 'service' ? 'border-purple-600 bg-purple-50 text-purple-600' : 'border-gray-50 text-gray-400 hover:border-purple-100'}`}
                 >
                    <Scissors className="mb-2" size={24} />
                    <span className="text-sm">Service</span>
                 </button>
                 <button 
                  type="button"
                  onClick={() => setNewService({...newService, type: 'product'})}
                  className={`p-6 rounded-[2rem] border-4 font-black transition-all flex flex-col items-center ${newService.type === 'product' ? 'border-purple-600 bg-purple-50 text-purple-600' : 'border-gray-50 text-gray-400 hover:border-purple-100'}`}
                 >
                    <Package className="mb-2" size={24} />
                    <span className="text-sm">Product</span>
                 </button>
              </div>

              {/* Form Fields */}
              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 ml-2 uppercase tracking-widest">Item Name</label>
                  <input 
                    placeholder="e.g. Premium Haircut" 
                    className="w-full p-5 bg-gray-50 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-purple-600 transition-all text-gray-900"
                    value={newService.name}
                    onChange={(e) => setNewService({...newService, name: e.target.value})}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 ml-2 uppercase tracking-widest">Price (SAR)</label>
                    <input 
                      placeholder="0.00" 
                      type="number"
                      className="w-full p-5 bg-gray-50 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-purple-600 transition-all"
                      value={newService.price}
                      onChange={(e) => setNewService({...newService, price: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 ml-2 uppercase tracking-widest">Duration (Min)</label>
                    <input 
                      placeholder="30" 
                      type="number"
                      className="w-full p-5 bg-gray-50 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-purple-600 transition-all"
                      value={newService.duration}
                      onChange={(e) => setNewService({...newService, duration: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 ml-2 uppercase tracking-widest">Category</label>
                  <input 
                    placeholder="e.g. Hair, Skin, Retail" 
                    className="w-full p-5 bg-gray-50 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-purple-600 transition-all"
                    value={newService.category}
                    onChange={(e) => setNewService({...newService, category: e.target.value})}
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  disabled={actionLoading}
                  onClick={() => setShowAddModal(false)} 
                  className="flex-1 py-5 bg-gray-50 text-gray-500 rounded-2xl font-black hover:bg-gray-100 transition-colors uppercase text-xs tracking-widest"
                >
                  Cancel
                </button>
                <button 
                  disabled={actionLoading}
                  onClick={handleAddService} 
                  className="flex-1 py-5 bg-purple-600 text-white rounded-2xl font-black shadow-2xl shadow-purple-100 hover:bg-purple-700 transition-all flex items-center justify-center gap-2 uppercase text-xs tracking-widest"
                >
                  {actionLoading ? <Loader2 className="animate-spin" size={20} /> : "Publish Item"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceList;