"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

export default function DbTestPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const testConnection = async () => {
      try {
        setLoading(true)
        setError(null)

        // Test 1: Fetch sports data (public access)
        console.log("Testing sports fetch...")
        const { data: sportsData, error: sportsError } = await supabase
          .from('sports')
          .select('*')
          .limit(3)

        if (sportsError) throw sportsError

        // Test 2: Fetch users to see what coaches exist
        console.log("Testing users fetch...")
        const { data: usersData, error: usersError } = await supabase
          .from('users')
          .select('id, email, user_type')
          .eq('user_type', 'coach')
          .limit(3)

        if (usersError) throw usersError

        // Test 3: Try to fetch coach services
        console.log("Testing coach services fetch...")
        const { data: servicesData, error: servicesError } = await supabase
          .from('coach_services')
          .select(`
            id,
            service_name,
            coach_id,
            sports!inner(name)
          `)
          .eq('is_active', true)
          .limit(3)

        if (servicesError) throw servicesError

        setData({
          sports: sportsData,
          coaches: usersData,
          services: servicesData
        })

      } catch (err: any) {
        setError(err.message)
        console.error('Database test error:', err)
      } finally {
        setLoading(false)
      }
    }

    testConnection()
  }, [])

  if (loading) {
    return <div className="p-8">Loading database test...</div>
  }

  if (error) {
    return <div className="p-8 text-red-600">Error: {error}</div>
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Database Connection Test</h1>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Sports ({data?.sports?.length || 0})</h2>
        <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
          {JSON.stringify(data?.sports, null, 2)}
        </pre>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Coaches ({data?.coaches?.length || 0})</h2>
        <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
          {JSON.stringify(data?.coaches, null, 2)}
        </pre>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Services ({data?.services?.length || 0})</h2>
        <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
          {JSON.stringify(data?.services, null, 2)}
        </pre>
      </div>
    </div>
  )
}