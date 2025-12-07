import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Globe, Layout, Settings, Eye, Save, ArrowLeft, Plus, Trash2, Monitor, Smartphone, Edit, Link } from 'lucide-react';


interface Website {
  id: string;
  name: string;
  domain: string;
  customDomain?: string;
  status: 'active' | 'draft' | 'maintenance';
  template: string;
  lastModified: string;
  content: {
    title: string;
    description: string;
    colors: {
      primary: string;
      secondary: string;
      accent: string;
    };
    sections: any[];
  };
}

interface Template {
  id: string;
  name: string;
  category: string;
  image: string;
  description: string;
  features: string[];
}

interface DomainModalProps {
  onClose: () => void;
}

const DomainModal: React.FC<DomainModalProps> = ({ onClose }) => (
  <div className="fixed inset-0 z-50 overflow-y-auto">
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm" onClick={onClose} />
    <div className="flex min-h-full items-center justify-center p-4">
      <div className="relative backdrop-blur-xl bg-white/95 dark:bg-gray-800/95 rounded-3xl border border-white/20 dark:border-gray-700 shadow-xl dark:shadow-none p-8 max-w-2xl w-full text-gray-900 dark:text-gray-100">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">ربط دومين مخصص</h3>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">الدومين المخصص</label>
            <input
              type="text"
              placeholder="example.com"
              className="w-full px-4 py-3 rounded-xl bg-white/60 dark:bg-gray-700/60 border border-gray-200 dark:border-gray-600 focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
            />
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
            <h4 className="font-bold text-blue-900 mb-2">خطوات ربط الدومين:</h4>
            <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800">
              <li>اذهب إلى لوحة تحكم الدومين الخاص بك</li>
              <li>أضف سجل CNAME يشير إلى: servly.app</li>
              <li>انتظر حتى 24 ساعة لانتشار التغييرات</li>
              <li>اضغط على "تحقق من الربط" أدناه</li>
            </ol>
          </div>

          <div className="flex justify-end space-x-4 space-x-reverse">
            <button
              onClick={onClose}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
            >
              إلغاء
            </button>
            <button
              onClick={() => {
                alert('تم ربط الدومين بنجاح!');
                onClose();
              }}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 transition-colors"
            >
              ربط الدومين
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
);

interface TemplateModalProps {
  onClose: () => void;
  templates: Template[];
  selectedTemplate: Template | null;
  setSelectedTemplate: (template: Template | null) => void;
  newWebsite: { name: string; template: string; customDomain: string };
  setNewWebsite: React.Dispatch<React.SetStateAction<{ name: string; template: string; customDomain: string }>>;
  handleCreateWebsite: (template: Template) => void;
}

const TemplateModal: React.FC<TemplateModalProps> = ({
  onClose,
  templates,
  selectedTemplate,
  setSelectedTemplate,
  newWebsite,
  setNewWebsite,
  handleCreateWebsite
}) => (
  <div className="fixed inset-0 z-50 overflow-y-auto">
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm" onClick={onClose} />
    <div className="flex min-h-full items-center justify-center p-4">
      <div className="relative backdrop-blur-xl bg-white/95 dark:bg-gray-800/95 rounded-3xl border border-white/20 dark:border-gray-700 shadow-xl dark:shadow-none p-8 max-w-6xl w-full text-gray-900 dark:text-gray-100">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">إنشاء موقع جديد</h3>

        <div className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">اسم الموقع</label>
              <input
                type="text"
                value={newWebsite.name}
                onChange={(e) => setNewWebsite(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl bg-white/60 dark:bg-gray-700/60 border border-gray-200 dark:border-gray-600 focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                placeholder="اسم الموقع"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">الدومين المخصص (اختياري)</label>
              <input
                type="text"
                value={newWebsite.customDomain}
                onChange={(e) => setNewWebsite(prev => ({ ...prev, customDomain: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl bg-white/60 dark:bg-gray-700/60 border border-gray-200 dark:border-gray-600 focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                placeholder="example.com"
              />
            </div>
          </div>
        </div>

        <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4">اختر قالباً</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          {templates.map((template) => (
            <div
              key={template.id}
              className={`backdrop-blur-xl bg-white/60 rounded-3xl border shadow-lg overflow-hidden cursor-pointer transition-all duration-300 ${selectedTemplate?.id === template.id
                ? 'border-purple-500 ring-2 ring-purple-200 transform scale-105'
                : 'border-white/20 hover:shadow-xl'
                }`}
              onClick={() => setSelectedTemplate(template)}
            >
              <img
                src={template.image}
                alt={template.name}
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <div className="flex items-center justify-between mb-2 text-gray-900 dark:text-white">
                  <h4 className="font-bold">{template.name}</h4>
                  <span className="px-3 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                    {template.category}
                  </span>
                </div>
                <p className="text-gray-600 text-sm mb-4">{template.description}</p>
                <div className="space-y-1">
                  {template.features.slice(0, 3).map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2 text-xs text-gray-600">
                      <div className="w-1 h-1 bg-purple-500 rounded-full"></div>
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end space-x-4 space-x-reverse">
          <button
            onClick={() => {
              onClose();
              setSelectedTemplate(null);
              setNewWebsite({ name: '', template: '', customDomain: '' });
            }}
            className="px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            إلغاء
          </button>
          <button
            onClick={() => {
              if (selectedTemplate && newWebsite.name) {
                handleCreateWebsite(selectedTemplate);
              } else {
                alert('يرجى إدخال اسم الموقع واختيار قالب');
              }
            }}
            disabled={!selectedTemplate || !newWebsite.name}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            إنشاء الموقع
          </button>
        </div>
      </div>
    </div>
  </div>
);

const WebsiteBuilder: React.FC = () => {
  // const { isDarkMode } = useTheme();
  const [activeTab, setActiveTab] = useState('websites');
  const [selectedWebsite, setSelectedWebsite] = useState<Website | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showDomainModal, setShowDomainModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

  const [websites, setWebsites] = useState<Website[]>([
    // Empty array - will be populated from database
  ]);

  const templates: Template[] = [
    {
      id: '1',
      name: 'متجر إلكتروني',
      category: 'E-commerce',
      image: 'https://images.pexels.com/photos/230544/pexels-photo-230544.jpeg',
      description: 'قالب متكامل للمتاجر الإلكترونية مع عربة التسوق ونظام الدفع',
      features: ['عربة التسوق', 'نظام الدفع', 'إدارة المنتجات', 'تتبع الطلبات']
    },
    {
      id: '2',
      name: 'مطعم',
      category: 'Restaurant',
      image: 'https://images.pexels.com/photos/262978/pexels-photo-262978.jpeg',
      description: 'قالب مخصص للمطاعم مع قائمة الطعام وحجز الطاولات',
      features: ['قائمة الطعام', 'حجز الطاولات', 'معرض الصور', 'معلومات التواصل']
    },
    {
      id: '3',
      name: 'خدمات',
      category: 'Services',
      image: 'https://images.pexels.com/photos/265087/pexels-photo-265087.jpeg',
      description: 'قالب للشركات الخدمية مع عرض الخدمات وطلب عروض الأسعار',
      features: ['عرض الخدمات', 'طلب عروض', 'فريق العمل', 'أعمال سابقة']
    },
    {
      id: '4',
      name: 'شخصي',
      category: 'Portfolio',
      image: 'https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg',
      description: 'قالب شخصي لعرض الأعمال والمهارات',
      features: ['معرض الأعمال', 'السيرة الذاتية', 'المهارات', 'نموذج التواصل']
    },
    {
      id: '5',
      name: 'شركة',
      category: 'Corporate',
      image: 'https://images.pexels.com/photos/416405/pexels-photo-416405.jpeg',
      description: 'قالب مؤسسي للشركات الكبيرة',
      features: ['عن الشركة', 'الخدمات', 'الأخبار', 'الوظائف']
    },
    {
      id: '6',
      name: 'تعليمي',
      category: 'Education',
      image: 'https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg',
      description: 'قالب للمؤسسات التعليمية والدورات',
      features: ['الدورات', 'المدربين', 'التسجيل', 'الشهادات']
    }
  ];

  const [newWebsite, setNewWebsite] = useState({
    name: '',
    template: '',
    customDomain: ''
  });

  const StatusBadge = ({ status }: { status: string }) => {
    const statusConfig = {
      active: { color: 'bg-green-100 text-green-800', text: 'نشط' },
      draft: { color: 'bg-yellow-100 text-yellow-800', text: 'مسودة' },
      maintenance: { color: 'bg-red-100 text-red-800', text: 'صيانة' }
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  const handleCreateWebsite = (template: Template) => {
    const website: Website = {
      id: (websites.length + 1).toString(),
      name: newWebsite.name || `موقع ${template.name}`,
      domain: `${newWebsite.name.toLowerCase().replace(/\s+/g, '-')}.servly.app`,
      customDomain: newWebsite.customDomain,
      status: 'draft',
      template: template.category,
      lastModified: new Date().toISOString().split('T')[0],
      content: {
        title: newWebsite.name || `موقع ${template.name}`,
        description: template.description,
        colors: {
          primary: '#8B5CF6',
          secondary: '#FFFFFF',
          accent: '#10B981'
        },
        sections: []
      }
    };

    setWebsites(prev => [...prev, website]);
    setNewWebsite({ name: '', template: '', customDomain: '' });
    setShowTemplateModal(false);
    setSelectedTemplate(null);
  };

  const handleDeleteWebsite = (websiteId: string) => {
    if (confirm('هل أنت متأكد من حذف هذا الموقع؟')) {
      setWebsites(prev => prev.filter(website => website.id !== websiteId));
    }
  };

  // const handleConnectDomain = (websiteId: string, domain: string) => {
  //   setWebsites(prev => prev.map(website =>
  //     website.id === websiteId
  //       ? { ...website, customDomain: domain, status: 'active' as const }
  //       : website
  //   ));
  // };

  const WebsiteEditor = () => (
    <div className="h-full flex text-gray-900 dark:text-gray-100">
      {/* Editor Sidebar */}
      <div className="w-80 backdrop-blur-xl bg-white/90 dark:bg-gray-800/90 border-l border-gray-200 dark:border-gray-700 overflow-y-auto">
        <div className="p-6 text-gray-900 dark:text-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900">محرر الموقع</h3>
            <button
              onClick={() => setIsEditing(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          {/* Website Info */}
          {selectedWebsite && (
            <div className="mb-6 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
              <h4 className="font-bold text-purple-800 mb-2">{selectedWebsite.name}</h4>
              <p className="text-sm text-purple-600 mb-2">{selectedWebsite.domain}</p>
              {selectedWebsite.customDomain && (
                <p className="text-sm text-green-600">🔗 {selectedWebsite.customDomain}</p>
              )}
            </div>
          )}

          {/* Tabs */}
          <div className="flex mb-6 bg-gray-100 dark:bg-gray-700 rounded-xl p-1">
            <button className="flex-1 py-2 px-3 text-sm font-medium bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-lg shadow-sm dark:shadow-none">
              التصميم
            </button>
            <button className="flex-1 py-2 px-3 text-sm font-medium text-gray-500 dark:text-gray-400">
              المحتوى
            </button>
            <button className="flex-1 py-2 px-3 text-sm font-medium text-gray-500 dark:text-gray-400">
              الإعدادات
            </button>
          </div>

          {/* Design Tools */}
          <div className="space-y-6">
            {/* Colors */}
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">الألوان</h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">اللون الأساسي</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={selectedWebsite?.content.colors.primary || '#8B5CF6'}
                      onChange={(e) => {
                        if (selectedWebsite) {
                          setWebsites(prev => prev.map(w =>
                            w.id === selectedWebsite.id
                              ? { ...w, content: { ...w.content, colors: { ...w.content.colors, primary: e.target.value } } }
                              : w
                          ));
                        }
                      }}
                      className="w-8 h-8 rounded-lg cursor-pointer border-2 border-gray-200"
                    />
                    <input
                      type="text"
                      value={selectedWebsite?.content.colors.primary || '#8B5CF6'}
                      className="flex-1 px-2 py-1 text-xs border border-gray-200 rounded"
                      readOnly // Added dark:border-gray-600, dark:bg-gray-700, dark:text-gray-100
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">اللون الثانوي</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={selectedWebsite?.content.colors.secondary || '#FFFFFF'}
                      onChange={(e) => {
                        if (selectedWebsite) {
                          setWebsites(prev => prev.map(w =>
                            w.id === selectedWebsite.id
                              ? { ...w, content: { ...w.content, colors: { ...w.content.colors, secondary: e.target.value } } }
                              : w
                          ));
                        }
                      }}
                      className="w-8 h-8 rounded-lg cursor-pointer border-2 border-gray-200"
                    />
                    <input
                      type="text"
                      value={selectedWebsite?.content.colors.secondary || '#FFFFFF'}
                      className="flex-1 px-2 py-1 text-xs border border-gray-200 rounded"
                      readOnly // Added dark:border-gray-600, dark:bg-gray-700, dark:text-gray-100
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Typography */}
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">الخطوط</h4>
              <select className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm text-gray-900 dark:text-gray-100">
                <option>Cairo</option>
                <option>Tajawal</option>
                <option>IBM Plex Sans Arabic</option>
                <option>Amiri</option>
              </select>
            </div>

            {/* Content Editor */}
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">المحتوى</h4>
              <div className="space-y-3 text-gray-900 dark:text-gray-100">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">عنوان الموقع</label>
                  <input
                    type="text"
                    value={selectedWebsite?.content.title || ''}
                    onChange={(e) => {
                      if (selectedWebsite) {
                        setWebsites(prev => prev.map(w =>
                          w.id === selectedWebsite.id
                            ? { ...w, content: { ...w.content, title: e.target.value } }
                            : w
                        ));
                      }
                    }} // Added dark:border-gray-600, dark:bg-gray-700
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg"
                    placeholder="عنوان الموقع"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">وصف الموقع</label>
                  <textarea
                    value={selectedWebsite?.content.description || ''}
                    onChange={(e) => {
                      if (selectedWebsite) {
                        setWebsites(prev => prev.map(w =>
                          w.id === selectedWebsite.id
                            ? { ...w, content: { ...w.content, description: e.target.value } }
                            : w
                        ));
                      }
                    }} // Added dark:border-gray-600, dark:bg-gray-700
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg"
                    rows={3}
                    placeholder="وصف الموقع"
                  />
                </div>
              </div>
            </div>

            {/* Layout Components */}
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">المكونات</h4>
              <div className="space-y-2 text-gray-900 dark:text-gray-100">
                {[
                  { name: 'رأس الصفحة', icon: Layout },
                  { name: 'البانر الرئيسي', icon: Plus },
                  { name: 'قسم المنتجات', icon: Plus },
                  { name: 'معلومات التواصل', icon: Plus },
                  { name: 'ذيل الصفحة', icon: Plus }
                ].map((component, index) => (
                  <button
                    key={index}
                    className="w-full flex items-center space-x-3 space-x-reverse p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors text-right"
                  > {/* Added dark:bg-gray-700, dark:hover:bg-gray-600, dark:text-gray-300 */}
                    <component.icon className="w-4 h-4 text-gray-600" />
                    <span className="text-sm text-gray-700">{component.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Save Button */}
            <button
              onClick={() => {
                if (selectedWebsite) {
                  setWebsites(prev => prev.map(w =>
                    w.id === selectedWebsite.id
                      ? { ...w, lastModified: new Date().toISOString().split('T')[0] }
                      : w
                  ));
                  alert('تم حفظ التغييرات بنجاح!');
                }
              }}
              className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>حفظ التغييرات</span>
            </button>
          </div>
        </div>
      </div>

      {/* Preview Area */}
      <div className="flex-1 bg-gray-100 dark:bg-gray-900 relative">
        {/* Device Toggle */}
        <div className="absolute top-4 right-4 z-10 flex bg-white dark:bg-gray-800 rounded-xl shadow-lg dark:shadow-none p-1">
          <button className="p-2 bg-purple-100 dark:bg-purple-700 text-purple-600 dark:text-white rounded-lg">
            <Monitor className="w-4 h-4" />
          </button>
          <button className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            <Smartphone className="w-4 h-4" />
          </button>
        </div>

        {/* Website Preview */}
        <div className="h-full flex items-center justify-center p-8">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-5xl h-full overflow-y-auto">
            {/* Mock Website Content */} {/* Added dark:bg-gray-800, dark:text-gray-100 */}
            {selectedWebsite && (
              <div className="p-8">
                <div
                  className="text-white rounded-xl p-8 mb-8"
                  style={{ backgroundColor: selectedWebsite.content.colors.primary }}
                >
                  <h1 className="text-3xl font-bold mb-4">{selectedWebsite.content.title}</h1>
                  <p className="opacity-90 mb-4">{selectedWebsite.content.description}</p>
                  <button
                    className="px-6 py-3 bg-white rounded-xl font-medium hover:bg-gray-100 transition-colors"
                    style={{ color: selectedWebsite.content.colors.primary }}
                  >
                    ابدأ الآن
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  {[1, 2, 3].map((item) => ( // Added dark:bg-gray-700
                    <div key={item} className="bg-gray-50 rounded-xl p-6">
                      <div className="w-full h-32 bg-gray-200 rounded-lg mb-4"></div>
                      <h3 className="font-bold text-gray-900 mb-2">عنصر رقم {item}</h3>
                      <p className="text-gray-600 text-sm mb-4">وصف العنصر وتفاصيله المهمة</p>
                      <div className="flex items-center justify-between">
                        <span className="font-bold" style={{ color: selectedWebsite.content.colors.primary }}>299 ريال</span>
                        <button
                          className="px-4 py-2 rounded-lg text-sm"
                          style={{
                            backgroundColor: selectedWebsite.content.colors.primary + '20',
                            color: selectedWebsite.content.colors.primary
                          }}
                        >
                          اطلب الآن
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-8 text-center">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">تواصل معنا</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">الهاتف</h4>
                      <p className="text-gray-600">+966501234567</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">البريد الإلكتروني</h4>
                      <p className="text-gray-600">info@example.com</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">العنوان</h4>
                      <p className="text-gray-600">الرياض، السعودية</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );



  if (isEditing) {
    return <WebsiteEditor />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 text-gray-900 dark:text-gray-100">
      {/* Header */}
      <header className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border-b border-purple-100 dark:border-gray-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 text-gray-900 dark:text-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <RouterLink
                to="/"
                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" /> {/* Added dark:bg-gray-700, dark:text-gray-300, dark:hover:bg-gray-600 */}
                <span>العودة</span>
              </RouterLink>
              <h1 className="text-2xl font-bold text-gray-900">منشئ المواقع الإلكترونية</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowTemplateModal(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 transition-colors"
              >
                <Plus className="w-5 h-5" />
                <span>إنشاء موقع جديد</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="backdrop-blur-xl bg-white/60 dark:bg-gray-800/60 rounded-3xl border border-white/20 dark:border-gray-700 shadow-lg dark:shadow-none p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">المواقع النشطة</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{websites.filter(w => w.status === 'active').length}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-700 dark:to-green-900 rounded-2xl flex items-center justify-center">
                <Globe className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="backdrop-blur-xl bg-white/60 dark:bg-gray-800/60 rounded-3xl border border-white/20 dark:border-gray-700 shadow-lg dark:shadow-none p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">الزيارات الشهرية</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">45.2K</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-700 dark:to-blue-900 rounded-2xl flex items-center justify-center">
                <Eye className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="backdrop-blur-xl bg-white/60 dark:bg-gray-800/60 rounded-3xl border border-white/20 dark:border-gray-700 shadow-lg dark:shadow-none p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">القوالب المستخدمة</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{templates.length}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-700 dark:to-purple-900 rounded-2xl flex items-center justify-center">
                <Layout className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="backdrop-blur-xl bg-white/60 dark:bg-gray-800/60 rounded-3xl border border-white/20 dark:border-gray-700 shadow-lg dark:shadow-none p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">نسبة التحويل</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">3.2%</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-700 dark:to-orange-900 rounded-2xl flex items-center justify-center">
                <Settings className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="backdrop-blur-xl bg-white/60 dark:bg-gray-800/60 rounded-3xl border border-white/20 dark:border-gray-700 shadow-lg dark:shadow-none mb-6">
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setActiveTab('websites')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'websites'
                ? 'border-purple-500 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
            >
              مواقعي
            </button>
            <button
              onClick={() => setActiveTab('templates')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'templates'
                ? 'border-purple-500 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
            >
              القوالب
            </button>
            <button
              onClick={() => setActiveTab('domains')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'domains'
                ? 'border-purple-500 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
            >
              الدومينات
            </button>
          </div>

          <div className="p-6">
            {activeTab === 'websites' && (
              <div>
                {/* Websites Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 text-gray-900 dark:text-gray-100">
                  {websites.map((website) => (
                    <div key={website.id} className="backdrop-blur-xl bg-white/60 dark:bg-gray-800/60 rounded-3xl border border-white/20 dark:border-gray-700 shadow-lg dark:shadow-none p-6 group hover:shadow-xl dark:hover:shadow-none transition-all duration-300">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{website.name}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">{website.domain}</p>
                          {website.customDomain && (
                            <p className="text-sm text-green-600 mb-2">🔗 {website.customDomain}</p>
                          )}
                          <StatusBadge status={website.status} />
                        </div>
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl flex items-center justify-center">
                          <Globe className="w-6 h-6 text-purple-600" />
                        </div>
                      </div>

                      <div className="border border-gray-200 rounded-xl mb-4 overflow-hidden">
                        <div
                          className="aspect-video flex items-center justify-center text-white"
                          style={{ backgroundColor: website.content.colors.primary }}
                        >
                          <span className="text-sm font-medium">{website.content.title}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                        <span className="dark:text-gray-400">قالب: {website.template}</span>
                        <span>آخر تحديث: {new Date(website.lastModified).toLocaleDateString('ar-EG')}</span>
                      </div>

                      <div className="grid grid-cols-4 gap-2">
                        <button
                          onClick={() => {
                            setSelectedWebsite(website);
                            setIsEditing(true);
                          }}
                          className="px-3 py-2 bg-purple-100 text-purple-800 rounded-xl hover:bg-purple-200 transition-colors text-sm flex items-center justify-center"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => window.open(`https://${website.customDomain || website.domain}`, '_blank')}
                          className="px-3 py-2 bg-blue-100 text-blue-800 rounded-xl hover:bg-blue-200 transition-colors text-sm flex items-center justify-center"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setShowDomainModal(true)}
                          className="px-3 py-2 bg-green-100 text-green-800 rounded-xl hover:bg-green-200 transition-colors text-sm flex items-center justify-center"
                        >
                          <Link className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteWebsite(website.id)}
                          className="px-3 py-2 bg-red-100 text-red-800 rounded-xl hover:bg-red-200 transition-colors text-sm flex items-center justify-center"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Add New Website Card */}
                  <div
                    onClick={() => setShowTemplateModal(true)} // Added dark:bg-gray-800/30, dark:border-purple-600, dark:hover:border-purple-400
                    className="backdrop-blur-xl bg-white/30 dark:bg-gray-800/30 border-2 border-dashed border-purple-300 dark:border-purple-600 rounded-3xl p-6 flex flex-col items-center justify-center text-center hover:border-purple-500 dark:hover:border-purple-400 transition-colors cursor-pointer"
                  >
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl flex items-center justify-center mb-4">
                      <Plus className="w-8 h-8 text-purple-600" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">إنشاء موقع جديد</h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">ابدأ في بناء موقعك الإلكتروني الآن</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'templates' && (
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">اختر قالباً لموقعك</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-gray-900 dark:text-gray-100">
                  {templates.map((template) => (
                    <div key={template.id} className="backdrop-blur-xl bg-white/60 dark:bg-gray-800/60 rounded-3xl border border-white/20 dark:border-gray-700 shadow-lg dark:shadow-none overflow-hidden group hover:shadow-xl dark:hover:shadow-none transition-all duration-300 cursor-pointer">
                      <img
                        src={template.image}
                        alt={template.name}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-2 text-gray-900 dark:text-white">
                          <h4 className="font-bold">{template.name}</h4>
                          <span className="px-3 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                            {template.category}
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm mb-4">{template.description}</p>
                        <div className="space-y-1 mb-4">
                          {template.features.map((feature, index) => (
                            <div key={index} className="flex items-center space-x-2 text-xs text-gray-600">
                              <div className="w-1 h-1 bg-purple-500 rounded-full"></div>
                              <span>{feature}</span>
                            </div>
                          ))}
                        </div>
                        <button
                          onClick={() => {
                            setSelectedTemplate(template);
                            setShowTemplateModal(true);
                          }}
                          className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 transition-colors"
                        >
                          استخدم هذا القالب
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'domains' && (
              <div className="text-center py-12">
                <Globe className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">إدارة الدومينات</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">ربط وإدارة الدومينات المخصصة لمواقعك</p>
                <button
                  onClick={() => setShowDomainModal(true)}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl"
                >
                  إضافة دومين جديد
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {showDomainModal && (
        <DomainModal onClose={() => setShowDomainModal(false)} />
      )}

      {showTemplateModal && (
        <TemplateModal
          onClose={() => setShowTemplateModal(false)}
          templates={templates}
          selectedTemplate={selectedTemplate}
          setSelectedTemplate={setSelectedTemplate}
          newWebsite={newWebsite}
          setNewWebsite={setNewWebsite}
          handleCreateWebsite={handleCreateWebsite}
        />
      )}
    </div>
  );
};

export default WebsiteBuilder;