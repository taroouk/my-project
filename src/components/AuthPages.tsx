import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, Eye, EyeOff, Mail, Lock, User, Phone } from 'lucide-react';
import { useAuth } from './AuthProvider';

interface AuthPagesProps {
  onLogin: (isDemo?: boolean) => void;
  isAdmin?: boolean;
}

const AuthPages: React.FC<AuthPagesProps> = ({ onLogin, isAdmin = false }) => {
  const { signIn, signUp } = useAuth();
  const [currentPage, setCurrentPage] = useState<'login' | 'register'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: '',
    company: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      if (isAdmin) {
        if (formData.email === 'admin@servly.com' && formData.password === 'admin123') {
          onLogin(false);
        } else {
          setError('بيانات المدير غير صحيحة');
        }
        return;
      }

      if (currentPage === 'login') {
        const { error } = await signIn(formData.email, formData.password);
        if (error) {
          setError('البريد الإلكتروني أو كلمة المرور غير صحيحة');
        } else {
          onLogin(false);
        }
      } else {
        if (!formData.name || !formData.company) {
          setError('يرجى ملء جميع الحقول المطلوبة');
          return;
        }

        // استدعاء signUp مع باراميترات صحيحة
        const { error } = await signUp(
          formData.email,
          formData.password,
          'customer',
          formData.name,
          formData.phone
        );

        if (error) {
          if (error.includes('already registered')) {
            setError('هذا البريد الإلكتروني مسجل مسبقاً');
          } else if (error.includes('Invalid email')) {
            setError('البريد الإلكتروني غير صحيح');
          } else if (error.includes('Password')) {
            setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
          } else {
            setError(`خطأ في التسجيل: ${error}`);
          }
        } else {
          onLogin(false);
        }
      }
    } catch {
      setError('حدث خطأ غير متوقع');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 flex items-center justify-center p-4 text-gray-900 dark:text-gray-100">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-purple-800 rounded-3xl mx-auto mb-4 flex items-center justify-center">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
            Servly
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-sm mt-2">
            {isAdmin
              ? 'دخول لوحة تحكم الإدارة'
              : currentPage === 'login' ? 'مرحباً بك مرة أخرى' : 'انضم إلينا الآن'
            }
          </p>
        </div>

        <div className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 rounded-3xl border border-white/20 dark:border-gray-700 shadow-xl dark:shadow-none p-8">
          {!isAdmin && (
            <div className="flex mb-8 bg-gray-100 dark:bg-gray-700 rounded-2xl p-1">
              <button
                onClick={() => setCurrentPage('login')}
                className={`flex-1 py-3 px-4 text-sm font-medium rounded-xl transition-all ${currentPage === 'login'
                  ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                  }`}
              >
                تسجيل الدخول
              </button>
              <button
                onClick={() => setCurrentPage('register')}
                className={`flex-1 py-3 px-4 text-sm font-medium rounded-xl transition-all ${currentPage === 'register'
                  ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                  }`}
              >
                إنشاء حساب
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
              </div>
            )}

            {currentPage === 'register' && !isAdmin && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">الاسم الكامل</label>
                  <div className="relative">
                    <User className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full pr-12 pl-4 py-3 bg-white/60 border border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-colors"
                      placeholder="أدخل اسمك الكامل"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">اسم الشركة</label>
                  <div className="relative">
                    <Building2 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      name="company"
                      value={formData.company}
                      onChange={handleInputChange}
                      className="w-full pr-12 pl-4 py-3 bg-white/60 border border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-colors"
                      placeholder="أدخل اسم الشركة"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">رقم الهاتف</label>
                  <div className="relative">
                    <Phone className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full pr-12 pl-4 py-3 bg-white/60 border border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-colors"
                      placeholder="+966501234567"
                      required
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {isAdmin ? 'اسم المستخدم' : 'البريد الإلكتروني'}
              </label>
              <div className="relative">
                {isAdmin ? (
                  <User className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                ) : (
                  <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                )}
                <input
                  type={isAdmin ? "text" : "email"}
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full pr-12 pl-4 py-3 bg-white/60 border border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-colors"
                  placeholder={isAdmin ? "أدخل اسم المستخدم" : "أدخل بريدك الإلكتروني"}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">كلمة المرور</label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full pr-12 pl-12 py-3 bg-white/60 border border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-colors"
                  placeholder="أدخل كلمة المرور"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 px-6 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 transition-colors font-medium shadow-lg hover:shadow-xl transform hover:scale-105 duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isSubmitting ? 'جاري المعالجة...' : (isAdmin ? 'دخول لوحة الإدارة' : currentPage === 'login' ? 'تسجيل الدخول' : 'إنشاء الحساب')}
            </button>
          </form>

          {/* Back Button */}
          <div className="mt-6 text-center">
            <Link to="/landing" className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 text-sm">
              العودة للصفحة الرئيسية
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPages;
