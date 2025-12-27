import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import {
  ArrowRight,
  Palette,
  Layers,
  Layout,
  Sparkles,
  Rows,
  Grid2X2,
  CreditCard,
  Link as LinkIcon,
  BadgeCheck,
  Box,
  PanelsTopLeft,
} from "lucide-react";
import { supabase } from "../../../lib/supabaseClient";

type ThemePreference = "grid" | "list" | "cards" | "minimal" | "hero" | "catalog";
type Currency = "SAR" | "EGP" | "AED" | "USD";

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

const formatMoney = (value: number, currency: Currency) => `${value.toFixed(2)} ${currency}`;

const DEMO_ITEMS = [
  { id: "1", name: "Haircut", desc: "Fresh cut + styling", price: 80 },
  { id: "2", name: "Beard Trim", desc: "Shape & line-up", price: 45 },
  { id: "3", name: "Shampoo", desc: "Premium care product", price: 30 },
  { id: "4", name: "Wax", desc: "Matte finish wax", price: 25 },
  { id: "5", name: "Face Mask", desc: "Glow treatment", price: 55 },
  { id: "6", name: "Skin Serum", desc: "Daily repair", price: 65 },
];

const SetupStore = () => {
  const navigate = useNavigate();
  const { updateProfile } = useAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const [formData, setFormData] = useState<{
    store_name: string;
    store_slug: string;
    theme_preference: ThemePreference;
    brand_color: string;
    currency: Currency;
  }>({
    store_name: "",
    store_slug: "",
    theme_preference: "grid",
    brand_color: "#6366F1",
    currency: "SAR",
  });

  const brandColors = useMemo(
    () => [
      { name: "Indigo", hex: "#6366F1" },
      { name: "Rose", hex: "#F43F5E" },
      { name: "Emerald", hex: "#10B981" },
      { name: "Amber", hex: "#F59E0B" },
      { name: "Sky", hex: "#0EA5E9" },
      { name: "Black", hex: "#111827" },
    ],
    []
  );

  const layouts = useMemo(
    () => [
      {
        id: "grid" as const,
        label: "Modern Grid",
        desc: "Visual & Balanced",
        icon: <Grid2X2 size={18} />,
        preview: (color: string) => (
          <div className="grid grid-cols-3 gap-1 w-12">
            <div className="h-3 rounded-[3px]" style={{ backgroundColor: color }} />
            <div className="h-3 rounded-[3px] bg-gray-200" />
            <div className="h-3 rounded-[3px] bg-gray-200" />
            <div className="h-3 rounded-[3px] bg-gray-200" />
            <div className="h-3 rounded-[3px] bg-gray-200" />
            <div className="h-3 rounded-[3px] bg-gray-200" />
          </div>
        ),
      },
      {
        id: "list" as const,
        label: "Classic List",
        desc: "Clear & Minimal",
        icon: <Rows size={18} />,
        preview: (color: string) => (
          <div className="space-y-1 w-12">
            <div className="h-2 w-full rounded-[3px]" style={{ backgroundColor: color }} />
            <div className="h-2 w-full rounded-[3px] bg-gray-200" />
            <div className="h-2 w-full rounded-[3px] bg-gray-200" />
          </div>
        ),
      },
      {
        id: "cards" as const,
        label: "Elite Cards",
        desc: "Large Previews",
        icon: <CreditCard size={18} />,
        preview: (color: string) => (
          <div className="space-y-1 w-12">
            <div className="h-5 w-full rounded-[3px]" style={{ backgroundColor: color }} />
            <div className="h-3 w-full rounded-[3px] bg-gray-200" />
          </div>
        ),
      },
      {
        id: "minimal" as const,
        label: "Minimal Clean",
        desc: "Text-first + airy",
        icon: <Box size={18} />,
        preview: (color: string) => (
          <div className="w-12">
            <div className="h-2 w-8 rounded-full" style={{ backgroundColor: color }} />
            <div className="mt-2 h-2 w-12 rounded-full bg-gray-200" />
            <div className="mt-1 h-2 w-10 rounded-full bg-gray-200" />
          </div>
        ),
      },
      {
        id: "hero" as const,
        label: "Hero Sections",
        desc: "Landing-like store",
        icon: <PanelsTopLeft size={18} />,
        preview: (color: string) => (
          <div className="w-12 space-y-1">
            <div className="h-4 rounded-[3px]" style={{ backgroundColor: color }} />
            <div className="h-2 rounded-[3px] bg-gray-200" />
            <div className="h-2 rounded-[3px] bg-gray-200" />
          </div>
        ),
      },
      {
        id: "catalog" as const,
        label: "Catalog Split",
        desc: "Sidebar + items",
        icon: <Layout size={18} />,
        preview: (color: string) => (
          <div className="grid grid-cols-4 gap-1 w-12">
            <div className="col-span-1 h-6 rounded-[3px]" style={{ backgroundColor: color }} />
            <div className="col-span-3 h-2 rounded-[3px] bg-gray-200" />
            <div className="col-span-3 h-2 rounded-[3px] bg-gray-200" />
          </div>
        ),
      },
    ],
    []
  );

  const isSlugAvailable = async (slug: string) => {
    if (!slug || slug.length < 3) return false;

    const { data, error } = await supabase.from("users").select("id").eq("store_slug", slug).limit(1);

    // لو RLS مانع القراءة، مش هنوقفك
    if (error) {
      console.warn("Slug availability check warning:", error.message);
      return true;
    }
    return !data || data.length === 0;
  };

  const validate = () => {
    const name = formData.store_name.trim();
    if (!name) return "Store name is required.";
    const slug = slugify(formData.store_slug || name);
    if (!slug || slug.length < 3) return "Store link must be at least 3 characters.";
    return "";
  };

  const handleCompleteSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const v = validate();
    if (v) return setError(v);

    const storeName = formData.store_name.trim();
    const slug = slugify(formData.store_slug || storeName);

    setLoading(true);
    try {
      const available = await isSlugAvailable(slug);
      if (!available) {
        setError("This store link is already taken. Try a different store name.");
        return;
      }

      const res = await updateProfile({
        store_name: storeName,
        store_slug: slug,
        theme_preference: formData.theme_preference,
        brand_color: formData.brand_color,
        currency: formData.currency,
        setup_complete: true,
      });

      if (res?.error) throw new Error(res.error);

      localStorage.setItem("servly_setup_done", "true");
      navigate("/merchant", { replace: true });
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Failed to save.");
    } finally {
      setLoading(false);
    }
  };

  const brand = formData.brand_color;
  const theme = formData.theme_preference;
  const currency = formData.currency;
  const storeName = formData.store_name || "Store Name";
  const slug = formData.store_slug || slugify(formData.store_name || "your-store");

  // ========== PREVIEW PARTS ==========
  const PreviewHeader = () => (
    <div className="p-5 text-white" style={{ backgroundColor: brand }}>
      <div className="flex items-center justify-between">
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-[0.25em] opacity-90">Store</p>
          <p className="text-lg font-black tracking-tight truncate">{storeName}</p>
          <p className="text-[10px] font-black uppercase tracking-[0.22em] opacity-90 mt-1 truncate">
            /s/{slug || "your-store"}
          </p>
        </div>
        <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center font-black">
          {(storeName?.charAt(0) || "S").toUpperCase()}
        </div>
      </div>
    </div>
  );

  const PreviewGrid = () => (
    <div className="p-5 grid grid-cols-2 gap-3">
      {DEMO_ITEMS.slice(0, 6).map((it) => (
        <div key={it.id} className="rounded-2xl border border-gray-100 bg-white overflow-hidden">
          <div className="h-16" style={{ backgroundColor: brand + "22" }} />
          <div className="p-3">
            <p className="font-black text-[12px] text-gray-900 truncate">{it.name}</p>
            <p className="text-[10px] font-bold text-gray-400 mt-1 truncate">{it.desc}</p>
            <p className="text-[11px] font-black mt-2" style={{ color: brand }}>
              {formatMoney(it.price, currency)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );

  const PreviewList = () => (
    <div className="p-5 space-y-3">
      {DEMO_ITEMS.slice(0, 5).map((it) => (
        <div key={it.id} className="flex items-start justify-between gap-3 p-4 rounded-2xl border border-gray-100 bg-white">
          <div className="min-w-0">
            <p className="font-black text-[13px] text-gray-900 truncate">{it.name}</p>
            <p className="text-[10px] font-bold text-gray-400 mt-1 truncate">{it.desc}</p>
          </div>
          <div className="text-[12px] font-black shrink-0" style={{ color: brand }}>
            {formatMoney(it.price, currency)}
          </div>
        </div>
      ))}
    </div>
  );

  const PreviewCards = () => (
    <div className="p-5 space-y-3">
      {DEMO_ITEMS.slice(0, 4).map((it) => (
        <div key={it.id} className="rounded-3xl border border-gray-100 bg-white overflow-hidden">
          <div className="h-20" style={{ backgroundColor: brand + "22" }} />
          <div className="p-4 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="font-black text-[13px] text-gray-900 truncate">{it.name}</p>
              <p className="text-[10px] font-bold text-gray-400 mt-1 truncate">{it.desc}</p>
            </div>
            <div className="text-[12px] font-black shrink-0" style={{ color: brand }}>
              {formatMoney(it.price, currency)}
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const PreviewMinimal = () => (
    <div className="p-6 bg-white">
      <p className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-400">Featured</p>
      <p className="text-xl font-black tracking-tight text-gray-900 mt-2">Premium Picks</p>
      <p className="text-[11px] font-bold text-gray-400 mt-2 leading-relaxed">
        Minimal layout focuses on text, pricing, and clarity.
      </p>

      <div className="mt-5 space-y-3">
        {DEMO_ITEMS.slice(0, 4).map((it) => (
          <div key={it.id} className="flex items-start justify-between gap-4 pb-3 border-b border-gray-100">
            <div className="min-w-0">
              <p className="font-black text-[13px] text-gray-900 truncate">{it.name}</p>
              <p className="text-[10px] font-bold text-gray-400 mt-1 truncate">{it.desc}</p>
            </div>
            <div className="text-[12px] font-black shrink-0" style={{ color: brand }}>
              {formatMoney(it.price, currency)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const PreviewHero = () => (
    <div className="bg-white">
      <div className="p-6">
        <div className="rounded-3xl p-5 text-white" style={{ backgroundColor: brand }}>
          <p className="text-[10px] font-black uppercase tracking-[0.25em] opacity-90">Welcome</p>
          <p className="text-xl font-black tracking-tight mt-1">Book in seconds</p>
          <p className="text-[11px] font-bold opacity-90 mt-2">Hero style storefront layout.</p>
          <button
            type="button"
            className="mt-4 w-full h-10 rounded-2xl font-black text-xs uppercase tracking-widest bg-white text-gray-900"
          >
            Explore
          </button>
        </div>

        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-400 mt-6">Popular</p>
        <div className="mt-3 grid grid-cols-2 gap-3">
          {DEMO_ITEMS.slice(0, 4).map((it) => (
            <div key={it.id} className="rounded-2xl border border-gray-100 bg-white overflow-hidden">
              <div className="h-14" style={{ backgroundColor: brand + "22" }} />
              <div className="p-3">
                <p className="font-black text-[12px] text-gray-900 truncate">{it.name}</p>
                <p className="text-[11px] font-black mt-2" style={{ color: brand }}>
                  {formatMoney(it.price, currency)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const PreviewCatalog = () => (
    <div className="p-5">
      <div className="grid grid-cols-5 gap-3">
        <div className="col-span-2 rounded-2xl border border-gray-100 bg-white p-4">
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-400">Categories</p>
          <div className="mt-3 space-y-2">
            {["Services", "Products", "Offers", "New"].map((c) => (
              <div
                key={c}
                className="h-9 rounded-xl flex items-center px-3 text-[11px] font-black"
                style={{ backgroundColor: c === "Services" ? brand + "22" : "#F3F4F6", color: "#111827" }}
              >
                {c}
              </div>
            ))}
          </div>
        </div>

        <div className="col-span-3 space-y-3">
          {DEMO_ITEMS.slice(0, 4).map((it) => (
            <div key={it.id} className="rounded-2xl border border-gray-100 bg-white p-4 flex items-start justify-between">
              <div className="min-w-0">
                <p className="font-black text-[13px] text-gray-900 truncate">{it.name}</p>
                <p className="text-[10px] font-bold text-gray-400 mt-1 truncate">{it.desc}</p>
              </div>
              <div className="text-[12px] font-black shrink-0" style={{ color: brand }}>
                {formatMoney(it.price, currency)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const PreviewBody = () => {
    if (theme === "list") return <PreviewList />;
    if (theme === "cards") return <PreviewCards />;
    if (theme === "minimal") return <PreviewMinimal />;
    if (theme === "hero") return <PreviewHero />;
    if (theme === "catalog") return <PreviewCatalog />;
    return <PreviewGrid />;
  };

  // ========== UI ==========
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col lg:flex-row font-sans" dir="ltr">
      {/* LEFT */}
      <div className="flex-1 p-8 md:p-12 lg:p-16 overflow-y-auto">
        <div className="max-w-2xl mx-auto space-y-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center text-white shadow-xl rotate-3">
              <Sparkles size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-gray-900 uppercase leading-none">
                Storefront Editor
              </h1>
              <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] mt-2">
                Choose UI layout, color, and currency
              </p>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 p-4 rounded-xl text-xs font-bold border border-red-100">
              {error}
            </div>
          )}

          <form onSubmit={handleCompleteSetup} className="space-y-10">
            {/* 01 */}
            <div className="space-y-4">
              <label className="text-[11px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-2">
                <Layers size={14} /> 01. Identity & Currency
              </label>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  required
                  className="w-full p-4 bg-white rounded-xl font-bold border-2 border-transparent focus:border-black shadow-sm transition-all outline-none"
                  placeholder="Store Name"
                  value={formData.store_name}
                  onChange={(e) => {
                    const name = e.target.value;
                    setFormData((prev) => ({
                      ...prev,
                      store_name: name,
                      store_slug: prev.store_slug ? prev.store_slug : slugify(name),
                    }));
                  }}
                />

                <select
                  className="w-full p-4 bg-white rounded-xl font-bold border-2 border-transparent focus:border-black shadow-sm outline-none appearance-none"
                  value={formData.currency}
                  onChange={(e) => setFormData((prev) => ({ ...prev, currency: e.target.value as Currency }))}
                >
                  <option value="SAR">🇸🇦 Saudi Riyal (SAR)</option>
                  <option value="EGP">🇪🇬 Egyptian Pound (EGP)</option>
                  <option value="AED">🇦🇪 UAE Dirham (AED)</option>
                  <option value="USD">🇺🇸 US Dollar (USD)</option>
                </select>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <div className="relative">
                  <LinkIcon size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                  <input
                    required
                    className="w-full pl-10 pr-4 py-4 bg-white rounded-xl font-bold border-2 border-transparent focus:border-black shadow-sm transition-all outline-none"
                    placeholder="Store Link (slug) e.g. my-store"
                    value={formData.store_slug}
                    onChange={(e) => setFormData((prev) => ({ ...prev, store_slug: slugify(e.target.value) }))}
                  />
                </div>

                <div className="flex items-center justify-between gap-3 text-[10px] font-bold">
                  <p className="text-gray-400">
                    Public link: <span className="text-gray-700">/s/{slug || "your-store"}</span>
                  </p>
                  <div className="flex items-center gap-2 text-emerald-600">
                    <BadgeCheck size={14} />
                    <span className="uppercase tracking-widest font-black">Live Preview</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 02 */}
            <div className="space-y-4">
              <label className="text-[11px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-2">
                <Layout size={14} /> 02. Store Layout (6 options)
              </label>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {layouts.map((l) => (
                  <button
                    key={l.id}
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, theme_preference: l.id }))}
                    className={`p-5 rounded-2xl border-2 transition-all flex flex-col items-center text-center gap-4 ${
                      formData.theme_preference === l.id
                        ? "border-black bg-white shadow-lg scale-[1.02]"
                        : "border-gray-100 bg-gray-50 hover:border-gray-200"
                    }`}
                  >
                    <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-white border border-gray-100 shadow-sm">
                      {l.icon}
                    </div>

                    {l.preview(formData.brand_color)}

                    <div>
                      <p className="text-[10px] font-black text-gray-900 uppercase leading-none">{l.label}</p>
                      <p className="text-[8px] font-bold text-gray-400 uppercase mt-1">{l.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* 03 */}
            <div className="space-y-4">
              <label className="text-[11px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-2">
                <Palette size={14} /> 03. Brand Color
              </label>

              <div className="flex flex-wrap gap-3 p-4 bg-white rounded-2xl shadow-sm border border-gray-50">
                {brandColors.map((c) => (
                  <button
                    key={c.hex}
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, brand_color: c.hex }))}
                    className={`w-10 h-10 rounded-full transition-all border-4 ${
                      formData.brand_color === c.hex ? "border-black scale-110 shadow-md" : "border-transparent"
                    }`}
                    style={{ backgroundColor: c.hex }}
                    aria-label={`Pick ${c.name}`}
                    title={c.name}
                  />
                ))}

                <div className="ml-auto flex items-center gap-2">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Custom</span>
                  <input
                    type="color"
                    value={formData.brand_color}
                    onChange={(e) => setFormData((prev) => ({ ...prev, brand_color: e.target.value }))}
                    className="w-10 h-10 rounded-xl border border-gray-200 bg-white"
                    title="Pick custom color"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-5 bg-black text-white rounded-2xl font-black text-sm tracking-[0.2em] shadow-2xl hover:bg-gray-800 transition-all flex items-center justify-center gap-4 disabled:opacity-50"
            >
              {loading ? "SAVING DATA..." : <>FINISH SETUP <ArrowRight size={20} /></>}
            </button>
          </form>
        </div>
      </div>

      {/* RIGHT */}
      <div className="hidden lg:flex flex-1 bg-gray-100 items-center justify-center p-12 border-l border-gray-200">
        <div className="w-full max-w-[320px] aspect-[9/19] bg-gray-900 rounded-[3rem] p-3 shadow-2xl border-[8px] border-gray-800 relative">
          <div className="w-full h-full rounded-[2.2rem] overflow-hidden flex flex-col bg-white">
            <PreviewHeader />

            <div className="flex-1 overflow-y-auto bg-[#F7F8FC]">
              <div className="px-5 pt-4 flex items-center justify-between">
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-gray-400">
                  Layout: <span className="text-gray-700">{theme}</span>
                </p>
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-gray-400">
                  Currency: <span className="text-gray-700">{currency}</span>
                </p>
              </div>

              <PreviewBody />
            </div>

            <div className="p-4 border-t border-gray-100 bg-white">
              <button
                type="button"
                className="w-full h-10 rounded-2xl font-black text-xs uppercase tracking-widest text-white shadow-lg"
                style={{ backgroundColor: brand }}
              >
                Book Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SetupStore;
