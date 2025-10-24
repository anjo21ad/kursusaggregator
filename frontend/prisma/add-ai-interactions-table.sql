-- Add ai_interactions table with RLS enabled
-- Run this AFTER enable-rls.sql

-- Create ai_interactions table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.ai_interactions (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    session_id TEXT NOT NULL,
    query TEXT NOT NULL,
    recommendations JSONB,
    model_used TEXT DEFAULT 'claude-sonnet-4-20250514',
    prompt_version TEXT,
    response_time_ms INTEGER,
    clicked_course_id INTEGER,
    booked_course_id INTEGER,
    feedback_rating INTEGER CHECK (feedback_rating >= 1 AND feedback_rating <= 5),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add foreign key constraints
ALTER TABLE public.ai_interactions
  ADD CONSTRAINT ai_interactions_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE public.ai_interactions
  ADD CONSTRAINT ai_interactions_clicked_course_id_fkey
  FOREIGN KEY (clicked_course_id) REFERENCES public.courses(id) ON DELETE SET NULL;

ALTER TABLE public.ai_interactions
  ADD CONSTRAINT ai_interactions_booked_course_id_fkey
  FOREIGN KEY (booked_course_id) REFERENCES public.courses(id) ON DELETE SET NULL;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_ai_interactions_user_id ON public.ai_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_interactions_session_id ON public.ai_interactions(session_id);

-- Enable RLS
ALTER TABLE public.ai_interactions ENABLE ROW LEVEL SECURITY;

-- Create permissive policy for development
DROP POLICY IF EXISTS "Allow all operations on ai_interactions" ON public.ai_interactions;
CREATE POLICY "Allow all operations on ai_interactions"
  ON public.ai_interactions
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Verify table was created
SELECT
    table_name,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'ai_interactions') as column_count
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name = 'ai_interactions';
