import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, User, Mail, MessageSquare, CheckCircle, Building2 } from 'lucide-react';

const BookingPage: React.FC = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        date: '',
        time: '',
        company: '',
        topic: '',
        notes: ''
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
                date: '',
                time: '',
                company: '',
                topic: '',
                notes: ''
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
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">احجز موعد</h1>
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                    {/* Booking Form */}
                    <div className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 rounded-3xl border border-white/20 dark:border-gray-700 shadow-lg dark:shadow-none p-8">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">جدولة اجتماع</h2>

                        {isSubmitted ? (
                            <div className="text-center py-12">
                                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle className="w-8 h-8 text-green-600" />
                                </div>
                                <h4 className="text-xl font-bold text-green-600 mb-2">تم حجز الموعد بنجاح!</h4>
                                <p className="text-gray-600 dark:text-gray-300">تم إرسال تفاصيل الاجتماع إلى بريدك الإلكتروني</p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            الاسم الكامل *
                                        </label>
                                        <div className="relative">
                                            <User className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                            <input
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleInputChange}
                                                required
                                                className="w-full pr-10 pl-4 py-3 bg-white/60 dark:bg-gray-700/60 border border-gray-200 dark:border-gray-600 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-colors"
                                                placeholder="أدخل اسمك"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            البريد الإلكتروني *
                                        </label>
                                        <div className="relative">
                                            <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                required
                                                className="w-full pr-10 pl-4 py-3 bg-white/60 dark:bg-gray-700/60 border border-gray-200 dark:border-gray-600 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-colors"
                                                placeholder="example@email.com"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            التاريخ *
                                        </label>
                                        <div className="relative">
                                            <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                            <input
                                                type="date"
                                                name="date"
                                                value={formData.date}
                                                onChange={handleInputChange}
                                                required
                                                className="w-full pr-10 pl-4 py-3 bg-white/60 dark:bg-gray-700/60 border border-gray-200 dark:border-gray-600 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-colors"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            الوقت *
                                        </label>
                                        <div className="relative">
                                            <Clock className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                            <input
                                                type="time"
                                                name="time"
                                                value={formData.time}
                                                onChange={handleInputChange}
                                                required
                                                className="w-full pr-10 pl-4 py-3 bg-white/60 dark:bg-gray-700/60 border border-gray-200 dark:border-gray-600 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-colors"
                                            />
                                        </div>
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
                                            className="w-full pr-10 pl-4 py-3 bg-white/60 dark:bg-gray-700/60 border border-gray-200 dark:border-gray-600 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-colors"
                                            placeholder="اسم شركتك"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        موضوع الاجتماع *
                                    </label>
                                    <div className="relative">
                                        <MessageSquare className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                        <select
                                            name="topic"
                                            value={formData.topic}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full pr-10 pl-4 py-3 bg-white/60 dark:bg-gray-700/60 border border-gray-200 dark:border-gray-600 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-colors appearance-none"
                                        >
                                            <option value="">اختر الموضوع</option>
                                            <option value="demo">عرض توضيحي للمنصة</option>
                                            <option value="sales">استفسار مبيعات</option>
                                            <option value="partnership">شراكة</option>
                                            <option value="support">دعم فني</option>
                                            <option value="other">أخرى</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        ملاحظات إضافية
                                    </label>
                                    <textarea
                                        name="notes"
                                        value={formData.notes}
                                        onChange={handleInputChange}
                                        rows={4}
                                        className="w-full px-4 py-3 bg-white/60 dark:bg-gray-700/60 border border-gray-200 dark:border-gray-600 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-colors resize-none"
                                        placeholder="أي تفاصيل إضافية تود ذكرها..."
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full py-4 px-6 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 transition-colors font-medium shadow-lg hover:shadow-xl transform hover:scale-105 duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                >
                                    {isSubmitting ? (
                                        <div className="flex items-center justify-center space-x-2">
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            <span>جاري الحجز...</span>
                                        </div>
                                    ) : (
                                        'تأكيد الحجز'
                                    )}
                                </button>
                            </form>
                        )}
                    </div>

                    {/* Info Section */}
                    <div className="space-y-8">
                        <div className="backdrop-blur-xl bg-purple-600 rounded-3xl shadow-lg p-8 text-white">
                            <h3 className="text-2xl font-bold mb-4">لماذا تحجز اجتماعاً معنا؟</h3>
                            <ul className="space-y-4">
                                <li className="flex items-start space-x-3 space-x-reverse">
                                    <CheckCircle className="w-6 h-6 flex-shrink-0 text-purple-200" />
                                    <span>استشارة مجانية لتحليل احتياجات عملك</span>
                                </li>
                                <li className="flex items-start space-x-3 space-x-reverse">
                                    <CheckCircle className="w-6 h-6 flex-shrink-0 text-purple-200" />
                                    <span>عرض توضيحي حي لجميع مميزات المنصة</span>
                                </li>
                                <li className="flex items-start space-x-3 space-x-reverse">
                                    <CheckCircle className="w-6 h-6 flex-shrink-0 text-purple-200" />
                                    <span>خطة أسعار مخصصة تناسب ميزانيتك</span>
                                </li>
                                <li className="flex items-start space-x-3 space-x-reverse">
                                    <CheckCircle className="w-6 h-6 flex-shrink-0 text-purple-200" />
                                    <span>إجابة على جميع استفساراتك التقنية</span>
                                </li>
                            </ul>
                        </div>

                        <div className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 rounded-3xl border border-white/20 dark:border-gray-700 shadow-lg dark:shadow-none p-8">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">ساعات العمل المتاحة</h3>
                            <div className="space-y-3 text-gray-600 dark:text-gray-300">
                                <div className="flex justify-between">
                                    <span>الأحد - الخميس</span>
                                    <span className="font-medium">9:00 ص - 6:00 م</span>
                                </div>
                                <div className="flex justify-between text-gray-400">
                                    <span>الجمعة - السبت</span>
                                    <span>مغلق</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookingPage;
