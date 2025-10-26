# COURSEHUB V2.0 - KNOWLEDGE TRANSMISSION PLATFORM

⚠️ **CRITICAL: Læs dette først**

Dette dokument beskriver en radikal, speed-first tilgang.
Vi bygger IKKE det perfekte produkt. Vi beviser at konceptet virker på 7 dage.

Hvis du finder dig selv i at tænke "men hvad med [fancy feature]?" - stop.
Skriv det ned i Phase 4 backlog og fortsæt med MVP.

**Vi shipper i 7 dage. Alt andet er noise.**

---

## 🎯 VISION: THE FASTEST LEARNING PLATFORM ON EARTH

CourseHub er ikke en kursusplatform. Det er en **knowledge transmission engine**.

### Mission
Fra trending tech topic til certificeret bruger på **under 48 timer**.

### Hvordan Det Virker
1. **AI scraper** real-time tech trends (starter med HackerNews)
2. **Claude Sonnet 4.5** genererer personaliseret kursusmateriale på **2-4 timer**
3. **Brugere** lærer cutting-edge tech **før** Udemy/Coursera ved det eksisterer
4. **100% GRATIS** i Phase 1-3 for at opbygge verdens største tech learning community

### Competitive Moat

| Metric | CourseHub | Traditional Platforms |
|--------|-----------|---------------------|
| **Speed** | Trend → Course: 4 timer | 6-12 måneder |
| **Cost** | $0 | $50-200 per kurs |
| **Freshness** | Dagligt opdateret | Quarterly updates |

---

## ⚡ SPEED IS EVERYTHING

Dette er ikke et normalt udviklingsprojekt. Vi bygger ikke det perfekte produkt.
Vi beviser at AI kan generere world-class learning content hurtigere end mennesker.

**Princip:**
- 1 uge til MVP → Test med rigtige brugere → Lær → Itérer
- Better to ship 80% solution på dag 7 end 100% solution på dag 30
- Features uden users er waste
- Optimization uden data er guessing

**Red flags du skal undgå:**
- ❌ "Lad os bare tilføje X feature, det tager kun 2 dage"
- ❌ "Vi bør optimere Y før vi launcher"
- ❌ "Hvad hvis brugerne vil have Z?" (de ved ikke hvad de vil have)

**Instead:**
- ✅ "Kan vi shippe uden denne feature?"
- ✅ "Hvad er den simpleste version der virker?"
- ✅ "Lad os teste med 10 brugere først"

**Mantra:** Ship → Learn → Iterate → Scale

---

## 📈 ROADMAP: 4 AGGRESSIVE FASER

### Fase 1 (7 DAGE): MVP - Proof of Concept
**Mål:** Bevise at AI kan generere world-class content faster end humans

**Deliverables:**
- ✅ n8n scraper (KUN HackerNews top 5 dagligt)
- ✅ Claude genererer 1 komplet kursus i text format
- ✅ Admin dashboard med 1-click godkendelse
- ✅ Ultra-basic course player (text + quiz ONLY - ingen video/podcast endnu)
- ✅ User signup + basic progress tracking
- ✅ 5 AI-genererede Tech/AI kurser published

**Success Metric:** 50 beta users, 10 completer første kursus
**Timeline:** Ship på dag 7

**DAG-FOR-DAG PLAN:**
```
Day 1-2: n8n HackerNews scraper → Supabase (database migreret ✅)
Day 3-4: Claude course generator (text only)
Day 4-5: Minimal course player (90s startup æstetik)
Day 6: Test med 10 folk, fix critical bugs
Day 7: Launch til 50 tech folk på Twitter/LinkedIn
```

---

### Fase 2 (14 DAGE): Core Features
**Mål:** Gør produktet self-service og brugbart

**Fokuserede features (kun disse):**
- 🎙️ **Audio podcast generation** (ElevenLabs, 10-15 min episodes)
  - Text-to-speech af course content
  - Ingen fancy editing, bare voice-over

- 🎯 **Personalized course requests**
  ```typescript
  // User: "Teach me RAG systems"
  // AI: Generates custom course in 2 hours
  ```

- 🏢 **Ultra-basic company dashboard**
  - 3 metrics only: Enrolled, Completed, Time Spent
  - Ingen fancy analytics endnu

- 📱 **Mobile-responsive player**
  - Works på phone, ingen app
  - Offline kommer senere

**Success Metric:** 100 DAU, 50%+ completion rate
**Timeline:** Ship i 14 dage

---

### Fase 3 (4 UGER): Intelligence & Scale
**Mål:** Auto-publish og intelligent content generation

**Features:**
- 🤖 **Auto-publish pipeline** (kill admin approval helt)
  - AI vurderer quality score
  - Auto-publish hvis >70% confidence

- 🔍 **Semantic search**
  - Find kurser baseret på meaning, ikke kun keywords
  - Generate custom course hvis gap

- 🎲 **Content Lifecycle Management** (aktiveres ved 50+ kurser)
  - Auto-archive low-performing content (<30% completion)
  - Keep catalog fresh og relevant

- 📊 **Basic analytics for companies**
  - Skill gap analysis
  - ROI calculations
  - Custom learning paths

**Success Metric:** 1,000 DAU, 60%+ completion, auto-publish working
**Timeline:** Ship i 4 uger

---

### Fase 4 (SENERE): Advanced Features & Monetization
Alt det fancy kommer her:
- Multi-language support
- Video generation (DID API)
- Advanced gamification
- Predictive course generation
- A/B testing engine
- Monetization ($50K MRR target)

---

## 🛠 TECH STACK

### Phase 1 Tech Stack (MINIMAL)

```typescript
Frontend:
- Next.js 15 (Pages Router indtil videre - migration til App Router i Phase 3 hvis nødvendigt)
- Tailwind CSS
- shadcn/ui (kun basics: button, card, input)
- INGEN fancy animations

Backend:
- Supabase (Auth + Database + Storage)
- Server Actions eller API routes (simple)

AI:
- Anthropic Claude API (course generation)
- INGEN video, INGEN voice (endnu)

Automation:
- n8n (1 workflow: HackerNews scraper)

Analytics:
- PostHog basic events (signup, course_start, course_complete)
```

### Phase 2 tilføjer:
```typescript
AI:
+ ElevenLabs (text-to-speech)

Analytics:
+ Company dashboard metrics
```

### Phase 3 tilføjer:
```typescript
AI:
+ Embeddings (semantic search)
+ Auto-publish logic

Features:
+ Content lifecycle management
```

---

## 🗄 DATABASE SCHEMA

**Status:** ✅ Migreret og klar (se frontend/migrations/complete-database-setup.sql)

### Core Models (AI-First):

1. **users** - Authentication og rolle management
   - Roles: USER, COMPANY_USER, COMPANY_ADMIN, PROVIDER, SUPER_ADMIN
   - Links til company (optional) for B2B tracking

2. **courses** - AI-generated course content (100% FREE i Phase 1-3)
   - Basic: title, description, duration, level, categoryId
   - AI metadata: isAIGenerated, aiModel, generationCostUsd, generationTimeMinutes
   - Content: curriculumJson, videoUrl, podcastUrl, transcriptUrl
   - A/B testing: abTestVariant, engagementScore
   - Link til trendProposalId

3. **trend_proposals** - AI-analyzed trending topics (Phase 1+)
   - Source: HackerNews (expanderer i Phase 2)
   - AI analysis: aiCourseProposal (JSONB med suggested course outline)
   - Workflow: status (PENDING → APPROVED → GENERATING → PUBLISHED)
   - Economics: estimatedGenerationCostUsd, actualGenerationCostUsd

4. **course_progress** - Detailed user learning tracking
   - Section-level: currentSectionId, completedSections[]
   - Time tracking: totalTimeMinutes, lastAccessedAt, completedAt
   - Engagement: quizScores (JSONB), exercisesCompleted (JSONB)

5. **categories** - Tech/AI focused categories (6 categories)
   - AI/ML, Cloud Computing, Frontend, Backend, DevOps, Data Engineering

6. **companies** - B2B company profiles (for employee tracking)

7. **ai_interactions** - AI chat/recommendations tracking

**RLS Policies:** ✅ Enabled og konfigureret
**Indexes:** ✅ Performance indexes på alle core queries

---

## 🤖 AI CONTENT GENERATION PIPELINE

### Phase 1 (Manual Approval):

```
┌─────────────────────────────────────────────┐
│  TREND DISCOVERY (Daily 06:00)              │
│  n8n scrapes HackerNews top stories         │
│  → AI analyzes trends                       │
│  → Generates course proposals               │
└─────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────┐
│  MANUAL APPROVAL                            │
│  Admin 1-click approval                     │
└─────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────┐
│  COURSE GENERATION (2-4 hours)              │
│  1. Curriculum (5 min)                      │
│  2. Text content (20 min)                   │
│  3. Quiz generation (10 min)                │
│  4. DONE (video/podcast kommer i Phase 2)   │
└─────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────┐
│  PUBLISH & TRACK                            │
│  - Publish til platform                     │
│  - Track engagement metrics                 │
└─────────────────────────────────────────────┘
```

**Target Economics (Phase 1):** <$1 per course (text only), <2 hours generation time

---

## 📁 SIMPLIFICERET PROJEKT STRUKTUR

```
frontend/
├── src/
│   ├── pages/           # Next.js Pages Router
│   │   ├── api/         # API routes
│   │   │   └── admin/   # Admin endpoints
│   │   ├── courses/     # Course-related pages
│   │   │   └── [id].tsx # Course player
│   │   ├── admin/       # Admin dashboard
│   │   │   └── proposals.tsx    # 1-click approve
│   │   ├── index.tsx    # Landing page
│   │   └── login.tsx    # Auth
│   └── components/
│       ├── course/
│       │   ├── CoursePlayer.tsx  # Text + Quiz only
│       │   └── ProgressBar.tsx
│       └── admin/
│           └── ProposalCard.tsx
├── lib/
│   ├── ai/
│   │   ├── course-generator.ts   # Core generation logic
│   │   └── anthropic-client.ts
│   └── supabase/
│       ├── client.ts
│       └── server.ts
└── migrations/
    └── complete-database-setup.sql
```

**Fjernet fra Phase 1:**
- elevenlabs.ts (Phase 2)
- did-api.ts (Phase 4)
- embeddings.ts (Phase 3)
- Fancy company/ components (basic version Phase 2)
- AI chatbot components (Phase 3)

---

## 🎯 CURRENT PRIORITIES

### This Week (Week 1) - PHASE 1 MVP

**Day 1-2:**
- [x] Supabase project setup
- [x] Database schema migreret (DONE ✅)
- [ ] n8n HackerNews scraper (top 5 daily)

**Day 3-4:**
- [ ] Claude course generator (text only)
- [ ] Generate 3 test courses
- [ ] Admin approval UI (1-click)

**Day 5-6:**
- [ ] Ultra-basic course player (text + quiz)
- [ ] User auth + progress tracking
- [ ] Test med 5 personer

**Day 7:**
- [ ] Fix critical bugs
- [ ] Launch til 50 folk på LinkedIn/Twitter
- [ ] Track: signups, course starts, completions

### Week 2-3 - PHASE 2
- [ ] Add audio podcast (ElevenLabs)
- [ ] Personalized course requests
- [ ] Basic company dashboard
- [ ] Mobile responsive polish

### Month 2 - PHASE 3
- [ ] Auto-publish pipeline
- [ ] Semantic search
- [ ] Content lifecycle management
- [ ] Scale til 1,000 DAU

---

## 📊 SUCCESS METRICS

| Phase | Timeline | Metric | Target |
|-------|----------|--------|--------|
| Phase 1 | 7 dage | Beta users sign up | 50 |
| Phase 1 | 7 dage | Users complete course | 10 |
| Phase 2 | 14 dage | DAU | 100 |
| Phase 2 | 14 dage | Completion rate | 50%+ |
| Phase 3 | 4 uger | DAU | 1,000 |
| Phase 3 | 4 uger | Completion rate | 60%+ |
| Phase 3 | 4 uger | Auto-published courses | 20+ |

---

## 🚨 NEVER DO THIS

❌ Build features ingen har bedt om endnu
❌ Optimize før du har users
❌ Add video når text virker fint
❌ Spend tid på admin UI når du skal have brugere
❌ Plan 6 måneder frem når du ikke ved om dag 1 virker
❌ Store API keys in code
❌ Skip RLS policies på nye tables
❌ Use `any` type i TypeScript
❌ Deploy uden at teste locally
❌ Generate courses uden cost tracking

---

## ✅ QUALITY CHECKLIST FOR PHASE 1

**Før Phase 1 launch:**
- [ ] 5 kurser genereret og quality checked
- [ ] Sign up flow virker (2 min max)
- [ ] Course player virker på mobile + desktop
- [ ] Progress tracking gemmes korrekt
- [ ] Admin kan approve proposals på <30 sekunder
- [ ] Zero TypeScript errors
- [ ] Basic RLS policies (user kan kun se sine egne data)

**Alt andet kommer senere.**

---

## 📝 CODING CONVENTIONS

### TypeScript
```typescript
// ALWAYS use strict mode
// ALWAYS define types
// PREFER type over interface for simple types

type CourseStatus = 'draft' | 'published' | 'archived';

interface Course {
  id: string;
  title: string;
  status: CourseStatus;
}
```

### Error Handling
```typescript
// ALWAYS handle errors explicitly
// LOG to console (Sentry i Phase 2)

try {
  const course = await generateCourse(proposalId);
  return course;
} catch (error) {
  console.error('Course generation failed:', error);
  throw new Error('GENERATION_FAILED');
}
```

---

## 📞 WHEN YOU'RE STUCK

**Ask Claude Code:**
> "Claude, jeg sidder fast med [problem]. Hvad er den simpleste løsning?"

**Common Issues:**

| Problem | Solution |
|---------|----------|
| Supabase RLS not working | Check policies, verify auth state |
| AI generation too slow | Use parallel processing |
| Course completion rate low | Make courses shorter, simpler |
| n8n workflow failing | Check webhook URLs, verify credentials |

---

## 🎯 BUSINESS MODEL (Phase 4)

**Phase 1-3:** 100% FREE content to build user base (Target: 1,000 DAU by Month 3)

**Phase 4 Monetization:**
- **Enterprise Features**: Company analytics, SSO, team management ($500/month)
- **Provider Marketplace**: Third-party providers sell courses (10-20% commission)
- **Target**: $50K MRR by Month 12

---

**LÆS ALTID DENNE FIL FØR DU STARTER PÅ EN NY OPGAVE.**

Spørg hvis noget er uklart. Det er bedre at spørge end at bygge forkert.

**Lad os bevise konceptet virker på 7 dage. 🚀**

---

*Last updated: 2025-10-26*
*Version: 2.1 (Radikal Simplificering)*
*Next review: Efter Phase 1 completion*
