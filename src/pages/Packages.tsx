import { useEffect, useState } from 'react'
import { supabase } from '../services/supabaseClient'

interface Package {
  id: string
  name: string
  price: number
  description: string
}

export default function Packages() {
  const [packages, setPackages] = useState<Package[]>([])

  useEffect(() => {
    const fetchPackages = async () => {
      const { data } = await supabase.from('Packages').select('*')
      setPackages(data || [])
    }
    fetchPackages()
  }, [])

  const bookDemo = (packageId: string) => {
    alert(`Booking demo for package ${packageId}`)
  }

  return (
    <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
      {packages.map(pkg => (
        <div key={pkg.id} className="border p-4 rounded shadow">
          <h2 className="text-xl font-bold">{pkg.name}</h2>
          <p>{pkg.description}</p>
          <p className="font-semibold mt-2">${pkg.price}</p>
          <button
            onClick={() => bookDemo(pkg.id)}
            className="mt-4 bg-blue-500 text-white p-2 rounded"
          >
            Book Demo
          </button>
        </div>
      ))}
    </div>
  )
}
