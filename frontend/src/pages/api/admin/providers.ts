import type { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '@/lib/supabaseClient'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Verificer admin authentication
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) {
    return res.status(401).json({ error: 'No authorization token provided' })
  }

  const { data: { user }, error: authError } = await supabase.auth.getUser(token)
  if (authError || !user) {
    return res.status(401).json({ error: 'Invalid token' })
  }

  // Check user role in database
  try {
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { role: true }
    })

    if (!dbUser || dbUser.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ error: 'Access denied. Admin role required.' })
    }

    // Hent alle providers med deres brugere
    const providers = await prisma.provider.findMany({
      include: {
        users: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        },
        courses: {
          select: {
            id: true,
            title: true,
            status: true
          }
        },
        _count: {
          select: {
            courses: true,
            leads: true
          }
        }
      },
      orderBy: [
        { status: 'asc' }, // PENDING first
        { createdAt: 'desc' }
      ]
    })

    res.status(200).json({
      success: true,
      providers: providers,
      statistics: {
        total: providers.length,
        pending: providers.filter(p => p.status === 'PENDING').length,
        approved: providers.filter(p => p.status === 'APPROVED').length,
        suspended: providers.filter(p => p.status === 'SUSPENDED').length,
        rejected: providers.filter(p => p.status === 'REJECTED').length
      }
    })

  } catch (error) {
    console.error('Admin providers fetch error:', error)
    res.status(500).json({
      error: 'Failed to fetch providers',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    })
  }
}