import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '../lib/supabaseClient';
import { User as SupabaseUser } from '@supabase/auth-js';

interface DBUser {
  id: string;
  email: string;
  full_name?: string;
  phone?: string;
  company_name?: string;
  role: 'admin' | 'merchant' | 'customer';
  subscription_plan?: string;
  created_at?: string;
}

interface AuthContextType {
  user: SupabaseUser | null;
  dbUser: DBUser | null;
  role: 'admin' | 'merchant' | 'customer' | null;
  signUp: (
    email: string,
    password: string,
    role: 'admin' | 'merchant' | 'customer',
    fullName?: string,
    phone?: string,
    companyName?: string
  ) => Promise<{ error?: string }>;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [dbUser, setDbUser] = useState<DBUser | null>(null);
  const [role, setRole] = useState<'admin' | 'merchant' | 'customer' | null>(null);
  const [loading, setLoading] = useState(true);

  // Load user from Supabase table users
  const fetchDBUser = async (authUser: SupabaseUser | null) => {
    if (!authUser?.email) {
      setDbUser(null);
      setRole(null);
      return;
    }

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', authUser.email)
      .single();

    if (error) {
      console.log('DB user not found yet.');
      return;
    }

    setDbUser(data as DBUser);
    setRole(data.role);
  };

  // Initial load
  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getSession();
      const authUser = data.session?.user || null;

      setUser(authUser);
      await fetchDBUser(authUser);
      setLoading(false);
    };

    init();

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const authUser = session?.user || null;
      setUser(authUser);
      await fetchDBUser(authUser);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  // Sign Up logic
  const signUp = async (
    email: string,
    password: string,
    userRole: 'admin' | 'merchant' | 'customer',
    fullName?: string,
    phone?: string,
    companyName?: string
  ) => {
    try {
      const { error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { role: userRole }
        }
      });

      if (authError) return { error: authError.message };

      // Insert user into DB table
      const { error: insertError } = await supabase.from('users').insert({
        email,
        full_name: fullName || '',
        phone: phone || '',
        company_name: companyName || '',
        subscription_plan: 'basic',
        role: userRole
      });

      if (insertError) return { error: insertError.message };

      return {};
    } catch (err: any) {
      return { error: err.message };
    }
  };

  // Sign In
  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) return { error: error.message };

    setUser(data.user);
    await fetchDBUser(data.user);

    return {};
  };

  // Sign Out
  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setDbUser(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider value={{ user, dbUser, role, signUp, signIn, signOut, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};

export default AuthProvider;
