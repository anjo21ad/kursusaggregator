import { useState, FormEvent } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'

interface ProviderFormData {
  companyName: string
  contactEmail: string
  phone: string
  website: string
  description: string
  address: string
  city: string
  postalCode: string
  cvr: string
  userFirstName: string
  userLastName: string
  userEmail: string
  userPassword: string
}

export default function RegisterProviderPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  
  const [formData, setFormData] = useState<ProviderFormData>({
    companyName: '',
    contactEmail: '',
    phone: '',
    website: '',
    description: '',
    address: '',
    city: '',
    postalCode: '',
    cvr: '',
    userFirstName: '',
    userLastName: '',
    userEmail: '',
    userPassword: ''
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Validering
      if (!formData.companyName || !formData.contactEmail || !formData.userEmail || !formData.userPassword) {
        throw new Error('Udfyld venligst alle påkrævede felter')
      }

      if (formData.userPassword.length < 6) {
        throw new Error('Adgangskode skal være mindst 6 tegn')
      }

      // Send registrering til API
      const response = await fetch('/api/provider/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Der opstod en fejl under registreringen')
      }

      setSuccess(true)
      
      // Redirect til login side efter 3 sekunder
      setTimeout(() => {
        router.push('/login?message=provider-registered')
      }, 3000)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Der opstod en uventet fejl')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-card py-8 px-4 shadow-lg rounded-2xl sm:px-10">
            <div className="text-center">
              <div className="text-success text-6xl mb-4">✅</div>
              <h2 className="text-2xl font-bold text-text-light mb-4">
                Registrering Modtaget!
              </h2>
              <p className="text-text-muted mb-4">
                Tak for din ansøgning som kursusudbyder. Vi gennemgår din ansøgning og kontakter dig inden for 1-2 arbejdsdage.
              </p>
              <p className="text-sm text-text-muted">
                Du omdirigeres til login-siden om få sekunder...
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-text-light">
          Bliv Kursusudbyder
        </h2>
        <p className="mt-2 text-center text-sm text-text-muted">
          Få adgang til Danmarks bedste B2B kursusmarkedsplads
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-2xl">
        <div className="bg-card py-8 px-4 shadow-lg rounded-2xl sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            
            {/* Company Information */}
            <div>
              <h3 className="text-lg font-medium text-text-light mb-4">Virksomhedsoplysninger</h3>
              
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="companyName" className="block text-sm font-medium text-text-light">
                    Virksomhedsnavn *
                  </label>
                  <input
                    id="companyName"
                    name="companyName"
                    type="text"
                    required
                    value={formData.companyName}
                    onChange={handleInputChange}
                    className="mt-1 appearance-none relative block w-full px-3 py-2 bg-background border border-text-muted/20 placeholder-text-muted text-text-light rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent sm:text-sm"
                    placeholder="Fx. TechAcademy ApS"
                  />
                </div>

                <div>
                  <label htmlFor="cvr" className="block text-sm font-medium text-text-light">
                    CVR-nummer
                  </label>
                  <input
                    id="cvr"
                    name="cvr"
                    type="text"
                    value={formData.cvr}
                    onChange={handleInputChange}
                    className="mt-1 appearance-none relative block w-full px-3 py-2 bg-background border border-text-muted/20 placeholder-text-muted text-text-light rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent sm:text-sm"
                    placeholder="12345678"
                  />
                </div>

                <div>
                  <label htmlFor="contactEmail" className="block text-sm font-medium text-text-light">
                    Virksomheds email *
                  </label>
                  <input
                    id="contactEmail"
                    name="contactEmail"
                    type="email"
                    required
                    value={formData.contactEmail}
                    onChange={handleInputChange}
                    className="mt-1 appearance-none relative block w-full px-3 py-2 bg-background border border-text-muted/20 placeholder-text-muted text-text-light rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent sm:text-sm"
                    placeholder="kontakt@techacademy.dk"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-text-light">
                    Telefon
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="mt-1 appearance-none relative block w-full px-3 py-2 bg-background border border-text-muted/20 placeholder-text-muted text-text-light rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent sm:text-sm"
                    placeholder="+45 12 34 56 78"
                  />
                </div>

                <div>
                  <label htmlFor="website" className="block text-sm font-medium text-text-light">
                    Hjemmeside
                  </label>
                  <input
                    id="website"
                    name="website"
                    type="url"
                    value={formData.website}
                    onChange={handleInputChange}
                    className="mt-1 appearance-none relative block w-full px-3 py-2 bg-background border border-text-muted/20 placeholder-text-muted text-text-light rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent sm:text-sm"
                    placeholder="https://techacademy.dk"
                  />
                </div>

                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-text-light">
                    By
                  </label>
                  <input
                    id="city"
                    name="city"
                    type="text"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="mt-1 appearance-none relative block w-full px-3 py-2 bg-background border border-text-muted/20 placeholder-text-muted text-text-light rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent sm:text-sm"
                    placeholder="København"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label htmlFor="description" className="block text-sm font-medium text-text-light">
                  Beskrivelse af virksomheden
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  value={formData.description}
                  onChange={handleInputChange}
                  className="mt-1 appearance-none relative block w-full px-3 py-2 bg-background border border-text-muted/20 placeholder-text-muted text-text-light rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent sm:text-sm"
                  placeholder="Beskriv jeres expertise og hvilke typer kurser I tilbyder..."
                />
              </div>
            </div>

            {/* Administrator User */}
            <div className="border-t border-text-muted/20 pt-6">
              <h3 className="text-lg font-medium text-text-light mb-4">Administrator Bruger</h3>
              
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="userFirstName" className="block text-sm font-medium text-text-light">
                    Fornavn *
                  </label>
                  <input
                    id="userFirstName"
                    name="userFirstName"
                    type="text"
                    required
                    value={formData.userFirstName}
                    onChange={handleInputChange}
                    className="mt-1 appearance-none relative block w-full px-3 py-2 bg-background border border-text-muted/20 placeholder-text-muted text-text-light rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent sm:text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="userLastName" className="block text-sm font-medium text-text-light">
                    Efternavn *
                  </label>
                  <input
                    id="userLastName"
                    name="userLastName"
                    type="text"
                    required
                    value={formData.userLastName}
                    onChange={handleInputChange}
                    className="mt-1 appearance-none relative block w-full px-3 py-2 bg-background border border-text-muted/20 placeholder-text-muted text-text-light rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent sm:text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="userEmail" className="block text-sm font-medium text-text-light">
                    Email *
                  </label>
                  <input
                    id="userEmail"
                    name="userEmail"
                    type="email"
                    required
                    value={formData.userEmail}
                    onChange={handleInputChange}
                    className="mt-1 appearance-none relative block w-full px-3 py-2 bg-background border border-text-muted/20 placeholder-text-muted text-text-light rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent sm:text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="userPassword" className="block text-sm font-medium text-text-light">
                    Adgangskode * (min. 6 tegn)
                  </label>
                  <input
                    id="userPassword"
                    name="userPassword"
                    type="password"
                    required
                    minLength={6}
                    value={formData.userPassword}
                    onChange={handleInputChange}
                    className="mt-1 appearance-none relative block w-full px-3 py-2 bg-background border border-text-muted/20 placeholder-text-muted text-text-light rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent sm:text-sm"
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                <div className="text-red-400">{error}</div>
              </div>
            )}

            <div className="bg-accent/10 border border-accent/20 rounded-xl p-4">
              <p className="text-sm text-accent">
                <strong>Næste skridt:</strong> Efter registrering gennemgår vi din ansøgning. 
                Du får besked inden for 1-2 arbejdsdage om godkendelse.
              </p>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white ${
                  loading 
                    ? 'bg-text-muted cursor-not-allowed' 
                    : 'bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary'
                }`}
              >
                {loading ? 'Registrerer...' : 'Send Ansøgning'}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-text-muted">
              Har du allerede en konto?{' '}
              <Link href="/login" className="font-medium text-accent hover:underline transition-all">
                Log ind her
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}