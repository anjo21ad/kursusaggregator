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
    // Check if user has purchases
    const { data: purchases, error: purchaseError } = await supabase
      .from('purchases')
      .select('id')
      .eq('userId', id as string)
      .limit(1)

    if (purchaseError) {
      console.error('Error checking purchases:', purchaseError)
      return res.status(500).json({ error: 'Kunne ikke tjekke køb' })
    }

    if (purchases && purchases.length > 0) {
      return res.status(400).json({ error: 'Brugeren har køb og kan ikke slettes' })
    }

    // Check if user has leads
    const { data: leads, error: leadError } = await supabase
      .from('leads')
      .select('id')
      .eq('userId', id as string)
      .limit(1)

    if (leadError) {
      console.error('Error checking leads:', leadError)
      return res.status(500).json({ error: 'Kunne ikke tjekke leads' })
    }

    if (leads && leads.length > 0) {
      return res.status(400).json({ error: 'Brugeren har leads og kan ikke slettes' })
    }

    // Delete user
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id as string)

    if (error) {
      console.error('Error deleting user:', error)
      return res.status(500).json({ error: 'Kunne ikke slette bruger' })
    }

    return res.status(200).json({ message: 'Bruger slettet succesfuldt' })
  } catch (error) {
    console.error('Error deleting user:', error)
    return res.status(500).json({ error: 'Serverfejl' })
  }
}
