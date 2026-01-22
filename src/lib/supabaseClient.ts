import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase environment variables");
  throw new Error("Missing Supabase environment variables. Please check your .env file.");
}

// Test URL format
try {
  new URL(supabaseUrl);
} catch {
  console.error("Invalid Supabase URL format:", supabaseUrl);
  throw new Error("Invalid Supabase URL format");
}

/**
 * ✅ IMPORTANT:
 * - persistSession: يخلي session تفضل موجودة بعد ما تقفل/تفتح
 * - autoRefreshToken: يجدد التوكن تلقائي
 * - detectSessionInUrl: مهم للـ magic link / email confirm
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: localStorage,
  },
});

// =====================
// Shared Types
// =====================
// ✅ توسعة ThemePreference (بدون تغيير أي منطق)
export type ThemePreference = "grid" | "list" | "cards" | "minimal" | "hero" | "catalog";
export type Currency = "SAR" | "EGP" | "AED" | "USD";

// =====================
// User row (partial)
// =====================
export interface User {
  id: string;
  email: string;
  full_name?: string;
  company_name?: string;
  phone?: string;
  subscription_plan: "basic" | "professional" | "enterprise";
  created_at: string;
  role: "admin" | "merchant" | "customer";

  // store fields (optional)
  store_slug?: string | null;
  store_name?: string | null;
  theme_preference?: ThemePreference | null;
  currency?: Currency | null;
  brand_color?: string | null;

  // ✅ category (optional)
  business_type?: string | null;

  loyalty_points?: number | null;
  total_purchases?: number | null;
  total_rewards?: number | null;
}

export type UserInsert = Omit<
  User,
  | "id"
  | "created_at"
  | "email"
  | "phone"
  | "company_name"
  | "full_name"
  | "subscription_plan"
  | "role"
>;

// =====================
// Public Storefront Types
// =====================
export type StorePublic = {
  id: string;
  store_name: string | null;
  store_slug: string | null;
  role: string | null;
  brand_color: string | null;
  theme_preference: ThemePreference | null;
  currency: Currency | null;

  // ✅ NEW: show category in directory
  business_type: string | null;
};

export type MerchantListRow = {
  id: string;
  store_name: string | null;
  store_slug: string | null;
  role: string | null;
  brand_color: string | null;
  theme_preference: ThemePreference | null;
  currency: Currency | null;

  // ✅ مهم للصفحة الجديدة
  business_type: string | null;
};

export type ServiceRow = {
  id: string;
  merchant_id: string | null;
  name: string | null;
  description: string | null;
  price: number | null;
  is_active: boolean | null;
  created_at: string | null;
};

export type ProductRow = {
  id: string;
  merchant_id: string | null;
  name: string | null;
  description: string | null;
  price: number | null;
  is_active: boolean | null;
  created_at: string | null;
};

// =====================
// Helpers
// =====================

/**
 * ✅ PromiseLike timeout helper
 * (Supabase builder is thenable, so TS accepts PromiseLike)
 */
export function withTimeout<T>(promiseLike: PromiseLike<T>, ms: number, label = "Request"): Promise<T> {
  let timer: number | undefined;

  const timeoutPromise = new Promise<T>((_, reject) => {
    timer = window.setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms);
  });

  const realPromise = Promise.resolve(promiseLike as any);

  return Promise.race([realPromise, timeoutPromise]).finally(() => {
    if (timer) window.clearTimeout(timer);
  });
}

export async function supabasePing(timeoutMs = 1500): Promise<boolean> {
  try {
    const controller = new AbortController();
    const t = window.setTimeout(() => controller.abort(), timeoutMs);

    const r = await fetch(supabaseUrl!, {
      method: "GET",
      mode: "no-cors",
      signal: controller.signal,
    });

    window.clearTimeout(t);

    return !!r;
  } catch {
    return false;
  }
}

// =====================
// Public fetchers
// =====================

export async function getPublicStoreBySlug(slug: string): Promise<StorePublic | null> {
  const safeSlug = (slug || "").trim().toLowerCase();
  if (!safeSlug) return null;

  const res = await supabase
    .from("users")
    // ✅ ADD business_type فقط
    .select("id, store_name, store_slug, role, brand_color, theme_preference, currency, business_type")
    .eq("store_slug", safeSlug)
    .eq("role", "merchant")
    .maybeSingle();

  const { data, error } = res as any;
  if (error) throw new Error(error.message);
  return (data as StorePublic) || null;
}

export async function getPublicMerchantsList(): Promise<MerchantListRow[]> {
  const res = await supabase
    .from("users")
    .select("id, store_name, store_slug, role, brand_color, theme_preference, currency, business_type")
    .eq("role", "merchant")
    .not("store_slug", "is", null)
    .order("created_at", { ascending: false });

  const { data, error } = res as any;
  if (error) throw new Error(error.message);
  return (data as MerchantListRow[]) || [];
}

/**
 * ✅ NEW: Directory fetcher — يرجع كل التجار اللي عندهم store_slug
 * (بدون ما نغير أي Backend)
 */
export async function getPublicStoresDirectory(limit = 200): Promise<StorePublic[]> {
  const res = await supabase
    .from("users")
    .select("id, store_name, store_slug, role, brand_color, theme_preference, currency, business_type")
    .eq("role", "merchant")
    .not("store_slug", "is", null)
    .order("created_at", { ascending: false })
    .limit(limit);

  const { data, error } = res as any;
  if (error) throw new Error(error.message);
  return (data as StorePublic[]) || [];
}

export async function getPublicServicesByMerchant(merchantId: string): Promise<ServiceRow[]> {
  if (!merchantId) return [];

  const res = await supabase
    .from("services")
    .select("id, merchant_id, name, description, price, is_active, created_at")
    .eq("merchant_id", merchantId)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  const { data, error } = res as any;
  if (error) throw new Error(error.message);
  return (data as ServiceRow[]) || [];
}

export async function getPublicProductsByMerchant(merchantId: string): Promise<ProductRow[]> {
  if (!merchantId) return [];

  const res = await supabase
    .from("products")
    .select("id, merchant_id, name, description, price, is_active, created_at")
    .eq("merchant_id", merchantId)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  const { data, error } = res as any;
  if (error) throw new Error(error.message);
  return (data as ProductRow[]) || [];
}

// =====================
// ✅ Cart (NEW) — إضافة فقط بدون لمس أي حاجة فوق
// =====================

export type AddCartItemInput = {
  merchantId: string;
  itemType: "service" | "product";
  serviceId?: string;
  productId?: string;
  quantity?: number;
  priceSnapshot: number;
  nameSnapshot: string;
};

export async function addCartItem(input: AddCartItemInput) {
  // لازم يبقى المستخدم authenticated (بنضمن ده من StoreFront)
  const { data: userRes, error: userErr } = await supabase.auth.getUser();
  if (userErr) throw new Error(userErr.message);
  const authUserId = userRes?.user?.id;
  if (!authUserId) throw new Error("Not authenticated");

  // 1) هات Active cart أو أنشئ واحد
  const { data: existingCart, error: cartErr } = await supabase
    .from("carts")
    .select("id")
    .eq("customer_id", authUserId)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (cartErr) throw new Error(cartErr.message);

  let cartId = existingCart?.id as string | undefined;

  if (!cartId) {
    const { data: newCart, error: newCartErr } = await supabase
      .from("carts")
      .insert({ customer_id: authUserId, status: "active" })
      .select("id")
      .single();

    if (newCartErr) throw new Error(newCartErr.message);
    cartId = newCart.id;
  }

  const quantity = Math.max(1, Number(input.quantity ?? 1));

  // 2) لو نفس المنتج/الخدمة موجودة، زود الكمية بدل insert جديد
  const matchQuery = supabase
    .from("cart_items")
    .select("id, quantity")
    .eq("cart_id", cartId)
    .eq("merchant_id", input.merchantId)
    .eq("item_type", input.itemType);

  const matchRes =
    input.itemType === "service"
      ? await matchQuery.eq("service_id", input.serviceId ?? "").maybeSingle()
      : await matchQuery.eq("product_id", input.productId ?? "").maybeSingle();

  const { data: existingItem, error: matchErr } = matchRes as any;
  if (matchErr) {
    // لو الـ maybeSingle فشل بسبب شرط ناقص، هنكمل insert عادي
  }

  if (existingItem?.id) {
    const { error: updErr } = await supabase
      .from("cart_items")
      .update({ quantity: Number(existingItem.quantity ?? 1) + quantity })
      .eq("id", existingItem.id);

    if (updErr) throw new Error(updErr.message);
    return { cartId, updated: true, itemId: existingItem.id };
  }

  // 3) insert جديد
  const payload: any = {
    cart_id: cartId,
    merchant_id: input.merchantId,
    item_type: input.itemType,
    quantity,
    price_snapshot: Number(input.priceSnapshot ?? 0),
    name_snapshot: input.nameSnapshot ?? "",
    service_id: null,
    product_id: null,
  };

  if (input.itemType === "service") payload.service_id = input.serviceId ?? null;
  if (input.itemType === "product") payload.product_id = input.productId ?? null;

  const { data: inserted, error: insErr } = await supabase.from("cart_items").insert(payload).select("id").single();
  if (insErr) throw new Error(insErr.message);

  return { cartId, updated: false, itemId: inserted.id };
}
// =====================
// ✅ Cart (READ/UPDATE/CHECKOUT) — additions
// =====================

export type CartRow = {
  id: string;
  customer_id: string;
  status: "active" | "checked_out" | "abandoned" | string;
  created_at: string;
  updated_at: string;
};

export type CartItemRow = {
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

export type CartSummary = {
  total_amount: number;
  cartId: string | null;
  itemsCount: number;
  total: number;
  currency: Currency;
};

export async function getActiveCart(): Promise<CartRow | null> {
  const { data: userRes, error: userErr } = await supabase.auth.getUser();
  if (userErr) throw new Error(userErr.message);
  const authUserId = userRes?.user?.id;
  if (!authUserId) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("carts")
    .select("id, customer_id, status, created_at, updated_at")
    .eq("customer_id", authUserId)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return (data as any) || null;
}

export async function getCartItems(cartId: string): Promise<CartItemRow[]> {
  if (!cartId) return [];
  const { data, error } = await supabase
    .from("cart_items")
    .select("id, cart_id, merchant_id, item_type, service_id, product_id, quantity, price_snapshot, name_snapshot, created_at")
    .eq("cart_id", cartId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data as any) || [];
}

export async function updateCartItemQty(itemId: string, quantity: number) {
  const q = Math.max(1, Number(quantity || 1));
  const { error } = await supabase.from("cart_items").update({ quantity: q }).eq("id", itemId);
  if (error) throw new Error(error.message);
}

export async function removeCartItem(itemId: string) {
  const { error } = await supabase.from("cart_items").delete().eq("id", itemId);
  if (error) throw new Error(error.message);
}

/**
 * ✅ Summary for dashboard + cart header
 * - itemsCount: sum(quantity)
 * - total: sum(quantity * price_snapshot)
 * - currency: من users.currency لو موجودة، وإلا SAR
 */
export async function getCartSummary(userId: string): Promise<CartSummary> {
  const { data: userRes, error: userErr } = await supabase.auth.getUser();
  if (userErr) throw new Error(userErr.message);
  const authUserId = userRes?.user?.id;
  if (!authUserId) throw new Error("Not authenticated");

  const cart = await getActiveCart();
  if (!cart?.id) {
    // حاول نجيب currency من users
    const { data: u } = await supabase.from("users").select("currency").eq("id", authUserId).maybeSingle();
    return { cartId: null, itemsCount: 0, total: 0, total_amount: 0, currency: (u?.currency as Currency) || "SAR" };
  }

  const items = await getCartItems(cart.id);
  const itemsCount = items.reduce((acc, it) => acc + Number(it.quantity || 0), 0);
  const total = items.reduce((acc, it) => acc + Number(it.quantity || 0) * Number(it.price_snapshot || 0), 0);

  const { data: u } = await supabase.from("users").select("currency").eq("id", authUserId).maybeSingle();
  return { cartId: cart.id, itemsCount, total, total_amount: total, currency: (u?.currency as Currency) || "SAR" };
}

/**
 * ✅ Checkout (RPC)
 * لازم يكون عندك function: public.checkout_cart(cart_id uuid, notes text) returns uuid
 * لو اسمها مختلف قولّي.
 */
export async function checkoutCart(cartId: string, notes = ""): Promise<string> {
  if (!cartId) throw new Error("Missing cart id");
  const { data, error } = await supabase.rpc("checkout_cart", { p_cart_id: cartId, p_notes: notes });
  if (error) throw new Error(error.message);
  // بعض الـ RPC بيرجع uuid مباشرة
  return String(data);
}
