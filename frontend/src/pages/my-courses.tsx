import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

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
    <div style={{ padding: '2rem' }}>
      <h1>Mine kurser</h1>
      {loading ? (
        <p>Indlæser...</p>
      ) : courses.length === 0 ? (
        <p>Du har endnu ikke købt nogen kurser.</p>
      ) : (
        courses.map(course => (
          <div key={course.id} style={{ border: '1px solid #ccc', marginBottom: '1rem', padding: '1rem' }}>
            <h2>{course.title}</h2>
            <p>{course.description}</p>
            <p><strong>Udbyder:</strong> {course.provider}</p>
          </div>
        ))
      )}
    </div>
  )
}
