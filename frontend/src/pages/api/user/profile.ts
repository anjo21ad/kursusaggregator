import type { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '@/lib/supabaseClient'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const token = req.headers.authorization?.split(' ')[1]
  if (!token) {
    return res.status(401).json({ error: 'No authorization token provided' })
  }

  // Verificer token med Supabase først (dette virker altid via HTTPS)
  const { data: { user }, error: authError } = await supabase.auth.getUser(token)
  if (authError || !user) {
    return res.status(401).json({ error: 'Invalid token' })
  }

  try {

    // Hent bruger info fra vores database
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            email: true,
            cvr: true
          }
        },
        provider: {
          select: {
            id: true,
            companyName: true,
            status: true,
            contactEmail: true
          }
        }
      }
    })

    // If user doesn't exist in our DB, create them automatically
    if (!dbUser) {
      const newUser = await prisma.user.create({
        data: {
          id: user.id,
          email: user.email!,
          firstName: user.user_metadata?.firstName || null,
          lastName: user.user_metadata?.lastName || null,
          role: 'COMPANY_USER', // Default role
        },
      })

      return res.status(200).json({
        id: newUser.id,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        role: newUser.role,
        isActive: newUser.isActive,
        createdAt: newUser.createdAt,
        company: null,
        provider: null
      })
    }

    // Return user profile data
    res.status(200).json({
      id: dbUser.id,
      email: dbUser.email,
      firstName: dbUser.firstName,
      lastName: dbUser.lastName,
      role: dbUser.role,
      isActive: dbUser.isActive,
      createdAt: dbUser.createdAt,
      company: dbUser.company,
      provider: dbUser.provider
    })

  } catch (error) {
    // Database is unavailable (firewall blocking PostgreSQL)
    // Return basic profile from Supabase Auth instead (user is already verified above)
    console.warn('⚠️  Database unavailable, using Supabase Auth data only');
    console.warn('Database error:', error instanceof Error ? error.message : String(error));

    return res.status(200).json({
      id: user.id,
      email: user.email,
      firstName: user.user_metadata?.firstName || null,
      lastName: user.user_metadata?.lastName || null,
      role: user.user_metadata?.role || 'COMPANY_USER',
      isActive: true,
      createdAt: user.created_at,
      company: null,
      provider: null,
      _dbUnavailable: true // Flag to indicate limited functionality
    });
  }
}