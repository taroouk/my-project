import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Store as StoreIcon, Moon, Sun, Languages, ArrowRight } from "lucide-react";

import { useTheme } from "../../contexts/ThemeContext";
import { Lang, useMerchantLang } from "../dashboard/merchant/useMerchantLang";

import {
  type Currency,
  type ThemePreference,
  type MerchantListRow,
  getPublicMerchantsList,
  withTimeout,
} from "../../lib/supabaseClient";

import {
  BUSINESS_CATEGORIES,
  splitBusinessCategory,
  type BusinessCategoryValue,
} from "../dashboard/merchant/sections/businessCategories";
function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function retry<T>(fn: () => Promise<T>, tries = 3) {
  let lastErr: any = null;
  for (let i = 0; i < tries; i++) {
    try {
      return await fn();
    } catch (e: any) {
      lastErr = e;
      await sleep(350 * (i + 1));
    }
  }
  throw lastErr;
}

const Stores = () => {
  const navigate = useNavigate();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const { lang , dir , t ,setLanguage } = useMerchantLang() as any;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [stores, setStores] = useState<MerchantListRow[]>([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<BusinessCategoryValue | "all">("all");

  const ui = useMemo(() => {
    if (isDarkMode) {
      return {
        page: "min-h-screen bg-[#030712] text-slate-100",
        header: "sticky top-0 z-20 bg-slate-950/40 border-b border-slate-900/60 backdrop-blur",
        container: "max-w-6xl mx-auto px-6",
        title: "text-slate-50",
        muted: "text-slate-400",
        card: "bg-slate-950/35 border border-slate-900/60 rounded-3xl",
        cardSoft: "bg-slate-950/25 border border-slate-900/50 rounded-3xl",
        input: "bg-slate-950/40 border border-slate-900/60 text-slate-100 placeholder:text-slate-500",
        select: "bg-slate-950/40 border border-slate-900/60 text-slate-100",
        chip: "bg-slate-900/40 border border-slate-800 text-slate-200",
        btnGhost: "bg-slate-900/30 border border-slate-800 text-slate-200 hover:bg-slate-900/50",
        btnPrimary: "bg-white text-slate-900 hover:bg-slate-100",
        gridCard: "bg-slate-950/35 border border-slate-900/60 rounded-3xl hover:bg-slate-950/45 transition",
        emptyBox: "bg-slate-950/30 border border-slate-900/60 text-slate-200",
        dangerBox: "bg-rose-950/30 border border-rose-900/40 text-rose-200",
      };
    }

    return {
      page: "min-h-screen bg-[#F8FAFC] text-slate-900",
      header: "sticky top-0 z-20 bg-white/80 border-b border-slate-100 backdrop-blur",
      container: "max-w-6xl mx-auto px-6",
      title: "text-slate-900",
      muted: "text-slate-500",
      card: "bg-white border border-slate-100 rounded-3xl shadow-sm",
      cardSoft: "bg-white border border-slate-100 rounded-3xl shadow-sm",
      input: "bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400",
      select: "bg-white border border-slate-200 text-slate-900",
      chip: "bg-slate-100 text-slate-700",
      btnGhost: "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50",
      btnPrimary: "bg-black text-white hover:bg-slate-800",
      gridCard: "bg-white border border-slate-100 rounded-3xl hover:shadow-md transition",
      emptyBox: "bg-white border border-slate-200 text-slate-700",
      dangerBox: "bg-rose-50 border border-rose-100 text-rose-700",
    };
  }, [isDarkMode]);

  // label helpers
  const getCategoryLabel = (val: BusinessCategoryValue) => {
    const row = BUSINESS_CATEGORIES.find((c) => c.value === val);
    if (!row) return t("Other", "أخرى");
    return lang === "ar" ? row.ar : row.en;
  };

  const normalizeBusinessCategory = (raw: any): { value: BusinessCategoryValue; label: string } => {
    const parsed = splitBusinessCategory(String(raw || ""));
    if (parsed.value === "other") {
      const custom = String(parsed.custom || "").trim();
      const label = custom ? custom : t("Other", "أخرى");
      return { value: "other", label };
    }
    return { value: parsed.value, label: getCategoryLabel(parsed.value) };
  };

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      setLoading(true);
      setError("");

      try {
        const data = await retry(async () => {
          return await withTimeout(getPublicMerchantsList(), 8000, "Stores fetch");
        }, 3);

        if (cancelled) return;

        setStores(data || []);
      } catch (e: any) {
        if (cancelled) return;
        setError(e?.message || t("Failed to load stores.", "فشل تحميل المتاجر."));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [t]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    return (stores || []).filter((s) => {
      const name = String(s.store_name || "").toLowerCase();
      const slug = String(s.store_slug || "").toLowerCase();

      const cat = normalizeBusinessCategory((s as any).business_type);
      const catOk = category === "all" ? true : cat.value === category;

      const qOk = !q ? true : name.includes(q) || slug.includes(q) || cat.label.toLowerCase().includes(q);

      // only show valid storefront merchants
      const hasSlug = !!s.store_slug;
      return hasSlug && catOk && qOk;
    });
  }, [stores, query, category, lang]);

  const topBar = (
    <div className="flex items-center gap-2 flex-wrap justify-end">
      {/* Language */}
      <button
              type="button"
              onClick={() => setLanguage((lang: Lang) => (lang === 'en' ? 'ar' : 'en'))}
              className={`p-3 rounded-xl transition-all border ${ui.btnGhost}`}
              title={lang === 'ar' ? t('Language: AR') : t('Language: EN')}
              aria-label={lang === 'ar' ? t('Language: AR') : t('Language: EN')}
            >
              <Languages size={18} />
            </button>


      {/* Dark/Light */}
      <button
        type="button"
        onClick={toggleDarkMode}
        className={`h-10 px-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 ${ui.btnGhost}`}
        title={t("Theme", "الوضع")}
      >
        {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
        {isDarkMode ? t("Light", "فاتح") : t("Dark", "داكن")}
      </button>

      <button
        type="button"
        onClick={() => navigate("/")}
        className={`h-10 px-4 rounded-2xl font-black text-xs uppercase tracking-widest ${ui.btnGhost}`}
      >
        {t("Home", "الرئيسية")}
      </button>
    </div>
  );

  return (
    <div className={ui.page} dir={dir}>
      {/* HEADER */}
      <header className={ui.header}>
        <div className={`${ui.container} py-5 flex items-center justify-between gap-4`}>
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${isDarkMode ? "bg-indigo-600" : "bg-black"} text-white`}>
                <StoreIcon size={18} />
              </div>
              <div>
                <h1 className={`text-2xl font-black tracking-tight ${ui.title}`}>
                  {t("Stores", "المتاجر")}
                </h1>
                <p className={`text-[10px] font-black uppercase tracking-[0.22em] mt-1 ${ui.muted}`}>
                  {t("Browse merchants and their storefronts", "تصفح التجار ومتاجرهم")}
                </p>
              </div>
            </div>
          </div>

          {topBar}
        </div>
      </header>

      <main className={`${ui.container} py-8 space-y-6`}>
        {/* Filters */}
        <div className={`${ui.cardSoft} p-5`}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="relative">
              <Search size={16} className={`absolute ${dir === "rtl" ? "right-4" : "left-4"} top-1/2 -translate-y-1/2 ${ui.muted}`} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className={`w-full h-12 ${dir === "rtl" ? "pr-12 pl-4" : "pl-12 pr-4"} rounded-2xl font-bold outline-none ${ui.input}`}
                placeholder={t("Search by name, slug, category...", "ابحث بالاسم أو الرابط أو التصنيف...")}
              />
            </div>

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
              className={`w-full h-12 px-4 rounded-2xl font-bold outline-none ${ui.select}`}
            >
              <option value="all">{t("All categories", "كل التصنيفات")}</option>
              {BUSINESS_CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {lang === "ar" ? c.ar : c.en}
                </option>
              ))}
            </select>

            <div className="flex items-center justify-between gap-3">
              <div className={`px-4 h-12 rounded-2xl flex items-center text-[11px] font-black uppercase tracking-widest ${ui.chip}`}>
                {t("Total", "الإجمالي")}: {filtered.length}
              </div>

              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setCategory("all");
                }}
                className={`h-12 px-5 rounded-2xl font-black text-xs uppercase tracking-widest ${ui.btnGhost}`}
              >
                {t("Reset", "إعادة ضبط")}
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className={`${ui.card} p-10 flex items-center gap-4`}>
            <div className={`w-6 h-6 border-4 ${isDarkMode ? "border-indigo-400" : "border-indigo-600"} border-t-transparent rounded-full animate-spin`} />
            <div>
              <div className={`text-lg font-black ${ui.title}`}>{t("Loading stores...", "جاري تحميل المتاجر...")}</div>
              <div className={`text-xs font-bold ${ui.muted}`}>{t("Fetching data from database", "جاري جلب البيانات من قاعدة البيانات")}</div>
            </div>
          </div>
        ) : error ? (
          <div className={`${ui.card} p-8 border ${ui.dangerBox}`}>
            <div className="text-lg font-black">{t("Couldn’t load stores", "تعذر تحميل المتاجر")}</div>
            <pre className="mt-3 whitespace-pre-wrap text-xs font-bold">{error}</pre>

            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className={`h-11 px-6 rounded-2xl font-black text-xs uppercase tracking-widest ${ui.btnPrimary}`}
              >
                {t("Retry", "إعادة المحاولة")}
              </button>
              <button
                type="button"
                onClick={() => navigate("/")}
                className={`h-11 px-6 rounded-2xl font-black text-xs uppercase tracking-widest ${ui.btnGhost}`}
              >
                {t("Back", "رجوع")}
              </button>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className={`${ui.card} p-10 ${ui.emptyBox}`}>
            <div className={`text-2xl font-black ${ui.title}`}>{t("No stores found", "لا توجد متاجر")}</div>
            <p className={`mt-2 text-sm font-bold ${ui.muted}`}>
              {t("Try changing filters or search keywords.", "جرّب تغيير الفلاتر أو كلمات البحث.")}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((s) => {
              const brand = s.brand_color || "#6366F1";
              const th = (s.theme_preference || "grid") as ThemePreference;
              const curr = (s.currency || "SAR") as Currency;

              const cat = normalizeBusinessCategory((s as any).business_type);

              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => navigate(`/s/${s.store_slug}`)}
                  className={`${ui.gridCard} p-6 text-left`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className={`text-lg font-black truncate ${ui.title}`}>
                        {s.store_name || t("Store", "متجر")}
                      </div>
                      <div className={`mt-1 text-[10px] font-black uppercase tracking-widest ${ui.muted}`}>
                        /s/{s.store_slug}
                      </div>
                    </div>

                    <div className="w-10 h-10 rounded-2xl flex items-center justify-center font-black text-white shrink-0"
                      style={{ backgroundColor: brand }}
                    >
                      {(s.store_name?.charAt(0) || "S").toUpperCase()}
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className={`px-3 py-2 rounded-2xl text-[10px] font-black uppercase ${ui.chip}`}>
                      {t("Category", "التصنيف")}: {cat.label}
                    </span>
                    <span className={`px-3 py-2 rounded-2xl text-[10px] font-black uppercase ${ui.chip}`}>
                      {t("Theme", "الثيم")}: {th}
                    </span>
                    <span className={`px-3 py-2 rounded-2xl text-[10px] font-black uppercase ${ui.chip}`}>
                      {t("Currency", "العملة")}: {curr}
                    </span>
                  </div>

                  <div className="mt-5 h-1.5 w-full rounded-full" style={{ backgroundColor: brand }} />

                  <div className="mt-5 flex items-center justify-between">
                    <span className={`text-xs font-black uppercase tracking-widest ${ui.muted}`}>
                      {t("Open store", "افتح المتجر")}
                    </span>
                    <span className={`h-10 w-10 rounded-2xl flex items-center justify-center ${ui.btnPrimary}`}>
                      <ArrowRight size={16} />
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default Stores;
