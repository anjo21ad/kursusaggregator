import Link from 'next/link'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import GlassIcons from '@/components/GlassIcons'

export default function ForVirksomhederPage() {
  // B2B Benefits
  const benefits = [
    {
      icon: <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
      color: 'primary',
      label: 'Sikkerhed & Compliance'
    },
    {
      icon: <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
      color: 'success',
      label: 'Kompetence Tracking'
    },
    {
      icon: <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
      color: 'accent',
      label: 'Fleksibel Fakturering'
    },
    {
      icon: <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
      color: 'secondary',
      label: 'Team Administration'
    }
  ]

  // Features
  const features = [
    {
      title: 'Centraliseret Administration',
      description: 'Administrér alle medarbejderes kurser fra ét sted. Se hvem der har taget hvilke kurser, og planlæg fremtidige kompetenceudviklingsinitiativer.',
      icon: '🎯'
    },
    {
      title: 'Fleksibel Fakturering',
      description: 'Vælg mellem forudbetaling, månedlig fakturering eller betaling pr. kursus. Vi tilpasser os jeres behov.',
      icon: '💳'
    },
    {
      title: 'Rapportering & Analyse',
      description: 'Få indsigt i medarbejdernes kompetenceudvikling med detaljerede rapporter og statistikker.',
      icon: '📊'
    },
    {
      title: 'Godkendte Udbydere',
      description: 'Alle kursusudbydere er verificerede og screenet for kvalitet. Kun de bedste kommer med i vores katalog.',
      icon: '✓'
    },
    {
      title: 'HR System Integration',
      description: 'Integration med eksisterende HR-systemer og Single Sign-On (SSO) for nem onboarding.',
      icon: '🔗'
    },
    {
      title: 'Dedikeret Support',
      description: 'Få hjælp fra vores dedikerede B2B support-team, klar til at hjælpe jer med onboarding og drift.',
      icon: '💬'
    }
  ]

  return (
    <div className="min-h-screen bg-dark-bg flex flex-col">
      <Navigation />

      {/* Hero Section */}
      <section className="relative bg-dark-bg py-20 border-b border-dark-border">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl lg:text-6xl font-bold text-white mb-6">
              Kompetenceudvikling for hele dit team
            </h1>
            <p className="text-xl text-dark-text-secondary mb-8">
              CourseHub gør det nemt at administrere, spore og udvikle medarbejdernes kompetencer.
              Få adgang til Danmarks bedste kursusudbydere gennem én platform.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                href="/login"
                className="px-8 py-4 bg-primary rounded-xl text-white hover:bg-primary/90 transition-all font-semibold shadow-lg shadow-primary/30 transform hover:scale-105 duration-200"
              >
                Kom i gang gratis
              </Link>
              <a
                href="mailto:business@coursehub.dk"
                className="px-8 py-4 bg-dark-card border border-dark-border text-white hover:bg-dark-hover transition-colors font-semibold rounded-xl"
              >
                Kontakt salg
              </a>
            </div>
          </div>

          {/* Benefits */}
          <div className="mt-20">
            <GlassIcons items={benefits} className="max-w-5xl" />
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">
            Alt du behøver til B2B kompetenceudvikling
          </h2>
          <p className="text-xl text-dark-text-secondary">
            En komplet platform designet til virksomheder der vil investere i deres medarbejdere
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-dark-card border border-dark-border rounded-xl p-8 hover:border-primary/50 transition-all group"
            >
              <div className="text-5xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-primary transition-colors">
                {feature.title}
              </h3>
              <p className="text-dark-text-secondary">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Tiers */}
      <section className="bg-dark-card border-y border-dark-border py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Priser der passer til din virksomhed
            </h2>
            <p className="text-xl text-dark-text-secondary">
              Vælg den plan der passer bedst til jeres behov
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Starter */}
            <div className="bg-dark-bg border border-dark-border rounded-2xl p-8">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">Starter</h3>
                <p className="text-dark-text-secondary">Perfekt til små teams</p>
              </div>
              <div className="mb-6">
                <div className="text-4xl font-bold text-white mb-2">Gratis</div>
                <p className="text-dark-text-secondary">Op til 5 medarbejdere</p>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-success mr-3 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  <span className="text-dark-text-secondary">Fuld adgang til kurser</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-success mr-3 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  <span className="text-dark-text-secondary">Basis rapportering</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-success mr-3 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  <span className="text-dark-text-secondary">Email support</span>
                </li>
              </ul>
              <Link
                href="/login"
                className="block w-full px-6 py-3 bg-dark-card border border-dark-border text-white hover:bg-dark-hover transition-colors font-semibold rounded-xl text-center"
              >
                Kom i gang
              </Link>
            </div>

            {/* Business - Featured */}
            <div className="bg-primary/10 border-2 border-primary rounded-2xl p-8 relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-primary text-white px-4 py-1 rounded-full text-sm font-semibold">
                  Mest populær
                </span>
              </div>
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">Business</h3>
                <p className="text-dark-text-secondary">For voksende virksomheder</p>
              </div>
              <div className="mb-6">
                <div className="text-4xl font-bold text-white mb-2">
                  Fra 999 kr/md
                </div>
                <p className="text-dark-text-secondary">Op til 50 medarbejdere</p>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-success mr-3 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  <span className="text-dark-text-secondary">Alt fra Starter</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-success mr-3 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  <span className="text-dark-text-secondary">Avanceret rapportering</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-success mr-3 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  <span className="text-dark-text-secondary">Prioriteret support</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-success mr-3 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  <span className="text-dark-text-secondary">Team administration</span>
                </li>
              </ul>
              <Link
                href="/login"
                className="block w-full px-6 py-3 bg-primary text-white hover:bg-primary/90 transition-colors font-semibold rounded-xl text-center shadow-lg shadow-primary/20"
              >
                Start gratis prøveperiode
              </Link>
            </div>

            {/* Enterprise */}
            <div className="bg-dark-bg border border-dark-border rounded-2xl p-8">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">Enterprise</h3>
                <p className="text-dark-text-secondary">For store organisationer</p>
              </div>
              <div className="mb-6">
                <div className="text-4xl font-bold text-white mb-2">Kontakt os</div>
                <p className="text-dark-text-secondary">Ubegrænset medarbejdere</p>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-success mr-3 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  <span className="text-dark-text-secondary">Alt fra Business</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-success mr-3 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  <span className="text-dark-text-secondary">SSO/SAML integration</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-success mr-3 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  <span className="text-dark-text-secondary">HR system integration</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-success mr-3 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  <span className="text-dark-text-secondary">Dedikeret account manager</span>
                </li>
              </ul>
              <a
                href="mailto:enterprise@coursehub.dk"
                className="block w-full px-6 py-3 bg-dark-card border border-dark-border text-white hover:bg-dark-hover transition-colors font-semibold rounded-xl text-center"
              >
                Kontakt salg
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="bg-gradient-to-r from-primary/20 to-secondary/20 border border-primary/30 rounded-2xl p-12 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Klar til at komme i gang?
          </h2>
          <p className="text-xl text-dark-text-secondary mb-8 max-w-2xl mx-auto">
            Opret en gratis konto i dag og giv dit team adgang til Danmarks bedste kurser
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/login"
              className="px-8 py-4 bg-primary rounded-xl text-white hover:bg-primary/90 transition-all font-semibold shadow-lg shadow-primary/30 transform hover:scale-105 duration-200"
            >
              Start gratis prøveperiode
            </Link>
            <a
              href="mailto:business@coursehub.dk"
              className="px-8 py-4 bg-white text-dark-bg hover:bg-white/90 transition-colors font-semibold rounded-xl"
            >
              Book en demo
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
