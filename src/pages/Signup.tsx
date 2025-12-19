import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Store, User, ArrowRight, Loader2 } from 'lucide-react';

const Signup = () => {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<'merchant' | 'customer'>('customer');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 1. نقوم بإرسال البيانات الأساسية فقط لمنع أخطاء الجداول
      // الـ Metadata سيتم تخزينها في Auth، والـ Context سيتولى إدخالها في جدول users
      const result = await signUp(email, password, role, {
        full_name: fullName
      });

      if (result?.error) {
        // إذا كان الخطأ متعلق بقاعدة البيانات، سنقوم بتوضيحه
        setError(result.error);
        setLoading(false);
        return;
      }

      // 2. التوجيه بناءً على الدور
      // ملاحظة: التاجر يذهب دائماً لصفحة الإعداد أول مرة
      if (role === 'merchant') {
        navigate('/merchant/setup');
      } else {
        navigate('/dashboard/customer');
      }
    } catch (err: any) {
      console.error("Signup Crash:", err);
      setError("حدث خطأ أثناء الاتصال بالخادم. تأكد من تحديث قاعدة البيانات.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FD] flex items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-xl shadow-purple-100/50 p-10 border border-gray-100">
        
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center text-white text-2xl font-black mx-auto mb-4 shadow-lg shadow-purple-200">S</div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tighter uppercase">انضم إلينا</h2>
          <p className="text-gray-400 font-bold mt-2 text-sm uppercase tracking-widest">إنشاء حساب جديد</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-2xl mb-6 text-xs font-black border border-red-100 flex items-start gap-2">
            <span className="shrink-0">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-5">
          {/* اختيار نوع الحساب */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <button
              type="button"
              onClick={() => setRole('customer')}
              className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${
                role === 'customer' 
                ? 'border-purple-600 bg-purple-50 text-purple-600' 
                : 'border-gray-50 bg-gray-50 text-gray-400 hover:border-gray-200'
              }`}
            >
              <User size={24} />
              <span className="font-black text-[10px] uppercase tracking-widest">عميل</span>
            </button>
            <button
              type="button"
              onClick={() => setRole('merchant')}
              className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${
                role === 'merchant' 
                ? 'border-purple-600 bg-purple-50 text-purple-600' 
                : 'border-gray-50 bg-gray-50 text-gray-400 hover:border-gray-200'
              }`}
            >
              <Store size={24} />
              <span className="font-black text-[10px] uppercase tracking-widest">تاجر</span>
            </button>
          </div>

          <div className="space-y-2">
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">الاسم الكامل</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-purple-600 focus:bg-white outline-none font-bold transition-all text-gray-700"
              placeholder="مثال: أحمد محمد"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">البريد الإلكتروني</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-purple-600 focus:bg-white outline-none font-bold transition-all text-gray-700 text-left"
              placeholder="name@example.com"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">كلمة المرور</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-purple-600 focus:bg-white outline-none font-bold transition-all text-gray-700 text-left"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gray-950 text-white py-5 rounded-2xl font-black text-sm tracking-widest shadow-xl hover:bg-purple-600 transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>إنشاء الحساب <ArrowRight size={18} /></>
            )}
          </button>
        </form>

        <p className="text-center mt-10 text-gray-400 font-bold text-xs uppercase">
          لديك حساب بالفعل؟{' '}
          <Link to="/login/customer" className="text-purple-600 hover:underline">تسجيل الدخول</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;