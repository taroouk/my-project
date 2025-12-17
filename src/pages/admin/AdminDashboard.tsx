import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../contexts/AuthContext';
import {
  Building2,
  Users,
  Zap,
  Award,
  Gift,
  Globe,
  LogOut,
} from 'lucide-react';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const [stats, setStats] = useState({
    totalUsers: 0,
    customers: 0,
    merchants: 0,
  });

  const [loading, setLoading] = useState(true);

  const handleLogout = async () => {
    await signOut();
    navigate('/login/admin');
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        console.log("📊 Fetching Dashboard Stats...");

        // تنفيذ الاستعلامات مع معالجة الخطأ لكل واحد منفصلاً
        const [allRes, custRes, mercRes] = await Promise.all([
          supabase.from('users').select('*', { count: 'exact', head: true }),
          supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'customer'),
          supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'merchant'),
        ]);

        setStats({
          totalUsers: allRes.count ?? 0,
          customers: custRes.count ?? 0,
          merchants: mercRes.count ?? 0,
        });
      } catch (error) {
        console.error("❌ Error loading stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="flex h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 text-gray-900 dark:text-gray-100">

      {/* ================= Sidebar ================= */}
      <aside className="w-64 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-r border-purple-100 dark:border-gray-700 flex flex-col">
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-purple-800 rounded-2xl flex items-center justify-center">
            <Building2 className="text-white" />
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
            Admin
          </h1>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          <NavItem icon={<Users />} label="Users Management" />
          <NavItem icon={<Zap />} label="Plans" />
          <NavItem icon={<Award />} label="Enterprise" />
          <NavItem icon={<Gift />} label="Loyalty" />
          <NavItem icon={<Globe />} label="Website Builder" />
        </nav>

        <button
          onClick={handleLogout}
          className="m-4 p-3 flex items-center gap-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-700/30 transition"
        >
          <LogOut size={18} />
          Logout
        </button>
      </aside>

      {/* ================= Main ================= */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-3xl font-bold">Admin Dashboard</h2>
          <span className="text-gray-500">System Overview</span>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <Stat title="Total Users" value={stats.totalUsers} loading={loading} />
          <Stat title="Customers" value={stats.customers} loading={loading} />
          <Stat title="Merchants" value={stats.merchants} loading={loading} />
        </div>

        {/* Placeholders */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Placeholder title="Users Management" />
          <Placeholder title="Plans Management" />
        </div>
      </main>
    </div>
  );
};

// مكونات فرعية (Sub-components)
const NavItem = ({ icon, label }: { icon: React.ReactNode; label: string }) => (
  <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-purple-100 dark:hover:bg-gray-700 transition cursor-pointer">
    <span className="text-purple-600">{icon}</span>
    <span className="font-medium">{label}</span>
  </div>
);

const Stat = ({ title, value, loading }: { title: string; value: number; loading: boolean }) => (
  <div className="p-6 bg-white/70 dark:bg-gray-800/70 rounded-3xl shadow-lg backdrop-blur-xl">
    <p className="text-gray-500 mb-2">{title}</p>
    <p className="text-3xl font-bold">{loading ? '...' : value}</p>
  </div>
);

const Placeholder = ({ title }: { title: string }) => (
  <div className="h-60 bg-white/70 dark:bg-gray-800/70 rounded-3xl shadow-lg backdrop-blur-xl flex items-center justify-center text-gray-400">
    {title} (Coming Soon)
  </div>
);

export default AdminDashboard;