import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

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
    <div style={{ maxWidth: '400px', margin: 'auto', padding: '2rem' }}>
      <h1>Log ind eller opret bruger</h1>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
      /><br />
      <input
        type="password"
        placeholder="Adgangskode"
        value={password}
        onChange={e => setPassword(e.target.value)}
      /><br />
      <button onClick={handleSignIn}>Log ind</button>{' '}
      <button onClick={handleSignUp}>Opret bruger</button>
      {message && <p>{message}</p>}
    </div>
  )
}
