// Fetch and format courses for AI matching
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface FetchCoursesOptions {
  limit?: number;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  language?: string;
}

/**
 * Fetch published courses from database for AI matching
 * Includes provider and category information
 */
export async function fetchCoursesForAI(options: FetchCoursesOptions = {}) {
  const {
    limit = 50, // Default to 50 courses to avoid overwhelming the AI
    category,
    minPrice,
    maxPrice,
    language = 'da',
  } = options;

  try {
    const courses = await prisma.course.findMany({
      where: {
        AND: [
          { status: 'PUBLISHED' },
          { isActive: true },
          { provider: { status: 'APPROVED' } }, // Only approved providers
          ...(category ? [{ category: { slug: category } }] : []),
          ...(minPrice ? [{ priceCents: { gte: minPrice * 100 } }] : []),
          ...(maxPrice ? [{ priceCents: { lte: maxPrice * 100 } }] : []),
          ...(language ? [{ language }] : []),
        ],
      },
      include: {
        provider: {
          select: {
            id: true,
            companyName: true,
            status: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      take: limit,
      orderBy: [
        { publishedAt: 'desc' }, // Newest first
      ],
    });

    return courses;
  } catch (error) {
    console.error('Error fetching courses for AI:', error);
    throw new Error('Failed to fetch courses from database');
  }
}

/**
 * Get company context for a user
 */
export async function getCompanyContext(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        company: {
          select: {
            name: true,
            cvr: true,
            address: true,
            city: true,
          },
        },
      },
    });

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
 */
export async function getCourseById(courseId: number) {
  try {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        provider: {
          select: {
            id: true,
            companyName: true,
            contactEmail: true,
            phone: true,
            website: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    return course;
  } catch (error) {
    console.error('Error fetching course by ID:', error);
    return null;
  }
}
