import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { Search, Trash2, User, Store, Shield, Edit2, X, Check, Loader2 } from 'lucide-react';

interface UserData {
  id: string;
  email: string;
  full_name: string;
  role: string;
  created_at: string;
}

const UsersList = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'merchant' | 'customer'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newRole, setNewRole] = useState<string>('');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      let query = supabase.from('users').select('*').order('created_at', { ascending: false });
      if (filter !== 'all') query = query.eq('role', filter);
      const { data, error } = await query;
      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, [filter]);

  const handleUpdateRole = async (userId: string) => {
    const { error } = await supabase.from('users').update({ role: newRole }).eq('id', userId);
    if (!error) {
      setEditingId(null);
      fetchUsers();
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      const { error } = await supabase.from('users').delete().eq('id', id);
      if (!error) fetchUsers();
    }
  };

  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.full_name && user.full_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="animate-in fade-in duration-500 text-left">
      <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white">User Management</h2>
          <p className="text-gray-500 mt-1">Total {users.length} registered users found.</p>
        </div>
        
        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-4 top-3 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Search by name or email..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-2xl border border-gray-100 bg-white dark:bg-gray-800 dark:border-gray-700 shadow-sm focus:ring-2 focus:ring-purple-500 outline-none transition-all"
            />
          </div>
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value as any)}
            className="px-4 py-3 rounded-2xl border border-gray-100 bg-white dark:bg-gray-800 dark:text-white shadow-sm outline-none focus:ring-2 focus:ring-purple-500 font-bold text-sm"
          >
            <option value="all">All Roles</option>
            <option value="merchant">Merchants Only</option>
            <option value="customer">Customers Only</option>
          </select>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-[2rem] shadow-xl shadow-gray-100/50 dark:shadow-none border border-gray-100 dark:border-gray-700 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50/50 dark:bg-gray-900/50 text-gray-400 text-[11px] uppercase tracking-[0.1em] font-black">
            <tr>
              <th className="p-6">User Information</th>
              <th className="p-6">Account Role</th>
              <th className="p-6">Registration Date</th>
              <th className="p-6 text-center">Manage</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
            {loading ? (
              <tr><td colSpan={4} className="p-20 text-center"><Loader2 className="animate-spin mx-auto text-purple-600" size={32} /></td></tr>
            ) : filteredUsers.map((user) => (
              <tr key={user.id} className="hover:bg-purple-50/30 dark:hover:bg-gray-700/30 transition-colors group">
                <td className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-100 to-indigo-100 text-purple-700 flex items-center justify-center font-black text-lg shadow-sm">
                      {user.email[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white leading-tight">{user.full_name || 'Anonymous User'}</p>
                      <p className="text-sm text-gray-400 mt-0.5">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="p-6">
                  {editingId === user.id ? (
                    <div className="flex items-center gap-2">
                      <select 
                        value={newRole} 
                        onChange={(e) => setNewRole(e.target.value)}
                        className="bg-white dark:bg-gray-700 border border-gray-200 rounded-lg px-2 py-1 text-sm font-bold"
                      >
                        <option value="customer">Customer</option>
                        <option value="merchant">Merchant</option>
                        <option value="admin">Admin</option>
                      </select>
                      <button onClick={() => handleUpdateRole(user.id)} className="text-green-600 p-1 hover:bg-green-50 rounded"><Check size={16}/></button>
                      <button onClick={() => setEditingId(null)} className="text-red-500 p-1 hover:bg-red-50 rounded"><X size={16}/></button>
                    </div>
                  ) : (
                    <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase flex items-center gap-2 w-fit shadow-sm
                      ${user.role === 'admin' ? 'bg-red-50 text-red-600 border border-red-100' : 
                        user.role === 'merchant' ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'bg-green-50 text-green-600 border border-green-100'}`}>
                      {user.role === 'admin' ? <Shield size={12}/> : user.role === 'merchant' ? <Store size={12}/> : <User size={12}/>}
                      {user.role}
                    </span>
                  )}
                </td>
                <td className="p-6 text-sm font-medium text-gray-500 dark:text-gray-400">
                  {new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </td>
                <td className="p-6">
                  <div className="flex justify-center items-center gap-2">
                    <button 
                      onClick={() => { setEditingId(user.id); setNewRole(user.role); }}
                      className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-gray-700 rounded-xl transition-all"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button 
                      onClick={() => handleDeleteUser(user.id)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UsersList;