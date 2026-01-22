import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Trash2, Minus, Plus, ShoppingBag, ArrowLeft, RefreshCcw, CheckCircle2 } from "lucide-react";

import { supabase } from "../../lib/supabaseClient";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import { useMerchantLang } from "../dashboard/merchant/useMerchantLang";

type CartRow = {
  id: string;
  customer_id: string;
  status: "active" | "checked_out" | "abandoned" | string;
  created_at: string;
  updated_at: string;
};

type CartItemRow = {
  id: string;
  cart_id: string;
  merchant_id: string;
  item_type: "service" | "product" | string;
  service_id: string | null;
  product_id: string | null;
  quantity: number;
  price_snapshot: number;
  name_snapshot: string | null;
  created_at: string;
};

type MerchantMeta = {
  id: string;
  store_name: string | null;
  store_slug: string | null;
  currency: string | null;
};

const cx = (...classes: Array<string | false | null | undefined>) => classes.filter(Boolean).join(" ");

function money(n: number) {
  const v = Number.isFinite(n) ? n : 0;
  return v.toFixed(2);
}

export default function CartPage() {
  const navigate = useNavigate();
  const { user, role } = useAuth() as any;
  const { isDarkMode } = useTheme();
  const { t, dir, lang, setLanguage } = useMerchantLang();

  const userId = user?.id;

  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string>(""); // action key
  const [error, setError] = useState<string>("");

  const [cart, setCart] = useState<CartRow | null>(null);
  const [items, setItems] = useState<CartItemRow[]>([]);
  const [merchant, setMerchant] = useState<MerchantMeta | null>(null);

  const [notes, setNotes] = useState("");
  const [checkoutId, setCheckoutId] = useState<string>("");

  const requireCustomer = () => {
    if (!userId) {
      navigate("/signup", { state: { from: "/cart" } });
      return false;
    }
    if (String(role || "").toLowerCase() !== "customer") {
      alert(t("Please login as a customer to use the cart.", "من فضلك سجل دخول كعميل لاستخدام السلة."));
      return false;
    }
    return true;
  };

  const ui = useMemo(() => {
    if (isDarkMode) {
      return {
        page: "min-h-screen bg-[#0B1220] text-slate-100",
        header: "bg-slate-950/40 border-b border-slate-900/60 backdrop-blur",
        card: "bg-slate-950/40 border border-slate-900/60 rounded-3xl shadow-[0_10px_30px_-20px_rgba(0,0,0,0.6)]",
        cardSoft: "bg-slate-950/30 border border-slate-900/50 rounded-3xl",
        muted: "text-slate-400",
        title: "text-slate-50",
        chip: "bg-slate-900/40 text-slate-200 border border-slate-800",
        btn: "rounded-2xl font-black text-xs uppercase tracking-widest px-5 py-3 transition",
        btnGhost: "bg-slate-900/30 border border-slate-800 text-slate-200 hover:bg-slate-900/50",
        btnPrimary: "bg-white text-slate-900 hover:bg-slate-100",
        divider: "border-slate-900/60",
        input:
          "w-full rounded-2xl px-4 py-3 text-sm font-bold outline-none bg-slate-950/35 border border-slate-900/60 text-slate-100 placeholder:text-slate-500 focus:border-indigo-500/60",
        danger:
          "bg-rose-500/15 border border-rose-500/25 text-rose-200 hover:bg-rose-500/20",
      };
    }
    return {
      page: "min-h-screen bg-[#F8FAFC] text-slate-900",
      header: "bg-white/80 border-b border-slate-100 backdrop-blur",
      card: "bg-white border border-slate-100 rounded-3xl shadow-sm",
      cardSoft: "bg-white border border-slate-100 rounded-3xl shadow-sm",
      muted: "text-slate-500",
      title: "text-slate-900",
      chip: "bg-slate-100 text-slate-700",
      btn: "rounded-2xl font-black text-xs uppercase tracking-widest px-5 py-3 transition",
      btnGhost: "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50",
      btnPrimary: "bg-black text-white hover:bg-slate-800",
      divider: "border-slate-100",
      input:
        "w-full rounded-2xl px-4 py-3 text-sm font-bold outline-none bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-indigo-500/60",
      danger:
        "bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100",
    };
  }, [isDarkMode]);

  const currency = merchant?.currency || "SAR";
  const merchantName = merchant?.store_name || t("Merchant", "التاجر");
  const merchantSlug = merchant?.store_slug || "";

  const totals = useMemo(() => {
    const itemsCount = items.reduce((acc, it) => acc + (it.quantity || 0), 0);
    const total = items.reduce((acc, it) => acc + (Number(it.price_snapshot || 0) * Number(it.quantity || 0)), 0);
    return { itemsCount, total };
  }, [items]);

  const load = async () => {
    setLoading(true);
    setError("");
    setCheckoutId("");

    if (!requireCustomer()) {
      setLoading(false);
      return;
    }

    try {
      // 1) get active cart
      const { data: cartRows, error: cartErr } = await supabase
        .from("carts")
        .select("id, customer_id, status, created_at, updated_at")
        .eq("customer_id", userId)
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(1);

      if (cartErr) throw new Error(cartErr.message);

      const activeCart = (cartRows?.[0] as any) as CartRow | undefined;
      if (!activeCart) {
        setCart(null);
        setItems([]);
        setMerchant(null);
        return;
      }

      setCart(activeCart);

      // 2) get items
      const { data: itemsRows, error: itemsErr } = await supabase
        .from("cart_items")
        .select("id, cart_id, merchant_id, item_type, service_id, product_id, quantity, price_snapshot, name_snapshot, created_at")
        .eq("cart_id", activeCart.id)
        .order("created_at", { ascending: false });

      if (itemsErr) throw new Error(itemsErr.message);

      const list = ((itemsRows as any) || []) as CartItemRow[];
      setItems(list);

      // 3) merchant meta (currency + store_name + slug) from first item merchant_id
      const mid = list?.[0]?.merchant_id;
      if (mid) {
        const { data: m, error: mErr } = await supabase
          .from("users")
          .select("id, store_name, store_slug, currency")
          .eq("id", mid)
          .maybeSingle();

        if (mErr) throw new Error(mErr.message);
        setMerchant((m as any) || null);
      } else {
        setMerchant(null);
      }
    } catch (e: any) {
      setError(e?.message || t("Failed to load cart.", "فشل تحميل السلة."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const updateQty = async (itemId: string, nextQty: number) => {
    if (!cart) return;
    if (nextQty < 1) return;

    setBusy(`qty:${itemId}`);
    setError("");

    try {
      const { error: upErr } = await supabase
        .from("cart_items")
        .update({ quantity: nextQty })
        .eq("id", itemId);

      if (upErr) throw new Error(upErr.message);

      setItems((prev) => prev.map((it) => (it.id === itemId ? { ...it, quantity: nextQty } : it)));
    } catch (e: any) {
      setError(e?.message || t("Failed to update quantity.", "فشل تحديث الكمية."));
    } finally {
      setBusy("");
    }
  };

  const removeItem = async (itemId: string) => {
    if (!cart) return;

    setBusy(`rm:${itemId}`);
    setError("");

    try {
      const { error: delErr } = await supabase
        .from("cart_items")
        .delete()
        .eq("id", itemId);

      if (delErr) throw new Error(delErr.message);

      setItems((prev) => prev.filter((it) => it.id !== itemId));
    } catch (e: any) {
      setError(e?.message || t("Failed to remove item.", "فشل حذف العنصر."));
    } finally {
      setBusy("");
    }
  };

  const checkout = async () => {
    if (!cart?.id) return;
    if (!requireCustomer()) return;

    setBusy("checkout");
    setError("");
    setCheckoutId("");

    try {
      // ✅ IMPORTANT: send params with correct keys (p_cart_id, p_notes)
      const { data, error: rpcErr } = await supabase.rpc("checkout_cart", {
        p_cart_id: cart.id,
        p_notes: notes?.trim() ? notes.trim() : null,
      });

      if (rpcErr) throw new Error(rpcErr.message);

      setCheckoutId(String(data || ""));
      // refresh cart after checkout (it becomes checked_out)
      await load();
    } catch (e: any) {
      setError(
        e?.message ||
          t(
            "Checkout failed. Make sure you are logged in as customer and RLS allows checkout.",
            "فشل إرسال الطلب. تأكد أنك مسجل كعميل وأن RLS يسمح بعملية الـ checkout."
          )
      );
    } finally {
      setBusy("");
    }
  };

  // ---------- UI ----------
  if (loading) {
    return (
      <div className={ui.page} dir={dir}>
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className={cx(ui.card, "p-10")}>
            <div className="flex items-center gap-3">
              <div
                className={cx(
                  "w-6 h-6 border-4 border-t-transparent rounded-full animate-spin",
                  isDarkMode ? "border-indigo-400" : "border-indigo-600"
                )}
              />
              <p className={cx("text-[10px] font-black uppercase tracking-widest", isDarkMode ? "text-indigo-300" : "text-indigo-600")}>
                {t("Loading cart...", "جاري تحميل السلة...")}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const Empty = () => (
    <div className={ui.page} dir={dir}>
      <header className={cx("sticky top-0 z-10", ui.header)}>
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <h1 className={cx("text-2xl font-black tracking-tight truncate", ui.title)}>
              {t("Cart", "السلة")}
            </h1>
            <p className={cx("text-[10px] font-black uppercase tracking-widest", ui.muted)}>/cart</p>
          </div>

          <div className="flex items-center gap-2 flex-wrap justify-end">
            <button
              onClick={() => setLanguage(lang === "ar" ? "en" : "ar")}
              className={cx(ui.btn, ui.btnGhost, "px-4 py-2")}
              title={t("Switch language", "تغيير اللغة")}
            >
              {lang === "ar" ? "EN" : "AR"}
            </button>
            <button onClick={() => navigate(-1)} className={cx(ui.btn, ui.btnGhost, "px-4 py-2")}>
              <ArrowLeft size={16} className={dir === "rtl" ? "rotate-180" : ""} />
              {t("Back", "رجوع")}
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className={cx(ui.card, "p-10")}>
          <div className="flex items-start gap-4">
            <div className={cx("w-12 h-12 rounded-2xl flex items-center justify-center", isDarkMode ? "bg-slate-900/50 border border-slate-800" : "bg-slate-100 border border-slate-200")}>
              <ShoppingBag size={18} className={isDarkMode ? "text-slate-100" : "text-slate-800"} />
            </div>
            <div>
              <h2 className={cx("text-xl font-black", ui.title)}>{t("Your cart is empty", "السلة فارغة")}</h2>
              <p className={cx("mt-2 text-sm leading-relaxed", ui.muted)}>
                {t("Add services or products from any store, then come back here to checkout.", "أضف خدمات أو منتجات من أي متجر ثم ارجع هنا لإرسال الطلب.")}
              </p>
              <div className="mt-6 flex gap-3 flex-wrap">
                <button onClick={() => navigate("/stores")} className={cx(ui.btn, ui.btnPrimary)}>
                  {t("Browse stores", "تصفح المتاجر")}
                </button>
                <button onClick={load} className={cx(ui.btn, ui.btnGhost)}>
                  <RefreshCcw size={16} />
                  {t("Refresh", "تحديث")}
                </button>
              </div>
            </div>
          </div>

          {error ? (
            <div className={cx("mt-6 text-sm font-bold p-4 rounded-2xl", isDarkMode ? "bg-rose-950/30 border border-rose-900/40 text-rose-200" : "bg-rose-50 border border-rose-200 text-rose-700")}>
              {error}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );

  if (!cart || items.length === 0) {
    return <Empty />;
  }

  return (
    <div className={ui.page} dir={dir}>
      <header className={cx("sticky top-0 z-10", ui.header)}>
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <h1 className={cx("text-2xl font-black tracking-tight truncate", ui.title)}>
              {t("Cart", "السلة")}
            </h1>
            <p className={cx("text-[10px] font-black uppercase tracking-widest", ui.muted)}>/cart</p>

            {merchantSlug ? (
              <button
                onClick={() => navigate(`/s/${merchantSlug}`)}
                className={cx("mt-2 inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest", isDarkMode ? "text-indigo-300 hover:text-indigo-200" : "text-indigo-700 hover:text-indigo-600")}
                title={t("Back to store", "الرجوع للمتجر")}
              >
                <ArrowLeft size={14} className={dir === "rtl" ? "rotate-180" : ""} />
                {t("Back to", "رجوع إلى")} {merchantName}
              </button>
            ) : null}
          </div>

          <div className="flex items-center gap-2 flex-wrap justify-end">
            <span className={cx("px-3 py-2 rounded-2xl text-[10px] font-black uppercase", ui.chip)}>
              {t("Currency", "العملة")}: {currency}
            </span>

            <button
              onClick={() => setLanguage(lang === "ar" ? "en" : "ar")}
              className={cx(ui.btn, ui.btnGhost, "px-4 py-2")}
              title={t("Switch language", "تغيير اللغة")}
            >
              {lang === "ar" ? "EN" : "AR"}
            </button>

            <button onClick={() => navigate(-1)} className={cx(ui.btn, ui.btnGhost, "px-4 py-2")}>
              <ArrowLeft size={16} className={dir === "rtl" ? "rotate-180" : ""} />
              {t("Back", "رجوع")}
            </button>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 pb-4">
          {error ? (
            <div className={cx("text-sm font-bold p-4 rounded-2xl", isDarkMode ? "bg-rose-950/30 border border-rose-900/40 text-rose-200" : "bg-rose-50 border border-rose-200 text-rose-700")}>
              {error}
            </div>
          ) : null}

          {checkoutId ? (
            <div className={cx("mt-3 text-sm font-bold p-4 rounded-2xl", isDarkMode ? "bg-emerald-950/30 border border-emerald-900/40 text-emerald-200" : "bg-emerald-50 border border-emerald-200 text-emerald-700")}>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={18} />
                <span>
                  {t("Checkout submitted successfully.", "تم إرسال الطلب بنجاح.")}
                </span>
              </div>
              <div className={cx("mt-2 text-[11px] font-black uppercase tracking-widest", isDarkMode ? "text-emerald-200/80" : "text-emerald-700/80")}>
                ID: {checkoutId}
              </div>
              <div className="mt-3 flex flex-wrap gap-3">
                <button onClick={() => navigate("/dashboard/customer/bookings")} className={cx(ui.btn, ui.btnPrimary)}>
                  {t("View bookings", "عرض الحجوزات")}
                </button>
                <button onClick={() => navigate("/dashboard/customer/notifications")} className={cx(ui.btn, ui.btnGhost)}>
                  {t("Notifications", "الإشعارات")}
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Items */}
        <section className="lg:col-span-8 space-y-4">
          <div className={cx(ui.card, "p-6")}>
            <h2 className={cx("text-[11px] font-black uppercase tracking-[0.25em]", isDarkMode ? "text-slate-300" : "text-slate-700")}>
              {t("Items", "العناصر")}
            </h2>

            <div className="mt-5 space-y-4">
              {items.map((it) => {
                const lineTotal = Number(it.price_snapshot || 0) * Number(it.quantity || 0);
                const name = it.name_snapshot || (it.item_type === "service" ? t("Service", "خدمة") : t("Product", "منتج"));
                const isBusy = busy === `qty:${it.id}` || busy === `rm:${it.id}` || busy === "checkout";

                return (
                  <div key={it.id} className={cx(ui.cardSoft, "p-5")}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className={cx("font-black truncate", ui.title)}>{name}</p>
                        <p className={cx("mt-1 text-[11px] font-black uppercase tracking-widest", ui.muted)}>
                          {t("Type", "النوع")}: {it.item_type} · {t("Price", "السعر")}: {money(Number(it.price_snapshot || 0))} {currency}
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <p className={cx("text-sm font-black", ui.title)}>{money(lineTotal)} {currency}</p>
                        <p className={cx("text-[10px] font-black uppercase tracking-widest", ui.muted)}>{t("Subtotal", "الإجمالي")}</p>
                      </div>
                    </div>

                    <div className="mt-5 flex items-center justify-between gap-3 flex-wrap">
                      <div className={cx("inline-flex items-center gap-2 rounded-2xl px-3 py-2", isDarkMode ? "bg-slate-950/40 border border-slate-900/60" : "bg-slate-50 border border-slate-200")}>
                        <button
                          disabled={isBusy || it.quantity <= 1}
                          onClick={() => updateQty(it.id, Math.max(1, (it.quantity || 1) - 1))}
                          className={cx(
                            "w-10 h-10 rounded-2xl flex items-center justify-center transition",
                            isDarkMode ? "bg-slate-900/40 hover:bg-slate-900/60" : "bg-white hover:bg-slate-100 border border-slate-200",
                            (isBusy || it.quantity <= 1) && "opacity-50 cursor-not-allowed"
                          )}
                          title={t("Decrease", "تقليل")}
                        >
                          <Minus size={16} />
                        </button>

                        <div className={cx("min-w-[44px] text-center font-black", ui.title)}>{it.quantity}</div>

                        <button
                          disabled={isBusy}
                          onClick={() => updateQty(it.id, (it.quantity || 1) + 1)}
                          className={cx(
                            "w-10 h-10 rounded-2xl flex items-center justify-center transition",
                            isDarkMode ? "bg-slate-900/40 hover:bg-slate-900/60" : "bg-white hover:bg-slate-100 border border-slate-200",
                            isBusy && "opacity-50 cursor-not-allowed"
                          )}
                          title={t("Increase", "زيادة")}
                        >
                          <Plus size={16} />
                        </button>
                      </div>

                      <button
                        disabled={isBusy}
                        onClick={() => removeItem(it.id)}
                        className={cx(
                          "inline-flex items-center gap-2 px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition",
                          ui.danger,
                          isBusy && "opacity-50 cursor-not-allowed"
                        )}
                        title={t("Remove item", "حذف العنصر")}
                      >
                        <Trash2 size={16} />
                        {t("Remove", "حذف")}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 flex gap-3 flex-wrap">
              <button onClick={() => navigate("/stores")} className={cx(ui.btn, ui.btnGhost)}>
                {t("Browse stores", "تصفح المتاجر")}
              </button>
              <button onClick={load} className={cx(ui.btn, ui.btnGhost)} disabled={busy === "checkout"}>
                <RefreshCcw size={16} />
                {t("Refresh", "تحديث")}
              </button>
            </div>
          </div>
        </section>

        {/* Summary */}
        <aside className="lg:col-span-4 space-y-4">
          <div className={cx(ui.card, "p-6")}>
            <h2 className={cx("text-[11px] font-black uppercase tracking-[0.25em]", isDarkMode ? "text-slate-300" : "text-slate-700")}>
              {t("Summary", "الملخص")}
            </h2>

            <div className={cx("mt-5 space-y-3")}>
              <div className="flex items-center justify-between">
                <span className={cx("text-sm font-bold", ui.muted)}>{t("Items", "العناصر")}</span>
                <span className={cx("text-sm font-black", ui.title)}>{totals.itemsCount}</span>
              </div>
              <div className={cx("h-px", ui.divider)} />
              <div className="flex items-center justify-between">
                <span className={cx("text-sm font-bold", ui.muted)}>{t("Total", "الإجمالي")}</span>
                <span className={cx("text-lg font-black", ui.title)}>{money(totals.total)} {currency}</span>
              </div>
            </div>

            <div className="mt-6">
              <h3 className={cx("text-[11px] font-black uppercase tracking-[0.25em]", isDarkMode ? "text-slate-300" : "text-slate-700")}>
                {t("Notes (optional)", "ملاحظات (اختياري)")}
              </h3>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={t("Any notes for the merchant?", "هل لديك ملاحظات للتاجر؟")}
                className={cx("mt-3 min-h-[120px] resize-y", ui.input)}
              />
            </div>

            <button
              disabled={busy === "checkout"}
              onClick={checkout}
              className={cx(ui.btn, ui.btnPrimary, "mt-6 w-full flex items-center justify-center gap-2")}
              title={t("Checkout", "إرسال الطلب")}
            >
              {busy === "checkout" ? (
                <>
                  <div className={cx("w-5 h-5 border-4 border-t-transparent rounded-full animate-spin", isDarkMode ? "border-slate-700" : "border-white")} />
                  {t("Processing...", "جاري الإرسال...")}
                </>
              ) : (
                <>
                  <ShoppingBag size={16} />
                  {t("Checkout", "إرسال الطلب")}
                </>
              )}
            </button>

            <p className={cx("mt-3 text-[11px] font-bold", ui.muted)}>
              {t("Checkout will create a request and notify the merchant.", "إرسال الطلب سيقوم بإنشاء طلب وإرسال إشعار للتاجر.")}
            </p>
          </div>
        </aside>
      </main>
    </div>
  );
}
