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

    // Hent statistikker
    const [
      totalCourses,
      publishedCourses,
      draftCourses,
      totalPurchases,
      totalLeads,
      revenueData
    ] = await Promise.all([
      // Total kurser
      prisma.course.count({
        where: { providerId }
      }),
      
      // Publicerede kurser
      prisma.course.count({
        where: { 
          providerId,
          status: 'PUBLISHED' 
        }
      }),
      
      // Draft kurser
      prisma.course.count({
        where: { 
          providerId,
          status: 'DRAFT' 
        }
      }),
      
      // Total salg
      prisma.purchase.count({
        where: {
          course: {
            providerId
          }
        }
      }),
      
      // Total leads
      prisma.lead.count({
        where: { providerId }
      }),
      
      // Revenue data (aggregated purchases)
      prisma.purchase.aggregate({
        where: {
          course: {
            providerId
          }
        },
        _sum: {
          priceCents: true,
          commission: true
        }
      })
    ])

    // Månedens revenue (sidste 30 dage)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const monthlyRevenueData = await prisma.purchase.aggregate({
      where: {
        course: {
          providerId
        },
        createdAt: {
          gte: thirtyDaysAgo
        }
      },
      _sum: {
        priceCents: true,
        commission: true
      }
    })

    const stats = {
      totalCourses,
      publishedCourses,
      draftCourses,
      pendingReviewCourses: totalCourses - publishedCourses - draftCourses,
      totalPurchases,
      totalLeads,
      totalRevenue: revenueData._sum.priceCents || 0,
      totalCommission: revenueData._sum.commission || 0,
      monthlyRevenue: monthlyRevenueData._sum.priceCents || 0,
      monthlyCommission: monthlyRevenueData._sum.commission || 0
    }

    res.status(200).json(stats)

  } catch (error) {
    console.error('Provider stats error:', error)
    res.status(500).json({
      error: 'Failed to fetch provider statistics',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    })
  }
}