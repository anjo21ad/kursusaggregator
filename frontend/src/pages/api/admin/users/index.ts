import type { NextApiRequest, NextApiResponse } from 'next'
import { requireAdmin } from '@/middleware/adminAuth'
import { createClient } from '@supabase/supabase-js'

// Use service_role key for admin operations (bypasses RLS)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Verify admin access
  const auth = await requireAdmin(req, res)
  if (!auth) return

  if (req.method === 'GET') {
    try {
      // Fetch all users with company and provider relations
      const { data: users, error } = await supabaseAdmin
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
          provider:providers(id, companyName)
        `)
        .order('createdAt', { ascending: false })

      if (error) {
        console.error('Supabase error fetching users:', error)
        return res.status(500).json({ error: 'Kunne ikke hente brugere' })
      }

      // Count purchases and leads for each user
      const usersWithCounts = await Promise.all(
        (users || []).map(async (user: any) => {
          const { count: purchaseCount } = await supabaseAdmin
            .from('purchases')
            .select('*', { count: 'exact', head: true })
            .eq('userId', user.id)

          const { count: leadCount } = await supabaseAdmin
            .from('leads')
            .select('*', { count: 'exact', head: true })
            .eq('userId', user.id)

          return {
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
            purchaseCount: purchaseCount || 0,
            leadCount: leadCount || 0,
          }
        })
      )

      return res.status(200).json({ users: usersWithCounts })
    } catch (error) {
      console.error('Error fetching users:', error)
      return res.status(500).json({ error: 'Serverfejl' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
