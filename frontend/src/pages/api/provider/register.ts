import type { NextApiRequest, NextApiResponse } from 'next'
import { supabaseAdmin } from '@/lib/supabaseClient'
import { prisma } from '@/lib/prisma'

interface ProviderRegistrationData {
  companyName: string
  contactEmail: string
  phone?: string
  website?: string
  description?: string
  address?: string
  city?: string
  postalCode?: string
  cvr?: string
  userFirstName: string
  userLastName: string
  userEmail: string
  userPassword: string
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const {
    companyName,
    contactEmail,
    phone,
    website,
    description,
    address,
    city,
    postalCode,
    cvr,
    userFirstName,
    userLastName,
    userEmail,
    userPassword
  }: ProviderRegistrationData = req.body

  // Validering
  if (!companyName || !contactEmail || !userFirstName || !userLastName || !userEmail || !userPassword) {
    return res.status(400).json({ 
      error: 'Påkrævede felter mangler: virksomhedsnavn, kontakt email, bruger fornavn, efternavn, email og adgangskode' 
    })
  }

  if (userPassword.length < 6) {
    return res.status(400).json({ error: 'Adgangskode skal være mindst 6 tegn' })
  }

  // Email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(contactEmail) || !emailRegex.test(userEmail)) {
    return res.status(400).json({ error: 'Ugyldig email format' })
  }

  try {
    // Tjek om provider email eller CVR allerede eksisterer
    const existingProvider = await prisma.provider.findFirst({
      where: {
        OR: [
          { contactEmail: contactEmail },
          ...(cvr ? [{ cvr: cvr }] : [])
        ]
      }
    })

    if (existingProvider) {
      return res.status(409).json({ 
        error: 'En kursusudbyder med denne email eller CVR eksisterer allerede' 
      })
    }

    // Tjek om bruger email allerede eksisterer i vores database
    const existingUser = await prisma.user.findUnique({
      where: { email: userEmail }
    })

    if (existingUser) {
      return res.status(409).json({ 
        error: 'En bruger med denne email eksisterer allerede' 
      })
    }

    // Opret bruger i Supabase Auth (using admin client)
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: userEmail,
      password: userPassword,
      email_confirm: true, // Auto-confirm for B2B providers
      user_metadata: {
        first_name: userFirstName,
        last_name: userLastName,
        role: 'PROVIDER'
      }
    })

    if (authError) {
      console.error('Supabase auth error:', authError)
      return res.status(500).json({ 
        error: 'Kunne ikke oprette bruger: ' + authError.message 
      })
    }

    if (!authData.user) {
      return res.status(500).json({ error: 'Bruger blev ikke oprettet korrekt' })
    }

    // Database transaction - opret provider og bruger samtidig
    const result = await prisma.$transaction(async (tx) => {
      // Opret provider
      const provider = await tx.provider.create({
        data: {
          companyName,
          contactEmail,
          phone: phone || null,
          website: website || null,
          description: description || null,
          address: address || null,
          city: city || null,
          postalCode: postalCode || null,
          cvr: cvr || null,
          status: 'PENDING' // Default status - venter på godkendelse
        }
      })

      // Opret bruger i vores database
      const user = await tx.user.create({
        data: {
          id: authData.user.id,
          email: userEmail,
          firstName: userFirstName,
          lastName: userLastName,
          role: 'PROVIDER',
          providerId: provider.id
        }
      })

      return { provider, user }
    })

    // Send notifikation til admins (kunne implementeres senere)
    console.log(`🎉 Ny provider registrering: ${companyName} (${contactEmail})`)
    
    // TODO: Send email notifikation til admins
    // TODO: Send velkomst email til provider

    res.status(201).json({
      success: true,
      message: 'Provider registrering fuldført. Afventer godkendelse.',
      data: {
        providerId: result.provider.id,
        userId: result.user.id,
        status: result.provider.status,
        companyName: result.provider.companyName
      }
    })

  } catch (error) {
    console.error('Provider registration error:', error)

    // Cleanup: Hvis database fejler, slet Supabase bruger
    if (req.body.userEmail) {
      try {
        // Find og slet bruger fra Supabase hvis den blev oprettet
        const { data: users } = await supabase.auth.admin.listUsers()
        const userToDelete = users.users?.find((u: { email: string; id: string }) => u.email === userEmail)
        if (userToDelete) {
          await supabase.auth.admin.deleteUser(userToDelete.id)
        }
      } catch (cleanupError) {
        console.error('Cleanup error:', cleanupError)
      }
    }

    if (error instanceof Error) {
      // Prisma constraint errors
      if (error.message.includes('Unique constraint')) {
        return res.status(409).json({ 
          error: 'En kursusudbyder med disse oplysninger eksisterer allerede' 
        })
      }
    }

    res.status(500).json({
      success: false,
      error: 'Der opstod en fejl under registreringen. Prøv venligst igen.',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    })
  }
}