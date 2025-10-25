import type { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '@/lib/supabaseClient'
import { fetchCourseById, createPurchase } from '@/lib/database-adapter'

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
    // Get course details for price (READ - use adapter)
    const course = await fetchCourseById(Number(courseId))

    if (!course) {
      return res.status(404).json({ error: 'Course not found' })
    }

    // Create purchase (WRITE - uses Prisma via adapter)
    const purchase = await createPurchase({
      userId: user.id,
      courseId: Number(courseId),
      priceCents: course.priceCents,
    })

    res.status(200).json(purchase)
  } catch (err) {
    console.error('Purchase error:', err)
    res.status(500).json({ error: 'Failed to register purchase' })
  }
}
