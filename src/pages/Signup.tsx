import { useState } from 'react';
import { supabase, User } from '../lib/supabaseClient';

const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [phone, setPhone] = useState('');
  const [subscriptionPlan, setSubscriptionPlan] = useState<'basic' | 'professional' | 'enterprise'>('basic');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSignup = async () => {
    setLoading(true);
    setError(null);

    // Supabase Auth signup
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          company_name: companyName,
          phone,
          subscription_plan: subscriptionPlan
        }
      }
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    setSuccess(true);
  };

  if (success) return <div>✅ Signup successful! Please check your email to confirm.</div>;

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded-lg shadow">
      <h2 className="text-2xl mb-4">Sign Up</h2>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      <input type="text" placeholder="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full p-2 mb-2 border rounded" />
      <input type="text" placeholder="Company Name" value={companyName} onChange={(e) => setCompanyName(e.target.value)} className="w-full p-2 mb-2 border rounded" />
      <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-2 mb-2 border rounded" />
      <input type="text" placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full p-2 mb-2 border rounded" />
      <select value={subscriptionPlan} onChange={(e) => setSubscriptionPlan(e.target.value as any)} className="w-full p-2 mb-2 border rounded">
        <option value="basic">Basic</option>
        <option value="professional">Professional</option>
        <option value="enterprise">Enterprise</option>
      </select>
      <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-2 mb-4 border rounded" />
      <button onClick={handleSignup} disabled={loading} className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
        {loading ? 'Signing up...' : 'Sign Up'}
      </button>
    </div>
  );
};

export default Signup;
