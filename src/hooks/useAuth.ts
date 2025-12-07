import { useState, useEffect } from 'react'
import { User as SupabaseUser } from '@supabase/supabase-js'
import { supabase, User } from '../lib/supabase'

export function useAuth() {
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [userProfile, setUserProfile] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchUserProfile(session.user.id)
      }
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        if (session?.user) {
          await fetchUserProfile(session.user.id)
        } else {
          setUserProfile(null)
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const fetchUserProfile = async (authId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('auth_id', authId)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user profile:', error)
        return
      }

      if (data) {
        setUserProfile(data)
      }
    } catch (error) {
      console.error('Error fetching user profile:', error)
    }
  }

  const signUp = async (email: string, password: string, userData: {
    full_name: string
    company_name?: string
    phone?: string
  }) => {
    try {
      console.log('Attempting to sign up user:', email);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData
        }
      })

      if (error) throw error
      
      console.log('Auth signup successful:', data);

      // Create user profile
      if (data.user) {
        console.log('Creating user profile...');
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            auth_id: data.user.id,
            email: data.user.email!,
            full_name: userData.full_name,
            company_name: userData.company_name,
            phone: userData.phone
          })

        if (profileError) {
          console.error('Error creating user profile:', profileError);
          throw new Error(`فشل في إنشاء ملف المستخدم: ${profileError.message}`);
        } else {
          console.log('User profile created successfully');
        }
      }

      return { data, error: null }
    } catch (error: any) {
      console.error('SignUp error:', error);
      return { data: null, error }
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error
      return { data, error: null }
    } catch (error: any) {
      return { data: null, error }
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      setUserProfile(null)
      return { error: null }
    } catch (error: any) {
      return { error }
    }
  }

  const updateProfile = async (updates: Partial<User>) => {
    try {
      if (!user) throw new Error('No user logged in')

      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('auth_id', user.id)
        .select()
        .single()

      if (error) throw error

      setUserProfile(data)
      return { data, error: null }
    } catch (error: any) {
      return { data: null, error }
    }
  }

  return {
    user,
    userProfile,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile
  }
}