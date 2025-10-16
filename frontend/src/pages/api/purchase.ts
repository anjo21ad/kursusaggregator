import type { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '@/lib/supabaseClient'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const token = req.headers.authorization?.split(' ')[1]
  const { courseId } = req.body

  if (!token || !courseId) {
    return res.status(400).json({ error: 'Missing token or courseId' })
  }

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token)

  if (error || !user) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  try {
    // Get course details for price
    const course = await prisma.course.findUnique({
      where: { id: Number(courseId) }
    })

    if (!course) {
      return res.status(404).json({ error: 'Course not found' })
    }

    const purchase = await prisma.purchase.create({
      data: {
        userId: user.id,
        courseId: Number(courseId),
        priceCents: course.priceCents,
      },
    })

    res.status(200).json(purchase)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to register purchase' })
  }
}
