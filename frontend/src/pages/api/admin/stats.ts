import type { NextApiRequest, NextApiResponse } from 'next'
import { requireAdmin } from '@/middleware/adminAuth'
import { fetchAdminStats } from '@/lib/database-adapter'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Verify admin access
  const auth = await requireAdmin(req, res)
  if (!auth) return // Response already sent by middleware

  // Use hybrid database adapter (Supabase REST API for reliability)
  console.log('📊 Fetching admin stats via hybrid adapter');
  try {
    const stats = await fetchAdminStats();
    return res.status(200).json(stats);
  } catch (apiError) {
    console.error('Supabase API failed:', apiError);
    // Return empty stats as fallback
    return res.status(200).json({
      overview: {
        totalCourses: 0,
        totalProviders: 0,
        totalUsers: 0,
        totalPurchases: 0,
        totalRevenue: 0,
        pendingCourses: 0,
        pendingProviders: 0,
        publishedCourses: 0,
      },
      recentActivity: {
        recentPurchases: [],
        recentCourses: [],
      },
      pendingItems: {
        pendingCourses: [],
        pendingProviders: [],
      },
      revenueChart: [],
      topCourses: [],
      error: 'Kunne ikke hente data. Prøv igen senere.'
    });
  }
}
