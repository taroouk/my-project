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
export type ThemePreference = "grid" | "list" | "cards";
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
    .select("id, store_name, store_slug, role, brand_color, theme_preference, currency")
    .eq("store_slug", safeSlug)
    .eq("role", "merchant")
    .maybeSingle();

  const { data, error } = res as any;
  if (error) throw new Error(error.message);
  return (data as StorePublic) || null;
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
