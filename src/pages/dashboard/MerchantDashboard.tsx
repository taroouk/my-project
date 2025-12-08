import { supabase } from '../../services/supabaseClient'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function MerchantDashboard() {
  const [user, setUser] = useState<any>(null)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser()
      setUser(data.user)
    }
    fetchUser()
  }, [])

  if (!user) return <p>Loading...</p>

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Welcome, {user.email}</h1>
      <p>Role: Merchant</p>
      <button
        onClick={() => navigate('/packages')}
        className="mt-4 bg-green-500 text-white p-2 rounded"
      >
        Go to Packages
      </button>
    </div>
  )
}
