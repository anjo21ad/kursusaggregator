import Link from 'next/link'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'

export default function Custom404() {
  return (
    <div className="min-h-screen bg-dark-bg flex flex-col">
      <Navigation />

      <main className="flex-1 flex items-center justify-center px-6">
        <div className="text-center max-w-2xl">
          {/* Error Code */}
          <div className="mb-8">
            <h1 className="text-8xl font-bold text-white mb-2">404</h1>
            <div className="h-1 w-32 bg-gradient-to-r from-primary to-secondary mx-auto rounded-full"></div>
          </div>

          {/* Error Message */}
          <h2 className="text-3xl font-bold text-white mb-4">
            Siden blev ikke fundet
          </h2>
          <p className="text-lg text-dark-text-secondary mb-8">
            Beklager, men den side du leder efter eksisterer ikke.
            Den kan være flyttet eller slettet.
          </p>

          {/* CTA Buttons */}
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              href="/"
              className="px-8 py-4 bg-primary hover:bg-primary/90 text-white rounded-xl font-semibold transition-colors shadow-lg shadow-primary/20"
            >
              Gå til forsiden
            </Link>
            <Link
              href="/help"
              className="px-8 py-4 bg-dark-card border border-dark-border hover:bg-dark-hover text-white rounded-xl font-semibold transition-colors"
            >
              Få hjælp
            </Link>
          </div>

          {/* Helpful Links */}
          <div className="mt-12 pt-8 border-t border-dark-border">
            <p className="text-sm text-dark-text-secondary mb-4">Populære sider:</p>
            <div className="flex gap-6 justify-center flex-wrap text-sm">
              <Link href="/for-virksomheder" className="text-primary hover:text-primary/80 transition-colors">
                For Virksomheder
              </Link>
              <Link href="/contact" className="text-primary hover:text-primary/80 transition-colors">
                Kontakt
              </Link>
              <Link href="/help" className="text-primary hover:text-primary/80 transition-colors">
                Hjælp
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
