/**
 * Course Generator
 *
 * Auto-generates complete courses from approved trend proposals using Claude AI
 *
 * Phase 1: Text-only content (no video, no podcast)
 * Target: <$1 per course, <2 hours generation time
 */

import { generateJSON, CLAUDE_SONNET_4, withRetry } from './client';
import {
  CURRICULUM_SYSTEM_PROMPT,
  getCurriculumPrompt,
  CONTENT_SYSTEM_PROMPT,
  getSectionContentPrompt,
  QUIZ_SYSTEM_PROMPT,
  getSectionQuizPrompt
} from './prompts';
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

type ContentBlock = {
  type: 'paragraph' | 'heading' | 'list' | 'callout';
  content: string;
  subItems?: string[];
  calloutType?: 'info' | 'warning' | 'tip' | 'example';
  heading?: 'h3' | 'h4';
};

type CodeExample = {
  title: string;
  description: string;
  language: string;
  code: string;
  explanation: string;
};

type SectionContent = {
  introduction: string;
  blocks: ContentBlock[];
  codeExamples: CodeExample[];
  summary: string;
  keyTakeaways: string[];
};

type QuizQuestion = {
  questionText: string;
  questionType: 'multiple_choice' | 'true_false' | 'code_completion';
  options: string[];
  correctAnswer: string;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  codeSnippet?: string;
};

type SectionQuiz = {
  questions: QuizQuestion[];
};

type ExtendedCourseSection = CourseSection & {
  content: SectionContent;
  quiz: SectionQuiz;
  contentGeneratedAt: string;
  contentGenerationCostUsd: number;
};

type CourseCurriculum = {
  courseTitle: string;
  courseDescription: string;
  estimatedDuration: number;
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  sections: CourseSection[];
};

type ExtendedCourseCurriculum = {
  courseTitle: string;
  courseDescription: string;
  estimatedDuration: number;
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  sections: ExtendedCourseSection[];
};

type GeneratedCourse = {
  title: string;
  description: string;
  duration: number;
  level: string;
  curriculumJson: ExtendedCourseCurriculum;
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

  // Step 1: Generate curriculum (with retry logic)
  console.log('[course-generator] Step 1/2: Generating curriculum...');

  let curriculum;
  try {
    curriculum = await withRetry(() => generateCurriculum(proposal), 3, 2000);
    totalCost += curriculum.usage.totalCost;

    console.log('[course-generator] ✅ Curriculum generated');
    console.log(`[course-generator] - ${curriculum.data.sections.length} sections`);
    console.log(`[course-generator] - ${curriculum.data.estimatedDuration} minutes total`);
    console.log(`[course-generator] - Cost so far: $${totalCost.toFixed(4)}`);
  } catch (error) {
    console.error('[course-generator] ❌ Failed to generate curriculum:', error);
    throw new Error(
      `Curriculum generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }

  // Step 2: Generate content and quiz for each section (with retry logic)
  console.log('[course-generator] Step 2/2: Generating section content and quizzes...');

  const extendedSections: ExtendedCourseSection[] = [];

  for (let i = 0; i < curriculum.data.sections.length; i++) {
    const section = curriculum.data.sections[i];
    const sectionNum = i + 1;

    console.log(`[course-generator] Processing section ${sectionNum}/${curriculum.data.sections.length}: ${section.title}`);

    try {
      // Generate content with retry logic
      const content = await withRetry(
        () => generateSectionContent(
          curriculum.data.courseTitle,
          curriculum.data.courseDescription,
          curriculum.data.level,
          section
        ),
        3, // 3 retries
        2000 // 2s base delay
      );
      totalCost += content.usage.totalCost;

      console.log(`[course-generator]   ✅ Content generated (${content.data.blocks.length} blocks, ${content.data.codeExamples.length} code examples)`);

      // Generate quiz with retry logic
      const quiz = await withRetry(
        () => generateSectionQuiz(
          curriculum.data.courseTitle,
          curriculum.data.level,
          section
        ),
        3, // 3 retries
        2000 // 2s base delay
      );
      totalCost += quiz.usage.totalCost;

      console.log(`[course-generator]   ✅ Quiz generated (${quiz.data.questions.length} questions)`);
      console.log(`[course-generator]   Cost for section ${sectionNum}: $${(content.usage.totalCost + quiz.usage.totalCost).toFixed(4)}`);

      // Build extended section
      extendedSections.push({
        ...section,
        content: content.data,
        quiz: quiz.data,
        contentGeneratedAt: new Date().toISOString(),
        contentGenerationCostUsd: content.usage.totalCost + quiz.usage.totalCost,
      });
    } catch (error) {
      console.error(`[course-generator] ❌ Failed to generate section ${sectionNum}:`, error);
      console.error(`[course-generator] Total cost before failure: $${totalCost.toFixed(4)}`);
      throw new Error(
        `Section ${sectionNum} ("${section.title}") generation failed after retries: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  }

  const generationTimeSeconds = Math.round((Date.now() - startTime) / 1000);

  console.log('[course-generator] ✅ Generation complete!');
  console.log(`[course-generator] Total cost: $${totalCost.toFixed(4)}`);
  console.log(`[course-generator] Generation time: ${generationTimeSeconds}s`);

  // Build extended curriculum
  const extendedCurriculum: ExtendedCourseCurriculum = {
    courseTitle: curriculum.data.courseTitle,
    courseDescription: curriculum.data.courseDescription,
    estimatedDuration: curriculum.data.estimatedDuration,
    level: curriculum.data.level,
    sections: extendedSections,
  };

  return {
    title: curriculum.data.courseTitle,
    description: curriculum.data.courseDescription,
    duration: curriculum.data.estimatedDuration,
    level: curriculum.data.level,
    curriculumJson: extendedCurriculum,
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
    CLAUDE_SONNET_4, // Model: claude-sonnet-4-20250514
    4000 // Max tokens for curriculum
  );
}

/**
 * Generate section content using Claude AI
 */
async function generateSectionContent(
  courseTitle: string,
  courseDescription: string,
  courseLevel: string,
  section: CourseSection
) {
  const systemPrompt = CONTENT_SYSTEM_PROMPT;
  const userPrompt = getSectionContentPrompt(
    courseTitle,
    courseDescription,
    courseLevel,
    section.sectionNumber,
    section.title,
    section.description,
    section.learningObjectives,
    section.topics,
    section.estimatedMinutes
  );

  return await generateJSON<SectionContent>(
    systemPrompt,
    userPrompt,
    CLAUDE_SONNET_4,
    4000 // Max tokens for section content
  );
}

/**
 * Generate section quiz using Claude AI
 */
async function generateSectionQuiz(
  courseTitle: string,
  courseLevel: string,
  section: CourseSection
) {
  const systemPrompt = QUIZ_SYSTEM_PROMPT;
  const userPrompt = getSectionQuizPrompt(
    courseTitle,
    courseLevel,
    section.sectionNumber,
    section.title,
    section.learningObjectives,
    section.topics
  );

  return await generateJSON<SectionQuiz>(
    systemPrompt,
    userPrompt,
    CLAUDE_SONNET_4,
    2000 // Max tokens for quiz
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
): Promise<number> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase credentials');
  }

  console.log('[course-generator] Saving course to database...');

  // Prepare course data (id is auto-generated by database)
  const courseData = {
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
  generatedCourseId?: number
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
    updateData.generatedCourseId = String(generatedCourseId);
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
