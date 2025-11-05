import { ReactNode, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import Navigation from '../Navigation'
import Footer from '../Footer'

interface AdminLayoutProps {
  children: ReactNode
  title: string
}

export default function AdminLayout({ children, title }: AdminLayoutProps) {
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const menuItems = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
    { href: '/admin/proposals', label: 'Trend Forslag', icon: '🔥' },
    { href: '/admin/courses', label: 'Kurser', icon: '📚' },
    { href: '/admin/categories', label: 'Kategorier', icon: '🗂️' },
    { href: '/admin/providers', label: 'Udbydere', icon: '🏢' },
    { href: '/admin/users', label: 'Brugere', icon: '👥' },
    { href: '/admin/companies', label: 'Virksomheder', icon: '🏛️' },
  ]

  const isActive = (href: string) => router.pathname === href

  return (
    <div className="min-h-screen bg-dark-bg flex flex-col">
      <Navigation />

      <div className="flex-1 flex">
        {/* Sidebar */}
        <aside
          className={`${
            sidebarOpen ? 'w-64' : 'w-20'
          } bg-dark-card border-r border-dark-border transition-all duration-300 hidden lg:block`}
        >
          <div className="sticky top-20 p-4">
            {/* Toggle Button */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="w-full mb-4 p-2 bg-dark-bg hover:bg-dark-hover rounded-lg transition-colors text-white"
            >
              {sidebarOpen ? '◀' : '▶'}
            </button>

            {/* Menu Items */}
            <nav className="space-y-2">
              {menuItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                    isActive(item.href)
                      ? 'bg-primary text-white'
                      : 'text-dark-text-secondary hover:bg-dark-hover hover:text-white'
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  {sidebarOpen && <span className="font-medium">{item.label}</span>}
                </Link>
              ))}
            </nav>

            {/* Admin Badge */}
            {sidebarOpen && (
              <div className="mt-8 p-3 bg-gradient-to-r from-primary/20 to-secondary/20 border border-primary/30 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">🔧</span>
                  <span className="text-xs font-semibold text-white">ADMIN MODE</span>
                </div>
                <p className="text-xs text-dark-text-secondary">
                  Du har fuld adgang til alle administrative funktioner
                </p>
              </div>
            )}
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 lg:p-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">{title}</h1>
            <div className="h-1 w-20 bg-gradient-to-r from-primary to-secondary rounded-full"></div>
          </div>

          {/* Page Content */}
          {children}
        </main>
      </div>

      <Footer />
    </div>
  )
}
