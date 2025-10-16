import { GetServerSideProps } from 'next'
import { prisma } from '@/lib/prisma'
import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '@/lib/supabaseClient'
import Link from 'next/link'

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
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="bg-card/80 backdrop-blur-sm border-b border-text-muted/20">
        <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-text-light">CourseHub</div>
          <div className="hidden md:flex space-x-8">
            <a href="#" className="text-text-muted hover:text-text-light transition-colors">Kurser</a>
            <a href="#" className="text-text-muted hover:text-text-light transition-colors">For Virksomheder</a>
            <a href="#" className="text-text-muted hover:text-text-light transition-colors">Udbydere</a>
          </div>
          <div className="flex space-x-4">
            <Link 
              href="/register-provider" 
              className="px-5 py-3 rounded-xl bg-card border border-secondary text-secondary hover:bg-secondary hover:text-white transition-colors font-semibold"
            >
              Bliv Udbyder
            </Link>
            <Link 
              href="/login" 
              className="px-5 py-3 bg-primary rounded-xl text-white hover:bg-primary-dark transition-colors font-semibold"
            >
              Log ind
            </Link>
          </div>
        </div>
      </nav>

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
      <section className="max-w-5xl mx-auto px-6 py-12">
        <h2 className="text-2xl font-bold text-text-light mb-8">Tilgængelige Kurser</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map(course => (
            <div key={course.id} className="bg-card rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
              <h3 className="text-xl font-semibold text-text-light">{course.title}</h3>
              <p className="text-text-muted mt-2">{course.description}</p>
              <div className="mt-4 flex justify-between items-center">
                <span className="text-primary font-bold">{(course.priceCents / 100).toFixed(2)} kr</span>
                <button 
                  onClick={() => handleCheckout(course)}
                  className="px-4 py-2 bg-primary rounded-xl text-white hover:bg-primary-dark transition-colors font-semibold"
                >
                  Læs mere
                </button>
              </div>
              <p className="text-text-muted text-sm mt-2">Udbyder: {course.provider.companyName}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async () => {
  try {
    const courses = await prisma.course.findMany({
      include: {
        provider: {
          select: {
            companyName: true
          }
        }
      }
      // Removed status filter since Course table might not have status column yet
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
