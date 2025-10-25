import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'
import AdminLayout from '@/components/admin/AdminLayout'
import StatsCard from '@/components/admin/StatsCard'
import StatusBadge from '@/components/admin/StatusBadge'
import LoadingSpinner from '@/components/LoadingSpinner'

type DashboardStats = {
  overview: {
    totalCourses: number
    totalProviders: number
    totalUsers: number
    totalPurchases: number
    totalRevenue: number
    pendingCourses: number
    pendingProviders: number
    publishedCourses: number
  }
  recentActivity: {
    recentPurchases: Array<{
      id: number
      createdAt: string
      course: { id: number; title: string }
      user: { email: string }
    }>
    recentCourses: Array<{
      id: number
      title: string
      status: string
      createdAt: string
      provider: { companyName: string }
    }>
  }
  pendingItems: {
    pendingCourses: Array<{
      id: number
      title: string
      createdAt: string
      provider: { companyName: string }
    }>
    pendingProviders: Array<{
      id: number
      companyName: string
      email: string
      createdAt: string
    }>
  }
  revenueChart: Array<{
    month: string
    revenue: number
    purchases: number
  }>
  topCourses: Array<{
    id: number
    title: string
    purchaseCount: number
    revenue: number
    provider: { companyName: string }
  }>
}

export default function AdminDashboardPage() {
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        router.push('/login?redirect=admin/dashboard')
        return
      }

      try {
        const res = await fetch('/api/admin/stats', {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        })

        if (res.status === 403) {
          router.push('/')
          return
        }

        if (!res.ok) {
          throw new Error('Kunne ikke hente statistik')
        }

        const data = await res.json()
        setStats(data)

        // Show warning if database error
        if (data.error) {
          setError(data.error)
        }
      } catch (err) {
        setError('Der opstod en fejl ved indlæsning af statistik')
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [router])

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('da-DK', {
      style: 'currency',
      currency: 'DKK',
    }).format(cents / 100)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('da-DK', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center py-20">
          <LoadingSpinner size="lg" text="Indlæser dashboard..." />
        </div>
      </AdminLayout>
    )
  }

  if (!stats) {
    return (
      <AdminLayout>
        <div className="text-center py-20">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-semibold text-white mb-4">Der opstod en fejl</h2>
          <p className="text-dark-text-secondary mb-8">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-primary rounded-xl text-white hover:bg-primary/90 transition-colors font-semibold"
          >
            Prøv igen
          </button>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-dark-text-secondary">Oversigt over platformens aktivitet og statistik</p>
      </div>

      {/* Database Warning */}
      {error && (
        <div className="mb-6 bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚠️</span>
            <div className="flex-1">
              <h3 className="text-yellow-400 font-semibold mb-1">Database forbindelsesfejl</h3>
              <p className="text-yellow-400/80 text-sm">{error}</p>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 rounded-lg text-sm font-semibold transition-colors"
            >
              Prøv igen
            </button>
          </div>
        </div>
      )}

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Kurser"
          value={stats.overview.totalCourses}
          subtitle={`${stats.overview.publishedCourses} publiceret`}
          icon="📚"
          color="primary"
        />
        <StatsCard
          title="Udbydere"
          value={stats.overview.totalProviders}
          subtitle={stats.overview.pendingProviders > 0 ? `${stats.overview.pendingProviders} afventer` : 'Alle godkendt'}
          icon="🏢"
          color="secondary"
        />
        <StatsCard
          title="Brugere"
          value={stats.overview.totalUsers}
          subtitle="Registrerede brugere"
          icon="👥"
          color="accent"
        />
        <StatsCard
          title="Samlet omsætning"
          value={formatPrice(stats.overview.totalRevenue)}
          subtitle={`${stats.overview.totalPurchases} salg`}
          icon="💰"
          color="success"
        />
      </div>

      {/* Pending Items */}
      {(stats.pendingItems?.pendingCourses?.length > 0 || stats.pendingItems?.pendingProviders?.length > 0) && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Kræver handling</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pending Courses */}
            {stats.pendingItems?.pendingCourses && stats.pendingItems.pendingCourses.length > 0 && (
              <div className="bg-dark-card border border-dark-border rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Kurser afventer godkendelse</h3>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-400">
                    {stats.pendingItems.pendingCourses.length}
                  </span>
                </div>
                <div className="space-y-3">
                  {stats.pendingItems.pendingCourses.slice(0, 5).map((course) => (
                    <div key={course.id} className="flex items-start justify-between p-3 bg-dark-bg rounded-xl">
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium truncate">{course.title}</p>
                        <p className="text-dark-text-secondary text-sm">{course.provider?.companyName || 'Ingen udbyder'}</p>
                        <p className="text-dark-text-secondary text-xs mt-1">{formatDate(course.createdAt)}</p>
                      </div>
                    </div>
                  ))}
                </div>
                {stats.pendingItems.pendingCourses.length > 0 && (
                  <Link
                    href="/admin/courses?status=PENDING"
                    className="mt-4 block text-center px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-xl font-semibold transition-colors"
                  >
                    Se alle ({stats.pendingItems.pendingCourses.length})
                  </Link>
                )}
              </div>
            )}

            {/* Pending Providers */}
            {stats.pendingItems?.pendingProviders && stats.pendingItems.pendingProviders.length > 0 && (
              <div className="bg-dark-card border border-dark-border rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Udbydere afventer godkendelse</h3>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-400">
                    {stats.pendingItems.pendingProviders.length}
                  </span>
                </div>
                <div className="space-y-3">
                  {stats.pendingItems.pendingProviders.slice(0, 5).map((provider) => (
                    <div key={provider.id} className="flex items-start justify-between p-3 bg-dark-bg rounded-xl">
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium truncate">{provider.companyName || 'Unavngivet virksomhed'}</p>
                        <p className="text-dark-text-secondary text-sm">{provider.email || 'Ingen email'}</p>
                        <p className="text-dark-text-secondary text-xs mt-1">{formatDate(provider.createdAt)}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 text-center">
                  <p className="text-dark-text-secondary text-sm">Udbyderstyring kommer snart</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Top Courses */}
      {stats.topCourses && stats.topCourses.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Top kurser</h2>
          <div className="bg-dark-card border border-dark-border rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-dark-bg border-b border-dark-border">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">Kursus</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">Udbyder</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-white">Salg</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-white">Omsætning</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-border">
                  {stats.topCourses.slice(0, 5).map((course) => (
                    <tr key={course.id} className="hover:bg-dark-hover transition-colors">
                      <td className="px-6 py-4 text-white font-medium">{course.title}</td>
                      <td className="px-6 py-4 text-dark-text-secondary">{course.provider?.companyName || 'Ingen udbyder'}</td>
                      <td className="px-6 py-4 text-right text-white">{course.purchaseCount}</td>
                      <td className="px-6 py-4 text-right text-success font-semibold">{formatPrice(course.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Revenue Chart */}
      {stats.revenueChart && stats.revenueChart.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Omsætning (sidste 12 måneder)</h2>
          <div className="bg-dark-card border border-dark-border rounded-2xl p-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-dark-bg border-b border-dark-border">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-white">Måned</th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-white">Salg</th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-white">Omsætning</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-border">
                  {stats.revenueChart.map((item) => (
                    <tr key={item.month} className="hover:bg-dark-hover transition-colors">
                      <td className="px-6 py-3 text-white">{item.month}</td>
                      <td className="px-6 py-3 text-right text-dark-text-secondary">{item.purchases}</td>
                      <td className="px-6 py-3 text-right text-success font-semibold">{formatPrice(item.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Purchases */}
        <div className="bg-dark-card border border-dark-border rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Seneste køb</h3>
          {!stats.recentActivity?.recentPurchases || stats.recentActivity.recentPurchases.length === 0 ? (
            <p className="text-dark-text-secondary text-center py-8">Ingen køb endnu</p>
          ) : (
            <div className="space-y-3">
              {stats.recentActivity.recentPurchases.map((purchase) => (
                <div key={purchase.id} className="flex items-start justify-between p-3 bg-dark-bg rounded-xl">
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">{purchase.course?.title || 'Ukendt kursus'}</p>
                    <p className="text-dark-text-secondary text-sm">{purchase.user?.email || 'Ukendt bruger'}</p>
                    <p className="text-dark-text-secondary text-xs mt-1">{formatDate(purchase.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Courses */}
        <div className="bg-dark-card border border-dark-border rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Seneste kurser</h3>
          {!stats.recentActivity?.recentCourses || stats.recentActivity.recentCourses.length === 0 ? (
            <p className="text-dark-text-secondary text-center py-8">Ingen kurser endnu</p>
          ) : (
            <div className="space-y-3">
              {stats.recentActivity.recentCourses.map((course) => (
                <div key={course.id} className="flex items-start justify-between p-3 bg-dark-bg rounded-xl">
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">{course.title}</p>
                    <p className="text-dark-text-secondary text-sm">{course.provider?.companyName || 'Ingen udbyder'}</p>
                    <p className="text-dark-text-secondary text-xs mt-1">{formatDate(course.createdAt)}</p>
                  </div>
                  <StatusBadge type="course" status={course.status} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}
