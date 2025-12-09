import { useState, useEffect } from 'react'
import { supabase, Employee } from '../lib/supabaseClient'
import { useAuth } from './useAuth'

export function useEmployees() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { userProfile } = useAuth()

  useEffect(() => {
    if (userProfile) {
      fetchEmployees()
    }
  }, [userProfile])

  const fetchEmployees = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('user_id', userProfile?.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      setEmployees(data || [])
    } catch (err: any) {
      setError(err.message)
      console.error('Error fetching employees:', err)
    } finally {
      setLoading(false)
    }
  }

  const addEmployee = async (employeeData: Omit<Employee, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    try {
      if (!userProfile) throw new Error('No user profile found')

      const { data, error } = await supabase
        .from('employees')
        .insert({
          ...employeeData,
          user_id: userProfile.id
        })
        .select()
        .single()

      if (error) throw error

      setEmployees(prev => [data, ...prev])
      return { data, error: null }
    } catch (err: any) {
      return { data: null, error: err.message }
    }
  }

  const updateEmployee = async (id: string, updates: Partial<Employee>) => {
    try {
      const { data, error } = await supabase
        .from('employees')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      setEmployees(prev => prev.map(emp => emp.id === id ? data : emp))
      return { data, error: null }
    } catch (err: any) {
      return { data: null, error: err.message }
    }
  }

  const deleteEmployee = async (id: string) => {
    try {
      const { error } = await supabase
        .from('employees')
        .delete()
        .eq('id', id)

      if (error) throw error

      setEmployees(prev => prev.filter(emp => emp.id !== id))
      return { error: null }
    } catch (err: any) {
      return { error: err.message }
    }
  }

  return {
    employees,
    loading,
    error,
    fetchEmployees,
    addEmployee,
    updateEmployee,
    deleteEmployee
  }
}