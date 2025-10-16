import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-card border-t border-text-muted/20 mt-auto">
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1">
            <h3 className="text-xl font-bold text-text-light mb-4">CourseHub</h3>
            <p className="text-sm text-text-muted">
              Din B2B Kursusplatform for kompetenceudvikling
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-text-light mb-4">Kurser</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-sm text-text-muted hover:text-text-light transition-colors">
                  Alle Kurser
                </Link>
              </li>
              <li>
                <Link href="/#categories" className="text-sm text-text-muted hover:text-text-light transition-colors">
                  Kategorier
                </Link>
              </li>
              <li>
                <Link href="/my-courses" className="text-sm text-text-muted hover:text-text-light transition-colors">
                  Mine Kurser
                </Link>
              </li>
            </ul>
          </div>

          {/* For Businesses */}
          <div>
            <h4 className="text-sm font-semibold text-text-light mb-4">For Virksomheder</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/register-provider" className="text-sm text-text-muted hover:text-text-light transition-colors">
                  Bliv Kursusudbyder
                </Link>
              </li>
              <li>
                <Link href="/#benefits" className="text-sm text-text-muted hover:text-text-light transition-colors">
                  Fordele
                </Link>
              </li>
              <li>
                <Link href="/#pricing" className="text-sm text-text-muted hover:text-text-light transition-colors">
                  Priser
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-sm font-semibold text-text-light mb-4">Support</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/help" className="text-sm text-text-muted hover:text-text-light transition-colors">
                  Hjælp & FAQ
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm text-text-muted hover:text-text-light transition-colors">
                  Kontakt Os
                </Link>
              </li>
              <li>
                <a
                  href="mailto:support@coursehub.dk"
                  className="text-sm text-text-muted hover:text-text-light transition-colors"
                >
                  support@coursehub.dk
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-text-muted/20">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm text-text-muted">
              © {new Date().getFullYear()} CourseHub. Alle rettigheder forbeholdes.
            </p>
            <div className="flex space-x-6">
              <Link href="/privacy" className="text-sm text-text-muted hover:text-text-light transition-colors">
                Privatlivspolitik
              </Link>
              <Link href="/terms" className="text-sm text-text-muted hover:text-text-light transition-colors">
                Vilkår & Betingelser
              </Link>
              <Link href="/cookies" className="text-sm text-text-muted hover:text-text-light transition-colors">
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
