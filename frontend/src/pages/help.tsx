import { useState } from 'react'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import Link from 'next/link'

type FAQItem = {
  question: string
  answer: string
  category: string
}

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const faqs: FAQItem[] = [
    {
      category: 'Kurser',
      question: 'Hvordan finder jeg det rette kursus?',
      answer: 'Du kan søge efter kurser via søgefeltet på forsiden, eller browse gennem vores kategorier i sidebaren. Alle kurser har detaljerede beskrivelser, så du kan se præcis hvad du lærer.'
    },
    {
      category: 'Kurser',
      question: 'Kan jeg få en prøveperiode før jeg køber?',
      answer: 'Mange af vores kursusudbydere tilbyder gratis demo-sessioner eller prøveperioder. Kontakt udbyderen direkte via kursusdetaljeside for at høre om muligheder.'
    },
    {
      category: 'Kurser',
      question: 'Hvor lang tid har jeg adgang til et kursus?',
      answer: 'Adgangen til kurser varierer afhængigt af udbyder og kursustype. De fleste online kurser giver livstidsadgang, mens fysiske kurser er bundet til specifikke datoer. Se kursusdetaljerne for præcis information.'
    },
    {
      category: 'Betaling',
      question: 'Hvilke betalingsmetoder accepterer I?',
      answer: 'Vi accepterer alle større kreditkort (Visa, Mastercard, American Express) samt Dankort. Betalinger håndteres sikkert via Stripe.'
    },
    {
      category: 'Betaling',
      question: 'Kan jeg få refusion hvis jeg fortryder?',
      answer: 'Ja, vi tilbyder 14 dages fuld returret på alle kurser i henhold til dansk forbrugerlovgivning. Kontakt os på support@coursehub.dk for at anmode om refusion.'
    },
    {
      category: 'Betaling',
      question: 'Tilbyder I virksomhedsfakturering?',
      answer: 'Ja, virksomheder kan oprette en erhvervskonto og vælge fakturering. Læs mere på vores virksomhedsside eller kontakt business@coursehub.dk.'
    },
    {
      category: 'Konto',
      question: 'Hvordan opretter jeg en konto?',
      answer: 'Klik på "Log ind" i toppen af siden og vælg "Opret konto". Du kan oprette en konto med din email eller bruge Google/Microsoft single sign-on.'
    },
    {
      category: 'Konto',
      question: 'Hvordan nulstiller jeg min adgangskode?',
      answer: 'Klik på "Glemt adgangskode?" på login-siden. Du vil modtage en email med et link til at nulstille din adgangskode.'
    },
    {
      category: 'Konto',
      question: 'Kan jeg ændre min email-adresse?',
      answer: 'Ja, gå til din profilside og opdater din email under kontoindstillinger. Du skal bekræfte den nye email-adresse for at ændringen træder i kraft.'
    },
    {
      category: 'Teknisk Support',
      question: 'Jeg kan ikke se mit kursus efter køb',
      answer: 'Gå til "Mine Kurser" i hovedmenuen. Hvis kurset ikke vises der, prøv at logge ud og ind igen. Kontakt os hvis problemet fortsætter.'
    },
    {
      category: 'Teknisk Support',
      question: 'Videoen afspilles ikke korrekt',
      answer: 'Prøv at opdatere din browser til den nyeste version, ryd browser-cache, eller prøv en anden browser. Kontakt support@coursehub.dk hvis problemet fortsætter.'
    },
    {
      category: 'Teknisk Support',
      question: 'Hvordan downloader jeg kursusmaterialer?',
      answer: 'Download-links til kursusmaterialer findes på kursusdetaljeside under "Materialer" sektionen. Du skal være logget ind og have købt kurset for at se downloads.'
    }
  ]

  // Filter FAQs based on search
  const filteredFAQs = faqs.filter(faq =>
    searchQuery === '' ||
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Group by category
  const categories = Array.from(new Set(filteredFAQs.map(faq => faq.category)))

  return (
    <div className="min-h-screen bg-dark-bg flex flex-col">
      <Navigation />

      {/* Hero Section */}
      <section className="bg-dark-bg border-b border-dark-border py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1 className="text-5xl font-bold text-white mb-4">
            Hvordan kan vi hjælpe dig?
          </h1>
          <p className="text-xl text-dark-text-secondary mb-8">
            Søg i vores FAQ eller kontakt vores supportteam
          </p>

          {/* Search Bar */}
          <div className="relative max-w-2xl mx-auto">
            <input
              type="text"
              placeholder="Søg efter svar..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-6 py-4 pl-14 bg-dark-card border border-dark-border rounded-xl text-white placeholder-dark-text-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
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
        </div>
      </section>

      {/* FAQ Content */}
      <section className="max-w-4xl mx-auto px-6 py-16 flex-1">
        {categories.length > 0 ? (
          categories.map(category => (
            <div key={category} className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                {category === 'Kurser' && '📚'}
                {category === 'Betaling' && '💳'}
                {category === 'Konto' && '👤'}
                {category === 'Teknisk Support' && '🔧'}
                <span className="ml-3">{category}</span>
              </h2>

              <div className="space-y-4">
                {filteredFAQs
                  .filter(faq => faq.category === category)
                  .map((faq, index) => {
                    const globalIndex = faqs.indexOf(faq)
                    const isOpen = openIndex === globalIndex

                    return (
                      <div
                        key={globalIndex}
                        className="bg-dark-card border border-dark-border rounded-xl overflow-hidden transition-all hover:border-primary/50"
                      >
                        <button
                          onClick={() => setOpenIndex(isOpen ? null : globalIndex)}
                          className="w-full px-6 py-4 flex justify-between items-center text-left"
                        >
                          <span className="text-white font-semibold pr-4">
                            {faq.question}
                          </span>
                          <svg
                            className={`w-5 h-5 text-primary flex-shrink-0 transition-transform ${
                              isOpen ? 'transform rotate-180' : ''
                            }`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>

                        {isOpen && (
                          <div className="px-6 pb-4 pt-2 border-t border-dark-border">
                            <p className="text-dark-text-secondary">
                              {faq.answer}
                            </p>
                          </div>
                        )}
                      </div>
                    )
                  })}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-semibold text-white mb-4">Ingen resultater fundet</h3>
            <p className="text-dark-text-secondary mb-8">
              Vi kunne ikke finde nogen svar der matcher "{searchQuery}"
            </p>
            <button
              onClick={() => setSearchQuery('')}
              className="px-6 py-3 bg-primary rounded-xl text-white hover:bg-primary/90 transition-colors font-semibold"
            >
              Ryd søgning
            </button>
          </div>
        )}
      </section>

      {/* Contact Support CTA */}
      <section className="bg-dark-card border-t border-dark-border py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Fik du ikke svar på dit spørgsmål?
          </h2>
          <p className="text-dark-text-secondary mb-8">
            Vores supportteam er klar til at hjælpe dig
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/contact"
              className="px-8 py-4 bg-primary rounded-xl text-white hover:bg-primary/90 transition-all font-semibold shadow-lg shadow-primary/30"
            >
              Kontakt Support
            </Link>
            <a
              href="mailto:support@coursehub.dk"
              className="px-8 py-4 bg-dark-bg border border-dark-border text-white hover:bg-dark-hover transition-colors font-semibold rounded-xl"
            >
              Send Email
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
