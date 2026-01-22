import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Routes, Route, NavLink, Navigate, useNavigate, Link } from "react-router-dom";
import {
  Bell,
  ClipboardList,
  Store,
  LogOut,
  Sun,
  Moon,
  Languages,
  RefreshCcw,
  CalendarDays,
  ShoppingBag,
  ArrowRight,
  CheckCheck,
  Info,
  AlertTriangle,  XCircle,
  Settings,
  UserCircle,
  Mail,
  Phone,
  Lock,
  Globe,
  Coins,
} from "lucide-react";

import { useAuth } from "../../../contexts/AuthContext";
import { useTheme } from "../../../contexts/ThemeContext";
import { useMerchantLang } from "../merchant/useMerchantLang";
import { supabase } from "../../../lib/supabaseClient";
import { getCartSummary } from "../../../lib/supabaseClient";

type BookingRow = {
  id: string;
  merchant_id: string;
  service_id: string | null;
  appointment_time: string;
  status: "pending" | "confirmed" | "completed" | "cancelled" | string;
  notes: string | null;
  created_at: string | null;
  price_snapshot: number | null;
  service?: { name: string | null } | null;
  merchant?: { store_name: string | null; store_slug: string | null } | null;
};

type NotificationRow = {
  id: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
};

type CartSummary = {
  cart_id: string | null;
  items_count: number;
  total_amount: number;
  currency: string;
};

const cx = (...classes: Array<string | false | null | undefined>) => classes.filter(Boolean).join(" ");

function formatDate(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function StatusPill({
  status,
  t,
}: {
  status: string;
  t?: (en: string, ar: string) => string;
}) {
  const s = String(status || "").toLowerCase();
  const cls =
    s === "pending"
      ? "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/25 dark:bg-amber-500/15 dark:text-amber-200"
      : s === "confirmed"
      ? "border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-500/25 dark:bg-indigo-500/15 dark:text-indigo-200"
      : s === "completed"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/25 dark:bg-emerald-500/15 dark:text-emerald-200"
      : s === "cancelled"
      ? "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/25 dark:bg-rose-500/15 dark:text-rose-200"
      : "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-500/25 dark:bg-slate-500/15 dark:text-slate-200";

  const label =
    s === "pending"
      ? t?.("Pending", "قيد الانتظار") ?? "Pending"
      : s === "confirmed"
      ? t?.("Confirmed", "مؤكد") ?? "Confirmed"
      : s === "completed"
      ? t?.("Completed", "مكتمل") ?? "Completed"
      : s === "cancelled"
      ? t?.("Cancelled", "ملغي") ?? "Cancelled"
      : status;

  return (
    <span className={cx("px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest", cls)}>
      {label}
    </span>
  );
}
function EmptyState({
  title,
  subtitle,
  actionLabel,
  onAction,
  icon,
}: {
  title: string;
  subtitle: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: ReactNode;
}) {
  return (
    <div className="p-8 rounded-3xl border border-slate-200 bg-white dark:border-slate-800/60 dark:bg-slate-950/35">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center dark:bg-slate-900/50 dark:border-slate-800">
          {icon}
        </div>
        <div className="min-w-0">
          <h3 className="text-lg font-black text-slate-900 dark:text-slate-50">{title}</h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{subtitle}</p>

          {actionLabel && onAction && (
            <button
              onClick={onAction}
              className="mt-5 inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-black text-white hover:bg-slate-800 font-black text-xs uppercase tracking-widest dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
            >
              <Store size={16} />
              {actionLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function TopBar({ title, right }: { title: string; right?: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="min-w-0">
        <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 dark:text-slate-50 truncate">
          {title}
        </h1>
      </div>
      <div className="flex items-center gap-2 flex-wrap justify-end">{right}</div>
    </div>
  );
}

function SectionCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white dark:border-slate-800/60 dark:bg-slate-950/35">
      <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800/60">
        <h2 className="text-[11px] font-black uppercase tracking-[0.25em] text-slate-600 dark:text-slate-300">
          {title}
        </h2>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

function CustomerHome({
  t,
  userId,
  onBrowse,
  isDarkMode,
}: {
  t: (en: string, ar: string) => string;
  userId: string;
  onBrowse: () => void;
  isDarkMode: boolean;
}) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [latestBookings, setLatestBookings] = useState<BookingRow[]>([]);
  const [latestNotifs, setLatestNotifs] = useState<NotificationRow[]>([]);
  const [cart, setCart] = useState<CartSummary | null>(null);

  const fetchOverview = async () => {
    setLoading(true);
    setError("");
    try {
      const [bookingsRes, notifsRes, cartRes] = await Promise.all([
        supabase
          .from("bookings")
          .select(
            `id, merchant_id, service_id, appointment_time, status, notes, created_at, price_snapshot,
             service:services ( name ),
             merchant:users!bookings_merchant_id_fkey ( store_name, store_slug )`
          )
          .eq("customer_id", userId)
          .order("created_at", { ascending: false })
          .limit(3),

        supabase
          .from("notifications")
          .select("id, type, title, message, is_read, created_at")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(3),

        getCartSummary(userId),
      ]);

      if (bookingsRes.error) throw bookingsRes.error;
      if (notifsRes.error) throw notifsRes.error;

      setLatestBookings((bookingsRes.data as any) || []);
      setLatestNotifs((notifsRes.data as any) || []);
      // Normalize cart summary (getCartSummary may return { data }, an array, or a direct object)
      const rawCart: any = (cartRes as any)?.data ?? cartRes;
      const cartObj: any = Array.isArray(rawCart) ? rawCart[0] : rawCart;

      // Try to derive items_count from multiple possible keys, with a fallback COUNT(*) on cart_items
      let itemsCount: number =
        Number(
          cartObj?.items_count ??
            cartObj?.itemsCount ??
            cartObj?.item_count ??
            cartObj?.items_total ??
            cartObj?.count ??
            (Array.isArray(cartObj?.items) ? cartObj.items.length : undefined) ??
            0
        ) || 0;

      // cart_id is often NOT returned by custom JS getCartSummary. We'll derive it from `carts`.
      let cartId: string | null = cartObj?.cart_id ?? cartObj?.id ?? null;

      const normalizedCart = cartObj && typeof cartObj === "object"
        ? ({
            cart_id: cartId,
            items_count: itemsCount,
            total_amount:
              Number(cartObj?.total_amount ?? cartObj?.total ?? cartObj?.amount ?? 0) || 0,
            // IMPORTANT: we will always override this with merchant currency below
            currency: String(
              cartObj?.currency ??
                cartObj?.currency_code ??
                cartObj?.store_currency ??
                cartObj?.merchant_currency ??
                ""
            ),
          } as CartSummary)
        : null;

      if (!normalizedCart) {
        setCart(null);
        return;
      }

      // If count is missing/zero, ask cart_items for the exact count (read-only)
      if (
        normalizedCart.cart_id &&
        (cartObj?.items_count == null && cartObj?.itemsCount == null && cartObj?.item_count == null) &&
        normalizedCart.items_count === 0
      ) {
        const { count } = await supabase
          .from("cart_items")
          .select("id", { count: "exact", head: true })
          .eq("cart_id", normalizedCart.cart_id);
        if (typeof count === "number") normalizedCart.items_count = count;
      }

      // ALWAYS display the merchant's currency (users.currency), even if getCartSummary returns SAR.
      // We derive the latest cart for this customer to get merchant_id.
      try {
        const resolveMerchantCurrency = async (merchantId: string): Promise<string> => {
          // 0) Preferred: RPC (SECURITY DEFINER) that returns users.currency for a merchant_id.
          // This avoids RLS blocking customers from reading merchants table.
          try {
            const { data, error } = await supabase.rpc("get_merchant_currency", {
              p_merchant_id: merchantId,
            });
            if (!error) {
              const c = String((data as any) ?? "").trim();
              if (c) return c;
            }
          } catch {
            // ignore
          }

          // A) Prefer users.currency (may be blocked by RLS for customers)
          try {
            const { data: merchantRow, error } = await supabase
              .from("users")
              .select("currency")
              .eq("id", merchantId)
              .maybeSingle();
            if (!error) {
              const c = String((merchantRow as any)?.currency ?? "").trim();
              if (c) return c;
            }
          } catch {
            // ignore
          }

          // B) Fallback to store_public (usually readable by customers)
          // Try common key patterns: id or merchant_id
          try {
            const { data: spRow, error } = await supabase
              .from("store_public")
              .select("currency")
              .eq("id", merchantId)
              .maybeSingle();
            if (!error) {
              const c = String((spRow as any)?.currency ?? "").trim();
              if (c) return c;
            }
          } catch {
            // ignore
          }
          try {
            const { data: spRow, error } = await supabase
              .from("store_public")
              .select("currency")
              .eq("merchant_id", merchantId as any)
              .maybeSingle();
            if (!error) {
              const c = String((spRow as any)?.currency ?? "").trim();
              if (c) return c;
            }
          } catch {
            // ignore
          }

          return "";
        };

        // 1) Find the latest cart for this customer (avoid ordering by columns that may not exist)
        const { data: latestCart, error: latestCartErr } = await supabase
          .from("carts")
          .select("id, merchant_id")
          .eq("customer_id", userId)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (!latestCartErr) {
          const latestCartId = (latestCart as any)?.id as string | undefined;
          const merchantId = (latestCart as any)?.merchant_id as string | undefined;
          if (!normalizedCart.cart_id && latestCartId) normalizedCart.cart_id = latestCartId;

          // 2) Pull merchant currency (override always)
          if (merchantId) {
            const merchantCurrency = await resolveMerchantCurrency(merchantId);
            if (merchantCurrency) normalizedCart.currency = merchantCurrency;
          }
        }

        // 3) Fallback: derive merchant via cart_items -> services (useful if carts query is blocked)
        if (normalizedCart.cart_id && (!normalizedCart.currency || normalizedCart.currency.toUpperCase() === "SAR")) {
          const { data: cartItem } = await supabase
            .from("cart_items")
            .select("service_id")
            .eq("cart_id", normalizedCart.cart_id)
            .limit(1)
            .maybeSingle();

          const serviceId = (cartItem as any)?.service_id as string | undefined;
          if (serviceId) {
            const { data: serviceRow } = await supabase
              .from("services")
              .select("merchant_id")
              .eq("id", serviceId)
              .maybeSingle();

            const merchantId = (serviceRow as any)?.merchant_id as string | undefined;
            if (merchantId) {
              const merchantCurrency = await resolveMerchantCurrency(merchantId);
              if (merchantCurrency) normalizedCart.currency = merchantCurrency;
            }
          }
        }
      } catch {
        // ignore: keep whatever currency we already have
      }

      setCart(normalizedCart);
    } catch (e: any) {
      setError(e?.message || t("Failed to load overview.", "فشل تحميل النظرة العامة."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const notifBadge = (typeRaw: string) => {
    const type = String(typeRaw || "").toLowerCase();
    if (type.includes("success") || type.includes("delivered") || type.includes("completed")) {
      return {
        icon: <CheckCheck size={14} />,
        cls: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-200 dark:border-emerald-500/25",
        label: t("Success", "تم"),
      };
    }
    if (type.includes("warn") || type.includes("pending")) {
      return {
        icon: <AlertTriangle size={14} />,
        cls: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/15 dark:text-amber-200 dark:border-amber-500/25",
        label: t("Pending", "قيد الانتظار"),
      };
    }
    if (type.includes("error") || type.includes("cancel")) {
      return {
        icon: <XCircle size={14} />,
        cls: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/15 dark:text-rose-200 dark:border-rose-500/25",
        label: t("Cancelled", "ملغي"),
      };
    }
    return {
      icon: <Info size={14} />,
      cls: "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-500/15 dark:text-slate-200 dark:border-slate-500/25",
      label: t("Info", "معلومة"),
    };
  };

  const markAllRead = async () => {
    try {
      const unreadIds = latestNotifs.filter((n) => !n.is_read).map((n) => n.id);
      if (!unreadIds.length) return;
      await supabase.from("notifications").update({ is_read: true }).in("id", unreadIds);
      setLatestNotifs((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch {
      // ignore
    }
  };

  if (loading) {
    return (
      <SectionCard title={t("Overview", "نظرة عامة")}>
        <div className="flex items-center gap-3">
          <div
            className={cx(
              "w-6 h-6 border-4 rounded-full animate-spin",
              isDarkMode ? "border-indigo-400 border-t-transparent" : "border-indigo-600 border-t-transparent"
            )}
          />
          <p
            className={cx(
              "text-[10px] font-black uppercase tracking-widest",
              isDarkMode ? "text-indigo-300" : "text-indigo-600"
            )}
          >
            {t("Loading...", "جاري التحميل...")}
          </p>
        </div>
      </SectionCard>
    );
  }

  if (error) {
    return (
      <SectionCard title={t("Overview", "نظرة عامة")}>
        <div className="rounded-2xl p-4 border border-rose-200 bg-rose-50 text-rose-700 text-sm font-bold dark:border-rose-900/40 dark:bg-rose-950/25 dark:text-rose-200">
          {error}
        </div>
        <button
          onClick={fetchOverview}
          className="mt-5 inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-black text-white hover:bg-slate-800 font-black text-xs uppercase tracking-widest dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
        >
          <RefreshCcw size={16} />
          {t("Retry", "إعادة")}
        </button>
      </SectionCard>
    );
  }

  const cartCount =
    Number(
      (cart as any)?.items_count ??
        (cart as any)?.itemsCount ??
        (cart as any)?.item_count ??
        (cart as any)?.count ??
        (Array.isArray((cart as any)?.items) ? (cart as any).items.length : 0) ??
        0
    ) || 0;
  const cartTotal = Number(cart?.total_amount ?? 0) || 0;
  const cartCurrency = String((cart as any)?.currency ?? "SAR") || "SAR";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end">
        <button
          onClick={fetchOverview}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-black text-white hover:bg-slate-800 font-black text-xs uppercase tracking-widest dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
          title={t("Refresh", "تحديث")}
        >
          <RefreshCcw size={16} />
          {t("Refresh", "تحديث")}
        </button>
      </div>

      <SectionCard title={t("Quick actions", "إجراءات سريعة")}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={onBrowse}
            className="p-5 rounded-3xl border border-slate-200 bg-white hover:bg-slate-50 transition text-left dark:border-slate-800/60 dark:bg-slate-950/35 dark:hover:bg-slate-950/45"
          >
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center dark:bg-white/10 dark:border-slate-700">
                <Store className="text-slate-900 dark:text-slate-100" size={20} />
              </div>
              <div className="min-w-0">
                <p className="text-slate-900 dark:text-slate-50 font-black">{t("Browse stores", "تصفح المتاجر")}</p>
                <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
                  {t("Find merchants and book in seconds", "اعثر على التجار واحجز بسهولة")}
                </p>
              </div>
            </div>
          </button>

          <button
            onClick={() => window.location.assign("/cart")}
            className="p-5 rounded-3xl border border-slate-200 bg-white hover:bg-slate-50 transition text-left dark:border-slate-800/60 dark:bg-slate-950/35 dark:hover:bg-slate-950/45"
          >
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center dark:bg-white/10 dark:border-slate-700">
                <ShoppingBag className="text-slate-900 dark:text-slate-100" size={20} />
              </div>
              <div className="min-w-0">
                <p className="text-slate-900 dark:text-slate-50 font-black">{t("Cart", "السلة")}</p>
                <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
                  {t(
                    `${cartCount} item(s) • ${cartTotal.toFixed(2)} ${cartCurrency}`,
                    `${cartCount} عنصر • ${cartTotal.toFixed(2)} ${cartCurrency}`
                  )}
                </p>
              </div>
              <div className="ml-auto shrink-0">
                <ArrowRight className="text-slate-400 dark:text-slate-500" size={18} />
              </div>
            </div>
          </button>
        </div>

        {/* Continue shopping */}
        <div className="mt-4 flex items-center justify-end">
          <button
            onClick={onBrowse}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-black text-white hover:bg-slate-800 font-black text-xs uppercase tracking-widest dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
          >
            <ShoppingBag size={16} />
            {t("Continue shopping", "متابعة التسوق")}
          </button>
        </div>
      </SectionCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Latest bookings */}
        <SectionCard title={t("Latest bookings", "آخر الحجوزات")}>
          {!latestBookings.length ? (
            <p className="text-sm text-slate-600 dark:text-slate-400">{t("No bookings yet.", "لا توجد حجوزات بعد.")}</p>
          ) : (
            <div className="space-y-3">
              {latestBookings.map((b) => (
                <div
                  key={b.id}
                  className="p-4 rounded-2xl border border-slate-200 bg-white dark:border-slate-800/60 dark:bg-slate-950/30"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="font-black text-slate-900 dark:text-slate-50 truncate">
                        {b.merchant?.store_name || t("Merchant", "التاجر")}
                      </p>
                      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400 truncate">
                        {b.service?.name || t("Service", "خدمة")}
                      </p>
                      <p className="mt-2 text-[11px] font-bold text-slate-600 dark:text-slate-400">
                        {t("Appointment", "الموعد")}:{" "}
                        <span className="text-slate-900 dark:text-slate-200">{formatDate(b.appointment_time)}</span>
                      </p>
                    </div>
                    <div className="shrink-0">
                      <StatusPill status={b.status} t={t} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        {/* Latest notifications */}
        <SectionCard title={t("Latest notifications", "آخر الإشعارات")}>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-bold text-slate-600 dark:text-slate-400">
              {t("Updates from merchants", "تحديثات من التجار")}
            </p>
            <button
              onClick={markAllRead}
              className="text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:text-indigo-700 dark:text-indigo-300 dark:hover:text-indigo-200"
            >
              {t("Mark all read", "تحديد الكل كمقروء")}
            </button>
          </div>

          {!latestNotifs.length ? (
            <p className="text-sm text-slate-600 dark:text-slate-400">{t("No notifications yet.", "لا توجد إشعارات بعد.")}</p>
          ) : (
            <div className="space-y-3">
              {latestNotifs.map((n) => {
                const badge = notifBadge(n.type);
                return (
                  <div
                    key={n.id}
                    className={cx(
                      "p-4 rounded-2xl border",
                      n.is_read
                        ? "border-slate-200 bg-white dark:border-slate-800/60 dark:bg-slate-950/20"
                        : "border-indigo-200 bg-indigo-50 dark:border-indigo-500/30 dark:bg-indigo-500/10"
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-black text-slate-900 truncate dark:text-slate-50">{n.title}</p>
                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{n.message}</p>
                        <p className="mt-3 text-[11px] font-bold text-slate-500 dark:text-slate-400">
                          {formatDate(n.created_at)}
                        </p>
                      </div>

                      <div className="shrink-0 flex flex-col items-end gap-2">
                        <span
                          className={cx(
                            "inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest",
                            badge.cls
                          )}
                          title={n.type}
                        >
                          {badge.icon}
                          {badge.label}
                        </span>

                        {!n.is_read && (
                          <span className="px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/25 text-indigo-700 text-[10px] font-black uppercase tracking-widest dark:text-indigo-200">
                            {t("New", "جديد")}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </SectionCard>
      </div>

      <EmptyState
        title={t("Need something else?", "محتاج حاجة تانية؟")}
        subtitle={t(
          "You can browse stores, add items to cart, then checkout. Your latest updates appear above.",
          "تقدر تتصفح المتاجر، تضيف للسلة، ثم تعمل Checkout. أحدث التحديثات هتظهر فوق."
        )}
        actionLabel={t("Browse stores", "تصفح المتاجر")}
        onAction={onBrowse}
        icon={<CalendarDays className="text-slate-900 dark:text-slate-100" size={18} />}
      />
    </div>
  );
}

function CustomerBookings({
  t,
  userId,
  isDarkMode,
}: {
  t: (en: string, ar: string) => string;
  userId: string;
  isDarkMode: boolean;
}) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [rows, setRows] = useState<BookingRow[]>([]);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const { data, error } = await supabase
        .from("bookings")
        .select(
          `id, merchant_id, service_id, appointment_time, status, notes, created_at, price_snapshot,
           service:services ( name ),
           merchant:users!bookings_merchant_id_fkey ( store_name, store_slug )`
        )
        .eq("customer_id", userId)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw new Error(error.message);
      setRows((data as any) || []);
    } catch (e: any) {
      setError(e?.message || t("Failed to load bookings.", "فشل تحميل الحجوزات."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  if (loading) {
    return (
      <SectionCard title={t("My bookings", "حجوزاتي")}>
        <div className="flex items-center gap-3">
          <div
            className={cx(
              "w-6 h-6 border-4 rounded-full animate-spin",
              isDarkMode ? "border-indigo-400 border-t-transparent" : "border-indigo-600 border-t-transparent"
            )}
          />
          <p
            className={cx(
              "text-[10px] font-black uppercase tracking-widest",
              isDarkMode ? "text-indigo-300" : "text-indigo-600"
            )}
          >
            {t("Loading...", "جاري التحميل...")}
          </p>
        </div>
      </SectionCard>
    );
  }

  if (error) {
    return (
      <SectionCard title={t("My bookings", "حجوزاتي")}>
        <div className="rounded-2xl p-4 border border-rose-200 bg-rose-50 text-rose-700 text-sm font-bold dark:border-rose-900/40 dark:bg-rose-950/25 dark:text-rose-200">
          {error}
        </div>
        <button
          onClick={load}
          className="mt-5 inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-black text-white hover:bg-slate-800 font-black text-xs uppercase tracking-widest dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
        >
          <RefreshCcw size={16} />
          {t("Retry", "إعادة")}
        </button>
      </SectionCard>
    );
  }

  if (!rows.length) {
    return (
      <EmptyState
        title={t("No bookings yet", "لا توجد حجوزات بعد")}
        subtitle={t("Once you checkout from a store, your booking/order will appear here.", "بعد ما تعمل طلب/حجز من المتجر، هتظهر هنا.")}
        icon={<ClipboardList className="text-slate-900 dark:text-slate-100" size={18} />}
      />
    );
  }

  return (
    <SectionCard title={t("My bookings", "حجوزاتي")}>
      <div className="space-y-3">
        {rows.map((b) => {
          const storeName = b.merchant?.store_name || t("Merchant", "التاجر");
          const storeSlug = b.merchant?.store_slug;
          const itemName = b.service?.name || t("Service", "خدمة");
          return (
            <div key={b.id} className="p-5 rounded-2xl border border-slate-200 bg-white dark:border-slate-800/60 dark:bg-slate-950/30">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-slate-900 dark:text-slate-50 font-black truncate">{storeName}</p>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-400 truncate">
                    {itemName}
                    {b.price_snapshot != null ? (
                      <>
                        {" · "}
                        <span className="font-black text-slate-900 dark:text-slate-200">
                          {Number(b.price_snapshot).toFixed(2)}
                        </span>
                      </>
                    ) : null}
                  </p>
                  <p className="mt-2 text-[11px] font-bold text-slate-600 dark:text-slate-400">
                    {t("Appointment", "الموعد")}:{" "}
                    <span className="text-slate-900 dark:text-slate-200">{formatDate(b.appointment_time)}</span>
                  </p>
                </div>
                <div className="shrink-0 flex flex-col items-end gap-2">
                  <StatusPill status={b.status} t={t} />
                  {storeSlug && (
                    <a className="text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:text-indigo-700 dark:text-indigo-300 dark:hover:text-indigo-200" href={`/s/${storeSlug}`}>
                      {t("Open store", "فتح المتجر")}
                    </a>
                  )}
                </div>
              </div>
              {b.notes ? (
                <div className="mt-4 text-sm text-slate-600 dark:text-slate-300 border-t border-slate-200 dark:border-slate-800/60 pt-4">
                  <span className="font-black text-slate-900 dark:text-slate-200">{t("Notes", "ملاحظات")}: </span>
                  {b.notes}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </SectionCard>
  );
}

function CustomerNotifications({
  t,
  userId,
  isDarkMode,
}: {
  t: (en: string, ar: string) => string;
  userId: string;
  isDarkMode: boolean;
}) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [rows, setRows] = useState<NotificationRow[]>([]);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const { data, error } = await supabase
        .from("notifications")
        .select("id, type, title, message, is_read, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw new Error(error.message);
      setRows((data as any) || []);
    } catch (e: any) {
      setError(e?.message || t("Failed to load notifications.", "فشل تحميل الإشعارات."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const markRead = async (id: string) => {
    try {
      await supabase.from("notifications").update({ is_read: true }).eq("id", id);
      setRows((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
    } catch {
      // ignore
    }
  };

  if (loading) {
    return (
      <SectionCard title={t("Notifications", "الإشعارات")}>
        <div className="flex items-center gap-3">
          <div
            className={cx(
              "w-6 h-6 border-4 rounded-full animate-spin",
              isDarkMode ? "border-indigo-400 border-t-transparent" : "border-indigo-600 border-t-transparent"
            )}
          />
          <p
            className={cx(
              "text-[10px] font-black uppercase tracking-widest",
              isDarkMode ? "text-indigo-300" : "text-indigo-600"
            )}
          >
            {t("Loading...", "جاري التحميل...")}
          </p>
        </div>
      </SectionCard>
    );
  }

  if (error) {
    return (
      <SectionCard title={t("Notifications", "الإشعارات")}>
        <div className="rounded-2xl p-4 border border-rose-200 bg-rose-50 text-rose-700 text-sm font-bold dark:border-rose-900/40 dark:bg-rose-950/25 dark:text-rose-200">
          {error}
        </div>
        <button
          onClick={load}
          className="mt-5 inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-black text-white hover:bg-slate-800 font-black text-xs uppercase tracking-widest dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
        >
          <RefreshCcw size={16} />
          {t("Retry", "إعادة")}
        </button>
      </SectionCard>
    );
  }

  if (!rows.length) {
    return (
      <EmptyState
        title={t("No notifications", "لا توجد إشعارات")}
        subtitle={t("When you checkout, we’ll notify you here with updates from the merchant.", "بعد ما تعمل طلب، هتوصلك تحديثات التاجر هنا.")}
        icon={<Bell className="text-slate-900 dark:text-slate-100" size={18} />}
      />
    );
  }

  return (
    <SectionCard title={t("Notifications", "الإشعارات")}>
      <div className="space-y-3">
        {rows.map((n) => (
          <button
            key={n.id}
            onClick={() => markRead(n.id)}
            className={cx(
              "w-full text-left p-5 rounded-2xl border transition",
              n.is_read
                ? "border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-800/50 dark:bg-slate-950/20 dark:hover:bg-slate-950/30"
                : "border-indigo-200 bg-indigo-50 hover:bg-indigo-100 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:hover:bg-indigo-500/15"
            )}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-slate-900 dark:text-slate-50 font-black truncate">{n.title}</p>
                <p className="mt-1 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{n.message}</p>
                <p className="mt-3 text-[11px] font-bold text-slate-500 dark:text-slate-400">{formatDate(n.created_at)}</p>
              </div>
              {!n.is_read && (
                <span className="shrink-0 px-3 py-1 rounded-full bg-indigo-100 border border-indigo-200 text-indigo-700 text-[10px] font-black uppercase tracking-widest dark:bg-indigo-500/20 dark:border-indigo-500/30 dark:text-indigo-200">
                  {t("New", "جديد")}
                </span>
              )}
            </div>
          </button>
        ))}
      </div>
    </SectionCard>
  );
}


function CustomerSettings({
  t,
  lang,
  userId,
  isDarkMode,
  userEmail,
}: {
  t: (en: string, ar: string) => string;
  lang: "en" | "ar";
  userId: string;
  isDarkMode: boolean;
  userEmail?: string | null;
}) {
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingAuth, setSavingAuth] = useState(false);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState(userEmail || "");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("");
  const [currency, setCurrency] = useState("");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  // Country → currency options (simple + safe). You can extend without touching backend.
  const currencyByCountry: Record<string, { labelEn: string; labelAr: string; currencies: string[] }> = {
    EG: { labelEn: "Egypt", labelAr: "مصر", currencies: ["EGP"] },
    SA: { labelEn: "Saudi Arabia", labelAr: "السعودية", currencies: ["SAR"] },
    AE: { labelEn: "UAE", labelAr: "الإمارات", currencies: ["AED"] },
    KW: { labelEn: "Kuwait", labelAr: "الكويت", currencies: ["KWD"] },
    QA: { labelEn: "Qatar", labelAr: "قطر", currencies: ["QAR"] },
    BH: { labelEn: "Bahrain", labelAr: "البحرين", currencies: ["BHD"] },
    OM: { labelEn: "Oman", labelAr: "عُمان", currencies: ["OMR"] },
    JO: { labelEn: "Jordan", labelAr: "الأردن", currencies: ["JOD"] },
    IQ: { labelEn: "Iraq", labelAr: "العراق", currencies: ["IQD"] },
    LB: { labelEn: "Lebanon", labelAr: "لبنان", currencies: ["LBP", "USD"] },
    US: { labelEn: "USA", labelAr: "أمريكا", currencies: ["USD"] },
    GB: { labelEn: "UK", labelAr: "بريطانيا", currencies: ["GBP"] },
    EU: { labelEn: "Europe", labelAr: "أوروبا", currencies: ["EUR"] },
  };

  const countryOptions = useMemo(() => {
    const base = Object.entries(currencyByCountry).map(([code, v]) => ({
      code,
      label: lang === "ar" ? v.labelAr : v.labelEn,
      currencies: v.currencies,
    }));
    base.sort((a, b) => a.label.localeCompare(b.label));
    return base;
  }, [lang]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setMsg(null);
      try {
        const { data, error } = await supabase
          .from("users")
          .select("full_name, phone, country, currency")
          .eq("id", userId)
          .single();

        if (error) throw error;

        if (!mounted) return;

        setFullName((data as any)?.full_name || "");
        setPhone((data as any)?.phone || "");
        setCountry((data as any)?.country || "");
        setCurrency((data as any)?.currency || "");
      } catch (e: any) {
        if (mounted) setMsg({ type: "err", text: e?.message || t("Failed to load settings.", "فشل تحميل الإعدادات.") });
      } finally {
        if (mounted) setLoading(false);
      }
    };
    if (userId) load();
    return () => {
      mounted = false;
    };
  }, [userId, t]);

  // Keep currency aligned with country (but do not override user choice if already valid)
  useEffect(() => {
    const entry = currencyByCountry[country];
    if (!entry) return;
    if (!currency || !entry.currencies.includes(currency)) {
      setCurrency(entry.currencies[0] || "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [country]);

  const inputCls = cx(
    "w-full px-4 py-3 rounded-2xl border text-sm font-bold outline-none transition",
    isDarkMode
      ? "bg-slate-950/30 border-slate-900/60 text-slate-100 placeholder:text-slate-500 focus:border-slate-700"
      : "bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-slate-300"
  );

  const labelCls = cx("text-[11px] font-black uppercase tracking-[0.25em]", isDarkMode ? "text-slate-300" : "text-slate-600");

  const btnCls = cx(
    "inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-widest border transition",
    isDarkMode ? "bg-white text-slate-900 hover:bg-slate-100 border-white/20" : "bg-black text-white hover:bg-slate-900 border-black/10"
  );

  const subtleBtnCls = cx(
    "inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-widest border transition",
    isDarkMode
      ? "bg-slate-950/30 border-slate-900/60 text-slate-200 hover:bg-slate-900/35"
      : "bg-white border-slate-200 text-slate-800 hover:bg-slate-50"
  );

  const saveProfile = async () => {
    setSavingProfile(true);
    setMsg(null);
    try {
      const payload: any = {
        full_name: fullName?.trim() || null,
        phone: phone?.trim() || null,
        country: country || null,
        currency: currency || null,
      };

      const { error } = await supabase.from("users").update(payload).eq("id", userId);
      if (error) throw error;

      setMsg({ type: "ok", text: t("Profile updated.", "تم تحديث البيانات.") });
    } catch (e: any) {
      setMsg({ type: "err", text: e?.message || t("Failed to update profile.", "فشل تحديث البيانات.") });
    } finally {
      setSavingProfile(false);
    }
  };

  const saveAuth = async () => {
    setSavingAuth(true);
    setMsg(null);
    try {
      const updates: any = {};

      const nextEmail = email?.trim();
      if (nextEmail && nextEmail !== (userEmail || "")) {
        updates.email = nextEmail;
      }

      if (newPassword || confirmPassword) {
        if (newPassword.length < 6) throw new Error(t("Password must be at least 6 characters.", "كلمة السر لازم تكون 6 حروف على الأقل."));
        if (newPassword !== confirmPassword) throw new Error(t("Passwords do not match.", "كلمتا السر غير متطابقتين."));
        updates.password = newPassword;
      }

      if (Object.keys(updates).length === 0) {
        setMsg({ type: "ok", text: t("Nothing to update.", "لا يوجد تغييرات.") });
        return;
      }

      const { error } = await supabase.auth.updateUser(updates);
      if (error) throw error;

      setNewPassword("");
      setConfirmPassword("");
      setMsg({ type: "ok", text: t("Account updated.", "تم تحديث الحساب.") });
    } catch (e: any) {
      setMsg({ type: "err", text: e?.message || t("Failed to update account.", "فشل تحديث الحساب.") });
    } finally {
      setSavingAuth(false);
    }
  };

  const currenciesForCountry = currencyByCountry[country]?.currencies || [];

  return (
    <div className="space-y-6">
      <SectionCard title={t("Settings", "الإعدادات")}>
        {msg && (
          <div
            className={cx(
              "mb-5 rounded-2xl border px-4 py-3 text-sm font-bold",
              msg.type === "ok"
                ? isDarkMode
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-200"
                  : "bg-emerald-50 border-emerald-200 text-emerald-700"
                : isDarkMode
                ? "bg-rose-500/10 border-rose-500/20 text-rose-200"
                : "bg-rose-50 border-rose-200 text-rose-700"
            )}
          >
            {msg.text}
          </div>
        )}

        {loading ? (
          <div className={cx("rounded-2xl border p-6", isDarkMode ? "border-slate-900/60" : "border-slate-200")}>
            <div className="animate-pulse space-y-4">
              <div className="h-10 rounded-2xl bg-slate-200/10" />
              <div className="h-10 rounded-2xl bg-slate-200/10" />
              <div className="h-10 rounded-2xl bg-slate-200/10" />
            </div>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Profile */}
            <div className={cx("rounded-2xl border p-6", isDarkMode ? "border-slate-900/60 bg-slate-950/20" : "border-slate-200 bg-white")}>
              <div className="flex items-center gap-3">
                <div className={cx("h-10 w-10 rounded-2xl grid place-items-center border", isDarkMode ? "border-slate-900/60 bg-slate-950/30" : "border-slate-200 bg-slate-50")}>
                  <UserCircle size={18} />
                </div>
                <div>
                  <p className={cx("text-sm font-black uppercase tracking-widest", isDarkMode ? "text-slate-100" : "text-slate-900")}>
                    {t("Profile", "البيانات")}
                  </p>
                  <p className={cx("text-xs font-bold", isDarkMode ? "text-slate-400" : "text-slate-600")}>
                    {t("Update your personal info", "تحديث بياناتك")}
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div>
                  <div className={labelCls}>{t("Name", "الاسم")}</div>
                  <input value={fullName} onChange={(e) => setFullName(e.target.value)} className={inputCls} placeholder={t("Full name", "الاسم بالكامل")} />
                </div>

                <div>
                  <div className={labelCls}>{t("Phone", "رقم الهاتف")}</div>
                  <div className="relative">
                    <Phone size={16} className={cx("absolute top-1/2 -translate-y-1/2", lang === "ar" ? "right-4" : "left-4", isDarkMode ? "text-slate-500" : "text-slate-400")} />
                    <input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className={cx(inputCls, lang === "ar" ? "pr-10" : "pl-10")}
                      placeholder={t("+20 10...", "+20 10...")}
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <div className={labelCls}>{t("Country", "الدولة")}</div>
                    <div className="relative">
                      <Globe size={16} className={cx("absolute top-1/2 -translate-y-1/2", lang === "ar" ? "right-4" : "left-4", isDarkMode ? "text-slate-500" : "text-slate-400")} />
                      <select
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        className={cx(inputCls, lang === "ar" ? "pr-10" : "pl-10")}
                      >
                        <option value="">{t("Select country", "اختر الدولة")}</option>
                        {countryOptions.map((c) => (
                          <option key={c.code} value={c.code}>
                            {c.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <div className={labelCls}>{t("Currency", "العملة")}</div>
                    <div className="relative">
                      <Coins size={16} className={cx("absolute top-1/2 -translate-y-1/2", lang === "ar" ? "right-4" : "left-4", isDarkMode ? "text-slate-500" : "text-slate-400")} />
                      <select
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                        className={cx(inputCls, lang === "ar" ? "pr-10" : "pl-10")}
                      >
                        {(currenciesForCountry.length ? currenciesForCountry : [currency || ""]).filter(Boolean).map((cur) => (
                          <option key={cur} value={cur}>
                            {cur}
                          </option>
                        ))}
                        {!currenciesForCountry.length && !currency && <option value="">{t("Select", "اختر")}</option>}
                      </select>
                    </div>
                    <p className={cx("mt-2 text-xs font-bold", isDarkMode ? "text-slate-400" : "text-slate-600")}>
                      {t("Currency is linked to your country choice.", "العملة مرتبطة باختيار الدولة.")}
                    </p>
                  </div>
                </div>

                <div className="pt-2 flex gap-3">
                  <button onClick={saveProfile} className={btnCls} disabled={savingProfile}>
                    {savingProfile ? t("Saving...", "جارِ الحفظ...") : t("Save profile", "حفظ البيانات")}
                  </button>
                  <button
                    onClick={() => {
                      setMsg(null);
                      // reload from DB quickly
                      (async () => {
                        setLoading(true);
                        try {
                          const { data, error } = await supabase
                            .from("users")
                            .select("full_name, phone, country, currency")
                            .eq("id", userId)
                            .single();
                          if (error) throw error;
                          setFullName((data as any)?.full_name || "");
                          setPhone((data as any)?.phone || "");
                          setCountry((data as any)?.country || "");
                          setCurrency((data as any)?.currency || "");
                        } catch (e: any) {
                          setMsg({ type: "err", text: e?.message || t("Failed to reload.", "فشل إعادة التحميل.") });
                        } finally {
                          setLoading(false);
                        }
                      })();
                    }}
                    className={subtleBtnCls}
                    disabled={savingProfile}
                  >
                    <RefreshCcw size={16} />
                    {t("Reload", "إعادة تحميل")}
                  </button>
                </div>
              </div>
            </div>

            {/* Account */}
            <div className={cx("rounded-2xl border p-6", isDarkMode ? "border-slate-900/60 bg-slate-950/20" : "border-slate-200 bg-white")}>
              <div className="flex items-center gap-3">
                <div className={cx("h-10 w-10 rounded-2xl grid place-items-center border", isDarkMode ? "border-slate-900/60 bg-slate-950/30" : "border-slate-200 bg-slate-50")}>
                  <Lock size={18} />
                </div>
                <div>
                  <p className={cx("text-sm font-black uppercase tracking-widest", isDarkMode ? "text-slate-100" : "text-slate-900")}>
                    {t("Account", "الحساب")}
                  </p>
                  <p className={cx("text-xs font-bold", isDarkMode ? "text-slate-400" : "text-slate-600")}>
                    {t("Email & password", "البريد وكلمة السر")}
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div>
                  <div className={labelCls}>{t("Email", "البريد الإلكتروني")}</div>
                  <div className="relative">
                    <Mail size={16} className={cx("absolute top-1/2 -translate-y-1/2", lang === "ar" ? "right-4" : "left-4", isDarkMode ? "text-slate-500" : "text-slate-400")} />
                    <input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={cx(inputCls, lang === "ar" ? "pr-10" : "pl-10")}
                      placeholder="name@email.com"
                      type="email"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <div className={labelCls}>{t("New password", "كلمة سر جديدة")}</div>
                    <input
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className={inputCls}
                      placeholder={t("Min 6 chars", "6 حروف على الأقل")}
                      type="password"
                    />
                  </div>
                  <div>
                    <div className={labelCls}>{t("Confirm password", "تأكيد كلمة السر")}</div>
                    <input
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={inputCls}
                      placeholder={t("Repeat password", "أعد كلمة السر")}
                      type="password"
                    />
                  </div>
                </div>

                <div className="pt-2 flex gap-3">
                  <button onClick={saveAuth} className={btnCls} disabled={savingAuth}>
                    {savingAuth ? t("Saving...", "جارِ الحفظ...") : t("Save account", "حفظ الحساب")}
                  </button>
                  <button
                    onClick={() => {
                      setMsg(null);
                      setEmail(userEmail || "");
                      setNewPassword("");
                      setConfirmPassword("");
                    }}
                    className={subtleBtnCls}
                    disabled={savingAuth}
                  >
                    <XCircle size={16} />
                    {t("Reset", "إعادة ضبط")}
                  </button>
                </div>

                <p className={cx("mt-2 text-xs font-bold", isDarkMode ? "text-slate-400" : "text-slate-600")}>
                  {t("Email updates may require verification.", "تعديل البريد قد يحتاج تأكيد.")}
                </p>
              </div>
            </div>
          </div>
        )}
      </SectionCard>
    </div>
  );
}

export default function CustomerDashboard() {
  const navigate = useNavigate();
  const { user, dbUser } = useAuth() as any;
  const { isDarkMode, toggleDarkMode } = useTheme();
  const { t, dir, lang, setLanguage } = useMerchantLang();

  const userId = user?.id || dbUser?.id;

  const ui = useMemo(() => {
    return {
      page: isDarkMode ? "bg-[#030712] text-slate-100" : "bg-[#F8FAFC] text-slate-900",
      shell: isDarkMode ? "bg-[#030712]" : "bg-[#F8FAFC]",
      sidebar: isDarkMode ? "bg-slate-950/30 border-slate-900/60" : "bg-white border-slate-200",
      content: isDarkMode ? "text-slate-100" : "text-slate-900",
      navItem: (active: boolean) =>
        cx(
          "w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition",
          active
            ? isDarkMode
              ? "bg-white text-slate-900"
              : "bg-black text-white"
            : isDarkMode
            ? "text-slate-200 hover:bg-slate-900/35 border border-slate-900/50"
            : "text-slate-800 hover:bg-slate-100 border border-slate-200"
        ),
      topBtn: isDarkMode
        ? "bg-slate-900/35 border border-slate-800 text-slate-200 hover:bg-slate-900/55"
        : "bg-white border border-slate-200 text-slate-800 hover:bg-slate-50",
    };
  }, [isDarkMode]);

  const onLogout = async () => {
    try {
      await supabase.auth.signOut();
    } finally {
      // Force navigation with a full reload so the app state resets immediately.
      window.location.assign("/");
    }
  };

  if (!userId) {
    return <Navigate to="/login" replace />;
  }

  const fullName = (dbUser as any)?.full_name || (user as any)?.user_metadata?.full_name || "";

  return (
    <div className={cx("min-h-screen", ui.page)} dir={dir}>
      <div className={cx("max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8", ui.content)}>
        <TopBar
          title={t("Customer Dashboard", "لوحة العميل")}
          right={
            <>
              <button
                onClick={() => setLanguage(lang === "ar" ? "en" : "ar")}
                className={cx("inline-flex items-center gap-2 px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-widest", ui.topBtn)}
                title={t("Switch language", "تغيير اللغة")}
              >
                <Languages size={16} />
                {lang === "ar" ? "EN" : "AR"}
              </button>

              <button
                onClick={toggleDarkMode}
                className={cx("inline-flex items-center gap-2 px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-widest", ui.topBtn)}
                title={t("Toggle theme", "تغيير الثيم")}
              >
                {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
                {isDarkMode ? t("Light", "فاتح") : t("Dark", "داكن")}
              </button>

              <button
                onClick={onLogout}
                className={cx(
                  "inline-flex items-center gap-2 px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-widest",
                  isDarkMode
                    ? "bg-rose-500/15 border border-rose-500/25 text-rose-200 hover:bg-rose-500/20"
                    : "bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100"
                )}
                title={t("Logout", "تسجيل الخروج")}
              >
                <LogOut size={16} />
                {t("Logout", "خروج")}
              </button>
            </>
          }
        />

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Sidebar */}
          <aside className={cx("lg:col-span-3 rounded-3xl border p-4", ui.sidebar)}>
            <div
              className={cx(
                "p-4 rounded-3xl",
                isDarkMode ? "bg-slate-950/35 border border-slate-900/60" : "bg-slate-50 border border-slate-200"
              )}
            >
              <p className={cx("text-[10px] font-black uppercase tracking-[0.25em]", isDarkMode ? "text-slate-400" : "text-slate-500")}>
                {t("Signed in as", "مسجل الدخول باسم")}
              </p>
              <p className={cx("mt-2 font-black truncate", isDarkMode ? "text-slate-50" : "text-slate-900")}>
                {fullName || (user as any)?.email}
              </p>
              <p className={cx("mt-1 text-xs font-bold truncate", isDarkMode ? "text-slate-400" : "text-slate-600")}>
                {(user as any)?.email}
              </p>
            </div>

            <nav className="mt-4 space-y-2">
              <NavLink end to="/dashboard/customer" className={({ isActive }) => ui.navItem(isActive)}>
                <Store size={16} />
                {t("Overview", "نظرة عامة")}
              </NavLink>

              <NavLink to="/dashboard/customer/bookings" className={({ isActive }) => ui.navItem(isActive)}>
                <CalendarDays size={16} />
                {t("My bookings", "حجوزاتي")}
              </NavLink>

              <NavLink to="/dashboard/customer/notifications" className={({ isActive }) => ui.navItem(isActive)}>
                <Bell size={16} />
                {t("Notifications", "الإشعارات")}
              </NavLink>

              <NavLink to="/dashboard/customer/settings" className={({ isActive }) => ui.navItem(isActive)}>
                <Settings size={16} />
                {t("Settings", "الإعدادات")}
              </NavLink>

              <Link to="/stores" className={ui.navItem(false)}>
                <ShoppingBag size={16} />
                {t("Browse stores", "تصفح المتاجر")}
              </Link>
            </nav>
          </aside>

          {/* Content */}
          <section className="lg:col-span-9 space-y-6">
            <Routes>
              <Route index element={<CustomerHome t={t} userId={userId} isDarkMode={isDarkMode} onBrowse={() => navigate("/stores")} />} />
              <Route path="bookings" element={<CustomerBookings t={t} userId={userId} isDarkMode={isDarkMode} />} />
              <Route path="notifications" element={<CustomerNotifications t={t} userId={userId} isDarkMode={isDarkMode} />} />
              <Route path="settings" element={<CustomerSettings t={t} lang={lang} userId={userId} isDarkMode={isDarkMode} userEmail={(user as any)?.email} />} />
              <Route path="*" element={<Navigate to="/dashboard/customer" replace />} />
            </Routes>
          </section>
        </div>
      </div>
    </div>
  );
}