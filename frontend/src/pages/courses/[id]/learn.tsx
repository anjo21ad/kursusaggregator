/**
 * /courses/[id]/learn
 *
 * Course learning page - displays CoursePlayer with full content
 *
 * Only accessible to users who have purchased the course
 */

import { GetServerSideProps } from 'next';
import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { fetchCourseById } from '@/lib/database-adapter';
import { supabase } from '@/lib/supabaseClient';
import CoursePlayer from '@/components/course/CoursePlayer';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

type ExtendedCourse = {
  id: number;
  title: string;
  description: string;
  level: string;
  duration: string;
  curriculumJson: any; // ExtendedCourseCurriculum
  category: {
    name: string;
  };
};

type Props = {
  course: ExtendedCourse;
  hasAccess: boolean;
};

export default function LearnPage({ course, hasAccess }: Props) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);

  // Handle progress updates
  const handleProgressUpdate = async (
    sectionNumber: number,
    completed: boolean,
    quizScore?: number
  ) => {
    setIsSaving(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        console.error('[learn] No session found');
        return;
      }

      // Call progress API
      const response = await fetch(`/api/course-progress/${course.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          sectionNumber,
          completed,
          quizScore,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save progress');
      }

      console.log('[learn] Progress saved:', { sectionNumber, completed, quizScore });
    } catch (error) {
      console.error('[learn] Error saving progress:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Access denied
  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navigation />

        <div className="flex-1 flex items-center justify-center px-6">
          <div className="max-w-md text-center">
            <div className="text-6xl mb-6">🔒</div>
            <h1 className="text-3xl font-bold text-text-light mb-4">
              Ingen adgang
            </h1>
            <p className="text-text-muted mb-8">
              Du skal købe dette kursus for at få adgang til indholdet.
            </p>
            <div className="space-y-3">
              <Link
                href={`/courses/${course.id}`}
                className="block px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark transition-all"
              >
                Se kursusdetaljer
              </Link>
              <Link
                href="/"
                className="block px-6 py-3 bg-card border border-secondary text-secondary rounded-xl font-semibold hover:bg-secondary hover:text-white transition-all"
              >
                Tilbage til forsiden
              </Link>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    );
  }

  // No curriculum generated yet
  if (!course.curriculumJson || !course.curriculumJson.sections) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navigation />

        <div className="flex-1 flex items-center justify-center px-6">
          <div className="max-w-md text-center">
            <div className="text-6xl mb-6">⏳</div>
            <h1 className="text-3xl font-bold text-text-light mb-4">
              Indhold under generering
            </h1>
            <p className="text-text-muted mb-8">
              Kursusindholdet genereres lige nu. Dette kan tage et par minutter.
              Prøv at genindlæse siden om lidt.
            </p>
            <button
              onClick={() => router.reload()}
              className="px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark transition-all"
            >
              Genindlæs side
            </button>
          </div>
        </div>

        <Footer />
      </div>
    );
  }

  // Show course player
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />

      {/* Header */}
      <div className="bg-card border-b border-text-muted/20">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href={`/courses/${course.id}`}
                className="text-text-muted hover:text-text-light transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M15 19l-7-7 7-7" />
                </svg>
              </Link>

              <div>
                <span className="text-xs text-text-muted">
                  {course.category.name} • {course.level}
                </span>
                <h1 className="text-xl font-bold text-text-light">{course.title}</h1>
              </div>
            </div>

            {isSaving && (
              <div className="flex items-center gap-2 text-text-muted">
                <svg
                  className="animate-spin h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span className="text-sm">Gemmer...</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Course Player */}
      <div className="flex-1">
        <CoursePlayer
          curriculum={course.curriculumJson}
          courseId={course.id}
          onProgressUpdate={handleProgressUpdate}
        />
      </div>

      <Footer />
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const id = Number(context.params?.id);

  if (isNaN(id)) {
    return {
      notFound: true,
    };
  }

  // Fetch course
  const course = await fetchCourseById(id);

  if (!course) {
    return {
      notFound: true,
    };
  }

  // Check user access (server-side)
  const { req } = context;
  const authHeader = req.headers.authorization || req.headers.cookie;

  let hasAccess = false;

  if (authHeader) {
    try {
      // Extract token from cookie if present
      let token = authHeader;
      if (authHeader.includes('sb-access-token=')) {
        const match = authHeader.match(/sb-access-token=([^;]+)/);
        if (match) {
          token = match[1];
        }
      }

      // Verify user has access via API
      const apiUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
      const response = await fetch(`${apiUrl}/api/has-access?courseId=${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        hasAccess = data.access || false;
      }
    } catch (error) {
      console.error('[learn] Error checking access:', error);
    }
  }

  // For Phase 1: All AI-generated courses are FREE - grant access automatically
  if (course.priceCents === 0) {
    hasAccess = true;
  }

  return {
    props: {
      course: {
        id: course.id,
        title: course.title,
        description: course.description,
        level: course.level,
        duration: course.duration,
        curriculumJson: course.curriculumJson,
        category: course.category,
      },
      hasAccess,
    },
  };
};
