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
