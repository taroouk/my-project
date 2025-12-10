import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables')
  throw new Error('Missing Supabase environment variables. Please check your .env file.')
}

// Test URL format
try {
  new URL(supabaseUrl)
} catch (error) {
  console.error('Invalid Supabase URL format:', supabaseUrl)
  throw new Error('Invalid Supabase URL format')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// ===== Database Types =====
export interface User {
  id: string
  email: string
  full_name?: string
  company_name?: string
  phone?: string
  subscription_plan: 'basic' | 'professional' | 'enterprise'
  created_at: string
  role: 'admin' | 'merchant' | 'customer'
}

export type UserInsert = Omit<User, 'id' | 'created_at' | 'email' | 'phone' | 'company_name' | 'full_name' | 'subscription_plan' | 'role'> 

export interface Employee {
  id: string
  user_id: string
  name: string
  email?: string
  position?: string
  salary?: number
  hire_date?: string
  created_at: string
}
export type EmployeeInsert = Omit<Employee, 'id' | 'created_at'>

export interface Website {
  id: string
  user_id: string
  name: string
  domain?: string
  custom_domain?: string
  template?: string
  status: 'active' | 'draft' | 'maintenance'
  content?: Record<string, any> // بدل any
  created_at: string
}
export type WebsiteInsert = Omit<Website, 'id' | 'created_at'>

export interface LoyaltyProgram {
  id: string
  user_id: string
  name: string
  points_per_purchase: number
  reward_threshold: number
  reward_value: number
  is_active: boolean
  created_at: string
}
export type LoyaltyProgramInsert = Omit<LoyaltyProgram, 'id' | 'created_at'>

export interface Customer {
  id: string
  user_id: string
  name: string
  email?: string
  phone?: string
  loyalty_points: number
  total_purchases: number
  created_at: string
}
export type CustomerInsert = Omit<Customer, 'id' | 'created_at'>
