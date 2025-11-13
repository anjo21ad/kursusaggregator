import { GetServerSideProps } from 'next'
import { fetchPublishedCourses, fetchActiveCategories } from '@/lib/database-adapter'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '@/lib/supabase/client'
import Link from 'next/link'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import CategorySidebar from '@/components/CategorySidebar'
import CourseBadge from '@/components/CourseBadge'

type Course = {
  id: number
  title: string
  description: string
  shortDesc: string | null
  priceCents: number
  duration: string | null
  location: string | null
  level: string | null
  category: {
    name: string
    icon: string | null
    color: string | null
  }
  provider: {
    companyName: string
  }
}

type Category = {
  id: number
  name: string
  slug: string
  icon: string | null
  color: string | null
  _count: {
    courses: number
  }
}

type Props = {
  courses: Course[]
  categories: Category[]
}

export default function Home({ courses, categories }: Props) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')

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

        router.replace('/')
      }
    }

    registerPurchase()
  }, [router])

  // Filter courses based on search
  const filteredCourses = courses.filter(course =>
    searchQuery === '' ||
    course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.category.name.toLowerCase().includes(searchQuery.toLowerCase())
  )


  return (
    <div className="min-h-screen bg-dark-bg flex flex-col">
      <Navigation />

      {/* Hero Section with MeshGradient Background */}
      <section className="relative bg-dark-bg py-20 border-b border-dark-border overflow-hidden">
        {/* Animated gradient background - commented out until MeshGradient is available
        <div className="absolute inset-0 opacity-20">
          <MeshGradient colors={['#FF6A3D', '#7E6BF1', '#3ABEFF']} />
        </div>
        */}

        <div className="relative max-w-7xl mx-auto px-6 text-center">
          {/* Animated headline */}
          <h1 className="text-5xl lg:text-6xl font-bold text-white mb-6">
            Din B2B Kursusplatform
          </h1>

          <p className="text-xl text-dark-text-secondary max-w-2xl mx-auto mb-8">
            Find og administrér kompetenceudvikling for hele dit team. Ét sted, alle kurser, total kontrol.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
            <Link
              href="/login"
              className="px-8 py-4 bg-primary rounded-xl text-white hover:bg-primary/90 transition-all font-semibold shadow-lg shadow-primary/30 transform hover:scale-105 duration-200"
            >
              Kom i gang gratis
            </Link>
            <button
              onClick={() => {
                const coursesSection = document.querySelector('[data-section="courses"]')
                if (coursesSection) {
                  coursesSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }
              }}
              className="px-8 py-4 bg-dark-card border border-dark-border text-white hover:bg-dark-hover transition-colors font-semibold rounded-xl"
            >
              Se demo
            </button>
          </div>
        </div>
      </section>

      {/* Search Bar */}
      <section className="bg-dark-card border-b border-dark-border">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="Søg efter kurser, kategorier eller udbydere..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-6 py-4 pl-14 bg-dark-bg border border-dark-border rounded-xl text-white placeholder-dark-text-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
              <svg
                className="absolute left-5 top-1/2 transform -translate-y-1/2 w-5 h-5 text-dark-text-secondary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            {searchQuery && (
              <p className="mt-3 text-sm text-dark-text-secondary text-center">
                Viser {filteredCourses.length} af {courses.length} kurser
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Main Content with Sidebar */}
      <section className="max-w-7xl mx-auto px-6 py-12 flex-1" data-section="courses">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Category Sidebar */}
          <CategorySidebar categories={categories} activeSlug={null} />

          {/* Course Grid */}
          <div className="flex-1">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-white">
                  Alle kurser
                </h2>
                <p className="text-dark-text-secondary mt-1">
                  {filteredCourses.length} {filteredCourses.length === 1 ? 'kursus' : 'kurser'} tilgængelig{filteredCourses.length === 1 ? 't' : 'e'}
                </p>
              </div>
            </div>

            {/* Database Connection Error */}
            {courses.length === 0 && (
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-8 text-center">
                <div className="text-6xl mb-4">⚠️</div>
                <h3 className="text-xl font-bold text-yellow-400 mb-2">
                  Database Forbindelse Fejlet
                </h3>
                <p className="text-dark-text-secondary mb-4">
                  Kunne ikke forbinde til databasen. Dette skyldes sandsynligvis en firewall der blokerer PostgreSQL forbindelser.
                </p>
                <div className="bg-dark-card border border-dark-border rounded-lg p-4 text-left text-sm text-dark-text-secondary">
                  <p className="mb-2"><strong className="text-white">Løsninger:</strong></p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Forbind til et andet netværk (hjemme, mobil hotspot)</li>
                    <li>Brug VPN for at omgå firewallen</li>
                    <li>Kontakt IT-support for at åbne port 6543 til *.pooler.supabase.com</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Course Cards */}
            {filteredCourses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredCourses.map(course => (
                  <div
                    key={course.id}
                    className="bg-dark-card border border-dark-border rounded-xl p-6 hover:border-primary/50 transition-all duration-300 group hover:shadow-xl hover:shadow-primary/10"
                  >
                    {/* Category Badge */}
                    <div className="mb-4">
                      <CourseBadge
                        icon={course.category.icon || '📁'}
                        label={course.category.name}
                        variant="category"
                        color={course.category.color || undefined}
                      />
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-primary transition-colors line-clamp-2">
                      {course.title}
                    </h3>

                    {/* Description */}
                    <p className="text-dark-text-secondary text-sm mb-4 line-clamp-2">
                      {course.shortDesc || course.description}
                    </p>

                    {/* Metadata Badges */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {course.level && (
                        <CourseBadge icon="📊" label={course.level} variant="level" />
                      )}
                      {course.location && (
                        <CourseBadge icon="📍" label={course.location} variant="location" />
                      )}
                      {course.duration && (
                        <CourseBadge icon="⏱️" label={course.duration} variant="duration" />
                      )}
                    </div>

                    {/* Footer */}
                    <div className="pt-4 border-t border-dark-border flex justify-between items-center">
                      <div>
                        <div className="text-2xl font-bold text-primary">
                          {course.priceCents === 0 ? 'GRATIS' : `${(course.priceCents / 100).toFixed(0)} kr`}
                        </div>
                        <div className="text-xs text-dark-text-secondary mt-1">
                          {course.isAIGenerated ? '🤖 AI-genereret' : course.provider?.companyName || 'Ukendt udbyder'}
                        </div>
                      </div>
                      <Link
                        href={`/courses/${course.id}`}
                        className="px-4 py-2 bg-primary rounded-lg text-white hover:bg-primary/90 transition-all font-semibold shadow-lg shadow-primary/20 transform hover:scale-105 duration-200"
                      >
                        Læs mere
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Empty State */
              <div className="text-center py-20 bg-dark-card border border-dark-border rounded-xl">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-2xl font-semibold text-white mb-4">Ingen kurser fundet</h3>
                <p className="text-dark-text-secondary mb-8">
                  {searchQuery
                    ? `Vi kunne ikke finde nogen kurser der matcher "${searchQuery}"`
                    : 'Der er ingen tilgængelige kurser i øjeblikket'
                  }
                </p>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="px-6 py-3 bg-primary rounded-xl text-white hover:bg-primary/90 transition-colors font-semibold shadow-lg shadow-primary/20"
                  >
                    Ryd søgning
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async () => {
  try {
    // Use hybrid database adapter (Supabase REST API for reliability)
    const [courses, categories] = await Promise.all([
      fetchPublishedCourses(),
      fetchActiveCategories(),
    ]);

    return {
      props: {
        courses: courses as any,
        categories: categories as any,
      },
    };
  } catch (error) {
    console.error('Error fetching homepage data:', error);
    return {
      props: {
        courses: [],
        categories: [],
      },
    };
  }
}
