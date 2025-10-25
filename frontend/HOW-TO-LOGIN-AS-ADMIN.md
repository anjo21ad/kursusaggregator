# Sådan logger du ind som SUPER_ADMIN

## Nuværende Situation

Du har registreret dig via `/register-provider`, men blev oprettet som `PROVIDER` rolle i stedet for `SUPER_ADMIN`.

## Løsning 1: Opdater din bruger i databasen (Anbefalet)

### Via Supabase Dashboard:

1. **Gå til Supabase Dashboard**
   - Åbn https://supabase.com
   - Log ind på dit projekt
   - Vælg dit projekt: `savhtvkgjtkiqnqytppy`

2. **Åbn Table Editor**
   - Klik på "Table Editor" i venstre menu
   - Vælg tabellen `User`

3. **Find din bruger**
   - Find din email i listen
   - Klik på rækken

4. **Rediger rolle**
   - Find kolonnen `role`
   - Ændr værdien fra `PROVIDER` til `SUPER_ADMIN`
   - Gem ændringen

5. **Log ind**
   - Gå til http://localhost:3000/login
   - Log ind med din email og adgangskode
   - Klik "Admin Panel" i navigation
   - Du er nu SUPER_ADMIN! 🎉

## Løsning 2: Via Node.js Script (Når database er tilgængelig)

```bash
cd frontend
node check-user-role.js
```

Dette script vil:
- ✅ Vise alle brugere i databasen
- ✅ Automatisk opgradere dig til SUPER_ADMIN hvis du er den eneste bruger
- ✅ Vise login info

Hvis der er flere brugere, kør:
```bash
node upgrade-to-admin.js din@email.dk
```

## Løsning 3: Opret ny SUPER_ADMIN bruger (Fremtidig funktion)

Jeg kan oprette en special admin registreringsside med en hemmelig kode, hvis du foretrækker det.

## Efter du er logget ind som SUPER_ADMIN:

Du får adgang til:
- 📊 `/admin/dashboard` - Oversigt over platformen
- 🏢 `/admin/providers` - Godkend/afvis udbydere
- 📚 `/admin/courses` - Godkend/afvis kurser

## Vigtig Note:

**HUSK** at ændre din rolle til `SUPER_ADMIN` i databasen, ellers vil du ikke kunne tilgå admin panelet.

Den første bruger du opretter bør altid være SUPER_ADMIN. Senere kan du oprette flere admins eller providers efter behov.

## Test Admin Funktionalitet:

1. **Godkend en provider:**
   - Log ind som SUPER_ADMIN
   - Gå til `/admin/providers`
   - Klik "Godkend" på en pending provider

2. **Godkend et kursus:**
   - Gå til `/admin/courses`
   - Klik "Godkend" på et pending kursus

3. **Se statistik:**
   - Gå til `/admin/dashboard`
   - Se oversigt over platformens aktivitet
