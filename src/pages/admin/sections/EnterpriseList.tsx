import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { Building2, Plus, Trash2, X, Globe, Mail, Briefcase } from 'lucide-react';

interface Enterprise {
  id: string;
  company_name: string;
  contact_email: string;
  status: string;
  contract_value: number;
}

const EnterpriseList = () => {
  const [companies, setCompanies] = useState<Enterprise[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    company_name: '',
    contact_email: '',
    contract_value: ''
  });

  const fetchCompanies = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('enterprise_accounts')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (!error) setCompanies(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchCompanies(); }, []);

  const handleAddCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from('enterprise_accounts').insert([{
      company_name: formData.company_name,
      contact_email: formData.contact_email,
      contract_value: parseFloat(formData.contract_value),
      status: 'active'
    }]);

    if (!error) {
      setIsModalOpen(false);
      setFormData({ company_name: '', contact_email: '', contract_value: '' });
      fetchCompanies();
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to remove this enterprise account?")) {
      const { error } = await supabase.from('enterprise_accounts').delete().eq('id', id);
      if (!error) fetchCompanies();
    }
  };

  return (
    <div className="animate-in fade-in duration-500 text-left">
      {/* Header */}
      <div className="flex justify-between items-center mb-10">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Enterprise Accounts</h2>
          <p className="text-gray-500 mt-1">Manage corporate contracts and high-value partnerships.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-2xl flex items-center gap-2 font-bold transition-all shadow-lg shadow-purple-100"
        >
          <Plus size={20} />
          Add Enterprise
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="text-center p-20 text-gray-400">Loading enterprise data...</div>
      ) : companies.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-[2rem] border-2 border-dashed border-gray-100 dark:border-gray-700 p-20 text-center">
          <Building2 size={64} className="mx-auto text-gray-200 mb-6" />
          <h3 className="text-xl font-bold text-gray-400">No Enterprise Accounts Yet</h3>
          <p className="text-gray-400 text-sm mb-6">Start growing your network by adding your first corporate partner.</p>
          <button onClick={() => setIsModalOpen(true)} className="text-purple-600 font-bold hover:underline">Add First Company</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {companies.map((company) => (
            <div key={company.id} className="bg-white dark:bg-gray-800 p-8 rounded-[2rem] border border-gray-100 dark:border-gray-700 shadow-sm flex justify-between items-start group hover:shadow-md transition-all">
              <div className="flex gap-5">
                <div className="w-16 h-16 bg-purple-50 dark:bg-purple-900/20 rounded-2xl flex items-center justify-center text-purple-600">
                  <Briefcase size={28} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white">{company.company_name}</h3>
                  <div className="flex items-center gap-3 mt-1 text-gray-400 text-sm">
                    <span className="flex items-center gap-1"><Mail size={14}/> {company.contact_email}</span>
                  </div>
                  <div className="mt-4 flex items-center gap-4">
                    <span className="text-2xl font-black text-gray-900 dark:text-white">${company.contract_value?.toLocaleString()}</span>
                    <span className="px-3 py-1 bg-green-100 text-green-700 text-[10px] font-black rounded-full uppercase">{company.status}</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => handleDelete(company.id)}
                className="p-2 text-gray-300 hover:text-red-500 transition-colors"
              >
                <Trash2 size={20} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] w-full max-w-lg p-10 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-bold">New Enterprise Partner</h3>
              <button onClick={() => setIsModalOpen(false)}><X size={24} className="text-gray-400" /></button>
            </div>
            <form onSubmit={handleAddCompany} className="space-y-5">
              <div>
                <label className="text-sm font-bold text-gray-500 mb-2 block ml-1">Company Name</label>
                <input required placeholder="e.g. Amazon Web Services" value={formData.company_name} onChange={e => setFormData({...formData, company_name: e.target.value})} className="w-full p-4 rounded-2xl border border-gray-100 bg-gray-50 dark:bg-gray-800 dark:border-gray-700" />
              </div>
              <div>
                <label className="text-sm font-bold text-gray-500 mb-2 block ml-1">Contact Email</label>
                <input required type="email" placeholder="billing@company.com" value={formData.contact_email} onChange={e => setFormData({...formData, contact_email: e.target.value})} className="w-full p-4 rounded-2xl border border-gray-100 bg-gray-50 dark:bg-gray-800 dark:border-gray-700" />
              </div>
              <div>
                <label className="text-sm font-bold text-gray-500 mb-2 block ml-1">Annual Contract Value ($)</label>
                <input required type="number" placeholder="50000" value={formData.contract_value} onChange={e => setFormData({...formData, contract_value: e.target.value})} className="w-full p-4 rounded-2xl border border-gray-100 bg-gray-50 dark:bg-gray-800 dark:border-gray-700" />
              </div>
              <button type="submit" className="w-full bg-purple-600 text-white py-5 rounded-2xl font-black shadow-xl shadow-purple-100 hover:bg-purple-700 transition-all mt-4">Create Enterprise Account</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnterpriseList;