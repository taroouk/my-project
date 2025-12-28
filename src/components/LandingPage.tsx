import { ArrowRight, LogIn, Store, Users, Sparkles } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";

interface Props {
  language: "ar" | "en";
  setLanguage: (l: "ar" | "en") => void;
  onGetStarted: () => void;
  onCustomerLogin: () => void;
  onMerchantLogin: () => void;
}

const t = {
  en: {
    heroTitle: "Run Your Business. Sell. Book. Grow.",
    heroDesc:
      "Servly helps merchants manage services, products, bookings, customers, and loyalty — all in one powerful platform.",
    getStarted: "Get Started",
    login: "Login",
    forMerchants: "For Merchants",
    forCustomers: "For Customers",
    merchantDesc: "Manage services, bookings, staff, and customers easily.",
    customerDesc: "Book services, track loyalty points, and manage your profile.",
    howItWorks: "How Servly Works",
    step1: "Create your store",
    step2: "Add services & products",
    step3: "Start receiving bookings",
    finalCTA: "Start your journey with Servly today",
  },
  ar: {
    heroTitle: "شغّل مشروعك. بيع. احجز. وكبّر.",
    heroDesc:
      "سيرفلي تساعد التجار على إدارة الخدمات والمنتجات والحجوزات والعملاء ونظام الولاء في منصة واحدة.",
    getStarted: "ابدأ الآن",
    login: "تسجيل الدخول",
    forMerchants: "للتجار",
    forCustomers: "للعملاء",
    merchantDesc: "إدارة الخدمات والحجوزات والعملاء بسهولة.",
    customerDesc: "حجز الخدمات ومتابعة نقاط الولاء.",
    howItWorks: "كيف تعمل Servly",
    step1: "إنشاء المتجر",
    step2: "إضافة الخدمات والمنتجات",
    step3: "استقبال الحجوزات",
    finalCTA: "ابدأ رحلتك مع Servly اليوم",
  },
};

const LandingPage = ({
  language,
  setLanguage,
  onGetStarted,
  onCustomerLogin,
  onMerchantLogin,
}: Props) => {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const copy = t[language];

  return (
    <div
      className={`min-h-screen ${
        isDarkMode ? "bg-[#030712] text-white" : "bg-[#F8FAFC] text-gray-900"
      }`}
      dir={language === "ar" ? "rtl" : "ltr"}
    >
      {/* Header */}
      <header className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="font-black text-2xl tracking-tight">Servly</div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setLanguage(language === "en" ? "ar" : "en")}
            className="text-xs font-black uppercase opacity-70 hover:opacity-100"
          >
            {language === "en" ? "AR" : "EN"}
          </button>

          <button
            onClick={toggleDarkMode}
            className="text-xs font-black uppercase opacity-70 hover:opacity-100"
          >
            {isDarkMode ? "Light" : "Dark"}
          </button>

          <button
            onClick={onCustomerLogin}
            className="flex items-center gap-2 text-sm font-black opacity-80 hover:opacity-100"
          >
            <LogIn size={16} /> {copy.login}
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 py-24 text-center">
        <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-6">
          {copy.heroTitle}
        </h1>
        <p className="max-w-3xl mx-auto text-lg opacity-80 mb-10">
          {copy.heroDesc}
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button
            onClick={onGetStarted}
            className="px-10 py-5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-black flex items-center justify-center gap-2"
          >
            {copy.getStarted} <ArrowRight size={18} />
          </button>

          <button
            onClick={onMerchantLogin}
            className="px-10 py-5 rounded-2xl border font-black opacity-80 hover:opacity-100"
          >
            {copy.login}
          </button>
        </div>
      </section>

      {/* For Who */}
      <section className="max-w-6xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-10">
        <div className="p-10 rounded-3xl bg-white/5 border">
          <Store size={28} className="mb-4 text-purple-500" />
          <h3 className="text-2xl font-black mb-2">{copy.forMerchants}</h3>
          <p className="opacity-80">{copy.merchantDesc}</p>
        </div>

        <div className="p-10 rounded-3xl bg-white/5 border">
          <Users size={28} className="mb-4 text-indigo-500" />
          <h3 className="text-2xl font-black mb-2">{copy.forCustomers}</h3>
          <p className="opacity-80">{copy.customerDesc}</p>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-6xl mx-auto px-6 py-20 text-center">
        <h2 className="text-3xl font-black mb-12">{copy.howItWorks}</h2>

        <div className="grid md:grid-cols-3 gap-8">
          {[copy.step1, copy.step2, copy.step3].map((s, i) => (
            <div
              key={i}
              className="p-8 rounded-3xl bg-white/5 border"
            >
              <Sparkles className="mx-auto mb-4 text-purple-500" />
              <p className="font-black">{s}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 text-center">
        <h2 className="text-3xl font-black mb-8">{copy.finalCTA}</h2>
        <button
          onClick={onGetStarted}
          className="px-12 py-6 rounded-2xl bg-black text-white font-black hover:bg-gray-800"
        >
          {copy.getStarted}
        </button>
      </section>
    </div>
  );
};

export default LandingPage;
