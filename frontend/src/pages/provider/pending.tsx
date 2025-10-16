import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '@/lib/supabaseClient'

interface UserProfile {
  id: string
  email: string
  firstName?: string
  lastName?: string
  role: string
  provider?: {
    id: number
    companyName: string
    status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED'
    contactEmail: string
    createdAt: string
  }
}

export default function ProviderPendingPage() {
  const router = useRouter()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        router.push('/login?redirect=provider/pending')
        return
      }

      // Hent bruger profil
      const userResponse = await fetch('/api/user/profile', {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      })
      
      if (userResponse.ok) {
        const userData = await userResponse.json()
        
        if (userData.role !== 'PROVIDER') {
          router.push('/?error=access-denied')
          return
        }

        if (userData.provider?.status === 'APPROVED') {
          router.push('/provider/dashboard')
          return
        }

        setUser(userData)
      } else {
        router.push('/login?error=access-denied')
      }

      setLoading(false)
    }

    checkAuth()
  }, [router])

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'PENDING':
        return {
          icon: '⏳',
          title: 'Afventer Godkendelse',
          message: 'Din ansøgning som kursusudbyder er modtaget og afventer godkendelse fra vores team.',
          details: 'Vi gennemgår typisk ansøgninger inden for 1-2 arbejdsdage. Du får besked på email, så snart der er nyt.',
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200'
        }
      case 'REJECTED':
        return {
          icon: '❌',
          title: 'Ansøgning Afvist',
          message: 'Din ansøgning som kursusudbyder er desværre blevet afvist.',
          details: 'Kontakt os på support@kursusaggregator.dk hvis du har spørgsmål eller ønsker at ansøge igen.',
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200'
        }
      case 'SUSPENDED':
        return {
          icon: '⏸️',
          title: 'Konto Suspenderet',
          message: 'Din provider-konto er midlertidigt suspenderet.',
          details: 'Kontakt os på support@kursusaggregator.dk for mere information om genaktivering.',
          color: 'text-orange-600',
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200'
        }
      default:
        return {
          icon: '❓',
          title: 'Status Ukendt',
          message: 'Der opstod en fejl med din konto status.',
          details: 'Kontakt support@kursusaggregator.dk for hjælp.',
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200'
        }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Indlæser...</p>
        </div>
      </div>
    )
  }

  if (!user?.provider) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <span className="text-6xl mb-4 block">❓</span>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Ingen Provider Data</h1>
          <p className="text-gray-600 mb-6">
            Der blev ikke fundet nogen provider data for din konto.
          </p>
          <div className="space-x-4">
            <button
              onClick={() => router.push('/register-provider')}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Ansøg som Provider
            </button>
            <button
              onClick={() => supabase.auth.signOut()}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Log ud
            </button>
          </div>
        </div>
      </div>
    )
  }

  const statusInfo = getStatusInfo(user.provider.status)

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <span className="text-6xl mb-4 block">{statusInfo.icon}</span>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {statusInfo.title}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {user.provider.companyName}
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className={`rounded-md p-4 mb-6 ${statusInfo.bgColor} ${statusInfo.borderColor} border`}>
            <div className={`text-sm ${statusInfo.color}`}>
              <p className="font-medium mb-2">{statusInfo.message}</p>
              <p>{statusInfo.details}</p>
            </div>
          </div>

          {/* Provider Information */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Ansøgnings Information</h3>
            
            <dl className="space-y-3">
              <div>
                <dt className="text-sm font-medium text-gray-500">Virksomhed</dt>
                <dd className="text-sm text-gray-900">{user.provider.companyName}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Kontakt Email</dt>
                <dd className="text-sm text-gray-900">{user.provider.contactEmail}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Status</dt>
                <dd className="text-sm text-gray-900">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.bgColor} ${statusInfo.color}`}>
                    {user.provider.status}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Indsendt</dt>
                <dd className="text-sm text-gray-900">
                  {new Date(user.provider.createdAt).toLocaleDateString('da-DK', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </dd>
              </div>
            </dl>
          </div>

          {/* Actions */}
          <div className="mt-8 space-y-4">
            {user.provider.status === 'PENDING' && (
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <div className="text-sm text-blue-800">
                  <p className="font-medium">Hvad sker der nu?</p>
                  <ul className="mt-2 list-disc list-inside space-y-1">
                    <li>Vores team gennemgår din ansøgning</li>
                    <li>Vi tjekker dine firmaoplysninger</li>
                    <li>Du får besked på email inden for 1-2 arbejdsdage</li>
                    <li>Efter godkendelse får du adgang til provider dashboard</li>
                  </ul>
                </div>
              </div>
            )}

            <div className="flex space-x-4">
              <button
                onClick={() => router.push('/')}
                className="flex-1 bg-white border border-gray-300 rounded-md py-2 px-4 inline-flex justify-center text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                ← Tilbage til forside
              </button>
              <button
                onClick={() => supabase.auth.signOut()}
                className="flex-1 bg-indigo-600 border border-transparent rounded-md py-2 px-4 inline-flex justify-center text-sm font-medium text-white hover:bg-indigo-700"
              >
                Log ud
              </button>
            </div>

            <div className="text-center">
              <p className="text-xs text-gray-500">
                Har du spørgsmål? Kontakt os på{' '}
                <a href="mailto:support@kursusaggregator.dk" className="text-indigo-600 hover:text-indigo-500">
                  support@kursusaggregator.dk
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}