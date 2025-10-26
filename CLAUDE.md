# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**CourseHub** is an AI-first knowledge transmission platform that generates 100% FREE Tech/AI courses from trending topics. The platform serves both individual learners and companies tracking employee learning progress.

**Mission**: From trending tech topic to certified user in **under 48 hours**.

**Current Implementation**: Next.js application with Pages Router, Prisma, PostgreSQL, Supabase auth. AI course generation via Claude Sonnet 4.5 and n8n automation.

**Business Model**:
- **Phase 1-3** (Months 1-6): 100% FREE AI-generated courses to build user base
- **Phase 4** (Month 7+): Monetization via paid enterprise features, provider marketplace ($50K MRR target)

## Development Commands

All commands are run from the `frontend/` directory:

```bash
# Development
npm run dev          # Start development server on localhost:3000
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Database Commands

```bash
npx prisma generate  # Generate Prisma client (runs automatically on postinstall)
npx prisma migrate   # Run database migrations
npx prisma db seed   # Seed database
npx prisma studio    # Open Prisma Studio
```

### Docker Development

```bash
docker-compose up    # Run with PostgreSQL database
```

## Architecture & Tech Stack

### Current Tech Stack
- **Next.js 15.1.8** with Pages Router (not App Router)
- **TypeScript** for type safety
- **Hybrid Database Strategy**:
  - **Supabase REST API** for READ queries (reliable over HTTPS, bypasses network issues)
  - **Prisma 6.8.2** for WRITE queries (type-safety, migrations, transactions)
- **Supabase** for authentication, user management, and storage
- **Claude Sonnet 4.5** (Anthropic API) for AI course generation
- **n8n** (self-hosted) for workflow automation and trend scraping
- **ElevenLabs** for podcast/voice generation (future)
- **D-ID or HeyGen** for video generation (cost-conditional)
- **Stripe** for payment processing (inactive until Phase 4)
- **Sentry** for error monitoring and performance tracking
- **Tailwind CSS** for styling

### AI Generation Stack
- **Daily Trend Scraping**: n8n workflows scrape HackerNews, Reddit, GitHub, arXiv
- **Course Generation**: Claude Sonnet 4.5 generates curriculum, transcripts, quizzes, exercises
- **Audio Generation**: ElevenLabs API for podcast narration (when cost < $2)
- **Video Generation**: D-ID/HeyGen for talking head videos (when cost < $3)
- **Target Economics**: <$2 per course, <4 hours generation time

### Current Database Schema

**Core Models:**

1. **User** - Authentication and role management
   - Roles: `USER` (individual), `COMPANY_USER`, `COMPANY_ADMIN`, `PROVIDER`, `SUPER_ADMIN`
   - Links to Company (optional) for B2B tracking

2. **Course** - AI-generated course content (100% FREE in Phase 1-3)
   - Basic fields: title, description, duration, level, category
   - AI metadata: `isAIGenerated`, `aiModel`, `generationCostUsd`, `generationTimeMinutes`
   - Content: `curriculumJson`, `videoUrl`, `podcastUrl`, `transcriptUrl`
   - A/B testing: `abTestVariant`, `engagementScore`, `actualEngagementScore`
   - Link to `trendProposalId` (source trend)

3. **TrendProposal** - AI-analyzed trending topics (NEW in AI-first pivot)
   - Source: HackerNews, Reddit, GitHub, arXiv
   - AI analysis: `aiCourseProposal` (JSONB with suggested course outline)
   - Workflow: `status` (PENDING → APPROVED → GENERATING → PUBLISHED)
   - Economics: `estimatedGenerationCostUsd`, `actualGenerationCostUsd`

4. **CourseProgress** - Detailed user learning tracking (NEW in AI-first pivot)
   - Section-level tracking: `currentSectionId`, `completedSections[]`
   - Time tracking: `totalTimeMinutes`, `lastAccessedAt`, `completedAt`
   - Engagement: `quizScores` (JSONB), `exercisesCompleted` (JSONB)
   - Unique constraint on `userId + courseId`

5. **Category** - Tech/AI focused categories (6 categories)
   - AI/ML, Cloud Computing, Frontend, Backend, DevOps, Data Engineering
   - Visual: `icon`, `color` for UI

6. **Company** - B2B company profiles (for employee tracking)
   - Basic info: name, CVR, email, website
   - Tracks employee learning via `users.companyId` relation

7. **Purchase** - Purchase records (inactive until Phase 4)
   - All courses FREE in Phase 1-3 (`priceCents = 0`)
   - Preserved for future monetization

8. **Provider** - Course providers (inactive until Phase 4)
   - All courses AI-generated in Phase 1-3
   - Will be used for marketplace in Phase 4

**Key Schema Changes (October 2025):**
- Added `TrendProposal` and `CourseProgress` tables
- Added 13 AI generation fields to `Course` model
- Changed `Course.priceCents` default to 0 (FREE)
- Made `Course.providerId` optional (AI-generated courses have no provider)
- Added `TrendProposalStatus` enum

### Platform Features (AI-First Strategy)

**Phase 1 (Weeks 1-2): MVP - Manual AI Generation**
- 10 AI-generated courses on trending Tech/AI topics
- Admin approves trend proposals manually
- Basic course listing and user registration
- Individual + company user tracking

**Phase 2 (Months 1-3): Automation**
- Daily n8n trend scraping (06:00 CET)
- Auto-approve high-score trends
- Real-time course progress tracking
- Personalized learning paths

**Phase 3 (Months 4-6): Intelligence**
- Real-time custom course generation (30 min)
- "Surprise Me" AI-curated learning paths
- Job market intelligence (scrape job postings)
- Community-driven trend suggestions

**Phase 4 (Month 7+): Monetization**
- Paid enterprise features (SSO, advanced analytics)
- Provider marketplace (commission-based)
- Premium AI courses ($50-200)
- Target: $50K MRR

### Project Structure
```
frontend/
├── src/
│   ├── pages/           # Next.js pages (Pages Router)
│   │   ├── api/         # API routes
│   │   ├── courses/     # Course-related pages
│   │   ├── index.tsx    # Home page with course listing
│   │   ├── login.tsx    # Authentication page
│   │   └── my-courses.tsx # User's purchased courses
│   └── instrumentation.ts # Sentry configuration
├── lib/
│   ├── database-adapter.ts  # Hybrid database adapter (READ: Supabase, WRITE: Prisma)
│   ├── prisma.ts            # Prisma client configuration
│   └── supabaseClient.ts    # Supabase client setup
├── prisma/
│   ├── schema.prisma    # Database schema
│   └── seed.js          # Database seed data
└── public/              # Static assets
```

## Key Implementation Details

### Hybrid Database Strategy 🆕

**Why Hybrid?**
The application uses a hybrid database access pattern to handle unstable network conditions while maintaining Prisma's benefits for long-term development.

**Architecture:**
```
READ Queries:  User → Next.js → Supabase REST API (HTTPS/443) → PostgreSQL
WRITE Queries: User → Next.js → Prisma → PostgreSQL (Session pooler/5432)
```

**Implementation: [lib/database-adapter.ts](lib/database-adapter.ts)**

**READ Operations (Supabase REST API):**
- `fetchPublishedCourses()` - Homepage course listing
- `fetchCourseById(id)` - Course detail pages
- `fetchUserCourses(userId)` - User's purchased courses
- `fetchActiveCategories()` - Category navigation
- `fetchAdminStats()` - Admin dashboard statistics
- `checkCourseAccess(userId, courseId)` - Access verification

**WRITE Operations (Prisma):**
- `createPurchase(data)` - Course purchases
- `updateCourseStatus(id, status)` - Admin course moderation
- `updateProviderStatus(id, status)` - Admin provider moderation
- All other CREATE, UPDATE, DELETE operations

**Benefits:**
- ✅ Reliable READ operations even with unstable network (HTTPS bypasses firewall)
- ✅ Type-safe WRITE operations with Prisma
- ✅ Maintains schema migrations with Prisma
- ✅ Aligns with MVP-first approach
- ✅ Production-ready for Vercel deployment

**Date Handling:**
All date fields are returned as ISO 8601 strings for Next.js JSON serialization compatibility.

### Authentication Flow
- Uses Supabase for user authentication
- User sessions are managed client-side
- API routes validate authentication via Bearer tokens
- User IDs from Supabase are stored as strings in the User model

### Payment Integration
- Stripe Checkout integration (INACTIVE until Phase 4)
- All courses are FREE in Phase 1-3 (`priceCents = 0`)
- Infrastructure preserved for Phase 4 monetization
- Prices will be stored in cents (Danish Kroner) when activated

### Environment Variables Required
```bash
# Database
DATABASE_URL="postgresql://..."

# Supabase (Auth + Storage)
NEXT_PUBLIC_SUPABASE_URL="..."
NEXT_PUBLIC_SUPABASE_ANON_KEY="..."
SUPABASE_SERVICE_ROLE_KEY="..."

# AI Generation (Phase 1+)
ANTHROPIC_API_KEY="..."  # Claude Sonnet 4.5 for course generation
# ELEVENLABS_API_KEY="..." # Future: Podcast generation
# DID_API_KEY="..." # Future: Video generation

# Payments (Inactive until Phase 4)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="..."
STRIPE_SECRET_KEY="..."

# Monitoring
SENTRY_DSN="..."

# Caching (Optional)
UPSTASH_REDIS_REST_URL="..."
UPSTASH_REDIS_REST_TOKEN="..."

# n8n (Phase 2+)
# N8N_WEBHOOK_URL="..." # For trend scraping workflows
```

### API Endpoints

**Course Discovery:**
- `GET /api/courses` - List all AI-generated courses (with filters)
- `GET /api/courses/[id]` - Get single course details
- `GET /api/categories` - List Tech/AI categories

**User Learning:**
- `GET /api/my-courses` - Fetch user's enrolled courses
- `GET /api/course-progress/[courseId]` - Get progress for specific course
- `POST /api/course-progress/[courseId]` - Update progress (section completion, quiz scores)

**Admin (SUPER_ADMIN only):**
- `GET /api/admin/trend-proposals` - List pending trend proposals
- `POST /api/admin/trend-proposals/[id]/approve` - Approve proposal & trigger generation
- `POST /api/admin/trend-proposals/[id]/reject` - Reject proposal
- `GET /api/admin/courses` - Manage AI-generated courses
- `GET /api/admin/users` - User management
- `GET /api/admin/companies` - Company management

**AI Generation (Phase 2+):**
- `POST /api/generate-course` - Trigger AI course generation from trend
- `POST /api/generate-custom-course` - Real-time custom course (30 min)

**Payments (Inactive until Phase 4):**
- `GET/POST /api/checkout` - Create Stripe checkout session (disabled)
- `POST /api/purchase` - Register purchase after payment (disabled)

## Development Guidelines

### Code Style
- Uses ESLint with Next.js TypeScript configuration
- Tailwind CSS for styling
- Danish language used in UI text and comments
- TypeScript strict mode enabled

### Database Development
- Use Prisma migrations for schema changes
- **Migration in Progress**: AI-first pivot with new `TrendProposal` and `CourseProgress` tables
- See [`frontend/MIGRATION-README.md`](frontend/MIGRATION-README.md) for migration instructions
- Database connection pooling configured for production
- Production uses Supabase PostgreSQL with SSL

### Error Monitoring
- Sentry configured for both client and server
- Automatic error tracking and performance monitoring
- Source maps uploaded for better error reporting

## Business Model & Strategy

**AI-First Growth Strategy:**

**Phase 1-3 (Months 1-6): FREE Content to Build User Base**
- 100% FREE AI-generated Tech/AI courses
- Target: 1,000 DAU (Daily Active Users) by Month 3
- Focus: Quality content + viral sharing
- Economics: <$2 per course generation cost

**Phase 4 (Month 7+): Monetization**
- **Enterprise Features**: Company analytics, SSO, team management ($500/month per company)
- **Provider Marketplace**: Third-party providers can sell courses (10-20% commission)
- **Premium AI Courses**: Advanced/niche topics ($50-200 per course)
- **Target**: $50K MRR by Month 12

**Key Metrics:**
- **Knowledge Transmission Speed**: Trend discovery → User completion (<48 hours)
- **Generation Efficiency**: Cost per course (<$2), Time per course (<4 hours)
- **Engagement**: Course completion rate (>60%), Quiz pass rate (>70%)
- **Growth**: Weekly Active Users, Course completion velocity

**Competitive Moat:**
- Fastest content creation (4 hours vs 6-12 months traditional)
- 100% FREE vs $50-200 competitors
- Always-fresh content (daily trend tracking)
- Real-time personalization (custom courses in 30 min)

## Important Notes

- This project uses **Pages Router**, not App Router
- The main application logic is in the `frontend/` directory
- Danish language is used throughout the UI
- All monetary values are stored in cents (øre) when activated in Phase 4
- Authentication state management happens client-side with Supabase
- **All courses are FREE** in Phase 1-3 (`priceCents = 0`)
- **AI-generated courses** have no `providerId` (NULL)
- **Strategic Focus**: "Elon Musk mode" - build fastest learning platform on Earth
- **Architecture Pattern**: Start as monolith with AI-first features, evolve based on metrics

## Documentation

Additional documentation can be found in the `/docs` and `/frontend` directories:

**Core Documentation:**
- [PROJECT.md](docs/PROJECT.md) - **Complete AI-first architecture and 4-phase roadmap** (2,160 lines)
- [MIGRATION-README.md](frontend/MIGRATION-README.md) - Database migration guide for AI-first pivot
- [Web Design Style Guide](docs/WEB-DESIGN-STYLEGUIDE.md) - Complete design system documentation

**Legacy Documentation (Pre-AI Pivot):**
- [Migration Guide](docs/MIGRATION-GUIDE.md) - Original database migration strategies
- [Provider Workflow Test](docs/PROVIDER-WORKFLOW-TEST.md) - Provider feature testing (inactive until Phase 4)
- [Style Guide](docs/STYLEGUIDE.md) - UI/UX and coding standards

**Database Schema:**
- [Prisma Schema](frontend/prisma/schema.prisma) - Complete database schema with AI generation tables
- [Seed Data](frontend/prisma/seed.js) - AI-first seed data with 4 sample courses
- [Migration SQL](frontend/migrations/ai-features-migration.sql) - SQL migration for AI features