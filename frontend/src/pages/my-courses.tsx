import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import LoadingSpinner from '@/components/LoadingSpinner'

type Course = {
  id: number
  title: string
  description: string
  priceCents: number
  provider: string
}

export default function MyCoursesPage() {
  const router = useRouter()
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCourses = async () => {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        router.push('/login?redirect=my-courses')
        return
      }

      try {
        const res = await fetch('/api/my-courses', {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        })

        if (!res.ok) {
          throw new Error('Kunne ikke hente kurser')
        }

        const data = await res.json()
        setCourses(data)
      } catch (err) {
        setError('Der opstod en fejl ved indlæsning af dine kurser')
      } finally {
        setLoading(false)
      }
    }

    fetchCourses()
  }, [router])

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />

      <div className="flex-1 max-w-5xl mx-auto px-6 py-12 w-full">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-light">Mine Kurser</h1>
          <p className="text-text-muted mt-2">Se og tilgå alle dine købte kurser</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <LoadingSpinner size="lg" text="Indlæser dine kurser..." />
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">❌</div>
            <h2 className="text-2xl font-semibold text-text-light mb-4">Der opstod en fejl</h2>
            <p className="text-text-muted mb-8">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-primary rounded-xl text-white hover:bg-primary-dark transition-colors font-semibold"
            >
              Prøv igen
            </button>
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📚</div>
            <h2 className="text-2xl font-semibold text-text-light mb-4">Ingen kurser endnu</h2>
            <p className="text-text-muted mb-8">Du har endnu ikke købt nogen kurser</p>
            <Link
              href="/"
              className="inline-block px-6 py-3 bg-primary rounded-xl text-white hover:bg-primary-dark transition-colors font-semibold"
            >
              Udforsk Kurser
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {courses.map(course => (
              <div
                key={course.id}
                className="bg-card rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all group"
              >
                <div className="flex items-start justify-between mb-4">
                  <h2 className="text-xl font-semibold text-text-light group-hover:text-primary transition-colors">
                    {course.title}
                  </h2>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success/20 text-success">
                    Købt
                  </span>
                </div>

                <p className="text-text-muted mb-4 line-clamp-2">{course.description}</p>

                <div className="border-t border-text-muted/20 pt-4 mb-4">
                  <p className="text-sm text-text-muted">Udbyder: {course.provider}</p>
                </div>

                <Link
                  href={`/courses/${course.id}`}
                  className="w-full block px-4 py-3 bg-primary rounded-xl text-white text-center hover:bg-primary-dark transition-colors font-semibold"
                >
                  Åbn Kursus
                </Link>
              </div>
            ))}
          </div>
        )}

        {courses.length > 0 && (
          <div className="mt-12 text-center">
            <Link
              href="/"
              className="inline-flex items-center text-accent hover:underline transition-all"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Udforsk flere kurser
            </Link>
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}
