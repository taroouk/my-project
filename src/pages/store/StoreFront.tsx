import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Currency,
  // ✅ توسعة ThemePreference هنا (بدون ما نلعب في أي حاجة ثانية)
  StorePublic,
  ServiceRow,
  ProductRow,
  getPublicStoreBySlug,
  getPublicServicesByMerchant,
  getPublicProductsByMerchant,
  withTimeout,
} from "../../lib/supabaseClient";

type ThemePreference = "grid" | "list" | "cards" | "minimal" | "hero" | "catalog";

const LS_STORE = (slug: string) => `servly_cache_store_${slug}`;
const LS_SERVICES = (merchantId: string) => `servly_cache_services_${merchantId}`;
const LS_PRODUCTS = (merchantId: string) => `servly_cache_products_${merchantId}`;

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
      // backoff بسيط: 400ms, 800ms, 1200ms
      await sleep(400 * (i + 1));
    }
  }
  throw lastErr;
}

const StoreFront = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const safeSlug = (slug || "").trim().toLowerCase();

  const [loading, setLoading] = useState(true);
  const [store, setStore] = useState<StorePublic | null>(null);
  const [services, setServices] = useState<ServiceRow[]>([]);
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [error, setError] = useState("");
  const [usingCache, setUsingCache] = useState(false);

  const brandColor = store?.brand_color || "#6366F1";

  // ✅ هنا بس: بدل ما نخليها 3، نخليها 6 + fallback محترم
  const theme = (store?.theme_preference as ThemePreference) || "grid";
  const normalizedTheme: ThemePreference = ((): ThemePreference => {
    const allowed: ThemePreference[] = ["grid", "list", "cards", "minimal", "hero", "catalog"];
    return allowed.includes(theme) ? theme : "grid";
  })();

  const currency: Currency = (store?.currency as Currency) || "SAR";
  const storeName = store?.store_name || "Store";

  const ui = useMemo(
    () => ({
      page: "min-h-screen bg-[#F8FAFC] text-slate-900",
      card: "bg-white border border-slate-100 rounded-3xl shadow-sm",
      muted: "text-slate-500",
      title: "text-slate-900",
      chip: "bg-slate-100 text-slate-700",
      btn: "rounded-2xl font-black text-xs uppercase tracking-widest px-5 py-3 transition",
    }),
    []
  );

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
        setError("Missing slug in URL.");
        setLoading(false);
        return;
      }

      // ✅ 0) حاول تفتح من cache فورًا (عشان مفيش Loading طويل)
      const cachedStore = safeJsonParse<StorePublic>(localStorage.getItem(LS_STORE(safeSlug)));
      if (cachedStore) {
        setStore(cachedStore);
        setUsingCache(true);

        // لو عندنا merchantId من cache، هات items من cache برضو
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
          // لو مفيش store على Supabase و عندك cache، هنكمل بالكاش
          if (cachedStore) {
            setStore(cachedStore);
            setUsingCache(true);
            setError("");
            return;
          }
          setError(`Store not found. (slug: ${safeSlug})`);
          return;
        }

        setStore(storeRow);
        localStorage.setItem(LS_STORE(safeSlug), JSON.stringify(storeRow));
        setUsingCache(false);

        const merchantId = storeRow.id;

        // ✅ 2) جيب services/products للتاجر ده فقط (Retry + Timeout)
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

        // ✅ خزّنهم كاش
        localStorage.setItem(LS_SERVICES(merchantId), JSON.stringify(svc || []));
        localStorage.setItem(LS_PRODUCTS(merchantId), JSON.stringify(prd || []));
      } catch (e: any) {
        if (cancelled) return;

        // ✅ لو فشل Supabase — استخدم cache بدل ما تفضل Loading
        if (cachedStore) {
          setStore(cachedStore);
          setUsingCache(true);
          setError("");
        } else {
          setError(e?.message || "Failed to load store.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [safeSlug]);

  const Price = ({ value }: { value: number | null }) => (
    <span className="font-black">
      {(value ?? 0).toFixed(2)} {currency}
    </span>
  );

  if (loading) {
    return (
      <div className={`${ui.page} flex items-center justify-center p-8`} dir="ltr">
        <div className={`${ui.card} p-10 w-full max-w-xl`}>
          <h2 className={`text-2xl font-black ${ui.title}`}>Loading store...</h2>
          <p className={`mt-2 text-sm ${ui.muted}`}>slug: {safeSlug || "-"}</p>
          <div className="mt-6 flex items-center gap-3">
            <div className="w-6 h-6 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-[10px] font-black uppercase tracking-widest text-indigo-600">Fetching data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !store) {
    return (
      <div className={`${ui.page} flex items-center justify-center p-8`} dir="ltr">
        <div className={`${ui.card} p-10 w-full max-w-xl`}>
          <h2 className={`text-2xl font-black ${ui.title}`}>Store couldn’t load</h2>
          <p className={`mt-2 text-sm ${ui.muted}`}>slug: {safeSlug || "-"}</p>

          <pre className="mt-6 whitespace-pre-wrap text-xs font-bold text-rose-700 bg-rose-50 border border-rose-100 p-4 rounded-2xl">
            {error}
          </pre>

          <div className="mt-6 flex gap-3">
            <button onClick={() => window.location.reload()} className={`${ui.btn} bg-black text-white`}>
              Retry
            </button>
            <button
              onClick={() => navigate("/")}
              className={`${ui.btn} bg-white border border-slate-200 text-slate-700 hover:bg-slate-50`}
            >
              Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ✅ Helper UI bits for the new layouts (بس Rendering)
  const SectionTitle = ({ children }: { children: React.ReactNode }) => (
    <h3 className="text-sm font-black uppercase tracking-widest text-slate-700">{children}</h3>
  );

  const ItemCard = ({
    title,
    description,
    price,
  }: {
    title: string;
    description?: string | null;
    price: number | null;
  }) => (
    <div className="bg-white border border-slate-100 rounded-2xl p-5">
      <div className="h-24 rounded-2xl mb-4" style={{ backgroundColor: brandColor + "18" }} />
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="font-black text-slate-900">{title || "Untitled"}</div>
          {description && <div className={`mt-1 text-xs ${ui.muted}`}>{description}</div>}
        </div>
        <div style={{ color: brandColor }} className="shrink-0">
          <Price value={price} />
        </div>
      </div>
    </div>
  );

  return (
    <div className={`${ui.page}`} dir="ltr">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-2xl font-black tracking-tight truncate">{storeName}</h1>
            <p className={`text-[10px] font-black uppercase tracking-widest ${ui.muted}`}>/s/{store?.store_slug}</p>

            {usingCache && (
              <div className="mt-2 text-[10px] font-black uppercase tracking-widest text-amber-600">
                Showing cached data (network unstable)
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <span className={`px-3 py-2 rounded-2xl text-[10px] font-black uppercase ${ui.chip}`}>
              Theme: {normalizedTheme}
            </span>
            <span className={`px-3 py-2 rounded-2xl text-[10px] font-black uppercase ${ui.chip}`}>
              Currency: {currency}
            </span>
            <button
              onClick={() => navigate(-1)}
              className={`${ui.btn} bg-white border border-slate-200 text-slate-700 hover:bg-slate-50`}
            >
              Back
            </button>
          </div>
        </div>
        <div className="h-1 w-full" style={{ backgroundColor: brandColor }} />
      </header>

      {/* ✅ HERO layout: بس Header section زيادة (Rendering فقط) */}
      {normalizedTheme === "hero" && (
        <div className="max-w-6xl mx-auto px-6 pt-8">
          <div className={`${ui.card} p-10 overflow-hidden relative`}>
            <div
              className="absolute inset-0 opacity-20"
              style={{
                background: `radial-gradient(circle at 30% 20%, ${brandColor}55, transparent 55%)`,
              }}
            />
            <div className="relative">
              <p className={`text-[10px] font-black uppercase tracking-widest ${ui.muted}`}>Welcome to</p>
              <h2 className={`text-4xl font-black tracking-tighter ${ui.title}`}>{storeName}</h2>
              <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white border border-slate-100">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: brandColor }} />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-700">
                  Browse services & products
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-6xl mx-auto px-6 py-10 space-y-8">
        {/* SERVICES */}
        <section className={`${ui.card} p-6`}>
          <SectionTitle>Services</SectionTitle>

          {services.length === 0 ? (
            <p className={`mt-4 text-sm ${ui.muted}`}>No services yet.</p>
          ) : normalizedTheme === "list" || normalizedTheme === "minimal" ? (
            // ✅ list + minimal: نفس روح list (minimal أخف شوية)
            <div className={`mt-4 divide-y ${normalizedTheme === "minimal" ? "divide-slate-50" : "divide-slate-100"}`}>
              {services.map((s) => (
                <div key={s.id} className="py-4 flex items-start justify-between gap-4">
                  <div>
                    <div className={`${normalizedTheme === "minimal" ? "font-extrabold" : "font-black"} text-slate-900`}>
                      {s.name || "Untitled"}
                    </div>
                    {s.description && <div className={`mt-1 text-xs ${ui.muted}`}>{s.description}</div>}
                  </div>
                  <div style={{ color: brandColor }} className="shrink-0">
                    <Price value={s.price} />
                  </div>
                </div>
              ))}
            </div>
          ) : normalizedTheme === "cards" ? (
            // ✅ cards
            <div className="mt-4 space-y-4">
              {services.map((s) => (
                <div key={s.id} className="bg-white border border-slate-100 rounded-2xl p-6 flex items-center gap-5">
                  <div className="w-20 h-20 rounded-3xl" style={{ backgroundColor: brandColor + "18" }} />
                  <div className="flex-1">
                    <div className="font-black text-slate-900">{s.name || "Untitled"}</div>
                    {s.description && <div className={`mt-1 text-sm ${ui.muted}`}>{s.description}</div>}
                  </div>
                  <div style={{ color: brandColor }} className="text-lg shrink-0">
                    <Price value={s.price} />
                  </div>
                </div>
              ))}
            </div>
          ) : normalizedTheme === "catalog" ? (
            // ✅ catalog: grid أكتر كثافة
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {services.map((s) => (
                <ItemCard key={s.id} title={s.name || "Untitled"} description={s.description} price={s.price} />
              ))}
            </div>
          ) : (
            // ✅ grid + hero fallback
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {services.map((s) => (
                <ItemCard key={s.id} title={s.name || "Untitled"} description={s.description} price={s.price} />
              ))}
            </div>
          )}
        </section>

        {/* PRODUCTS */}
        <section className={`${ui.card} p-6`}>
          <SectionTitle>Products</SectionTitle>

          {products.length === 0 ? (
            <p className={`mt-4 text-sm ${ui.muted}`}>No products yet.</p>
          ) : normalizedTheme === "list" || normalizedTheme === "minimal" ? (
            <div className={`mt-4 divide-y ${normalizedTheme === "minimal" ? "divide-slate-50" : "divide-slate-100"}`}>
              {products.map((p) => (
                <div key={p.id} className="py-4 flex items-start justify-between gap-4">
                  <div>
                    <div className={`${normalizedTheme === "minimal" ? "font-extrabold" : "font-black"} text-slate-900`}>
                      {p.name || "Untitled"}
                    </div>
                    {p.description && <div className={`mt-1 text-xs ${ui.muted}`}>{p.description}</div>}
                  </div>
                  <div style={{ color: brandColor }} className="shrink-0">
                    <Price value={p.price} />
                  </div>
                </div>
              ))}
            </div>
          ) : normalizedTheme === "cards" ? (
            <div className="mt-4 space-y-4">
              {products.map((p) => (
                <div key={p.id} className="bg-white border border-slate-100 rounded-2xl p-6 flex items-center gap-5">
                  <div className="w-20 h-20 rounded-3xl" style={{ backgroundColor: brandColor + "18" }} />
                  <div className="flex-1">
                    <div className="font-black text-slate-900">{p.name || "Untitled"}</div>
                    {p.description && <div className={`mt-1 text-sm ${ui.muted}`}>{p.description}</div>}
                  </div>
                  <div style={{ color: brandColor }} className="text-lg shrink-0">
                    <Price value={p.price} />
                  </div>
                </div>
              ))}
            </div>
          ) : normalizedTheme === "catalog" ? (
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {products.map((p) => (
                <ItemCard key={p.id} title={p.name || "Untitled"} description={p.description} price={p.price} />
              ))}
            </div>
          ) : (
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((p) => (
                <ItemCard key={p.id} title={p.name || "Untitled"} description={p.description} price={p.price} />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default StoreFront;
