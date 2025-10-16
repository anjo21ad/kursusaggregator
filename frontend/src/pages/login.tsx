import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Navigation from '@/components/Navigation'
import LoadingSpinner from '@/components/LoadingSpinner'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Check for redirect messages
  useEffect(() => {
    if (router.query.message === 'provider-registered') {
      setMessage('Din ansøgning er modtaget! Log ind for at se status.')
    }
  }, [router.query])

  const handleSignUp = async () => {
    setLoading(true)
    setMessage(null)
    const { error } = await supabase.auth.signUp({ email, password })
    setMessage(error ? `Fejl ved oprettelse: ${error.message}` : 'Bruger oprettet! Tjek din email for bekræftelse.')
    setLoading(false)
  }

  const handleSignIn = async () => {
    setLoading(true)
    setMessage(null)

    try {
      const { error, data } = await supabase.auth.signInWithPassword({ email, password })

      if (error) {
        setMessage(`Login fejlede: ${error.message}`)
        setLoading(false)
        return
      }

      // Fetch user profile to determine role and redirect
      const profileResponse = await fetch('/api/user/profile', {
        headers: {
          Authorization: `Bearer ${data.session?.access_token}`
        }
      })

      if (profileResponse.ok) {
        const userData = await profileResponse.json()

        // Role-based redirect
        switch (userData.role) {
          case 'SUPER_ADMIN':
            router.push('/admin/providers')
            break
          case 'PROVIDER':
            if (userData.provider?.status === 'APPROVED') {
              router.push('/provider/dashboard')
            } else {
              router.push('/provider/pending')
            }
            break
          case 'COMPANY_ADMIN':
          case 'COMPANY_USER':
          default:
            // Check for redirect query param
            const redirect = router.query.redirect as string
            router.push(redirect || '/my-courses')
            break
        }
      } else {
        // Fallback if profile fetch fails
        router.push('/')
      }
    } catch (err) {
      setMessage('Der opstod en uventet fejl')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation minimal />

      <div className="flex-1 flex items-center justify-center py-12 px-6">
        <div className="bg-card rounded-2xl p-8 shadow-lg w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-text-light mb-2">Velkommen tilbage</h1>
            <p className="text-text-muted">Log ind eller opret en ny konto</p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-text-light mb-2">Email</label>
              <input
                type="email"
                placeholder="din@email.dk"
                value={email}
                onChange={e => setEmail(e.target.value)}
                disabled={loading}
                onKeyPress={(e) => e.key === 'Enter' && handleSignIn()}
                className="w-full px-4 py-3 bg-background border border-text-muted/20 rounded-xl text-text-light placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-light mb-2">Adgangskode</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                disabled={loading}
                onKeyPress={(e) => e.key === 'Enter' && handleSignIn()}
                className="w-full px-4 py-3 bg-background border border-text-muted/20 rounded-xl text-text-light placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleSignIn}
                disabled={loading}
                className="flex-1 px-6 py-3 bg-primary rounded-xl text-white hover:bg-primary-dark transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-h-[48px]"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                    <span>Logger ind...</span>
                  </>
                ) : (
                  'Log ind'
                )}
              </button>
              <button
                onClick={handleSignUp}
                disabled={loading}
                className="flex-1 px-6 py-3 bg-card border border-secondary text-secondary hover:bg-secondary hover:text-white rounded-xl transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Opret bruger
              </button>
            </div>

            {message && (
              <div className={`p-4 rounded-xl ${
                message.includes('fejl') || message.includes('Fejl') || message.includes('fejlede')
                  ? 'bg-red-500/10 border border-red-500/20 text-red-400'
                  : 'bg-success/10 border border-success/20 text-success'
              }`}>
                {message}
              </div>
            )}
          </div>

          <div className="mt-8 text-center space-y-4">
            <p className="text-sm text-text-muted">
              Vil du blive kursusudbyder?{' '}
              <Link href="/register-provider" className="text-accent hover:underline transition-all">
                Ansøg her
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
