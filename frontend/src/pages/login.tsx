import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState<string | null>(null)

  const handleSignUp = async () => {
    const { error } = await supabase.auth.signUp({ email, password })
    setMessage(error ? `Fejl ved oprettelse: ${error.message}` : 'Bruger oprettet! Tjek din email for bekræftelse.')
  }

  const handleSignIn = async () => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setMessage(`Login fejlede: ${error.message}`)
    } else {
      setMessage('Logget ind!')
      window.location.href = '/'
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
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
              className="w-full px-4 py-3 bg-background border border-text-muted/20 rounded-xl text-text-light placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-text-light mb-2">Adgangskode</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-background border border-text-muted/20 rounded-xl text-text-light placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              onClick={handleSignIn}
              className="flex-1 px-6 py-3 bg-primary rounded-xl text-white hover:bg-primary-dark transition-colors font-semibold"
            >
              Log ind
            </button>
            <button 
              onClick={handleSignUp}
              className="flex-1 px-6 py-3 bg-card border border-secondary text-secondary hover:bg-secondary hover:text-white rounded-xl transition-colors font-semibold"
            >
              Opret bruger
            </button>
          </div>
          
          {message && (
            <div className={`p-4 rounded-xl ${message.includes('fejl') || message.includes('Fejl') ? 'bg-red-500/10 border border-red-500/20 text-red-400' : 'bg-success/10 border border-success/20 text-success'}`}>
              {message}
            </div>
          )}
        </div>
        
        <div className="mt-8 text-center">
          <Link href="/" className="text-accent hover:underline transition-all">
            ← Tilbage til forsiden
          </Link>
        </div>
      </div>
    </div>
  )
}
