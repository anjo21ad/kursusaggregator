import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '@/lib/supabaseClient'

interface ProviderStats {
  totalCourses: number
  publishedCourses: number
  draftCourses: number
  totalPurchases: number
  totalLeads: number
  totalRevenue: number
  monthlyRevenue: number
}

interface Course {
  id: number
  title: string
  description: string
  shortDesc?: string
  priceCents: number
  status: 'DRAFT' | 'PENDING_REVIEW' | 'PUBLISHED' | 'ARCHIVED'
  publishedAt?: string
  createdAt: string
  category: {
    name: string
  }
  _count: {
    purchases: number
    leads: number
  }
}

interface UserProfile {
  id: string
  email: string
  firstName?: string
  lastName?: string
  role: string
  provider?: {
    id: number
    companyName: string
    status: string
    contactEmail: string
  }
}

export default function ProviderDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [stats, setStats] = useState<ProviderStats | null>(null)
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        router.push('/login?redirect=provider/dashboard')
        return
      }

      // Hent bruger profil
      const userResponse = await fetch('/api/user/profile', {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      })
      
      if (userResponse.ok) {
        const userData = await userResponse.json()
        
        if (userData.role !== 'PROVIDER') {
          router.push('/?error=access-denied')
          return
        }

        if (!userData.provider || userData.provider.status !== 'APPROVED') {
          router.push('/provider/pending')
          return
        }

        setUser(userData)
        await fetchDashboardData(session.access_token)
      } else {
        router.push('/login?error=access-denied')
      }
    }

    checkAuth()
  }, [router])

  const fetchDashboardData = async (token: string) => {
    try {
      // Fetch provider stats and courses
      const [statsResponse, coursesResponse] = await Promise.all([
        fetch('/api/provider/stats', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch('/api/provider/courses', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ])

      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setStats(statsData)
      }

      if (coursesResponse.ok) {
        const coursesData = await coursesResponse.json()
        setCourses(coursesData.courses)
      }
    } catch (err) {
      console.error('Dashboard error:', err)
      setError('Kunne ikke indlæse dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      DRAFT: 'bg-gray-100 text-gray-800',
      PENDING_REVIEW: 'bg-yellow-100 text-yellow-800',
      PUBLISHED: 'bg-green-100 text-green-800',
      ARCHIVED: 'bg-red-100 text-red-800'
    }

    const labels = {
      DRAFT: 'Kladde',
      PENDING_REVIEW: 'Afventer review',
      PUBLISHED: 'Publiceret',
      ARCHIVED: 'Arkiveret'
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
          <p className="mt-4 text-gray-600">Indlæser dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">{error}</p>
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="md:flex md:items-center md:justify-between">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl">
                Velkommen, {user?.firstName || 'Provider'}! 👋
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                {user?.provider?.companyName} • Provider Dashboard
              </p>
            </div>
            <div className="mt-4 flex space-x-3 md:mt-0">
              <button
                onClick={() => router.push('/provider/courses/new')}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
              >
                ➕ Nyt Kursus
              </button>
              <button
                onClick={() => supabase.auth.signOut()}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Log ud
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">📚</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Kurser</dt>
                      <dd className="text-lg font-medium text-gray-900">{stats.totalCourses}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">✅</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Publiceret</dt>
                      <dd className="text-lg font-medium text-gray-900">{stats.publishedCourses}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">💰</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Salg (Total)</dt>
                      <dd className="text-lg font-medium text-gray-900">{stats.totalPurchases}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">📧</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Leads</dt>
                      <dd className="text-lg font-medium text-gray-900">{stats.totalLeads}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-white shadow rounded-lg mb-8">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Hurtige Handlinger</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <button
                onClick={() => router.push('/provider/courses/new')}
                className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <div className="flex-shrink-0">
                  <span className="text-2xl">➕</span>
                </div>
                <div className="flex-1 min-w-0">
                  <span className="absolute inset-0" aria-hidden="true" />
                  <p className="text-sm font-medium text-gray-900">Opret Nyt Kursus</p>
                  <p className="text-sm text-gray-500">Start med at tilføje et kursus</p>
                </div>
              </button>

              <button
                onClick={() => router.push('/provider/courses')}
                className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <div className="flex-shrink-0">
                  <span className="text-2xl">📝</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">Administrer Kurser</p>
                  <p className="text-sm text-gray-500">Rediger og opdater kurser</p>
                </div>
              </button>

              <button
                onClick={() => router.push('/provider/leads')}
                className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <div className="flex-shrink-0">
                  <span className="text-2xl">📊</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">Se Leads</p>
                  <p className="text-sm text-gray-500">Følg op på interesserede virksomheder</p>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Recent Courses */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Dine Kurser</h3>
              {courses.length > 0 && (
                <button
                  onClick={() => router.push('/provider/courses')}
                  className="text-sm text-indigo-600 hover:text-indigo-500"
                >
                  Se alle →
                </button>
              )}
            </div>
          </div>

          {courses.length === 0 ? (
            <div className="text-center py-12">
              <span className="text-6xl mb-4 block">📚</span>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Ingen kurser endnu</h3>
              <p className="text-gray-500 mb-6">Kom i gang med at oprette dit første kursus</p>
              <button
                onClick={() => router.push('/provider/courses/new')}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Opret Kursus
              </button>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {courses.slice(0, 5).map((course) => (
                <li key={course.id} className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-gray-900 truncate">
                          {course.title}
                        </h4>
                        <div className="ml-2 flex-shrink-0">
                          {getStatusBadge(course.status)}
                        </div>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500">
                        <span className="truncate">{course.category.name}</span>
                        <span className="mx-2">•</span>
                        <span>{(course.priceCents / 100).toLocaleString('da-DK')} kr</span>
                        <span className="mx-2">•</span>
                        <span>{course._count.purchases} salg</span>
                        <span className="mx-2">•</span>
                        <span>{course._count.leads} leads</span>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}