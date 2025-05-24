import type { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '@/lib/supabaseClient'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = req.headers.authorization?.split(' ')[1]
  const courseId = Number(req.query.courseId)

  if (!token || isNaN(courseId)) {
    return res.status(400).json({ error: 'Missing token or courseId' })
  }

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token)

  if (error || !user) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const purchase = await prisma.purchase.findFirst({
    where: {
      userId: user.id,
      courseId: courseId,
    },
  })

  res.status(200).json({ access: !!purchase })
}
