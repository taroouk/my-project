import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
  ReactNode,
} from 'react';
import { supabase } from '../lib/supabaseClient';
import { User as SupabaseUser } from '@supabase/auth-js';

export interface DBUser {
  id: string;
  email: string;
  full_name?: string;
  role: 'admin' | 'merchant' | 'customer';
  store_name?: string;
  store_slug?: string;
  brand_color?: string;
  phone?: string;
  country?: string;
  region?: string;
  loyalty_points?: number;
  currency?: 'SAR' | 'EGP' | 'AED' | 'USD';
  setup_complete?: boolean;
  created_at?: string;
  theme_preference?: string;
}

interface AuthContextType {
  user: SupabaseUser | null;
  dbUser: DBUser | null;
  role: 'admin' | 'merchant' | 'customer' | null;
  loading: boolean;
  dbLoaded: boolean;
  signUp: (email: string, password: string, role: DBUser['role'], metadata: Partial<DBUser>) => Promise<any>;
  signIn: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateProfile: (updates: Partial<DBUser>) => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [dbUser, setDbUser] = useState<DBUser | null>(null);
  const [role, setRole] = useState<AuthContextType['role']>(null);
  const [loading, setLoading] = useState(true);
  const [dbLoaded, setDbLoaded] = useState(false);

  const refreshInFlight = useRef(false);
  const lastUserId = useRef<string | null>(null);

  const fetchDBUser = useCallback(async (userId: string) => {
    setDbLoaded(false);
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setDbUser(data as DBUser);
        setRole((data as DBUser).role);
      } else {
        setDbUser(null);
        setRole(null);
      }
    } catch (err) {
      console.error('[Auth] fetchDBUser error', err);
      setDbUser(null);
      setRole(null);
    } finally {
      setDbLoaded(true);
    }
  }, []);

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

      if (lastUserId.current === sessionUser.id && dbLoaded) return;

      lastUserId.current = sessionUser.id;
      await fetchDBUser(sessionUser.id);
    } finally {
      refreshInFlight.current = false;
    }
  }, [fetchDBUser, dbLoaded]);

  useEffect(() => {
    const init = async () => {
      await refreshUser();
      setLoading(false);
    };

    init();

    const { data: sub } = supabase.auth.onAuthStateChange(async (_e, session) => {
      const u = session?.user ?? null;
      setUser(u);

      if (!u) {
        lastUserId.current = null;
        setDbUser(null);
        setRole(null);
        setDbLoaded(true);
        return;
      }

      if (lastUserId.current !== u.id) {
        lastUserId.current = u.id;
        await fetchDBUser(u.id);
      }
    });

    return () => sub.subscription.unsubscribe();
  }, [fetchDBUser, refreshUser]);

  const signUp: AuthContextType['signUp'] = async (email, password, role, metadata) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { ...metadata, role, setup_complete: false },
      },
    });

    if (error) return { error: error.message };

    if (data.user) {
      await supabase.from('users').upsert({
        id: data.user.id,
        email,
        role,
        setup_complete: false,
        ...metadata,
      });
    }

    return { success: true };
  };

  const signIn: AuthContextType['signIn'] = async (email, password) =>
    supabase.auth.signInWithPassword({ email, password });

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setDbUser(null);
    setRole(null);
    setDbLoaded(true);
    localStorage.removeItem('servly_setup_done');
  };

  const updateProfile: AuthContextType['updateProfile'] = async (updates) => {
    if (!user) return { error: 'No user' };

    const { error } = await supabase.from('users').update(updates).eq('id', user.id);
    if (error) return { error: error.message };

    setDbUser((prev) => (prev ? { ...prev, ...updates } : (updates as DBUser)));

    if (updates.setup_complete === true) {
      localStorage.setItem('servly_setup_done', 'true');
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
    [user, dbUser, role, loading, dbLoaded]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};

export default AuthProvider;