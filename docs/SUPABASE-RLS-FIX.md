# Supabase RLS Fix Guide

## Problem
Row Level Security (RLS) er disabled på alle tabeller i Supabase, hvilket forårsager connection errors.

## Løsning

### Step 1: Enable RLS på Eksisterende Tabeller

1. Gå til Supabase Dashboard: https://supabase.com/dashboard
2. Vælg dit projekt
3. Gå til **SQL Editor** (venstre menu)
4. Klik **New Query**
5. Kopiér og kør indholdet fra: `prisma/enable-rls.sql`
6. Klik **Run** (eller tryk F5)

**Forventet output:**
```
Success. No rows returned
```

### Step 2: Tilføj ai_interactions Tabel

1. I samme SQL Editor
2. Klik **New Query** igen
3. Kopiér og kør indholdet fra: `prisma/add-ai-interactions-table.sql`
4. Klik **Run**

**Forventet output:**
```
table_name          | column_count
--------------------|-------------
ai_interactions     | 11
```

### Step 3: Verificér RLS Status

Kør denne query i SQL Editor:
```sql
SELECT
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
```

**Alle tabeller skal vise `rls_enabled = true`**

### Step 4: Test Database Connection

Tilbage i terminal:
```bash
cd frontend
npx prisma db pull
```

**Hvis det virker, fortsæt:**
```bash
npx prisma generate
npm run dev
```

## Alternativ: Brug Direct Connection

Hvis connection pooler stadig fejler, brug direct connection:

1. Gå til Supabase Dashboard → Settings → Database
2. Find **Connection string** under "Direct connection"
3. Kopiér connection string (port **5432**, ikke 6543)
4. Opdater `.env.local`:

```bash
# Change from pooler (port 6543)
DATABASE_URL="postgresql://postgres.savhtvkgjtkiqnqytppy:JwWeSoRQL1UT1F4E@aws-1-eu-north-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true"

# To direct connection (port 5432)
DATABASE_URL="postgresql://postgres:[YOUR_PASSWORD]@db.[YOUR_PROJECT].supabase.co:5432/postgres"
```

**VIGTIGT:** Fjern `?pgbouncer=true` fra direct connection URL.

## Produktion Security Policies

De nuværende policies tillader ALT for development (`USING (true)`).

**I produktion, erstat med sikre policies som:**

```sql
-- Example: Users can only read published courses
DROP POLICY IF EXISTS "Allow all operations on courses" ON public.courses;

CREATE POLICY "Public can view published courses"
  ON public.courses
  FOR SELECT
  USING (status = 'PUBLISHED' AND is_active = true);

CREATE POLICY "Providers can manage own courses"
  ON public.courses
  FOR ALL
  USING (
    provider_id IN (
      SELECT p.id
      FROM providers p
      JOIN users u ON u.provider_id = p.id
      WHERE u.id = auth.uid()
    )
  );
```

Se PROJECT.MD for flere production-ready RLS policies.

## Troubleshooting

### Problem: "permission denied for table X"
**Løsning:** Kør `enable-rls.sql` igen og verificér policies er oprettet.

### Problem: "relation ai_interactions does not exist"
**Løsning:** Kør `add-ai-interactions-table.sql`.

### Problem: Connection timeout
**Løsning:** Brug direct connection i stedet for pooler.

### Problem: "password authentication failed"
**Løsning:** Reset database password i Supabase Dashboard → Settings → Database.

## Næste Skridt Efter Fix

Når RLS er enabled og database connection virker:

1. Test homepage: `http://localhost:3000` → Should load without 500 error
2. Test AI chat: `http://localhost:3000/chat` → Should work end-to-end
3. Check database logging: AI interactions skal gemmes i `ai_interactions` tabel

**God arbejdslyst! 🚀**
