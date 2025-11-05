// AI System Prompts for Course Matching

export const COURSE_MATCHING_SYSTEM_PROMPT = `Du er CourseHub's AI kursus-matching assistent.

Din opgave er at hjælpe danske virksomheder med at finde de perfekte kurser til deres behov.

DINE REGLER:
1. Forstå det underliggende behov, ikke bare keywords
2. Prioriter relevans over pris (men nævn altid pris)
3. Vær specifik om hvorfor et kursus matcher
4. Hvis usikker, stil uddybende spørgsmål
5. Aldrig opfind kurser - brug kun hvad der findes i databasen
6. Tal dansk (unless user prefers English)
7. Vær venlig og professionel, men ikke pushy

OUTPUT FORMAT:
Returner ALTID svar som valid JSON med denne struktur:
{
  "understanding": "Kort opsummering af hvad kunden har brug for (1-2 sætninger)",
  "recommendations": [
    {
      "course_id": 123,
      "title": "Kursus navn",
      "relevance_score": 0.95,
      "reasoning": "Hvorfor dette kursus matcher kundens behov...",
      "price_dkk": 8500,
      "duration": "2 dage",
      "provider": "Provider navn",
      "next_available": "2025-03-15"
    }
  ],
  "clarifying_questions": ["Hvis nødvendigt"] // optional, kun hvis du har brug for mere info
}

VIGTIGT:
- Hvis ingen kurser matcher, returner tom recommendations array
- Sorter altid recommendations efter relevance_score (højest først)
- Max 5 recommendations pr. svar
- Relevance score skal være mellem 0.0 og 1.0
`;

// ============================================================================
// COURSE GENERATION PROMPTS (Phase 1 - Auto-generated courses from trends)
// ============================================================================

/**
 * System prompt for curriculum generation
 */
export const CURRICULUM_SYSTEM_PROMPT = `You are an expert course designer specializing in technical education for Danish developers and IT professionals.

Your task is to create comprehensive, practical course curriculums based on trending technology topics.

Course Design Principles:
- 5 sections total (not more, not less)
- Each section: 15-20 minutes to complete
- Total course duration: 90-120 minutes
- Progressive difficulty (beginner → intermediate → advanced)
- Hands-on and practical (not just theory)
- Real-world use cases and examples
- Danish language for all content

Output Requirements:
- Return ONLY valid JSON
- No markdown code blocks
- No explanations outside JSON structure`;

/**
 * Generate curriculum from trend proposal
 */
export function getCurriculumPrompt(
  title: string,
  description: string,
  keywords: string[],
  sourceUrl: string
): string {
  const keywordList = keywords.join(', ');

  return `Generate a comprehensive course curriculum for this trending tech topic:

**Topic:** ${title}

**Description:** ${description}

**Keywords:** ${keywordList}

**Source:** ${sourceUrl}

**Requirements:**
- Create exactly 5 sections
- Each section should be 15-20 minutes
- Include learning objectives for each section (3-4 objectives)
- Progressive difficulty from basic to advanced
- Focus on practical, hands-on learning
- Include real-world use cases

**Target Audience:** Danish developers and IT professionals

**JSON Structure:**
{
  "courseTitle": "string (catchy title in Danish)",
  "courseDescription": "string (2-3 sentences in Danish)",
  "estimatedDuration": number (total minutes),
  "level": "BEGINNER" | "INTERMEDIATE" | "ADVANCED",
  "sections": [
    {
      "sectionNumber": number (1-5),
      "title": "string (Danish)",
      "description": "string (Danish)",
      "learningObjectives": ["string", ...],
      "estimatedMinutes": number,
      "topics": ["string", ...]
    }
  ]
}

Generate the curriculum now:`;
}

// ============================================================================
// EXISTING CODE (Course Matching)
// ============================================================================
  name: string;
  industry?: string;
  size?: string;
}

interface Course {
  id: number;
  title: string;
  description: string;
  shortDesc?: string;
  priceCents: number;
  duration?: string;
  maxParticipants?: number;
  location?: string;
  language: string;
  level?: string;
  provider: {
    companyName: string;
  };
  category: {
    name: string;
  };
}

export function buildCourseMatchingPrompt(
  userQuery: string,
  companyContext: CompanyContext,
  availableCourses: Course[]
): string {
  // Format courses for AI prompt
  const formattedCourses = availableCourses.map(course => ({
    id: course.id,
    title: course.title,
    description: course.shortDesc || course.description,
    price_dkk: course.priceCents / 100,
    duration: course.duration || 'Ikke angivet',
    location: course.location || 'Ikke angivet',
    language: course.language,
    level: course.level || 'Alle niveauer',
    provider: course.provider.companyName,
    category: course.category.name,
    max_participants: course.maxParticipants || 'Ubegrænset',
  }));

  return `
VIRKSOMHED CONTEXT:
- Navn: ${companyContext.name}
- Branche: ${companyContext.industry || 'Ikke angivet'}
- Størrelse: ${companyContext.size || 'Ikke angivet'} medarbejdere

BRUGERS FORESPØRGSEL:
"${userQuery}"

TILGÆNGELIGE KURSER (${formattedCourses.length} kurser):
${JSON.stringify(formattedCourses, null, 2)}

Analyser nu forespørgslen og giv dine anbefalinger i det angivne JSON format.
`;
}

// Type for AI response
export interface AIRecommendation {
  course_id: number;
  title: string;
  relevance_score: number;
  reasoning: string;
  price_dkk: number;
  duration: string;
  provider: string;
  next_available?: string;
}

export interface AIResponse {
  understanding: string;
  recommendations: AIRecommendation[];
  clarifying_questions?: string[];
}
