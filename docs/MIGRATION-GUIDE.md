# 🚀 B2B Database Migration Guide

## 📋 Pre-Migration Checklist

### 1. Backup Current Database
```bash
# Naviger til frontend directory
cd frontend

# Backup eksisterende database
pg_dump $DATABASE_URL > ../backup_$(date +%Y%m%d_%H%M%S).sql
```

### 2. Stop Running Applications
```bash
# Stop development server hvis den kører
# Ctrl+C i terminal hvor "npm run dev" kører
```

## 🔄 Migration Steps

### Step 1: Generate Migration
```bash
# I frontend directory
npx prisma migrate dev --name "b2b_schema_evolution"
```
**Forventet output:** Prisma vil generere migration filer baseret på schema ændringerne

### Step 2: Kontroller Migration Files
Check at migration filerne er oprettet korrekt:
```bash
ls -la prisma/migrations/
```

### Step 3: Kør Data Transformation
```bash
# Kør den manuelle migration script
psql $DATABASE_URL -f prisma/migrations/migration-script.sql
```

### Step 4: Generer Ny Prisma Client
```bash
npx prisma generate
```

### Step 5: Reset og Seed Database (Alternativ)
**⚠️ ADVARSEL: Dette sletter alle eksisterende data**

Hvis du vil starte helt forfra med test data:
```bash
# Reset database og seed med ny data
npx prisma migrate reset --force
npx prisma db seed
```

### Step 6: Verificer Migration
```bash
# Tjek database schema
npx prisma studio
# Eller
npx prisma db inspect
```

## 🧪 Test Migration Success

### 1. Tjek Data Integritet
```bash
# Kør disse SQL queries i psql eller Prisma Studio
psql $DATABASE_URL -c "
SELECT 'Users' as table_name, COUNT(*) as count FROM users
UNION ALL  
SELECT 'Companies', COUNT(*) FROM companies
UNION ALL
SELECT 'Providers', COUNT(*) FROM providers  
UNION ALL
SELECT 'Categories', COUNT(*) FROM categories
UNION ALL
SELECT 'Courses', COUNT(*) FROM courses
UNION ALL
SELECT 'Purchases', COUNT(*) FROM purchases
UNION ALL
SELECT 'Leads', COUNT(*) FROM leads;
"
```

### 2. Test API Endpoints
```bash
# Start development server
npm run dev

# Test i ny terminal:
curl http://localhost:3000/api/hello
```

### 3. Tjek Relationer
```typescript
// Kør i browser console på localhost:3000
fetch('/api/test-relations', { method: 'POST' })
  .then(r => r.json())
  .then(console.log)
```

## 🚨 Rollback Plan

Hvis migration fejler:

### Option 1: Restore fra Backup
```bash
# Stop alt der bruger databasen
# Restore fra backup
psql $DATABASE_URL < backup_YYYYMMDD_HHMMSS.sql

# Regenerer gamle Prisma client
git checkout HEAD~1 -- prisma/schema.prisma
npx prisma generate
```

### Option 2: Reset til Tidligere Migration
```bash
# Find tidligere migration
npx prisma migrate status

# Rollback til specifik migration
npx prisma migrate resolve --rolled-back "<migration_name>"
```

## ✅ Post-Migration Tasks

### 1. Opdater TypeScript Types
```bash
# Generer nye types
npx prisma generate

# Restart TypeScript service i IDE
# VS Code: Ctrl+Shift+P > "TypeScript: Restart TS Server"
```

### 2. Opdater API Endpoints
Check alle API endpoints i `src/pages/api/` for TypeScript fejl:
```bash
# Type check
npm run build
```

### 3. Test Frontend
```bash
# Test alle sider fungerer
npm run dev
# Besøg:
# - http://localhost:3000 (homepage)
# - http://localhost:3000/login
# - http://localhost:3000/my-courses
```

## 📊 Migration Validation Queries

```sql
-- Verify all users have valid roles
SELECT role, COUNT(*) 
FROM users 
GROUP BY role;

-- Check course-provider relationships
SELECT 
  c.title,
  p.companyName as provider,
  cat.name as category
FROM courses c
JOIN providers p ON c.providerId = p.id
JOIN categories cat ON c.categoryId = cat.id
WHERE c.status = 'PUBLISHED';

-- Verify purchases have company associations
SELECT 
  p.id,
  u.email,
  c.name as company,
  co.title as course
FROM purchases p
JOIN users u ON p.userId = u.id
LEFT JOIN companies c ON p.companyId = c.id  
JOIN courses co ON p.courseId = co.id;

-- Check lead generation data
SELECT 
  l.status,
  COUNT(*) as count
FROM leads l
GROUP BY l.status;
```

## 🔧 Common Issues & Solutions

### Issue: Migration hangs or fails
**Solution:**
```bash
# Cancel migration
# Ctrl+C

# Check database connections
npx prisma db execute --stdin
# Type: SELECT COUNT(*) FROM pg_stat_activity;
```

### Issue: TypeScript errors after migration
**Solution:**
```bash
# Regenerate Prisma client
npx prisma generate

# Restart TypeScript
# VS Code: Reload window
```

### Issue: Foreign key constraint errors
**Solution:**
```bash
# Check existing data integrity
# Fix data manually in psql or Prisma Studio before migration
```

## 🎉 Success Indicators

✅ Migration completed without errors
✅ All tables exist with correct schema
✅ Test data populated correctly  
✅ API endpoints return proper data
✅ Frontend loads without TypeScript errors
✅ Prisma Studio shows all relations correctly

---

**💡 Tip:** Kør migration på en test database først hvis du er usikker!