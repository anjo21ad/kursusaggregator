import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '@/lib/supabaseClient'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'

interface Category {
  id: number
  name: string
  slug: string
  description?: string
  isActive: boolean
  parentId?: number
  icon?: string
  color?: string
  sortOrder: number
  courseCount: number
}

export default function AdminCategoriesPage() {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [actionLoading, setActionLoading] = useState<number | null>(null)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      router.push('/login?redirect=admin/categories')
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

    fetchCategories(session.access_token)
  }

  const fetchCategories = async (token: string) => {
    try {
      const response = await fetch('/api/admin/categories', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Kunne ikke hente kategorier')
      }

      const data = await response.json()
      setCategories(data.categories)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Der opstod en fejl')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleActive = async (categoryId: number, currentActive: boolean) => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    setActionLoading(categoryId)

    try {
      const response = await fetch(`/api/admin/categories/${categoryId}/update`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ isActive: !currentActive })
      })

      if (!response.ok) {
        throw new Error('Kunne ikke opdatere kategori')
      }

      setCategories(prev => prev.map(cat =>
        cat.id === categoryId
          ? { ...cat, isActive: !currentActive }
          : cat
      ))
    } catch (err) {
      alert('Fejl: ' + (err instanceof Error ? err.message : 'Ukendt fejl'))
    } finally {
      setActionLoading(null)
    }
  }

  const handleDelete = async (categoryId: number) => {
    if (!confirm('Er du sikker på at du vil slette denne kategori?')) return

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    setActionLoading(categoryId)

    try {
      const response = await fetch(`/api/admin/categories/${categoryId}/delete`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Kunne ikke slette kategori')
      }

      setCategories(prev => prev.filter(cat => cat.id !== categoryId))
      alert('Kategori slettet succesfuldt')
    } catch (err) {
      alert('Fejl: ' + (err instanceof Error ? err.message : 'Ukendt fejl'))
    } finally {
      setActionLoading(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F0F1A] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF6A3D] mx-auto"></div>
          <p className="mt-4 text-white/60">Indlæser kategorier...</p>
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
              Kategoristyring
            </h1>
            <p className="text-white/60">
              Administrer kuruskategorier og deres struktur
            </p>
          </div>

          <div className="flex justify-between items-center">
            <button
              onClick={() => router.push('/admin/dashboard')}
              className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
            >
              ← Tilbage til Dashboard
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-[#FF6A3D] text-white rounded-lg hover:bg-[#FF8A3D] transition-colors"
            >
              + Opret Kategori
            </button>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 rounded-xl p-6">
            <div className="text-blue-400 text-sm font-medium mb-1">Total</div>
            <div className="text-white text-3xl font-bold">{categories.length}</div>
          </div>
          <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/30 rounded-xl p-6">
            <div className="text-green-400 text-sm font-medium mb-1">Aktive</div>
            <div className="text-white text-3xl font-bold">
              {categories.filter(c => c.isActive).length}
            </div>
          </div>
          <div className="bg-gradient-to-br from-gray-500/20 to-gray-600/20 border border-gray-500/30 rounded-xl p-6">
            <div className="text-gray-400 text-sm font-medium mb-1">Inaktive</div>
            <div className="text-white text-3xl font-bold">
              {categories.filter(c => !c.isActive).length}
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30 rounded-xl p-6">
            <div className="text-purple-400 text-sm font-medium mb-1">Kurser Total</div>
            <div className="text-white text-3xl font-bold">
              {categories.reduce((sum, c) => sum + c.courseCount, 0)}
            </div>
          </div>
        </div>

        {/* Categories Table */}
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5 border-b border-white/10">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                    Kategori
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                    Slug
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                    Kurser
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                    Rækkefølge
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-white/60 uppercase tracking-wider">
                    Handlinger
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {categories.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-white/40">
                      Ingen kategorier fundet
                    </td>
                  </tr>
                ) : (
                  categories.map((category) => (
                    <tr key={category.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          {category.icon && (
                            <span className="text-2xl">{category.icon}</span>
                          )}
                          <div>
                            <div className="text-white font-medium">{category.name}</div>
                            {category.description && (
                              <div className="text-white/40 text-sm">{category.description}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <code className="text-white/60 text-sm bg-white/5 px-2 py-1 rounded">
                          {category.slug}
                        </code>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-white">{category.courseCount}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          category.isActive
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                            : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                        }`}>
                          {category.isActive ? 'Aktiv' : 'Inaktiv'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-white/60">{category.sortOrder}</span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button
                          onClick={() => handleToggleActive(category.id, category.isActive)}
                          disabled={actionLoading === category.id}
                          className="px-3 py-1.5 text-sm bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg hover:bg-blue-500/30 transition-colors disabled:opacity-50"
                        >
                          {category.isActive ? 'Deaktiver' : 'Aktiver'}
                        </button>
                        <button
                          onClick={() => handleDelete(category.id)}
                          disabled={actionLoading === category.id || category.courseCount > 0}
                          className="px-3 py-1.5 text-sm bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-colors disabled:opacity-50"
                          title={category.courseCount > 0 ? 'Kan ikke slette kategori med kurser' : ''}
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
