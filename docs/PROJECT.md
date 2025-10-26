# COURSEHUB V2.0 - KNOWLEDGE TRANSMISSION PLATFORM

**Læs denne fil først før du koder noget.**
Dette dokument definerer vores radikale vision: Verdens hurtigste AI-drevne learning platform.

---

## 🎯 VISION: THE FASTEST LEARNING PLATFORM ON EARTH

CourseHub er ikke en kursusplatform. Det er en **knowledge transmission engine**.

### Mission
Fra trending tech topic til certificeret bruger på **under 48 timer**.

### Hvordan Det Virker
1. **AI scraper** real-time tech trends (HackerNews, GitHub, arXiv, Reddit)
2. **Claude Sonnet** genererer personaliseret kursusmateriale på **2-4 timer**
3. **Brugere** lærer cutting-edge tech **før** Udemy/Coursera ved det eksisterer
4. **100% GRATIS** i Phase 1-2 for at opbygge verdens største tech learning community

### Competitive Moat

| Metric | CourseHub | Traditional Platforms |
|--------|-----------|---------------------|
| **Speed** | Trend → Course: 4 timer | 6-12 måneder |
| **Freshness** | Daglig AI-genereret content | Quarterly updates |
| **Personalization** | Real-time custom courses | Static content |
| **Cost** | $0 for brugere | $50-200 per kurs |
| **Quality** | AI + A/B testing | Variable |

### Elon Musk Feedback
> *"By the time Udemy realizes AI is eating their lunch, you'll have 100K daily users getting fresher, better, FREE content than they could ever produce manually."*

---

## 📈 ROADMAP: 4 AGGRESSIVE FASER

### Fase 1 (2 Uger): MVP - Proof of Concept
**Mål:** Bevise at AI kan generere world-class content faster end humans

**Deliverables:**
- ✅ n8n scraper running dagligt (06:00 CET)
- ✅ Claude generates 1 full course (30-45 min) fra trending topic
- ✅ Admin dashboard til at godkende course proposals (1-click)
- ✅ Basic course player (video/podcast/transcript/quiz)
- ✅ User signup + progress tracking
- ✅ 10 AI-generated Tech/AI courses published

**Success Metric:** 100 beta users complete their first course
**Timeline:** Ship i 14 dage

---

### Fase 2 (Måned 1-2): Automation + Personalization Engine
**Mål:** Eliminere al manuel godkendelse, automate everything

**Features:**
- 🤖 **Auto-publish** baseret på engagement predictions
  - AI vurderer om course vil få >60% completion rate
  - Auto-publish hvis confidence >70%

- 🎯 **Real-time personalized course generation**
  ```typescript
  // User: "Teach me RAG systems for e-commerce"
  // AI: Generates custom course in 30 minutes based on user's skill level
  ```

- 📊 **A/B testing engine**
  - Generate 2 versions af hver course
  - Track completion rates
  - Winner takes all (loser archived)

- 🏢 **Company dashboard**
  - Employee tracking
  - Skill matrices
  - Learning analytics

- 💬 **AI support chatbot**
  - Zero human contact
  - Claude-powered FAQ
  - Course recommendations

- 📱 **Mobile-optimized player**
  - Offline download
  - Background audio
  - Progress sync

**Success Metric:** 1,000 DAU, 60%+ completion rate
**Timeline:** Ship i 6 uger

---

### Fase 3 (Måned 3-6): Scale + Intelligence
**Mål:** Become the default platform for learning new tech

**Features:**
- 🔮 **Predictive course generation**
  ```typescript
  // Scrape job postings → Generate courses for in-demand skills
  // Example: "Rust for WebAssembly" trending in job market
  // → Auto-generate course within 24h
  ```

- 🏆 **Gamification**
  - Leaderboards (personal & company)
  - Badges & achievements
  - Skill trees ("Unlock: Full-Stack AI Engineer")

- 🌐 **Multi-language support**
  - Start: English, Danish
  - Expand: Chinese, Spanish, German

- 📈 **Advanced analytics for companies**
  - ROI calculations
  - Skill gap analysis
  - Custom learning paths

- 🎲 **"Surprise Me" feature**
  - AI generates random but personalized learning journey
  - Based on past behavior, skill level, career goals

- 🔍 **Semantic search**
  - "Teach me how to optimize LLM costs"
  - Finds relevant courses + generates custom if gap

**Success Metric:** 10,000 DAU, 500 companies tracking employees
**Timeline:** Ship i 4 måneder

---

### Fase 4 (Måned 7-12): Monetization Layer
**Mål:** Prove revenue model without hurting growth

**Revenue Streams:**

**1. Company Premium Plans ($99-499/month)**
- Advanced analytics dashboard
- Custom branded learning paths
- SSO/SAML integration
- API access for HR systems
- Dedicated support

**2. Affiliate Partnerships**
- AWS pays for "AWS Certification Prep" course placement
- OpenAI sponsors "GPT-4 Advanced Techniques"
- Anthropic sponsors "Claude for Production"

**3. Marketplace (Phase 4b)**
- Vendors can publish paid courses
- We take 15-20% commission
- Quality controlled by AI screening

**4. Data Insights (B2B)**
- Sell anonymized trend reports to EdTech companies
- "What tech skills are trending in Denmark?"

**Important:** Core product remains 100% free for individual users.

**Success Metric:** $50K MRR, maintain free core product
**Timeline:** Ship i 6 måneder

---

## 🛠 TECH STACK

### Core Infrastructure

```
┌──────────────────────────────────────┐
│   FRONTEND (Next.js 15 App Router)   │
│      TypeScript + Tailwind CSS       │
│      Server Components First         │
└──────────────────────────────────────┘
                 ↓
┌──────────────────────────────────────┐
│   BACKEND (Supabase + Edge Funcs)    │
│    PostgreSQL + Auth + Realtime      │
│    pgvector for semantic search      │
└──────────────────────────────────────┘
                 ↓
┌──────────────────────────────────────┐
│     AI CORE (Claude Sonnet 4.5)      │
│   Course Generation + Personalization│
│         Chat Support + Matching      │
└──────────────────────────────────────┘
                 ↓
┌──────────────────────────────────────┐
│   CONTENT GEN (Parallel Processing)  │
│   ElevenLabs (Voice) + D-ID (Video)  │
│   NotebookLM (when API available)    │
└──────────────────────────────────────┘
                 ↓
┌──────────────────────────────────────┐
│    AUTOMATION (n8n self-hosted)      │
│    Trend Scraping + Course Pipeline  │
│    A/B Testing + Analytics           │
└──────────────────────────────────────┘
```

### Detailed Stack

#### Frontend
```json
{
  "framework": "Next.js 15 App Router",
  "language": "TypeScript strict mode",
  "styling": "Tailwind CSS v4",
  "components": "shadcn/ui",
  "forms": "React Hook Form + Zod",
  "state": "Zustand (minimal global state)",
  "real-time": "Supabase Realtime",
  "video_player": "Plyr.js",
  "charts": "Recharts",
  "icons": "Lucide React"
}
```

**Key Points:**
- Server Components by default
- Client Components only for interactivity
- Mobile-first responsive design
- Dark mode native (Tech/AI audience prefers dark)

#### Backend
```json
{
  "database": "PostgreSQL 15 via Supabase",
  "auth": "Supabase Auth (email + Google OAuth)",
  "storage": "Supabase Storage (videos, podcasts, PDFs)",
  "realtime": "Supabase Realtime (progress sync)",
  "edge_functions": "Supabase Edge Functions (Deno)",
  "vector_search": "pgvector extension",
  "caching": "Upstash Redis (AI responses, embeddings)"
}
```

**Key Points:**
- Row Level Security (RLS) for all tables
- Use Edge Functions for heavy compute
- Database migrations via Supabase CLI
- Store embeddings directly in Postgres

#### AI Pipeline
```json
{
  "primary_llm": "Claude Sonnet 4.5 (Anthropic API)",
  "embeddings": "Voyage AI eller Cohere",
  "voice_generation": "ElevenLabs API",
  "video_generation": "D-ID eller HeyGen (conditional on cost)",
  "future": "NotebookLM API (når tilgængelig)",
  "use_cases": [
    "Course structure generation (5 min)",
    "Transcript writing (10 min per section)",
    "Quiz generation (5 min)",
    "Exercise creation (10 min)",
    "Personalization engine (real-time)",
    "Support chat (instant responses)",
    "Trend analysis (daily batch)"
  ]
}
```

**Cost Optimization:**
- Track every API call
- Cache aggressively (Redis)
- Use smaller models for simple tasks
- Parallel processing for speed
- Target: <$2 per course generation

#### Automation
```json
{
  "platform": "n8n (self-hosted on DigitalOcean)",
  "scraping_sources": [
    "Hacker News API",
    "Reddit API (r/MachineLearning, r/programming, r/learnprogramming)",
    "GitHub Trending API",
    "arXiv ML papers RSS feed",
    "Dev.to API",
    "Twitter API (tech influencers)"
  ],
  "workflows": [
    "daily-trend-scraper (06:00 CET)",
    "course-generator (on-demand)",
    "a-b-test-tracker (real-time)",
    "engagement-analyzer (hourly)",
    "cost-optimizer (daily report)"
  ]
}
```

### Supporting Tools
```json
{
  "analytics": "Posthog (self-hosted)",
  "monitoring": "Sentry",
  "email": "Resend (transactional)",
  "cdn": "Vercel Edge Network",
  "dns": "Cloudflare"
}
```

---

## 🗄 DATABASE SCHEMA

### Core Tables

```sql
-- ════════════════════════════════════════════
-- USERS & AUTHENTICATION
-- ════════════════════════════════════════════

CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,

  -- Role System
  role TEXT CHECK (role IN ('USER', 'COMPANY_USER', 'COMPANY_ADMIN', 'SUPER_ADMIN')) DEFAULT 'USER',

  -- Company Affiliation (for B2B tracking)
  company_id UUID REFERENCES companies(id) ON DELETE SET NULL,

  -- Learning Preferences
  skill_level TEXT CHECK (skill_level IN ('beginner', 'intermediate', 'advanced')) DEFAULT 'beginner',
  preferred_language TEXT DEFAULT 'da',
  interests TEXT[], -- ['AI/ML', 'Cloud', 'Frontend']

  -- Engagement Metrics
  total_courses_completed INTEGER DEFAULT 0,
  total_time_spent_minutes INTEGER DEFAULT 0,
  streak_days INTEGER DEFAULT 0,
  last_activity_at TIMESTAMPTZ DEFAULT NOW(),

  -- Status
  is_active BOOLEAN DEFAULT true,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_company ON users(company_id);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_activity ON users(last_activity_at DESC);

-- ════════════════════════════════════════════
-- COMPANIES (B2B Feature)
-- ════════════════════════════════════════════

CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE,

  -- Optional Metadata
  cvr TEXT UNIQUE,
  industry TEXT,
  size TEXT CHECK (size IN ('1-10', '11-50', '51-200', '201-500', '500+')),

  -- Settings
  enable_analytics BOOLEAN DEFAULT true,
  enable_leaderboards BOOLEAN DEFAULT false,
  custom_branding JSONB, -- { logo_url, primary_color, etc. }

  -- Monetization (Phase 4)
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'enterprise')),
  billing_email TEXT,
  stripe_customer_id TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_companies_plan ON companies(plan);

-- ════════════════════════════════════════════
-- TREND DISCOVERY & PROPOSALS
-- ════════════════════════════════════════════

CREATE TABLE trend_proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Source Data
  source TEXT NOT NULL, -- 'hackernews', 'reddit', 'github', 'arxiv'
  source_url TEXT,
  source_id TEXT, -- External ID for deduplication

  -- Trend Information
  title TEXT NOT NULL,
  description TEXT,
  keywords TEXT[],
  trend_score INTEGER, -- Upvotes/stars/popularity

  -- AI Analysis
  ai_course_proposal JSONB NOT NULL,
  /* Example structure:
  {
    "course_title": "Build Production RAG Systems",
    "target_audience": "intermediate",
    "estimated_duration_minutes": 45,
    "key_learning_outcomes": [...],
    "course_structure": { sections: [...] },
    "prerequisites": [...],
    "relevance_score": 95
  }
  */

  estimated_duration_minutes INTEGER,
  estimated_generation_cost_usd DECIMAL(10,2),
  estimated_engagement_score INTEGER, -- AI prediction: will users complete this?

  -- Admin Decision (Phase 1) / Auto-Decision (Phase 2+)
  status TEXT CHECK (status IN ('pending', 'approved', 'rejected', 'generating', 'published')) DEFAULT 'pending',
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMPTZ,
  rejection_reason TEXT,

  -- Generation Results
  generated_course_id UUID REFERENCES courses(id),
  actual_generation_cost_usd DECIMAL(10,2),
  actual_generation_time_minutes INTEGER,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_trend_proposals_status ON trend_proposals(status);
CREATE INDEX idx_trend_proposals_created ON trend_proposals(created_at DESC);
CREATE INDEX idx_trend_proposals_source ON trend_proposals(source);

-- Deduplication index
CREATE UNIQUE INDEX idx_trend_proposals_unique ON trend_proposals(source, source_id) WHERE source_id IS NOT NULL;

-- ════════════════════════════════════════════
-- COURSES (AI-Generated Content)
-- ════════════════════════════════════════════

CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Basic Info
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  short_description TEXT, -- For cards (max 160 chars)

  -- Generation Metadata
  generated_by TEXT DEFAULT 'ai' CHECK (generated_by IN ('ai', 'provider')),
  generation_model TEXT DEFAULT 'claude-sonnet-4-20250514',
  generation_timestamp TIMESTAMPTZ DEFAULT NOW(),
  generation_cost_usd DECIMAL(10,2),
  generation_time_minutes INTEGER,
  trend_proposal_id UUID REFERENCES trend_proposals(id),

  -- Content Structure
  curriculum JSONB NOT NULL,
  /* Example:
  {
    "sections": [
      {
        "id": "intro",
        "title": "Introduction to RAG",
        "duration_minutes": 10,
        "type": "video",
        "content_url": "https://...",
        "transcript": "...",
        "key_concepts": ["Vector DB", "Embeddings"]
      },
      {
        "id": "hands-on",
        "title": "Build Your First RAG",
        "duration_minutes": 20,
        "type": "exercise",
        "instructions": "...",
        "starter_code": "..."
      }
    ]
  }
  */

  -- Media Files
  video_url TEXT, -- Main video (if generated)
  podcast_url TEXT, -- Audio version
  transcript TEXT, -- Full text for SEO & accessibility

  -- Learning Materials
  quiz_questions JSONB[], -- Multiple choice, code challenges
  exercises JSONB[], -- Hands-on coding exercises
  additional_resources JSONB[], -- Links, repos, documentation

  -- Categorization
  primary_topic TEXT NOT NULL, -- 'AI/ML', 'Cloud', 'Frontend', 'Backend', 'Mobile', 'DevOps'
  sub_topic TEXT, -- 'LLMs', 'AWS', 'React', 'FastAPI'
  tags TEXT[], -- ['ChatGPT', 'RAG', 'LangChain', 'Production']
  difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')) DEFAULT 'beginner',
  prerequisites TEXT[], -- ['Python basics', 'API experience']

  -- Duration
  estimated_duration_minutes INTEGER NOT NULL,

  -- AI Metadata
  embedding VECTOR(1536), -- For semantic search

  -- Engagement Tracking
  view_count INTEGER DEFAULT 0,
  start_count INTEGER DEFAULT 0,
  completion_count INTEGER DEFAULT 0,
  avg_completion_time_minutes INTEGER,
  avg_rating DECIMAL(3,2),
  total_ratings INTEGER DEFAULT 0,

  -- A/B Testing
  variant TEXT CHECK (variant IN ('A', 'B')),
  variant_group_id UUID, -- Links A and B variants
  ab_winner BOOLEAN, -- Marked after statistical significance

  -- Status
  status TEXT CHECK (status IN ('draft', 'published', 'archived')) DEFAULT 'draft',
  is_free BOOLEAN DEFAULT true, -- Always true in Phase 1-3
  published_at TIMESTAMPTZ,

  -- SEO
  meta_description TEXT,
  og_image_url TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_courses_status ON courses(status);
CREATE INDEX idx_courses_topic ON courses(primary_topic);
CREATE INDEX idx_courses_difficulty ON courses(difficulty);
CREATE INDEX idx_courses_published ON courses(published_at DESC) WHERE status = 'published';
CREATE INDEX idx_courses_variant_group ON courses(variant_group_id) WHERE variant_group_id IS NOT NULL;

-- Vector search index
CREATE INDEX idx_courses_embedding ON courses USING ivfflat (embedding vector_cosine_ops);

-- Full-text search
CREATE INDEX idx_courses_search ON courses USING gin(
  to_tsvector('english', title || ' ' || description || ' ' || array_to_string(tags, ' '))
);

-- ════════════════════════════════════════════
-- COURSE PROGRESS (User Learning Tracking)
-- ════════════════════════════════════════════

CREATE TABLE course_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,

  -- Timeline
  started_at TIMESTAMPTZ DEFAULT NOW(),
  last_activity_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,

  -- Detailed Progress
  completed_sections TEXT[], -- ["intro", "hands-on", "quiz-1"]
  quiz_scores JSONB DEFAULT '{}', -- { "quiz-1": 0.85, "quiz-2": 0.92 }
  time_spent_minutes INTEGER DEFAULT 0,
  current_section_id TEXT, -- Where user left off

  -- Engagement
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  feedback TEXT,
  would_recommend BOOLEAN,

  -- Calculated
  progress_percent INTEGER DEFAULT 0 CHECK (progress_percent BETWEEN 0 AND 100),

  UNIQUE(user_id, course_id)
);

CREATE INDEX idx_progress_user ON course_progress(user_id);
CREATE INDEX idx_progress_course ON course_progress(course_id);
CREATE INDEX idx_progress_completed ON course_progress(completed_at) WHERE completed_at IS NOT NULL;
CREATE INDEX idx_progress_active ON course_progress(last_activity_at DESC) WHERE completed_at IS NULL;

-- ════════════════════════════════════════════
-- AI INTERACTIONS (Chat, Recommendations, Personalization)
-- ════════════════════════════════════════════

CREATE TABLE ai_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  session_id UUID NOT NULL,

  -- Interaction Type
  type TEXT CHECK (type IN (
    'course_recommendation',
    'support_chat',
    'personalized_generation',
    'surprise_me'
  )) NOT NULL,

  -- User Input
  user_query TEXT NOT NULL,
  user_context JSONB, -- { skill_level, interests, past_courses, current_goal }

  -- AI Response
  ai_response TEXT,
  recommended_courses UUID[], -- Array of course IDs
  model_used TEXT DEFAULT 'claude-sonnet-4-20250514',
  prompt_version TEXT,
  response_time_ms INTEGER,

  -- Outcome Tracking
  user_clicked_course_id UUID REFERENCES courses(id),
  user_started_course_id UUID REFERENCES courses(id),
  user_satisfaction INTEGER CHECK (user_satisfaction BETWEEN 1 AND 5),

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ai_interactions_user ON ai_interactions(user_id);
CREATE INDEX idx_ai_interactions_session ON ai_interactions(session_id);
CREATE INDEX idx_ai_interactions_type ON ai_interactions(type);
CREATE INDEX idx_ai_interactions_created ON ai_interactions(created_at DESC);

-- ════════════════════════════════════════════
-- ANALYTICS EVENTS (Track Everything)
-- ════════════════════════════════════════════

CREATE TABLE analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  session_id UUID,

  -- Event Data
  event_type TEXT NOT NULL,
  /* Examples:
     - page_view
     - course_started
     - section_completed
     - quiz_submitted
     - video_played
     - video_paused
     - exercise_attempted
     - rating_submitted
  */
  event_data JSONB,

  -- Context
  course_id UUID REFERENCES courses(id),
  page_url TEXT,
  referrer TEXT,
  user_agent TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_analytics_events_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_events_user ON analytics_events(user_id);
CREATE INDEX idx_analytics_events_course ON analytics_events(course_id);
CREATE INDEX idx_analytics_events_created ON analytics_events(created_at DESC);

-- Partitioning by month for performance (optional, implement when > 1M events)
-- CREATE TABLE analytics_events_2025_01 PARTITION OF analytics_events
--   FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');
```

### Row Level Security (RLS)

```sql
-- ════════════════════════════════════════════
-- RLS POLICIES
-- ════════════════════════════════════════════

-- Users: Can only view own profile
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_view_own"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "users_update_own"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- Courses: Public read for published courses
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "courses_public_read"
  ON courses FOR SELECT
  USING (status = 'published');

CREATE POLICY "courses_admin_all"
  ON courses FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role = 'SUPER_ADMIN'
    )
  );

-- Progress: Users can only see their own
ALTER TABLE course_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "progress_view_own"
  ON course_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "progress_manage_own"
  ON course_progress FOR INSERT, UPDATE
  USING (auth.uid() = user_id);

-- Company admins can view employee progress
CREATE POLICY "progress_company_admin_view"
  ON course_progress FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users u1
      JOIN users u2 ON u1.company_id = u2.company_id
      WHERE u1.id = auth.uid()
      AND u1.role IN ('COMPANY_ADMIN', 'SUPER_ADMIN')
      AND u2.id = course_progress.user_id
    )
  );

-- Analytics: Users can view own events
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "analytics_view_own"
  ON analytics_events FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "analytics_insert_own"
  ON analytics_events FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

---

## 🤖 AI CONTENT GENERATION PIPELINE

### Overview

```
┌─────────────────────────────────────────────┐
│  TREND DISCOVERY (Daily 06:00)              │
│  n8n scrapes HN, Reddit, GitHub, arXiv      │
│  → AI analyzes trends                       │
│  → Generates course proposals               │
└─────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────┐
│  PROPOSAL APPROVAL                          │
│  Phase 1: Admin 1-click approval            │
│  Phase 2+: Auto-approve if confidence >70%  │
└─────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────┐
│  COURSE GENERATION (2-4 hours)              │
│  1. Curriculum (5 min)                      │
│  2. Content parallel (20 min):              │
│     - Transcripts                           │
│     - Quizzes                               │
│     - Exercises                             │
│     - Podcast                               │
│  3. Video (30 min, conditional)             │
│  4. A/B variant (10 min)                    │
└─────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────┐
│  PUBLISH & TRACK                            │
│  - Auto-publish to platform                 │
│  - Track engagement metrics                 │
│  - Determine A/B winner after 100 users     │
└─────────────────────────────────────────────┘
```

### N8N Workflow 1: Daily Trend Scraper

**File:** `apps/n8n/workflows/daily-trend-scraper.json`

```typescript
// Pseudocode - actual implementation i n8n workflow format

export const DAILY_TREND_SCRAPER_WORKFLOW = {
  name: "Daily Tech Trend Scraper",
  schedule: "0 6 * * *", // 06:00 daily

  nodes: [
    {
      // STEP 1: Parallel scraping
      type: "parallel",
      name: "Fetch All Sources",
      branches: [
        {
          name: "Hacker News",
          action: async () => {
            const response = await fetch(
              "https://hacker-news.firebaseio.com/v0/topstories.json"
            );
            const topIds = await response.json();
            const top30 = topIds.slice(0, 30);

            const stories = await Promise.all(
              top30.map(id =>
                fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`)
                  .then(r => r.json())
              )
            );

            return stories.filter(s => s.score > 100);
          }
        },
        {
          name: "Reddit ML",
          action: async () => {
            const response = await fetch(
              "https://www.reddit.com/r/MachineLearning/top.json?t=day&limit=30"
            );
            const data = await response.json();
            return data.data.children.map(c => c.data);
          }
        },
        {
          name: "GitHub Trending",
          action: async () => {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);

            const response = await fetch(
              `https://api.github.com/search/repositories?q=topic:ai+created:>${yesterday.toISOString().split('T')[0]}&sort=stars&order=desc`
            );
            const data = await response.json();
            return data.items.slice(0, 20);
          }
        },
        {
          name: "arXiv ML Papers",
          action: async () => {
            // Fetch recent ML papers from arXiv RSS
            const response = await fetch(
              "http://export.arxiv.org/api/query?search_query=cat:cs.LG&sortBy=submittedDate&sortOrder=descending&max_results=20"
            );
            const xml = await response.text();
            // Parse XML to JSON
            return parseArxivXML(xml);
          }
        }
      ]
    },

    {
      // STEP 2: Deduplicate & normalize
      type: "function",
      name: "Process Trends",
      action: (allTrends) => {
        const normalized = allTrends.flat().map(trend => ({
          source: trend.source,
          source_id: trend.id,
          source_url: trend.url,
          title: trend.title,
          description: trend.description || trend.selftext || trend.full_name,
          score: trend.score || trend.ups || trend.stargazers_count || 0,
          keywords: extractKeywords(trend.title + ' ' + trend.description)
        }));

        // Deduplicate by title similarity
        const deduped = deduplicateBySimilarity(normalized, threshold: 0.8);

        // Filter minimum score
        const filtered = deduped.filter(t => t.score > 50);

        // Sort by score
        const sorted = filtered.sort((a, b) => b.score - a.score);

        // Take top 10
        return sorted.slice(0, 10);
      }
    },

    {
      // STEP 3: AI Analysis with Claude
      type: "anthropic",
      name: "Analyze Trends with Claude",
      action: async (trends) => {
        const response = await anthropic.messages.create({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 8000,
          system: TREND_ANALYSIS_SYSTEM_PROMPT,
          messages: [{
            role: 'user',
            content: `Analyze these trending topics and generate course proposals:\n\n${JSON.stringify(trends, null, 2)}`
          }]
        });

        const proposals = JSON.parse(response.content[0].text);
        return proposals.course_proposals;
      }
    },

    {
      // STEP 4: Estimate costs & engagement
      type: "function",
      name: "Add Predictions",
      action: (proposals) => {
        return proposals.map(p => ({
          ...p,
          estimated_generation_cost_usd: estimateGenerationCost(p),
          estimated_engagement_score: predictEngagementScore(p)
        }));
      }
    },

    {
      // STEP 5: Save to database
      type: "supabase",
      name: "Save Trend Proposals",
      action: async (proposals) => {
        const { data, error } = await supabase
          .from('trend_proposals')
          .insert(proposals.map(p => ({
            source: p.source,
            source_url: p.source_url,
            source_id: p.source_id,
            title: p.course_title,
            description: p.description,
            keywords: p.keywords,
            trend_score: p.score,
            ai_course_proposal: p,
            estimated_duration_minutes: p.estimated_duration_minutes,
            estimated_generation_cost_usd: p.estimated_generation_cost_usd,
            estimated_engagement_score: p.estimated_engagement_score,
            status: p.estimated_engagement_score >= 70 ? 'approved' : 'pending'
          })))
          .select();

        return data;
      }
    },

    {
      // STEP 6: Notify (Phase 1 only)
      type: "condition",
      name: "Check if Phase 1",
      condition: process.env.PHASE === '1',
      onTrue: {
        type: "slack",
        name: "Notify Admin",
        action: async (proposals) => {
          await slack.send({
            channel: '#course-proposals',
            text: `🚨 ${proposals.length} new course proposals:\n\n${proposals.map(p => `• ${p.title} (${p.estimated_engagement_score}% predicted completion)`).join('\n')}\n\nReview: ${process.env.ADMIN_URL}/admin/proposals`
          });
        }
      }
    }
  ]
};
```

**TREND_ANALYSIS_SYSTEM_PROMPT:**

```typescript
const TREND_ANALYSIS_SYSTEM_PROMPT = `You are CourseHub's trend analyzer and course designer.

Your job: Convert trending tech topics into actionable, high-quality course proposals.

## Analysis Criteria

For each trend, evaluate:

1. **Relevance (0-100)**: Is this a fundamental shift or temporary hype?
2. **Timing (0-100)**: Is NOW the right time to teach this?
3. **Practical Value (0-100)**: Can students build something real?
4. **Longevity (0-100)**: Will this be relevant in 6+ months?
5. **Audience Demand (0-100)**: How many people need this?

**Overall Relevance Score = Average of above**

## Course Design Principles

- **Micro-learning**: 30-45 minutes max
- **Hands-on**: Students MUST build something
- **Current**: Use latest tools/APIs/techniques
- **Practical**: Real-world use cases, not toy examples

## Output Format

Return ONLY valid JSON array:

\`\`\`json
{
  "course_proposals": [
    {
      "course_title": "Build Production RAG Systems with LangChain",
      "description": "Learn to build retrieval-augmented generation systems that actually work in production.",
      "target_audience": "intermediate",
      "estimated_duration_minutes": 45,
      "key_learning_outcomes": [
        "Understand RAG architecture and when to use it",
        "Implement vector search with Pinecone",
        "Build a production RAG system with LangChain",
        "Optimize retrieval quality and cost"
      ],
      "course_structure": {
        "sections": [
          {
            "id": "intro",
            "title": "What is RAG and Why It Matters",
            "duration_minutes": 8,
            "type": "video",
            "key_concepts": ["RAG architecture", "Vector databases", "Embeddings"],
            "learning_objectives": ["Explain RAG to a colleague", "Identify when RAG is appropriate"]
          },
          {
            "id": "setup",
            "title": "Setting Up Your RAG Pipeline",
            "duration_minutes": 12,
            "type": "hands-on",
            "key_concepts": ["LangChain", "Pinecone", "OpenAI embeddings"],
            "learning_objectives": ["Initialize vector database", "Create embeddings pipeline"]
          },
          {
            "id": "build",
            "title": "Building the RAG System",
            "duration_minutes": 15,
            "type": "hands-on",
            "key_concepts": ["Retrieval", "Context injection", "Response generation"],
            "learning_objectives": ["Build complete RAG system", "Handle edge cases"]
          },
          {
            "id": "optimize",
            "title": "Production Optimizations",
            "duration_minutes": 7,
            "type": "video",
            "key_concepts": ["Caching", "Cost optimization", "Monitoring"],
            "learning_objectives": ["Reduce API costs by 70%", "Monitor system performance"]
          },
          {
            "id": "quiz",
            "title": "Knowledge Check",
            "duration_minutes": 3,
            "type": "quiz",
            "questions_count": 5
          }
        ]
      },
      "prerequisites": ["Python basics", "API experience", "Understanding of LLMs"],
      "practical_project": "Build a documentation Q&A chatbot for your company",
      "tags": ["RAG", "LangChain", "Vector DB", "Production AI"],
      "difficulty": "intermediate",
      "relevance_score": 95,
      "reasoning": "RAG is becoming the standard architecture for production AI apps. Massive demand from companies building AI products. Timely due to recent LangChain updates."
    }
  ]
}
\`\`\`

## Important Rules

- ONLY suggest courses with relevance_score >= 80
- If a trend is pure hype (crypto memecoins, etc.), skip it
- Focus on Tech/AI topics ONLY (no marketing, no soft skills)
- Each course MUST have a practical project
- Prefer intermediate/advanced over beginner (our audience is developers)
- Include estimated engagement score (0-100) based on topic appeal

Generate 3-5 high-quality proposals from the trending topics provided.`;
```

---

### N8N Workflow 2: Course Generator

**File:** `lib/ai/course-generator.ts`

```typescript
import { anthropic } from './anthropic-client';
import { supabase } from '@/lib/supabase/server';
import { generateEmbedding } from './embeddings';
import { generatePodcast } from './elevenlabs';
import { generateVideo } from './did-api';

export async function generateFullCourse(proposalId: string) {
  console.log(`🚀 Starting course generation for proposal ${proposalId}`);

  const startTime = Date.now();

  // Update status
  await supabase
    .from('trend_proposals')
    .update({ status: 'generating' })
    .eq('id', proposalId);

  // Fetch proposal
  const { data: proposal } = await supabase
    .from('trend_proposals')
    .select('*')
    .eq('id', proposalId)
    .single();

  if (!proposal) throw new Error('Proposal not found');

  try {
    // ═══════════════════════════════════════
    // STEP 1: Generate Detailed Curriculum (5 min)
    // ═══════════════════════════════════════
    console.log('📚 Step 1/7: Generating detailed curriculum...');

    const curriculumResponse = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 6000,
      system: CURRICULUM_GENERATOR_SYSTEM_PROMPT,
      messages: [{
        role: 'user',
        content: `Generate detailed curriculum for this course proposal:\n\n${JSON.stringify(proposal.ai_course_proposal, null, 2)}`
      }]
    });

    const curriculum = JSON.parse(curriculumResponse.content[0].text);
    console.log(`✅ Curriculum: ${curriculum.sections.length} sections`);

    // ═══════════════════════════════════════
    // STEP 2: Generate Content in PARALLEL (20 min)
    // ═══════════════════════════════════════
    console.log('✍️ Step 2/7: Generating content (parallel)...');

    const [
      videoTranscripts,
      quizzes,
      exercises,
      podcastAudio
    ] = await Promise.all([
      generateVideoTranscripts(curriculum.sections.filter(s => s.type === 'video')),
      generateQuizzes(curriculum.sections.filter(s => s.type === 'quiz')),
      generateExercises(curriculum.sections.filter(s => s.type === 'hands-on')),
      generatePodcast(curriculum)
    ]);

    console.log(`✅ Content generated`);

    // ═══════════════════════════════════════
    // STEP 3: Generate Video (CONDITIONAL)
    // ═══════════════════════════════════════
    let videoUrl = null;
    const videoCostEstimate = estimateVideoCost(videoTranscripts);

    if (videoCostEstimate < 3.00) {
      console.log(`🎥 Step 3/7: Generating video ($${videoCostEstimate})...`);
      videoUrl = await generateVideo(videoTranscripts);
      console.log(`✅ Video generated`);
    } else {
      console.log(`⏭️ Step 3/7: Skipping video (cost $${videoCostEstimate} > $3.00)`);
    }

    // ═══════════════════════════════════════
    // STEP 4: Generate Embeddings
    // ═══════════════════════════════════════
    console.log('🔍 Step 4/7: Generating embeddings...');

    const embeddingText = `${curriculum.title} ${curriculum.description} ${curriculum.tags.join(' ')}`;
    const embedding = await generateEmbedding(embeddingText);

    console.log(`✅ Embeddings generated`);

    // ═══════════════════════════════════════
    // STEP 5: Generate A/B Variant
    // ═══════════════════════════════════════
    console.log('🔬 Step 5/7: Generating A/B variant...');

    const variantCurriculum = await generateVariantCurriculum(curriculum);

    console.log(`✅ Variant generated`);

    // ═══════════════════════════════════════
    // STEP 6: Calculate Costs & Save
    // ═══════════════════════════════════════
    console.log('💾 Step 6/7: Saving to database...');

    const generationTimeMinutes = Math.round((Date.now() - startTime) / 60000);
    const totalCost = calculateTotalCost({
      curriculum: curriculumResponse,
      transcripts: videoTranscripts,
      quizzes,
      exercises,
      podcast: podcastAudio,
      video: videoUrl,
      variant: variantCurriculum
    });

    console.log(`💰 Total cost: $${totalCost.toFixed(2)}`);
    console.log(`⏱️ Total time: ${generationTimeMinutes} minutes`);

    // Generate variant group ID
    const variantGroupId = crypto.randomUUID();
    const slug = slugify(curriculum.title);

    // Merge transcripts into sections
    const sectionsWithContent = curriculum.sections.map(section => {
      if (section.type === 'video') {
        const transcript = videoTranscripts.find(t => t.section_id === section.id);
        return { ...section, transcript: transcript?.content };
      }
      if (section.type === 'quiz') {
        const quiz = quizzes.find(q => q.section_id === section.id);
        return { ...section, questions: quiz?.questions };
      }
      if (section.type === 'hands-on') {
        const exercise = exercises.find(e => e.section_id === section.id);
        return { ...section, exercise };
      }
      return section;
    });

    // Save Version A
    const { data: courseA } = await supabase.from('courses').insert({
      title: curriculum.title,
      slug: slug,
      description: curriculum.description,
      short_description: curriculum.short_description,
      curriculum: { ...curriculum, sections: sectionsWithContent },
      transcript: videoTranscripts.map(t => t.content).join('\n\n'),
      video_url: videoUrl,
      podcast_url: podcastAudio.url,
      quiz_questions: quizzes.flatMap(q => q.questions),
      exercises: exercises,
      primary_topic: curriculum.primary_topic,
      sub_topic: curriculum.sub_topic,
      tags: curriculum.tags,
      difficulty: curriculum.difficulty,
      prerequisites: curriculum.prerequisites,
      estimated_duration_minutes: curriculum.estimated_duration_minutes,
      embedding: embedding,
      generation_cost_usd: totalCost,
      generation_time_minutes: generationTimeMinutes,
      trend_proposal_id: proposalId,
      variant: 'A',
      variant_group_id: variantGroupId,
      status: 'published',
      published_at: new Date().toISOString()
    }).select().single();

    // Save Version B (variant)
    await supabase.from('courses').insert({
      ...courseA,
      id: crypto.randomUUID(),
      slug: `${slug}-v2`,
      curriculum: variantCurriculum,
      variant: 'B'
    });

    // Update proposal
    await supabase
      .from('trend_proposals')
      .update({
        status: 'published',
        generated_course_id: courseA.id,
        actual_generation_cost_usd: totalCost,
        actual_generation_time_minutes: generationTimeMinutes
      })
      .eq('id', proposalId);

    console.log(`✅ Course published: /courses/${slug}`);

    // ═══════════════════════════════════════
    // STEP 7: Notify Success
    // ═══════════════════════════════════════
    console.log('📢 Step 7/7: Sending notifications...');

    // Slack notification
    if (process.env.SLACK_WEBHOOK_URL) {
      await fetch(process.env.SLACK_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `🎉 New course published!\n\n*${courseA.title}*\n\nCost: $${totalCost.toFixed(2)} | Time: ${generationTimeMinutes}min\n\nView: ${process.env.NEXT_PUBLIC_APP_URL}/courses/${slug}`
        })
      });
    }

    console.log('✅ Course generation complete!');

    return courseA;

  } catch (error) {
    console.error('❌ Course generation failed:', error);

    // Update proposal status
    await supabase
      .from('trend_proposals')
      .update({
        status: 'rejected',
        rejection_reason: error.message
      })
      .eq('id', proposalId);

    throw error;
  }
}

// ═══════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════

async function generateVideoTranscripts(videoSections: any[]) {
  return await Promise.all(
    videoSections.map(async (section) => {
      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2500,
        system: VIDEO_SCRIPT_SYSTEM_PROMPT,
        messages: [{
          role: 'user',
          content: `Generate engaging video script for this section:\n\n${JSON.stringify(section, null, 2)}`
        }]
      });

      return {
        section_id: section.id,
        content: response.content[0].text
      };
    })
  );
}

async function generateQuizzes(quizSections: any[]) {
  return await Promise.all(
    quizSections.map(async (section) => {
      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2000,
        system: QUIZ_GENERATOR_SYSTEM_PROMPT,
        messages: [{
          role: 'user',
          content: `Generate quiz questions for this section:\n\n${JSON.stringify(section, null, 2)}`
        }]
      });

      return {
        section_id: section.id,
        questions: JSON.parse(response.content[0].text).questions
      };
    })
  );
}

async function generateExercises(exerciseSections: any[]) {
  return await Promise.all(
    exerciseSections.map(async (section) => {
      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 3000,
        system: EXERCISE_GENERATOR_SYSTEM_PROMPT,
        messages: [{
          role: 'user',
          content: `Generate hands-on coding exercise:\n\n${JSON.stringify(section, null, 2)}`
        }]
      });

      return JSON.parse(response.content[0].text);
    })
  );
}

async function generateVariantCurriculum(originalCurriculum: any) {
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 6000,
    system: `Generate an ALTERNATIVE version of this course for A/B testing.

Keep the same learning outcomes but:
- Use different teaching approach (theory-first vs. practice-first)
- Different examples and analogies
- Different section order (if appropriate)
- Different tone (more casual vs. more formal)

Goal: Test which approach gets better completion rates.

Return ONLY valid JSON matching the original structure.`,
    messages: [{
      role: 'user',
      content: JSON.stringify(originalCurriculum, null, 2)
    }]
  });

  return JSON.parse(response.content[0].text);
}

function calculateTotalCost(components: any): number {
  let total = 0;

  // Claude API costs (input + output tokens)
  const CLAUDE_INPUT_COST_PER_1M = 3.00;
  const CLAUDE_OUTPUT_COST_PER_1M = 15.00;

  // Estimate tokens (rough approximation)
  total += (10000 / 1000000) * CLAUDE_INPUT_COST_PER_1M; // Input
  total += (20000 / 1000000) * CLAUDE_OUTPUT_COST_PER_1M; // Output

  // ElevenLabs (if used)
  if (components.podcast) {
    total += components.podcast.cost || 0.50;
  }

  // D-ID/HeyGen (if used)
  if (components.video) {
    total += 2.00; // Rough estimate
  }

  return total;
}

function estimateVideoCost(transcripts: any[]): number {
  const totalMinutes = transcripts.length * 3; // ~3 min per transcript
  return totalMinutes * 0.60; // $0.60 per minute estimate
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}
```

**System Prompts (excerpt):**

```typescript
const VIDEO_SCRIPT_SYSTEM_PROMPT = `You are a world-class technical educator writing video scripts.

Your scripts should:
- Start with a hook (why this matters)
- Be conversational but precise
- Use analogies for complex concepts
- Include visual cues (e.g., "Let's look at this diagram...")
- End with a clear takeaway

Format: Plain text, 500-800 words, designed to be read aloud in 3-5 minutes.`;

const QUIZ_GENERATOR_SYSTEM_PROMPT = `Generate multiple-choice quiz questions that test understanding, not memorization.

Rules:
- 4 options per question
- Include 1 correct answer, 3 plausible distractors
- Mix difficulty (2 easy, 2 medium, 1 hard)
- Focus on practical application, not trivia

Output JSON format:
{
  "questions": [
    {
      "question": "When should you use RAG instead of fine-tuning?",
      "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
      "correct": "C",
      "explanation": "RAG is better when..."
    }
  ]
}`;

const EXERCISE_GENERATOR_SYSTEM_PROMPT = `Create a hands-on coding exercise that reinforces the concepts taught.

The exercise should:
- Have clear instructions
- Include starter code
- Have a testable outcome
- Take 10-15 minutes to complete
- Be realistic (not a toy problem)

Output JSON format:
{
  "title": "Build a RAG Q&A System",
  "instructions": "...",
  "starter_code": "...",
  "solution_code": "...",
  "test_cases": [...],
  "hints": [...]
}`;
```

---

## 🎯 SUCCESS METRICS

### North Star Metrics (by Phase)

| Phase | North Star | Target | Why |
|-------|-----------|--------|-----|
| **Phase 1** | Generation Speed | <4 hours (trend → published) | Proves speed moat |
| **Phase 2** | Daily Active Users (DAU) | 1,000 | Validates PMF |
| **Phase 3** | Weekly Active Companies | 500 | Validates B2B value |
| **Phase 4** | Monthly Recurring Revenue | $50K | Proves business model |

### Key Performance Indicators

```typescript
const KPIs = {
  // GENERATION EFFICIENCY
  avg_generation_time_hours: {
    target: '<4',
    current: null,
    tracked_since: '2025-01-01'
  },
  avg_generation_cost_usd: {
    target: '<$2',
    current: null,
    alert_if: '>$3'
  },
  courses_published_per_week: {
    target_phase1: '7',
    target_phase2: '14',
    target_phase3: '21'
  },

  // USER ENGAGEMENT
  daily_active_users: {
    target_phase2: 1000,
    target_phase3: 10000
  },
  course_completion_rate: {
    target: '>60%',
    industry_avg: '15%', // Udemy
    our_moat: 'Shorter courses + better quality'
  },
  avg_time_to_first_completion: {
    target: '<24h from signup',
    measure: 'Hours between signup and first course completion'
  },
  user_retention_d7: {
    target: '>40%',
    measure: '% of users who return within 7 days'
  },
  user_retention_d30: {
    target: '>20%',
    measure: '% of users active after 30 days'
  },

  // LEARNING EFFECTIVENESS
  avg_quiz_score: {
    target: '>75%',
    alert_if: '<60%' // Course might be too hard or unclear
  },
  knowledge_retention_d7: {
    target: '>70%',
    measure: 'Re-quiz users 7 days later'
  },
  course_rating: {
    target: '>4.2/5',
    industry_avg: '4.4/5'
  },

  // COMPANY METRICS (Phase 3+)
  companies_active: {
    target: 500
  },
  avg_employees_per_company: {
    target: 8,
    ltv_driver: 'More employees = higher value'
  },
  company_monthly_active_rate: {
    target: '>60%',
    measure: '% of companies with active employees this month'
  },

  // REVENUE (Phase 4)
  mrr: {
    target: '$50K'
  },
  arpu: {
    target: '$100',
    measure: 'Average revenue per paying company'
  },
  cac: {
    target: '<$50',
    measure: 'Customer acquisition cost'
  },
  ltv_cac_ratio: {
    target: '>3',
    healthy_threshold: 3
  },

  // AI PERFORMANCE
  trend_to_course_accuracy: {
    target: '>80%',
    measure: '% of generated courses that get >50 completions'
  },
  ab_test_lift: {
    track: 'How much better is winning variant (%)',
    typical_range: '5-20%'
  },
  support_chat_resolution_rate: {
    target: '>70% without human',
    phase1: 'Not applicable',
    phase2: 'Launch AI support'
  }
};
```

### Special Metric: Knowledge Transmission Speed

```typescript
// Our unique competitive metric
const KNOWLEDGE_TRANSMISSION_SPEED = {
  name: "Trend to User Certification",
  description: "Time from trending topic detection to user completing course",

  target: '<48 hours',

  breakdown: {
    trend_detection: '<1 hour (continuous scraping)',
    course_generation: '<4 hours',
    user_discovery: '<12 hours (SEO + social)',
    user_completion: '<31 hours (avg course 45 min)'
  },

  competitive_advantage: {
    us: '48 hours',
    udemy: '6-12 months',
    coursera: '12-24 months',
    youtube: '1-2 weeks (but low quality)'
  }
};
```

---

## 💡 RADICAL IDEAS (Elon-Approved)

### 1. Real-Time Personalized Course Generation

**User types:** "Teach me how to build a RAG system for my e-commerce documentation"

**AI generates CUSTOM course in 30 minutes:**

```typescript
POST /api/generate-custom-course

{
  "query": "Teach me RAG for e-commerce docs",
  "user_id": "...",
  "urgency": "immediate" // vs. "queue"
}

// Response after 30 min:
{
  "course_id": "uuid",
  "status": "ready",
  "personalized_for": {
    "use_case": "e-commerce documentation RAG",
    "skill_level": "intermediate (detected from past courses)",
    "examples": "e-commerce specific (product catalogs, return policies)"
  },
  "estimated_time": "42 minutes",
  "custom_exercises": [
    "Build RAG for your own product catalog",
    "Handle multilingual product descriptions"
  ]
}
```

**Implementation:**
- Same pipeline as batch generation
- But personalized based on user context
- Higher cost ($3-5 per course) but worth it
- Phase 3 feature

---

### 2. Job Market Intelligence

**Scrape job postings daily → Auto-generate courses for in-demand skills**

```typescript
// n8n workflow: "job-market-analyzer"

Daily workflow:
1. Scrape Indeed, LinkedIn for "Machine Learning Engineer" jobs
2. Extract required skills from descriptions
3. Compare to existing course catalog
4. Generate courses for skill gaps
5. Notify users: "🔥 New high-demand skill: Rust for WebAssembly (1,247 jobs)"
```

**User value:**
- Learn what companies actually hire for
- Stay ahead of job market trends
- Increase employability

**Monetization angle (Phase 4):**
- Companies sponsor courses ("This course sponsored by AWS")
- Job boards pay for placement

---

### 3. "Surprise Me" Learning Paths

**AI generates random but personalized learning journey**

```typescript
GET /api/surprise-me

Response:
{
  "learning_path": [
    {
      "course_id": "...",
      "title": "Advanced Prompt Engineering",
      "why": "Based on your AI interest + trending skill",
      "position": 1
    },
    {
      "course_id": "...",
      "title": "Building Production APIs with FastAPI",
      "why": "Complements your Python skills",
      "position": 2
    },
    {
      "course_id": "...",
      "title": "Vector Databases Deep Dive",
      "why": "Trending + relevant to your career goal (AI Engineer)",
      "position": 3
    }
  ],
  "total_time": "2 hours 15 minutes",
  "skill_tree_unlock": "Full-Stack AI Engineer",
  "job_market_alignment": "87% match with current AI job postings"
}
```

**Gamification:**
- "Complete this path to unlock: Full-Stack AI Engineer badge"
- Leaderboard: "Top surprise-me adventurers this week"

---

### 4. Transparent AI Economics

**Every course shows:**

```markdown
💰 This course cost $0.47 in AI to generate
⚡ Generated in 2.3 hours
🆓 100% free for you

**Why?** We believe in transparent AI economics.
If we can generate world-class content for $0.47,
why should you pay $49.99?
```

**Benefits:**
- Builds trust
- Shows our moat (cost efficiency)
- Differentiates from traditional platforms
- Press-worthy ("EdTech startup exposes industry margins")

---

### 5. Community-Driven Trend Suggestions

**Users can suggest topics → Community upvotes → AI auto-generates**

```typescript
POST /api/suggest-topic

{
  "topic": "Anthropic's new Claude Code feature",
  "description": "Just released yesterday, no tutorials exist yet",
  "why_urgent": "I need to implement this for work ASAP",
  "upvotes": 0
}

// If gets 50 upvotes in 24h → Auto-generate within 12h
```

**Features:**
- Upvote/downvote like Reddit
- Trending suggestions page
- Email notify when suggestion becomes course
- Gamification: "Your suggestion got 500 learners!"

---

## 🚀 2-WEEK MVP SPRINT PLAN

### Week 1: Foundation + First Course

**Day 1-2: Infrastructure Setup**
- [x] Create Supabase project
- [x] Run database migrations (schema.sql)
- [x] Deploy Next.js to Vercel
- [x] Setup n8n (DigitalOcean droplet or n8n cloud)
- [x] Configure API keys (Claude, ElevenLabs)
- [x] Test connectivity

**Day 3-4: Generation Pipeline**
- [x] Build n8n workflow: Trend scraper
- [x] Test scraping HN, Reddit, GitHub
- [x] Implement Claude course generator
- [x] Test ElevenLabs podcast generation
- [x] **MILESTONE:** Generate 1 complete course manually

**Day 5: Course Player**
- [x] Build course viewing page (`/courses/[slug]`)
- [x] Implement video/audio player (Plyr.js)
- [x] Build quiz interface
- [x] Implement progress tracking (Supabase Realtime)

**Day 6-7: Auth + Admin**
- [x] User signup/auth (Supabase)
- [x] Admin dashboard (`/admin/proposals`)
- [x] 1-click course generation from admin
- [x] **MILESTONE:** Deploy + generate 3 more courses
- [x] Test with 5 beta users

**Success Criteria Week 1:**
- ✅ 4 AI-generated courses published
- ✅ Working course player
- ✅ User signup functional
- ✅ 5 beta users complete at least 1 course

---

### Week 2: Automation + Launch

**Day 8-9: Automation**
- [x] Schedule n8n daily scraping (06:00 CET)
- [x] Implement analytics event tracking
- [x] Progress sync (realtime)
- [x] Email notifications (Resend)

**Day 10-11: Company Features**
- [x] Company profiles
- [x] Employee invite system
- [x] Company dashboard (progress overview)
- [x] Basic analytics

**Day 12: AI Support**
- [x] Build chat interface
- [x] Implement Claude-powered support bot
- [x] Course recommendations based on interests

**Day 13-14: Polish + Launch**
- [x] Marketing landing page
- [x] Onboarding flow (3-step)
- [x] Email capture
- [x] Social sharing
- [x] **LAUNCH:**
  - Post on Hacker News
  - Post on r/MachineLearning
  - Email to waitlist
- [x] **TARGET:** 100 signups in 48h

**Success Criteria Week 2:**
- ✅ 10 AI-generated courses live
- ✅ 100 signups
- ✅ 50 course completions
- ✅ >50% completion rate
- ✅ No major bugs

---

## 📁 PROJECT STRUCTURE

```
coursehub/
├── frontend/                        # Next.js 15 App
│   ├── app/                         # App Router
│   │   ├── (marketing)/             # Public pages
│   │   │   ├── page.tsx             # Landing page
│   │   │   └── about/
│   │   ├── (auth)/                  # Auth pages
│   │   │   ├── login/
│   │   │   └── signup/
│   │   ├── courses/                 # Course pages
│   │   │   ├── page.tsx             # Course catalog
│   │   │   └── [slug]/              # Course player
│   │   ├── dashboard/               # User dashboard
│   │   ├── company/                 # Company dashboard
│   │   ├── admin/                   # Admin panel
│   │   │   ├── proposals/           # Approve trends
│   │   │   ├── courses/             # Manage courses
│   │   │   └── analytics/
│   │   ├── api/                     # API routes
│   │   │   ├── generate-custom-course/
│   │   │   ├── surprise-me/
│   │   │   └── webhooks/
│   │   └── layout.tsx
│   ├── components/
│   │   ├── ui/                      # shadcn/ui
│   │   ├── course/
│   │   │   ├── CoursePlayer.tsx
│   │   │   ├── VideoPlayer.tsx
│   │   │   ├── QuizInterface.tsx
│   │   │   └── ProgressBar.tsx
│   │   ├── ai/
│   │   │   ├── ChatBot.tsx
│   │   │   └── CourseRecommendations.tsx
│   │   ├── company/
│   │   │   └── AnalyticsDashboard.tsx
│   │   └── admin/
│   │       └── ProposalReviewCard.tsx
│   ├── lib/
│   │   ├── ai/
│   │   │   ├── course-generator.ts  # Main generation logic
│   │   │   ├── anthropic-client.ts
│   │   │   ├── elevenlabs.ts        # Podcast generation
│   │   │   ├── did-api.ts           # Video generation
│   │   │   ├── embeddings.ts
│   │   │   └── prompts/
│   │   │       ├── curriculum.ts
│   │   │       ├── quiz.ts
│   │   │       └── exercise.ts
│   │   ├── supabase/
│   │   │   ├── client.ts
│   │   │   └── server.ts
│   │   └── utils.ts
│   ├── prisma/                      # (if using Prisma) eller bare SQL
│   └── public/
├── n8n/                             # n8n Workflows
│   ├── workflows/
│   │   ├── daily-trend-scraper.json
│   │   ├── course-generator.json
│   │   └── job-market-analyzer.json
│   └── credentials/                 # (git-ignored)
├── supabase/                        # Supabase config
│   ├── migrations/
│   │   └── 001_initial_schema.sql
│   ├── functions/                   # Edge Functions
│   │   └── generate-course/
│   └── config.toml
├── docs/
│   ├── PROJECT.md                   # This file
│   ├── SPRINT-PLAN.md
│   └── API-DOCS.md
└── scripts/
    ├── seed-courses.ts
    └── analyze-costs.ts
```

---

## 🔒 WHAT TO REMOVE/ARCHIVE

### ❌ DELETE COMPLETELY

These features don't fit the new vision:

- ❌ Instructor/Provider onboarding flows
- ❌ Course scheduling system (`course_dates` table)
- ❌ Booking/reservation system
- ❌ Commission calculations
- ❌ Stripe Connect (instructor payouts)
- ❌ All "Contact Sales" CTAs
- ❌ Phone/email support infrastructure
- ❌ Manual course creation UI

### 📦 ARCHIVE (Keep code, make inactive)

Phase 4 features - keep but don't activate:

- 📦 Stripe Checkout (for paid company plans)
- 📦 Provider dashboard (for marketplace)
- 📦 Invoice generation
- 📦 Subscription management

### 🔄 KEEP & UPDATE

These stay but need updates:

- ✅ User authentication (Supabase Auth)
- ✅ Company profiles (for employee tracking)
- ✅ Progress tracking (core feature)
- ✅ Analytics (essential)
- ✅ Admin panel (repurpose for trends)

---

## 🧹 MIGRATION TASKS

### Clean Existing Data

```sql
-- STEP 1: Backup (just in case)
-- Run: pg_dump from Supabase dashboard

-- STEP 2: Delete dummy data
DELETE FROM purchases;
DELETE FROM courses;
DELETE FROM providers;
-- course_dates table should be dropped entirely

-- STEP 3: Fix user roles
UPDATE users
SET role = 'USER'
WHERE role = 'COMPANY_USER'
AND company_id IS NULL;

-- STEP 4: Clean categories (Tech/AI only)
UPDATE categories
SET is_active = false
WHERE name NOT IN (
  'AI/ML',
  'Cloud Computing',
  'Frontend Development',
  'Backend Development',
  'Mobile Development',
  'DevOps',
  'Data Engineering'
);

-- STEP 5: Drop obsolete tables
DROP TABLE IF EXISTS course_dates;
DROP TABLE IF EXISTS instructors;

-- STEP 6: Run new migrations
-- (Handled by Supabase migration system)
```

---

## 📝 CODING CONVENTIONS

### TypeScript

```typescript
// ALWAYS use TypeScript strict mode
// ALWAYS define types for data structures
// PREFER type over interface for simple types

// Good:
type CourseStatus = 'draft' | 'published' | 'archived';

interface Course {
  id: string;
  title: string;
  status: CourseStatus;
  sections: CourseSection[];
}

// Bad:
const course: any = { ... };
```

### React (Next.js 15)

```typescript
// PREFER Server Components (default)
// USE Client Components only when needed

// Server Component:
export default async function CoursePage({ params }) {
  const course = await getCourse(params.slug);
  return <CoursePlayer course={course} />;
}

// Client Component:
'use client';
export function QuizInterface() {
  const [answer, setAnswer] = useState('');
  // ...
}
```

### Error Handling

```typescript
// ALWAYS handle errors explicitly
// LOG to Sentry for debugging

try {
  const course = await generateCourse(proposalId);
  return course;
} catch (error) {
  console.error('Course generation failed:', error);
  Sentry.captureException(error);
  throw new AppError('GENERATION_FAILED', error.message);
}
```

---

## 🚨 NEVER DO THIS

❌ Store API keys in code
❌ Skip RLS policies on new tables
❌ Use `any` type in TypeScript
❌ Make API calls directly in components (use server actions)
❌ Forget error handling
❌ Deploy without testing locally
❌ Force push to main
❌ Skip database migrations
❌ Generate courses without cost tracking
❌ Publish courses without A/B variant

---

## 📞 WHEN YOU'RE STUCK

**Ask Claude Code directly:**
> "Claude, jeg sidder fast med [problem]. Hvad er den bedste måde at [løsning] på i vores tech stack?"

**Common Issues:**

| Problem | Solution |
|---------|----------|
| Supabase RLS not working | Check policies, verify auth state |
| AI generation too slow | Implement parallel processing, check API latency |
| Course completion rate low | A/B test different course lengths, analyze drop-off points |
| n8n workflow failing | Check webhook URLs, verify credentials, check logs |
| Video generation too expensive | Skip video, use podcast only, or reduce video length |

---

## ✅ QUALITY CHECKLIST

Før du merger code, check:

- [ ] TypeScript errors: 0
- [ ] RLS policies added for new tables
- [ ] Error handling implemented
- [ ] Loading states added (Suspense/skeleton)
- [ ] Mobile responsive (test on phone)
- [ ] Accessibility (keyboard nav, ARIA labels)
- [ ] Performance: No unnecessary re-renders
- [ ] Security: No secrets in code, rate limiting on APIs
- [ ] Analytics events added (PostHog)
- [ ] Cost tracking added (if AI feature)
- [ ] A/B test variant created (if new course feature)

---

## 🎯 CURRENT PRIORITIES

### This Week (Week 1)
- [ ] Setup infrastructure
- [ ] Build generation pipeline
- [ ] Create course player
- [ ] Test with 5 beta users

### Next Week (Week 2)
- [ ] Automate everything
- [ ] Add company features
- [ ] Launch to 100 users

### Next Month (Phase 2)
- [ ] Real-time personalization
- [ ] Auto-publish (remove admin approval)
- [ ] A/B testing engine
- [ ] AI support chat

---

**LÆS ALTID DENNE FIL FØR DU STARTER PÅ EN NY OPGAVE.**

Spørg hvis noget er uklart. Det er bedre at spørge end at bygge forkert.

**Lad os bygge fremtidens learning platform. 🚀**

---

*Last updated: 2025-01-15*
*Version: 2.0 (Radical Pivot)*
*Next review: After Phase 1 completion*
