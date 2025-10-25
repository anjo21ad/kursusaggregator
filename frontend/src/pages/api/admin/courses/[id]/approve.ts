import type { NextApiRequest, NextApiResponse } from 'next'
import { requireAdmin } from '@/middleware/adminAuth'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Verify admin access
  const auth = await requireAdmin(req, res)
  if (!auth) return // Response already sent by middleware

  const courseId = Number(req.query.id)

  if (isNaN(courseId)) {
    return res.status(400).json({ error: 'Invalid course ID' })
  }

  try {
    // Check if course exists
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { id: true, status: true, title: true },
    })

    if (!course) {
      return res.status(404).json({ error: 'Course not found' })
    }

    // Update course to PUBLISHED status
    const updatedCourse = await prisma.course.update({
      where: { id: courseId },
      data: {
        status: 'PUBLISHED',
        publishedAt: new Date(),
      },
      include: {
        provider: {
          select: {
            id: true,
            companyName: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    return res.status(200).json({
      success: true,
      message: `Course "${course.title}" has been approved and published`,
      course: updatedCourse,
    })
  } catch (error) {
    console.error('Error approving course:', error)
    return res.status(500).json({ error: 'Failed to approve course' })
  }
}
