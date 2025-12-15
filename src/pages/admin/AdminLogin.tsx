// src/pages/auth/AdminLogin.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const AdminLogin = () => {
  const { signIn } = useAuth();
  const navigate = useNavigate();                                                    
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await signIn(email, password, { adminOnly: true });
    if (res.error) return setError(res.error);

    // Check if user is admin
    const { dbUser } = useAuth();
    if (dbUser?.role === 'admin') navigate('/admin');
    else setError('Not authorized as Admin');
  };
  


  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-900 dark:text-gray-100">Admin Login</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-4 p-2 border rounded"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-4 p-2 border rounded"
          required
        />
        <button type="submit" className="w-full py-2 bg-purple-600 text-white rounded hover:bg-purple-700">Login</button>
      </form>
    </div>
  );
};

export default AdminLogin;
