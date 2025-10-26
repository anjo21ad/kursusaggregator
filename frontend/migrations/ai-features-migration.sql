-- Migration: Add AI Course Generation Features
-- Date: 2025-10-26
-- Description: Adds TrendProposal, CourseProgress tables and AI metadata to Courses

-- Add new enum for TrendProposalStatus
CREATE TYPE "TrendProposalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'GENERATING', 'PUBLISHED', 'FAILED');

-- Create TrendProposal table
CREATE TABLE "trend_proposals" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,

  -- Source Data
  "source" TEXT NOT NULL,
  "sourceUrl" TEXT,
  "sourceId" TEXT,

  -- Trend Information
  "title" TEXT NOT NULL,
  "description" TEXT,
  "keywords" TEXT[],
  "trendScore" INTEGER,

  -- AI Analysis
  "aiCourseProposal" JSONB NOT NULL,
  "estimatedDurationMinutes" INTEGER,
  "estimatedGenerationCostUsd" DECIMAL(10,2),
  "estimatedEngagementScore" INTEGER,

  -- Admin Decision
  "status" "TrendProposalStatus" DEFAULT 'PENDING',

  -- Generation Results
  "generatedCourseId" INTEGER,
  "actualGenerationCostUsd" DECIMAL(10,2),
  "actualGenerationTimeMinutes" INTEGER,

  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for TrendProposal
CREATE INDEX "idx_trend_proposals_status" ON "trend_proposals"("status");
CREATE INDEX "idx_trend_proposals_source" ON "trend_proposals"("source");
CREATE INDEX "idx_trend_proposals_created_at" ON "trend_proposals"("createdAt");

-- Create CourseProgress table
CREATE TABLE "course_progress" (
  "id" SERIAL PRIMARY KEY,
  "userId" VARCHAR(255) NOT NULL,
  "courseId" INTEGER NOT NULL,

  -- Progress Tracking
  "currentSectionId" TEXT,
  "completedSections" TEXT[],
  "progressPercentage" INTEGER DEFAULT 0,

  -- Time Tracking
  "totalTimeMinutes" INTEGER DEFAULT 0,
  "lastAccessedAt" TIMESTAMPTZ DEFAULT NOW(),
  "startedAt" TIMESTAMPTZ DEFAULT NOW(),
  "completedAt" TIMESTAMPTZ,

  -- Engagement Metrics
  "quizScores" JSONB,
  "exercisesCompleted" JSONB,

  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW(),

  -- Foreign keys
  FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE,
  FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE CASCADE,

  -- Unique constraint
  UNIQUE("userId", "courseId")
);

-- Create indexes for CourseProgress
CREATE INDEX "idx_course_progress_user_id" ON "course_progress"("userId");
CREATE INDEX "idx_course_progress_course_id" ON "course_progress"("courseId");

-- Add AI generation metadata columns to courses table
ALTER TABLE "courses"
  ALTER COLUMN "priceCents" SET DEFAULT 0,
  ALTER COLUMN "providerId" DROP NOT NULL,
  ADD COLUMN "isAIGenerated" BOOLEAN DEFAULT false,
  ADD COLUMN "aiModel" TEXT,
  ADD COLUMN "generationCostUsd" DECIMAL(10,2),
  ADD COLUMN "generationTimeMinutes" INTEGER,
  ADD COLUMN "trendProposalId" TEXT,
  ADD COLUMN "abTestVariant" TEXT,
  ADD COLUMN "engagementScore" INTEGER,
  ADD COLUMN "actualEngagementScore" INTEGER,
  ADD COLUMN "curriculumJson" JSONB,
  ADD COLUMN "videoUrl" TEXT,
  ADD COLUMN "podcastUrl" TEXT,
  ADD COLUMN "transcriptUrl" TEXT,
  -- Content Lifecycle Management (Phase 3)
  ADD COLUMN "lastViewedAt" TIMESTAMPTZ,
  ADD COLUMN "archivedAt" TIMESTAMPTZ,
  ADD COLUMN "archivalReason" TEXT,
  ADD COLUMN "isEvergreen" BOOLEAN DEFAULT false,
  ADD COLUMN "supersededByCourseId" INTEGER;

-- Add foreign key constraint for providerId (now optional)
ALTER TABLE "courses"
  DROP CONSTRAINT IF EXISTS "courses_providerId_fkey",
  ADD CONSTRAINT "courses_providerId_fkey"
    FOREIGN KEY ("providerId")
    REFERENCES "providers"("id")
    ON DELETE SET NULL;

-- Clean up dummy data (as per migration plan)
DELETE FROM "purchases";
DELETE FROM "leads";
DELETE FROM "courses";

-- Update categories to Tech/AI focus only
UPDATE "categories"
SET "isActive" = false
WHERE "name" NOT IN (
  'AI/ML',
  'Machine Learning',
  'Deep Learning',
  'Cloud Computing',
  'AWS',
  'Azure',
  'Frontend Development',
  'React',
  'Vue',
  'Angular',
  'Backend Development',
  'Node.js',
  'Python',
  'Mobile Development',
  'React Native',
  'Flutter',
  'DevOps',
  'Docker',
  'Kubernetes',
  'Data Engineering',
  'Data Science'
);

-- Create function to auto-update updatedAt timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for auto-updating updatedAt
CREATE TRIGGER update_trend_proposals_updated_at
  BEFORE UPDATE ON "trend_proposals"
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_course_progress_updated_at
  BEFORE UPDATE ON "course_progress"
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for Content Lifecycle Management
CREATE INDEX "idx_courses_last_viewed" ON "courses"("lastViewedAt" DESC)
  WHERE "status" = 'PUBLISHED' AND "archivedAt" IS NULL;

CREATE INDEX "idx_courses_archived" ON "courses"("archivedAt" DESC)
  WHERE "archivedAt" IS NOT NULL;

CREATE INDEX "idx_courses_evergreen" ON "courses"("isEvergreen")
  WHERE "isEvergreen" = true;

-- Add foreign key for supersededByCourseId
ALTER TABLE "courses"
  ADD CONSTRAINT "courses_supersededByCourseId_fkey"
    FOREIGN KEY ("supersededByCourseId")
    REFERENCES "courses"("id")
    ON DELETE SET NULL;

-- Add comment explaining the hybrid database strategy
COMMENT ON TABLE "trend_proposals" IS 'AI-generated course proposals from daily trend scraping (n8n)';
COMMENT ON TABLE "course_progress" IS 'Detailed user progress tracking for personalized learning paths';
COMMENT ON COLUMN "courses"."isAIGenerated" IS 'True if course was generated by AI pipeline (Phase 1-3)';
COMMENT ON COLUMN "courses"."priceCents" IS 'Default 0 for Phase 1-3 (free), will be used in Phase 4';
COMMENT ON COLUMN "courses"."lastViewedAt" IS 'Track last user view for archival decisions (Phase 3)';
COMMENT ON COLUMN "courses"."archivedAt" IS 'When course was archived (outdated/low quality)';
COMMENT ON COLUMN "courses"."isEvergreen" IS 'Never archive (fundamentals, high-performers) - set to true for Python basics, Git, etc.';
COMMENT ON COLUMN "courses"."supersededByCourseId" IS 'ID of replacement course if this one is outdated';
