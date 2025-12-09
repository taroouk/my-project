import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { supabase, User } from '../lib/supabaseClient'

// Type للمستخدم اللي جاي من Supabase
type SupabaseUser = {
  id: string
  email?: string
  phone?: string
  app_metadata: any
  user_metadata: any
  created_at?: string
  confirmed_at?: string | null
  last_sign_in_at?: string | null
  role?: string
  updated_at?: string
  email_confirmed_at?: string | null
  deleted_at?: string | null
}

interface AuthContextType {
  user: User | null
  signUp: (email: string, password: string, full_name?: string, phone?: string) => Promise<{ error?: string }>
  signIn: (email: string, password: string) => Promise<{ error?: string }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const sUser = data.session?.user
      if (sUser) {
        const formattedUser: User = {
          id: sUser.id,
          email: sUser.email || '', // حطينا default فارغ
          full_name: sUser.user_metadata?.full_name,
          phone: sUser.user_metadata?.phone,
          subscription_plan: 'basic',
          created_at: new Date().toISOString(),
        }
        setUser(formattedUser)
      }
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const sUser: SupabaseUser = session.user
        const formattedUser: User = {
          id: sUser.id,
          email: sUser.email || '', // default
          full_name: sUser.user_metadata?.full_name,
          phone: sUser.user_metadata?.phone,
          subscription_plan: 'basic',
          created_at: new Date().toISOString(),
        }
        setUser(formattedUser)
      } else {
        setUser(null)
      }
    })

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  const signUp = async (email: string, password: string, full_name?: string, phone?: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name, phone } // هيتحط في user_metadata
      }
    })
    if (error) return { error: error.message }

    // إضافة البيانات لجدول users
    await supabase.from('users').insert({
      id: data.user?.id,
      email: email || '',
      full_name,
      phone,
      subscription_plan: 'basic',
      created_at: new Date().toISOString(),
    })

    return {}
  }

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error: error?.message }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
