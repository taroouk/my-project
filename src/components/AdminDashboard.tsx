import React, { useState } from 'react';
import { X, Users, Settings, Palette, Database, Shield, BarChart3, Zap, Sun, Moon, Plus, Trash2, Edit2, Save, Globe, Phone, Mail, Facebook, Twitter, Instagram, Linkedin, Layout, Upload, Search, Filter, Bell, Download, AlertTriangle } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useSiteSettings, Plan } from '../contexts/SiteSettingsContext';

const AdminDashboard: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [activeSection, setActiveSection] = useState('overview');
  const { isDarkMode, toggleDarkMode } = useTheme();
  const {
    settings,
    updateBranding,
    updateContact,
    updateSocial,
    updateFooter,
    updatePlatform,
    addPlan,
    updatePlan,
    deletePlan
  } = useSiteSettings();

  const [users] = useState([
    { id: 1, name: 'أحمد محمد', email: 'ahmed@example.com', role: 'admin', status: 'active', date: '2024-03-15' },
    { id: 2, name: 'سارة علي', email: 'sara@example.com', role: 'user', status: 'active', date: '2024-03-14' },
    { id: 3, name: 'محمد حسن', email: 'mohamed@example.com', role: 'user', status: 'inactive', date: '2024-03-13' },
    { id: 4, name: 'محمود جمال', email: 'mahmoud@example.com', role: 'user', status: 'active', date: '2024-03-12' },
    { id: 5, name: 'نادية سمير', email: 'nadia@example.com', role: 'user', status: 'active', date: '2024-03-10' },
  ]);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateBranding({ logoUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [isAddingPlan, setIsAddingPlan] = useState(false);
  const [newPlan, setNewPlan] = useState<Partial<Plan>>({
    features: [],
    featuresEn: [],
    color: 'from-purple-500 to-pink-600',
    iconName: 'Star'
  });

  const sections = [
    { id: 'overview', name: 'نظرة عامة', icon: BarChart3 },
    { id: 'branding', name: 'الهوية البصرية', icon: Palette },
    { id: 'content', name: 'المحتوى والتواصل', icon: Globe },
    { id: 'plans', name: 'إدارة الباقات', icon: Layout },
    { id: 'users', name: 'المستخدمين', icon: Users },
    { id: 'platform', name: 'إعدادات المنصة', icon: Settings },
  ];

  const handleSavePlan = () => {
    if (isAddingPlan) {
      if (!newPlan.name || !newPlan.price) return;
      addPlan({
        ...newPlan,
        id: Date.now().toString(),
        features: newPlan.features || [],
        featuresEn: newPlan.featuresEn || [],
      } as Plan);
      setIsAddingPlan(false);
      setNewPlan({ features: [], featuresEn: [], color: 'from-purple-500 to-pink-600', iconName: 'Star' });
    } else if (editingPlan) {
      updatePlan(editingPlan.id, editingPlan);
      setEditingPlan(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-7xl h-[90vh] bg-gradient-to-br from-purple-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 rounded-3xl shadow-2xl dark:shadow-none overflow-hidden flex text-gray-900 dark:text-gray-100">
          {/* Sidebar */}
          <div className="w-80 backdrop-blur-xl bg-white/90 dark:bg-gray-800/90 border-r border-gray-200 dark:border-gray-700 flex flex-col">
            <div className="p-6 flex-1 overflow-y-auto">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-purple-800 rounded-2xl flex items-center justify-center">
                    <Settings className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">لوحة التحكم</h2>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                </button>
              </div>

              <div className="mb-6 p-2 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-between">
                <span className="font-medium text-gray-700 dark:text-gray-300 text-sm">{isDarkMode ? 'الوضع الفاتح' : 'الوضع الداكن'}</span>
                <button
                  onClick={toggleDarkMode}
                  className="p-2 rounded-full bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors"
                >
                  {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </button>
              </div>

              <nav className="space-y-2">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center space-x-3 space-x-reverse px-4 py-3 rounded-xl text-right transition-colors ${activeSection === section.id ? 'bg-purple-100 dark:bg-purple-800 text-purple-800 dark:text-white'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                  >
                    <section.icon className="w-5 h-5" />
                    <span className="font-medium">{section.name}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto bg-white/50 dark:bg-gray-900/50">
            <div className="p-8">
              {activeSection === 'overview' && (
                <div className="text-center py-20">
                  <BarChart3 className="w-20 h-20 text-purple-200 mx-auto mb-6" />
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">مرحباً بك في لوحة التحكم</h3>
                  <p className="text-gray-600 dark:text-gray-400">اختر قسماً من القائمة الجانبية للبدء في إدارة موقعك</p>
                </div>
              )}

              {activeSection === 'branding' && (
                <div className="space-y-8">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">الهوية البصرية</h3>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                      <h4 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <Palette className="w-5 h-5 text-purple-600" />
                        الألوان
                      </h4>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">اللون الأساسي</label>
                          <div className="flex gap-3">
                            <input
                              type="color"
                              value={settings.branding.primaryColor}
                              onChange={(e) => updateBranding({ primaryColor: e.target.value })}
                              className="w-12 h-12 rounded-xl cursor-pointer"
                            />
                            <input
                              type="text"
                              value={settings.branding.primaryColor}
                              onChange={(e) => updateBranding({ primaryColor: e.target.value })}
                              className="flex-1 px-4 rounded-xl border border-gray-200 dark:border-gray-600 bg-transparent"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">اللون الثانوي</label>
                          <div className="flex gap-3">
                            <input
                              type="color"
                              value={settings.branding.secondaryColor}
                              onChange={(e) => updateBranding({ secondaryColor: e.target.value })}
                              className="w-12 h-12 rounded-xl cursor-pointer"
                            />
                            <input
                              type="text"
                              value={settings.branding.secondaryColor}
                              onChange={(e) => updateBranding({ secondaryColor: e.target.value })}
                              className="flex-1 px-4 rounded-xl border border-gray-200 dark:border-gray-600 bg-transparent"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                      <h4 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <Layout className="w-5 h-5 text-purple-600" />
                        الخطوط والشعار
                      </h4>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">اسم الموقع</label>
                          <input
                            type="text"
                            value={settings.branding.siteName}
                            onChange={(e) => updateBranding({ siteName: e.target.value })}
                            className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">شعار الموقع</label>
                          <div className="flex items-center gap-4">
                            <div className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center overflow-hidden bg-gray-50 dark:bg-gray-700/50">
                              {settings.branding.logoUrl ? (
                                <img src={settings.branding.logoUrl} alt="Logo" className="w-full h-full object-contain" />
                              ) : (
                                <Upload className="w-6 h-6 text-gray-400" />
                              )}
                            </div>
                            <div className="flex-1">
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleLogoUpload}
                                className="hidden"
                                id="logo-upload"
                              />
                              <label
                                htmlFor="logo-upload"
                                className="inline-flex items-center gap-2 px-4 py-2 bg-purple-50 dark:bg-purple-900/20 text-purple-600 rounded-xl cursor-pointer hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors font-medium"
                              >
                                <Upload className="w-4 h-4" />
                                رفع شعار جديد
                              </label>
                              <p className="text-xs text-gray-500 mt-2">PNG, JPG حتى 2 ميجابايت</p>
                            </div>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">خط العناوين</label>
                          <select
                            value={settings.branding.headingFont}
                            onChange={(e) => updateBranding({ headingFont: e.target.value })}
                            className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-transparent"
                          >
                            <option value="Cairo">Cairo</option>
                            <option value="Tajawal">Tajawal</option>
                            <option value="IBM Plex Sans Arabic">IBM Plex Sans Arabic</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeSection === 'content' && (
                <div className="space-y-8">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">المحتوى والتواصل</h3>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                      <h4 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <Phone className="w-5 h-5 text-purple-600" />
                        معلومات التواصل
                      </h4>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">رقم الهاتف</label>
                          <input
                            type="text"
                            value={settings.contact.phone}
                            onChange={(e) => updateContact({ phone: e.target.value })}
                            className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">البريد الإلكتروني</label>
                          <input
                            type="text"
                            value={settings.contact.email}
                            onChange={(e) => updateContact({ email: e.target.value })}
                            className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">العنوان (العربية)</label>
                          <input
                            type="text"
                            value={settings.contact.address}
                            onChange={(e) => updateContact({ address: e.target.value })}
                            className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">العنوان (English)</label>
                          <input
                            type="text"
                            value={settings.contact.addressEn}
                            onChange={(e) => updateContact({ addressEn: e.target.value })}
                            className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-transparent"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                      <h4 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <Globe className="w-5 h-5 text-purple-600" />
                        وسائل التواصل الاجتماعي
                      </h4>
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <Facebook className="w-5 h-5 text-blue-600" />
                          <input
                            type="text"
                            placeholder="Facebook URL"
                            value={settings.social.facebook}
                            onChange={(e) => updateSocial({ facebook: e.target.value })}
                            className="flex-1 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-transparent"
                          />
                        </div>
                        <div className="flex items-center gap-3">
                          <Twitter className="w-5 h-5 text-sky-500" />
                          <input
                            type="text"
                            placeholder="Twitter URL"
                            value={settings.social.twitter}
                            onChange={(e) => updateSocial({ twitter: e.target.value })}
                            className="flex-1 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-transparent"
                          />
                        </div>
                        <div className="flex items-center gap-3">
                          <Instagram className="w-5 h-5 text-pink-600" />
                          <input
                            type="text"
                            placeholder="Instagram URL"
                            value={settings.social.instagram}
                            onChange={(e) => updateSocial({ instagram: e.target.value })}
                            className="flex-1 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-transparent"
                          />
                        </div>
                        <div className="flex items-center gap-3">
                          <Linkedin className="w-5 h-5 text-blue-700" />
                          <input
                            type="text"
                            placeholder="LinkedIn URL"
                            value={settings.social.linkedin}
                            onChange={(e) => updateSocial({ linkedin: e.target.value })}
                            className="flex-1 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-transparent"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                    <h4 className="text-lg font-bold mb-4">الفوتر (تذييل الصفحة)</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">نص الحقوق</label>
                        <input
                          type="text"
                          value={settings.footer.copyrightText}
                          onChange={(e) => updateFooter({ copyrightText: e.target.value })}
                          className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">رابط الشركة</label>
                        <input
                          type="text"
                          value={settings.footer.companyLink}
                          onChange={(e) => updateFooter({ companyLink: e.target.value })}
                          className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-transparent"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeSection === 'plans' && (
                <div className="space-y-8">
                  <div className="flex justify-between items-center">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">إدارة باقات الاشتراك</h3>
                    <button
                      onClick={() => setIsAddingPlan(true)}
                      className="px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      إضافة باقة
                    </button>
                  </div>

                  {(isAddingPlan || editingPlan) && (
                    <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-lg border border-purple-100 dark:border-purple-900/30 mb-8">
                      <h4 className="text-lg font-bold mb-6 text-purple-600">
                        {isAddingPlan ? 'إضافة باقة جديدة' : 'تعديل الباقة'}
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                          <label className="block text-sm font-medium mb-1">اسم الباقة (عربي)</label>
                          <input
                            type="text"
                            value={isAddingPlan ? newPlan.name : editingPlan?.name}
                            onChange={(e) => isAddingPlan ? setNewPlan({ ...newPlan, name: e.target.value }) : setEditingPlan({ ...editingPlan!, name: e.target.value })}
                            className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">اسم الباقة (English)</label>
                          <input
                            type="text"
                            value={isAddingPlan ? newPlan.nameEn : editingPlan?.nameEn}
                            onChange={(e) => isAddingPlan ? setNewPlan({ ...newPlan, nameEn: e.target.value }) : setEditingPlan({ ...editingPlan!, nameEn: e.target.value })}
                            className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">السعر الشهري</label>
                          <input
                            type="number"
                            value={isAddingPlan ? newPlan.price : editingPlan?.price}
                            onChange={(e) => isAddingPlan ? setNewPlan({ ...newPlan, price: Number(e.target.value) }) : setEditingPlan({ ...editingPlan!, price: Number(e.target.value) })}
                            className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">السعر السنوي</label>
                          <input
                            type="number"
                            value={isAddingPlan ? newPlan.yearlyPrice : editingPlan?.yearlyPrice}
                            onChange={(e) => isAddingPlan ? setNewPlan({ ...newPlan, yearlyPrice: Number(e.target.value) }) : setEditingPlan({ ...editingPlan!, yearlyPrice: Number(e.target.value) })}
                            className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-transparent"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end gap-3">
                        <button
                          onClick={() => { setIsAddingPlan(false); setEditingPlan(null); }}
                          className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                        >
                          إلغاء
                        </button>
                        <button
                          onClick={handleSavePlan}
                          className="px-6 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors flex items-center gap-2"
                        >
                          <Save className="w-4 h-4" />
                          حفظ
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {settings.plans.map((plan) => (
                      <div key={plan.id} className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 relative group">
                        <div className="absolute top-4 left-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => setEditingPlan(plan)}
                            className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deletePlan(plan.id)}
                            className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${plan.color} flex items-center justify-center mb-4 text-white`}>
                          <Zap className="w-6 h-6" />
                        </div>
                        <h4 className="text-xl font-bold mb-2">{plan.name}</h4>
                        <p className="text-2xl font-bold text-purple-600 mb-4">
                          {plan.price} <span className="text-sm text-gray-500 font-normal">/شهر</span>
                        </p>
                        <ul className="space-y-2 mb-4">
                          {plan.features.slice(0, 3).map((feature, idx) => (
                            <li key={idx} className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                              <span className="w-1.5 h-1.5 bg-purple-400 rounded-full" />
                              {feature}
                            </li>
                          ))}
                          {plan.features.length > 3 && (
                            <li className="text-sm text-gray-500 italic">+ {plan.features.length - 3} ميزات أخرى</li>
                          )}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeSection === 'users' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">المستخدمين</h3>
                    <div className="flex gap-3">
                      <div className="relative">
                        <Search className="w-5 h-5 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          placeholder="بحث عن مستخدم..."
                          className="pl-4 pr-10 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 w-64 focus:ring-2 focus:ring-purple-500 outline-none"
                        />
                      </div>
                      <button className="p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700">
                        <Filter className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                      </button>
                      <button className="p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700">
                        <Download className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                      </button>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                    <table className="w-full text-right">
                      <thead className="bg-gray-50 dark:bg-gray-700/50">
                        <tr>
                          <th className="px-6 py-4 text-sm font-bold text-gray-900 dark:text-white">المستخدم</th>
                          <th className="px-6 py-4 text-sm font-bold text-gray-900 dark:text-white">الدور</th>
                          <th className="px-6 py-4 text-sm font-bold text-gray-900 dark:text-white">الحالة</th>
                          <th className="px-6 py-4 text-sm font-bold text-gray-900 dark:text-white">تاريخ التسجيل</th>
                          <th className="px-6 py-4 text-sm font-bold text-gray-900 dark:text-white">إجراءات</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {users.map((user) => (
                          <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 font-bold">
                                  {user.name.charAt(0)}
                                </div>
                                <div>
                                  <p className="font-bold text-gray-900 dark:text-white">{user.name}</p>
                                  <p className="text-sm text-gray-500">{user.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-3 py-1 rounded-full text-xs font-bold ${user.role === 'admin'
                                ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                                : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                                }`}>
                                {user.role === 'admin' ? 'مدير' : 'مستخدم'}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-3 py-1 rounded-full text-xs font-bold ${user.status === 'active'
                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                                : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                                }`}>
                                {user.status === 'active' ? 'نشط' : 'غير نشط'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                              {user.date}
                            </td>
                            <td className="px-6 py-4">
                              <button className="text-gray-400 hover:text-purple-600 transition-colors">
                                <Edit2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeSection === 'platform' && (
                <div className="space-y-8">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">إعدادات المنصة</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                      <h4 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <Shield className="w-5 h-5 text-purple-600" />
                        الأمان والصيانة
                      </h4>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg text-orange-600">
                              <AlertTriangle className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="font-bold text-gray-900 dark:text-white">وضع الصيانة</p>
                              <p className="text-sm text-gray-500">إيقاف الموقع مؤقتاً للزوار</p>
                            </div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={settings.platform.maintenanceMode}
                              onChange={(e) => updatePlatform({ maintenanceMode: e.target.checked })}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
                          </label>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600">
                              <Users className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="font-bold text-gray-900 dark:text-white">التسجيل الجديد</p>
                              <p className="text-sm text-gray-500">السماح بتسجيل مستخدمين جدد</p>
                            </div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={settings.platform.allowRegistration}
                              onChange={(e) => updatePlatform({ allowRegistration: e.target.checked })}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                      <h4 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <Bell className="w-5 h-5 text-purple-600" />
                        الإشعارات والنسخ الاحتياطي
                      </h4>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg text-green-600">
                              <Mail className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="font-bold text-gray-900 dark:text-white">إشعارات البريد</p>
                              <p className="text-sm text-gray-500">إرسال إشعارات للمشرفين</p>
                            </div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={settings.platform.emailNotifications}
                              onChange={(e) => updatePlatform({ emailNotifications: e.target.checked })}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
                          </label>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg text-purple-600">
                              <Database className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="font-bold text-gray-900 dark:text-white">النسخ الاحتياطي التلقائي</p>
                              <p className="text-sm text-gray-500">نسخ احتياطي يومي للبيانات</p>
                            </div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={settings.platform.autoBackup}
                              onChange={(e) => updatePlatform({ autoBackup: e.target.checked })}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;