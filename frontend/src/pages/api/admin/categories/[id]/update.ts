import type { NextApiRequest, NextApiResponse } from 'next'
import { requireAdmin } from '@/middleware/adminAuth'
import { supabase } from '@/lib/supabaseClient'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PATCH') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Verify admin access
  const auth = await requireAdmin(req, res)
  if (!auth) return

  const { id } = req.query
  const { name, slug, description, icon, color, isActive, sortOrder } = req.body

  try {
    const { data, error } = await supabase
      .from('categories')
      .update({
        name,
        slug,
        description,
        icon,
        color,
        isActive,
        sortOrder,
      })
      .eq('id', Number(id))
      .select()
      .single()

    if (error) {
      console.error('Error updating category:', error)
      return res.status(500).json({ error: 'Kunne ikke opdatere kategori' })
    }

    return res.status(200).json({ category: data })
  } catch (error) {
    console.error('Error updating category:', error)
    return res.status(500).json({ error: 'Serverfejl' })
  }
}
