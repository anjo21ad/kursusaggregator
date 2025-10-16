import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '@/lib/supabaseClient'

interface Provider {
  id: number
  companyName: string
  contactEmail: string
  phone?: string
  website?: string
  description?: string
  city?: string
  cvr?: string
  status: 'PENDING' | 'APPROVED' | 'SUSPENDED' | 'REJECTED'
  createdAt: string
  approvedAt?: string
  users: Array<{
    id: string
    email: string
    firstName?: string
    lastName?: string
  }>
}

export default function AdminProvidersPage() {
  const router = useRouter()
  const [providers, setProviders] = useState<Provider[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [, setUser] = useState<{ role: string; id: string; email: string } | null>(null)
  const [actionLoading, setActionLoading] = useState<number | null>(null)

  // Check authentication og rolle
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        router.push('/login?redirect=admin/providers')
        return
      }

      // Hent bruger info fra vores database
      const userResponse = await fetch('/api/user/profile', {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      })
      
      if (userResponse.ok) {
        const userData = await userResponse.json()
        if (userData.role !== 'SUPER_ADMIN') {
          router.push('/?error=unauthorized')
          return
        }
        setUser(userData)
      } else {
        router.push('/login?error=access-denied')
        return
      }

      fetchProviders(session.access_token)
    }

    checkAuth()
  }, [router])

  const fetchProviders = async (token: string) => {
    try {
      const response = await fetch('/api/admin/providers', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Kunne ikke hente providers')
      }

      const data = await response.json()
      setProviders(data.providers)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Der opstod en fejl')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (providerId: number, newStatus: string, reason?: string) => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    setActionLoading(providerId)

    try {
      const response = await fetch('/api/admin/providers/update-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          providerId,
          status: newStatus,
          reason
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Kunne ikke opdatere status')
      }

      // Opdater lokal state
      setProviders(prev => prev.map(provider => 
        provider.id === providerId 
          ? { ...provider, status: newStatus as Provider['status'], approvedAt: newStatus === 'APPROVED' ? new Date().toISOString() : provider.approvedAt }
          : provider
      ))

      // Vis success message
      alert(`Provider ${newStatus === 'APPROVED' ? 'godkendt' : newStatus === 'REJECTED' ? 'afvist' : 'opdateret'} succesfuldt`)
      
    } catch (err) {
      alert('Fejl: ' + (err instanceof Error ? err.message : 'Ukendt fejl'))
    } finally {
      setActionLoading(null)
    }
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      APPROVED: 'bg-green-100 text-green-800', 
      SUSPENDED: 'bg-red-100 text-red-800',
      REJECTED: 'bg-gray-100 text-gray-800'
    }

    const labels = {
      PENDING: 'Afventer',
      APPROVED: 'Godkendt',
      SUSPENDED: 'Suspenderet', 
      REJECTED: 'Afvist'
    }

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Indlæser providers...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Fejl: {error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded"
          >
            Prøv igen
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="md:flex md:items-center md:justify-between mb-8">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              Provider Administration
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Administrer kursusudbydere og deres godkendelser
            </p>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4">
            <button
              onClick={() => router.push('/admin')}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              ← Tilbage til Admin
            </button>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-4 mb-8">
          {[
            { label: 'Total', count: providers.length, color: 'bg-blue-500' },
            { label: 'Afventer', count: providers.filter(p => p.status === 'PENDING').length, color: 'bg-yellow-500' },
            { label: 'Godkendt', count: providers.filter(p => p.status === 'APPROVED').length, color: 'bg-green-500' },
            { label: 'Afvist', count: providers.filter(p => p.status === 'REJECTED').length, color: 'bg-red-500' }
          ].map((stat) => (
            <div key={stat.label} className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className={`w-8 h-8 rounded-full ${stat.color}`}></div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">{stat.label}</dt>
                      <dd className="text-lg font-medium text-gray-900">{stat.count}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Providers Table */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Alle Kursusudbydere ({providers.length})
            </h3>
          </div>
          
          {providers.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Ingen providers fundet</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {providers.map((provider) => (
                <li key={provider.id} className="px-4 py-6 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="text-lg font-medium text-gray-900">
                            {provider.companyName}
                          </h4>
                          <p className="text-sm text-gray-600">{provider.contactEmail}</p>
                          {provider.website && (
                            <a 
                              href={provider.website} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-sm text-indigo-600 hover:text-indigo-500"
                            >
                              {provider.website}
                            </a>
                          )}
                        </div>
                        <div className="ml-4">
                          {getStatusBadge(provider.status)}
                        </div>
                      </div>
                      
                      <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">By:</span> {provider.city || 'Ikke angivet'}
                        </div>
                        <div>
                          <span className="font-medium">CVR:</span> {provider.cvr || 'Ikke angivet'}
                        </div>
                        <div>
                          <span className="font-medium">Registreret:</span>{' '}
                          {new Date(provider.createdAt).toLocaleDateString('da-DK')}
                        </div>
                      </div>

                      {provider.description && (
                        <p className="mt-2 text-sm text-gray-700">{provider.description}</p>
                      )}

                      {provider.users.length > 0 && (
                        <div className="mt-2">
                          <span className="text-sm font-medium text-gray-700">Administratorer:</span>
                          <div className="mt-1 flex flex-wrap gap-2">
                            {provider.users.map(user => (
                              <span key={user.id} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                {user.firstName} {user.lastName} ({user.email})
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {provider.status === 'PENDING' && (
                    <div className="mt-4 flex space-x-3">
                      <button
                        onClick={() => handleStatusChange(provider.id, 'APPROVED')}
                        disabled={actionLoading === provider.id}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                      >
                        {actionLoading === provider.id ? 'Arbejder...' : '✅ Godkend'}
                      </button>
                      
                      <button
                        onClick={() => {
                          const reason = prompt('Angiv årsag til afvisning (valgfrit):')
                          handleStatusChange(provider.id, 'REJECTED', reason || undefined)
                        }}
                        disabled={actionLoading === provider.id}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                      >
                        {actionLoading === provider.id ? 'Arbejder...' : '❌ Afvis'}
                      </button>
                    </div>
                  )}

                  {provider.status === 'APPROVED' && (
                    <div className="mt-4 flex space-x-3">
                      <button
                        onClick={() => {
                          const reason = prompt('Angiv årsag til suspension:')
                          if (reason) handleStatusChange(provider.id, 'SUSPENDED', reason)
                        }}
                        disabled={actionLoading === provider.id}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50"
                      >
                        ⏸️ Suspender
                      </button>
                    </div>
                  )}

                  {provider.status === 'SUSPENDED' && (
                    <div className="mt-4 flex space-x-3">
                      <button
                        onClick={() => handleStatusChange(provider.id, 'APPROVED')}
                        disabled={actionLoading === provider.id}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                      >
                        ✅ Genaktiver
                      </button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}