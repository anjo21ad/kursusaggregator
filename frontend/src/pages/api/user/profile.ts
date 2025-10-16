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

  try {
    // Verificer token med Supabase
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      return res.status(401).json({ error: 'Invalid token' })
    }

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

    if (!dbUser) {
      return res.status(404).json({ error: 'User not found in database' })
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
    console.error('User profile fetch error:', error)
    res.status(500).json({
      error: 'Failed to fetch user profile',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    })
  }
}