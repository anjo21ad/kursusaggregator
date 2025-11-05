/**
 * Course Generator
 *
 * Auto-generates complete courses from approved trend proposals using Claude AI
 *
 * Phase 1: Text-only content (no video, no podcast)
 * Target: <$1 per course, <2 hours generation time
 */

import { generateJSON } from './client';
import { CURRICULUM_SYSTEM_PROMPT, getCurriculumPrompt } from './prompts';
import https from 'https';

// ============================================================================
// TYPES
// ============================================================================

type TrendProposal = {
  id: string;
  title: string;
  description: string;
  keywords: string[];
  sourceUrl: string;
  aiCourseProposal: {
    relevanceScore: number;
    suggestedCourseTitle: string;
    suggestedDescription: string;
    keywords: string[];
    estimatedDurationMinutes: number;
  };
};

type CourseSection = {
  sectionNumber: number;
  title: string;
  description: string;
  learningObjectives: string[];
  estimatedMinutes: number;
  topics: string[];
};

type CourseCurriculum = {
  courseTitle: string;
  courseDescription: string;
  estimatedDuration: number;
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  sections: CourseSection[];
};

type GeneratedCourse = {
  title: string;
  description: string;
  duration: number;
  level: string;
  curriculumJson: CourseCurriculum;
  totalCost: number;
  generationTimeSeconds: number;
};

// ============================================================================
// COURSE GENERATION
// ============================================================================

/**
 * Generate complete course from approved trend proposal
 * 
 * Phase 1: Only generates curriculum (text content + quiz generation in Phase 2)
 */
export async function generateCourseFromProposal(
  proposal: TrendProposal
): Promise<GeneratedCourse> {
  const startTime = Date.now();
  let totalCost = 0;

  console.log(`[course-generator] Starting generation for: ${proposal.title}`);

  // Step 1: Generate curriculum
  console.log('[course-generator] Step 1/1: Generating curriculum...');

  const curriculum = await generateCurriculum(proposal);
  totalCost += curriculum.usage.totalCost;

  console.log('[course-generator] ✅ Curriculum generated');
  console.log(`[course-generator] - ${curriculum.data.sections.length} sections`);
  console.log(`[course-generator] - ${curriculum.data.estimatedDuration} minutes total`);
  console.log(`[course-generator] - Cost so far: $${totalCost.toFixed(4)}`);

  // TODO Phase 2: Generate section content and quizzes

  const generationTimeSeconds = Math.round((Date.now() - startTime) / 1000);

  console.log('[course-generator] ✅ Generation complete!');
  console.log(`[course-generator] Total cost: $${totalCost.toFixed(4)}`);
  console.log(`[course-generator] Generation time: ${generationTimeSeconds}s`);

  return {
    title: curriculum.data.courseTitle,
    description: curriculum.data.courseDescription,
    duration: curriculum.data.estimatedDuration,
    level: curriculum.data.level,
    curriculumJson: curriculum.data,
    totalCost,
    generationTimeSeconds,
  };
}

/**
 * Generate course curriculum using Claude AI
 */
async function generateCurriculum(proposal: TrendProposal) {
  const systemPrompt = CURRICULUM_SYSTEM_PROMPT;
  const userPrompt = getCurriculumPrompt(
    proposal.aiCourseProposal.suggestedCourseTitle || proposal.title,
    proposal.aiCourseProposal.suggestedDescription || proposal.description,
    proposal.aiCourseProposal.keywords || proposal.keywords,
    proposal.sourceUrl
  );

  return await generateJSON<CourseCurriculum>(
    systemPrompt,
    userPrompt,
    4000 // Max tokens for curriculum
  );
}

// ============================================================================
// DATABASE OPERATIONS (Supabase REST API)
// ============================================================================

/**
 * Create course record in Supabase
 */
export async function saveCourseToDatabase(
  proposalId: string,
  generatedCourse: GeneratedCourse
): Promise<string> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase credentials');
  }

  console.log('[course-generator] Saving course to database...');

  // Generate UUID for course
  const courseId = crypto.randomUUID();

  // Prepare course data
  const courseData = {
    id: courseId,
    title: generatedCourse.title,
    description: generatedCourse.description,
    shortDesc: generatedCourse.description.substring(0, 150),
    duration: `${generatedCourse.duration} minutter`,
    level: generatedCourse.level,
    curriculumJson: generatedCourse.curriculumJson,
    priceCents: 0, // Phase 1-3: Free courses
    status: 'PUBLISHED',
    isAIGenerated: true,
    aiModel: 'claude-sonnet-4-20250514',
    generationCostUsd: generatedCourse.totalCost,
    generationTimeMinutes: Math.round(generatedCourse.generationTimeSeconds / 60),
    language: 'da',
    maxParticipants: 1000,
    categoryId: 1, // TODO: Map from keywords to category
    providerId: null, // AI-generated courses have no provider
  };

  // Insert course via REST API
  const url = new URL('/rest/v1/courses', supabaseUrl);

  const courseResult = await new Promise<unknown>((resolve, reject) => {
    const options = {
      hostname: url.hostname,
      port: 443,
      path: url.pathname + url.search,
      method: 'POST',
      headers: {
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
      },
      timeout: 10000,
    };

    const request = https.request(options, (response) => {
      let body = '';
      response.on('data', (chunk) => (body += chunk));
      response.on('end', () => {
        if (response.statusCode && response.statusCode >= 200 && response.statusCode < 300) {
          resolve(JSON.parse(body));
        } else {
          reject(new Error(`HTTP ${response.statusCode}: ${body}`));
        }
      });
    });

    request.on('error', reject);
    request.on('timeout', () => {
      request.destroy();
      reject(new Error('Request timeout'));
    });

    request.write(JSON.stringify(courseData));
    request.end();
  });

  const createdCourse = Array.isArray(courseResult) ? courseResult[0] : courseResult;

  console.log(`[course-generator] ✅ Course saved: ${createdCourse.id}`);

  // Update TrendProposal with generated course ID and status
  await updateProposalStatus(proposalId, 'PUBLISHED', createdCourse.id);

  return createdCourse.id;
}

/**
 * Update TrendProposal status and link to generated course
 */
async function updateProposalStatus(
  proposalId: string,
  status: string,
  generatedCourseId?: string
): Promise<void> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase credentials');
  }

  const url = new URL(`/rest/v1/trend_proposals?id=eq.${proposalId}`, supabaseUrl);

  const updateData: {
    status: string;
    updatedAt: string;
    generatedCourseId?: string;
  } = {
    status,
    updatedAt: new Date().toISOString(),
  };

  if (generatedCourseId) {
    updateData.generatedCourseId = generatedCourseId;
  }

  await new Promise<void>((resolve, reject) => {
    const options = {
      hostname: url.hostname,
      port: 443,
      path: url.pathname + url.search,
      method: 'PATCH',
      headers: {
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    };

    const request = https.request(options, (response) => {
      let body = '';
      response.on('data', (chunk) => (body += chunk));
      response.on('end', () => {
        if (response.statusCode && response.statusCode >= 200 && response.statusCode < 300) {
          resolve();
        } else {
          reject(new Error(`HTTP ${response.statusCode}: ${body}`));
        }
      });
    });

    request.on('error', reject);
    request.on('timeout', () => {
      request.destroy();
      reject(new Error('Request timeout'));
    });

    request.write(JSON.stringify(updateData));
    request.end();
  });

  console.log(`[course-generator] ✅ Proposal status updated: ${status}`);
}
