import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '@/lib/supabaseClient'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'

interface Company {
  id: number
  name: string
  cvr?: string
  email: string
  phone?: string
  address?: string
  city?: string
  postalCode?: string
  website?: string
  isActive: boolean
  createdAt: string
  userCount: number
  purchaseCount: number
  leadCount: number
}

export default function AdminCompaniesPage() {
  const router = useRouter()
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<number | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      router.push('/login?redirect=admin/companies')
      return
    }

    // Check user role
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
    } else {
      router.push('/login?error=access-denied')
      return
    }

    fetchCompanies(session.access_token)
  }

  const fetchCompanies = async (token: string) => {
    try {
      const response = await fetch('/api/admin/companies', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Kunne ikke hente virksomheder')
      }

      const data = await response.json()
      setCompanies(data.companies)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Der opstod en fejl')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleActive = async (companyId: number, currentActive: boolean) => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    setActionLoading(companyId)

    try {
      const response = await fetch(`/api/admin/companies/${companyId}/update`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ isActive: !currentActive })
      })

      if (!response.ok) {
        throw new Error('Kunne ikke opdatere virksomhed')
      }

      setCompanies(prev => prev.map(company =>
        company.id === companyId
          ? { ...company, isActive: !currentActive }
          : company
      ))
    } catch (err) {
      alert('Fejl: ' + (err instanceof Error ? err.message : 'Ukendt fejl'))
    } finally {
      setActionLoading(null)
    }
  }

  const handleDelete = async (companyId: number) => {
    if (!confirm('Er du sikker på at du vil slette denne virksomhed?')) return

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    setActionLoading(companyId)

    try {
      const response = await fetch(`/api/admin/companies/${companyId}/delete`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Kunne ikke slette virksomhed')
      }

      setCompanies(prev => prev.filter(company => company.id !== companyId))
      alert('Virksomhed slettet succesfuldt')
    } catch (err) {
      alert('Fejl: ' + (err instanceof Error ? err.message : 'Ukendt fejl'))
    } finally {
      setActionLoading(null)
    }
  }

  // Filter companies
  const filteredCompanies = companies.filter(company => {
    const matchesSearch = searchTerm === '' ||
      company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.cvr?.toLowerCase().includes(searchTerm.toLowerCase())

    return matchesSearch
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F0F1A] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF6A3D] mx-auto"></div>
          <p className="mt-4 text-white/60">Indlæser virksomheder...</p>
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
              Virksomhedsstyring
            </h1>
            <p className="text-white/60">
              Administrer virksomheder på platformen
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
            <div className="text-blue-400 text-sm font-medium mb-1">Total Virksomheder</div>
            <div className="text-white text-3xl font-bold">{companies.length}</div>
          </div>
          <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/30 rounded-xl p-6">
            <div className="text-green-400 text-sm font-medium mb-1">Aktive</div>
            <div className="text-white text-3xl font-bold">
              {companies.filter(c => c.isActive).length}
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30 rounded-xl p-6">
            <div className="text-purple-400 text-sm font-medium mb-1">Total Brugere</div>
            <div className="text-white text-3xl font-bold">
              {companies.reduce((sum, c) => sum + c.userCount, 0)}
            </div>
          </div>
          <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 border border-orange-500/30 rounded-xl p-6">
            <div className="text-orange-400 text-sm font-medium mb-1">Total Køb</div>
            <div className="text-white text-3xl font-bold">
              {companies.reduce((sum, c) => sum + c.purchaseCount, 0)}
            </div>
          </div>
        </div>

        {/* Search Filter */}
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-4 mb-6">
          <div>
            <label className="block text-white/60 text-sm mb-2">Søg</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Søg efter navn, email eller CVR..."
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder:text-white/40 focus:outline-none focus:border-[#FF6A3D]/50"
            />
          </div>
        </div>

        {/* Companies Table */}
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5 border-b border-white/10">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                    Virksomhed
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                    Kontakt
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                    Lokation
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                    Aktivitet
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-white/60 uppercase tracking-wider">
                    Handlinger
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredCompanies.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-white/40">
                      Ingen virksomheder fundet
                    </td>
                  </tr>
                ) : (
                  filteredCompanies.map((company) => (
                    <tr key={company.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-white font-medium">{company.name}</div>
                          {company.cvr && (
                            <div className="text-white/40 text-sm">CVR: {company.cvr}</div>
                          )}
                          {company.website && (
                            <a
                              href={company.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#FF6A3D] text-sm hover:underline"
                            >
                              {company.website}
                            </a>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-white/60 text-sm">
                          <div>📧 {company.email}</div>
                          {company.phone && (
                            <div>📱 {company.phone}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-white/60 text-sm">
                          {company.city && (
                            <div>📍 {company.city}</div>
                          )}
                          {company.postalCode && (
                            <div>{company.postalCode}</div>
                          )}
                          {!company.city && !company.postalCode && (
                            <div className="text-white/40">Ikke angivet</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-white/60 text-sm">
                          <div>👥 {company.userCount} brugere</div>
                          <div>💰 {company.purchaseCount} køb</div>
                          <div>📩 {company.leadCount} leads</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          company.isActive
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                            : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                        }`}>
                          {company.isActive ? 'Aktiv' : 'Inaktiv'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button
                          onClick={() => handleToggleActive(company.id, company.isActive)}
                          disabled={actionLoading === company.id}
                          className="px-3 py-1.5 text-sm bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg hover:bg-blue-500/30 transition-colors disabled:opacity-50"
                        >
                          {company.isActive ? 'Deaktiver' : 'Aktiver'}
                        </button>
                        <button
                          onClick={() => handleDelete(company.id)}
                          disabled={actionLoading === company.id || company.userCount > 0 || company.purchaseCount > 0 || company.leadCount > 0}
                          className="px-3 py-1.5 text-sm bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-colors disabled:opacity-50"
                          title={company.userCount > 0 || company.purchaseCount > 0 || company.leadCount > 0 ? 'Kan ikke slette virksomhed med brugere, køb eller leads' : ''}
                        >
                          Slet
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
