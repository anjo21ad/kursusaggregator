import { GetServerSideProps } from 'next'
import { prisma } from '@/lib/prisma'
import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '@/lib/supabaseClient'
import Link from 'next/link'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'

type Course = {
  id: number
  title: string
  description: string
  priceCents: number
  provider: {
    companyName: string
  }
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
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />

      {/* Hero Section */}
      <section className="bg-background py-20">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h1 className="text-4xl font-bold text-text-light">Din B2B Kursusplatform</h1>
          <p className="text-xl text-text-muted mt-4">Find og administrér kompetenceudvikling ét sted</p>
          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
            <button className="px-6 py-3 bg-primary rounded-xl text-white hover:bg-primary-dark transition-colors font-semibold">
              Kom i gang
            </button>
            <button className="px-6 py-3 bg-card border border-secondary text-secondary hover:bg-secondary hover:text-white transition-colors font-semibold">
              Tal med os
            </button>
          </div>
        </div>
      </section>

      {/* Course Grid */}
      <section className="max-w-5xl mx-auto px-6 py-12 flex-1">
        <h2 className="text-2xl font-bold text-text-light mb-8">Tilgængelige Kurser</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map(course => (
            <div key={course.id} className="bg-card rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
              <h3 className="text-xl font-semibold text-text-light">{course.title}</h3>
              <p className="text-text-muted mt-2 line-clamp-3">{course.description}</p>
              <div className="mt-4 flex justify-between items-center">
                <span className="text-primary font-bold">{(course.priceCents / 100).toFixed(2)} kr</span>
                <Link
                  href={`/courses/${course.id}`}
                  className="px-4 py-2 bg-primary rounded-xl text-white hover:bg-primary-dark transition-colors font-semibold"
                >
                  Læs mere
                </Link>
              </div>
              <p className="text-text-muted text-sm mt-2">Udbyder: {course.provider.companyName}</p>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async () => {
  try {
    const courses = await prisma.course.findMany({
      where: {
        status: 'PUBLISHED',
        isActive: true
      },
      select: {
        id: true,
        title: true,
        description: true,
        priceCents: true,
        provider: {
          select: {
            companyName: true
          }
        }
      }
    })

    return {
      props: {
        courses,
      },
    }
  } catch (error) {
    console.error('Error fetching courses:', error)
    return {
      props: {
        courses: [],
      },
    }
  }
}
