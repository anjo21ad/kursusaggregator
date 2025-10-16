import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import Link from 'next/link'

type Course = {
  id: number
  title: string
  description: string
  priceCents: number
  provider: string
}

export default function MyCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCourses = async () => {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        alert('Du skal være logget ind for at se dine kurser.')
        return
      }

      const res = await fetch('/api/my-courses', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      })

      const data = await res.json()
      setCourses(data)
      setLoading(false)
    }

    fetchCourses()
  }, [])

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="bg-card/80 backdrop-blur-sm border-b border-text-muted/20">
        <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-text-light">Kursusaggregator</div>
          <Link href="/" className="text-accent hover:underline transition-all">
            ← Tilbage til forsiden
          </Link>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-text-light mb-8">Mine Kurser</h1>
        
        {loading ? (
          <div className="space-y-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse bg-card rounded-2xl p-6">
                <div className="h-6 bg-text-muted/20 rounded mb-4"></div>
                <div className="h-4 bg-text-muted/20 rounded mb-2"></div>
                <div className="h-4 bg-text-muted/20 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📚</div>
            <h2 className="text-2xl font-semibold text-text-light mb-4">Ingen kurser endnu</h2>
            <p className="text-text-muted mb-8">Du har endnu ikke købt nogen kurser</p>
            <Link 
              href="/" 
              className="inline-block px-6 py-3 bg-primary rounded-xl text-white hover:bg-primary-dark transition-colors"
            >
              Udforsk Kurser
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {courses.map(course => (
              <div key={course.id} className="bg-card rounded-2xl p-6 shadow-lg">
                <h2 className="text-xl font-semibold text-text-light mb-2">{course.title}</h2>
                <p className="text-text-muted mb-4">{course.description}</p>
                <div className="border-t border-text-muted/20 pt-4">
                  <p className="text-sm text-text-muted">Udbyder: {course.provider}</p>
                </div>
                <div className="mt-4">
                  <button className="w-full px-4 py-2 bg-success rounded-xl text-white hover:bg-success/80 transition-colors">
                    Åbn Kursus
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
