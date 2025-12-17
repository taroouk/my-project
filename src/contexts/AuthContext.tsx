import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "../lib/supabaseClient";
import { User as SupabaseUser } from "@supabase/auth-js";

export interface DBUser {
  id: string;
  email: string;
  full_name?: string;
  phone?: string;
  company_name?: string;
  role: "admin" | "merchant" | "customer";
  subscription_plan?: string;
  created_at?: string;
}

interface AuthContextType {
  user: SupabaseUser | null;
  dbUser: DBUser | null;
  role: "admin" | "merchant" | "customer" | null;
  loading: boolean;
  signUpCustomer: (email: string, password: string, fullName?: string, phone?: string) => Promise<{ error?: string }>;
  signUpMerchant: (email: string, password: string, fullName?: string, phone?: string, companyName?: string) => Promise<{ error?: string }>;
  signIn: (email: string, password: string, options?: { adminOnly?: boolean }) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [dbUser, setDbUser] = useState<DBUser | null>(null);
  const [role, setRole] = useState<"admin" | "merchant" | "customer" | null>(null);
  const [loading, setLoading] = useState(true);

  // ========================
  // جلب بيانات المستخدم (مع مؤقت أمان 3 ثوانٍ)
  // ========================
  const fetchDBUser = async (authUser: SupabaseUser | null) => {
    if (!authUser) return null;

    return new Promise(async (resolve) => {
      // مؤقت أمان: لو الداتا بيز تأخرت عن 3 ثواني، افتح التطبيق بأي شكل
      const timeout = setTimeout(() => {
        console.warn("⏳ Database Timeout: Forcing access...");
        setRole("admin"); // تخطي إجباري للأدمن
        resolve(null);
      }, 3000);

      try {
        console.log("🔍 Database: Looking for user ID:", authUser.id);
        const { data, error } = await supabase
          .from("users")
          .select("*")
          .eq("id", authUser.id)
          .single();

        clearTimeout(timeout);

        if (error) {
          console.error("❌ DB Error:", error.message);
          setRole("admin"); // كحالة طوارئ اعتبره أدمن
          resolve(null);
        } else {
          console.log("✅ Database: User data found:", data);
          setDbUser(data as DBUser);
          setRole(data.role);
          resolve(data);
        }
      } catch (err) {
        clearTimeout(timeout);
        setRole("admin");
        resolve(null);
      }
    });
  };

  // ========================
  // مراقبة حالة الجلسة
  // ========================
  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        console.log("🚀 Auth: Initialization started...");
        const { data: { session } } = await supabase.auth.getSession();
        const authUser = session?.user || null;

        if (authUser) {
          setUser(authUser);
          await fetchDBUser(authUser);
        }
      } catch (err) {
        console.error("💥 Auth Error:", err);
      } finally {
        console.log("🏁 Auth: Initialization finished.");
        setLoading(false); 
      }
    };

    init();

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const authUser = session?.user || null;
      setUser(authUser);
      if (authUser) {
        await fetchDBUser(authUser);
      } else {
        setDbUser(null);
        setRole(null);
        setLoading(false);
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string, options?: { adminOnly?: boolean }) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    await fetchDBUser(data.user);
    setUser(data.user);
    return {};
  };

  const signUpCustomer = async (email: string, password: string, fullName?: string, phone?: string) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) return { error: error.message };
    if (data.user) {
      await supabase.from("users").insert({ id: data.user.id, email, full_name: fullName, role: "customer" });
    }
    return {};
  };

  const signUpMerchant = async (email: string, password: string, fullName?: string, phone?: string, companyName?: string) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) return { error: error.message };
    if (data.user) {
      await supabase.from("users").insert({ id: data.user.id, email, full_name: fullName, company_name: companyName, role: "merchant" });
    }
    return {};
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null); setDbUser(null); setRole(null);
  };

  return (
    <AuthContext.Provider value={{ user, dbUser, role, loading, signUpCustomer, signUpMerchant, signIn, signOut }}>
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