# 🧪 Provider Workflow Test Guide

Dette dokument guider dig gennem test af hele provider registration og approval workflow.

## 🚀 Pre-Test Setup

### 1. Kør Database Migration
```bash
cd frontend

# Hvis du ikke har kørt migration endnu:
npx prisma migrate dev --name "b2b_schema_evolution"
npx prisma db seed

# Start development server
npm run dev
```

### 2. Verificer Database
Besøg http://localhost:3000/api/test-relations for at sikre B2B schema fungerer.

## 🔄 Test Workflow

### Step 1: Provider Registration
1. **Gå til registrering**: http://localhost:3000/register-provider

2. **Udfyld formular** med test data:
   ```
   Virksomhedsoplysninger:
   - Virksomhedsnavn: "TestAcademy ApS"
   - CVR: "99999999"
   - Email: "kontakt@testacademy.dk"
   - Telefon: "+45 12 34 56 78"
   - Website: "https://testacademy.dk"
   - By: "København"
   - Beskrivelse: "Vi er specialister i tekniske kurser for danske virksomheder"

   Administrator:
   - Fornavn: "Test"
   - Efternavn: "Provider"
   - Email: "admin@testacademy.dk"
   - Adgangskode: "testpwd123"
   ```

3. **Send ansøgning** og verificer:
   - ✅ Success besked vises
   - ✅ Redirect til login siden
   - ✅ Check database at provider blev oprettet med status "PENDING"

### Step 2: Provider Login (Pending State)
1. **Log ind** på http://localhost:3000/login med:
   - Email: admin@testacademy.dk
   - Password: testpwd123

2. **Verificer pending state**:
   - ✅ Automatisk redirect til /provider/pending
   - ✅ Korrekt "Afventer Godkendelse" besked
   - ✅ Provider information vises korrekt

### Step 3: Admin Approval
1. **Log ud** som provider

2. **Log ind som admin** med super admin konto:
   - Email: admin@kursusaggregator.dk (fra seed data)
   - Password: [skal sættes op i Supabase]

3. **Gå til admin panel**: http://localhost:3000/admin/providers

4. **Godkend provider**:
   - ✅ Se pending provider i listen
   - ✅ Klik "Godkend" knappen
   - ✅ Verificer status ændres til "APPROVED"
   - ✅ Check approvedAt timestamp sættes

### Step 4: Provider Dashboard Access
1. **Log ind igen som provider** (admin@testacademy.dk)

2. **Verificer dashboard adgang**:
   - ✅ Automatisk redirect til /provider/dashboard
   - ✅ Dashboard vises med korrekt provider navn
   - ✅ Stats cards viser (alle 0 for ny provider)
   - ✅ "Opret Nyt Kursus" knapper virker

### Step 5: Test API Endpoints
Test alle API endpoints med Postman eller curl:

```bash
# 1. Test provider registration
curl -X POST http://localhost:3000/api/provider/register \
  -H "Content-Type: application/json" \
  -d '{
    "companyName": "API Test Provider",
    "contactEmail": "api@test.dk",
    "userFirstName": "API",
    "userLastName": "Tester", 
    "userEmail": "apitest@test.dk",
    "userPassword": "testpass123"
  }'

# 2. Test admin providers list (requires admin token)
curl -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  http://localhost:3000/api/admin/providers

# 3. Test provider stats (requires provider token)
curl -H "Authorization: Bearer YOUR_PROVIDER_TOKEN" \
  http://localhost:3000/api/provider/stats

# 4. Test user profile
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/user/profile
```

## ✅ Success Criteria

### Registration Flow
- [ ] Provider kan registrere sig uden fejl
- [ ] Database records oprettes korrekt
- [ ] Supabase auth user oprettes
- [ ] Email validation fungerer
- [ ] Duplicate protection virker

### Authentication & Authorization
- [ ] Provider kan logge ind
- [ ] Role-based redirects fungerer
- [ ] Pending state håndteres korrekt
- [ ] Dashboard access kun for approved providers

### Admin Interface
- [ ] Admin kan se alle providers
- [ ] Status updates fungerer
- [ ] Statistics vises korrekt
- [ ] Provider information er komplet

### Provider Dashboard
- [ ] Dashboard loader uden fejl
- [ ] Stats vises (selv om 0 for nye providers)
- [ ] Navigation links fungerer
- [ ] Logout fungerer

## 🚨 Common Issues & Solutions

### Issue: "User not found in database"
**Solution**: Verificer at database migration kørte korrekt og seed data er indlæst.

### Issue: "Provider not approved yet"
**Solution**: Sørg for at provider status er "APPROVED" i databasen.

### Issue: Supabase auth fejl
**Solution**: Check at SUPABASE_SERVICE_ROLE_KEY er sat korrekt i .env

### Issue: Database connection fejl
**Solution**: Verificer DATABASE_URL i .env og at PostgreSQL kører.

## 📊 Test Data Verification

Efter test skal disse data være i databasen:

```sql
-- Check providers
SELECT id, companyName, status, createdAt FROM providers;

-- Check provider users  
SELECT u.email, u.role, p.companyName 
FROM users u 
JOIN providers p ON u.providerId = p.id;

-- Check Supabase users match database users
SELECT COUNT(*) FROM users WHERE role = 'PROVIDER';
```

## 🎉 Next Steps After Successful Test

1. **Provider Course Creation** - Implementer kursus oprettelse
2. **Course Approval Workflow** - Admin review af kurser
3. **Lead Generation** - Virksomheder kan sende forespørgsler
4. **Email Notifications** - Automatiske emails ved status ændringer
5. **Advanced Analytics** - Detaljeret provider performance tracking

---

**💡 Tip**: Test altid med flere providers for at sikre isolation og concurrent access fungerer korrekt!