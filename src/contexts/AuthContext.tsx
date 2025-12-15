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

  signUpCustomer: (
    email: string,
    password: string,
    fullName?: string,
    phone?: string
  ) => Promise<{ error?: string }>;

  signUpMerchant: (
    email: string,
    password: string,
    fullName?: string,
    phone?: string,
    companyName?: string
  ) => Promise<{ error?: string }>;

  signIn: (
    email: string,
    password: string,
    options?: { adminOnly?: boolean }
  ) => Promise<{ error?: string }>;

  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [dbUser, setDbUser] = useState<DBUser | null>(null);
  const [role, setRole] = useState<"admin" | "merchant" | "customer" | null>(null);
  const [loading, setLoading] = useState(true);

  // ========================
  // FETCH DB USER
  // ========================
  const fetchDBUser = async (authUser: SupabaseUser | null) => {
    if (!authUser?.email) {
      setDbUser(null);
      setRole(null);
      return null;
    }

    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", authUser.email)
      .single();

    if (error || !data) {
      setDbUser(null);
      setRole(null);
      return null;
    }

    setDbUser(data as DBUser);
    setRole(data.role);
    return data as DBUser;
  };

  // ========================
  // INIT SESSION
  // ========================
  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getSession();
      const authUser = data.session?.user || null;

      setUser(authUser);
      await fetchDBUser(authUser);
      setLoading(false);
    };

    init();

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const authUser = session?.user || null;
        setUser(authUser);
        await fetchDBUser(authUser);
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  // ========================
  // SIGN UP – CUSTOMER
  // ========================
  const signUpCustomer = async (
    email: string,
    password: string,
    fullName?: string,
    phone?: string
  ) => {
    const { error: authError } = await supabase.auth.signUp({
      email,
      password
    });

    if (authError) return { error: authError.message };

    const { error } = await supabase.from("users").insert({
      email,
      full_name: fullName || "",
      phone: phone || "",
      role: "customer",
      subscription_plan: "free"
    });

    if (error) return { error: error.message };
    return {};
  };

  // ========================
  // SIGN UP – MERCHANT
  // ========================
  const signUpMerchant = async (
    email: string,
    password: string,
    fullName?: string,
    phone?: string,
    companyName?: string
  ) => {
    const { error: authError } = await supabase.auth.signUp({
      email,
      password
    });

    if (authError) return { error: authError.message };

    const { error } = await supabase.from("users").insert({
      email,
      full_name: fullName || "",
      phone: phone || "",
      company_name: companyName || "",
      role: "merchant",
      subscription_plan: "trial"
    });

    if (error) return { error: error.message };
    return {};
  };

  // ========================
  // SIGN IN (WITH ADMIN GUARD)
  // ========================
  const signIn = async (
    email: string,
    password: string,
    options?: { adminOnly?: boolean }
  ) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) return { error: error.message };

    const dbUser = await fetchDBUser(data.user);

    // ⛔ Admin protection
    if (options?.adminOnly && dbUser?.role !== "admin") {
      await supabase.auth.signOut();
      setUser(null);
      setDbUser(null);
      setRole(null);
      return { error: "Unauthorized admin access" };
    }

    setUser(data.user);
    return {};
  };

  // ========================
  // SIGN OUT
  // ========================
  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setDbUser(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        dbUser,
        role,
        loading,
        signUpCustomer,
        signUpMerchant,
        signIn,
        signOut
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
};

export default AuthProvider;
