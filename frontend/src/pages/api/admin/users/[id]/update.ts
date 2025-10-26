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
  const { firstName, lastName, role, isActive, companyId, providerId } = req.body

  try {
    const updateData: any = {}

    if (firstName !== undefined) updateData.firstName = firstName
    if (lastName !== undefined) updateData.lastName = lastName
    if (role !== undefined) updateData.role = role
    if (isActive !== undefined) updateData.isActive = isActive
    if (companyId !== undefined) updateData.companyId = companyId
    if (providerId !== undefined) updateData.providerId = providerId

    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating user:', error)
      return res.status(500).json({ error: 'Kunne ikke opdatere bruger' })
    }

    return res.status(200).json({ user: data })
  } catch (error) {
    console.error('Error updating user:', error)
    return res.status(500).json({ error: 'Serverfejl' })
  }
}
