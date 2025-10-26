import type { NextApiRequest, NextApiResponse } from 'next'
import { requireAdmin } from '@/middleware/adminAuth'
import { supabase } from '@/lib/supabaseClient'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Verify admin access
  const auth = await requireAdmin(req, res)
  if (!auth) return

  if (req.method === 'GET') {
    try {
      // Fetch all categories with course count
      const { data: categories, error } = await supabase
        .from('categories')
        .select(`
          id,
          name,
          slug,
          description,
          isActive,
          parentId,
          icon,
          color,
          sortOrder,
          courses:courses(count)
        `)
        .order('sortOrder', { ascending: true })

      if (error) {
        console.error('Supabase error fetching categories:', error)
        return res.status(500).json({ error: 'Kunne ikke hente kategorier' })
      }

      // Transform to include course count
      const categoriesWithCount = (categories || []).map((cat: any) => ({
        ...cat,
        courseCount: cat.courses?.[0]?.count || 0,
        courses: undefined, // Remove courses array
      }))

      return res.status(200).json({ categories: categoriesWithCount })
    } catch (error) {
      console.error('Error fetching categories:', error)
      return res.status(500).json({ error: 'Serverfejl' })
    }
  }

  if (req.method === 'POST') {
    try {
      const { name, slug, description, icon, color, parentId } = req.body

      if (!name || !slug) {
        return res.status(400).json({ error: 'Navn og slug er påkrævet' })
      }

      const { data, error } = await supabase
        .from('categories')
        .insert({
          name,
          slug,
          description,
          icon,
          color,
          parentId: parentId || null,
          isActive: true,
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating category:', error)
        return res.status(500).json({ error: 'Kunne ikke oprette kategori' })
      }

      return res.status(201).json({ category: data })
    } catch (error) {
      console.error('Error creating category:', error)
      return res.status(500).json({ error: 'Serverfejl' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
