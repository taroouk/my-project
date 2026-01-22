import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  Currency,
  StorePublic,
  ServiceRow,
  ProductRow,
  getPublicStoreBySlug,
  getPublicServicesByMerchant,
  getPublicProductsByMerchant,
  withTimeout,
  addCartItem, // ✅ NEW
} from "../../lib/supabaseClient";

import { useTheme } from "../../contexts/ThemeContext";
import { useMerchantLang } from "../dashboard/merchant/useMerchantLang";
import { useAuth } from "../../contexts/AuthContext"; // ✅ NEW

import { Languages, Moon, Sun, ShoppingCart, ArrowLeft, Plus } from "lucide-react";
import { uiTokens, cx } from "../../ui/ui";

type ThemePreference = "grid" | "list" | "cards" | "minimal" | "hero" | "catalog";
const THEME_ALLOWED: ThemePreference[] = ["grid", "list", "cards", "minimal", "hero", "catalog"];

// ✅ Cache versioning (علشان لو الكاش قديم من غير theme_preference يتمسح تلقائيًا)
const CACHE_VERSION = "v2_theme_pref_2026_01_01";
const LS_STORE = (slug: string) => `servly_cache_store_${CACHE_VERSION}_${slug}`;
const LS_SERVICES = (merchantId: string) => `servly_cache_services_${CACHE_VERSION}_${merchantId}`;
const LS_PRODUCTS = (merchantId: string) => `servly_cache_products_${CACHE_VERSION}_${merchantId}`;

function safeJsonParse<T>(raw: string | null): T | null {
  try {
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * Retry wrapper (3 tries) + timeout لكل محاولة
 */
async function retry<T>(fn: () => Promise<T>, tries = 3) {
  let lastErr: any = null;
  for (let i = 0; i < tries; i++) {
    try {
      return await fn();
    } catch (e: any) {
      lastErr = e;
      await sleep(400 * (i + 1));
    }
  }
  throw lastErr;
}

const StoreFront = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const location = useLocation(); // ✅ NEW
  const safeSlug = (slug || "").trim().toLowerCase();

  const { isDarkMode, toggleDarkMode } = useTheme();
  const { t, dir, lang, setLanguage } = useMerchantLang();

  const { user, role } = useAuth() as any; // ✅ NEW

  const [loading, setLoading] = useState(true);
  const [store, setStore] = useState<StorePublic | null>(null);
  const [services, setServices] = useState<ServiceRow[]>([]);
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [error, setError] = useState("");
  const [usingCache, setUsingCache] = useState(false);

  const brandColor = store?.brand_color || "#6366F1";

  // ✅ theme: خده من store.theme_preference واطبّعه على allowed list
  const rawTheme = (store?.theme_preference as any) ?? "grid";
  const normalizedTheme: ThemePreference = THEME_ALLOWED.includes(rawTheme as ThemePreference)
    ? (rawTheme as ThemePreference)
    : "grid";

  const currency: Currency = (store?.currency as Currency) || "SAR";
  const storeName = store?.store_name || t("Store", "المتجر");

  const ui = useMemo(() => uiTokens(isDarkMode), [isDarkMode]);

  // =========================
  // ✅ Cart helpers
  // =========================
  const requireCustomer = () => {
    if (!user) {
      navigate("/signup", { state: { from: location.pathname } });
      return false;
    }
    if (String(role || "").toLowerCase() !== "customer") {
      alert("Please login as a customer to add items to cart.");
      return false;
    }
    return true;
  };

  const handleAddService = async (service: ServiceRow) => {
    if (!store?.id) return;
    if (!requireCustomer()) return;

    await addCartItem({
      merchantId: store.id,
      itemType: "service",
      serviceId: service.id,
      quantity: 1,
      priceSnapshot: Number(service.price ?? 0),
      nameSnapshot: service.name ?? "Service",
    });

    alert("Added to cart");
  };

  const handleAddProduct = async (product: ProductRow) => {
    if (!store?.id) return;
    if (!requireCustomer()) return;

    await addCartItem({
      merchantId: store.id,
      itemType: "product",
      productId: product.id,
      quantity: 1,
      priceSnapshot: Number(product.price ?? 0),
      nameSnapshot: product.name ?? "Product",
    });

    alert("Added to cart");
  };

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      setLoading(true);
      setError("");
      setUsingCache(false);
      setStore(null);
      setServices([]);
      setProducts([]);

      if (!safeSlug) {
        setError(t("Missing slug in URL.", "الرابط غير مكتمل (slug غير موجود)."));
        setLoading(false);
        return;
      }

      // ✅ 0) اقرأ من cache فورًا
      const cachedStore = safeJsonParse<StorePublic>(localStorage.getItem(LS_STORE(safeSlug)));
      if (cachedStore) {
        setStore(cachedStore);
        setUsingCache(true);

        const mid = cachedStore.id;
        const cachedServices = safeJsonParse<ServiceRow[]>(localStorage.getItem(LS_SERVICES(mid)));
        const cachedProducts = safeJsonParse<ProductRow[]>(localStorage.getItem(LS_PRODUCTS(mid)));
        if (cachedServices) setServices(cachedServices);
        if (cachedProducts) setProducts(cachedProducts);
      }

      try {
        // ✅ 1) جيب store من Supabase (Retry + Timeout)
        const storeRow = await retry(async () => {
          return await withTimeout(getPublicStoreBySlug(safeSlug), 7000, "Store fetch");
        }, 3);

        if (cancelled) return;

        if (!storeRow) {
          if (cachedStore) {
            setStore(cachedStore);
            setUsingCache(true);
            setError("");
            return;
          }
          setError(t(`Store not found. (slug: ${safeSlug})`, `المتجر غير موجود. (slug: ${safeSlug})`));
          return;
        }

        // ✅ overwrite store + cache دائمًا
        setStore(storeRow);
        localStorage.setItem(LS_STORE(safeSlug), JSON.stringify(storeRow));
        setUsingCache(false);

        const merchantId = storeRow.id;

        // ✅ 2) جيب items (Retry + Timeout)
        const [svc, prd] = await retry(async () => {
          return await withTimeout(
            Promise.all([getPublicServicesByMerchant(merchantId), getPublicProductsByMerchant(merchantId)]),
            7000,
            "Items fetch"
          );
        }, 3);

        if (cancelled) return;

        setServices(svc || []);
        setProducts(prd || []);

        localStorage.setItem(LS_SERVICES(merchantId), JSON.stringify(svc || []));
        localStorage.setItem(LS_PRODUCTS(merchantId), JSON.stringify(prd || []));
      } catch (e: any) {
        if (cancelled) return;

        if (cachedStore) {
          setStore(cachedStore);
          setUsingCache(true);
          setError("");
        } else {
          setError(e?.message || t("Failed to load store.", "فشل تحميل المتجر."));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [safeSlug, t]);

  const Price = ({ value }: { value: number | null }) => (
    <span className="font-black">
      {(value ?? 0).toFixed(2)} {currency}
    </span>
  );

  if (loading) {
    return (
      <div className={cx(ui.page, "flex items-center justify-center p-8")} dir={dir}>
        <div className={cx(ui.card, "p-10 w-full max-w-xl")}>
          <h2 className={cx("text-2xl font-black", ui.title)}>{t("Loading store...", "جاري تحميل المتجر...")}</h2>
          <p className={cx("mt-2 text-sm", ui.muted)}>slug: {safeSlug || "-"}</p>
          <div className="mt-6 flex items-center gap-3">
            <div
              className={cx(
                "w-6 h-6 border-4 rounded-full animate-spin",
                isDarkMode ? "border-indigo-400 border-t-transparent" : "border-indigo-600 border-t-transparent"
              )}
            />
            <p className={cx("text-[10px] font-black uppercase tracking-[0.22em]", isDarkMode ? "text-indigo-300" : "text-indigo-700")}>
              {t("Fetching data...", "جاري جلب البيانات...")}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !store) {
    return (
      <div className={cx(ui.page, "flex items-center justify-center p-8")} dir={dir}>
        <div className={cx(ui.card, "p-10 w-full max-w-xl")}>
          <h2 className={cx("text-2xl font-black", ui.title)}>{t("Store couldn’t load", "تعذر تحميل المتجر")}</h2>
          <p className={cx("mt-2 text-sm", ui.muted)}>slug: {safeSlug || "-"}</p>

          <pre className={cx("mt-6 whitespace-pre-wrap text-xs font-bold p-4 rounded-2xl", ui.codeBox)}>{error}</pre>

          <div className="mt-6 flex gap-3">
            <button onClick={() => window.location.reload()} className={cx(ui.btnBase, ui.btnPrimary)}>
              {t("Retry", "إعادة المحاولة")}
            </button>
            <button onClick={() => navigate("/")} className={cx(ui.btnBase, ui.btnGhost)}>
              {t("Back", "رجوع")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const SectionTitle = ({ children }: { children: React.ReactNode }) => (
    <h3 className={cx("text-[11px] font-black uppercase tracking-[0.22em]", isDarkMode ? "text-slate-200" : "text-slate-800")}>
      {children}
    </h3>
  );

  const AddBtn = ({ onClick }: { onClick: () => void }) => (
    <button
      onClick={onClick}
      className={cx(ui.btnBase, ui.btnPrimary, "px-4 py-2 text-[10px]")}
      title={t("Add to cart", "إضافة للسلة")}
    >
      <Plus size={16} />
      {t("Add", "إضافة")}
    </button>
  );

  const ItemCard = ({
    title,
    description,
    price,
    onAdd,
  }: {
    title: string;
    description?: string | null;
    price: number | null;
    onAdd: () => void;
  }) => (
    <div className={cx(ui.item, "p-5")}>
      <div className="h-24 rounded-2xl mb-4" style={{ backgroundColor: brandColor + "18" }} />
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className={cx("font-black truncate", isDarkMode ? "text-slate-100" : "text-slate-950")}>
            {title || t("Untitled", "بدون عنوان")}
          </div>
          {description && <div className={cx("mt-1 text-xs truncate", ui.muted)}>{description}</div>}
        </div>

        <div className="shrink-0 text-right">
          <div style={{ color: brandColor }}>
            <Price value={price} />
          </div>
          <div className="mt-3">
            <AddBtn onClick={onAdd} />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className={ui.page} dir={dir}>
      <header className={cx("sticky top-0 z-10", ui.header)}>
        <div className={cx(ui.container, "py-5 flex items-center justify-between gap-4")}>
          <div className="min-w-0">
            <h1 className={cx("text-2xl font-black tracking-tight truncate", ui.title)}>{storeName}</h1>
            <p className={cx("text-[10px] font-black uppercase tracking-[0.22em]", ui.muted)}>/s/{store?.store_slug}</p>

            {usingCache && (
              <div className={cx("mt-2 text-[10px] font-black uppercase tracking-[0.22em]", isDarkMode ? "text-amber-300" : "text-amber-700")}>
                {t("Showing cached data (network unstable)", "يتم عرض بيانات محفوظة (الشبكة غير مستقرة)")}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap justify-end">
            <span className={cx("px-3 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.22em] border", ui.chip)}>
              {t("Theme", "الثيم")}: {normalizedTheme}
            </span>

            <span className={cx("px-3 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.22em] border", ui.chip)}>
              {t("Currency", "العملة")}: {currency}
            </span>

            {/* Language */}
            <button
              onClick={() => setLanguage(lang === "ar" ? "en" : "ar")}
              className={cx(ui.btnBase, ui.btnGhost)}
              title={t("Switch language", "تغيير اللغة")}
            >
              <Languages size={16} />
              {lang === "ar" ? "EN" : "AR"}
            </button>

            {/* Dark/Light */}
            <button onClick={toggleDarkMode} className={cx(ui.btnBase, ui.btnGhost)} title={t("Toggle theme", "تغيير الثيم")}>
              {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
              {isDarkMode ? t("Light", "فاتح") : t("Dark", "داكن")}
            </button>

            {/* Cart */}
            <button onClick={() => navigate("/cart")} className={cx(ui.btnBase, ui.btnPrimary)} title={t("Cart", "السلة")}>
              <ShoppingCart size={16} />
              {t("Cart", "السلة")}
            </button>

            {/* Back */}
            <button onClick={() => navigate(-1)} className={cx(ui.btnBase, ui.btnGhost)} title={t("Back", "رجوع")}>
              <ArrowLeft size={16} />
              {t("Back", "رجوع")}
            </button>
          </div>
        </div>
        <div className="h-1 w-full" style={{ backgroundColor: brandColor }} />
      </header>

      {/* HERO layout */}
      {normalizedTheme === "hero" && (
        <div className={cx(ui.container, "pt-8")}>
          <div className={cx(ui.card, "p-10 overflow-hidden relative")}>
            <div
              className="absolute inset-0 opacity-20"
              style={{ background: `radial-gradient(circle at 30% 20%, ${brandColor}55, transparent 55%)` }}
            />
            <div className="relative">
              <p className={cx("text-[10px] font-black uppercase tracking-[0.22em]", ui.muted)}>{t("Welcome to", "مرحبًا بك في")}</p>
              <h2 className={cx("text-4xl font-black tracking-tighter", ui.title)}>{storeName}</h2>
              <div className={cx("mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-2xl border", isDarkMode ? "bg-slate-950/30 border-slate-900/60" : "bg-white border-slate-200/70")}>
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: brandColor }} />
                <span className={cx("text-[10px] font-black uppercase tracking-[0.22em]", isDarkMode ? "text-slate-200" : "text-slate-800")}>
                  {t("Browse services & products", "تصفح الخدمات والمنتجات")}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      <main className={cx(ui.container, "py-10 space-y-8")}>
        {/* SERVICES */}
        <section className={cx(ui.card, "p-6")}>
          <SectionTitle>{t("Services", "الخدمات")}</SectionTitle>

          {services.length === 0 ? (
            <p className={cx("mt-4 text-sm", ui.muted)}>{t("No services yet.", "لا توجد خدمات بعد.")}</p>
          ) : normalizedTheme === "list" || normalizedTheme === "minimal" ? (
            <div
              className={cx(
                "mt-4 divide-y",
                normalizedTheme === "minimal"
                  ? isDarkMode
                    ? "divide-slate-900/40"
                    : "divide-slate-200/60"
                  : isDarkMode
                  ? "divide-slate-900/60"
                  : "divide-slate-200/70"
              )}
            >
              {services.map((s) => (
                <div key={s.id} className="py-4 flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className={cx(normalizedTheme === "minimal" ? "font-extrabold" : "font-black", isDarkMode ? "text-slate-100" : "text-slate-950", "truncate")}>
                      {s.name || t("Untitled", "بدون عنوان")}
                    </div>
                    {s.description && <div className={cx("mt-1 text-xs truncate", ui.muted)}>{s.description}</div>}
                  </div>

                  <div className="shrink-0 flex items-center gap-3">
                    <div style={{ color: brandColor }}>
                      <Price value={s.price} />
                    </div>
                    <AddBtn onClick={() => handleAddService(s)} />
                  </div>
                </div>
              ))}
            </div>
          ) : normalizedTheme === "cards" ? (
            <div className="mt-4 space-y-4">
              {services.map((s) => (
                <div key={s.id} className={cx(ui.item, "p-6 flex items-center gap-5")}>
                  <div className="w-20 h-20 rounded-3xl" style={{ backgroundColor: brandColor + "18" }} />
                  <div className="flex-1 min-w-0">
                    <div className={cx("font-black truncate", isDarkMode ? "text-slate-100" : "text-slate-950")}>
                      {s.name || t("Untitled", "بدون عنوان")}
                    </div>
                    {s.description && <div className={cx("mt-1 text-sm truncate", ui.muted)}>{s.description}</div>}
                  </div>

                  <div className="shrink-0 text-right">
                    <div style={{ color: brandColor }} className="text-lg">
                      <Price value={s.price} />
                    </div>
                    <div className="mt-3">
                      <AddBtn onClick={() => handleAddService(s)} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : normalizedTheme === "catalog" ? (
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {services.map((s) => (
                <ItemCard
                  key={s.id}
                  title={s.name || t("Untitled", "بدون عنوان")}
                  description={s.description}
                  price={s.price}
                  onAdd={() => handleAddService(s)}
                />
              ))}
            </div>
          ) : (
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {services.map((s) => (
                <ItemCard
                  key={s.id}
                  title={s.name || t("Untitled", "بدون عنوان")}
                  description={s.description}
                  price={s.price}
                  onAdd={() => handleAddService(s)}
                />
              ))}
            </div>
          )}
        </section>

        {/* PRODUCTS */}
        <section className={cx(ui.card, "p-6")}>
          <SectionTitle>{t("Products", "المنتجات")}</SectionTitle>

          {products.length === 0 ? (
            <p className={cx("mt-4 text-sm", ui.muted)}>{t("No products yet.", "لا توجد منتجات بعد.")}</p>
          ) : normalizedTheme === "list" || normalizedTheme === "minimal" ? (
            <div
              className={cx(
                "mt-4 divide-y",
                normalizedTheme === "minimal"
                  ? isDarkMode
                    ? "divide-slate-900/40"
                    : "divide-slate-200/60"
                  : isDarkMode
                  ? "divide-slate-900/60"
                  : "divide-slate-200/70"
              )}
            >
              {products.map((p) => (
                <div key={p.id} className="py-4 flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className={cx(normalizedTheme === "minimal" ? "font-extrabold" : "font-black", isDarkMode ? "text-slate-100" : "text-slate-950", "truncate")}>
                      {p.name || t("Untitled", "بدون عنوان")}
                    </div>
                    {p.description && <div className={cx("mt-1 text-xs truncate", ui.muted)}>{p.description}</div>}
                  </div>

                  <div className="shrink-0 flex items-center gap-3">
                    <div style={{ color: brandColor }}>
                      <Price value={p.price} />
                    </div>
                    <AddBtn onClick={() => handleAddProduct(p)} />
                  </div>
                </div>
              ))}
            </div>
          ) : normalizedTheme === "cards" ? (
            <div className="mt-4 space-y-4">
              {products.map((p) => (
                <div key={p.id} className={cx(ui.item, "p-6 flex items-center gap-5")}>
                  <div className="w-20 h-20 rounded-3xl" style={{ backgroundColor: brandColor + "18" }} />
                  <div className="flex-1 min-w-0">
                    <div className={cx("font-black truncate", isDarkMode ? "text-slate-100" : "text-slate-950")}>
                      {p.name || t("Untitled", "بدون عنوان")}
                    </div>
                    {p.description && <div className={cx("mt-1 text-sm truncate", ui.muted)}>{p.description}</div>}
                  </div>

                  <div className="shrink-0 text-right">
                    <div style={{ color: brandColor }} className="text-lg">
                      <Price value={p.price} />
                    </div>
                    <div className="mt-3">
                      <AddBtn onClick={() => handleAddProduct(p)} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : normalizedTheme === "catalog" ? (
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {products.map((p) => (
                <ItemCard
                  key={p.id}
                  title={p.name || t("Untitled", "بدون عنوان")}
                  description={p.description}
                  price={p.price}
                  onAdd={() => handleAddProduct(p)}
                />
              ))}
            </div>
          ) : (
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((p) => (
                <ItemCard
                  key={p.id}
                  title={p.name || t("Untitled", "بدون عنوان")}
                  description={p.description}
                  price={p.price}
                  onAdd={() => handleAddProduct(p)}
                />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default StoreFront;
