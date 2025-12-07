import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Zap, Crown, ArrowLeft, Truck, ChevronDown, ChevronUp, Phone, Mail, MapPin, MessageCircle, Globe, Facebook, Twitter, Instagram, Linkedin, Youtube, X, Star, Building } from 'lucide-react';
import { useSiteSettings, Plan } from '../contexts/SiteSettingsContext';

interface PaymentMethod {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  icon: React.ReactNode;
  type: 'card' | 'wallet' | 'bank' | 'cash';
  countries: string[];
}

interface FAQ {
  question: string;
  questionEn: string;
  answer: string;
  answerEn: string;
}

interface ContactModalProps {
  onClose: () => void;
  language: 'ar' | 'en';
}

const ContactModal: React.FC<ContactModalProps> = ({ onClose, language }) => {
  const { settings } = useSiteSettings();

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative backdrop-blur-xl bg-white/95 dark:bg-gray-800/95 rounded-3xl border border-white/20 dark:border-gray-700 shadow-xl dark:shadow-none p-8 max-w-lg w-full text-gray-900 dark:text-gray-100">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 dark:from-purple-800 dark:to-pink-800 rounded-3xl mx-auto mb-4 flex items-center justify-center">
              <MessageCircle className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {language === 'ar' ? 'تواصل معنا' : 'Contact Us'}
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              {settings.branding.siteName} - {language === 'ar' ? 'شركة تصميم المواقع المصرية' : 'Egyptian Web Design Company'}
            </p>
          </div>

          <div className="space-y-4 mb-6">
            <div className="flex items-center space-x-4 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors cursor-pointer">
              <Phone className="w-6 h-6 text-purple-600" />
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  {language === 'ar' ? 'الهاتف' : 'Phone'}
                </p>
                <p className="text-purple-600 font-bold">{settings.contact.phone}</p>
              </div>
            </div>

            <div className="flex items-center space-x-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors cursor-pointer">
              <MessageCircle className="w-6 h-6 text-green-600" />
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  {language === 'ar' ? 'واتساب' : 'WhatsApp'}
                </p>
                <p className="text-green-600 font-bold">{settings.contact.whatsapp}</p>
              </div>
            </div>

            <div className="flex items-center space-x-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors cursor-pointer">
              <Mail className="w-6 h-6 text-blue-600" />
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  {language === 'ar' ? 'البريد الإلكتروني' : 'Email'}
                </p>
                <p className="text-blue-600 font-bold">{settings.contact.email}</p>
              </div>
            </div>

            <div className="flex items-center space-x-4 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors cursor-pointer">
              <Globe className="w-6 h-6 text-indigo-600" />
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  {language === 'ar' ? 'الموقع الإلكتروني' : 'Website'}
                </p>
                <p className="text-indigo-600 font-bold">{settings.footer.companyLink}</p>
              </div>
            </div>

            <div className="flex items-center space-x-4 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors cursor-pointer">
              <MapPin className="w-6 h-6 text-orange-600" />
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  {language === 'ar' ? 'العنوان' : 'Address'}
                </p>
                <p className="text-orange-600 font-bold">
                  {language === 'ar' ? settings.contact.address : settings.contact.addressEn}
                </p>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-4 text-center">
              {language === 'ar' ? 'تابعنا على' : 'Follow Us'}
            </h4>
            <div className="flex justify-center space-x-4">
              {settings.social.facebook && (
                <a href={settings.social.facebook} target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white hover:bg-blue-700 transition-colors">
                  <Facebook className="w-6 h-6" />
                </a>
              )}
              {settings.social.twitter && (
                <a href={settings.social.twitter} target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-sky-500 rounded-xl flex items-center justify-center text-white hover:bg-sky-600 transition-colors">
                  <Twitter className="w-6 h-6" />
                </a>
              )}
              {settings.social.instagram && (
                <a href={settings.social.instagram} target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-pink-500 rounded-xl flex items-center justify-center text-white hover:bg-pink-600 transition-colors">
                  <Instagram className="w-6 h-6" />
                </a>
              )}
              {settings.social.linkedin && (
                <a href={settings.social.linkedin} target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-blue-700 rounded-xl flex items-center justify-center text-white hover:bg-blue-800 transition-colors">
                  <Linkedin className="w-6 h-6" />
                </a>
              )}
              {settings.social.youtube && (
                <a href={settings.social.youtube} target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center text-white hover:bg-red-700 transition-colors">
                  <Youtube className="w-6 h-6" />
                </a>
              )}
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full py-3 px-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-colors font-medium"
          >
            {language === 'ar' ? 'إغلاق' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};

interface CustomNotificationProps {
  notification: {
    show: boolean;
    type: 'success' | 'error' | 'info';
    title: string;
    message: string;
  };
  setNotification: React.Dispatch<React.SetStateAction<{
    show: boolean;
    type: 'success' | 'error' | 'info';
    title: string;
    message: string;
  }>>;
}

const CustomNotification: React.FC<CustomNotificationProps> = ({ notification, setNotification }) => {
  if (!notification.show) return null;

  const getNotificationIcon = () => {
    switch (notification.type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'info':
        return 'ℹ️';
      default:
        return 'ℹ️';
    }
  };

  const getNotificationColors = () => {
    switch (notification.type) {
      case 'success':
        return 'from-green-500 to-green-600 border-green-200';
      case 'error':
        return 'from-red-500 to-red-600 border-red-200';
      case 'info':
        return 'from-purple-500 to-purple-600 border-purple-200';
      default:
        return 'from-purple-500 to-purple-600 border-purple-200';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      <div className={`backdrop-blur-xl bg-gradient-to-r ${getNotificationColors()} text-white rounded-2xl border shadow-xl p-4 notification-slide-in`}>
        <div className="flex items-start justify-between text-white">
          <div className="flex items-start space-x-3">
            <span className="text-2xl">{getNotificationIcon()}</span>
            <div className="flex-1">
              <h4 className="font-bold text-lg mb-1">{notification.title}</h4>
              <p className="text-sm opacity-90 whitespace-pre-line">{notification.message}</p>
            </div>
          </div>
          <button
            onClick={() => setNotification(prev => ({ ...prev, show: false }))}
            className="ml-2 text-white/70 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="mt-3 w-full bg-white/20 rounded-full h-1">
          <div className="bg-white h-1 rounded-full notification-progress"></div>
        </div>
      </div>
    </div>
  );
};

interface PaymentModalProps {
  onClose: () => void;
  language: 'ar' | 'en';
  paymentMethods: PaymentMethod[];
  selectedPaymentMethod: string;
  setSelectedPaymentMethod: (id: string) => void;
  handlePaymentConfirmation: () => void;
  setPendingAction: React.Dispatch<React.SetStateAction<{ type: 'renew' | 'upgrade', planId?: string } | null>>;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  onClose,
  language,
  paymentMethods,
  selectedPaymentMethod,
  setSelectedPaymentMethod,
  handlePaymentConfirmation,
  setPendingAction
}) => (
  <div className="fixed inset-0 z-50 overflow-y-auto">
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm" onClick={onClose} />
    <div className="flex min-h-full items-center justify-center p-4">
      <div className="relative backdrop-blur-xl bg-white/95 dark:bg-gray-800/95 rounded-3xl border border-white/20 dark:border-gray-700 shadow-xl dark:shadow-none p-8 max-w-2xl w-full text-gray-900 dark:text-gray-100">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
          {language === 'ar' ? 'اختر وسيلة الدفع' : 'Choose Payment Method'}
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          {paymentMethods.map((method) => (
            <div key={method.id} className="relative group">
              <button
                onClick={() => setSelectedPaymentMethod(method.id)}
                className={`w-full p-4 rounded-xl border-2 transition-all duration-300 ${selectedPaymentMethod === method.id
                  ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 scale-105'
                  : 'border-gray-200 bg-white hover:border-purple-300 hover:scale-102'
                  }`}
              >
                <div className="flex flex-col items-center space-y-2">
                  {method.icon}
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {language === 'ar' ? method.name : method.nameEn}
                  </span>
                </div>
              </button>
            </div>
          ))}
        </div>

        {selectedPaymentMethod && (
          <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
            <p className="text-green-800 dark:text-green-200 font-medium text-center">
              {language === 'ar'
                ? `تم اختيار ${paymentMethods.find(m => m.id === selectedPaymentMethod)?.name}`
                : `${paymentMethods.find(m => m.id === selectedPaymentMethod)?.nameEn} selected`
              }
            </p>
          </div>
        )}

        <div className="flex gap-4 mt-8">
          <button
            onClick={() => {
              onClose();
              setPendingAction(null);
            }}
            className="flex-1 py-3 px-6 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium"
          >
            {language === 'ar' ? 'إلغاء' : 'Cancel'}
          </button>
          <button
            onClick={handlePaymentConfirmation}
            className="flex-1 py-3 px-6 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 transition-colors font-medium"
          >
            {language === 'ar' ? 'تأكيد الدفع' : 'Confirm Payment'}
          </button>
        </div>
      </div>
    </div>
  </div>
);

const SubscriptionPlans: React.FC = () => {
  const { settings } = useSiteSettings();
  const [isYearly, setIsYearly] = useState(false);
  const [language, setLanguage] = useState<'ar' | 'en'>('ar');
  const [currency, setCurrency] = useState<'SAR' | 'EGP' | 'USD'>('SAR');
  const [showAllPlans, setShowAllPlans] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<{ type: 'renew' | 'upgrade', planId?: string } | null>(null);
  const [notification, setNotification] = useState<{
    show: boolean;
    type: 'success' | 'error' | 'info';
    title: string;
    message: string;
  }>({
    show: false,
    type: 'success',
    title: '',
    message: ''
  });
  const [currentSubscription, setCurrentSubscription] = useState({
    planId: 'professional',
    planName: language === 'ar' ? 'المحترف' : 'Professional',
    expiryDate: '2024-03-15',
    status: 'active',
    autoRenewal: true
  });

  const getPlanIcon = (iconName?: string) => {
    switch (iconName) {
      case 'Star': return <Star className="w-6 h-6" />;
      case 'Zap': return <Zap className="w-6 h-6" />;
      case 'Building': return <Building className="w-6 h-6" />;
      default: return <Star className="w-6 h-6" />;
    }
  };

  const paymentMethods: PaymentMethod[] = [
    {
      id: 'card',
      name: 'بطاقة ائتمان',
      nameEn: 'Credit Card',
      description: 'Visa, Mastercard, Mada',
      descriptionEn: 'Visa, Mastercard, Mada',
      icon: <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">💳</div>,
      type: 'card',
      countries: ['all']
    },
    {
      id: 'apple_pay',
      name: 'Apple Pay',
      nameEn: 'Apple Pay',
      description: 'الدفع السريع والآمن',
      descriptionEn: 'Fast and secure payment',
      icon: <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white"></div>,
      type: 'wallet',
      countries: ['all']
    },
    {
      id: 'stc_pay',
      name: 'STC Pay',
      nameEn: 'STC Pay',
      description: 'المحفظة الرقمية',
      descriptionEn: 'Digital Wallet',
      icon: <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600">📱</div>,
      type: 'wallet',
      countries: ['SA']
    },
    {
      id: 'vodafone_cash',
      name: 'فودافون كاش',
      nameEn: 'Vodafone Cash',
      description: 'المحفظة الإلكترونية',
      descriptionEn: 'E-Wallet',
      icon: <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center text-red-600">📱</div>,
      type: 'wallet',
      countries: ['EG']
    },
    {
      id: 'instapay',
      name: 'InstaPay',
      nameEn: 'InstaPay',
      description: 'تحويل بنكي لحظي',
      descriptionEn: 'Instant Bank Transfer',
      icon: <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600">🏦</div>,
      type: 'bank',
      countries: ['EG']
    },
    {
      id: 'fawry',
      name: 'فوري',
      nameEn: 'Fawry',
      description: 'الدفع نقداً',
      descriptionEn: 'Cash Payment',
      icon: <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center text-yellow-600">💰</div>,
      type: 'cash',
      countries: ['EG']
    }
  ];

  const faqs: FAQ[] = [
    {
      question: 'هل يمكنني تغيير خطتي في أي وقت؟',
      questionEn: 'Can I change my plan at any time?',
      answer: 'نعم، يمكنك ترقية أو تخفيض خطتك في أي وقت. سيتم احتساب الفرق في السعر وتطبيقه على فاتورتك القادمة.',
      answerEn: 'Yes, you can upgrade or downgrade your plan at any time. The price difference will be calculated and applied to your next bill.'
    },
    {
      question: 'هل هناك فترة تجريبية مجانية؟',
      questionEn: 'Is there a free trial period?',
      answer: 'نعم، نقدم فترة تجريبية مجانية لمدة 14 يوماً لجميع الخطط. لا يتطلب بطاقة ائتمان.',
      answerEn: 'Yes, we offer a 14-day free trial for all plans. No credit card required.'
    },
    {
      question: 'ما هي طرق الدفع المقبولة؟',
      questionEn: 'What payment methods are accepted?',
      answer: 'نقبل جميع البطاقات الائتمانية الرئيسية (Visa, Mastercard)، Apple Pay، والتحويلات البنكية المحلية.',
      answerEn: 'We accept all major credit cards (Visa, Mastercard), Apple Pay, and local bank transfers.'
    },
    {
      question: 'هل يمكنني إلغاء اشتراكي؟',
      questionEn: 'Can I cancel my subscription?',
      answer: 'نعم، يمكنك إلغاء اشتراكك في أي وقت من لوحة التحكم. ستستمر خدمتك حتى نهاية فترة الفوترة الحالية.',
      answerEn: 'Yes, you can cancel your subscription at any time from the dashboard. Your service will continue until the end of the current billing period.'
    }
  ];

  const formatCurrency = (amount: number) => {
    const symbols = {
      SAR: 'ر.س',
      EGP: 'ج.م',
      USD: '$'
    };

    const rates = {
      SAR: 1,
      EGP: 15.5,
      USD: 0.27
    };

    const convertedAmount = Math.round(amount * rates[currency]);
    return `${symbols[currency]} ${convertedAmount.toLocaleString()}`;
  };

  const handleRenew = () => {
    setPendingAction({ type: 'renew' });
    setShowPaymentModal(true);
  };

  const handleUpgrade = (planId: string) => {
    setPendingAction({ type: 'upgrade', planId });
    setShowPaymentModal(true);
  };

  const handlePaymentConfirmation = () => {
    // Simulate API call
    setTimeout(() => {
      if (pendingAction?.type === 'renew') {
        const newExpiryDate = new Date();
        newExpiryDate.setFullYear(newExpiryDate.getFullYear() + 1);
        setCurrentSubscription(prev => ({
          ...prev,
          expiryDate: newExpiryDate.toISOString().split('T')[0],
          status: 'active'
        }));
        setNotification({
          show: true,
          type: 'success',
          title: language === 'ar' ? 'تم التجديد بنجاح' : 'Renewal Successful',
          message: language === 'ar'
            ? 'تم تجديد اشتراكك بنجاح لمدة عام إضافي'
            : 'Your subscription has been successfully renewed for another year'
        });
      } else if (pendingAction?.type === 'upgrade' && pendingAction.planId) {
        const newPlan = settings.plans.find(p => p.id === pendingAction.planId);
        if (newPlan) {
          setCurrentSubscription(prev => ({
            ...prev,
            planId: newPlan.id,
            planName: language === 'ar' ? newPlan.name : newPlan.nameEn
          }));
          setNotification({
            show: true,
            type: 'success',
            title: language === 'ar' ? 'تمت الترقية بنجاح' : 'Upgrade Successful',
            message: language === 'ar'
              ? `تم ترقية باقتك إلى ${newPlan.name} بنجاح`
              : `Your plan has been successfully upgraded to ${newPlan.nameEn}`
          });
        }
      }
      setShowPaymentModal(false);
      setPendingAction(null);
      setSelectedPaymentMethod('');
    }, 1500);
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 text-gray-900 dark:text-gray-100 font-sans ${language === 'ar' ? 'rtl' : 'ltr'}`}>
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 border-b border-purple-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                to="/"
                className="flex items-center space-x-2 space-x-reverse px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>{language === 'ar' ? 'العودة' : 'Back'}</span>
              </Link>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {language === 'ar' ? 'خطط الاشتراك' : 'Subscription Plans'}
              </h1>
            </div>

            <div className="flex items-center space-x-4 space-x-reverse">
              <div className="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
                <button
                  onClick={() => setLanguage('ar')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${language === 'ar'
                    ? 'bg-white dark:bg-gray-700 text-purple-600 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                    }`}
                >
                  العربية
                </button>
                <button
                  onClick={() => setLanguage('en')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${language === 'en'
                    ? 'bg-white dark:bg-gray-700 text-purple-600 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                    }`}
                >
                  English
                </button>
              </div>

              <div className="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
                <button
                  onClick={() => setCurrency('SAR')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${currency === 'SAR'
                    ? 'bg-white dark:bg-gray-700 text-green-600 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                    }`}
                >
                  SAR
                </button>
                <button
                  onClick={() => setCurrency('EGP')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${currency === 'EGP'
                    ? 'bg-white dark:bg-gray-700 text-green-600 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                    }`}
                >
                  EGP
                </button>
                <button
                  onClick={() => setCurrency('USD')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${currency === 'USD'
                    ? 'bg-white dark:bg-gray-700 text-green-600 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                    }`}
                >
                  USD
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Current Subscription Card */}
          <div className="mb-12 backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 rounded-3xl border border-purple-100 dark:border-purple-900/30 shadow-xl p-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500"></div>
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="flex items-center space-x-6 space-x-reverse">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-3xl flex items-center justify-center">
                  <Crown className="w-10 h-10 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {language === 'ar' ? 'اشتراكك الحالي' : 'Current Subscription'}
                  </h2>
                  <div className="flex items-center space-x-3 space-x-reverse">
                    <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-sm font-medium flex items-center gap-1">
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                      {language === 'ar' ? 'نشط' : 'Active'}
                    </span>
                    <span className="text-gray-600 dark:text-gray-400 font-medium text-lg">
                      {currentSubscription.planName}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col md:flex-row items-center gap-6 w-full md:w-auto">
                <div className="text-center md:text-right bg-gray-50 dark:bg-gray-700/50 px-6 py-3 rounded-2xl">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                    {language === 'ar' ? 'تاريخ التجديد' : 'Renewal Date'}
                  </p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {currentSubscription.expiryDate}
                  </p>
                </div>
                <button
                  onClick={handleRenew}
                  className="w-full md:w-auto px-8 py-4 bg-purple-600 text-white rounded-2xl hover:bg-purple-700 transition-all shadow-lg hover:shadow-purple-500/25 font-bold flex items-center justify-center gap-2"
                >
                  <Zap className="w-5 h-5" />
                  {language === 'ar' ? 'تجديد الاشتراك' : 'Renew Subscription'}
                </button>
              </div>
            </div>
          </div>

          {/* Pricing Toggle */}
          <div className="flex justify-center mb-12">
            <div className="bg-white dark:bg-gray-800 p-1.5 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 inline-flex relative">
              <button
                onClick={() => setIsYearly(false)}
                className={`px-8 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${!isYearly
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                  }`}
              >
                {language === 'ar' ? 'شهري' : 'Monthly'}
              </button>
              <button
                onClick={() => setIsYearly(true)}
                className={`px-8 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${isYearly
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                  }`}
              >
                {language === 'ar' ? 'سنوي' : 'Yearly'}
              </button>
              {isYearly && (
                <div className="absolute -top-4 -left-4 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full animate-bounce shadow-lg">
                  {language === 'ar' ? 'وفر 20%' : 'Save 20%'}
                </div>
              )}
            </div>
          </div>

          {/* Plans Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
            {settings.plans.map((plan) => (
              <div
                key={plan.id}
                className={`relative bg-white dark:bg-gray-800 rounded-[2rem] p-8 transition-all duration-500 hover:-translate-y-2 ${plan.popular
                  ? 'border-2 border-purple-500 shadow-2xl shadow-purple-500/10 scale-105 z-10'
                  : 'border border-gray-100 dark:border-gray-700 shadow-xl hover:shadow-2xl'
                  }`}
              >
                {plan.popular && (
                  <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg flex items-center gap-2">
                    <Crown className="w-4 h-4" />
                    {language === 'ar' ? 'الأكثر طلباً' : 'Most Popular'}
                  </div>
                )}

                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${plan.color} flex items-center justify-center mb-6 text-white shadow-lg`}>
                  {getPlanIcon(plan.iconName)}
                </div>

                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {language === 'ar' ? plan.name : plan.nameEn}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6 h-10">
                  {language === 'ar' ? plan.description : plan.descriptionEn}
                </p>

                <div className="flex items-baseline mb-8">
                  <span className="text-5xl font-bold text-gray-900 dark:text-white tracking-tight">
                    {formatCurrency(isYearly ? plan.yearlyPrice : plan.price)}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400 mr-2 font-medium">
                    /{language === 'ar' ? (isYearly ? 'سنة' : 'شهر') : (isYearly ? 'year' : 'month')}
                  </span>
                </div>

                <button
                  onClick={() => handleUpgrade(plan.id)}
                  className={`w-full py-4 rounded-xl font-bold transition-all duration-300 mb-8 ${plan.popular
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg hover:shadow-purple-500/25'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                >
                  {language === 'ar' ? 'اشترك الآن' : 'Subscribe Now'}
                </button>

                <div className="space-y-4">
                  <p className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                    {language === 'ar' ? 'المميزات:' : 'Features:'}
                  </p>
                  <ul className="space-y-3">
                    {(language === 'ar' ? plan.features : plan.featuresEn).map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-gray-600 dark:text-gray-300">
                        <div className={`mt-1 w-5 h-5 rounded-full bg-gradient-to-br ${plan.color} flex items-center justify-center flex-shrink-0`}>
                          <Check className="w-3 h-3 text-white" />
                        </div>
                        <span className="text-sm leading-relaxed">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          {/* FAQ Section */}
          <div className="max-w-3xl mx-auto mb-20">
            <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
              {language === 'ar' ? 'الأسئلة الشائعة' : 'Frequently Asked Questions'}
            </h2>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden transition-all duration-300 hover:shadow-lg"
                >
                  <button
                    onClick={() => setExpandedFAQ(expandedFAQ === index ? null : index)}
                    className="w-full px-8 py-6 flex items-center justify-between text-right"
                  >
                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                      {language === 'ar' ? faq.question : faq.questionEn}
                    </span>
                    {expandedFAQ === index ? (
                      <ChevronUp className="w-5 h-5 text-purple-600" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </button>
                  <div
                    className={`px-8 transition-all duration-300 ease-in-out ${expandedFAQ === index ? 'max-h-48 pb-8 opacity-100' : 'max-h-0 opacity-0'
                      }`}
                  >
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                      {language === 'ar' ? faq.answer : faq.answerEn}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Contact CTA */}
          <div className="relative rounded-[3rem] overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-900 to-indigo-900"></div>
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&q=80')] opacity-10 bg-cover bg-center"></div>
            <div className="relative z-10 px-8 py-20 text-center">
              <h2 className="text-4xl font-bold text-white mb-6">
                {language === 'ar' ? 'لم تجد ما تبحث عنه؟' : 'Still have questions?'}
              </h2>
              <p className="text-xl text-purple-100 mb-10 max-w-2xl mx-auto">
                {language === 'ar'
                  ? 'فريق المبيعات لدينا جاهز للإجابة على جميع استفساراتك ومساعدتك في اختيار الخطة المناسبة'
                  : 'Our sales team is ready to answer all your questions and help you choose the right plan'}
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  onClick={() => setShowContactModal(true)}
                  className="px-8 py-4 bg-white text-purple-900 rounded-2xl font-bold hover:bg-purple-50 transition-colors flex items-center gap-2 shadow-lg"
                >
                  <Phone className="w-5 h-5" />
                  {language === 'ar' ? 'تواصل معنا' : 'Contact Us'}
                </button>
                <button className="px-8 py-4 bg-purple-800 text-white rounded-2xl font-bold hover:bg-purple-700 transition-colors flex items-center gap-2 border border-purple-700">
                  <MessageCircle className="w-5 h-5" />
                  {language === 'ar' ? 'محادثة مباشرة' : 'Live Chat'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showContactModal && <ContactModal onClose={() => setShowContactModal(false)} language={language} />}
      {showPaymentModal && (
        <PaymentModal
          onClose={() => setShowPaymentModal(false)}
          language={language}
          paymentMethods={paymentMethods}
          selectedPaymentMethod={selectedPaymentMethod}
          setSelectedPaymentMethod={setSelectedPaymentMethod}
          handlePaymentConfirmation={handlePaymentConfirmation}
          setPendingAction={setPendingAction}
        />
      )}
      <CustomNotification notification={notification} setNotification={setNotification} />
    </div>
  );
};

export default SubscriptionPlans;
