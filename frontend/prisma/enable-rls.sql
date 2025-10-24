-- Enable Row Level Security (RLS) on all tables
-- Run this in Supabase SQL Editor

-- Enable RLS on all existing tables
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Create permissive policies for development (TEMPORARILY ALLOW ALL)
-- WARNING: These are DEVELOPMENT-ONLY policies. Replace with proper policies in production!

-- Companies
DROP POLICY IF EXISTS "Allow all operations on companies" ON public.companies;
CREATE POLICY "Allow all operations on companies"
  ON public.companies
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Providers
DROP POLICY IF EXISTS "Allow all operations on providers" ON public.providers;
CREATE POLICY "Allow all operations on providers"
  ON public.providers
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Purchases
DROP POLICY IF EXISTS "Allow all operations on purchases" ON public.purchases;
CREATE POLICY "Allow all operations on purchases"
  ON public.purchases
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Courses
DROP POLICY IF EXISTS "Allow all operations on courses" ON public.courses;
CREATE POLICY "Allow all operations on courses"
  ON public.courses
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Users
DROP POLICY IF EXISTS "Allow all operations on users" ON public.users;
CREATE POLICY "Allow all operations on users"
  ON public.users
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Leads
DROP POLICY IF EXISTS "Allow all operations on leads" ON public.leads;
CREATE POLICY "Allow all operations on leads"
  ON public.leads
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Categories
DROP POLICY IF EXISTS "Allow all operations on categories" ON public.categories;
CREATE POLICY "Allow all operations on categories"
  ON public.categories
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Verify RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
