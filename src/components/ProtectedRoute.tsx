import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "../lib/supabaseClient";
import { User as SupabaseUser } from "@supabase/auth-js";

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
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [dbUser, setDbUser] = useState<DBUser | null>(null);
  const [role, setRole] = useState<"admin" | "merchant" | "customer" | null>(null);
  const [loading, setLoading] = useState(true);

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
      console.error("Error fetching DB user:", err);
    }
    return null;
  };

  const refreshUser = async () => {
    const { data: { user: updatedUser } } = await supabase.auth.getUser();
    if (updatedUser) {
      setUser(updatedUser);
      setRole(updatedUser.user_metadata?.role || null);
      await fetchDBUser(updatedUser.id);
    }
  };

  useEffect(() => {
    const initialize = async () => {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      const authUser = session?.user || null;
      
      setUser(authUser);
      if (authUser) {
        setRole(authUser.user_metadata?.role || null);
        await fetchDBUser(authUser.id);
      }
      setLoading(false);
    };

    initialize();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
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

    return () => authListener.subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, dbUser, role, loading, refreshUser }}>
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