// Fetch and format courses for AI matching
import {
  fetchCoursesForAI as fetchCoursesFromAdapter,
  fetchCourseById,
  fetchUserProfile
} from '@/lib/database-adapter';

export interface FetchCoursesOptions {
  limit?: number;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  language?: string;
}

/**
 * Fetch published courses from database for AI matching
 * Uses hybrid database adapter (Supabase REST API for reliability)
 */
export async function fetchCoursesForAI(options: FetchCoursesOptions = {}) {
  try {
    // Use hybrid adapter instead of Prisma
    const courses = await fetchCoursesFromAdapter(options);
    return courses;
  } catch (error) {
    console.error('Error fetching courses for AI:', error);
    return []; // Return empty array instead of throwing
  }
}

/**
 * Get company context for a user
 * Uses hybrid database adapter (Supabase REST API for reliability)
 */
export async function getCompanyContext(userId: string) {
  try {
    // Use hybrid adapter instead of Prisma
    const user = await fetchUserProfile(userId);

    if (!user || !user.company) {
      return {
        name: 'Ikke angivet',
        industry: undefined,
        size: undefined,
      };
    }

    return {
      name: user.company.name,
      industry: undefined, // Add if we have industry field
      size: undefined, // Add if we have size field
    };
  } catch (error) {
    console.error('Error fetching company context:', error);
    return {
      name: 'Ikke angivet',
      industry: undefined,
      size: undefined,
    };
  }
}

/**
 * Get a specific course by ID with full details
 * Uses hybrid database adapter (Supabase REST API for reliability)
 */
export async function getCourseById(courseId: number) {
  try {
    // Use hybrid adapter instead of Prisma
    const course = await fetchCourseById(courseId);
    return course;
  } catch (error) {
    console.error('Error fetching course by ID:', error);
    return null;
  }
}
