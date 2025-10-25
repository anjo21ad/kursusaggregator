/**
 * Hybrid Database Adapter
 *
 * Provides intelligent fallback between Supabase REST API and Prisma:
 * - READ queries → Supabase REST API (works over HTTPS, bypasses network/firewall issues)
 * - WRITE queries → Prisma (type-safety, migrations, transactions)
 *
 * This aligns with our MVP-first approach while maintaining Prisma commitment for long-term.
 */

import { createClient } from '@supabase/supabase-js';
import { prisma } from './prisma';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type CourseWithRelations = {
  id: number;
  title: string;
  description: string;
  shortDesc: string | null;
  priceCents: number;
  duration: string | null;
  maxParticipants: number | null;
  location: string | null;
  language: string;
  level: string | null;
  status: string;
  isActive: boolean;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  providerId: number;
  categoryId: number;
  provider?: {
    id?: number;
    companyName: string;
    website?: string | null;
  } | null;
  category?: {
    id?: number;
    name: string;
    icon?: string | null;
    color?: string | null;
  } | null;
};

export type ProviderWithRelations = {
  id: number;
  companyName: string;
  contactEmail: string;
  contactPhone: string | null;
  status: string;
  createdAt: string;
  userId: string;
};

export type PurchaseWithRelations = {
  id: number;
  userId: string;
  courseId: number;
  priceCents: number;
  createdAt: string;
  course?: {
    id: number;
    title: string;
  } | null;
  user?: {
    email: string;
  } | null;
};

export type AdminStatsOverview = {
  totalCourses: number;
  totalProviders: number;
  totalUsers: number;
  totalPurchases: number;
  totalRevenue: number;
  pendingCourses: number;
  pendingProviders: number;
  publishedCourses: number;
};

export type AdminStats = {
  overview: AdminStatsOverview;
  recentActivity: {
    recentPurchases: PurchaseWithRelations[];
    recentCourses: CourseWithRelations[];
  };
  pendingItems: {
    pendingCourses: CourseWithRelations[];
    pendingProviders: ProviderWithRelations[];
  };
  revenueChart: any[];
  topCourses: any[];
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Normalize Supabase nested object responses
 * Supabase REST API may return nested objects as arrays or objects
 */
function normalizeSupabaseRelation<T>(data: T | T[] | null | undefined): T | null {
  if (!data) return null;
  if (Array.isArray(data)) return data[0] || null;
  return data;
}

/**
 * Convert Supabase date strings to ISO strings (for Next.js serialization)
 */
function parseDate(dateString: string | Date | null | undefined): string | null {
  if (!dateString) return null;
  try {
    // Handle both Date objects and date strings
    const date = dateString instanceof Date ? dateString : new Date(dateString);
    return date.toISOString();
  } catch {
    return null;
  }
}

// ============================================================================
// COURSE QUERIES
// ============================================================================

/**
 * Fetch all published courses (for homepage)
 */
export async function fetchPublishedCourses(): Promise<CourseWithRelations[]> {
  console.log('📚 fetchPublishedCourses - using Supabase REST API');

  try {
    const { data, error } = await supabase
      .from('courses')
      .select(`
        id,
        title,
        description,
        shortDesc,
        priceCents,
        duration,
        maxParticipants,
        location,
        language,
        level,
        status,
        isActive,
        publishedAt,
        createdAt,
        updatedAt,
        providerId,
        categoryId,
        category:categories(id, name, icon, color),
        provider:providers(id, companyName)
      `)
      .eq('status', 'PUBLISHED')
      .eq('isActive', true)
      .order('id', { ascending: false });

    if (error) {
      console.error('Supabase fetchPublishedCourses error:', error);
      return [];
    }

    return (data || []).map((course: any) => ({
      ...course,
      publishedAt: parseDate(course.publishedAt),
      createdAt: parseDate(course.createdAt) || new Date().toISOString().toISOString(),
      updatedAt: parseDate(course.updatedAt) || new Date().toISOString().toISOString(),
      category: normalizeSupabaseRelation(course.category),
      provider: normalizeSupabaseRelation(course.provider),
    }));
  } catch (err) {
    console.error('fetchPublishedCourses exception:', err);
    return [];
  }
}

/**
 * Fetch courses for AI matching with optional filters
 */
export async function fetchCoursesForAI(options: {
  limit?: number;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  language?: string;
} = {}): Promise<CourseWithRelations[]> {
  const {
    limit = 50,
    category,
    minPrice,
    maxPrice,
    language = 'da',
  } = options;

  console.log('🤖 fetchCoursesForAI - using Supabase REST API with filters:', options);

  try {
    let query = supabase
      .from('courses')
      .select(`
        id,
        title,
        description,
        shortDesc,
        priceCents,
        duration,
        maxParticipants,
        location,
        language,
        level,
        status,
        isActive,
        publishedAt,
        createdAt,
        updatedAt,
        providerId,
        categoryId,
        category:categories(id, name, slug, icon, color),
        provider:providers(id, companyName, status)
      `)
      .eq('status', 'PUBLISHED')
      .eq('isActive', true)
      .eq('provider.status', 'APPROVED'); // Only approved providers

    // Apply optional filters
    if (category) {
      query = query.eq('category.slug', category);
    }
    if (minPrice) {
      query = query.gte('priceCents', minPrice * 100);
    }
    if (maxPrice) {
      query = query.lte('priceCents', maxPrice * 100);
    }
    if (language) {
      query = query.eq('language', language);
    }

    // Apply limit and ordering
    query = query
      .order('publishedAt', { ascending: false })
      .limit(limit);

    const { data, error } = await query;

    if (error) {
      console.error('Supabase fetchCoursesForAI error:', error);
      return [];
    }

    return (data || []).map((course: any) => ({
      ...course,
      publishedAt: parseDate(course.publishedAt),
      createdAt: parseDate(course.createdAt) || new Date().toISOString(),
      updatedAt: parseDate(course.updatedAt) || new Date().toISOString(),
      category: normalizeSupabaseRelation(course.category),
      provider: normalizeSupabaseRelation(course.provider),
    }));
  } catch (err) {
    console.error('fetchCoursesForAI exception:', err);
    return [];
  }
}

/**
 * Fetch single course by ID (for course detail page)
 */
export async function fetchCourseById(id: number): Promise<CourseWithRelations | null> {
  console.log(`📖 fetchCourseById(${id}) - using Supabase REST API`);

  try {
    const { data: course, error } = await supabase
      .from('courses')
      .select(`
        id,
        title,
        description,
        shortDesc,
        priceCents,
        duration,
        maxParticipants,
        location,
        language,
        level,
        status,
        isActive,
        publishedAt,
        createdAt,
        updatedAt,
        providerId,
        categoryId,
        category:categories(id, name, icon, color),
        provider:providers(id, companyName, website)
      `)
      .eq('id', id)
      .single();

    if (error || !course) {
      console.error('Supabase fetchCourseById error:', error);
      return null;
    }

    return {
      ...course,
      publishedAt: parseDate(course.publishedAt),
      createdAt: parseDate(course.createdAt) || new Date().toISOString(),
      updatedAt: parseDate(course.updatedAt) || new Date().toISOString(),
      category: normalizeSupabaseRelation(course.category),
      provider: normalizeSupabaseRelation(course.provider),
    };
  } catch (err) {
    console.error('fetchCourseById exception:', err);
    return null;
  }
}

/**
 * Fetch user's purchased courses
 */
export async function fetchUserCourses(userId: string): Promise<CourseWithRelations[]> {
  console.log(`🎓 fetchUserCourses(${userId}) - using Supabase REST API`);

  try {
    // First get user's purchases
    const { data: purchases, error: purchasesError } = await supabase
      .from('purchases')
      .select('courseId')
      .eq('userId', userId);

    if (purchasesError || !purchases || purchases.length === 0) {
      console.error('Supabase fetchUserCourses error:', purchasesError);
      return [];
    }

    const courseIds = purchases.map(p => p.courseId);

    // Then get course details
    const { data: courses, error: coursesError } = await supabase
      .from('courses')
      .select(`
        id,
        title,
        description,
        shortDesc,
        priceCents,
        duration,
        maxParticipants,
        location,
        language,
        level,
        status,
        isActive,
        publishedAt,
        createdAt,
        updatedAt,
        providerId,
        categoryId,
        category:categories(id, name, icon, color),
        provider:providers(id, companyName)
      `)
      .in('id', courseIds);

    if (coursesError || !courses) {
      console.error('Supabase courses fetch error:', coursesError);
      return [];
    }

    return courses.map((course: any) => ({
      ...course,
      publishedAt: parseDate(course.publishedAt),
      createdAt: parseDate(course.createdAt) || new Date().toISOString(),
      updatedAt: parseDate(course.updatedAt) || new Date().toISOString(),
      category: normalizeSupabaseRelation(course.category),
      provider: normalizeSupabaseRelation(course.provider),
    }));
  } catch (err) {
    console.error('fetchUserCourses exception:', err);
    return [];
  }
}

// ============================================================================
// CATEGORY QUERIES
// ============================================================================

/**
 * Fetch active categories with course counts
 */
export async function fetchActiveCategories() {
  console.log('📂 fetchActiveCategories - using Supabase REST API');

  try {
    const { data: categories, error } = await supabase
      .from('categories')
      .select('id, name, slug, icon, color, sortOrder')
      .eq('isActive', true)
      .order('sortOrder', { ascending: true });

    if (error) {
      console.error('Supabase fetchActiveCategories error:', error);
      return [];
    }

    // Get course counts for each category
    const categoriesWithCounts = await Promise.all(
      (categories || []).map(async (category) => {
        const { count } = await supabase
          .from('courses')
          .select('*', { count: 'exact', head: true })
          .eq('categoryId', category.id)
          .eq('status', 'PUBLISHED')
          .eq('isActive', true);

        return {
          ...category,
          _count: {
            courses: count || 0,
          },
        };
      })
    );

    return categoriesWithCounts;
  } catch (err) {
    console.error('fetchActiveCategories exception:', err);
    return [];
  }
}

// ============================================================================
// ADMIN STATISTICS
// ============================================================================

/**
 * Fetch comprehensive admin dashboard statistics
 */
export async function fetchAdminStats(): Promise<AdminStats> {
  console.log('📊 fetchAdminStats - using Supabase REST API');

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
        priceCents,
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
        description,
        shortDesc,
        priceCents,
        duration,
        maxParticipants,
        location,
        language,
        level,
        status,
        isActive,
        publishedAt,
        createdAt,
        updatedAt,
        providerId,
        categoryId,
        provider:providers(id, companyName)
      `)
      .order('createdAt', { ascending: false })
      .limit(5);

    // Get pending courses list
    const { data: pendingCoursesList } = await supabase
      .from('courses')
      .select(`
        id,
        title,
        description,
        shortDesc,
        priceCents,
        duration,
        maxParticipants,
        location,
        language,
        level,
        status,
        isActive,
        publishedAt,
        createdAt,
        updatedAt,
        providerId,
        categoryId,
        provider:providers(id, companyName)
      `)
      .eq('status', 'PENDING')
      .order('createdAt', { ascending: false })
      .limit(10);

    // Get pending providers list
    const { data: pendingProvidersList } = await supabase
      .from('providers')
      .select('id, companyName, contactEmail, contactPhone, status, createdAt, userId')
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
          userId: '',
          courseId: 0,
          priceCents: p.priceCents,
          createdAt: parseDate(p.createdAt) || new Date().toISOString(),
          course: normalizeSupabaseRelation(p.course),
          user: normalizeSupabaseRelation(p.user),
        })),
        recentCourses: (recentCourses || []).map(c => ({
          ...c,
          publishedAt: parseDate(c.publishedAt),
          createdAt: parseDate(c.createdAt) || new Date().toISOString(),
          updatedAt: parseDate(c.updatedAt) || new Date().toISOString(),
          provider: normalizeSupabaseRelation(c.provider),
          category: null,
        })),
      },
      pendingItems: {
        pendingCourses: (pendingCoursesList || []).map(c => ({
          ...c,
          publishedAt: parseDate(c.publishedAt),
          createdAt: parseDate(c.createdAt) || new Date().toISOString(),
          updatedAt: parseDate(c.updatedAt) || new Date().toISOString(),
          provider: normalizeSupabaseRelation(c.provider),
          category: null,
        })),
        pendingProviders: (pendingProvidersList || []).map(p => ({
          ...p,
          contactPhone: p.contactPhone || null,
          createdAt: parseDate(p.createdAt) || new Date().toISOString(),
        })),
      },
      revenueChart: [],
      topCourses: [],
    };
  } catch (error) {
    console.error('fetchAdminStats error:', error);
    throw error;
  }
}

// ============================================================================
// ACCESS CHECKS
// ============================================================================

/**
 * Check if user has purchased a course
 */
export async function checkCourseAccess(userId: string, courseId: number): Promise<boolean> {
  console.log(`🔐 checkCourseAccess(${userId}, ${courseId}) - using Supabase REST API`);

  try {
    const { data, error } = await supabase
      .from('purchases')
      .select('id')
      .eq('userId', userId)
      .eq('courseId', courseId)
      .limit(1);

    if (error) {
      console.error('Supabase checkCourseAccess error:', error);
      return false;
    }

    return data && data.length > 0;
  } catch (err) {
    console.error('checkCourseAccess exception:', err);
    return false;
  }
}

// ============================================================================
// USER QUERIES
// ============================================================================

/**
 * Fetch user profile by ID
 */
export async function fetchUserProfile(userId: string) {
  console.log(`👤 fetchUserProfile(${userId}) - using Supabase REST API`);

  try {
    const { data: user, error } = await supabase
      .from('users')
      .select(`
        id,
        email,
        firstName,
        lastName,
        role,
        isActive,
        createdAt,
        companyId,
        company:companies(id, name, email, cvr),
        provider:providers(id, companyName, status, contactEmail)
      `)
      .eq('id', userId)
      .single();

    if (error || !user) {
      console.error('Supabase fetchUserProfile error:', error);
      return null;
    }

    return {
      ...user,
      createdAt: parseDate(user.createdAt) || new Date().toISOString(),
      company: normalizeSupabaseRelation(user.company),
      provider: normalizeSupabaseRelation(user.provider),
    };
  } catch (err) {
    console.error('fetchUserProfile exception:', err);
    return null;
  }
}

// ============================================================================
// WRITE OPERATIONS (Use Prisma for type-safety and migrations)
// ============================================================================

/**
 * Create a new purchase (WRITE operation - uses Prisma)
 */
export async function createPurchase(data: {
  userId: string;
  courseId: number;
  priceCents: number;
}) {
  console.log('💳 createPurchase - using Prisma');
  return prisma.purchase.create({ data });
}

/**
 * Update course status (WRITE operation - uses Prisma)
 */
export async function updateCourseStatus(courseId: number, status: string) {
  console.log(`✏️  updateCourseStatus(${courseId}) - using Prisma`);
  return prisma.course.update({
    where: { id: courseId },
    data: { status },
  });
}

/**
 * Update provider status (WRITE operation - uses Prisma)
 */
export async function updateProviderStatus(providerId: number, status: string) {
  console.log(`✏️  updateProviderStatus(${providerId}) - using Prisma`);
  return prisma.provider.update({
    where: { id: providerId },
    data: { status },
  });
}
