import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { supabase } from '@/lib/supabaseClient'
import UserMenu from './UserMenu'

interface UserProfile {
  id: string
  email: string
  firstName?: string
  lastName?: string
  role: 'COMPANY_USER' | 'COMPANY_ADMIN' | 'PROVIDER' | 'SUPER_ADMIN'
  provider?: {
    status: string
  }
}

interface NavigationProps {
  minimal?: boolean // Minimal navigation (only logo + back link)
}

export default function Navigation({ minimal = false }: NavigationProps) {
  const router = useRouter()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()

      if (session) {
        try {
          const response = await fetch('/api/user/profile', {
            headers: {
              Authorization: `Bearer ${session.access_token}`
            }
          })

          if (response.ok) {
            const userData = await response.json()
            setUser(userData)
          }
        } catch (error) {
          console.error('Failed to fetch user profile:', error)
        }
      }

      setLoading(false)
    }

    fetchUser()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      fetchUser()
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    router.push('/')
  }

  if (minimal) {
    return (
      <nav className="bg-card/80 backdrop-blur-sm border-b border-text-muted/20">
        <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-text-light hover:text-primary transition-colors">
            CourseHub
          </Link>
          <Link
            href="/"
            className="text-accent hover:underline transition-all text-sm"
          >
            ← Tilbage til forsiden
          </Link>
        </div>
      </nav>
    )
  }

  return (
    <nav className="bg-card/80 backdrop-blur-sm border-b border-text-muted/20 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold text-text-light hover:text-primary transition-colors">
            CourseHub
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-8 items-center">
            <Link
              href="/"
              className={`text-text-muted hover:text-text-light transition-colors ${
                router.pathname === '/' ? 'text-primary font-semibold' : ''
              }`}
            >
              Kurser
            </Link>

            {user && (
              <>
                <Link
                  href="/chat"
                  className={`text-text-muted hover:text-text-light transition-colors flex items-center gap-2 ${
                    router.pathname === '/chat' ? 'text-primary font-semibold' : ''
                  }`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                  </svg>
                  AI Assistent
                </Link>
                <Link
                  href="/my-courses"
                  className={`text-text-muted hover:text-text-light transition-colors ${
                    router.pathname === '/my-courses' ? 'text-primary font-semibold' : ''
                  }`}
                >
                  Mine Kurser
                </Link>
              </>
            )}

            {user?.role === 'PROVIDER' && (
              <Link
                href="/provider/dashboard"
                className={`text-text-muted hover:text-text-light transition-colors ${
                  router.pathname.startsWith('/provider') ? 'text-primary font-semibold' : ''
                }`}
              >
                Provider Dashboard
              </Link>
            )}

            {user?.role === 'SUPER_ADMIN' && (
              <Link
                href="/admin/providers"
                className={`text-text-muted hover:text-text-light transition-colors ${
                  router.pathname.startsWith('/admin') ? 'text-primary font-semibold' : ''
                }`}
              >
                Admin Panel
              </Link>
            )}

            <Link
              href="/for-virksomheder"
              className="text-text-muted hover:text-text-light transition-colors"
            >
              For Virksomheder
            </Link>
          </div>

          {/* Right Side - Auth Buttons or User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {loading ? (
              <div className="h-10 w-24 bg-card animate-pulse rounded-xl"></div>
            ) : user ? (
              <UserMenu user={user} onSignOut={handleSignOut} />
            ) : (
              <>
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
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl hover:bg-card transition-colors"
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6 text-text-light"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {mobileMenuOpen ? (
                <path d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 space-y-3 border-t border-text-muted/20 pt-4">
            <Link
              href="/"
              className="block py-2 text-text-muted hover:text-text-light transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Kurser
            </Link>

            {user && (
              <>
                <Link
                  href="/chat"
                  className="block py-2 text-text-muted hover:text-text-light transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  🤖 AI Assistent
                </Link>
                <Link
                  href="/my-courses"
                  className="block py-2 text-text-muted hover:text-text-light transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Mine Kurser
                </Link>
              </>
            )}

            {user?.role === 'PROVIDER' && (
              <Link
                href="/provider/dashboard"
                className="block py-2 text-text-muted hover:text-text-light transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Provider Dashboard
              </Link>
            )}

            {user?.role === 'SUPER_ADMIN' && (
              <Link
                href="/admin/providers"
                className="block py-2 text-text-muted hover:text-text-light transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Admin Panel
              </Link>
            )}

            <Link
              href="/for-virksomheder"
              className="block py-2 text-text-muted hover:text-text-light transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              For Virksomheder
            </Link>

            {user ? (
              <>
                <div className="pt-3 border-t border-text-muted/20">
                  <p className="text-sm text-text-muted mb-2">
                    {user.firstName || user.email}
                  </p>
                  <Link
                    href="/profile"
                    className="block py-2 text-text-muted hover:text-text-light transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Min Profil
                  </Link>
                  <button
                    onClick={() => {
                      handleSignOut()
                      setMobileMenuOpen(false)
                    }}
                    className="block w-full text-left py-2 text-text-muted hover:text-text-light transition-colors"
                  >
                    Log ud
                  </button>
                </div>
              </>
            ) : (
              <div className="pt-3 border-t border-text-muted/20 space-y-2">
                <Link
                  href="/register-provider"
                  className="block px-5 py-3 rounded-xl bg-card border border-secondary text-secondary hover:bg-secondary hover:text-white transition-colors font-semibold text-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Bliv Udbyder
                </Link>
                <Link
                  href="/login"
                  className="block px-5 py-3 bg-primary rounded-xl text-white hover:bg-primary-dark transition-colors font-semibold text-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Log ind
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
