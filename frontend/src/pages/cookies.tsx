import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import Link from 'next/link'

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-dark-bg flex flex-col">
      <Navigation />

      <section className="max-w-4xl mx-auto px-6 py-16 flex-1">
        <h1 className="text-5xl font-bold text-white mb-4">Cookie-politik</h1>
        <p className="text-dark-text-secondary mb-8">
          Sidst opdateret: {new Date().toLocaleDateString('da-DK', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>

        <div className="prose prose-invert max-w-none space-y-8">
          {/* Introduktion */}
          <section className="bg-dark-card border border-dark-border rounded-xl p-8">
            <h2 className="text-3xl font-bold text-white mb-4">1. Hvad er cookies?</h2>
            <p className="text-dark-text-secondary leading-relaxed">
              Cookies er små tekstfiler, der gemmes på din computer, tablet eller smartphone, når du besøger en hjemmeside.
              De bruges til at genkende din enhed, gemme dine præferencer og forbedre din brugeroplevelse.
            </p>
            <p className="text-dark-text-secondary leading-relaxed mt-4">
              CourseHub bruger cookies og lignende teknologier (såsom localStorage og sessionStorage) for at levere,
              forbedre og beskytte vores tjenester. Denne politik forklarer, hvilke cookies vi bruger, hvorfor vi bruger
              dem, og hvordan du kan administrere dem.
            </p>
          </section>

          {/* Typer af cookies */}
          <section className="bg-dark-card border border-dark-border rounded-xl p-8">
            <h2 className="text-3xl font-bold text-white mb-4">2. Typer af cookies vi bruger</h2>
            <div className="space-y-6">
              {/* Nødvendige */}
              <div className="bg-dark-bg border-l-4 border-primary rounded-lg p-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center mr-4">
                    <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-white mb-2">Nødvendige Cookies (Altid aktive)</h3>
                    <p className="text-dark-text-secondary mb-3">
                      Disse cookies er nødvendige for at hjemmesiden kan fungere korrekt. De kan ikke slås fra i vores systemer.
                    </p>
                    <p className="text-dark-text-secondary text-sm">
                      <strong className="text-white">Formål:</strong> Autentifikation, session-håndtering, sikkerhed, load balancing
                    </p>
                  </div>
                </div>
              </div>

              {/* Funktionelle */}
              <div className="bg-dark-bg border-l-4 border-secondary rounded-lg p-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-12 h-12 bg-secondary/20 rounded-xl flex items-center justify-center mr-4">
                    <svg className="w-6 h-6 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-white mb-2">Funktionelle Cookies</h3>
                    <p className="text-dark-text-secondary mb-3">
                      Disse cookies gør det muligt for hjemmesiden at huske valg du har truffet og tilbyde forbedrede funktioner.
                    </p>
                    <p className="text-dark-text-secondary text-sm">
                      <strong className="text-white">Formål:</strong> Sprogpræferencer, tema-indstillinger, cookie-samtykke, gemte søgninger
                    </p>
                  </div>
                </div>
              </div>

              {/* Analytiske */}
              <div className="bg-dark-bg border-l-4 border-accent rounded-lg p-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-12 h-12 bg-accent/20 rounded-xl flex items-center justify-center mr-4">
                    <svg className="w-6 h-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-white mb-2">Analytiske/Performance Cookies</h3>
                    <p className="text-dark-text-secondary mb-3">
                      Disse cookies hjælper os med at forstå, hvordan besøgende interagerer med hjemmesiden ved at indsamle
                      og rapportere information anonymt.
                    </p>
                    <p className="text-dark-text-secondary text-sm">
                      <strong className="text-white">Formål:</strong> Besøgsstatistik, populære sider, brugeradfærd, fejlrapportering
                    </p>
                  </div>
                </div>
              </div>

              {/* Marketing */}
              <div className="bg-dark-bg border-l-4 border-success rounded-lg p-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-12 h-12 bg-success/20 rounded-xl flex items-center justify-center mr-4">
                    <svg className="w-6 h-6 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-white mb-2">Marketing Cookies</h3>
                    <p className="text-dark-text-secondary mb-3">
                      Disse cookies bruges til at vise relevante annoncer og måle effektiviteten af vores marketingkampagner.
                    </p>
                    <p className="text-dark-text-secondary text-sm">
                      <strong className="text-white">Formål:</strong> Målrettet annoncering, remarketing, kampagnemåling, konvertering
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Cookie tabel */}
          <section className="bg-dark-card border border-dark-border rounded-xl p-8">
            <h2 className="text-3xl font-bold text-white mb-4">3. Oversigt over cookies</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-dark-border">
                    <th className="py-3 px-4 text-white font-semibold">Cookie navn</th>
                    <th className="py-3 px-4 text-white font-semibold">Type</th>
                    <th className="py-3 px-4 text-white font-semibold">Formål</th>
                    <th className="py-3 px-4 text-white font-semibold">Varighed</th>
                  </tr>
                </thead>
                <tbody className="text-dark-text-secondary">
                  <tr className="border-b border-dark-border/50">
                    <td className="py-3 px-4 font-mono text-sm">sb-access-token</td>
                    <td className="py-3 px-4">Nødvendig</td>
                    <td className="py-3 px-4">Autentifikation (Supabase)</td>
                    <td className="py-3 px-4">Session</td>
                  </tr>
                  <tr className="border-b border-dark-border/50">
                    <td className="py-3 px-4 font-mono text-sm">sb-refresh-token</td>
                    <td className="py-3 px-4">Nødvendig</td>
                    <td className="py-3 px-4">Session fornyelse</td>
                    <td className="py-3 px-4">7 dage</td>
                  </tr>
                  <tr className="border-b border-dark-border/50">
                    <td className="py-3 px-4 font-mono text-sm">next-auth.session-token</td>
                    <td className="py-3 px-4">Nødvendig</td>
                    <td className="py-3 px-4">Next.js session</td>
                    <td className="py-3 px-4">Session</td>
                  </tr>
                  <tr className="border-b border-dark-border/50">
                    <td className="py-3 px-4 font-mono text-sm">cookie-consent</td>
                    <td className="py-3 px-4">Funktionel</td>
                    <td className="py-3 px-4">Husker cookie-præferencer</td>
                    <td className="py-3 px-4">1 år</td>
                  </tr>
                  <tr className="border-b border-dark-border/50">
                    <td className="py-3 px-4 font-mono text-sm">theme-preference</td>
                    <td className="py-3 px-4">Funktionel</td>
                    <td className="py-3 px-4">Gemmer dark/light mode</td>
                    <td className="py-3 px-4">1 år</td>
                  </tr>
                  <tr className="border-b border-dark-border/50">
                    <td className="py-3 px-4 font-mono text-sm">_ga</td>
                    <td className="py-3 px-4">Analytisk</td>
                    <td className="py-3 px-4">Google Analytics bruger-ID</td>
                    <td className="py-3 px-4">2 år</td>
                  </tr>
                  <tr className="border-b border-dark-border/50">
                    <td className="py-3 px-4 font-mono text-sm">_gid</td>
                    <td className="py-3 px-4">Analytisk</td>
                    <td className="py-3 px-4">Google Analytics session-ID</td>
                    <td className="py-3 px-4">24 timer</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-mono text-sm">_fbp</td>
                    <td className="py-3 px-4">Marketing</td>
                    <td className="py-3 px-4">Facebook Pixel tracking</td>
                    <td className="py-3 px-4">3 måneder</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Tredjeparter */}
          <section className="bg-dark-card border border-dark-border rounded-xl p-8">
            <h2 className="text-3xl font-bold text-white mb-4">4. Tredjepartscookies</h2>
            <p className="text-dark-text-secondary mb-4">
              Vi bruger følgende tredjepartstjenester, der kan sætte cookies på din enhed:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-dark-bg border border-dark-border rounded-lg p-4">
                <h4 className="text-white font-semibold mb-2">📊 Google Analytics</h4>
                <p className="text-dark-text-secondary text-sm mb-2">
                  Anonymiseret analyse af besøgsstatistik
                </p>
                <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-sm">
                  Googles privatlivspolitik →
                </a>
              </div>

              <div className="bg-dark-bg border border-dark-border rounded-lg p-4">
                <h4 className="text-white font-semibold mb-2">💳 Stripe</h4>
                <p className="text-dark-text-secondary text-sm mb-2">
                  Sikker betalingsprocessering
                </p>
                <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-sm">
                  Stripes privatlivspolitik →
                </a>
              </div>

              <div className="bg-dark-bg border border-dark-border rounded-lg p-4">
                <h4 className="text-white font-semibold mb-2">🔐 Supabase</h4>
                <p className="text-dark-text-secondary text-sm mb-2">
                  Autentifikation og database hosting
                </p>
                <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-sm">
                  Supabases privatlivspolitik →
                </a>
              </div>

              <div className="bg-dark-bg border border-dark-border rounded-lg p-4">
                <h4 className="text-white font-semibold mb-2">▲ Vercel</h4>
                <p className="text-dark-text-secondary text-sm mb-2">
                  Hosting og performance
                </p>
                <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-sm">
                  Vercels privatlivspolitik →
                </a>
              </div>
            </div>
          </section>

          {/* Administrer cookies */}
          <section className="bg-dark-card border border-dark-border rounded-xl p-8">
            <h2 className="text-3xl font-bold text-white mb-4">5. Sådan administrerer du cookies</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">5.1 Via vores hjemmeside</h3>
                <p className="text-dark-text-secondary mb-4">
                  Du kan til enhver tid ændre dine cookie-præferencer ved at klikke på cookie-ikonet nederst på siden.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-2">5.2 Via din browser</h3>
                <p className="text-dark-text-secondary mb-3">
                  De fleste browsere accepterer automatisk cookies, men du kan ændre dine browserindstillinger til at afvise
                  cookies eller give dig besked, når en cookie sendes. Vejledninger til de mest populære browsere:
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-dark-bg border border-dark-border text-white hover:border-primary transition-colors rounded-lg text-sm text-center">
                    Chrome
                  </a>
                  <a href="https://support.mozilla.org/da/kb/forbedret-beskyttelse-mod-sporing-firefox-desktop" target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-dark-bg border border-dark-border text-white hover:border-primary transition-colors rounded-lg text-sm text-center">
                    Firefox
                  </a>
                  <a href="https://support.apple.com/da-dk/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-dark-bg border border-dark-border text-white hover:border-primary transition-colors rounded-lg text-sm text-center">
                    Safari
                  </a>
                  <a href="https://support.microsoft.com/da-dk/microsoft-edge/slet-cookies-i-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-dark-bg border border-dark-border text-white hover:border-primary transition-colors rounded-lg text-sm text-center">
                    Edge
                  </a>
                </div>
                <p className="text-dark-text-secondary mt-4 text-sm">
                  <strong className="text-white">Bemærk:</strong> Hvis du blokerer eller sletter nødvendige cookies, kan nogle
                  dele af hjemmesiden ikke fungere korrekt.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-2">5.3 Opt-out fra tredjeparter</h3>
                <p className="text-dark-text-secondary mb-3">
                  Du kan fravælge tracking fra specifikke tredjeparter:
                </p>
                <ul className="list-disc pl-6 text-dark-text-secondary space-y-2">
                  <li>
                    <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      Google Analytics opt-out browser add-on
                    </a>
                  </li>
                  <li>
                    <a href="https://www.youronlinechoices.com/dk/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      YourOnlineChoices.com (EU-baseret opt-out)
                    </a>
                  </li>
                  <li>
                    <a href="http://optout.networkadvertising.org/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      Network Advertising Initiative opt-out
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Do Not Track */}
          <section className="bg-dark-card border border-dark-border rounded-xl p-8">
            <h2 className="text-3xl font-bold text-white mb-4">6. Do Not Track (DNT)</h2>
            <p className="text-dark-text-secondary">
              Nogle browsere inkluderer en "Do Not Track" (DNT) funktion, der signalerer til hjemmesider, at du ikke ønsker
              at blive sporet. Da der ikke er nogen standardfortolkning af DNT-signalet, respekterer vores hjemmeside i øjeblikket
              ikke DNT-anmodninger. Vi følger dog EU's GDPR-lovgivning og respekterer dine cookie-præferencer sat via vores
              cookie-banner.
            </p>
          </section>

          {/* Ændringer */}
          <section className="bg-dark-card border border-dark-border rounded-xl p-8">
            <h2 className="text-3xl font-bold text-white mb-4">7. Ændringer til denne cookie-politik</h2>
            <p className="text-dark-text-secondary">
              Vi kan opdatere denne cookie-politik fra tid til anden for at afspejle ændringer i de cookies vi bruger eller
              af andre operationelle, juridiske eller regulatoriske årsager. Gennemgå venligst denne side regelmæssigt for
              at holde dig opdateret om vores brug af cookies.
            </p>
          </section>

          {/* Kontakt og links */}
          <section className="bg-gradient-to-r from-primary/20 to-secondary/20 border border-primary/30 rounded-xl p-8">
            <h2 className="text-2xl font-bold text-white mb-4 text-center">Mere information</h2>
            <p className="text-dark-text-secondary mb-6 text-center">
              Læs mere om hvordan vi behandler dine personoplysninger
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                href="/privacy"
                className="px-8 py-3 bg-primary rounded-xl text-white hover:bg-primary/90 transition-colors font-semibold text-center"
              >
                Privatlivspolitik
              </Link>
              <Link
                href="/contact"
                className="px-8 py-3 bg-white text-dark-bg hover:bg-white/90 transition-colors font-semibold rounded-xl text-center"
              >
                Kontakt os
              </Link>
            </div>
          </section>
        </div>
      </section>

      <Footer />
    </div>
  )
}
