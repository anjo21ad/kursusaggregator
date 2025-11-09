# n8n Content Generation Workflow - Design Dokument

## 🎯 Formål

Dette workflow genererer **komplet kursusindhold** fra godkendte TrendProposals - inklusiv detaljeret tekst, kodeeksempler, quizzer og øvelser.

**Nuværende Problem:** Eksisterende system genererer KUN curriculum outline (section titler, beskrivelser) - intet faktisk indhold at lære af.

**Løsning:** Omfattende AI content pipeline der genererer alt indhold i ét workflow.

---

## 📊 Nuværende vs. Target Datastruktur

### NUVÆRENDE Curriculum (kun outline)

```typescript
type CourseCurriculum = {
  courseTitle: string;
  courseDescription: string;
  estimatedDuration: number;
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  sections: CourseSection[];
};

type CourseSection = {
  sectionNumber: number;
  title: string;                    // ✅ Kun titel
  description: string;              // ✅ Kun beskrivelse (1-2 sætninger)
  learningObjectives: string[];     // ✅ Kun bullets
  estimatedMinutes: number;
  topics: string[];
  // ❌ INTET FAKTISK INDHOLD!
};
```

### TARGET Curriculum (komplet med indhold)

```typescript
type ExtendedCourseCurriculum = {
  courseTitle: string;
  courseDescription: string;
  estimatedDuration: number;
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  sections: ExtendedCourseSection[];  // UDVIDET sections
  metadata: {
    totalSections: number;
    totalQuizQuestions: number;
    generatedAt: string;
    generationCostUsd: number;
    generationTimeSeconds: number;
  };
};

type ExtendedCourseSection = {
  // ========== OUTLINE (allerede genereret) ==========
  sectionNumber: number;
  title: string;
  description: string;
  learningObjectives: string[];
  estimatedMinutes: number;
  topics: string[];

  // ========== NYTINDHOLD (hvad dette workflow genererer) ==========

  // 1. Detaljeret Lesson Content (500-1000 ord)
  content: {
    introduction: string;           // 100-200 ord introduktion
    blocks: ContentBlock[];         // Struktureret content (paragraphs, lister, callouts)
    summary: string;                // 50-100 ord opsummering
    keyTakeaways: string[];         // 3-5 key takeaways
  };

  // 2. Code Examples (hvis teknisk emne)
  codeExamples?: CodeExample[];

  // 3. Quiz (3-5 spørgsmål)
  quiz: Quiz;

  // 4. Practical Exercises (optional Phase 1)
  exercises?: Exercise[];

  // Metadata
  contentGeneratedAt: string;
  contentGenerationCostUsd: number;
};

// Supporting Types
type ContentBlock = {
  type: 'paragraph' | 'heading' | 'list' | 'callout' | 'quote';
  content: string;
  subItems?: string[];              // For lists
  calloutType?: 'info' | 'warning' | 'tip' | 'example';
  heading?: 'h3' | 'h4';            // For headings
};

type CodeExample = {
  title: string;
  description: string;
  language: string;                 // 'typescript', 'python', 'javascript', etc.
  code: string;                     // The actual code
  explanation: string;              // What the code does (100-200 ord)
  highlightedLines?: number[];      // Lines to emphasize
};

type Quiz = {
  questions: QuizQuestion[];
};

type QuizQuestion = {
  questionNumber: number;
  question: string;                 // The question text
  options: string[];                // Array of 4 answer options
  correctAnswerIndex: number;       // 0-3 (which option is correct)
  explanation: string;              // Why this is the correct answer (50-100 ord)
  difficulty: 'easy' | 'medium' | 'hard';
};

type Exercise = {
  exerciseNumber: number;
  title: string;
  description: string;
  estimatedMinutes: number;
  steps: string[];                  // Step-by-step instructions
  hints?: string[];                 // Optional hints
  solution?: string;                // Optional solution (Phase 2)
};
```

---

## 🏗️ Workflow Arkitektur

```
┌─────────────────────────────────────────────────────────────┐
│ TRIGGER: Admin Approves TrendProposal                       │
│ Webhook: POST /api/webhooks/n8n-generate-content            │
│ Payload: { proposalId: "uuid", courseId: 123 }              │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ NODE 1: Fetch Proposal & Course Data                        │
│ - GET /rest/v1/trend_proposals?id=eq.{proposalId}           │
│ - GET /rest/v1/courses?id=eq.{courseId}                     │
│ - Extract curriculumJson (outline already generated)        │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ NODE 2: Validate Curriculum Exists                          │
│ - Check curriculumJson is not null                          │
│ - Verify sections array has items                           │
│ - If missing: ERROR (curriculum must exist first)           │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ NODE 3: Loop Through Sections (For Each)                    │
│ Input: curriculum.sections[]                                │
│ Batch Size: 1 (process one section at a time)               │
└─────────────────────────────────────────────────────────────┘
                            ↓
        ┌───────────────────┴───────────────────┐
        │                                       │
        ↓                                       ↓
┌──────────────────────┐              ┌──────────────────────┐
│ NODE 4A:             │              │ NODE 4B:             │
│ Generate Section     │              │ Generate Section     │
│ Content (Claude)     │              │ Quiz (Claude)        │
│                      │              │                      │
│ Input:               │              │ Input:               │
│ - section.title      │              │ - section.title      │
│ - section.topics     │              │ - section.topics     │
│ - learningObjectives │              │ - learningObjectives │
│                      │              │                      │
│ Output:              │              │ Output:              │
│ - introduction       │              │ - 3-5 quiz questions │
│ - content blocks     │              │ - multiple choice    │
│ - code examples      │              │ - explanations       │
│ - summary            │              │                      │
│ - key takeaways      │              │ Cost: ~$0.03-0.05    │
│                      │              │ Time: ~10-15 sec     │
│ Cost: ~$0.10-0.15    │              │                      │
│ Time: ~15-25 sec     │              │                      │
└──────────────────────┘              └──────────────────────┘
        │                                       │
        └───────────────────┬───────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ NODE 5: Merge Section Data                                  │
│ Combine: outline + content + quiz → ExtendedCourseSection   │
│ Calculate: section generation cost and time                 │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ NODE 6: Accumulate Sections (Store in array)                │
│ Build array of all ExtendedCourseSections                   │
└─────────────────────────────────────────────────────────────┘
                            ↓
            (Loop back to NODE 3 until all sections done)
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ NODE 7: Assemble Complete Course                            │
│ - Combine all extended sections                             │
│ - Add metadata (total cost, time, questions count)          │
│ - Generate final ExtendedCourseCurriculum object            │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ NODE 8: Save to Database (Supabase)                         │
│ PATCH /rest/v1/courses?id=eq.{courseId}                     │
│ Update:                                                      │
│ - curriculumJson = ExtendedCourseCurriculum                 │
│ - generationCostUsd += content_generation_cost              │
│ - generationTimeMinutes += content_generation_time          │
│ - status = 'PUBLISHED'                                      │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ NODE 9: Update TrendProposal Status                         │
│ PATCH /rest/v1/trend_proposals?id=eq.{proposalId}           │
│ Update:                                                      │
│ - status = 'PUBLISHED'                                      │
│ - actualGenerationCostUsd = total_cost                      │
│ - actualGenerationTimeMinutes = total_time                  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ NODE 10: Send Success Notification (Optional)               │
│ - Log completion                                            │
│ - Send webhook to admin dashboard for real-time update      │
└─────────────────────────────────────────────────────────────┘
```

---

## 🤖 AI Prompts (Claude)

### Prompt 1: Section Content Generator

**System Prompt:**
```
Du er en ekspert tech-uddannelses indholdsproducent. Din opgave er at generere detaljeret, engagerende lektionsindhold til online tech-kurser på dansk.

RETNINGSLINJER:
- Skriv klart og pædagogisk (som om du forklarer til en kollega)
- Brug konkrete eksempler og virkelige use cases
- Inkluder kodeeksempler hvor relevant (med forklaringer)
- Strukturer indhold i afsnit, lister, og callouts
- Undgå fluff - vær præcis og actionable
- Target niveau: {LEVEL} (BEGINNER/INTERMEDIATE/ADVANCED)
- Sprog: Dansk (code comments i engelsk)

OUTPUT FORMAT: JSON med følgende struktur:
{
  "introduction": "100-200 ord introduktion...",
  "blocks": [
    {
      "type": "paragraph|heading|list|callout",
      "content": "...",
      "subItems": ["..."],  // Kun for lister
      "calloutType": "info|warning|tip|example"  // Kun for callouts
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
```

**User Prompt Template:**
```
Generer detaljeret lektionsindhold til følgende section:

COURSE CONTEXT:
- Course Title: {courseTitle}
- Course Level: {level}
- Course Description: {courseDescription}

SECTION INFO:
- Section Number: {sectionNumber}
- Section Title: {sectionTitle}
- Section Description: {sectionDescription}
- Learning Objectives: {learningObjectives}
- Topics to Cover: {topics}
- Estimated Duration: {estimatedMinutes} minutter

REQUIREMENTS:
1. Write {500-800} ord hovedindhold fordelt på blocks
2. Inkluder {1-3} kodeeksempler hvis relevant til emnet
3. Brug callouts til at fremhæve vigtige points
4. End med 3-5 key takeaways

Generer JSON output nu.
```

**Estimated Cost:** $0.10-0.15 per section (output: 600-1000 tokens)
**Estimated Time:** 15-25 sekunder per section

---

### Prompt 2: Quiz Generator

**System Prompt:**
```
Du er en ekspert i at designe effektive quiz-spørgsmål til tech-uddannelser. Din opgave er at generere multiple choice spørgsmål der REELT tester forståelse (ikke kun hukommelse).

RETNINGSLINJER:
- Skriv spørgsmål der tester FORSTÅELSE, ikke kun facts
- Multiple choice med 4 svarmuligheder
- Præcise forklaringer på hvorfor svaret er korrekt
- Mix af difficulty levels (easy/medium/hard)
- Undgå trick questions - vær fair men udfordrende
- Sprog: Dansk

OUTPUT FORMAT: JSON med følgende struktur:
{
  "questions": [
    {
      "questionNumber": 1,
      "question": "Spørgsmålet her?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswerIndex": 2,  // 0-3
      "explanation": "Forklaring på hvorfor dette er korrekt...",
      "difficulty": "easy|medium|hard"
    }
  ]
}
```

**User Prompt Template:**
```
Generer quiz spørgsmål til følgende section:

SECTION INFO:
- Section Title: {sectionTitle}
- Learning Objectives: {learningObjectives}
- Topics Covered: {topics}
- Content Summary: {summary}

REQUIREMENTS:
1. Generer {3-5} spørgsmål
2. Mix af difficulty: 1-2 easy, 2-3 medium, 0-1 hard
3. Test forståelse af kernekoncepter fra learning objectives
4. Hver forklaring skal være 50-100 ord

Generer JSON output nu.
```

**Estimated Cost:** $0.03-0.05 per section (output: 200-400 tokens)
**Estimated Time:** 10-15 sekunder per section

---

## 💰 Cost & Time Budget

### Per Section (1 section)
| Component | Tokens (Output) | Cost | Time |
|-----------|----------------|------|------|
| Content Generation | 600-1000 | $0.10-0.15 | 15-25s |
| Quiz Generation | 200-400 | $0.03-0.05 | 10-15s |
| **Section Total** | **800-1400** | **$0.13-0.20** | **25-40s** |

### Per Course (5 sections typical)
| Item | Cost | Time |
|------|------|------|
| Curriculum Outline | $0.02 | 20s |
| 5× Section Content | $0.50-0.75 | 75-125s |
| 5× Section Quiz | $0.15-0.25 | 50-75s |
| Database Operations | - | 10-15s |
| **Total** | **$0.67-1.02** | **155-235s (2.5-4 min)** |

✅ **Under Phase 1 targets:** <$1.50 per course, <2 hours generation time

---

## 🔧 Implementation Steps

### 1. Opret ny Webhook Endpoint

**File:** `frontend/src/pages/api/webhooks/n8n-generate-content.ts`

```typescript
// Receives trigger from admin dashboard when proposal approved
// Payload: { proposalId: string, courseId: number }
```

### 2. Opret n8n Workflow JSON

**File:** `n8n-workflow-content-generation.json`

(Se separat fil - omfattende JSON workflow definition)

### 3. Opdater Admin Approval Flow

Når admin klikker "Approve" på en TrendProposal:
1. Generer curriculum outline (eksisterende `/api/generate-course`)
2. Opret Course record i database
3. **NY:** Trigger n8n content generation workflow via webhook
4. Show "Generating content..." status i UI
5. Poll for completion (eller WebSocket update)

### 4. Opdater Course Player

Tilføj support for extended curriculum:
- Render `content.blocks[]` (paragraph, heading, list, callout)
- Syntax highlighting for `codeExamples[]`
- Interactive quiz UI (`quiz.questions[]`)
- Progress tracking (mark section complete after quiz)

---

## 🚀 Deployment Checklist

- [ ] n8n workflow importeret og aktiveret
- [ ] Webhook endpoint `/api/webhooks/n8n-generate-content` deployed
- [ ] Environment variables konfigureret (ANTHROPIC_API_KEY, WEBHOOK_URL)
- [ ] Anthropic credentials tilføjet til n8n
- [ ] Test workflow med 1 dummy proposal
- [ ] Verify database update (curriculumJson has full content)
- [ ] Test Course Player viser content korrekt
- [ ] Monitor costs (first 5 courses should be <$5 total)

---

## 📈 Success Metrics

**Phase 1 MVP:**
- ✅ Generate 5 complete courses (with full content + quizzes)
- ✅ Average generation time: <5 minutter per course
- ✅ Average cost: <$1.00 per course
- ✅ Content quality: 10 beta users rate 7+/10
- ✅ Quiz completion rate: >60% of users

**Phase 2 Optimization:**
- Parallel section generation (reduce time to <2 min)
- Dynamic content length based on complexity
- A/B test different content formats
- Auto-approve high-scoring proposals (>80 relevance)

---

## 🎓 Example Output

**Section: "Grundlæggende Real-Time AI Koncepter"**

**Before (current):**
```json
{
  "sectionNumber": 1,
  "title": "Grundlæggende Real-Time AI Koncepter",
  "description": "Introduction to real-time AI processing",
  "learningObjectives": ["Understand real-time AI", "Learn streaming patterns"],
  "estimatedMinutes": 20,
  "topics": ["real-time processing", "streaming", "latency"]
}
```

**After (extended):**
```json
{
  "sectionNumber": 1,
  "title": "Grundlæggende Real-Time AI Koncepter",
  "description": "Introduction to real-time AI processing",
  "learningObjectives": ["Understand real-time AI", "Learn streaming patterns"],
  "estimatedMinutes": 20,
  "topics": ["real-time processing", "streaming", "latency"],

  "content": {
    "introduction": "Real-time AI er fundamentalt anderledes end batch processing. I denne sektion lærer du hvorfor latency matters, hvilke arkitektur-patterns der virker, og hvordan moderne AI frameworks håndterer streaming data...",

    "blocks": [
      {
        "type": "heading",
        "content": "Hvad er Real-Time AI?",
        "heading": "h3"
      },
      {
        "type": "paragraph",
        "content": "Real-time AI refererer til systemer der kan processere og respondere på data indenfor millisekunder til få sekunder. Dette er kritisk for applikationer som chatbots, autonomous vehicles, og fraud detection..."
      },
      {
        "type": "callout",
        "content": "Real-time betyder typisk <100ms latency for user-facing features",
        "calloutType": "info"
      },
      {
        "type": "list",
        "content": "Key forskelle mellem real-time og batch AI:",
        "subItems": [
          "Latency requirements: <100ms vs. minutes/hours",
          "Data processing: streaming vs. batch",
          "Infrastructure: event-driven vs. scheduled jobs"
        ]
      }
    ],

    "codeExamples": [
      {
        "title": "Real-Time Inference med Streaming",
        "description": "Eksempel på streaming inference pipeline",
        "language": "python",
        "code": "from kafka import KafkaConsumer\nimport tensorflow as tf\n\n# Load model\nmodel = tf.keras.models.load_model('model.h5')\n\n# Stream from Kafka\nconsumer = KafkaConsumer('events')\nfor message in consumer:\n    data = preprocess(message.value)\n    prediction = model.predict(data)\n    publish_result(prediction)",
        "explanation": "Denne kode viser en typisk streaming inference pipeline: vi lytter på Kafka events, preprocesser data i real-time, kører inference, og publisher resultater tilbage. Latency er typisk 10-50ms per event."
      }
    ],

    "summary": "Real-time AI kræver fundamentalt andre arkitektur-valg end batch processing. De vigtigste faktorer er latency requirements, streaming infrastructure, og model optimization...",

    "keyTakeaways": [
      "Real-time AI har latency requirements <100ms for user-facing features",
      "Streaming infrastructure (Kafka, Kinesis) er central for event processing",
      "Model optimization (quantization, pruning) er kritisk for production"
    ]
  },

  "quiz": {
    "questions": [
      {
        "questionNumber": 1,
        "question": "Hvad er den primære forskel mellem real-time og batch AI processing?",
        "options": [
          "Real-time bruger større modeller",
          "Real-time har latency requirements <100ms",
          "Batch processing er mere præcist",
          "Batch processing bruger streaming"
        ],
        "correctAnswerIndex": 1,
        "explanation": "Real-time AI er defineret ved lave latency requirements (typisk <100ms), mens batch processing kan tage minutter til timer. Dette driver fundamentalt forskellige arkitektur-valg.",
        "difficulty": "easy"
      },
      {
        "questionNumber": 2,
        "question": "Hvilken streaming platform ville du bruge til high-throughput real-time inference?",
        "options": [
          "PostgreSQL",
          "Redis",
          "Apache Kafka",
          "MongoDB"
        ],
        "correctAnswerIndex": 2,
        "explanation": "Apache Kafka er designet til high-throughput event streaming og er industry standard for real-time data pipelines. Redis kan bruges som cache, men ikke som primær streaming platform.",
        "difficulty": "medium"
      }
    ]
  },

  "contentGeneratedAt": "2025-11-09T10:30:00Z",
  "contentGenerationCostUsd": 0.18
}
```

---

**Status:** Design Complete ✅
**Next Step:** Implementer n8n workflow JSON og webhook endpoint
