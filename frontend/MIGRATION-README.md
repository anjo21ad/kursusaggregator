# Database Migration: AI-First CourseHub

## Overview

This migration transforms CourseHub from a B2B course marketplace to an **AI-first knowledge transmission platform** with 100% FREE, AI-generated Tech/AI courses.

**Date**: October 26, 2025
**Migration Status**: Ready for execution
**Estimated Downtime**: 2-5 minutes

---

## Changes Summary

### New Database Tables

1. **`trend_proposals`** - AI-analyzed trends from daily scraping
   - Stores trending topics from HackerNews, Reddit, GitHub, arXiv
   - AI-generated course proposals with estimated costs and engagement
   - Admin approval workflow (Phase 1) or auto-approval (Phase 2+)

2. **`course_progress`** - Detailed user learning progress
   - Section-level tracking (video, quiz, hands-on)
   - Time tracking and engagement metrics
   - Quiz scores and exercise completion

### Updated Tables

1. **`courses`** - Added AI generation metadata
   - `isAIGenerated` (boolean) - Marks AI-generated courses
   - `aiModel` (text) - Model used (e.g., "claude-sonnet-4-20250514")
   - `generationCostUsd` (decimal) - Actual generation cost
   - `generationTimeMinutes` (integer) - Time to generate
   - `trendProposalId` (text) - Link to source trend
   - `abTestVariant` (text) - A/B testing variant
   - `engagementScore` (integer) - Predicted engagement
   - `actualEngagementScore` (integer) - Actual engagement after publish
   - `curriculumJson` (jsonb) - Complete curriculum structure
   - `videoUrl`, `podcastUrl`, `transcriptUrl` (text) - Content URLs
   - `priceCents` - Default changed to 0 (FREE in Phase 1-3)
   - `providerId` - Now optional (AI-generated courses have no provider)

### New Enums

- **`TrendProposalStatus`**: PENDING, APPROVED, REJECTED, GENERATING, PUBLISHED, FAILED

### Data Cleanup

- ✅ All dummy courses deleted
- ✅ All purchases deleted
- ✅ All leads deleted
- ✅ Categories updated to Tech/AI focus only (6 categories)
- ✅ Inactive categories disabled

---

## Migration Execution

### Option 1: Using Supabase Dashboard (Recommended for Production)

1. **Connect to Supabase**
   - Go to https://app.supabase.com
   - Select your project
   - Navigate to SQL Editor

2. **Execute Migration SQL**
   - Copy contents from [`migrations/ai-features-migration.sql`](./migrations/ai-features-migration.sql)
   - Paste into SQL Editor
   - Click "RUN"

3. **Verify Migration**
   ```sql
   -- Check new tables exist
   SELECT table_name FROM information_schema.tables
   WHERE table_schema = 'public'
   AND table_name IN ('trend_proposals', 'course_progress');

   -- Verify courses table updated
   SELECT column_name, data_type
   FROM information_schema.columns
   WHERE table_name = 'courses'
   AND column_name IN ('isAIGenerated', 'aiModel', 'curriculumJson');
   ```

4. **Run Seed Data**
   ```bash
   cd frontend
   npm run prisma:seed
   ```

### Option 2: Using Prisma CLI (Local Development)

**Note**: Only works if Prisma can connect to database (network issues may prevent this)

```bash
cd frontend

# Option A: Push schema (fast, no migration history)
npx prisma db push

# Option B: Create migration (production-ready)
npx prisma migrate dev --name add_ai_course_generation_features

# Seed database
npm run prisma:seed
```

---

## Seed Data

The new seed data ([`prisma/seed.js`](./prisma/seed.js)) creates:

### Categories (6 Tech/AI focused)
- 🤖 AI/ML
- ☁️ Cloud Computing
- 🎨 Frontend Development
- ⚙️ Backend Development
- 🚀 DevOps
- 📊 Data Engineering

### Companies (2 test companies)
- TechStartup ApS (København)
- DataDriven A/S (Aarhus)

### Users (6 users with different roles)
- 2 individual users (USER role)
- 2 company admins (COMPANY_ADMIN)
- 1 company user (COMPANY_USER)
- 1 super admin (SUPER_ADMIN)

### AI-Generated Courses (4 courses, 100% FREE)
1. **Building Production-Ready RAG Systems** (45 min, AI/ML)
   - Cost: $1.85, Time: 180 min
   - Video + Podcast included

2. **Kubernetes for Modern Developers** (50 min, DevOps)
   - Cost: $1.92, Time: 195 min
   - Video + Podcast included

3. **React Server Components & Next.js 15** (40 min, Frontend)
   - Cost: $1.67, Time: 165 min
   - Podcast only (video too expensive)

4. **LangChain Advanced Patterns** (55 min, AI/ML)
   - Cost: $2.10, Time: 210 min
   - Video + Podcast included

### Trend Proposals (2 examples)
1. **GPT-5 Training Techniques** (PENDING review)
2. **Next.js 16 Partial Prerendering** (APPROVED, already generated)

### Course Progress (3 active learners)
- Sarah: 50% through RAG Systems course
- Michael: 100% completed Kubernetes course
- Marie: 60% through React Server Components

---

## Rollback Plan

If migration fails, restore from backup:

```sql
-- 1. Drop new tables
DROP TABLE IF EXISTS "course_progress" CASCADE;
DROP TABLE IF EXISTS "trend_proposals" CASCADE;
DROP TYPE IF EXISTS "TrendProposalStatus";

-- 2. Remove new columns from courses
ALTER TABLE "courses"
  DROP COLUMN IF EXISTS "isAIGenerated",
  DROP COLUMN IF EXISTS "aiModel",
  DROP COLUMN IF EXISTS "generationCostUsd",
  DROP COLUMN IF EXISTS "generationTimeMinutes",
  DROP COLUMN IF EXISTS "trendProposalId",
  DROP COLUMN IF EXISTS "abTestVariant",
  DROP COLUMN IF EXISTS "engagementScore",
  DROP COLUMN IF EXISTS "actualEngagementScore",
  DROP COLUMN IF EXISTS "curriculumJson",
  DROP COLUMN IF EXISTS "videoUrl",
  DROP COLUMN IF EXISTS "podcastUrl",
  DROP COLUMN IF EXISTS "transcriptUrl",
  ALTER COLUMN "priceCents" DROP DEFAULT,
  ALTER COLUMN "providerId" SET NOT NULL;

-- 3. Restore from backup (if available)
-- pg_restore -h [host] -U [user] -d [database] backup.dump
```

---

## Verification Checklist

After migration, verify:

- [ ] `trend_proposals` table exists with correct columns
- [ ] `course_progress` table exists with foreign keys to users and courses
- [ ] `courses` table has 13 new AI-related columns
- [ ] `TrendProposalStatus` enum exists
- [ ] All old dummy data is deleted (0 courses, 0 purchases, 0 leads)
- [ ] 6 Tech/AI categories are active
- [ ] 4 AI-generated courses exist with `isAIGenerated = true`
- [ ] 2 trend proposals exist
- [ ] 3 course progress records exist
- [ ] All foreign key constraints work
- [ ] Triggers for `updatedAt` auto-update work

### Quick Verification Script

```bash
cd frontend
npx prisma studio
```

Then manually check:
1. Navigate to `courses` → Verify 4 AI-generated courses
2. Navigate to `trend_proposals` → Verify 2 proposals
3. Navigate to `course_progress` → Verify 3 progress records
4. Navigate to `categories` → Verify 6 Tech/AI categories

---

## Post-Migration Tasks

### Immediate (Day 1)
- [ ] Update environment variables if needed
- [ ] Test course listing page shows AI-generated courses
- [ ] Test admin panel can view trend proposals
- [ ] Verify course progress tracking works

### Week 1
- [ ] Setup n8n workflow for daily trend scraping
- [ ] Configure Claude API keys
- [ ] Test AI course generation pipeline
- [ ] Generate first real AI course from a trend

### Week 2 (MVP Launch)
- [ ] Generate 6 more AI courses (total 10)
- [ ] Get 5 beta users to test courses
- [ ] Measure engagement metrics
- [ ] Iterate based on feedback

---

## Architecture Notes

### Hybrid Database Strategy

CourseHub uses a **hybrid approach** for optimal reliability:

**READ queries**: Supabase REST API (HTTPS/443)
- Bypasses network/firewall issues
- Used for homepage, course listings, user dashboards

**WRITE queries**: Prisma (PostgreSQL direct)
- Type-safe migrations and transactions
- Used for purchases, admin actions, progress tracking

See [`lib/database-adapter.ts`](../lib/database-adapter.ts) for implementation.

### AI Generation Cost Tracking

All AI-generated content tracks:
- **Estimated cost** (before generation)
- **Actual cost** (after generation)
- **Generation time** (minutes)
- **Engagement prediction** vs **actual engagement**

This enables cost optimization over time.

---

## Support

For issues during migration:
- Check Supabase logs: https://app.supabase.com → Logs
- Review Prisma errors: `npx prisma studio`
- Contact: admin@coursehub.dk

---

## Related Documentation

- [PROJECT.md](../docs/PROJECT.md) - Complete architecture and strategy
- [Web Design Style Guide](../docs/WEB-DESIGN-STYLEGUIDE.md) - UI/UX guidelines
- [Prisma Schema](./prisma/schema.prisma) - Database schema definition
- [Seed Data](./prisma/seed.js) - Test data generator

---

**Migration prepared**: October 26, 2025
**Strategy**: AI-First Knowledge Transmission Platform
**Goal**: Fastest learning platform on Earth (trend → course → user completion in <48h)
