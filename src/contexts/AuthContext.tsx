import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "../lib/supabaseClient";
import { User as SupabaseUser } from "@supabase/auth-js";

// تعريف شكل بيانات المستخدم في قاعدة البيانات
export interface DBUser {
  id: string;
  email: string;
  full_name?: string;
  role: "admin" | "merchant" | "customer";
  store_slug?: string;
  created_at?: string;
}

interface AuthContextType {
  user: SupabaseUser | null;
  dbUser: DBUser | null;
  role: "admin" | "merchant" | "customer" | null;
  loading: boolean;
  signUp: (email: string, password: string, role: string, metadata: any) => Promise<{ error?: string; data?: any }>;
  signIn: (email: string, password: string) => Promise<{ error?: string; data?: any }>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [dbUser, setDbUser] = useState<DBUser | null>(null);
  const [role, setRole] = useState<"admin" | "merchant" | "customer" | null>(null);
  const [loading, setLoading] = useState(true);

  // وظيفة جلب بيانات المستخدم من جدول public.users
  const fetchDBUser = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setDbUser(data as DBUser);
        setRole(data.role);
        return data;
      }
    } catch (err) {
      console.error("Critical error fetching profile from DB:", err);
    }
    return null;
  };

  // وظيفة تحديث البيانات يدوياً
  const refreshUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        setRole(session.user.user_metadata?.role || null);
        await fetchDBUser(session.user.id);
      }
    } catch (err) {
      console.error("Refresh User Error:", err);
    }
  };

  useEffect(() => {
    // مؤقت أمان: إذا استغرق التحميل أكثر من 3 ثوانٍ، افتح التطبيق بأي حال
    const safetyTimer = setTimeout(() => {
      if (loading) {
        console.warn("Auth initialization timed out. Forcing loading to false.");
        setLoading(false);
      }
    }, 3500);

    const initializeAuth = async () => {
      try {
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        const authUser = session?.user || null;
        
        setUser(authUser);
        if (authUser) {
          // تحديث الرتبة فوراً من الميتاداتا لسرعة التوجيه
          setRole(authUser.user_metadata?.role || null);
          // ثم جلب البيانات الكاملة من القاعدة
          await fetchDBUser(authUser.id);
        }
      } catch (err) {
        console.error("Initialization Error:", err);
      } finally {
        setLoading(false);
        clearTimeout(safetyTimer);
      }
    };

    initializeAuth();

    // مراقبة تغييرات حالة تسجيل الدخول
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth Event:", event);
      const authUser = session?.user || null;
      setUser(authUser);

      if (authUser) {
        setRole(authUser.user_metadata?.role || null);
        await fetchDBUser(authUser.id);
      } else {
        setDbUser(null);
        setRole(null);
      }
      setLoading(false);
    });

    return () => {
      authListener.subscription.unsubscribe();
      clearTimeout(safetyTimer);
    };
  }, []);

  const signUp = async (email: string, password: string, role: string, metadata: any) => {
    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role: role,
            full_name: metadata.full_name,
          }
        }
      });

      if (authError) return { error: authError.message };

      if (data.user) {
        // إنشاء سجل في جدول المستخدمين
        const { error: dbError } = await supabase.from("users").insert({
          id: data.user.id,
          email: email,
          role: role,
          full_name: metadata.full_name || '',
          store_slug: metadata.store_slug || null
        });

        if (dbError) console.warn("Sync delay (DB Insert):", dbError.message);
      }

      return { data };
    } catch (err: any) {
      return { error: err.message || "System error during signup" };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        setLoading(false);
        return { error: error.message };
      }

      if (data.user) {
        setRole(data.user.user_metadata?.role || null);
        await fetchDBUser(data.user.id);
      }
      
      setLoading(false);
      return { data };
    } catch (err: any) {
      setLoading(false);
      return { error: "Login failed unexpectedy" };
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      await supabase.auth.signOut();
      setUser(null);
      setDbUser(null);
      setRole(null);
    } catch (err) {
      console.error("Signout Error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, dbUser, role, loading, signUp, signIn, signOut, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
};

export default AuthProvider;