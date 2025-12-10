import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase, UserInsert, User } from '../lib/supabaseClient';

interface AuthContextType {
  user: User | null;
  signUp: (email: string, password: string, full_name?: string, phone?: string, company_name?: string) => Promise<{ error?: string }>;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session?.user) {
        const sUser = data.session.user;
        setUser({
          id: sUser.id,
          email: sUser.email || '',
          full_name: sUser.user_metadata?.full_name,
          phone: sUser.user_metadata?.phone,
          company_name: sUser.user_metadata?.company_name,
          subscription_plan: 'basic',
          created_at: new Date().toISOString(),
        });
      }
      setLoading(false);
    };

    getSession();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const sUser = session.user;
        setUser({
          id: sUser.id,
          email: sUser.email || '',
          full_name: sUser.user_metadata?.full_name,
          phone: sUser.user_metadata?.phone,
          company_name: sUser.user_metadata?.company_name,
          subscription_plan: 'basic',
          created_at: new Date().toISOString(),
        });
      } else {
        setUser(null);
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const signUp = async (
    email: string,
    password: string,
    full_name?: string,
    phone?: string,
    company_name?: string
  ) => {
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name, phone, company_name } },
      });

      if (signUpError) return { error: signUpError.message };

      const newUser: UserInsert = {
        email,
        full_name,
        phone,
        company_name,
        subscription_plan: 'basic',
      };

const { error: insertError } = await supabase
  .from('users')
  .insert([newUser] as UserInsert[]);


      if (insertError) return { error: insertError.message };

      return {};
    } catch (err: any) {
      return { error: err.message };
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, signUp, signIn, signOut, loading }}>
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
