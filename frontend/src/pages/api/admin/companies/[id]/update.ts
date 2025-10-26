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
  const { name, cvr, email, phone, address, city, postalCode, website, isActive } = req.body

  try {
    const updateData: any = {}

    if (name !== undefined) updateData.name = name
    if (cvr !== undefined) updateData.cvr = cvr
    if (email !== undefined) updateData.email = email
    if (phone !== undefined) updateData.phone = phone
    if (address !== undefined) updateData.address = address
    if (city !== undefined) updateData.city = city
    if (postalCode !== undefined) updateData.postalCode = postalCode
    if (website !== undefined) updateData.website = website
    if (isActive !== undefined) updateData.isActive = isActive

    const { data, error } = await supabase
      .from('companies')
      .update(updateData)
      .eq('id', Number(id))
      .select()
      .single()

    if (error) {
      console.error('Error updating company:', error)
      return res.status(500).json({ error: 'Kunne ikke opdatere virksomhed' })
    }

    return res.status(200).json({ company: data })
  } catch (error) {
    console.error('Error updating company:', error)
    return res.status(500).json({ error: 'Serverfejl' })
  }
}
