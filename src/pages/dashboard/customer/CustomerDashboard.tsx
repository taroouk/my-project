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



type LoyaltyAccountRow = {
  id: string;
  merchant_id: string;
  customer_id: string;
  program_id: string;
  points_balance: number | null;
  lifetime_points: number | null;
  current_tier_id: string | null;
  last_activity_at?: string | null;
  updated_at?: string | null;
  created_at?: string | null;
};

type LoyaltyTierRow = {
  id: string;
  name: string | null;
  rank: number | null;
  points_threshold: number | null;
};

type LoyaltyRewardRow = {
  id: string;
  program_id: string;
  title: string;
  type: string;
  points_cost: number;
  is_active: boolean;
  created_at?: string | null;
};

type LoyaltyTxnRow = {
  id: string;
  merchant_id: string;
  program_id: string;
  txn_type: string;
  points_delta: number;
  amount: number | null;
  currency_code: string | null;
  reference_type: string | null;
  reference_id: string | null;
  note: string | null;
  created_at: string;
};

type MerchantPublicRow = {
  id: string;
  store_name: string | null;
  store_slug: string | null;
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
                    `${cartCount} item(s)`,
                    `${cartCount} عنصر`
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



function CustomerLoyalty({
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

  const [accounts, setAccounts] = useState<
    Array<
      LoyaltyAccountRow & {
        merchant?: MerchantPublicRow | null;
        tier?: LoyaltyTierRow | null;
      }
    >
  >([]);

  const [selectedKey, setSelectedKey] = useState<string>(""); // merchant_id::program_id
  const selected = useMemo(() => {
    if (!selectedKey) return null;
    return accounts.find((a) => `${a.merchant_id}::${a.program_id}` === selectedKey) || null;
  }, [accounts, selectedKey]);

  const [rewardsLoading, setRewardsLoading] = useState(false);
  const [rewardsError, setRewardsError] = useState<string>("");
  const [rewards, setRewards] = useState<LoyaltyRewardRow[]>([]);

  const [txLoading, setTxLoading] = useState(false);
  const [txError, setTxError] = useState<string>("");
  const [txs, setTxs] = useState<LoyaltyTxnRow[]>([]);

  const [actionMsg, setActionMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const pillCls = (kind: "ok" | "err") =>
    cx(
      "rounded-2xl border px-4 py-3 text-sm font-bold",
      kind === "ok"
        ? isDarkMode
          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-200"
          : "bg-emerald-50 border-emerald-200 text-emerald-700"
        : isDarkMode
        ? "bg-rose-500/10 border-rose-500/20 text-rose-200"
        : "bg-rose-50 border-rose-200 text-rose-700"
    );

  const loadAccounts = async () => {
    setLoading(true);
    setError("");
    setActionMsg(null);

    try {
      const { data: laRows, error: laErr } = await supabase
        .from("loyalty_accounts")
        .select(
          "id, merchant_id, customer_id, program_id, points_balance, lifetime_points, current_tier_id, last_activity_at, updated_at, created_at"
        )
        .eq("customer_id", userId)
        .order("updated_at", { ascending: false });

      if (laErr) throw new Error(laErr.message);

      const base = ((laRows as any) || []) as LoyaltyAccountRow[];
      if (!base.length) {
        setAccounts([]);
        setSelectedKey("");
        return;
      }

      const tierIds = Array.from(new Set(base.map((a) => a.current_tier_id).filter(Boolean))) as string[];
      let tiersById: Record<string, LoyaltyTierRow> = {};
      if (tierIds.length) {
        const { data: tierRows, error: tierErr } = await supabase
          .from("loyalty_tiers")
          .select("id, name, rank, points_threshold")
          .in("id", tierIds);
        if (!tierErr && Array.isArray(tierRows)) {
          for (const r of tierRows as any[]) tiersById[String(r.id)] = r as LoyaltyTierRow;
        }
      }

      const merchantIds = Array.from(new Set(base.map((a) => a.merchant_id).filter(Boolean))) as string[];
      let merchantsById: Record<string, MerchantPublicRow> = {};
      if (merchantIds.length) {
        const { data: spRows, error: spErr } = await supabase
          .from("store_public")
          .select("id, store_name, store_slug")
          .in("id", merchantIds);

        if (!spErr && Array.isArray(spRows)) {
          for (const r of spRows as any[]) merchantsById[String(r.id)] = r as MerchantPublicRow;
        }
      }

      const merged = base.map((a) => ({
        ...a,
        tier: a.current_tier_id ? tiersById[String(a.current_tier_id)] || null : null,
        merchant: merchantsById[String(a.merchant_id)] || null,
      }));

      setAccounts(merged);

      const first = merged[0];
      const key = `${first.merchant_id}::${first.program_id}`;
      setSelectedKey((prev) => prev || key);
    } catch (e: any) {
      setError(e?.message || t("Failed to load loyalty.", "فشل تحميل الولاء."));
    } finally {
      setLoading(false);
    }
  };

  const loadRewardsAndTx = async (merchantId: string, programId: string) => {
    setRewardsLoading(true);
    setRewardsError("");
    setRewards([]);
    setTxLoading(true);
    setTxError("");
    setTxs([]);
    setActionMsg(null);

    try {
      const rewardsReq = supabase
        .from("loyalty_rewards")
        .select("id, program_id, title, type, points_cost, is_active, created_at")
        .eq("program_id", programId)
        .eq("is_active", true)
        .order("points_cost", { ascending: true });

      const txReq = supabase
        .from("loyalty_transactions")
        .select(
          "id, merchant_id, program_id, txn_type, points_delta, amount, currency_code, reference_type, reference_id, note, created_at"
        )
        .eq("customer_id", userId)
        .eq("merchant_id", merchantId)
        .eq("program_id", programId)
        .order("created_at", { ascending: false })
        .limit(20);

      const [rRes, txRes] = await Promise.all([rewardsReq, txReq]);

      if (rRes.error) throw new Error(rRes.error.message);
      if (txRes.error) {
        const m = String(txRes.error.message || "");
        // If the customer role doesn't have SELECT on loyalty_transactions, don't break the page.
        if (m.toLowerCase().includes("permission denied")) {
          setTxs([]);
        } else {
          throw new Error(m);
        }
      }

      setRewards(((rRes.data as any) || []) as LoyaltyRewardRow[]);
      setTxs(((txRes.data as any) || []) as LoyaltyTxnRow[]);
    } catch (e: any) {
      const msg = e?.message || t("Failed to load details.", "فشل تحميل التفاصيل.");
      setRewardsError(msg);
      setTxError(msg);
    } finally {
      setRewardsLoading(false);
      setTxLoading(false);
    }
  };

  useEffect(() => {
    if (!userId) return;
    loadAccounts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  useEffect(() => {
    if (!selected) return;
    loadRewardsAndTx(selected.merchant_id, selected.program_id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedKey]);

  const redeem = async (reward: LoyaltyRewardRow) => {
    setActionMsg(null);
    if (!selected) return;

    // 1) Try the RPC if it exists
    try {
      const { data, error } = await supabase.rpc("redeem_reward", { p_reward_id: reward.id });
      if (error) throw error;

      setActionMsg({
        type: "ok",
        text:
          typeof data === "string"
            ? data
            : t("Redeemed successfully.", "تم الاستبدال بنجاح."),
      });

      // refresh UI
      await loadAccounts();
        await loadRewardsAndTx(selected.merchant_id, selected.program_id);
      return;
    } catch (e: any) {
      const msg = String(e?.message || e || "");

    // If the DB RPC is outdated/mismatched (common after schema tweaks), show a clear message
    if (msg.includes('record "v_reward" has no field "merchant_id"')) {
      setActionMsg({
        type: "err",
        text:
          msg +
          " — DB function redeem_reward is outdated. Drop & recreate redeem_reward with merchant_id resolved (join rewards -> programs).",
      });
      return;
    }

      // If the RPC fails because it doesn't insert account_id / program_id properly,
      // fall back to a safe client-side redeem (NO schema changes needed).
      const shouldFallback =
        msg.includes('null value in column "account_id"') ||
        msg.includes('null value in column "program_id"') ||
        msg.includes('null value in column "merchant_id"') ||
        msg.includes('null value in column "customer_id"') ||
        msg.includes("loyalty_transactions") ||
        msg.includes("loyalty_accounts");

      if (!shouldFallback) {
        setActionMsg({
          type: "err",
          text: msg || t("Redeem failed.", "فشل الاستبدال."),
        });
        return;
      }

      // 2) Client-side redeem (writes correctly to loyalty_transactions + updates balance)
      try {
        const cost = Number(reward.points_cost ?? 0);
        if (!cost || cost <= 0) {
          throw new Error(t("Invalid reward cost.", "تكلفة المكافأة غير صحيحة."));
        }

        if ((selected.points_balance ?? 0) < cost) {
          throw new Error(t("Not enough points.", "نقاطك غير كافية."));
        }

        // currency_code is required on loyalty_transactions; get it from the program (fallback to EGP)
        let currency = "EGP";
        if (selected.program_id) {
          const { data: programRow } = await supabase
            .from("loyalty_programs")
            .select("currency_code")
            .eq("id", selected.program_id)
            .maybeSingle();
          if (programRow?.currency_code) currency = programRow.currency_code;
        }

        // Insert transaction (txn_type must match your enum; we use 'redeem_points' like existing history)
        const { error: txnErr } = await supabase.from("loyalty_transactions").insert({
          account_id: selected.id,
          program_id: selected.program_id,
          merchant_id: selected.merchant_id,
          customer_id: (selected as any).customer_id,
          txn_type: "redeem_points",
          points_delta: -cost,
          amount: 0,
          currency_code: currency,
          reference_type: "reward",
          reference_id: reward.id,
                        note: `Redeemed reward: ${String((reward as any)?.title ?? "").trim()}`.trim(),
          meta: {},
        });

        if (txnErr) throw new Error(txnErr.message);

        // Update account balance
        const newBalance = Number(selected.points_balance ?? 0) - cost;
        const { error: accErr } = await supabase
          .from("loyalty_accounts")
          .update({
            points_balance: newBalance,
            last_activity_at: new Date().toISOString(),
          })
          .eq("id", selected.id);

        if (accErr) throw new Error(accErr.message);

        setActionMsg({
          type: "ok",
          text: t("Redeemed successfully.", "تم الاستبدال بنجاح."),
        });

        await loadAccounts();
        await loadRewardsAndTx(selected.merchant_id, selected.program_id);
      } catch (inner: any) {
        setActionMsg({
          type: "err",
          text: String(inner?.message || inner || t("Redeem failed.", "فشل الاستبدال.")),
        });
      }
    }
  };

  if (loading) {
    return (
      <SectionCard title={t("Loyalty", "الولاء")}>
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
      <SectionCard title={t("Loyalty", "الولاء")}>
        <div className={cx(
          "rounded-2xl border px-4 py-3 text-sm font-bold",
          isDarkMode
            ? "bg-rose-500/10 border-rose-500/20 text-rose-200"
            : "bg-rose-50 border-rose-200 text-rose-700"
        )}>
          {error}
        </div>
        <button
          onClick={loadAccounts}
          className="mt-5 inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-black text-white hover:bg-slate-800 font-black text-xs uppercase tracking-widest dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
        >
          <RefreshCcw size={16} />
          {t("Retry", "إعادة")}
        </button>
      </SectionCard>
    );
  }

  if (!accounts.length) {
    return (
      <EmptyState
        title={t("No loyalty yet", "لا يوجد ولاء بعد")}
        subtitle={t(
          "Once you place a paid order with a merchant that has a loyalty program, your points will appear here.",
          "بعد ما تعمل طلب مدفوع عند تاجر عنده برنامج ولاء، نقاطك هتظهر هنا."
        )}
        icon={<Coins className="text-slate-900 dark:text-slate-100" size={18} />}
      />
    );
  }

  const selectedMerchantName = selected?.merchant?.store_name || t("Merchant", "التاجر");

  return (
    <div className="space-y-6">
      <TopBar
        title={t("Loyalty", "الولاء")}
        right={
          <button
            onClick={loadAccounts}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-black text-white hover:bg-slate-800 font-black text-xs uppercase tracking-widest dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
            title={t("Refresh", "تحديث")}
          >
            <RefreshCcw size={16} />
            {t("Refresh", "تحديث")}
          </button>
        }
      />

      {actionMsg && (
        <div className={pillCls(actionMsg.type)}>{actionMsg.text}</div>
      )}

      <SectionCard title={t("My merchants", "تجّاري")}>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <div className={cx("text-[11px] font-black uppercase tracking-[0.25em]", isDarkMode ? "text-slate-300" : "text-slate-600")}>
              {t("Select merchant program", "اختر برنامج التاجر")}
            </div>
            <select
              value={selectedKey}
              onChange={(e) => setSelectedKey(e.target.value)}
              className={cx(
                "mt-2 w-full px-4 py-3 rounded-2xl border text-sm font-bold outline-none transition",
                isDarkMode
                  ? "bg-slate-950/30 border-slate-900/60 text-slate-100 focus:border-slate-700"
                  : "bg-white border-slate-200 text-slate-900 focus:border-slate-300"
              )}
            >
              {accounts.map((a) => {
                const name = a.merchant?.store_name || t("Merchant", "التاجر");
                const pts = Number(a.points_balance ?? 0) || 0;
                return (
                  <option key={`${a.merchant_id}::${a.program_id}`} value={`${a.merchant_id}::${a.program_id}`}>
                    {name} — {t("Points", "نقاط")}: {pts}
                  </option>
                );
              })}
            </select>

            {selected?.merchant?.store_slug ? (
              <p className={cx("mt-3 text-xs font-bold", isDarkMode ? "text-slate-400" : "text-slate-600")}>
                {t("Store", "المتجر")}:{" "}
                <a
                  className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-300 dark:hover:text-indigo-200"
                  href={`/s/${selected.merchant.store_slug}`}
                >
                  /s/{selected.merchant.store_slug}
                </a>
              </p>
            ) : null}
          </div>

          <div className={cx("rounded-2xl border p-5", isDarkMode ? "border-slate-900/60 bg-slate-950/20" : "border-slate-200 bg-white")}>
            <p className={cx("text-[10px] font-black uppercase tracking-[0.25em]", isDarkMode ? "text-slate-400" : "text-slate-500")}>
              {t("Selected", "المحدد")}
            </p>
            <p className={cx("mt-2 text-lg font-black", isDarkMode ? "text-slate-50" : "text-slate-900")}>
              {selectedMerchantName}
            </p>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className={cx("rounded-2xl border p-4", isDarkMode ? "border-slate-900/60 bg-slate-950/30" : "border-slate-200 bg-slate-50")}>
                <p className={cx("text-[10px] font-black uppercase tracking-[0.25em]", isDarkMode ? "text-slate-400" : "text-slate-500")}>
                  {t("Points", "النقاط")}
                </p>
                <p className={cx("mt-1 text-2xl font-black", isDarkMode ? "text-slate-50" : "text-slate-900")}>
                  {Number(selected?.points_balance ?? 0) || 0}
                </p>
              </div>

              <div className={cx("rounded-2xl border p-4", isDarkMode ? "border-slate-900/60 bg-slate-950/30" : "border-slate-200 bg-slate-50")}>
                <p className={cx("text-[10px] font-black uppercase tracking-[0.25em]", isDarkMode ? "text-slate-400" : "text-slate-500")}>
                  {t("Tier", "المستوى")}
                </p>
                <p className={cx("mt-1 text-2xl font-black truncate", isDarkMode ? "text-slate-50" : "text-slate-900")}>
                  {selected?.tier?.name || t("—", "—")}
                </p>
              </div>
            </div>

            <p className={cx("mt-3 text-xs font-bold", isDarkMode ? "text-slate-400" : "text-slate-600")}>
              {t("Lifetime points", "إجمالي النقاط")}:{" "}
              <span className={cx("font-black", isDarkMode ? "text-slate-200" : "text-slate-900")}>
                {Number(selected?.lifetime_points ?? 0) || 0}
              </span>
            </p>
          </div>
        </div>
      </SectionCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SectionCard title={t("Rewards", "المكافآت")}>
          {rewardsLoading ? (
            <p className="text-sm text-slate-600 dark:text-slate-400">{t("Loading rewards...", "جاري تحميل المكافآت...")}</p>
          ) : rewardsError ? (
            <div className={pillCls("err")}>{rewardsError}</div>
          ) : !rewards.length ? (
            <p className="text-sm text-slate-600 dark:text-slate-400">{t("No rewards available.", "لا توجد مكافآت متاحة.")}</p>
          ) : (
            <div className="space-y-3">
              {rewards.map((r) => {
                const cost = Number(r.points_cost ?? 0) || 0;
                const canRedeem = (Number(selected?.points_balance ?? 0) || 0) >= cost;
                return (
                  <div
                    key={r.id}
                    className={cx(
                      "p-4 rounded-2xl border",
                      isDarkMode ? "border-slate-900/60 bg-slate-950/20" : "border-slate-200 bg-white"
                    )}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className={cx("font-black truncate", isDarkMode ? "text-slate-50" : "text-slate-900")}>
                          {r.title}
                        </p>
                        <p className={cx("mt-1 text-sm", isDarkMode ? "text-slate-400" : "text-slate-600")}>
                          {t("Type", "النوع")}:{" "}
                          <span className={cx("font-black", isDarkMode ? "text-slate-200" : "text-slate-800")}>
                            {String(r.type || "").toUpperCase()}
                          </span>
                          {" · "}
                          {t("Cost", "التكلفة")}:{" "}
                          <span className={cx("font-black", isDarkMode ? "text-slate-200" : "text-slate-800")}>
                            {cost}
                          </span>{" "}
                          {t("points", "نقطة")}
                        </p>
                      </div>

                      <button
                        onClick={() => redeem(r)}
                        disabled={!canRedeem}
                        className={cx(
                          "shrink-0 inline-flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-widest border transition",
                          canRedeem
                            ? isDarkMode
                              ? "bg-white text-slate-900 hover:bg-slate-100 border-white/20"
                              : "bg-black text-white hover:bg-slate-900 border-black/10"
                            : isDarkMode
                            ? "bg-slate-950/20 text-slate-500 border-slate-900/60 cursor-not-allowed"
                            : "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                        )}
                        title={canRedeem ? t("Redeem", "استبدال") : t("Not enough points", "نقاط غير كافية")}
                      >
                        <Coins size={16} />
                        {t("Redeem", "استبدال")}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </SectionCard>

        <SectionCard title={t("History", "السجل")}>
          {txLoading ? (
            <p className="text-sm text-slate-600 dark:text-slate-400">{t("Loading history...", "جاري تحميل السجل...")}</p>
          ) : txError ? (
            <div className={pillCls("err")}>{txError}</div>
          ) : !txs.length ? (
            <p className="text-sm text-slate-600 dark:text-slate-400">{t("No activity yet.", "لا توجد عمليات بعد.")}</p>
          ) : (
            <div className="space-y-3">
              {txs.map((x) => (
                <div
                  key={x.id}
                  className={cx(
                    "p-4 rounded-2xl border",
                    isDarkMode ? "border-slate-900/60 bg-slate-950/20" : "border-slate-200 bg-white"
                  )}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className={cx("font-black truncate", isDarkMode ? "text-slate-50" : "text-slate-900")}>
                        {x.note || t("Loyalty transaction", "عملية ولاء")}
                      </p>
                      <p className={cx("mt-1 text-sm truncate", isDarkMode ? "text-slate-400" : "text-slate-600")}>
                        <span className={cx("font-black", isDarkMode ? "text-slate-200" : "text-slate-800")}>
                          {String(x.txn_type).split("_").join(" ").toUpperCase()}
                        </span>
                        {" · "}
                        {formatDate(x.created_at)}
                      </p>
                    </div>

                    <div className="shrink-0 text-right">
                      <p className={cx("text-lg font-black", isDarkMode ? "text-slate-50" : "text-slate-900")}>
                        {x.points_delta > 0 ? `+${x.points_delta}` : `${x.points_delta}`}
                      </p>
                      <p className={cx("text-[11px] font-bold", isDarkMode ? "text-slate-400" : "text-slate-600")}>
                        {t("points", "نقطة")}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>
    </div>
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
          
            <><SectionCard title={t("Quick guide", "دليل سريع")}>
              <div className={cx("space-y-2 text-sm", isDarkMode ? "text-slate-300" : "text-slate-700")}>
                <div className="flex items-start gap-3">
                  <div className={cx(
                    "mt-1 size-6 rounded-full grid place-items-center text-[11px] font-black",
                    isDarkMode ? "bg-slate-900/60 text-slate-100" : "bg-slate-100 text-slate-900"
                  )}>1</div>
                  <p className="leading-relaxed">
                    {t(
                      "Choose a store program from the dropdown — each store has its own points balance.",
                      "اختار برنامج التاجر من القائمة — كل تاجر له رصيد نقاط مختلف."
                    )}
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <div className={cx(
                    "mt-1 size-6 rounded-full grid place-items-center text-[11px] font-black",
                    isDarkMode ? "bg-slate-900/60 text-slate-100" : "bg-slate-100 text-slate-900"
                  )}>2</div>
                  <p className="leading-relaxed">
                    {t(
                      "Your points update automatically after orders become paid/completed.",
                      "النقاط بتتحدث تلقائيًا بعد ما الطلب يبقى مدفوع/مكتمل."
                    )}
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <div className={cx(
                    "mt-1 size-6 rounded-full grid place-items-center text-[11px] font-black",
                    isDarkMode ? "bg-slate-900/60 text-slate-100" : "bg-slate-100 text-slate-900"
                  )}>3</div>
                  <p className="leading-relaxed">
                    {t(
                      "If you have enough points, press Redeem to claim a reward. Your balance will decrease.",
                      "لو معاك نقاط كفاية اضغط استبدال عشان تحصل على المكافأة — رصيدك هينقص."
                    )}
                  </p>
                </div>
              </div>
            </SectionCard><div className="grid gap-6 lg:grid-cols-2">
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
                          placeholder={t("+20 10...", "+20 10...")} />
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
                              if (error)
                                throw error;
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
                        } }
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
                          type="email" />
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
                          type="password" />
                      </div>
                      <div>
                        <div className={labelCls}>{t("Confirm password", "تأكيد كلمة السر")}</div>
                        <input
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className={inputCls}
                          placeholder={t("Repeat password", "أعد كلمة السر")}
                          type="password" />
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
                        } }
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
              </div></>
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

<NavLink to="/dashboard/customer/loyalty" className={({ isActive }) => ui.navItem(isActive)}>
  <Coins size={16} />
  {t("Loyalty", "الولاء")}
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
                            <Route path="loyalty" element={<CustomerLoyalty t={t} userId={userId} isDarkMode={isDarkMode} />} />
<Route path="settings" element={<CustomerSettings t={t} lang={lang} userId={userId} isDarkMode={isDarkMode} userEmail={(user as any)?.email} />} />
              <Route path="*" element={<Navigate to="/dashboard/customer" replace />} />
            </Routes>
          </section>
        </div>
      </div>
    </div>
  );
}