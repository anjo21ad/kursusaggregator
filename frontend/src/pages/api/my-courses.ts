import type { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '@/lib/supabaseClient'
import { fetchUserCourses } from '@/lib/database-adapter'

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
    // Use hybrid database adapter
    const courses = await fetchUserCourses(user.id)
    return res.status(200).json(courses)
  } catch (err) {
    console.error('Error fetching user courses:', err)
    // Return empty array when database is unavailable
    return res.status(200).json([])
  }
}
