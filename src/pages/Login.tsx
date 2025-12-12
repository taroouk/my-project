import { useState } from 'react';
import { useAuth } from '../components/AuthProvider';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await signIn(email, password);

    if (error) {
      setMessage(error);
    } else {
      // بعد تسجيل الدخول، نوجّه حسب الدور
      const storedRole = (await import('../components/AuthProvider')).useAuth().role;
      switch (storedRole) {
        case 'admin':
          navigate('/admin');
          break;
        case 'merchant':
          navigate('/merchant');
          break;
        case 'customer':
          navigate('/customer');
          break;
        default:
          navigate('/');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-900 dark:text-gray-100">Login</h2>

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

        {message && <p className="text-red-500 mb-4">{message}</p>}

        <button type="submit" className="w-full py-2 bg-purple-600 text-white rounded hover:bg-purple-700">
          Login
        </button>
      </form>
    </div>
  );
};

export default Login;
