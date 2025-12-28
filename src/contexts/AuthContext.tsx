import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { supabase, withTimeout } from "../lib/supabaseClient";
import { User as SupabaseUser } from "@supabase/auth-js";

export interface DBUser {
  id: string;
  email: string;
  full_name?: string;
  role: "admin" | "merchant" | "customer";
  store_name?: string;
  store_slug?: string;
  brand_color?: string;
  phone?: string;
  country?: string;
  region?: string;
  loyalty_points?: number;
  currency?: "SAR" | "EGP" | "AED" | "USD";
  setup_complete?: boolean;
  created_at?: string;
  theme_preference?: string;
}

interface AuthContextType {
  user: SupabaseUser | null;
  dbUser: DBUser | null;
  role: "admin" | "merchant" | "customer" | null;
  loading: boolean; // session loading
  dbLoaded: boolean; // dbUser ready (cache or network)
  signUp: (email: string, password: string, role: DBUser["role"], metadata: Partial<DBUser>) => Promise<any>;
  signIn: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateProfile: (updates: Partial<DBUser>) => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// =====================
// Local Cache Keys
// =====================
const LS_DBUSER = (uid: string) => `servly_dbuser_${uid}`;
const LS_DBUSER_TS = (uid: string) => `servly_dbuser_ts_${uid}`;

// cache TTL (10 minutes)
const DBUSER_TTL_MS = 10 * 60 * 1000;

// DB fetch timeout (very important to avoid infinite loading)
const DB_FETCH_TIMEOUT_MS = 4500;

function safeJsonParse<T>(raw: string | null): T | null {
  try {
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [dbUser, setDbUser] = useState<DBUser | null>(null);
  const [role, setRole] = useState<AuthContextType["role"]>(null);

  const [loading, setLoading] = useState(true);
  const [dbLoaded, setDbLoaded] = useState(false);

  const refreshInFlight = useRef(false);
  const lastUserId = useRef<string | null>(null);
  const initialized = useRef(false);

  // =====================
  // Cache helpers
  // =====================
  const readCachedDBUser = useCallback((uid: string): DBUser | null => {
    const cached = safeJsonParse<DBUser>(localStorage.getItem(LS_DBUSER(uid)));
    if (!cached) return null;
    return cached;
  }, []);

  const writeCachedDBUser = useCallback((u: DBUser) => {
    try {
      localStorage.setItem(LS_DBUSER(u.id), JSON.stringify(u));
      localStorage.setItem(LS_DBUSER_TS(u.id), String(Date.now()));
    } catch {
      // ignore
    }
  }, []);

  const clearCachedDBUser = useCallback((uid: string) => {
    try {
      localStorage.removeItem(LS_DBUSER(uid));
      localStorage.removeItem(LS_DBUSER_TS(uid));
    } catch {
      // ignore
    }
  }, []);

  const isCacheFresh = useCallback((uid: string) => {
    const tsRaw = localStorage.getItem(LS_DBUSER_TS(uid));
    const ts = tsRaw ? Number(tsRaw) : 0;
    if (!ts || Number.isNaN(ts)) return false;
    return Date.now() - ts < DBUSER_TTL_MS;
  }, []);

  // =====================
  // Fetch DB user (with timeout)
  // =====================
  const fetchDBUser = useCallback(
    async (userId: string, opts?: { soft?: boolean }) => {
      if (!opts?.soft) setDbLoaded(false);

      try {
        const query = supabase.from("users").select("*").eq("id", userId).maybeSingle();

        // ✅ IMPORTANT: prevent hanging forever
        const { data, error } = (await withTimeout(query as any, DB_FETCH_TIMEOUT_MS, "DB user fetch")) as any;

        if (error) throw error;

        if (data) {
          const row = data as DBUser;
          setDbUser(row);
          setRole(row.role);
          writeCachedDBUser(row);
        } else {
          setDbUser(null);
          setRole(null);
          clearCachedDBUser(userId);
        }
      } catch (err) {
        console.error("[Auth] fetchDBUser error", err);

        // ✅ fallback to cache if available
        const cached = readCachedDBUser(userId);
        if (cached) {
          setDbUser(cached);
          setRole(cached.role);
        } else {
          setDbUser(null);
          setRole(null);
        }
      } finally {
        // ✅ always stop loading here
        setDbLoaded(true);
      }
    },
    [clearCachedDBUser, readCachedDBUser, writeCachedDBUser]
  );

  // =====================
  // Refresh user/session (single source of truth)
  // =====================
  const refreshUser = useCallback(async () => {
    if (refreshInFlight.current) return;
    refreshInFlight.current = true;

    try {
      const { data } = await supabase.auth.getSession();
      const sessionUser = data.session?.user ?? null;

      setUser(sessionUser);

      if (!sessionUser) {
        lastUserId.current = null;
        setDbUser(null);
        setRole(null);
        setDbLoaded(true);
        return;
      }

      // ✅ show cache immediately
      const cached = readCachedDBUser(sessionUser.id);
      if (cached) {
        setDbUser(cached);
        setRole(cached.role);
        setDbLoaded(true);
      } else {
        setDbLoaded(false);
      }

      // ✅ if same user + fresh cache, skip DB hit
      if (lastUserId.current === sessionUser.id && cached && isCacheFresh(sessionUser.id)) {
        return;
      }

      lastUserId.current = sessionUser.id;
      await fetchDBUser(sessionUser.id, { soft: true });
    } finally {
      refreshInFlight.current = false;
    }
  }, [fetchDBUser, isCacheFresh, readCachedDBUser]);

  // =====================
  // Init + subscribe
  // =====================
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const init = async () => {
      await refreshUser();
      setLoading(false);
    };

    init();

    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const u = session?.user ?? null;
      setUser(u);

      if (!u) {
        lastUserId.current = null;
        setDbUser(null);
        setRole(null);
        setDbLoaded(true);
        return;
      }

      // ✅ show cache immediately
      const cached = readCachedDBUser(u.id);
      if (cached) {
        setDbUser(cached);
        setRole(cached.role);
        setDbLoaded(true);
      } else {
        setDbLoaded(false);
      }

      lastUserId.current = u.id;

      // ✅ fetch in background (but with timeout) to sync latest
      await fetchDBUser(u.id, { soft: true });
    });

    return () => sub.subscription.unsubscribe();
  }, [fetchDBUser, readCachedDBUser, refreshUser]);

  // =====================
  // Actions
  // =====================
  const signUp: AuthContextType["signUp"] = async (email, password, role, metadata) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { ...metadata, role, setup_complete: false },
    },
  });

  if (error) return { error: error.message, data };

  if (data.user) {
    const upsertRow: Partial<DBUser> = {
      id: data.user.id,
      email,
      role,
      setup_complete: false,
      ...metadata,
    };

    const { error: upErr } = await supabase.from("users").upsert(upsertRow);
    if (upErr) return { error: upErr.message, data };

    // ✅ cache minimal valid DBUser shape (so UI doesn't get stuck)
    const cachedRow = {
      id: data.user.id,
      email,
      role,
      setup_complete: false,
      ...metadata,
    } as DBUser;

    writeCachedDBUser(cachedRow);

    // ✅ If session exists (no email-confirm flow), update memory state immediately
    const sessionUser = (data as any)?.session?.user ?? null;
    if (sessionUser) {
      setUser(sessionUser);
      setDbUser(cachedRow);
      setRole(role);
      setDbLoaded(true);
      lastUserId.current = sessionUser.id;
    }
  }

  return { success: true, data };
};


  const signIn: AuthContextType["signIn"] = async (email, password) => {
    // ✅ do not call refreshUser immediately here (onAuthStateChange will fire)
    return supabase.auth.signInWithPassword({ email, password });
  };

  const signOut = async () => {
    const uid = user?.id || lastUserId.current;

    await supabase.auth.signOut();

    setUser(null);
    setDbUser(null);
    setRole(null);
    setDbLoaded(true);
    setLoading(false);

    localStorage.removeItem("servly_setup_done");
    if (uid) clearCachedDBUser(uid);
  };

  const updateProfile: AuthContextType["updateProfile"] = async (updates) => {
    if (!user) return { error: "No user" };

    const { error } = await supabase.from("users").update(updates).eq("id", user.id);
    if (error) return { error: error.message };

    setDbUser((prev) => {
      const merged = prev
        ? { ...prev, ...updates }
        : ({ id: user.id, email: user.email!, role: (user.user_metadata?.role as any) ?? "customer", ...updates } as DBUser);

      writeCachedDBUser(merged);
      setRole(merged.role);
      return merged;
    });

    if (updates.setup_complete === true) {
      localStorage.setItem("servly_setup_done", "true");
    }

    return { success: true };
  };

  const value = useMemo(
    () => ({
      user,
      dbUser,
      role,
      loading,
      dbLoaded,
      signUp,
      signIn,
      signOut,
      refreshUser,
      updateProfile,
    }),
    [user, dbUser, role, loading, dbLoaded, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};

export default AuthProvider;
