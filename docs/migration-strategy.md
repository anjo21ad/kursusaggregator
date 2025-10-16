# Database Migration Strategy

## 🎯 Mål
Migrere fra simpel User/Course/Purchase struktur til fuldt B2B-ready schema uden datatab.

## 📊 Eksisterende Data Analysis
```sql
-- Check eksisterende data
SELECT COUNT(*) FROM "User";     -- Antal brugere
SELECT COUNT(*) FROM "Course";   -- Antal kurser  
SELECT COUNT(*) FROM "Purchase"; -- Antal køb
```

## 🔄 Migration Plan

### Step 1: Backup og Forberedelse
```bash
# Backup eksisterende database
pg_dump $DATABASE_URL > backup_before_migration.sql

# Generer ny migration
npx prisma migrate dev --name "b2b_schema_evolution"
```

### Step 2: Data Transformation

#### 2.1 Migrate Users
```sql
-- Users eksisterer allerede med id, email, role
-- Tilføj nye felter med defaults
UPDATE users SET 
  role = CASE 
    WHEN role = 'USER' THEN 'COMPANY_USER'
    WHEN role = 'ADMIN' THEN 'SUPER_ADMIN'
    ELSE 'COMPANY_USER'
  END::UserRole,
  isActive = true,
  createdAt = NOW(),
  updatedAt = NOW()
WHERE createdAt IS NULL;
```

#### 2.2 Migrate Courses
```sql
-- Opret default provider for eksisterende kurser
INSERT INTO providers (companyName, contactEmail, status, createdAt, updatedAt)
VALUES ('Legacy Provider', 'admin@kursusaggregator.dk', 'APPROVED', NOW(), NOW());

-- Opret default kategori
INSERT INTO categories (name, slug, createdAt) 
VALUES ('Generel', 'generel', NOW());

-- Migrate kurser til ny struktur
UPDATE courses SET
  providerId = (SELECT id FROM providers WHERE companyName = 'Legacy Provider'),
  categoryId = (SELECT id FROM categories WHERE slug = 'generel'),
  status = 'PUBLISHED',
  language = 'da',
  isActive = true,
  publishedAt = NOW(),
  createdAt = NOW(),
  updatedAt = NOW()
WHERE providerId IS NULL;
```

#### 2.3 Migrate Purchases
```sql
-- Purchases skal have priceCents fra course på købstidspunkt
UPDATE purchases SET
  priceCents = c.priceCents,
  type = 'DIRECT_SALE'
FROM courses c 
WHERE purchases.courseId = c.id
  AND purchases.priceCents IS NULL;
```

### Step 3: Data Validation
```sql
-- Verify alle users har valid roller
SELECT role, COUNT(*) FROM users GROUP BY role;

-- Verify alle courses har provider og kategori
SELECT COUNT(*) FROM courses WHERE providerId IS NULL OR categoryId IS NULL;

-- Verify purchases har priser
SELECT COUNT(*) FROM purchases WHERE priceCents IS NULL;
```

## 🚨 Rollback Plan
```sql
-- Hvis migration fejler, restore fra backup
psql $DATABASE_URL < backup_before_migration.sql
```

## ✅ Post-Migration Tasks
1. Generer ny Prisma client: `npx prisma generate`
2. Test API endpoints med nye typer
3. Opdater frontend TypeScript typer
4. Seed database med test categories og providers

## 🧪 Testing Strategy
```typescript
// Test nye relationer virker
const userWithCompany = await prisma.user.findFirst({
  include: { company: true, provider: true }
});

const courseWithDetails = await prisma.course.findFirst({
  include: { 
    provider: true, 
    category: true,
    purchases: { include: { user: true, company: true } }
  }
});
```