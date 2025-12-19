import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { Plus, Trash2, CheckCircle2, X, Edit3, Loader2 } from 'lucide-react';

interface Plan {
  id: string;
  name: string;
  price: number;
  description: string;
  features: string[];
}

const PlansList = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', price: '', description: '', features: '' });

  const fetchPlans = async () => {
    setLoading(true);
    const { data } = await supabase.from('plans').select('*').order('price', { ascending: true });
    setPlans(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchPlans(); }, []);

  const handleOpenModal = (plan?: Plan) => {
    if (plan) {
      setEditingId(plan.id);
      setFormData({
        name: plan.name,
        price: plan.price.toString(),
        description: plan.description,
        features: plan.features.join(', ')
      });
    } else {
      setEditingId(null);
      setFormData({ name: '', price: '', description: '', features: '' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const featuresArray = formData.features.split(',').map(f => f.trim()).filter(f => f !== "");
    
    const payload = {
      name: formData.name,
      price: parseFloat(formData.price),
      description: formData.description,
      features: featuresArray
    };

    if (editingId) {
      await supabase.from('plans').update(payload).eq('id', editingId);
    } else {
      await supabase.from('plans').insert([payload]);
    }

    setIsModalOpen(false);
    fetchPlans();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this plan?")) {
      const { error } = await supabase.from('plans').delete().eq('id', id);
      if (!error) fetchPlans();
    }
  };

  return (
    <div className="text-left animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Plans & Pricing</h2>
          <p className="text-gray-500 mt-1">Manage subscription tiers and service fees.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()} 
          className="bg-purple-600 text-white px-6 py-3 rounded-2xl flex items-center gap-2 font-bold shadow-lg shadow-purple-200 hover:bg-purple-700 transition-all"
        >
          <Plus size={20} /> Add New Plan
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center p-20"><Loader2 className="animate-spin text-purple-600" size={40} /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <div key={plan.id} className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-700 shadow-sm relative group hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
              {/* Action Buttons */}
              <div className="absolute top-6 right-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleOpenModal(plan)} className="p-2 bg-gray-50 dark:bg-gray-700 text-blue-600 rounded-xl hover:bg-blue-50"><Edit3 size={16}/></button>
                <button onClick={() => handleDelete(plan.id)} className="p-2 bg-gray-50 dark:bg-gray-700 text-red-500 rounded-xl hover:bg-red-50"><Trash2 size={16}/></button>
              </div>

              <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
              <p className="text-gray-400 text-sm mb-6 leading-relaxed h-12 overflow-hidden">{plan.description}</p>
              
              <div className="mb-8">
                <span className="text-5xl font-black text-gray-900 dark:text-white">${plan.price}</span>
                <span className="text-gray-400 font-bold text-sm"> / Month</span>
              </div>

              <div className="space-y-4 pt-6 border-t border-gray-50 dark:border-gray-700">
                {plan.features?.map((f, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm font-semibold text-gray-600 dark:text-gray-300">
                    <CheckCircle2 size={18} className="text-purple-500" /> {f}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal for Add/Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
          <div className="bg-white dark:bg-gray-900 rounded-[3rem] w-full max-w-lg p-10 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-bold">{editingId ? 'Edit Plan' : 'Create New Plan'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="hover:rotate-90 transition-transform"><X size={28} className="text-gray-400" /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 md:col-span-1">
                  <label className="text-xs font-bold text-gray-400 uppercase ml-2 mb-2 block">Plan Name</label>
                  <input required placeholder="Pro" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-4 rounded-2xl border border-gray-100 bg-gray-50 dark:bg-gray-800 dark:border-gray-700 outline-none focus:ring-2 focus:ring-purple-500" />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="text-xs font-bold text-gray-400 uppercase ml-2 mb-2 block">Price ($)</label>
                  <input required type="number" placeholder="49" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full p-4 rounded-2xl border border-gray-100 bg-gray-50 dark:bg-gray-800 dark:border-gray-700 outline-none focus:ring-2 focus:ring-purple-500" />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-400 uppercase ml-2 mb-2 block">Description</label>
                <textarea placeholder="Perfect for growing businesses..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full p-4 rounded-2xl border border-gray-100 bg-gray-50 dark:bg-gray-800 dark:border-gray-700 h-20 outline-none focus:ring-2 focus:ring-purple-500" />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-400 uppercase ml-2 mb-2 block">Features (comma separated)</label>
                <textarea required placeholder="Unlimited users, 50GB Storage, 24/7 Support" value={formData.features} onChange={e => setFormData({...formData, features: e.target.value})} className="w-full p-4 rounded-2xl border border-gray-100 bg-gray-50 dark:bg-gray-800 dark:border-gray-700 h-28 outline-none focus:ring-2 focus:ring-purple-500" />
              </div>

              <button type="submit" className="w-full bg-purple-600 text-white py-5 rounded-2xl font-black shadow-xl shadow-purple-200 hover:bg-purple-700 transition-all mt-4">
                {editingId ? 'Update Plan' : 'Publish Plan'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlansList;