import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Phone, Mail, MapPin, Clock, MessageCircle, Send, CheckCircle, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';
import { useSiteSettings } from '../contexts/SiteSettingsContext';

const ContactPage: React.FC = () => {
  const { settings } = useSiteSettings();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    subject: '',
    message: '',
    service: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));

    setIsSubmitting(false);
    setIsSubmitted(true);

    // Reset form after 3 seconds
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({
        name: '',
        email: '',
        phone: '',
        company: '',
        subject: '',
        message: '',
        service: ''
      });
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 text-gray-900 dark:text-gray-100">
      {/* Header */}
      <header className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border-b border-purple-100 dark:border-gray-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                to="/"
                className="flex items-center space-x-2 space-x-reverse px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>العودة</span>
              </Link>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">تواصل معنا</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">نحن هنا لمساعدتك</h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            تواصل معنا في أي وقت وسنكون سعداء لمساعدتك في تطوير أعمالك
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 rounded-3xl border border-white/20 dark:border-gray-700 shadow-lg dark:shadow-none p-8">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">أرسل لنا رسالة</h3>

            {isSubmitted ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h4 className="text-xl font-bold text-green-600 mb-2">تم إرسال الرسالة بنجاح!</h4>
                <p className="text-gray-600 dark:text-gray-300">سنتواصل معك خلال 24 ساعة</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      الاسم الكامل *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-white/60 dark:bg-gray-700/60 border border-gray-200 dark:border-gray-600 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-colors"
                      placeholder="أدخل اسمك الكامل"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      البريد الإلكتروني *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-white/60 dark:bg-gray-700/60 border border-gray-200 dark:border-gray-600 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-colors"
                      placeholder="example@email.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      رقم الهاتف
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-white/60 dark:bg-gray-700/60 border border-gray-200 dark:border-gray-600 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-colors"
                      placeholder="+20 100 123 4567"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      اسم الشركة
                    </label>
                    <input
                      type="text"
                      name="company"
                      value={formData.company}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-white/60 dark:bg-gray-700/60 border border-gray-200 dark:border-gray-600 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-colors"
                      placeholder="اسم شركتك"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    الخدمة المطلوبة
                  </label>
                  <select
                    name="service"
                    value={formData.service}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white/60 dark:bg-gray-700/60 border border-gray-200 dark:border-gray-600 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-colors"
                  >
                    <option value="">اختر الخدمة</option>
                    <option value="hr">إدارة الموارد البشرية</option>
                    <option value="loyalty">نظام نقاط الولاء</option>
                    <option value="website">منشئ المواقع</option>
                    <option value="all">جميع الخدمات</option>
                    <option value="consultation">استشارة</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    موضوع الرسالة *
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-white/60 dark:bg-gray-700/60 border border-gray-200 dark:border-gray-600 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-colors"
                    placeholder="موضوع رسالتك"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    الرسالة *
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={5}
                    className="w-full px-4 py-3 bg-white/60 dark:bg-gray-700/60 border border-gray-200 dark:border-gray-600 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-colors resize-none"
                    placeholder="اكتب رسالتك هنا..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center space-x-2 px-6 py-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>جاري الإرسال...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      <span>إرسال الرسالة</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Contact Information */}
          <div className="space-y-8">
            {/* Contact Details */}
            <div className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 rounded-3xl border border-white/20 dark:border-gray-700 shadow-lg dark:shadow-none p-8">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">معلومات التواصل</h3>

              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Phone className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white mb-1">الهاتف</h4>
                    <p className="text-gray-600 dark:text-gray-300">{settings.contact.phone}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white mb-1">البريد الإلكتروني</h4>
                    <p className="text-gray-600 dark:text-gray-300">{settings.contact.email}</p>
                    <p className="text-gray-600 dark:text-gray-300">{settings.contact.supportEmail}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white mb-1">العنوان</h4>
                    <p className="text-gray-600 dark:text-gray-300">{settings.contact.address}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Clock className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white mb-1">ساعات العمل</h4>
                    <p className="text-gray-600 dark:text-gray-300">الأحد - الخميس: 9:00 ص - 6:00 م</p>
                    <p className="text-gray-600 dark:text-gray-300">الجمعة - السبت: مغلق</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Social Media */}
            <div className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 rounded-3xl border border-white/20 dark:border-gray-700 shadow-lg dark:shadow-none p-8">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">تابعنا على</h3>

              <div className="grid grid-cols-2 gap-4">
                {settings.social.facebook && (
                  <a href={settings.social.facebook} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-3 p-4 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-xl transition-colors">
                    <Facebook className="w-6 h-6 text-blue-600" />
                    <span className="font-medium text-gray-900 dark:text-white">Facebook</span>
                  </a>
                )}

                {settings.social.twitter && (
                  <a href={settings.social.twitter} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-3 p-4 bg-sky-50 dark:bg-sky-900/20 hover:bg-sky-100 dark:hover:bg-sky-900/30 rounded-xl transition-colors">
                    <Twitter className="w-6 h-6 text-sky-600" />
                    <span className="font-medium text-gray-900 dark:text-white">Twitter</span>
                  </a>
                )}

                {settings.social.instagram && (
                  <a href={settings.social.instagram} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-3 p-4 bg-pink-50 dark:bg-pink-900/20 hover:bg-pink-100 dark:hover:bg-pink-900/30 rounded-xl transition-colors">
                    <Instagram className="w-6 h-6 text-pink-600" />
                    <span className="font-medium text-gray-900 dark:text-white">Instagram</span>
                  </a>
                )}

                {settings.social.linkedin && (
                  <a href={settings.social.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-3 p-4 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-xl transition-colors">
                    <Linkedin className="w-6 h-6 text-blue-700" />
                    <span className="font-medium text-gray-900 dark:text-white">LinkedIn</span>
                  </a>
                )}
              </div>
            </div>

            {/* Quick Contact */}
            <div className="backdrop-blur-xl bg-gradient-to-r from-purple-600 to-purple-700 rounded-3xl shadow-lg p-8 text-white">
              <h3 className="text-2xl font-bold mb-4">تحتاج مساعدة فورية؟</h3>
              <p className="mb-6 opacity-90">تواصل معنا عبر الواتساب للحصول على رد سريع</p>
              <a href={`https://wa.me/${settings.contact.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-3 px-6 py-3 bg-white/20 hover:bg-white/30 rounded-xl transition-colors inline-flex">
                <MessageCircle className="w-6 h-6" />
                <span className="font-medium">واتساب: {settings.contact.whatsapp}</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;