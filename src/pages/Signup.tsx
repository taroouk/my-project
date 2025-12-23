import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; // تأكد من استيراد useAuth
import { supabase } from '../lib/supabaseClient';
import { Store, User, ArrowRight, Loader2, Globe } from 'lucide-react';

const COUNTRIES = [
  { code: 'SA', name: 'Saudi Arabia', flag: '🇸🇦', phoneCode: '+966' },
  { code: 'EG', name: 'Egypt', flag: '🇪🇬', phoneCode: '+20' },
  { code: 'AE', name: 'UAE', flag: '🇦🇪', phoneCode: '+971' },
];

const Signup = () => {
  const navigate = useNavigate();
  const { signUp } = useAuth(); // استخدام signUp من الـ Context
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<'merchant' | 'customer'>('customer');
  const [country, setCountry] = useState('SA');
  const [region, setRegion] = useState('');
  const [phone, setPhone] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const selectedCountry = COUNTRIES.find(c => c.code === country);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) {
      setError("Please agree to terms.");
      return;
    }

    setLoading(true);
    setError('');

    try {
      const fullPhone = `${selectedCountry?.phoneCode}${phone}`;
      
      // 1. تنفيذ عملية التسجيل عبر الـ Context
      const result = await signUp(email, password, role, {
        full_name: fullName,
        phone: fullPhone,
        country: country,
        region: region
      });

      if (result?.error) {
        setError(result.error);
        setLoading(false);
        return;
      }

      // 2. التوجيه (هنا مربط الفرس)
      // نستخدم setTimeout بسيط لضمان أن Supabase Auth استوعب الجلسة
      setTimeout(() => {
        if (role === 'merchant') {
          navigate('/merchant/setup');
        } else {
          navigate('/dashboard/customer');
        }
      }, 500);

    } catch (err: any) {
      setError("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FD] flex items-center justify-center p-6">
      <div className="max-w-xl w-full bg-white rounded-[2.5rem] shadow-xl p-8 md:p-10 border border-gray-100">
        
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center text-white text-2xl font-black mx-auto mb-4">S</div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tighter">CREATE ACCOUNT</h2>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-xs font-bold border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-4">
          {/* اختيار الدور */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <button
              type="button"
              onClick={() => setRole('customer')}
              className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${role === 'customer' ? 'border-purple-600 bg-purple-50 text-purple-600' : 'border-gray-50 bg-gray-50 text-gray-400'}`}
            >
              <User size={20} />
              <span className="font-black text-[10px] uppercase">Customer</span>
            </button>
            <button
              type="button"
              onClick={() => setRole('merchant')}
              className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${role === 'merchant' ? 'border-purple-600 bg-purple-50 text-purple-600' : 'border-gray-50 bg-gray-50 text-gray-400'}`}
            >
              <Store size={20} />
              <span className="font-black text-[10px] uppercase">Merchant</span>
            </button>
          </div>

          {/* المدخلات */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input required placeholder="Full Name" value={fullName} onChange={e => setFullName(e.target.value)} className="w-full px-5 py-3 bg-gray-50 rounded-xl border-2 border-transparent focus:border-purple-600 outline-none font-bold" />
            <input required type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-5 py-3 bg-gray-50 rounded-xl border-2 border-transparent focus:border-purple-600 outline-none font-bold" />
            <input required type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-5 py-3 bg-gray-50 rounded-xl border-2 border-transparent focus:border-purple-600 outline-none font-bold" />
            <input required placeholder="Region" value={region} onChange={e => setRegion(e.target.value)} className="w-full px-5 py-3 bg-gray-50 rounded-xl border-2 border-transparent focus:border-purple-600 outline-none font-bold" />
            
            <div className="md:col-span-2 flex gap-2">
               <select value={country} onChange={e => setCountry(e.target.value)} className="bg-gray-50 px-3 rounded-xl font-bold outline-none border-2 border-transparent focus:border-purple-600">
                  {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.flag}</option>)}
               </select>
               <input required placeholder="Phone Number" value={phone} onChange={e => setPhone(e.target.value)} className="flex-1 px-5 py-3 bg-gray-50 rounded-xl border-2 border-transparent focus:border-purple-600 outline-none font-bold" />
            </div>
          </div>

          <div className="flex items-center gap-2 py-2">
            <input type="checkbox" id="agreed" checked={agreed} onChange={e => setAgreed(e.target.checked)} className="w-4 h-4 accent-purple-600" />
            <label htmlFor="agreed" className="text-[10px] font-bold text-gray-500 uppercase tracking-tight">I agree to terms and conditions</label>
          </div>

          <button
            type="submit"
            disabled={loading || !agreed}
            className="w-full bg-purple-600 text-white py-4 rounded-xl font-black text-sm tracking-widest hover:bg-purple-700 transition-all flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" /> : <>CREATE ACCOUNT <ArrowRight size={18} /></>}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Signup;