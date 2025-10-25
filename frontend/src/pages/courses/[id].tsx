import { GetServerSideProps } from 'next'
import { fetchCourseById } from '@/lib/database-adapter'
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
  shortDesc: string | null
  priceCents: number
  duration: string | null
  maxParticipants: number | null
  location: string | null
  language: string
  level: string | null
  provider: {
    companyName: string
    website: string | null
  }
  category: {
    name: string
  }
}

type Props = {
  course: Course
}

export default function CoursePage({ course }: Props) {
  const [hasAccess, setHasAccess] = useState<boolean | null>(null)
  const [isCheckingAccess, setIsCheckingAccess] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const checkAccess = async () => {
      setIsCheckingAccess(true)
      setError(null)

      try {
        const { data: { session } } = await supabase.auth.getSession()

        if (!session) {
          setIsAuthenticated(false)
          setHasAccess(false)
          setIsCheckingAccess(false)
          return
        }

        setIsAuthenticated(true)

        const res = await fetch(`/api/has-access?courseId=${course?.id}`, {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        })

        if (!res.ok) {
          throw new Error('Kunne ikke tjekke adgang')
        }

        const data = await res.json()
        setHasAccess(data.access)
      } catch (err) {
        setError('Der opstod en fejl ved tjek af adgang')
        setHasAccess(false)
      } finally {
        setIsCheckingAccess(false)
      }
    }

    checkAccess()
  }, [course, router])

  // Format price
  const formatPrice = (cents: number) => {
    return `${(cents / 100).toLocaleString('da-DK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} kr.`
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />

      <div className="flex-1">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-primary/20 via-secondary/20 to-background border-b border-text-muted/20">
          <div className="max-w-5xl mx-auto px-6 py-16">
            <div className="mb-4">
              <Link
                href="/"
                className="inline-flex items-center text-text-muted hover:text-text-light transition-colors"
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
                  <path d="M15 19l-7-7 7-7" />
                </svg>
                Tilbage til kurser
              </Link>
            </div>

            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-secondary/20 text-secondary mb-4">
                  {course.category.name}
                </span>
                <h1 className="text-4xl md:text-5xl font-bold text-text-light mb-4">
                  {course.title}
                </h1>
                {course.shortDesc && (
                  <p className="text-xl text-text-muted">{course.shortDesc}</p>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-6 text-sm">
              {course.level && (
                <div className="flex items-center text-text-muted">
                  <svg className="w-5 h-5 mr-2 text-accent" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span>Niveau: {course.level}</span>
                </div>
              )}
              {course.duration && (
                <div className="flex items-center text-text-muted">
                  <svg className="w-5 h-5 mr-2 text-accent" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{course.duration}</span>
                </div>
              )}
              {course.location && (
                <div className="flex items-center text-text-muted">
                  <svg className="w-5 h-5 mr-2 text-accent" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>{course.location}</span>
                </div>
              )}
              {course.language && (
                <div className="flex items-center text-text-muted">
                  <svg className="w-5 h-5 mr-2 text-accent" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                  </svg>
                  <span>{course.language === 'da' ? 'Dansk' : course.language}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-5xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Course Details */}
            <div className="lg:col-span-2 space-y-8">
              {/* Description */}
              <div className="bg-card rounded-2xl p-8 shadow-lg">
                <h2 className="text-2xl font-bold text-text-light mb-4">Om kurset</h2>
                <div className="text-text-muted whitespace-pre-line leading-relaxed">
                  {course.description}
                </div>
              </div>

              {/* What You'll Learn / Course Content */}
              {hasAccess && (
                <div className="bg-card rounded-2xl p-8 shadow-lg">
                  <h2 className="text-2xl font-bold text-text-light mb-4">Kursusindhold</h2>
                  <div className="text-text-muted">
                    <p className="mb-4">🎓 Du har adgang til dette kursus!</p>
                    <div className="bg-success/10 border border-success/20 rounded-xl p-6">
                      <p className="text-success font-medium mb-2">Velkommen til kurset</p>
                      <p className="text-text-muted text-sm">
                        Her vil kursusindholdet være tilgængeligt. Dette kunne omfatte videoer,
                        materialer, opgaver og quizzer.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Additional Info */}
              <div className="bg-card rounded-2xl p-8 shadow-lg">
                <h2 className="text-2xl font-bold text-text-light mb-4">Yderligere information</h2>
                <div className="space-y-4">
                  {course.maxParticipants && (
                    <div>
                      <h3 className="font-semibold text-text-light mb-1">Maksimalt antal deltagere</h3>
                      <p className="text-text-muted">{course.maxParticipants} personer</p>
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold text-text-light mb-1">Udbyder</h3>
                    <p className="text-text-muted">
                      {course.provider.companyName}
                      {course.provider.website && (
                        <>
                          {' - '}
                          <a
                            href={course.provider.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-accent hover:underline"
                          >
                            Besøg hjemmeside
                          </a>
                        </>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Pricing & CTA */}
            <div className="lg:col-span-1">
              <div className="bg-card rounded-2xl p-8 shadow-lg sticky top-24">
                <div className="mb-6">
                  <p className="text-sm text-text-muted mb-2">Pris</p>
                  <p className="text-4xl font-bold text-text-light">{formatPrice(course.priceCents)}</p>
                  <p className="text-sm text-text-muted mt-1">ekskl. moms</p>
                </div>

                {isCheckingAccess ? (
                  <div className="py-8">
                    <LoadingSpinner size="md" text="Tjekker adgang..." />
                  </div>
                ) : error ? (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-4">
                    <p className="text-red-400 text-sm">{error}</p>
                  </div>
                ) : hasAccess ? (
                  <div className="space-y-4">
                    <div className="bg-success/10 border border-success/20 rounded-xl p-4">
                      <div className="flex items-center space-x-2 text-success">
                        <svg className="w-5 h-5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                          <path d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="font-semibold">Du ejer dette kursus</span>
                      </div>
                    </div>
                    <button
                      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                      className="w-full px-6 py-4 bg-primary rounded-xl text-white hover:bg-primary-dark transition-colors font-semibold text-center"
                    >
                      Se kursusindhold
                    </button>
                    <Link
                      href="/my-courses"
                      className="block w-full px-6 py-3 bg-card border border-secondary text-secondary hover:bg-secondary hover:text-white rounded-xl transition-colors font-semibold text-center"
                    >
                      Mine kurser
                    </Link>
                  </div>
                ) : isAuthenticated ? (
                  <div className="space-y-4">
                    <button
                      onClick={async () => {
                        const { data: { session } } = await supabase.auth.getSession()
                        if (!session) {
                          router.push(`/login?redirect=/courses/${course.id}`)
                          return
                        }

                        try {
                          const res = await fetch('/api/checkout', {
                            method: 'POST',
                            headers: {
                              'Content-Type': 'application/json',
                              Authorization: `Bearer ${session.access_token}`,
                            },
                            body: JSON.stringify({
                              course: {
                                id: course.id,
                                title: course.title,
                                description: course.description,
                                priceCents: course.priceCents
                              }
                            }),
                          })

                          const data = await res.json()

                          if (!res.ok) {
                            console.error('Checkout failed:', res.status, data)
                            alert(`Betalingsfejl: ${data.error || 'Kunne ikke oprette betaling'}`)
                            return
                          }

                          if (data.url) {
                            window.location.href = data.url
                          } else {
                            console.error('No URL returned from checkout:', data)
                            alert('Der opstod en fejl: Ingen betalingslink modtaget')
                          }
                        } catch (err) {
                          console.error('Checkout error:', err)
                          alert('Der opstod en fejl ved oprettelse af betaling')
                        }
                      }}
                      className="w-full px-6 py-4 bg-primary rounded-xl text-white hover:bg-primary-dark transition-colors font-semibold text-center shadow-lg shadow-primary/20"
                    >
                      Køb nu
                    </button>
                    <p className="text-xs text-text-muted text-center">
                      Sikker betaling via Stripe
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Link
                      href={`/login?redirect=/courses/${course.id}`}
                      className="block w-full px-6 py-4 bg-primary rounded-xl text-white hover:bg-primary-dark transition-colors font-semibold text-center shadow-lg shadow-primary/20"
                    >
                      Log ind for at købe
                    </Link>
                    <p className="text-xs text-text-muted text-center">
                      Har du ikke en konto? Opret en gratis ved login
                    </p>
                  </div>
                )}

                {/* Key Features */}
                <div className="mt-8 pt-8 border-t border-text-muted/20 space-y-3">
                  <p className="text-sm font-semibold text-text-light mb-4">Dette kursus inkluderer:</p>
                  <div className="flex items-start space-x-3">
                    <svg className="w-5 h-5 text-success mt-0.5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm text-text-muted">Livstidsadgang til materialer</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <svg className="w-5 h-5 text-success mt-0.5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm text-text-muted">Certificering ved gennemførelse</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <svg className="w-5 h-5 text-success mt-0.5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm text-text-muted">Support fra udbyder</span>
                  </div>
                  {course.maxParticipants && (
                    <div className="flex items-start space-x-3">
                      <svg className="w-5 h-5 text-success mt-0.5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                        <path d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-sm text-text-muted">Mindre holdstørrelse (maks {course.maxParticipants})</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const id = Number(context.params?.id)

  if (isNaN(id)) {
    return {
      notFound: true,
    }
  }

  // Use hybrid database adapter
  const course = await fetchCourseById(id)

  if (!course) {
    return {
      notFound: true,
    }
  }

  return {
    props: {
      course,
    },
  }
}
