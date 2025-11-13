# CLAUDE.md

⚠️ **CRITICAL: Read this first before making ANY code changes**

This file provides guidance to Claude Code when working with this repository.

**Core Philosophy:** Ship → Learn → Iterate → Scale
**Mission:** Prove AI can generate world-class learning content faster than humans
**Timeline:** Ship Phase 1 MVP in **7 DAYS**

---

## 🎯 PROJECT OVERVIEW

**CourseHub** is a speed-first, AI-powered knowledge transmission platform that generates 100% FREE Tech/AI courses from trending topics.

**Mission:** From trending tech topic to certified user in **under 48 hours**.

**Current Status:** Phase 1 - MVP (Day 1-7)

### Competitive Moat

| Metric | CourseHub | Traditional Platforms |
|--------|-----------|---------------------|
| **Speed** | Trend → Course: 4 hours | 6-12 months |
| **Cost** | $0 (Phase 1-3) | $50-200 per course |
| **Freshness** | Daily updates | Quarterly updates |

---

## ⚡ SPEED-FIRST DEVELOPMENT RULES

**Before implementing ANY feature, ask:**
1. ✅ "Can we ship without this?"
2. ✅ "What's the simplest version that works?"
3. ✅ "Does this help us reach 50 beta users by Day 7?"

**NEVER do this:**
- ❌ Add features no one asked for yet
- ❌ Optimize before we have users
- ❌ Spend time on fancy UI when functionality is broken
- ❌ Plan 6 months ahead when Day 1 isn't working

**Instead:**
- ✅ Ship 80% solution on Day 7 > 100% solution on Day 30
- ✅ Features without users = waste
- ✅ Test with 10 users before building more

---

## 📈 ROADMAP: 4 AGGRESSIVE PHASES

### Phase 1 (7 DAYS): MVP - Proof of Concept
**Goal:** Prove AI can generate world-class content faster than humans

**Deliverables (ONLY these):**
- ✅ Database migrated and ready (Supabase)
- ✅ n8n HackerNews scraper (top 5 daily)
- ✅ n8n Azure scraper (8 topics daily)
- ✅ n8n Content Generation Pipeline (Claude generates complete text-only courses)
- ✅ Admin dashboard with 1-click approval
- ✅ Ultra-basic course player (text + quiz ONLY)
- [ ] User signup + basic progress tracking - **IN PROGRESS**
- ✅ 5 AI-generated Tech/AI courses published - **NEEDS TESTING**

**Success Metric:** 50 beta users, 10 complete first course
**Ship Date:** Day 7

**Day-by-day Plan:**
```
Day 1-2: n8n HackerNews scraper → Supabase (database ✅)
Day 3-4: Claude course generator (text only)
Day 4-5: Minimal course player (90s startup aesthetic)
Day 6: Test with 10 people, fix critical bugs
Day 7: Launch to 50 tech people on Twitter/LinkedIn
```

### Phase 2 (14 DAYS): Core Features
**Starts after Phase 1 ships**

- Audio podcast generation (ElevenLabs, 10-15 min episodes)
- Personalized course requests ("Teach me RAG systems")
- Ultra-basic company dashboard (3 metrics only)
- Mobile-responsive player

**Success Metric:** 100 DAU, 50%+ completion rate

### Phase 3 (4 WEEKS): Intelligence & Scale
**Starts after Phase 2 ships**

- Auto-publish pipeline (kill manual approval)
- Semantic search
- Content lifecycle management (auto-archive low performers)
- Basic company analytics

**Success Metric:** 1,000 DAU, 60%+ completion rate

### Phase 4 (LATER): Advanced Features & Monetization
Everything fancy goes here:
- Multi-language support
- Video generation (DID API)
- Advanced gamification
- A/B testing engine
- Monetization ($50K MRR target)

---

## 🛠 TECH STACK (PHASE 1 ONLY)

**Current Implementation:**

```typescript
Frontend (MINIMAL):
- Next.js 15.1.8 (Pages Router - NOT App Router)
- TypeScript (strict mode)
- Tailwind CSS (no fancy animations)
- shadcn/ui (button, card, input ONLY)

Backend:
- Supabase (Auth + PostgreSQL + Storage)
- Prisma 6.8.2 (schema migrations, WRITE operations)
- Supabase REST API (READ operations - more reliable)

AI (Phase 1):
- Anthropic Claude Sonnet 4.5 (course generation)
- NO video, NO voice yet (Phase 2)

Automation:
- n8n (1 workflow: HackerNews scraper)

Analytics:
- PostHog basic events (signup, course_start, course_complete)
```

**NOT in Phase 1:**
- ❌ ElevenLabs (Phase 2)
- ❌ Video generation (Phase 4)
- ❌ Sentry (nice-to-have, not MVP)
- ❌ Stripe (Phase 4 monetization)
- ❌ Redis caching (premature optimization)

---

## 🗄 DATABASE SCHEMA

**Status:** ✅ Migrated and ready (see `frontend/migrations/complete-database-setup.sql`)

### Core Models (AI-First):

1. **User** - Authentication and role management
   - Roles: `USER`, `COMPANY_USER`, `COMPANY_ADMIN`, `PROVIDER`, `SUPER_ADMIN`
   - Links to Company (optional) for B2B tracking

2. **Course** - AI-generated course content (100% FREE in Phase 1-3)
   - Basic: `title`, `description`, `duration`, `level`, `categoryId`
   - AI metadata: `isAIGenerated`, `aiModel`, `generationCostUsd`, `generationTimeMinutes`
   - Content: `curriculumJson`, `videoUrl`, `podcastUrl`, `transcriptUrl`
   - Link to `trendProposalId` (source trend)

3. **TrendProposal** - AI-analyzed trending topics (Phase 1+)
   - Source: HackerNews (expands in Phase 2)
   - AI analysis: `aiCourseProposal` (JSONB with suggested course outline)
   - Workflow: `status` (PENDING → APPROVED → GENERATING → PUBLISHED)
   - Economics: `estimatedGenerationCostUsd`, `actualGenerationCostUsd`

4. **CourseProgress** - User learning tracking
   - Section-level: `currentSectionId`, `completedSections[]`
   - Time tracking: `totalTimeMinutes`, `lastAccessedAt`, `completedAt`
   - Engagement: `quizScores` (JSONB), `exercisesCompleted` (JSONB)

5. **Category** - Tech/AI categories (6 categories)
   - AI/ML, Cloud Computing, Frontend, Backend, DevOps, Data Engineering

6. **Company** - B2B company profiles (for employee tracking)

7. **Purchase** - Purchase records (inactive until Phase 4)

8. **Provider** - Course providers (inactive until Phase 4)

**RLS Policies:** ✅ Enabled and configured
**Indexes:** ✅ Performance indexes on all core queries

---

## 🚀 DEVELOPMENT COMMANDS

All commands run from `frontend/` directory:

```bash
# Development
npm run dev          # Start dev server (localhost:3000)
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Database (Prisma)
npx prisma generate  # Generate Prisma client
npx prisma migrate   # Run migrations
npx prisma db seed   # Seed database
npx prisma studio    # Open Prisma Studio

# Docker (if needed)
docker-compose up    # Run with PostgreSQL

# MCP Servers (Development Tools)
claude mcp list      # List all configured MCP servers
claude mcp get <name>  # Get details about specific server
```

---

## 🔧 MCP SERVERS (DEVELOPMENT TOOLS)

**Status:** ✅ Both servers configured and connected

This project uses two MCP (Model Context Protocol) servers that are essential for development:

### 1. **Supabase MCP Server**
**Purpose:** Direct database operations and queries

**Available Tools:**
- `supabase_db_query` - Run SQL queries on Supabase database
- `supabase_db_insert` - Insert data into tables
- `supabase_db_update` - Update existing records
- `supabase_db_delete` - Delete records
- `supabase_storage_list` - List files in Supabase storage
- `supabase_storage_upload` - Upload files to storage

**Use Cases:**
- Quick database queries during development
- Testing database schemas and RLS policies
- Debugging data issues
- Seeding test data
- Inspecting course and user data

**Configuration:**
```json
{
  "type": "stdio",
  "command": "npx",
  "args": [
    "@supabase/mcp-server-supabase@latest",
    "--project-ref=savhtvkgjtkiqnqytppy"
  ],
  "env": {
    "SUPABASE_ACCESS_TOKEN": "..."
  }
}
```

### 2. **Chrome DevTools MCP Server**
**Purpose:** Browser automation and UI testing

**Available Tools:**
- `navigate_page` - Navigate to URLs
- `click` - Click elements on page
- `fill` - Fill form inputs
- `take_screenshot` - Capture screenshots
- `take_snapshot` - Get page accessibility tree
- `list_console_messages` - Get console logs
- `list_network_requests` - Monitor network traffic
- `evaluate_script` - Execute JavaScript in page
- `performance_start_trace` - Profile performance

**Use Cases:**
- End-to-end testing of user flows
- UI/UX debugging and screenshots
- Performance profiling of course player
- Testing authentication flows
- Debugging API calls and network issues
- Testing mobile responsiveness

**Configuration:**
```json
{
  "type": "stdio",
  "command": "npx",
  "args": ["chrome-devtools-mcp@latest"],
  "env": {}
}
```

### When to Use MCP Servers

**Supabase MCP:**
- ✅ Inspecting database state during development
- ✅ Testing SQL queries before adding to code
- ✅ Debugging RLS policies
- ✅ Quick data fixes (e.g., promote user to SUPER_ADMIN)
- ✅ Verifying migrations ran correctly

**Chrome DevTools MCP:**
- ✅ Testing user signup/login flow
- ✅ Testing course player on different screen sizes
- ✅ Capturing screenshots for documentation
- ✅ Debugging JavaScript errors in browser
- ✅ Profiling page load performance
- ✅ Testing admin approval workflow

### Development Workflow Example

```typescript
// Example: Test entire user flow with both MCP servers

// 1. Use Supabase MCP to create test user
supabase_db_insert({
  table: "users",
  data: { email: "test@example.com", role: "USER" }
})

// 2. Use Chrome DevTools MCP to test login
navigate_page({ url: "http://localhost:3000/login" })
fill({ uid: "email-input", value: "test@example.com" })
fill({ uid: "password-input", value: "test123" })
click({ uid: "login-button" })
take_screenshot({ filePath: "test-screenshots/after-login.png" })

// 3. Use Supabase MCP to verify session created
supabase_db_query({
  query: "SELECT * FROM auth.sessions WHERE user_id = ..."
})
```

### Verifying MCP Server Status

```bash
# Check if both servers are connected
claude mcp list

# Expected output:
# chrome-devtools: ✓ Connected
# supabase-mcp: ✓ Connected
```

**If a server fails to connect:**
1. Check `.claude.json` configuration
2. Verify environment variables (SUPABASE_ACCESS_TOKEN for Supabase MCP)
3. Run `claude mcp get <name>` for detailed error info
4. Restart Claude Code if needed

---

## 📁 PROJECT STRUCTURE (SIMPLIFIED FOR PHASE 1)

```
frontend/
├── src/
│   ├── pages/           # Next.js Pages Router
│   │   ├── api/         # API routes
│   │   │   └── admin/   # Admin endpoints
│   │   ├── courses/     # Course pages
│   │   │   └── [id].tsx # Course player
│   │   ├── admin/       # Admin dashboard
│   │   │   └── proposals.tsx  # 1-click approve
│   │   ├── index.tsx    # Landing page
│   │   └── login.tsx    # Auth
│   └── components/
│       ├── course/
│       │   ├── CoursePlayer.tsx  # Text + Quiz ONLY
│       │   └── ProgressBar.tsx
│       └── admin/
│           └── ProposalCard.tsx
├── lib/
│   ├── ai/
│   │   ├── course-generator.ts   # Core AI logic
│   │   └── anthropic-client.ts
│   ├── supabase/
│   │   ├── client.ts
│   │   └── server.ts
│   └── database-adapter.ts  # Hybrid DB strategy
├── prisma/
│   ├── schema.prisma    # Database schema
│   └── seed.js          # Seed data
└── migrations/
    └── complete-database-setup.sql
```

**Removed from Phase 1 (to be added later):**
- elevenlabs.ts (Phase 2)
- did-api.ts (Phase 4)
- embeddings.ts (Phase 3)
- Fancy company dashboard (Phase 2)
- AI chatbot (Phase 3)

---

## 🔑 ENVIRONMENT VARIABLES

**Phase 1 Required:**
```bash
# Database
DATABASE_URL="postgresql://..."  # Supabase session pooler

# Supabase (Auth + Database)
NEXT_PUBLIC_SUPABASE_URL="..."
NEXT_PUBLIC_SUPABASE_ANON_KEY="..."
SUPABASE_SERVICE_ROLE_KEY="..."

# AI Generation
ANTHROPIC_API_KEY="..."  # Claude Sonnet 4.5
```

**Phase 2+ (Not needed yet):**
```bash
# ELEVENLABS_API_KEY="..."  # Phase 2: Audio
# STRIPE_SECRET_KEY="..."   # Phase 4: Monetization
# SENTRY_DSN="..."          # Optional: Error tracking
```

---

## 🎯 API ENDPOINTS (PHASE 1 MVP)

**Course Discovery:**
- `GET /api/courses` - List all published courses
- `GET /api/courses/[id]` - Get single course details
- `GET /api/categories` - List Tech/AI categories

**User Learning:**
- `GET /api/my-courses` - User's enrolled courses
- `POST /api/course-progress/[courseId]` - Update progress

**Admin (SUPER_ADMIN only):**
- `GET /api/admin/trend-proposals` - List pending proposals
- `POST /api/admin/trend-proposals/[id]/approve` - Approve & generate
- `POST /api/admin/trend-proposals/[id]/reject` - Reject proposal

**AI Generation:**
- `POST /api/generate-course` - Trigger course generation from trend

---

## 🤖 AI CONTENT GENERATION PIPELINE (PHASE 1)

```
┌─────────────────────────────────────────────┐
│  TREND DISCOVERY (Daily 06:00 CET)         │
│  n8n scrapes HackerNews top 5 stories      │
│  → AI analyzes trends                      │
│  → Generates course proposals              │
└─────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────┐
│  MANUAL APPROVAL (Admin Dashboard)         │
│  Admin 1-click approval (<30 seconds)      │
└─────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────┐
│  COURSE GENERATION (2-4 hours)             │
│  1. Curriculum (5 min)                     │
│  2. Text content (20 min)                  │
│  3. Quiz generation (10 min)               │
│  4. DONE (no video/podcast in Phase 1)     │
└─────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────┐
│  PUBLISH & TRACK                           │
│  - Publish to platform                     │
│  - Track engagement metrics                │
└─────────────────────────────────────────────┘
```

**Target Economics (Phase 1):** <$1 per course (text only), <2 hours generation time

---

## 🎨 DESIGN SYSTEM (MINIMAL FOR PHASE 1)

**Color Palette:**
- Primary (orange): `#FF6A3D`
- Secondary (purple): `#7E6BF1`
- Background dark: `#0F0F1A`
- Card: `#1C1C2E`
- Text light: `#F5F5F7`

**Typography:**
- Font: Inter (Google Fonts)
- Headers: Bold (700)
- Body: Normal (400)

**Components (shadcn/ui ONLY):**
- Button (primary/secondary)
- Card (course cards)
- Input (forms)
- NO fancy animations in Phase 1

See [docs/WEB-DESIGN-STYLEGUIDE.md](docs/WEB-DESIGN-STYLEGUIDE.md) for full details.

---

## 📊 SUCCESS METRICS (PHASE 1)

**Ship on Day 7 with:**
- [ ] 5 courses generated and quality checked
- [ ] 50 beta users signed up
- [ ] 10 users complete first course
- [ ] Sign-up flow works (2 min max)
- [ ] Course player works on mobile + desktop
- [ ] Progress tracking saves correctly
- [ ] Admin can approve proposals in <30 seconds
- [ ] Zero TypeScript errors

**Everything else comes later.**

---

## 🚨 DEVELOPMENT RULES

**NEVER do this:**
- ❌ Build features no one asked for
- ❌ Add video when text works fine
- ❌ Optimize before having users
- ❌ Plan 6 months ahead when Day 1 isn't working
- ❌ Store API keys in code
- ❌ Skip RLS policies on new tables
- ❌ Use `any` type in TypeScript
- ❌ Deploy without testing locally
- ❌ Generate courses without cost tracking

**ALWAYS do this:**
- ✅ Ship 80% solution on Day 7 > 100% solution on Day 30
- ✅ Test with 10 real users before building more
- ✅ Ask "Can we ship without this feature?"
- ✅ Track generation costs for every course
- ✅ Use TypeScript strict mode
- ✅ Enable RLS policies on all tables
- ✅ Test on mobile before shipping

---

## 📝 CODING CONVENTIONS

**Language:**
- UI text: Danish (e.g., "Kom i gang", "Mine kurser")
- Code comments: English
- Variable names: English

**TypeScript:**
- Strict mode enabled
- No `any` types (use `unknown` if needed)
- Prefer interfaces over types

**Database:**
- Use Prisma for WRITE operations (type-safety, migrations)
- Use Supabase REST API for READ operations (reliability)
- See [lib/database-adapter.ts](lib/database-adapter.ts)

**API Routes:**
- Validate auth with Supabase Bearer tokens
- Return errors as `{ error: string }`
- Use 200/400/401/500 status codes

---

## 📚 DOCUMENTATION HIERARCHY

1. **PROJECT.md** (Strategy) - Read this FIRST for overall strategy
2. **CLAUDE.md** (This file) - Implementation guidance for Claude Code
3. **WEB-DESIGN-STYLEGUIDE.md** - UI/UX design system
4. **MIGRATION-README.md** - Database migration guide (reference only)

**In case of conflict:** PROJECT.md > CLAUDE.md > other docs

---

## ⚡ CURRENT PRIORITIES (WEEK 1)

**Day 1-2:**
- [x] Supabase project setup ✅
- [x] Database schema migrated ✅
- [x] n8n HackerNews scraper (top 5 daily) ✅
- [x] n8n Azure scraper (8 topics daily) ✅

**Day 3-4:**
- [ ] Claude course generator (text only)
- [ ] Generate 3 test courses
- [ ] Admin approval UI (1-click)

**Day 5-6:**
- [ ] Ultra-basic course player (text + quiz)
- [ ] User auth + progress tracking
- [ ] Test with 5 people

**Day 7:**
- [ ] Fix critical bugs
- [ ] Launch to 50 people on LinkedIn/Twitter
- [ ] Track: signups, course starts, completions

**✅ COMPLETED (Nov 13):**
- n8n workflows: HackerNews + Azure scrapers both operational
- Course player components built (CoursePlayer, QuizPlayer, SectionContent)
- Supabase client setup completed

---

## 🎓 KEY IMPLEMENTATION NOTES

### Hybrid Database Strategy

**Why?** Supabase REST API (HTTPS/443) is more reliable for READ operations than direct PostgreSQL connection on unstable networks.

**Architecture:**
```
READ:  User → Next.js → Supabase REST API → PostgreSQL
WRITE: User → Next.js → Prisma → PostgreSQL
```

**Implementation:** See [lib/database-adapter.ts](lib/database-adapter.ts)

### Authentication Flow

- Supabase handles user authentication
- Sessions managed client-side
- API routes validate Bearer tokens
- User IDs stored as strings in User model

### Payment Integration

- Stripe infrastructure preserved but INACTIVE until Phase 4
- All courses FREE in Phase 1-3 (`priceCents = 0`)
- Prices stored in cents (Danish Kroner) when activated

---

## 🚢 SHIPPING CHECKLIST (PHASE 1)

**Before launching on Day 7:**
- [ ] 5 courses generated and quality checked
- [ ] Sign-up flow works (2 min max)
- [ ] Course player works on mobile + desktop
- [ ] Progress tracking saves correctly
- [ ] Admin can approve proposals in <30 seconds
- [ ] Zero TypeScript errors
- [ ] Basic RLS policies (user can only see their data)
- [ ] Test with 10 people, fix critical bugs
- [ ] Landing page explains value prop clearly

**Everything else comes in Phase 2+.**

---

**Remember:** Ship → Learn → Iterate → Scale
**Target:** 50 beta users by Day 7
**Mantra:** "Can we ship without this feature?"
