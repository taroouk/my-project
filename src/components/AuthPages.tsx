import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, Eye, EyeOff, Mail, Lock, User, Phone } from 'lucide-react';
import { useAuthContext } from './AuthProvider';

interface AuthPagesProps {
  onLogin: (isDemo?: boolean) => void;
  isAdmin?: boolean;
}

const AuthPages: React.FC<AuthPagesProps> = ({ onLogin, isAdmin = false }) => {
  const { signIn, signUp, loading } = useAuthContext();
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
    setError(null); // Clear error when user types
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
        // For admin, use simple check (you can enhance this later)
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
        // Registration
        if (!formData.name || !formData.company) {
          setError('يرجى ملء جميع الحقول المطلوبة');
          return;
        }

        const { error } = await signUp(formData.email, formData.password, {
          full_name: formData.name,
          company_name: formData.company,
          phone: formData.phone
        });

        if (error) {
          console.error('Registration error:', error);
          if (error.message.includes('already registered')) {
            setError('هذا البريد الإلكتروني مسجل مسبقاً');
          } else if (error.message.includes('Invalid email')) {
            setError('البريد الإلكتروني غير صحيح');
          } else if (error.message.includes('Password')) {
            setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
          } else {
            setError(`خطأ في التسجيل: ${error.message}`);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-purple-800 rounded-3xl mx-auto mb-4 flex items-center justify-center animate-pulse">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <p className="text-gray-600 dark:text-gray-300">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 flex items-center justify-center p-4 text-gray-900 dark:text-gray-100">
      <div className="w-full max-w-md">
        {/* Logo */}
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

        {/* Auth Card */}
        <div className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 rounded-3xl border border-white/20 dark:border-gray-700 shadow-xl dark:shadow-none p-8">
          {/* Tabs */}
          {!isAdmin && <div className="flex mb-8 bg-gray-100 dark:bg-gray-700 rounded-2xl p-1">
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
          </div>}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
              </div>
            )}

            {currentPage === 'register' && !isAdmin && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    الاسم الكامل
                  </label>
                  <div className="relative">
                    <User className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      name="name" // Changed from "username" to "name" for consistency
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full pr-12 pl-4 py-3 bg-white/60 border border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-colors"
                      placeholder="أدخل اسمك الكامل"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    اسم الشركة
                  </label>
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
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    رقم الهاتف
                  </label>
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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                كلمة المرور
              </label>
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

            {currentPage === 'login' && !isAdmin && (
              <div className="flex items-center justify-between">
                <label className="flex items-center text-gray-600 dark:text-gray-300">
                  <input type="checkbox" className="rounded border-gray-300 text-purple-600 focus:ring-purple-500" />
                  <span className="mr-2 text-sm">تذكرني</span>
                </label>
                <button type="button" className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 transition-colors">
                  نسيت كلمة المرور؟
                </button>
              </div>
            )}

            {currentPage === 'register' && !isAdmin && (
              <div className="flex items-start">
                <input type="checkbox" className="rounded border-gray-300 dark:border-gray-600 text-purple-600 focus:ring-purple-500 mt-1" />
                <span className="mr-2 text-sm text-gray-600 dark:text-gray-300">
                  أوافق على
                  <button type="button" className="text-purple-600 hover:text-purple-800 mx-1">شروط الخدمة</button>
                  و
                  <button type="button" className="text-purple-600 hover:text-purple-800 mx-1">سياسة الخصوصية</button>
                </span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 px-6 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 transition-colors font-medium shadow-lg hover:shadow-xl transform hover:scale-105 duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>جاري المعالجة...</span>
                </div>
              ) : (
                isAdmin ? 'دخول لوحة الإدارة' : currentPage === 'login' ? 'تسجيل الدخول' : 'إنشاء الحساب'
              )}
            </button>
          </form>

          {/* Social Login */}
          {!isAdmin && <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center text-gray-500 dark:text-gray-400">
                <div className="w-full border-t border-gray-200 dark:border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">أو</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Google</span>
              </button>
              <button className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Microsoft</span>
              </button>
            </div>
          </div>}

          {/* Demo Login */}
          {!isAdmin && <div className="mt-8 p-4 bg-blue-50 rounded-xl border border-blue-200">
            <h4 className="font-medium text-blue-900 mb-2">تجربة المنصة</h4>
            <p className="text-sm text-blue-700 mb-3">
              يمكنك تجربة المنصة مباشرة بالنقر على "دخول تجريبي"
            </p>
            <button
              onClick={() => onLogin(true)}
              className="w-full py-2 px-4 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition-colors font-medium"
            >
              دخول تجريبي
            </button>
          </div>}

          {/* Back Button */}
          <div className="mt-6 text-center">
            <Link to="/landing" className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 text-sm">
              {isAdmin ? 'العودة للصفحة الرئيسية' : 'العودة للصفحة الرئيسية'}
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p className="dark:text-gray-400">&copy; 2024 Servly. جميع الحقوق محفوظة.</p>
        </div>
      </div>
    </div>
  );
};

export default AuthPages;