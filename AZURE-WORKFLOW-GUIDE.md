# Azure Course Generation Workflow Guide

## Oversigt

Dette dokument forklarer hvordan man skifter fra HackerNews til Azure som kilde for kursusforslag.

## 🚀 Hurtig Start

**Simpleste måde at komme i gang:**

### Option 1: Test Lokalt (Anbefalet først)

1. **Start Next.js:**
   ```bash
   cd frontend && npm run dev
   ```

2. **Test API endpoint:**
   ```bash
   curl http://localhost:3000/api/azure-articles
   # Burde returnere 8 Azure-emner
   ```

3. **Kør n8n lokalt (hvis du vil teste workflowet):**
   ```bash
   docker run -p 5678:5678 n8nio/n8n
   ```

4. **Import workflow** og sæt `WEBHOOK_URL=http://host.docker.internal:3000`

### Option 2: Railway n8n (Production)

1. **Deploy frontend** til Vercel/Railway først
2. **Åbn Railway n8n**: https://n8n-production-30ce.up.railway.app
3. **Import** `n8n-workflow-azure-scraper.json`
4. **Ændr "Fetch Azure Articles" node** til din production URL
5. **Sæt environment variables** i Railway n8n settings

---

## Hvad er blevet lavet?

### 1. API Endpoint: `/api/azure-articles`

**Fil:** [`frontend/src/pages/api/azure-articles.ts`](frontend/src/pages/api/azure-articles.ts)

Returnerer 8 kuraterede Azure-emner i et format som n8n kan forbruge:

```json
{
  "success": true,
  "source": "azure-docs",
  "count": 8,
  "total": 8,
  "articles": [
    {
      "id": "azure-storage-account",
      "title": "Azure Storage Account: Komplet Guide til Cloud Storage",
      "url": "https://learn.microsoft.com/en-us/azure/storage/...",
      "description": "Lær hvordan Azure Storage Account fungerer...",
      "score": 95,
      "time": 1731445200,
      "author": "Microsoft Azure",
      "keywords": ["Azure", "Storage", "Blob Storage", ...]
    },
    ...
  ]
}
```

**Test endpointet:**
```bash
curl http://localhost:3000/api/azure-articles
```

### 2. n8n Workflow: Azure Scraper

**Fil:** [`n8n-workflow-azure-scraper.json`](n8n-workflow-azure-scraper.json)

Modificeret version af HackerNews-scraperen, der:
1. Henter data fra `/api/azure-articles` i stedet for HackerNews API
2. Looper gennem Azure-emnerne
3. Sender hver artikel til Claude AI for analyse
4. Filtrerer baseret på relevans (≥70%)
5. Sender til Next.js webhook for at oprette TrendProposals

## Installation i n8n

### Trin 1: Import workflow

1. Åbn n8n UI (typisk http://localhost:5678)
2. Klik på **"+"** → **"Import from File"**
3. Vælg filen: `n8n-workflow-azure-scraper.json`
4. Klik **"Import"**

### Trin 2: Konfigurer credentials

Workflowet kræver følgende credentials:

#### Anthropic API (Claude)
1. Gå til **Settings** → **Credentials**
2. Klik **"New"** → **"Anthropic API"**
3. Navngiv: `Anthropic API`
4. Indsæt din API key fra https://console.anthropic.com/
5. Gem

### Trin 3: Konfigurer environment variables

n8n skal kende Next.js webhook URL og secret:

#### For Railway n8n (Production)

1. Gå til **Railway n8n**: https://n8n-production-30ce.up.railway.app
2. Log ind og gå til **Settings** → **Environments**
3. Tilføj følgende variabler:

**Development/Testing (localhost):**
```bash
WEBHOOK_URL=http://localhost:3000
WEBHOOK_SECRET=coursehub_n8n_secure_key_2025_change_in_production
```

**Production (når frontend er deployed):**
```bash
WEBHOOK_URL=https://[DIN-VERCEL-URL]
WEBHOOK_SECRET=coursehub_n8n_secure_key_2025_change_in_production
```

**VIGTIGT:**
- Hvis n8n kører i Docker lokalt, brug `http://host.docker.internal:3000`
- Railway n8n kan ikke tilgå localhost - test da lokalt først eller deploy frontend

### Trin 4: Test workflowet

1. Åbn "Azure Course Trend Scraper" workflow
2. Klik på noden **"Fetch Azure Articles"**
3. Klik **"Execute Node"** (test button)
4. Verificer at du får 8 Azure-artikler tilbage
5. Kør hele workflowet med **"Execute Workflow"**

### Trin 5: Aktivér scheduled trigger

1. Åbn workflowet
2. Klik på noden **"Schedule Daily 06:00 CET"**
3. Klik **"Active"** toggle i højre hjørne af workflowet
4. Workflowet vil nu køre dagligt kl. 06:00

## Workflow-flow forklaret

```
┌─────────────────────────────────────────────┐
│  1. Schedule Daily 06:00 CET                │
│     Kører hver dag kl. 06:00                │
└─────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────┐
│  2. Fetch Azure Articles                    │
│     GET http://localhost:3000/api/azure-articles
│     Returnerer 8 Azure-emner                │
└─────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────┐
│  3. Extract Articles                        │
│     Udtræk articles array fra response      │
└─────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────┐
│  4. Loop Over Articles                      │
│     Process én artikel ad gangen            │
└─────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────┐
│  5. AI Analysis (Claude)                    │
│     Claude analyserer Azure-emnet           │
│     Genererer course proposal               │
└─────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────┐
│  6. Merge Data                              │
│     Kombiner artikel-data + AI-analyse      │
└─────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────┐
│  7. Filter: Relevance >= 70                 │
│     Kun kurser med høj relevans             │
└─────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────┐
│  8. Send to Next.js Webhook                 │
│     POST /api/webhooks/n8n-trend            │
│     Opretter TrendProposal i database       │
└─────────────────────────────────────────────┘
```

## Verificer at det virker

### 1. Check Next.js logs

Efter workflow kører, tjek Next.js logs:
```bash
cd frontend && npm run dev
```

Du burde se:
```
✅ [n8n-webhook] Trend proposal created: azure-storage-account
✅ [n8n-webhook] Trend proposal created: azure-data-factory
...
```

### 2. Check admin dashboard

1. Log ind som SUPER_ADMIN
2. Naviger til http://localhost:3000/admin/proposals
3. Du burde se 8 nye Azure TrendProposals med status **PENDING**

### 3. Godkend og generer kurser

For hver Azure TrendProposal:
1. Klik **"✅ Godkend"** for at ændre status til APPROVED
2. Klik **"🚀 Generer Kursus med AI"** for at starte course generation
3. Vent ~2-5 minutter mens Claude genererer kursusindhold
4. Kursus vil automatisk blive published med priceCents=0 (gratis)

## Tilføj flere Azure-emner

For at tilføje flere Azure-emner, rediger [`frontend/src/pages/api/azure-articles.ts`](frontend/src/pages/api/azure-articles.ts):

```typescript
const azureArticles: AzureArticle[] = [
  // Eksisterende 8 emner...

  // Tilføj nyt emne:
  {
    id: 'azure-functions',
    title: 'Azure Functions: Serverless Computing i Azure',
    url: 'https://learn.microsoft.com/en-us/azure/azure-functions/',
    description: 'Byg event-driven serverless applikationer...',
    score: 89,
    time: Math.floor(Date.now() / 1000),
    author: 'Microsoft Azure',
    keywords: ['Azure', 'Functions', 'Serverless', 'Event-Driven']
  }
]
```

Næste gang n8n-workflowet kører, vil det nye emne blive inkluderet.

## Skift mellem HackerNews og Azure

Du kan køre **begge workflows samtidigt**:

### HackerNews (Tech Trends)
- Workflow: `n8n-workflow-hackernews-scraper.json`
- Kører dagligt kl. 06:00
- Finder trending tech-emner fra HackerNews
- Perfekt til at opdage nye teknologier

### Azure (Curated Content)
- Workflow: `n8n-workflow-azure-scraper.json`
- Kører dagligt kl. 06:00 (eller anden tid)
- Genererer kurser fra kuraterede Azure-emner
- Perfekt til enterprise/corporate træning

Begge workflows poster til samme webhook og opretter TrendProposals i databasen.

## Fremtidig udvidelse: Automatisk scraping

I fremtiden kan Azure-workflowet udvides til at **automatisk scrape** Microsoft Learn eller Azure Blog:

### Option A: Scrape Azure Blog RSS
```
1. Fetch RSS feed: https://azure.microsoft.com/en-us/blog/feed/
2. Parse XML for seneste posts
3. Filter for relevante emner
4. Send til Claude for analyse
```

### Option B: Scrape Microsoft Learn
```
1. Fetch Microsoft Learn homepage
2. Udtræk "What's New" sektion
3. Parse for nye Azure-services/features
4. Send til Claude for analyse
```

Dette kræver HTML parsing og er mere komplekst, men giver **automatisk opdagelse** af nye Azure-emner.

## Troubleshooting

### Workflow fejler ved "Fetch Azure Articles"

**Problem:** Cannot connect to localhost:3000 (Railway n8n)

**Løsning:**
Railway n8n kan **ikke** tilgå localhost. Du har to muligheder:

1. **Test lokalt først:**
   - Kør n8n lokalt med Docker: `docker run -p 5678:5678 n8nio/n8n`
   - Brug `WEBHOOK_URL=http://host.docker.internal:3000`
   - Test workflowet lokalt før upload til Railway

2. **Deploy frontend først:**
   - Deploy frontend til Vercel/Railway
   - Opdater `WEBHOOK_URL` i Railway n8n til production URL
   - Test direkte fra Railway n8n

### Ingen TrendProposals oprettes

**Problem:** Webhook kalder fejler

**Løsning:**
- Check webhook URL i n8n environment variables
- Verificer WEBHOOK_SECRET matcher mellem n8n og Next.js .env
- Check Next.js logs for fejlbeskeder

### Claude API fejler

**Problem:** 401 Unauthorized

**Løsning:**
- Verificer Anthropic API credentials i n8n
- Check at API key er gyldig på https://console.anthropic.com/

### Alle TrendProposals filtreres bort

**Problem:** Ingen emner passerer "Filter: Relevance >= 70"

**Løsning:**
- Reducer threshold til 40 i filter-noden
- Check Claude AI response i "AI Analysis" node execution logs

## Support

Ved problemer:
1. Check n8n execution logs
2. Check Next.js server logs (`npm run dev`)
3. Verificer database connections til Supabase
4. Test endpoint manuelt: `curl http://localhost:3000/api/azure-articles`
