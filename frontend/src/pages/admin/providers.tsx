import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '@/lib/supabaseClient'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'

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
      PENDING: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
      APPROVED: 'bg-green-500/20 text-green-400 border border-green-500/30',
      SUSPENDED: 'bg-red-500/20 text-red-400 border border-red-500/30',
      REJECTED: 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
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
      <div className="min-h-screen bg-[#0F0F1A] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF6A3D] mx-auto"></div>
          <p className="mt-4 text-white/60">Indlæser providers...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0F0F1A] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400">Fejl: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 bg-[#FF6A3D] text-white px-4 py-2 rounded-lg hover:bg-[#FF8A3D] transition-colors"
          >
            Prøv igen
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#0F0F1A]">
      <Navigation />

      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="border-b border-[#FF6A3D]/30 pb-4 mb-6">
            <h1 className="text-3xl font-bold text-white mb-2">
              Provider Administration
            </h1>
            <p className="text-white/60">
              Administrer kursusudbydere og deres godkendelser
            </p>
          </div>

          <div className="flex justify-between items-center">
            <button
              onClick={() => router.push('/admin/dashboard')}
              className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
            >
              ← Tilbage til Dashboard
            </button>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 rounded-xl p-6">
            <div className="text-blue-400 text-sm font-medium mb-1">Total</div>
            <div className="text-white text-3xl font-bold">{providers.length}</div>
          </div>
          <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 border border-yellow-500/30 rounded-xl p-6">
            <div className="text-yellow-400 text-sm font-medium mb-1">Afventer</div>
            <div className="text-white text-3xl font-bold">
              {providers.filter(p => p.status === 'PENDING').length}
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/30 rounded-xl p-6">
            <div className="text-green-400 text-sm font-medium mb-1">Godkendt</div>
            <div className="text-white text-3xl font-bold">
              {providers.filter(p => p.status === 'APPROVED').length}
            </div>
          </div>
          <div className="bg-gradient-to-br from-red-500/20 to-red-600/20 border border-red-500/30 rounded-xl p-6">
            <div className="text-red-400 text-sm font-medium mb-1">Afvist</div>
            <div className="text-white text-3xl font-bold">
              {providers.filter(p => p.status === 'REJECTED').length}
            </div>
          </div>
        </div>

        {/* Providers List */}
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-white/10">
            <h3 className="text-lg font-semibold text-white">
              Alle Kursusudbydere ({providers.length})
            </h3>
          </div>

          {providers.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-white/40">Ingen providers fundet</p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {providers.map((provider) => (
                <div key={provider.id} className="px-6 py-6 hover:bg-white/5 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="text-lg font-medium text-white">
                            {provider.companyName}
                          </h4>
                          <p className="text-sm text-white/60">{provider.contactEmail}</p>
                          {provider.website && (
                            <a
                              href={provider.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-[#FF6A3D] hover:text-[#FF8A3D] transition-colors"
                            >
                              {provider.website}
                            </a>
                          )}
                        </div>
                        <div className="ml-4">
                          {getStatusBadge(provider.status)}
                        </div>
                      </div>

                      <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-white/60">
                        <div>
                          <span className="font-medium text-white/80">By:</span> {provider.city || 'Ikke angivet'}
                        </div>
                        <div>
                          <span className="font-medium text-white/80">CVR:</span> {provider.cvr || 'Ikke angivet'}
                        </div>
                        <div>
                          <span className="font-medium text-white/80">Registreret:</span>{' '}
                          {new Date(provider.createdAt).toLocaleDateString('da-DK')}
                        </div>
                      </div>

                      {provider.description && (
                        <p className="mt-2 text-sm text-white/70">{provider.description}</p>
                      )}

                      {provider.users.length > 0 && (
                        <div className="mt-2">
                          <span className="text-sm font-medium text-white/80">Administratorer:</span>
                          <div className="mt-1 flex flex-wrap gap-2">
                            {provider.users.map(user => (
                              <span key={user.id} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/10 text-white/80 border border-white/20">
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
                        className="px-4 py-2 bg-green-500/20 text-green-400 border border-green-500/30 rounded-lg hover:bg-green-500/30 transition-colors disabled:opacity-50"
                      >
                        {actionLoading === provider.id ? 'Arbejder...' : '✅ Godkend'}
                      </button>

                      <button
                        onClick={() => {
                          const reason = prompt('Angiv årsag til afvisning (valgfrit):')
                          handleStatusChange(provider.id, 'REJECTED', reason || undefined)
                        }}
                        disabled={actionLoading === provider.id}
                        className="px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-colors disabled:opacity-50"
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
                        className="px-4 py-2 bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded-lg hover:bg-orange-500/30 transition-colors disabled:opacity-50"
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
                        className="px-4 py-2 bg-green-500/20 text-green-400 border border-green-500/30 rounded-lg hover:bg-green-500/30 transition-colors disabled:opacity-50"
                      >
                        ✅ Genaktiver
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}