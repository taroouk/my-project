import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ShieldCheck, Lock, Mail, AlertCircle } from 'lucide-react'; // أيقونات لتحسين الشكل

const AdminLogin = () => {
  const navigate = useNavigate();
  const { signIn } = useAuth(); // ✅ الصح: النادي الـ Hook هنا في الأول
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // بنبعت adminOnly: true فالـ Context هو اللي بيقوم بمهمة التحقق
      const result = await signIn(email, password, { adminOnly: true });

      if (result.error) {
        // لو فيه خطأ (سواء الباسورد غلط أو هو مش أدمن) هيظهر هنا
        setError(result.error);
      } else {
        // لو مفيش خطأ، يبقى هو أدمن وأكيد دخل
        navigate('/admin'); 
      }
    } catch (err) {
      setError('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 w-full max-w-md p-8 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700">
        
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="text-white w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Portal</h2>
          <p className="text-gray-500 text-sm">Secure Access Only</p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-100 border border-red-200 text-red-700 rounded-lg flex items-center gap-2 text-sm">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 p-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-purple-500 dark:text-white"
                placeholder="admin@servly.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 p-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-purple-500 dark:text-white"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition disabled:opacity-50"
          >
            {loading ? 'Verifying...' : 'Login to Dashboard'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;