import { GetServerSideProps } from 'next'
import { prisma } from '@/lib/prisma'
import { useState } from 'react'
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
  currentCategory: Category
}

export default function CategoryPage({ courses, categories, currentCategory }: Props) {
  const [searchQuery, setSearchQuery] = useState('')

  // Filter courses based on search
  const filteredCourses = courses.filter(course =>
    searchQuery === '' ||
    course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-dark-bg flex flex-col">
      <Navigation />

      {/* Category Header */}
      <section className="bg-dark-card border-b border-dark-border py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="text-5xl">
              {currentCategory.icon || '📁'}
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">
                {currentCategory.name}
              </h1>
              <p className="text-dark-text-secondary mt-2">
                {currentCategory._count.courses} {currentCategory._count.courses === 1 ? 'kursus' : 'kurser'} tilgængelig{currentCategory._count.courses === 1 ? 't' : 'e'}
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mt-8">
            <div className="relative">
              <input
                type="text"
                placeholder={`Søg i ${currentCategory.name.toLowerCase()} kurser...`}
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
              <p className="mt-3 text-sm text-dark-text-secondary">
                Viser {filteredCourses.length} af {courses.length} kurser
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Main Content with Sidebar */}
      <section className="max-w-7xl mx-auto px-6 py-12 flex-1">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Category Sidebar */}
          <CategorySidebar categories={categories} activeSlug={currentCategory.slug} />

          {/* Course Grid */}
          <div className="flex-1">
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
                          {(course.priceCents / 100).toFixed(0)} kr
                        </div>
                        <div className="text-xs text-dark-text-secondary mt-1">
                          {course.provider.companyName}
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
                    ? `Vi kunne ikke finde nogen kurser der matcher "${searchQuery}" i ${currentCategory.name}`
                    : `Der er ingen tilgængelige kurser i ${currentCategory.name} i øjeblikket`
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

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { slug } = context.params as { slug: string }

  try {
    // Find the category by slug
    const currentCategory = await prisma.category.findUnique({
      where: {
        slug: slug,
        isActive: true
      },
      select: {
        id: true,
        name: true,
        slug: true,
        icon: true,
        color: true,
        _count: {
          select: {
            courses: {
              where: {
                status: 'PUBLISHED',
                isActive: true
              }
            }
          }
        }
      }
    })

    // If category not found, return 404
    if (!currentCategory) {
      return {
        notFound: true
      }
    }

    // Fetch courses and all categories in parallel
    const [courses, categories] = await Promise.all([
      prisma.course.findMany({
        where: {
          categoryId: currentCategory.id,
          status: 'PUBLISHED',
          isActive: true
        },
        select: {
          id: true,
          title: true,
          description: true,
          shortDesc: true,
          priceCents: true,
          duration: true,
          location: true,
          level: true,
          category: {
            select: {
              name: true,
              icon: true,
              color: true
            }
          },
          provider: {
            select: {
              companyName: true
            }
          }
        },
        orderBy: {
          id: 'desc'
        }
      }),
      prisma.category.findMany({
        where: {
          isActive: true
        },
        select: {
          id: true,
          name: true,
          slug: true,
          icon: true,
          color: true,
          _count: {
            select: {
              courses: {
                where: {
                  status: 'PUBLISHED',
                  isActive: true
                }
              }
            }
          }
        },
        orderBy: {
          sortOrder: 'asc'
        }
      })
    ])

    return {
      props: {
        courses,
        categories,
        currentCategory,
      },
    }
  } catch (error) {
    console.error('Error fetching category data:', error)
    return {
      notFound: true
    }
  }
}
