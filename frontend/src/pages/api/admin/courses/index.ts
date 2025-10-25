import type { NextApiRequest, NextApiResponse } from 'next'
import { requireAdmin } from '@/middleware/adminAuth'
import { prisma } from '@/lib/prisma'
import type { CourseStatus } from '@prisma/client'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Verify admin access
  const auth = await requireAdmin(req, res)
  if (!auth) return // Response already sent by middleware

  try {
    // Parse query parameters
    const {
      status,
      search,
      page = '1',
      limit = '10',
    } = req.query

    const pageNum = Math.max(1, parseInt(page as string, 10))
    const limitNum = Math.min(50, Math.max(1, parseInt(limit as string, 10)))
    const skip = (pageNum - 1) * limitNum

    // Build where clause
    const where: any = {}

    // Filter by status
    if (status && typeof status === 'string') {
      const validStatuses: CourseStatus[] = ['DRAFT', 'PENDING', 'PUBLISHED', 'ARCHIVED']
      if (validStatuses.includes(status as CourseStatus)) {
        where.status = status as CourseStatus
      }
    }

    // Search by title or description
    if (search && typeof search === 'string' && search.trim()) {
      where.OR = [
        { title: { contains: search.trim(), mode: 'insensitive' } },
        { description: { contains: search.trim(), mode: 'insensitive' } },
      ]
    }

    // Fetch courses with pagination
    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: [
          { status: 'asc' }, // PENDING first, then DRAFT, PUBLISHED, ARCHIVED
          { createdAt: 'desc' },
        ],
        include: {
          provider: {
            select: {
              id: true,
              companyName: true,
              status: true,
            },
          },
          category: {
            select: {
              id: true,
              name: true,
            },
          },
          _count: {
            select: {
              purchases: true,
            },
          },
        },
      }),
      prisma.course.count({ where }),
    ])

    const totalPages = Math.ceil(total / limitNum)

    return res.status(200).json({
      courses,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1,
      },
    })
  } catch (error) {
    console.error('Error fetching courses:', error)
    return res.status(500).json({ error: 'Failed to fetch courses' })
  }
}
