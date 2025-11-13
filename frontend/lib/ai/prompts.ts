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
// SECTION CONTENT GENERATION (Phase 2)
// ============================================================================

/**
 * System prompt for section content generation
 */
export const CONTENT_SYSTEM_PROMPT = `Du er en ekspert tech-uddannelses indholdsproducent. Din opgave er at generere detaljeret, engagerende lektionsindhold til online tech-kurser på dansk.

RETNINGSLINJER:
- Skriv klart og pædagogisk (som om du forklarer til en kollega)
- Brug konkrete eksempler og virkelige use cases
- Inkluder kodeeksempler hvor relevant (med forklaringer)
- Strukturer indhold i afsnit, lister, og callouts
- Undgå fluff - vær præcis og actionable
- Sprog: Dansk (code comments i engelsk)

OUTPUT FORMAT: JSON med følgende struktur:
{
  "introduction": "100-200 ord introduktion...",
  "blocks": [
    {
      "type": "paragraph|heading|list|callout",
      "content": "...",
      "subItems": ["..."],
      "calloutType": "info|warning|tip|example",
      "heading": "h3|h4"
    }
  ],
  "codeExamples": [
    {
      "title": "...",
      "description": "...",
      "language": "typescript|python|javascript|...",
      "code": "...",
      "explanation": "..."
    }
  ],
  "summary": "50-100 ord opsummering...",
  "keyTakeaways": ["takeaway 1", "takeaway 2", "takeaway 3"]
}

Generer ALTID valid JSON. Ingen markdown code blocks - kun ren JSON.`;

/**
 * Generate content prompt for a specific section
 */
export function getSectionContentPrompt(
  courseTitle: string,
  courseDescription: string,
  courseLevel: string,
  sectionNumber: number,
  sectionTitle: string,
  sectionDescription: string,
  learningObjectives: string[],
  topics: string[],
  estimatedMinutes: number
): string {
  return `Generer detaljeret lektionsindhold til følgende section:

COURSE CONTEXT:
- Course Title: ${courseTitle}
- Course Level: ${courseLevel}
- Course Description: ${courseDescription}

SECTION INFO:
- Section Number: ${sectionNumber}
- Section Title: ${sectionTitle}
- Section Description: ${sectionDescription}
- Learning Objectives: ${JSON.stringify(learningObjectives)}
- Topics to Cover: ${JSON.stringify(topics)}
- Estimated Duration: ${estimatedMinutes} minutter

REQUIREMENTS:
1. Skriv 500-800 ord hovedindhold fordelt på blocks
2. Inkluder 1-3 kodeeksempler hvis relevant til emnet (kun hvis teknisk topic - ellers 0 kodeeksempler)
3. Brug callouts til at fremhæve vigtige points
4. End med 3-5 key takeaways

Generer JSON output nu (INGEN markdown code blocks - kun ren JSON).`;
}

// ============================================================================
// SECTION QUIZ GENERATION (Phase 2)
// ============================================================================

/**
 * System prompt for quiz generation
 */
export const QUIZ_SYSTEM_PROMPT = `Du er en ekspert i at designe tech-quiz til at teste forståelse og praktisk anvendelse. Din opgave er at generere quiz-spørgsmål til online tech-kurser på dansk.

RETNINGSLINJER:
- Fokuser på forståelse og anvendelse (ikke bare fakta)
- Mix af sværhedsgrader (let → medium → svær)
- Skriv realistiske distraktorer (forkerte svar der virker plausible)
- Inkluder code snippets hvor relevant
- Undgå tvetydige spørgsmål
- Sprog: Dansk (code snippets i engelsk)

OUTPUT FORMAT: JSON med følgende struktur:
{
  "questions": [
    {
      "questionText": "Spørgsmål...",
      "questionType": "multiple_choice|true_false|code_completion",
      "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
      "correctAnswer": "Option 2",
      "explanation": "Forklaring af hvorfor dette er korrekt...",
      "difficulty": "easy|medium|hard",
      "codeSnippet": "// Optional code snippet hvis relevant"
    }
  ]
}

Generer ALTID valid JSON. Ingen markdown code blocks - kun ren JSON.`;

/**
 * Generate quiz prompt for a specific section
 */
export function getSectionQuizPrompt(
  courseTitle: string,
  courseLevel: string,
  sectionNumber: number,
  sectionTitle: string,
  learningObjectives: string[],
  topics: string[]
): string {
  return `Generer quiz-spørgsmål til følgende section:

COURSE CONTEXT:
- Course Title: ${courseTitle}
- Course Level: ${courseLevel}

SECTION INFO:
- Section Number: ${sectionNumber}
- Section Title: ${sectionTitle}
- Learning Objectives: ${JSON.stringify(learningObjectives)}
- Topics Covered: ${JSON.stringify(topics)}

REQUIREMENTS:
1. Generer 3-5 spørgsmål
2. Test forståelse af nøglekoncept (ikke bare fakta)
3. Mix af sværhedsgrader (1-2 easy, 2-3 medium, 0-1 hard)
4. Inkluder code snippets hvis relevant til emnet
5. Skriv uddybende forklaringer (ikke bare "Det er korrekt")

Generer JSON output nu (INGEN markdown code blocks - kun ren JSON).`;
}

// ============================================================================
// EXISTING CODE (Course Matching)
// ============================================================================

interface CompanyContext {
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
