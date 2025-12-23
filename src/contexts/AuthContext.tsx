import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "../lib/supabaseClient";
import { User as SupabaseUser } from "@supabase/auth-js";

// 1. العملات المدعومة
export const SUPPORTED_CURRENCIES = [
  { code: 'SAR', symbol: 'ر.س', label: 'Saudi Riyal' },
  { code: 'EGP', symbol: 'ج.م', label: 'Egyptian Pound' },
  { code: 'AED', symbol: 'د.إ', label: 'UAE Dirham' },
  { code: 'USD', symbol: '$', label: 'US Dollar' }
];

// 2. الواجهة المتوافقة تماماً مع جداول الداتابيز الجديدة
export interface DBUser {
  id: string;
  email: string;
  full_name?: string;
  role: "admin" | "merchant" | "customer";
  
  // بيانات المتجر (Merchant Only)
  store_name?: string;
  store_slug?: string;
  brand_color?: string;
  
  // بيانات الموقع والاتصال
  phone?: string;
  country?: string;
  region?: string;
  
  // نظام الولاء والمالية
  loyalty_points?: number;
  currency?: 'SAR' | 'EGP' | 'AED' | 'USD';
  
  // حالة النظام
  setup_complete?: boolean;
  created_at?: string;
  theme_preference?: string;
}

interface AuthContextType {
  user: SupabaseUser | null;
  dbUser: DBUser | null;
  role: "admin" | "merchant" | "customer" | null;
  loading: boolean;
  // تحديث دالة signUp لتقبل الكائن الكامل
  signUp: (email: string, password: string, role: string, metadata: any) => Promise<{ error?: string; data?: any }>;
  signIn: (email: string, password: string) => Promise<{ error?: string; data?: any }>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateProfile: (updates: Partial<DBUser>) => Promise<{ error?: string; success?: boolean }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [dbUser, setDbUser] = useState<DBUser | null>(null);
  const [role, setRole] = useState<"admin" | "merchant" | "customer" | null>(null);
  const [loading, setLoading] = useState(true);

  // جلب بيانات المستخدم من جدول public.users
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
        setRole(data.role as any);
        return data;
      }
    } catch (err) {
      console.error("Fetch DB Error:", err);
    }
    return null;
  };

  const refreshUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      setUser(session.user);
      await fetchDBUser(session.user.id);
    }
  };

  const updateProfile = async (updates: Partial<DBUser>) => {
    if (!user) return { error: "No user" };
    try {
      const { error } = await supabase
        .from("users")
        .update(updates)
        .eq("id", user.id);

      if (error) throw error;

      // تحديث ميتاداتا الـ Auth أيضاً لضمان التزامن
      if (updates.setup_complete !== undefined) {
        await supabase.auth.updateUser({ 
            data: { 
                setup_complete: updates.setup_complete,
                store_name: updates.store_name 
            } 
        });
      }

      setDbUser(prev => prev ? { ...prev, ...updates } : null);
      return { success: true };
    } catch (err: any) {
      return { error: err.message };
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser(session.user);
          await fetchDBUser(session.user.id);
        }
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      const authUser = session?.user || null;
      setUser(authUser);
      if (authUser) {
        await fetchDBUser(authUser.id);
      } else {
        setDbUser(null);
        setRole(null);
      }
      setLoading(false);
    });

    return () => authListener.subscription.unsubscribe();
  }, []);

  // تحديث دالة signUp لتقبل كافة بيانات التسجيل (الهاتف، الدولة، إلخ)
  const signUp = async (email: string, password: string, role: string, metadata: any) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { 
            ...metadata, 
            role,
            setup_complete: false 
          }
        }
      });
      return { data, error: error?.message };
    } catch (err: any) {
      return { error: err.message };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      return { data };
    } catch (err: any) {
      return { error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setDbUser(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider value={{ user, dbUser, role, loading, signUp, signIn, signOut, refreshUser, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
};
// 3. دالة مساعدة للحصول على رمز العملة
export const getCurrencySymbol = (code: string) => {
  const currency = SUPPORTED_CURRENCIES.find(c => c.code === code);
  return currency ? currency.symbol : '';
};  

export default AuthContext;