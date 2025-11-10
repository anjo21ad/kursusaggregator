# n8n Workflow Scripts

Scripts til at debugge og teste n8n Content Generation Pipeline workflow.

## 🛠 Available Scripts

### 1. `test-workflow.sh`
Tester content generation workflow ved at sende en webhook request.

**Usage:**
```bash
cd frontend
./scripts/test-workflow.sh
```

**What it does:**
- Sender POST request til n8n webhook endpoint
- Trigger workflow med Course ID 1 (Building Production-Ready RAG Systems)
- Viser response og status
- Giver instruktioner til at følge execution i n8n UI

**Prerequisites:**
- n8n workflow skal være aktiv
- Course ID 1 skal have curriculum (allerede sat op)
- jq skal være installeret (for pretty JSON output)

Install jq:
```bash
# Ubuntu/Debian
sudo apt-get install jq

# macOS
brew install jq
```

### 2. `debug-loop-workflow.ts`
TypeScript diagnostic tool til at analysere loop configuration via n8n API.

**Usage:**
```bash
cd frontend

# Install dependencies first
npm install dotenv

# Set environment variable
export N8N_API_KEY="your-api-key"

# Run diagnostic
npx tsx scripts/debug-loop-workflow.ts
```

**What it does:**
- Fetcher workflow fra n8n API
- Analyserer Loop Sections node configuration
- Checker om loop connections er korrekte
- Giver detaljerede fix instructions

**Prerequisites:**
- N8N_API_KEY environment variable
- Node.js og npm installeret
- tsx eller ts-node til at køre TypeScript

## 📋 Quick Start

### Test Workflow After Fixing Loop

1. **Fix loop i n8n UI først** (følg LOOP-FIX-GUIDE.md)
2. **Kør test script:**
   ```bash
   cd frontend
   ./scripts/test-workflow.sh
   ```
3. **Åbn n8n UI** og watch execution:
   ```
   https://n8n-production-30ce.up.railway.app/workflow/FimIaNZ66cEz96GM
   ```
4. **Check execution logs:**
   - Klik på "Executions" tab
   - Se seneste execution
   - Verify at loop kører 5 gange

### Verify Results in Database

```bash
# Using Supabase MCP or Prisma Studio
cd frontend
npx prisma studio

# Or query directly:
# SELECT id, title, curriculum_json, transcript_url
# FROM "Course"
# WHERE id = 1;
```

## 🔍 Troubleshooting

### Script fails: "Permission denied"
```bash
chmod +x scripts/test-workflow.sh
```

### Webhook returns 404
- Check at workflow er aktiv i n8n
- Verify webhook path: `/webhook/generate-content`
- Check at workflow ikke er slettet

### Workflow fails (500 error)
- Open n8n UI og check execution logs
- Look for red nodes (errors)
- Common issues:
  - Anthropic API key invalid
  - Supabase credentials incorrect
  - Loop not configured correctly

### Loop still doesn't iterate
- Read LOOP-FIX-GUIDE.md in root folder
- Check connections i n8n UI:
  - Output 0 → Extract Section
  - Output 1 → Assemble Complete Course
  - Merge Section Data → Loop Sections (back)

## 📚 Related Documentation

- **LOOP-FIX-GUIDE.md** - Detailed guide to fix loop iteration issue
- **N8N-SETUP.md** - n8n initial setup (HackerNews scraper)
- **CLAUDE.md** - Full project instructions
- **STATUS-RAPPORT.md** - Current project status

## 🚀 Next Steps After Loop Fix

1. ✅ Fix loop iteration (følg LOOP-FIX-GUIDE.md)
2. ✅ Test workflow (brug `test-workflow.sh`)
3. ✅ Verify content quality (check generated sections)
4. ⏭️ Implement error handling
5. ⏭️ Add cost tracking
6. ⏭️ Test with multiple courses
7. ⏭️ Deploy to production

## 🎯 Success Metrics

Workflow fungerer korrekt når:
- ✅ Execution tager 5-15 minutter (ikke 2 sekunder)
- ✅ Loop Sections itererer 5 gange
- ✅ Alle nodes bliver grønne (success)
- ✅ Content gemmes til database
- ✅ Proposal status opdateres til PUBLISHED
- ✅ Cost tracking logger generation cost

---

**Remember:** Ship → Learn → Iterate → Scale

Dette er MVP. Vi kan forbedre baseret på rigtig data!
