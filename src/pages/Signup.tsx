// src/pages/Signup.tsx
import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useNavigate } from 'react-router-dom'

export default function Signup() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMessage('')
    setSuccessMessage('')

    try {
      // 1. Signup using Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      })

      if (authError) throw authError

      // 2. Insert additional user info into "users" table
      const { error: dbError } = await supabase
        .from('users')
        .insert([
          {
            id: authData.user?.id,
            email,
            full_name: fullName,
            company_name: companyName,
            phone,
            subscription_plan: 'basic', // default plan
          },
        ])

      if (dbError) throw dbError

      setSuccessMessage(
        'Signup successful! Please check your email to confirm your account.'
      )
      setEmail('')
      setPassword('')
      setFullName('')
      setCompanyName('')
      setPhone('')

      // Redirect or show message
      // navigate('/login')
    } catch (error: any) {
      setErrorMessage(error.message || 'An unexpected error occurred.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Sign Up</h2>

        {errorMessage && (
          <div className="bg-red-100 text-red-700 p-2 mb-4 rounded">
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div className="bg-green-100 text-green-700 p-2 mb-4 rounded">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="block mb-1 font-semibold">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="w-full border border-gray-300 p-2 rounded"
            />
          </div>

          <div>
            <label className="block mb-1 font-semibold">Company Name</label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full border border-gray-300 p-2 rounded"
            />
          </div>

          <div>
            <label className="block mb-1 font-semibold">Phone</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full border border-gray-300 p-2 rounded"
            />
          </div>

          <div>
            <label className="block mb-1 font-semibold">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border border-gray-300 p-2 rounded"
            />
          </div>

          <div>
            <label className="block mb-1 font-semibold">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full border border-gray-300 p-2 rounded"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition-colors"
          >
            {loading ? 'Signing up...' : 'Sign Up'}
          </button>
        </form>
      </div>
    </div>
  )
}
