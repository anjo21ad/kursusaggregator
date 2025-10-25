/**
 * Supabase REST API adapter for admin queries
 *
 * Provides fallback when direct PostgreSQL connection fails
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/**
 * Fetch admin dashboard stats via Supabase REST API
 */
export async function fetchAdminStats() {
  console.log('🔄 fetchAdminStats called - using Supabase REST API');
  try {
    // Get counts for overview
    const [coursesCount, providersCount, usersCount, purchasesCount] = await Promise.all([
      supabase.from('courses').select('*', { count: 'exact', head: true }),
      supabase.from('providers').select('*', { count: 'exact', head: true }),
      supabase.from('users').select('*', { count: 'exact', head: true }),
      supabase.from('purchases').select('*', { count: 'exact', head: true }),
    ]);

    // Get published courses count
    const { count: publishedCount } = await supabase
      .from('courses')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'PUBLISHED');

    // Get pending items counts
    const { count: pendingCoursesCount } = await supabase
      .from('courses')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'PENDING');

    const { count: pendingProvidersCount } = await supabase
      .from('providers')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'PENDING');

    // Get total revenue
    const { data: purchases } = await supabase
      .from('purchases')
      .select('priceCents');

    const totalRevenue = (purchases || []).reduce((sum, p) => sum + (p.priceCents || 0), 0);

    // Get recent purchases
    const { data: recentPurchases } = await supabase
      .from('purchases')
      .select(`
        id,
        createdAt,
        course:courses(id, title),
        user:users(email)
      `)
      .order('createdAt', { ascending: false })
      .limit(5);

    // Get recent courses
    const { data: recentCourses } = await supabase
      .from('courses')
      .select(`
        id,
        title,
        status,
        createdAt,
        provider:providers(companyName)
      `)
      .order('createdAt', { ascending: false })
      .limit(5);

    // Get pending courses list
    const { data: pendingCoursesList } = await supabase
      .from('courses')
      .select(`
        id,
        title,
        createdAt,
        provider:providers(companyName)
      `)
      .eq('status', 'PENDING')
      .order('createdAt', { ascending: false })
      .limit(10);

    // Get pending providers list
    const { data: pendingProvidersList } = await supabase
      .from('providers')
      .select('id, companyName, contactEmail as email, createdAt')
      .eq('status', 'PENDING')
      .order('createdAt', { ascending: false })
      .limit(10);

    // Transform data to match expected format
    return {
      overview: {
        totalCourses: coursesCount.count || 0,
        totalProviders: providersCount.count || 0,
        totalUsers: usersCount.count || 0,
        totalPurchases: purchasesCount.count || 0,
        totalRevenue: totalRevenue,
        pendingCourses: pendingCoursesCount || 0,
        pendingProviders: pendingProvidersCount || 0,
        publishedCourses: publishedCount || 0,
      },
      recentActivity: {
        recentPurchases: (recentPurchases || []).map(p => ({
          id: p.id,
          createdAt: p.createdAt,
          course: Array.isArray(p.course) ? p.course[0] : p.course,
          user: Array.isArray(p.user) ? p.user[0] : p.user,
        })),
        recentCourses: (recentCourses || []).map(c => ({
          id: c.id,
          title: c.title,
          status: c.status,
          createdAt: c.createdAt,
          provider: Array.isArray(c.provider) ? c.provider[0] : c.provider,
        })),
      },
      pendingItems: {
        pendingCourses: (pendingCoursesList || []).map(c => ({
          id: c.id,
          title: c.title,
          createdAt: c.createdAt,
          provider: Array.isArray(c.provider) ? c.provider[0] : c.provider,
        })),
        pendingProviders: pendingProvidersList || [],
      },
      revenueChart: [],
      topCourses: [],
    };
  } catch (error) {
    console.error('Supabase admin stats error:', error);
    throw error;
  }
}
