import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '@/lib/supabaseClient'
import AdminLayout from '@/components/admin/AdminLayout'
import StatusBadge from '@/components/admin/StatusBadge'
import ConfirmDialog from '@/components/admin/ConfirmDialog'
import LoadingSpinner from '@/components/LoadingSpinner'
import type { CourseStatus } from '@prisma/client'

type Course = {
  id: number
  title: string
  description: string
  priceCents: number
  status: CourseStatus
  createdAt: string
  publishedAt: string | null
  provider: {
    id: number
    companyName: string
    status: string
  }
  category: {
    id: number
    name: string
  }
  _count: {
    purchases: number
  }
}

type Pagination = {
  total: number
  page: number
  limit: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

export default function AdminCoursesPage() {
  const router = useRouter()
  const [courses, setCourses] = useState<Course[]>([])
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  // Confirm dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean
    type: 'approve' | 'reject' | null
    courseId: number | null
    courseTitle: string
  }>({
    isOpen: false,
    type: null,
    courseId: null,
    courseTitle: '',
  })
  const [actionLoading, setActionLoading] = useState(false)

  const fetchCourses = async () => {
    setLoading(true)
    setError(null)

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      router.push('/login?redirect=admin/courses')
      return
    }

    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
      })

      if (statusFilter !== 'all') {
        params.append('status', statusFilter)
      }

      if (searchQuery.trim()) {
        params.append('search', searchQuery.trim())
      }

      const res = await fetch(`/api/admin/courses?${params}`, {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      })

      if (res.status === 403) {
        router.push('/')
        return
      }

      if (!res.ok) {
        throw new Error('Kunne ikke hente kurser')
      }

      const data = await res.json()
      setCourses(data.courses)
      setPagination(data.pagination)
    } catch (err) {
      setError('Der opstod en fejl ved indlæsning af kurser')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCourses()
  }, [statusFilter, currentPage])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1) // Reset to page 1 on new search
    fetchCourses()
  }

  const openConfirmDialog = (type: 'approve' | 'reject', courseId: number, courseTitle: string) => {
    setConfirmDialog({
      isOpen: true,
      type,
      courseId,
      courseTitle,
    })
  }

  const closeConfirmDialog = () => {
    setConfirmDialog({
      isOpen: false,
      type: null,
      courseId: null,
      courseTitle: '',
    })
  }

  const handleCourseAction = async () => {
    if (!confirmDialog.courseId || !confirmDialog.type) return

    setActionLoading(true)

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      router.push('/login?redirect=admin/courses')
      return
    }

    try {
      const endpoint = `/api/admin/courses/${confirmDialog.courseId}/${confirmDialog.type}`
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      })

      if (!res.ok) {
        throw new Error(`Kunne ikke ${confirmDialog.type === 'approve' ? 'godkende' : 'afvise'} kursus`)
      }

      // Refresh courses list
      await fetchCourses()
      closeConfirmDialog()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Der opstod en fejl')
    } finally {
      setActionLoading(false)
    }
  }

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('da-DK', {
      style: 'currency',
      currency: 'DKK',
    }).format(cents / 100)
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('da-DK', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Kursusstyring</h1>
        <p className="text-dark-text-secondary">Administrer og godkend kurser på platformen</p>
      </div>

      {/* Filters */}
      <div className="bg-dark-card border border-dark-border rounded-2xl p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              placeholder="Søg efter kurser..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-4 py-2 bg-dark-bg border border-dark-border rounded-xl text-white placeholder-dark-text-secondary focus:outline-none focus:border-primary transition-colors"
            />
            <button
              type="submit"
              className="px-6 py-2 bg-primary hover:bg-primary/90 text-white rounded-xl font-semibold transition-colors"
            >
              Søg
            </button>
          </form>

          {/* Status Filter */}
          <div className="flex items-center gap-3">
            <label className="text-dark-text-secondary font-medium">Status:</label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value)
                setCurrentPage(1)
              }}
              className="flex-1 px-4 py-2 bg-dark-bg border border-dark-border rounded-xl text-white focus:outline-none focus:border-primary transition-colors"
            >
              <option value="all">Alle</option>
              <option value="PENDING">Afventer godkendelse</option>
              <option value="PUBLISHED">Publiceret</option>
              <option value="DRAFT">Kladde</option>
              <option value="ARCHIVED">Arkiveret</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="flex justify-center py-20">
          <LoadingSpinner size="lg" text="Indlæser kurser..." />
        </div>
      ) : error ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-semibold text-white mb-4">Der opstod en fejl</h2>
          <p className="text-dark-text-secondary mb-8">{error}</p>
          <button
            onClick={fetchCourses}
            className="px-6 py-3 bg-primary rounded-xl text-white hover:bg-primary/90 transition-colors font-semibold"
          >
            Prøv igen
          </button>
        </div>
      ) : courses.length === 0 ? (
        <div className="text-center py-20 bg-dark-card border border-dark-border rounded-2xl">
          <div className="text-6xl mb-4">📚</div>
          <h2 className="text-2xl font-semibold text-white mb-4">Ingen kurser fundet</h2>
          <p className="text-dark-text-secondary">Prøv at justere dine filtre</p>
        </div>
      ) : (
        <>
          {/* Courses Table */}
          <div className="bg-dark-card border border-dark-border rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-dark-bg border-b border-dark-border">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">Kursus</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">Udbyder</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">Kategori</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">Pris</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">Salg</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">Oprettet</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-white">Handlinger</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-border">
                  {courses.map((course) => (
                    <tr key={course.id} className="hover:bg-dark-hover transition-colors">
                      <td className="px-6 py-4">
                        <div className="max-w-xs">
                          <p className="text-white font-semibold truncate">{course.title}</p>
                          <p className="text-dark-text-secondary text-sm truncate">{course.description}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-dark-text-secondary">{course.provider.companyName}</td>
                      <td className="px-6 py-4 text-dark-text-secondary">{course.category.name}</td>
                      <td className="px-6 py-4 text-white font-semibold">{formatPrice(course.priceCents)}</td>
                      <td className="px-6 py-4">
                        <StatusBadge type="course" status={course.status} />
                      </td>
                      <td className="px-6 py-4 text-dark-text-secondary">{course._count.purchases}</td>
                      <td className="px-6 py-4 text-dark-text-secondary">{formatDate(course.createdAt)}</td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          {course.status === 'PENDING' && (
                            <>
                              <button
                                onClick={() => openConfirmDialog('approve', course.id, course.title)}
                                className="px-3 py-1.5 bg-success hover:bg-success/90 text-white rounded-lg text-sm font-semibold transition-colors"
                              >
                                Godkend
                              </button>
                              <button
                                onClick={() => openConfirmDialog('reject', course.id, course.title)}
                                className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-semibold transition-colors"
                              >
                                Afvis
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <p className="text-dark-text-secondary">
                Viser {courses.length} af {pagination.total} kurser
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={!pagination.hasPrevPage}
                  className="px-4 py-2 bg-dark-card border border-dark-border rounded-xl text-white hover:bg-dark-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Forrige
                </button>
                <div className="flex items-center gap-2 px-4">
                  <span className="text-white font-semibold">{pagination.page}</span>
                  <span className="text-dark-text-secondary">af {pagination.totalPages}</span>
                </div>
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={!pagination.hasNextPage}
                  className="px-4 py-2 bg-dark-card border border-dark-border rounded-xl text-white hover:bg-dark-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Næste
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={closeConfirmDialog}
        onConfirm={handleCourseAction}
        title={confirmDialog.type === 'approve' ? 'Godkend kursus' : 'Afvis kursus'}
        message={`Er du sikker på, at du vil ${confirmDialog.type === 'approve' ? 'godkende' : 'afvise'} kurset "${confirmDialog.courseTitle}"?`}
        confirmText={confirmDialog.type === 'approve' ? 'Godkend' : 'Afvis'}
        confirmColor={confirmDialog.type === 'approve' ? 'success' : 'danger'}
        loading={actionLoading}
      />
    </AdminLayout>
  )
}
