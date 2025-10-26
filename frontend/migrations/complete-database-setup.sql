-- Complete Database Setup for CourseHub AI-First Platform
-- This creates ALL tables from scratch based on Prisma schema

-- Drop existing tables if they exist (in reverse dependency order)
DROP TABLE IF EXISTS "course_progress" CASCADE;
DROP TABLE IF EXISTS "trend_proposals" CASCADE;
DROP TABLE IF EXISTS "ai_interactions" CASCADE;
DROP TABLE IF EXISTS "leads" CASCADE;
DROP TABLE IF EXISTS "purchases" CASCADE;
DROP TABLE IF EXISTS "courses" CASCADE;
DROP TABLE IF EXISTS "categories" CASCADE;
DROP TABLE IF EXISTS "providers" CASCADE;
DROP TABLE IF EXISTS "companies" CASCADE;
DROP TABLE IF EXISTS "users" CASCADE;

-- Drop existing enums if they exist
DROP TYPE IF EXISTS "UserRole" CASCADE;
DROP TYPE IF EXISTS "ProviderStatus" CASCADE;
DROP TYPE IF EXISTS "CourseStatus" CASCADE;
DROP TYPE IF EXISTS "PurchaseType" CASCADE;
DROP TYPE IF EXISTS "TrendProposalStatus" CASCADE;

-- Create enums
CREATE TYPE "UserRole" AS ENUM ('USER', 'COMPANY_USER', 'COMPANY_ADMIN', 'PROVIDER', 'SUPER_ADMIN');
CREATE TYPE "ProviderStatus" AS ENUM ('PENDING', 'APPROVED', 'SUSPENDED', 'REJECTED');
CREATE TYPE "CourseStatus" AS ENUM ('DRAFT', 'PENDING_REVIEW', 'PUBLISHED', 'ARCHIVED');
CREATE TYPE "PurchaseType" AS ENUM ('DIRECT_SALE', 'LEAD_GENERATION');
CREATE TYPE "TrendProposalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'GENERATING', 'PUBLISHED', 'FAILED');

-- Create companies table
CREATE TABLE "companies" (
  "id" SERIAL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "cvr" TEXT UNIQUE,
  "email" TEXT UNIQUE NOT NULL,
  "phone" TEXT,
  "address" TEXT,
  "city" TEXT,
  "postalCode" TEXT,
  "website" TEXT,
  "isActive" BOOLEAN DEFAULT true NOT NULL,
  "createdAt" TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  "updatedAt" TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create providers table
CREATE TABLE "providers" (
  "id" SERIAL PRIMARY KEY,
  "companyName" TEXT NOT NULL,
  "contactEmail" TEXT UNIQUE NOT NULL,
  "phone" TEXT,
  "website" TEXT,
  "description" TEXT,
  "address" TEXT,
  "city" TEXT,
  "postalCode" TEXT,
  "cvr" TEXT UNIQUE,
  "status" "ProviderStatus" DEFAULT 'PENDING' NOT NULL,
  "approvedAt" TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  "updatedAt" TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create users table
CREATE TABLE "users" (
  "id" VARCHAR(255) PRIMARY KEY,
  "email" TEXT UNIQUE NOT NULL,
  "firstName" TEXT,
  "lastName" TEXT,
  "role" "UserRole" DEFAULT 'USER' NOT NULL,
  "isActive" BOOLEAN DEFAULT true NOT NULL,
  "createdAt" TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  "updatedAt" TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  "companyId" INTEGER REFERENCES "companies"("id"),
  "providerId" INTEGER REFERENCES "providers"("id")
);

-- Create categories table
CREATE TABLE "categories" (
  "id" SERIAL PRIMARY KEY,
  "name" TEXT UNIQUE NOT NULL,
  "slug" TEXT UNIQUE NOT NULL,
  "description" TEXT,
  "isActive" BOOLEAN DEFAULT true NOT NULL,
  "parentId" INTEGER REFERENCES "categories"("id"),
  "icon" TEXT,
  "imageUrl" TEXT,
  "color" TEXT,
  "sortOrder" INTEGER DEFAULT 0 NOT NULL
);

-- Create courses table with AI features
CREATE TABLE "courses" (
  "id" SERIAL PRIMARY KEY,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "shortDesc" TEXT,
  "priceCents" INTEGER DEFAULT 0 NOT NULL,
  "duration" TEXT,
  "maxParticipants" INTEGER,
  "location" TEXT,
  "language" TEXT DEFAULT 'da' NOT NULL,
  "level" TEXT,
  "status" "CourseStatus" DEFAULT 'DRAFT' NOT NULL,
  "isActive" BOOLEAN DEFAULT true NOT NULL,
  "publishedAt" TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  "updatedAt" TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  "providerId" INTEGER REFERENCES "providers"("id"),
  "categoryId" INTEGER NOT NULL REFERENCES "categories"("id"),

  -- AI Generation Metadata
  "isAIGenerated" BOOLEAN DEFAULT false NOT NULL,
  "aiModel" TEXT,
  "generationCostUsd" DECIMAL(10, 2),
  "generationTimeMinutes" INTEGER,
  "trendProposalId" TEXT,
  "abTestVariant" TEXT,
  "engagementScore" INTEGER,
  "actualEngagementScore" INTEGER,

  -- Content URLs/Storage
  "curriculumJson" JSONB,
  "videoUrl" TEXT,
  "podcastUrl" TEXT,
  "transcriptUrl" TEXT,

  -- Content Lifecycle Management (Phase 3)
  "lastViewedAt" TIMESTAMPTZ,
  "archivedAt" TIMESTAMPTZ,
  "archivalReason" TEXT,
  "isEvergreen" BOOLEAN DEFAULT false NOT NULL,
  "supersededByCourseId" INTEGER
);

-- Create purchases table
CREATE TABLE "purchases" (
  "id" SERIAL PRIMARY KEY,
  "userId" VARCHAR(255) NOT NULL REFERENCES "users"("id"),
  "courseId" INTEGER NOT NULL REFERENCES "courses"("id"),
  "companyId" INTEGER REFERENCES "companies"("id"),
  "type" "PurchaseType" DEFAULT 'DIRECT_SALE' NOT NULL,
  "priceCents" INTEGER NOT NULL,
  "commission" INTEGER,
  "stripeSessionId" TEXT,
  "createdAt" TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create leads table
CREATE TABLE "leads" (
  "id" SERIAL PRIMARY KEY,
  "userId" VARCHAR(255) NOT NULL REFERENCES "users"("id"),
  "courseId" INTEGER NOT NULL REFERENCES "courses"("id"),
  "companyId" INTEGER NOT NULL REFERENCES "companies"("id"),
  "providerId" INTEGER NOT NULL REFERENCES "providers"("id"),
  "message" TEXT,
  "status" TEXT DEFAULT 'NEW' NOT NULL,
  "isConverted" BOOLEAN DEFAULT false NOT NULL,
  "convertedAt" TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  "updatedAt" TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create ai_interactions table
CREATE TABLE "ai_interactions" (
  "id" SERIAL PRIMARY KEY,
  "user_id" VARCHAR(255) NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "session_id" TEXT NOT NULL,
  "query" TEXT NOT NULL,
  "recommendations" JSONB,
  "model_used" TEXT DEFAULT 'claude-3-5-sonnet-20241022',
  "prompt_version" TEXT,
  "response_time_ms" INTEGER,
  "clicked_course_id" INTEGER REFERENCES "courses"("id"),
  "booked_course_id" INTEGER REFERENCES "courses"("id"),
  "feedback_rating" INTEGER,
  "created_at" TIMESTAMPTZ DEFAULT NOW()
);

-- Create trend_proposals table
CREATE TABLE "trend_proposals" (
  "id" TEXT PRIMARY KEY,

  -- Source Data
  "source" TEXT NOT NULL,
  "sourceUrl" TEXT,
  "sourceId" TEXT,

  -- Trend Information
  "title" TEXT NOT NULL,
  "description" TEXT,
  "keywords" TEXT[] NOT NULL,
  "trendScore" INTEGER,

  -- AI Analysis
  "aiCourseProposal" JSONB NOT NULL,
  "estimatedDurationMinutes" INTEGER,
  "estimatedGenerationCostUsd" DECIMAL(10, 2),
  "estimatedEngagementScore" INTEGER,

  -- Admin Decision
  "status" "TrendProposalStatus" DEFAULT 'PENDING' NOT NULL,

  -- Generation Results
  "generatedCourseId" INTEGER,
  "actualGenerationCostUsd" DECIMAL(10, 2),
  "actualGenerationTimeMinutes" INTEGER,

  "createdAt" TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  "updatedAt" TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create course_progress table
CREATE TABLE "course_progress" (
  "id" SERIAL PRIMARY KEY,
  "userId" VARCHAR(255) NOT NULL REFERENCES "users"("id"),
  "courseId" INTEGER NOT NULL REFERENCES "courses"("id"),

  -- Progress Tracking
  "currentSectionId" TEXT,
  "completedSections" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "progressPercentage" INTEGER DEFAULT 0 NOT NULL,

  -- Time Tracking
  "totalTimeMinutes" INTEGER DEFAULT 0 NOT NULL,
  "lastAccessedAt" TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  "startedAt" TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  "completedAt" TIMESTAMPTZ,

  -- Engagement Metrics
  "quizScores" JSONB,
  "exercisesCompleted" JSONB,

  "createdAt" TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  "updatedAt" TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  UNIQUE("userId", "courseId")
);

-- Create indexes for performance
CREATE INDEX "idx_users_email" ON "users"("email");
CREATE INDEX "idx_users_role" ON "users"("role");
CREATE INDEX "idx_users_company" ON "users"("companyId");
CREATE INDEX "idx_users_provider" ON "users"("providerId");

CREATE INDEX "idx_courses_status" ON "courses"("status");
CREATE INDEX "idx_courses_category" ON "courses"("categoryId");
CREATE INDEX "idx_courses_provider" ON "courses"("providerId");
CREATE INDEX "idx_courses_published" ON "courses"("publishedAt" DESC);
CREATE INDEX "idx_courses_ai_generated" ON "courses"("isAIGenerated");

-- AI Course Generation indexes
CREATE INDEX "idx_courses_trend_proposal" ON "courses"("trendProposalId");
CREATE INDEX "idx_courses_ab_test" ON "courses"("abTestVariant") WHERE "abTestVariant" IS NOT NULL;

-- Content Lifecycle Management indexes
CREATE INDEX "idx_courses_last_viewed" ON "courses"("lastViewedAt" DESC) WHERE "status" = 'PUBLISHED' AND "archivedAt" IS NULL;
CREATE INDEX "idx_courses_archived" ON "courses"("archivedAt" DESC) WHERE "archivedAt" IS NOT NULL;
CREATE INDEX "idx_courses_evergreen" ON "courses"("isEvergreen") WHERE "isEvergreen" = true;

CREATE INDEX "idx_purchases_user" ON "purchases"("userId");
CREATE INDEX "idx_purchases_course" ON "purchases"("courseId");
CREATE INDEX "idx_purchases_created" ON "purchases"("createdAt" DESC);

CREATE INDEX "idx_ai_interactions_user_id" ON "ai_interactions"("user_id");
CREATE INDEX "idx_ai_interactions_session_id" ON "ai_interactions"("session_id");

CREATE INDEX "idx_trend_proposals_status" ON "trend_proposals"("status");
CREATE INDEX "idx_trend_proposals_source" ON "trend_proposals"("source");
CREATE INDEX "idx_trend_proposals_created" ON "trend_proposals"("createdAt");

CREATE INDEX "idx_course_progress_user" ON "course_progress"("userId");
CREATE INDEX "idx_course_progress_course" ON "course_progress"("courseId");

-- Add foreign key for supersededByCourseId
ALTER TABLE "courses"
  ADD CONSTRAINT "courses_supersededByCourseId_fkey"
    FOREIGN KEY ("supersededByCourseId")
    REFERENCES "courses"("id")
    ON DELETE SET NULL;

-- Add table comments for documentation
COMMENT ON TABLE "trend_proposals" IS 'AI-generated course proposals from daily trend scraping (n8n)';
COMMENT ON TABLE "course_progress" IS 'Versatile progress tracking for personalized learning paths';
COMMENT ON COLUMN "courses"."isAIGenerated" IS 'True if course was generated by AI pipeline (Phase 1-3)';
COMMENT ON COLUMN "courses"."priceCents" IS 'Default 0 for Phase 1-3 (free), will be used in Phase 4';
COMMENT ON COLUMN "courses"."lastViewedAt" IS 'Track user engagement for archival decisions (Phase 3)';
COMMENT ON COLUMN "courses"."isEvergreen" IS 'Never archive (fundamentals, high-performers) - set to true for Python basics, Git, etc.';
COMMENT ON COLUMN "courses"."supersededByCourseId" IS 'ID of replacement course if this one is outdated/low quality';

-- Create updatedAt triggers for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON "users" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON "companies" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_providers_updated_at BEFORE UPDATE ON "providers" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON "courses" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON "leads" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_trend_proposals_updated_at BEFORE UPDATE ON "trend_proposals" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_course_progress_updated_at BEFORE UPDATE ON "course_progress" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant necessary permissions to all roles
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON SCHEMA public TO postgres, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, service_role;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, service_role, authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO postgres, anon, authenticated, service_role;

-- Set default privileges for future objects
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO postgres, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres, service_role, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT EXECUTE ON FUNCTIONS TO postgres, anon, authenticated, service_role;

-- Enable RLS on all tables
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "companies" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "providers" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "categories" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "courses" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "purchases" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "leads" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ai_interactions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "trend_proposals" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "course_progress" ENABLE ROW LEVEL SECURITY;

-- Public read access policies
CREATE POLICY "Public read access for active categories"
  ON "categories" FOR SELECT
  USING ("isActive" = true);

CREATE POLICY "Public read access for published courses"
  ON "courses" FOR SELECT
  USING ("status" = 'PUBLISHED' AND "isActive" = true);

CREATE POLICY "Public read access for active companies"
  ON "companies" FOR SELECT
  USING ("isActive" = true);

CREATE POLICY "Public read access for approved providers"
  ON "providers" FOR SELECT
  USING ("status" = 'APPROVED');

CREATE POLICY "Public read access for approved trend proposals"
  ON "trend_proposals" FOR SELECT
  USING ("status" IN ('APPROVED', 'GENERATING', 'PUBLISHED'));

-- User policies for own data
CREATE POLICY "Users can read own data"
  ON "users" FOR SELECT
  USING (auth.uid()::text = id);

CREATE POLICY "Users can read own purchases"
  ON "purchases" FOR SELECT
  USING (auth.uid()::text = "userId");

CREATE POLICY "Users can create own purchases"
  ON "purchases" FOR INSERT
  WITH CHECK (auth.uid()::text = "userId");

CREATE POLICY "Users can read own course progress"
  ON "course_progress" FOR SELECT
  USING (auth.uid()::text = "userId");

CREATE POLICY "Users can update own course progress"
  ON "course_progress" FOR UPDATE
  USING (auth.uid()::text = "userId")
  WITH CHECK (auth.uid()::text = "userId");

CREATE POLICY "Users can insert own course progress"
  ON "course_progress" FOR INSERT
  WITH CHECK (auth.uid()::text = "userId");

CREATE POLICY "Users can read own AI interactions"
  ON "ai_interactions" FOR SELECT
  USING (auth.uid()::text = "user_id");

CREATE POLICY "Users can create own AI interactions"
  ON "ai_interactions" FOR INSERT
  WITH CHECK (auth.uid()::text = "user_id");

-- Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';
NOTIFY pgrst, 'reload config';
