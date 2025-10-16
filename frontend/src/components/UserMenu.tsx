import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'

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

interface UserMenuProps {
  user: UserProfile
  onSignOut: () => void
}

export default function UserMenu({ user, onSignOut }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Get role display name
  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'COMPANY_USER':
        return 'Bruger'
      case 'COMPANY_ADMIN':
        return 'Virksomhedsadmin'
      case 'PROVIDER':
        return 'Kursusudbyder'
      case 'SUPER_ADMIN':
        return 'Administrator'
      default:
        return 'Bruger'
    }
  }

  // Get initials for avatar
  const getInitials = () => {
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
    }
    return user.email[0].toUpperCase()
  }

  return (
    <div className="relative" ref={menuRef}>
      {/* User Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 px-4 py-2 rounded-xl bg-card hover:bg-card/80 border border-text-muted/20 transition-colors"
      >
        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-semibold text-sm">
          {getInitials()}
        </div>

        {/* User Info */}
        <div className="hidden lg:block text-left">
          <p className="text-sm font-medium text-text-light">
            {user.firstName || user.email.split('@')[0]}
          </p>
          <p className="text-xs text-text-muted">
            {getRoleLabel(user.role)}
          </p>
        </div>

        {/* Dropdown Arrow */}
        <svg
          className={`w-4 h-4 text-text-muted transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-card border border-text-muted/20 shadow-xl overflow-hidden">
          {/* User Info Header */}
          <div className="px-4 py-3 border-b border-text-muted/20 bg-background">
            <p className="text-sm font-semibold text-text-light">
              {user.firstName && user.lastName
                ? `${user.firstName} ${user.lastName}`
                : user.email.split('@')[0]}
            </p>
            <p className="text-xs text-text-muted mt-0.5">{user.email}</p>
            <div className="mt-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-secondary/20 text-secondary">
                {getRoleLabel(user.role)}
              </span>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            {/* Role-specific links */}
            {user.role === 'PROVIDER' && (
              <>
                <Link
                  href="/provider/dashboard"
                  className="block px-4 py-2 text-sm text-text-light hover:bg-background transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <div className="flex items-center">
                    <span className="mr-3">📊</span>
                    Dashboard
                  </div>
                </Link>
                <Link
                  href="/provider/courses"
                  className="block px-4 py-2 text-sm text-text-light hover:bg-background transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <div className="flex items-center">
                    <span className="mr-3">📚</span>
                    Mine Kurser
                  </div>
                </Link>
              </>
            )}

            {user.role === 'SUPER_ADMIN' && (
              <>
                <Link
                  href="/admin/providers"
                  className="block px-4 py-2 text-sm text-text-light hover:bg-background transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <div className="flex items-center">
                    <span className="mr-3">⚙️</span>
                    Provider Admin
                  </div>
                </Link>
              </>
            )}

            {/* Common links */}
            <Link
              href="/my-courses"
              className="block px-4 py-2 text-sm text-text-light hover:bg-background transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <div className="flex items-center">
                <span className="mr-3">🎓</span>
                Mine Kurser
              </div>
            </Link>

            <Link
              href="/profile"
              className="block px-4 py-2 text-sm text-text-light hover:bg-background transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <div className="flex items-center">
                <span className="mr-3">👤</span>
                Min Profil
              </div>
            </Link>
          </div>

          {/* Logout */}
          <div className="border-t border-text-muted/20 py-2">
            <button
              onClick={() => {
                onSignOut()
                setIsOpen(false)
              }}
              className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-background transition-colors"
            >
              <div className="flex items-center">
                <span className="mr-3">🚪</span>
                Log ud
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
