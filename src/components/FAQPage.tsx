import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ChevronDown, ChevronUp, Search, HelpCircle, MessageCircle, Phone, Mail } from 'lucide-react';

interface FAQ {
  id: number;
  category: string;
  question: string;
  answer: string;
  tags: string[];
}

const FAQPage: React.FC = () => {
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const faqs: FAQ[] = [
    {
      id: 1,
      category: 'general',
      question: 'ما هي منصة Servly؟',
      answer: 'Servly هي منصة أعمال متكاملة تجمع بين إدارة الموارد البشرية، نظام نقاط الولاء، ومنشئ المواقع الإلكترونية في حل واحد سهل الاستخدام.',
      tags: ['منصة', 'خدمات', 'أعمال']
    },
    {
      id: 2,
      category: 'pricing',
      question: 'كم تكلفة استخدام المنصة؟',
      answer: 'نوفر ثلاث خطط: الأساسية (99 ريال/شهر)، الاحترافية (299 ريال/شهر)، والمؤسسية (799 ريال/شهر). كل خطة تتضمن ميزات مختلفة تناسب حجم عملك.',
      tags: ['أسعار', 'خطط', 'اشتراك']
    },
    {
      id: 3,
      category: 'hr',
      question: 'كيف يعمل نظام إدارة الموارد البشرية؟',
      answer: 'نظام HR الخاص بنا يتيح لك إدارة الموظفين، تتبع الحضور والانصراف، إدارة الرواتب، جدولة المواعيد، وإنشاء التقارير التفصيلية.',
      tags: ['موظفين', 'حضور', 'رواتب']
    },
    {
      id: 4,
      category: 'loyalty',
      question: 'ما هو نظام نقاط الولاء؟',
      answer: 'نظام نقاط الولاء يتيح لك إنشاء برنامج مكافآت للعملاء، مع دعم Apple Wallet لسهولة الاستخدام. يمكنك تخصيص النقاط والعروض حسب احتياجاتك.',
      tags: ['ولاء', 'نقاط', 'مكافآت', 'عملاء']
    },
    {
      id: 5,
      category: 'website',
      question: 'هل يمكنني ربط دومين مخصص بموقعي؟',
      answer: 'نعم، يمكنك ربط دومينك المخصص بسهولة. نوفر إرشادات مفصلة لربط الدومين، وفريق الدعم متاح لمساعدتك في العملية.',
      tags: ['دومين', 'موقع', 'ربط']
    },
    {
      id: 6,
      category: 'support',
      question: 'ما هي ساعات الدعم الفني؟',
      answer: 'فريق الدعم متاح من الأحد إلى الخميس من 9 صباحاً حتى 6 مساءً. للخطة المؤسسية، نوفر دعم 24/7.',
      tags: ['دعم', 'ساعات', 'مساعدة']
    },
    {
      id: 7,
      category: 'pricing',
      question: 'هل يمكنني تغيير خطة الاشتراك؟',
      answer: 'نعم، يمكنك ترقية أو تخفيض خطتك في أي وقت. التغييرات تطبق فوراً، وسيتم احتساب الفرق في الفاتورة التالية.',
      tags: ['ترقية', 'تغيير', 'خطة']
    },
    {
      id: 8,
      category: 'general',
      question: 'هل البيانات آمنة؟',
      answer: 'نعم، نستخدم أحدث تقنيات التشفير وأمان البيانات. جميع البيانات محمية ومخزنة في خوادم آمنة مع نسخ احتياطية منتظمة.',
      tags: ['أمان', 'بيانات', 'حماية']
    },
    {
      id: 9,
      category: 'website',
      question: 'كم موقع يمكنني إنشاؤه؟',
      answer: 'يعتمد على خطة الاشتراك: الأساسية (موقع واحد)، الاحترافية (5 مواقع)، المؤسسية (مواقع غير محدودة).',
      tags: ['مواقع', 'عدد', 'حدود']
    },
    {
      id: 10,
      category: 'hr',
      question: 'هل يدعم النظام الإجازات والعطل؟',
      answer: 'نعم، النظام يدعم إدارة الإجازات، العطل الرسمية، طلبات الإجازة، والموافقات. كما يمكن تخصيص أنواع الإجازات المختلفة.',
      tags: ['إجازات', 'عطل', 'طلبات']
    },
    {
      id: 11,
      category: 'loyalty',
      question: 'كيف يعمل تكامل Apple Wallet؟',
      answer: 'يمكن للعملاء إضافة بطاقات الولاء إلى Apple Wallet مباشرة. البطاقات تتحدث تلقائياً بالنقاط والعروض، مع إشعارات ذكية.',
      tags: ['Apple Wallet', 'بطاقات', 'تكامل']
    },
    {
      id: 12,
      category: 'support',
      question: 'هل تقدمون تدريب على استخدام المنصة؟',
      answer: 'نعم، نقدم جلسات تدريب مجانية لجميع العملاء. للخطة المؤسسية، نوفر تدريب شخصي لفريق العمل.',
      tags: ['تدريب', 'تعلم', 'مساعدة']
    }
  ];

  const categories = [
    { id: 'all', name: 'جميع الأسئلة', count: faqs.length },
    { id: 'general', name: 'عام', count: faqs.filter(f => f.category === 'general').length },
    { id: 'pricing', name: 'الأسعار', count: faqs.filter(f => f.category === 'pricing').length },
    { id: 'hr', name: 'الموارد البشرية', count: faqs.filter(f => f.category === 'hr').length },
    { id: 'loyalty', name: 'نقاط الولاء', count: faqs.filter(f => f.category === 'loyalty').length },
    { id: 'website', name: 'المواقع', count: faqs.filter(f => f.category === 'website').length },
    { id: 'support', name: 'الدعم', count: faqs.filter(f => f.category === 'support').length }
  ];

  const filteredFAQs = faqs.filter(faq => {
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    const matchesSearch = searchTerm === '' ||
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

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
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">الأسئلة الشائعة</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-purple-800 rounded-3xl mx-auto mb-6 flex items-center justify-center">
            <HelpCircle className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">كيف يمكننا مساعدتك؟</h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            ابحث في الأسئلة الشائعة أو تصفح الفئات للعثور على الإجابات التي تحتاجها
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="relative">
            <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ابحث في الأسئلة الشائعة..."
              className="w-full pr-12 pl-4 py-4 bg-white/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-2xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-colors text-lg"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Categories Sidebar */}
          <div className="lg:col-span-1">
            <div className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 rounded-3xl border border-white/20 dark:border-gray-700 shadow-lg dark:shadow-none p-6 sticky top-24">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">الفئات</h3>
              <div className="space-y-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl transition-colors text-right ${selectedCategory === category.id
                      ? 'bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-200'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
                  >
                    <span className="font-medium">{category.name}</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${selectedCategory === category.id
                      ? 'bg-purple-200 dark:bg-purple-800 text-purple-800 dark:text-purple-200'
                      : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
                      }`}>
                      {category.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* FAQ Content */}
          <div className="lg:col-span-3">
            {filteredFAQs.length === 0 ? (
              <div className="text-center py-12">
                <HelpCircle className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">لم نجد أي نتائج</h3>
                <p className="text-gray-600 dark:text-gray-300">جرب البحث بكلمات مختلفة أو تصفح الفئات</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredFAQs.map((faq) => (
                  <div
                    key={faq.id}
                    className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 rounded-2xl border border-white/20 dark:border-gray-700 shadow-lg dark:shadow-none overflow-hidden"
                  >
                    <button
                      onClick={() => setExpandedFAQ(expandedFAQ === faq.id ? null : faq.id)}
                      className="w-full p-6 text-right hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors flex items-center justify-between"
                    >
                      <div className="flex-1">
                        <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                          {faq.question}
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {faq.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-200 text-xs rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="mr-4">
                        {expandedFAQ === faq.id ? (
                          <ChevronUp className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                        )}
                      </div>
                    </button>

                    {expandedFAQ === faq.id && (
                      <div className="px-6 pb-6 border-t border-gray-200 dark:border-gray-700 pt-4">
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Contact Section */}
        <div className="mt-16 backdrop-blur-xl bg-gradient-to-r from-purple-600 to-purple-700 rounded-3xl shadow-lg p-8 text-white text-center">
          <h3 className="text-2xl font-bold mb-4">لم تجد إجابة لسؤالك؟</h3>
          <p className="mb-6 opacity-90">فريق الدعم جاهز لمساعدتك في أي وقت</p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="flex items-center justify-center space-x-3 px-6 py-3 bg-white/20 hover:bg-white/30 rounded-xl transition-colors">
              <MessageCircle className="w-5 h-5" />
              <span>تواصل عبر الواتساب</span>
            </button>

            <button className="flex items-center justify-center space-x-3 px-6 py-3 bg-white/20 hover:bg-white/30 rounded-xl transition-colors">
              <Mail className="w-5 h-5" />
              <span>أرسل إيميل</span>
            </button>

            <button className="flex items-center justify-center space-x-3 px-6 py-3 bg-white/20 hover:bg-white/30 rounded-xl transition-colors">
              <Phone className="w-5 h-5" />
              <span>اتصل بنا</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQPage;