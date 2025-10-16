import React from 'react'
import Link from 'next/link'

interface Category {
  id: number
  name: string
  slug: string
  icon: string | null
  color: string | null
  _count?: {
    courses: number
  }
}

interface CategorySidebarProps {
  categories: Category[]
  activeSlug?: string | null
}

export default function CategorySidebar({ categories, activeSlug }: CategorySidebarProps) {
  return (
    <aside className="w-full lg:w-64 flex-shrink-0">
      <div className="bg-dark-card border border-dark-border rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Kategorier</h2>

        <nav className="space-y-1">
          {/* All courses link */}
          <Link
            href="/"
            className={`
              flex items-center justify-between px-3 py-2.5 rounded-lg
              transition-all duration-200
              ${!activeSlug
                ? 'bg-primary text-white shadow-lg shadow-primary/20'
                : 'text-dark-text-secondary hover:bg-dark-hover hover:text-white'
              }
            `}
          >
            <span className="flex items-center gap-2 font-medium">
              <span className="text-xl">📚</span>
              <span>Alle kurser</span>
            </span>
          </Link>

          {/* Category links */}
          {categories.map((category) => {
            const isActive = activeSlug === category.slug
            const courseCount = category._count?.courses || 0

            return (
              <Link
                key={category.id}
                href={`/categories/${category.slug}`}
                className={`
                  flex items-center justify-between px-3 py-2.5 rounded-lg
                  transition-all duration-200 group
                  ${isActive
                    ? 'text-white shadow-lg'
                    : 'text-dark-text-secondary hover:bg-dark-hover hover:text-white'
                  }
                `}
                style={
                  isActive && category.color
                    ? {
                        backgroundColor: category.color,
                        boxShadow: `0 10px 15px -3px ${category.color}20`
                      }
                    : undefined
                }
              >
                <span className="flex items-center gap-2 font-medium">
                  <span className="text-xl">{category.icon || '📁'}</span>
                  <span className="truncate">{category.name}</span>
                </span>

                {courseCount > 0 && (
                  <span
                    className={`
                      text-xs px-2 py-0.5 rounded-full font-medium
                      ${isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-dark-hover text-dark-text-secondary group-hover:bg-white/10 group-hover:text-white'
                      }
                    `}
                  >
                    {courseCount}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>
      </div>
    </aside>
  )
}
