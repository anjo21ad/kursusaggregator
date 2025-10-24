import type { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '@/lib/supabaseClient'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = req.headers.authorization?.split(' ')[1]

  if (!token) {
    return res.status(401).json({ error: 'Missing token' })
  }

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token)

  if (error || !user) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  try {
    const purchases = await prisma.purchase.findMany({
      where: {
        userId: user.id,
      },
    })

    const courseIds = purchases.map(p => p.courseId)

    const courses = await prisma.course.findMany({
      where: {
        id: { in: courseIds },
      },
    })

    res.status(200).json(courses)
  } catch (err) {
    console.error('Fejl ved hentning af brugerens kurser:', err)
    // Return empty array instead of crashing when database is unavailable
    res.status(200).json([])
  }
}
