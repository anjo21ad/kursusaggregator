import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '@/lib/supabaseClient'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'

interface User {
  id: string
  email: string
  firstName?: string
  lastName?: string
  role: string
  isActive: boolean
  createdAt: string
  companyId?: number
  providerId?: number
  company?: { id: number; name: string }
  provider?: { id: number; companyName: string }
  purchaseCount: number
  leadCount: number
}

export default function AdminUsersPage() {
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('ALL')

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      router.push('/login?redirect=admin/users')
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

    fetchUsers(session.access_token)
  }

  const fetchUsers = async (token: string) => {
    try {
      const response = await fetch('/api/admin/users', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Kunne ikke hente brugere')
      }

      const data = await response.json()
      setUsers(data.users)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Der opstod en fejl')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleActive = async (userId: string, currentActive: boolean) => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    setActionLoading(userId)

    try {
      const response = await fetch(`/api/admin/users/${userId}/update`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ isActive: !currentActive })
      })

      if (!response.ok) {
        throw new Error('Kunne ikke opdatere bruger')
      }

      setUsers(prev => prev.map(user =>
        user.id === userId
          ? { ...user, isActive: !currentActive }
          : user
      ))
    } catch (err) {
      alert('Fejl: ' + (err instanceof Error ? err.message : 'Ukendt fejl'))
    } finally {
      setActionLoading(null)
    }
  }

  const handleDelete = async (userId: string) => {
    if (!confirm('Er du sikker på at du vil slette denne bruger?')) return

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    setActionLoading(userId)

    try {
      const response = await fetch(`/api/admin/users/${userId}/delete`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Kunne ikke slette bruger')
      }

      setUsers(prev => prev.filter(user => user.id !== userId))
      alert('Bruger slettet succesfuldt')
    } catch (err) {
      alert('Fejl: ' + (err instanceof Error ? err.message : 'Ukendt fejl'))
    } finally {
      setActionLoading(null)
    }
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return 'bg-red-500/20 text-red-400 border-red-500/30'
      case 'COMPANY_ADMIN':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30'
      case 'PROVIDER':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'COMPANY_USER':
        return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'USER':
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN': return 'Super Admin'
      case 'COMPANY_ADMIN': return 'Virksomheds Admin'
      case 'PROVIDER': return 'Udbyder'
      case 'COMPANY_USER': return 'Virksomheds Bruger'
      case 'USER': return 'Bruger'
      default: return role
    }
  }

  // Filter users
  const filteredUsers = users.filter(user => {
    const matchesSearch = searchTerm === '' ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesRole = roleFilter === 'ALL' || user.role === roleFilter

    return matchesSearch && matchesRole
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F0F1A] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF6A3D] mx-auto"></div>
          <p className="mt-4 text-white/60">Indlæser brugere...</p>
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
              Brugerstyring
            </h1>
            <p className="text-white/60">
              Administrer brugere og deres roller
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
            <div className="text-blue-400 text-sm font-medium mb-1">Total Brugere</div>
            <div className="text-white text-3xl font-bold">{users.length}</div>
          </div>
          <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/30 rounded-xl p-6">
            <div className="text-green-400 text-sm font-medium mb-1">Aktive</div>
            <div className="text-white text-3xl font-bold">
              {users.filter(u => u.isActive).length}
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30 rounded-xl p-6">
            <div className="text-purple-400 text-sm font-medium mb-1">Udbydere</div>
            <div className="text-white text-3xl font-bold">
              {users.filter(u => u.role === 'PROVIDER').length}
            </div>
          </div>
          <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 border border-orange-500/30 rounded-xl p-6">
            <div className="text-orange-400 text-sm font-medium mb-1">Total Køb</div>
            <div className="text-white text-3xl font-bold">
              {users.reduce((sum, u) => sum + u.purchaseCount, 0)}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-white/60 text-sm mb-2">Søg</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Søg efter email eller navn..."
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder:text-white/40 focus:outline-none focus:border-[#FF6A3D]/50"
              />
            </div>
            <div>
              <label className="block text-white/60 text-sm mb-2">Rolle</label>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#FF6A3D]/50"
              >
                <option value="ALL">Alle roller</option>
                <option value="USER">Bruger</option>
                <option value="COMPANY_USER">Virksomheds Bruger</option>
                <option value="COMPANY_ADMIN">Virksomheds Admin</option>
                <option value="PROVIDER">Udbyder</option>
                <option value="SUPER_ADMIN">Super Admin</option>
              </select>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5 border-b border-white/10">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                    Bruger
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                    Rolle
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                    Tilknytning
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
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-white/40">
                      Ingen brugere fundet
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-white font-medium">
                            {user.firstName && user.lastName
                              ? `${user.firstName} ${user.lastName}`
                              : user.email}
                          </div>
                          {user.firstName && user.lastName && (
                            <div className="text-white/40 text-sm">{user.email}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRoleBadgeColor(user.role)}`}>
                          {getRoleLabel(user.role)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-white/60 text-sm">
                          {user.company && (
                            <div>🏢 {user.company.name}</div>
                          )}
                          {user.provider && (
                            <div>📚 {user.provider.companyName}</div>
                          )}
                          {!user.company && !user.provider && (
                            <div className="text-white/40">Ingen</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-white/60 text-sm">
                          <div>💰 {user.purchaseCount} køb</div>
                          <div>📩 {user.leadCount} leads</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.isActive
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                            : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                        }`}>
                          {user.isActive ? 'Aktiv' : 'Inaktiv'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button
                          onClick={() => handleToggleActive(user.id, user.isActive)}
                          disabled={actionLoading === user.id}
                          className="px-3 py-1.5 text-sm bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg hover:bg-blue-500/30 transition-colors disabled:opacity-50"
                        >
                          {user.isActive ? 'Deaktiver' : 'Aktiver'}
                        </button>
                        <button
                          onClick={() => handleDelete(user.id)}
                          disabled={actionLoading === user.id || user.purchaseCount > 0 || user.leadCount > 0}
                          className="px-3 py-1.5 text-sm bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-colors disabled:opacity-50"
                          title={user.purchaseCount > 0 || user.leadCount > 0 ? 'Kan ikke slette bruger med køb eller leads' : ''}
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
