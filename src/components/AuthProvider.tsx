import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase, UserInsert, User } from '../lib/supabaseClient';

interface AuthContextType {
  user: User | null;
  role: 'admin' | 'merchant' | 'customer' | null;
  signUp: (
    email: string,
    password: string,
    role: 'admin' | 'merchant' | 'customer',
    full_name?: string,
    phone?: string,
    company_name?: string
  ) => Promise<{ error?: string }>;
  signIn: (
    email: string,
    password: string
  ) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<'admin' | 'merchant' | 'customer' | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session?.user) {
        const sUser = data.session.user;
        const userRole = (sUser.user_metadata?.role as 'admin' | 'merchant' | 'customer') || 'customer';
        setRole(userRole);
      }
      setLoading(false);
    };

    getSession();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const sUser = session.user;
        const userRole = (sUser.user_metadata?.role as 'admin' | 'merchant' | 'customer') || 'customer';
        setRole(userRole);
      } else {
        setUser(null);
        setRole(null);
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const signUp = async (
    email: string,
    password: string,
    userRole: 'admin' | 'merchant' | 'customer',
    full_name?: string,
    phone?: string,
    company_name?: string
  ) => {
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name, phone, company_name, role: userRole } },
      });

      if (signUpError) return { error: signUpError.message };

      const newUser: UserInsert = {
        email,
        full_name,
        phone,
        company_name,
        subscription_plan: 'basic',
        role: userRole
      };

      const { error: insertError } = await supabase.from('users').insert([newUser] as UserInsert[]);
      if (insertError) return { error: insertError.message };

      return {};
    } catch (err: any) {
      return { error: err.message };
    }
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };

    const userRole = (data.user?.user_metadata?.role as 'admin' | 'merchant' | 'customer') || 'customer';
    setRole(userRole);
    return {};
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider value={{ user, role, signUp, signIn, signOut, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export default AuthProvider;
