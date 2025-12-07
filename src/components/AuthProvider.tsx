import React, { createContext, useContext, ReactNode } from 'react'
import { useAuth } from '../hooks/useAuth'
import { User as SupabaseUser, AuthError } from '@supabase/supabase-js'
import { User } from '../lib/supabase'

interface AuthResponse<T = unknown> {
  data: T | null
  error: AuthError | null
}

interface AuthContextType {
  user: SupabaseUser | null
  userProfile: User | null
  loading: boolean
  signUp: (email: string, password: string, userData: {
    full_name: string
    company_name?: string
    phone?: string
  }) => Promise<AuthResponse>
  signIn: (email: string, password: string) => Promise<AuthResponse>
  signOut: () => Promise<{ error: AuthError | null }>
  updateProfile: (updates: Partial<User>) => Promise<AuthResponse<User>>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const auth = useAuth()

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuthContext = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider')
  }
  return context
}