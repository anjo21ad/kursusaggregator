import type { NextApiRequest, NextApiResponse } from 'next'
import { requireAdmin } from '@/middleware/adminAuth'
import { supabase } from '@/lib/supabaseClient'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Verify admin access
  const auth = await requireAdmin(req, res)
  if (!auth) return

  if (req.method === 'GET') {
    try {
      // Fetch all users with company and provider relations
      const { data: users, error } = await supabase
        .from('users')
        .select(`
          id,
          email,
          firstName,
          lastName,
          role,
          isActive,
          createdAt,
          updatedAt,
          companyId,
          providerId,
          company:companies(id, name),
          provider:providers(id, companyName),
          purchases:purchases(count),
          leads:leads(count)
        `)
        .order('createdAt', { ascending: false })

      if (error) {
        console.error('Supabase error fetching users:', error)
        return res.status(500).json({ error: 'Kunne ikke hente brugere' })
      }

      // Transform to include counts
      const usersWithCounts = (users || []).map((user: any) => ({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        companyId: user.companyId,
        providerId: user.providerId,
        company: user.company,
        provider: user.provider,
        purchaseCount: user.purchases?.[0]?.count || 0,
        leadCount: user.leads?.[0]?.count || 0,
      }))

      return res.status(200).json({ users: usersWithCounts })
    } catch (error) {
      console.error('Error fetching users:', error)
      return res.status(500).json({ error: 'Serverfejl' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
