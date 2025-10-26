import type { NextApiRequest, NextApiResponse } from 'next'
import { requireAdmin } from '@/middleware/adminAuth'
import { supabase } from '@/lib/supabaseClient'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Verify admin access
  const auth = await requireAdmin(req, res)
  if (!auth) return

  const { id } = req.query

  try {
    // Check if category has courses
    const { data: courses, error: checkError } = await supabase
      .from('courses')
      .select('id')
      .eq('categoryId', Number(id))
      .limit(1)

    if (checkError) {
      console.error('Error checking courses:', checkError)
      return res.status(500).json({ error: 'Kunne ikke tjekke kurser' })
    }

    if (courses && courses.length > 0) {
      return res.status(400).json({ error: 'Kategorien har kurser og kan ikke slettes' })
    }

    // Delete category
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', Number(id))

    if (error) {
      console.error('Error deleting category:', error)
      return res.status(500).json({ error: 'Kunne ikke slette kategori' })
    }

    return res.status(200).json({ message: 'Kategori slettet' })
  } catch (error) {
    console.error('Error deleting category:', error)
    return res.status(500).json({ error: 'Serverfejl' })
  }
}
