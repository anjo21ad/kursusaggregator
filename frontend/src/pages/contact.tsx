import { useState } from 'react'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // TODO: Implement actual form submission to backend
    console.log('Form submitted:', formData)

    setSubmitted(true)
    setTimeout(() => {
      setSubmitted(false)
      setFormData({ name: '', email: '', subject: '', message: '' })
    }, 3000)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="min-h-screen bg-dark-bg flex flex-col">
      <Navigation />

      {/* Hero Section */}
      <section className="bg-dark-bg border-b border-dark-border py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1 className="text-5xl font-bold text-white mb-4">
            Kontakt os
          </h1>
          <p className="text-xl text-dark-text-secondary">
            Vi er her for at hjælpe dig. Send os en besked, så vender vi tilbage hurtigst muligt.
          </p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-16 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Contact Information */}
          <div className="lg:col-span-1">
            <h2 className="text-2xl font-bold text-white mb-6">Kontaktoplysninger</h2>

            <div className="space-y-6">
              {/* Email */}
              <div className="flex items-start">
                <div className="flex-shrink-0 w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-white font-semibold mb-1">Email</h3>
                  <a href="mailto:support@coursehub.dk" className="text-primary hover:underline">
                    support@coursehub.dk
                  </a>
                  <p className="text-dark-text-secondary text-sm mt-1">Generel support</p>
                </div>
              </div>

              {/* Business Email */}
              <div className="flex items-start">
                <div className="flex-shrink-0 w-12 h-12 bg-secondary/20 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-white font-semibold mb-1">Erhverv</h3>
                  <a href="mailto:business@coursehub.dk" className="text-secondary hover:underline">
                    business@coursehub.dk
                  </a>
                  <p className="text-dark-text-secondary text-sm mt-1">Virksomhedsløsninger</p>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-start">
                <div className="flex-shrink-0 w-12 h-12 bg-accent/20 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-white font-semibold mb-1">Telefon</h3>
                  <a href="tel:+4570123456" className="text-accent hover:underline">
                    +45 70 12 34 56
                  </a>
                  <p className="text-dark-text-secondary text-sm mt-1">Man-Fre 9:00-17:00</p>
                </div>
              </div>

              {/* Address */}
              <div className="flex items-start">
                <div className="flex-shrink-0 w-12 h-12 bg-success/20 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-white font-semibold mb-1">Adresse</h3>
                  <p className="text-dark-text-secondary">
                    CourseHub ApS<br />
                    Vestergade 1, 2. sal<br />
                    1456 København K
                  </p>
                </div>
              </div>
            </div>

            {/* Opening Hours */}
            <div className="mt-8 p-6 bg-dark-card border border-dark-border rounded-xl">
              <h3 className="text-white font-semibold mb-4">Support Åbningstider</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-dark-text-secondary">Mandag - Fredag</span>
                  <span className="text-white">09:00 - 17:00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dark-text-secondary">Weekend</span>
                  <span className="text-white">Lukket</span>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-dark-card border border-dark-border rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-white mb-6">Send os en besked</h2>

              {submitted ? (
                <div className="p-6 bg-success/20 border border-success rounded-xl">
                  <div className="flex items-center">
                    <svg className="w-6 h-6 text-success mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <h3 className="text-white font-semibold">Besked sendt!</h3>
                      <p className="text-dark-text-secondary text-sm">Vi vender tilbage hurtigst muligt.</p>
                    </div>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-white font-semibold mb-2">
                        Navn *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-xl text-white placeholder-dark-text-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="Dit fulde navn"
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-white font-semibold mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-xl text-white placeholder-dark-text-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="din@email.dk"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-white font-semibold mb-2">
                      Emne *
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      required
                      value={formData.subject}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="">Vælg et emne</option>
                      <option value="support">Teknisk Support</option>
                      <option value="billing">Fakturering & Betaling</option>
                      <option value="course">Spørgsmål om kurser</option>
                      <option value="business">Virksomhedssamarbejde</option>
                      <option value="provider">Bliv kursusudbyder</option>
                      <option value="other">Andet</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-white font-semibold mb-2">
                      Besked *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      required
                      value={formData.message}
                      onChange={handleChange}
                      rows={6}
                      className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-xl text-white placeholder-dark-text-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                      placeholder="Beskriv dit spørgsmål eller problem..."
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full px-8 py-4 bg-primary rounded-xl text-white hover:bg-primary/90 transition-all font-semibold shadow-lg shadow-primary/30 transform hover:scale-[1.02] duration-200"
                  >
                    Send besked
                  </button>

                  <p className="text-sm text-dark-text-secondary text-center">
                    Vi svarer typisk inden for 24 timer på hverdage
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
