import { useState, useEffect } from 'react'
import { supabase, Website } from '../lib/supabase'
import { useAuth } from './useAuth'

export function useWebsites() {
  const [websites, setWebsites] = useState<Website[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { userProfile } = useAuth()

  useEffect(() => {
    if (userProfile) {
      fetchWebsites()
    }
  }, [userProfile])

  const fetchWebsites = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('websites')
        .select('*')
        .eq('user_id', userProfile?.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      setWebsites(data || [])
    } catch (err: any) {
      setError(err.message)
      console.error('Error fetching websites:', err)
    } finally {
      setLoading(false)
    }
  }

  const addWebsite = async (websiteData: Omit<Website, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    try {
      if (!userProfile) throw new Error('No user profile found')

      const { data, error } = await supabase
        .from('websites')
        .insert({
          ...websiteData,
          user_id: userProfile.id
        })
        .select()
        .single()

      if (error) throw error

      setWebsites(prev => [data, ...prev])
      return { data, error: null }
    } catch (err: any) {
      return { data: null, error: err.message }
    }
  }

  const updateWebsite = async (id: string, updates: Partial<Website>) => {
    try {
      const { data, error } = await supabase
        .from('websites')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      setWebsites(prev => prev.map(site => site.id === id ? data : site))
      return { data, error: null }
    } catch (err: any) {
      return { data: null, error: err.message }
    }
  }

  const deleteWebsite = async (id: string) => {
    try {
      const { error } = await supabase
        .from('websites')
        .delete()
        .eq('id', id)

      if (error) throw error

      setWebsites(prev => prev.filter(site => site.id !== id))
      return { error: null }
    } catch (err: any) {
      return { error: err.message }
    }
  }

  return {
    websites,
    loading,
    error,
    fetchWebsites,
    addWebsite,
    updateWebsite,
    deleteWebsite
  }
}