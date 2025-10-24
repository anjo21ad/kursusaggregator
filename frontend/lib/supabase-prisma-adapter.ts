/**
 * Supabase REST API adapter for Prisma queries
 *
 * This adapter allows Prisma-like queries to work via Supabase's REST API (PostgREST)
 * when direct PostgreSQL connection is blocked by corporate firewall.
 *
 * Works over HTTPS (port 443) instead of PostgreSQL ports (5432, 6543)
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export interface CourseWithRelations {
  id: number;
  title: string;
  description: string;
  shortDesc: string | null;
  priceCents: number;
  duration: string | null;
  location: string | null;
  level: string | null;
  status: string;
  isActive: boolean;
  category: {
    name: string;
    icon: string | null;
    color: string | null;
  };
  provider: {
    companyName: string;
  };
}

export interface CategoryWithCount {
  id: number;
  name: string;
  slug: string;
  icon: string | null;
  color: string | null;
  courses: { count: number };
}

/**
 * Fetch published courses via Supabase REST API
 */
export async function fetchPublishedCourses(): Promise<CourseWithRelations[]> {
  const { data, error } = await supabase
    .from('courses')
    .select(`
      id,
      title,
      description,
      shortDesc,
      priceCents,
      duration,
      location,
      level,
      status,
      isActive,
      category:categories(name, icon, color),
      provider:providers(companyName)
    `)
    .eq('status', 'PUBLISHED')
    .eq('isActive', true)
    .order('id', { ascending: false });

  if (error) {
    console.error('Supabase API error:', error);
    throw error;
  }

  // Transform to match Prisma structure
  return (data || []).map((course: any) => ({
    ...course,
    category: Array.isArray(course.category) ? course.category[0] : course.category,
    provider: Array.isArray(course.provider) ? course.provider[0] : course.provider,
  }));
}

/**
 * Fetch active categories with course counts via Supabase REST API
 */
export async function fetchActiveCategories(): Promise<CategoryWithCount[]> {
  const { data: categories, error } = await supabase
    .from('categories')
    .select('id, name, slug, icon, color, sortOrder')
    .eq('isActive', true)
    .order('sortOrder', { ascending: true });

  if (error) {
    console.error('Supabase API error:', error);
    throw error;
  }

  // Count courses for each category
  const categoriesWithCounts = await Promise.all(
    (categories || []).map(async (category) => {
      const { count, error: countError } = await supabase
        .from('courses')
        .select('*', { count: 'exact', head: true })
        .eq('categoryId', category.id)
        .eq('status', 'PUBLISHED')
        .eq('isActive', true);

      return {
        ...category,
        courses: { count: count || 0 },
      };
    })
  );

  return categoriesWithCounts;
}

/**
 * Check if Supabase API is accessible (for diagnostics)
 */
export async function testSupabaseConnection(): Promise<boolean> {
  try {
    const { error } = await supabase.from('courses').select('id').limit(1);
    return !error;
  } catch {
    return false;
  }
}
