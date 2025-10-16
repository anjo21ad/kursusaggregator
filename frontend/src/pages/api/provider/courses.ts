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
    // Verificer token og hent bruger
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      return res.status(401).json({ error: 'Invalid token' })
    }

    // Hent bruger fra database med provider relation
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        provider: true
      }
    })

    if (!dbUser || dbUser.role !== 'PROVIDER' || !dbUser.provider) {
      return res.status(403).json({ error: 'Access denied. Provider role required.' })
    }

    if (dbUser.provider.status !== 'APPROVED') {
      return res.status(403).json({ error: 'Provider not approved yet.' })
    }

    const providerId = dbUser.provider.id

    // Hent provider's kurser med statistikker
    const courses = await prisma.course.findMany({
      where: { providerId },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        _count: {
          select: {
            purchases: true,
            leads: true
          }
        }
      },
      orderBy: [
        { status: 'asc' },
        { createdAt: 'desc' }
      ]
    })

    // Beregn revenue for hvert kursus
    const coursesWithRevenue = await Promise.all(
      courses.map(async (course) => {
        const revenueData = await prisma.purchase.aggregate({
          where: { courseId: course.id },
          _sum: {
            priceCents: true,
            commission: true
          }
        })

        return {
          ...course,
          revenue: {
            totalRevenue: revenueData._sum.priceCents || 0,
            totalCommission: revenueData._sum.commission || 0
          }
        }
      })
    )

    res.status(200).json({
      success: true,
      courses: coursesWithRevenue,
      statistics: {
        total: courses.length,
        published: courses.filter(c => c.status === 'PUBLISHED').length,
        draft: courses.filter(c => c.status === 'DRAFT').length,
        pendingReview: courses.filter(c => c.status === 'PENDING_REVIEW').length,
        archived: courses.filter(c => c.status === 'ARCHIVED').length
      }
    })

  } catch (error) {
    console.error('Provider courses fetch error:', error)
    res.status(500).json({
      error: 'Failed to fetch provider courses',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    })
  }
}