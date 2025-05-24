import { GetServerSideProps } from 'next'
import { prisma } from '@/lib/prisma'
import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '@/lib/supabaseClient'

type Course = {
  id: number
  title: string
  description: string
  priceCents: number
  provider: string
}

type Props = {
  courses: Course[]
}

export default function Home({ courses }: Props) {
  const router = useRouter()

  useEffect(() => {
    const registerPurchase = async () => {
      const url = new URL(window.location.href)
      const success = url.searchParams.get('success')
      const courseId = url.searchParams.get('courseId')

      if (success && courseId) {
        const { data: { session } } = await supabase.auth.getSession()

        if (session) {
          await fetch('/api/purchase', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({ courseId: Number(courseId) }),
          })
        }

        router.replace('/') // Fjern query params efter registrering
      }
    }

    registerPurchase()
  }, [router])

  const handleCheckout = async (course: Course) => {
    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ course }),
    })

    const data = await res.json()
    if (data.url) {
      window.location.href = data.url
    } else {
      alert('Noget gik galt ved checkout...')
    }
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Kurser</h1>
      {courses.map(course => (
        <div key={course.id} style={{ border: '1px solid #ccc', marginBottom: '1rem', padding: '1rem' }}>
          <h2>{course.title}</h2>
          <p>{course.description}</p>
          <p><strong>Pris:</strong> {(course.priceCents / 100).toFixed(2)} kr.</p>
          <p><em>Udbyder:</em> {course.provider}</p>
          <button onClick={() => handleCheckout(course)}>Køb</button>
        </div>
      ))}
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async () => {
  const courses = await prisma.course.findMany()
  return {
    props: {
      courses,
    },
  }
}
