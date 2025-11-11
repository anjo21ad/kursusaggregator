# n8n Workflow Setup & Debug Scripts

This directory contains automation scripts for setting up and debugging the CourseHub n8n Content Generation workflow.

## 📋 Prerequisites

Before running the setup script, ensure you have:

1. **n8n Instance Running**
   - n8n Cloud: https://app.n8n.cloud
   - Self-hosted: Your own n8n instance

2. **n8n API Key**
   - Go to n8n Settings → API
   - Click "Create API Key"
   - Copy the JWT token

3. **Environment Variables**
   Required in `frontend/.env.local`:
   ```bash
   # n8n Configuration
   N8N_HOST=https://your-instance.app.n8n.cloud  # Your n8n instance URL
   N8N_API_KEY=eyJhbGc...                        # Your n8n API key (JWT token)

   # Anthropic
   ANTHROPIC_API_KEY=sk-ant-...

   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=https://...supabase.co
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
   ```

---

## 🚀 PART 1: Initial Workflow Setup

### Automatic Setup (Recommended)

Run the automated setup script:

```bash
cd frontend
npm run setup:n8n
```

**What it does:**
1. ✅ Validates environment variables
2. ✅ Creates Anthropic API credential in n8n
3. ✅ Creates Supabase Auth credential in n8n
4. ✅ Reads `n8n-workflow-content-generation.json`
5. ✅ Updates workflow with credential IDs
6. ✅ Uploads workflow to n8n
7. ✅ Activates workflow
8. ✅ Extracts webhook URL
9. ✅ Updates `.env.local` with webhook URL

**Time:** ~30 seconds

**Output:**
```
🚀 Starting n8n Workflow Automatic Setup
============================================================
✅ Environment variables validated

📝 Creating Anthropic API credential...
✅ Anthropic credential created: abc123...

📝 Creating Supabase Auth credential...
✅ Supabase credential created: def456...

📄 Reading workflow JSON...
🔧 Updating workflow with credential IDs...
   Updated node: Generate Section Content
   Updated node: Generate Section Quiz
   Updated node: Fetch Proposal
   Updated node: Fetch Course
   Updated node: Save to Database
   Updated node: Update Proposal Status
✅ Workflow updated with credentials

📤 Uploading workflow to n8n...
✅ Workflow uploaded: workflow-789

⚡ Activating workflow...
✅ Workflow activated

📝 Updating .env.local with webhook URL...
✅ .env.local updated with webhook URL: https://...webhook/generate-content

============================================================
✅ SETUP COMPLETE!

📊 Summary:
   - Workflow ID: workflow-789
   - Webhook URL: https://your-instance.app.n8n.cloud/webhook/generate-content
   - Status: Active

🎯 Next Steps:
   1. Restart your dev server: npm run dev
   2. Test workflow: Approve a proposal in /admin/proposals
   3. Monitor course generation (takes 2-4 minutes)

🎉 CourseHub Content Generation Pipeline is ready!
```

### Manual Setup (Alternative)

If you prefer manual setup, follow the guide in:
- [N8N-CONTENT-GENERATION-SETUP.md](../../N8N-CONTENT-GENERATION-SETUP.md)

---

## 🔧 PART 2: Loop Fix & Debugging Tools

After initial setup, use these tools to debug and fix loop iteration issues.

### Available Scripts

#### 1. `test-workflow.sh`
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

# Windows (via Chocolatey)
choco install jq
```

#### 2. `debug-loop-workflow.ts`
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

#### 3. `fix-loop-api.ts`
Automated tool to fix loop connections via n8n API.

**Usage:**
```bash
cd frontend
npx tsx scripts/fix-loop-api.ts
```

**What it does:**
- Downloads current workflow
- Fixes loop connections automatically
- Uploads fixed workflow back to n8n
- Creates backup before changes

#### 4. `fix-loop-curl.sh`
cURL-based script to fix loop connections (alternative to TypeScript version).

**Usage:**
```bash
cd frontend
./scripts/fix-loop-curl.sh
```

---

## 📋 Quick Start: Test Workflow After Fixing Loop

1. **Fix loop i n8n UI først** (følg LOOP-FIX-GUIDE.md i root folder)
2. **Kør test script:**
   ```bash
   cd frontend
   ./scripts/test-workflow.sh
   ```
3. **Åbn n8n UI** og watch execution:
   ```
   https://your-instance.app.n8n.cloud/workflow/YOUR_WORKFLOW_ID
   ```
4. **Check execution logs:**
   - Klik på "Executions" tab
   - Se seneste execution
   - Verify at loop kører 5 gange

### Verify Results in Database

```bash
# Using Prisma Studio
cd frontend
npx prisma studio

# Or query directly with Supabase MCP:
# SELECT id, title, curriculum_json, transcript_url
# FROM "Course"
# WHERE id = 1;
```

---

## 🔍 Troubleshooting

### Setup Issues

#### Error: "Missing required environment variables"

**Solution:** Ensure all required variables are in `.env.local`:
```bash
N8N_HOST=https://your-instance.app.n8n.cloud
N8N_API_KEY=eyJ...
ANTHROPIC_API_KEY=sk-ant-...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
NEXT_PUBLIC_SUPABASE_URL=https://...supabase.co
```

#### Error: "n8n API error (401): Unauthorized"

**Solution:** Your n8n API key is invalid or expired.
1. Go to n8n Settings → API
2. Delete old key
3. Create new API key
4. Update `N8N_API_KEY` in `.env.local`
5. Run `npm run setup:n8n` again

#### Error: "Workflow file not found"

**Solution:** Ensure you're running from the `frontend/` directory:
```bash
cd frontend
npm run setup:n8n
```

#### Error: "n8n API error (500): Internal Server Error"

**Solution:** n8n instance might be down or misconfigured.
1. Verify `N8N_HOST` is correct
2. Check n8n instance is accessible in browser
3. Try manual setup as fallback

### Testing Issues

#### Script fails: "Permission denied"
```bash
chmod +x scripts/test-workflow.sh
chmod +x scripts/fix-loop-curl.sh
```

#### Webhook returns 404
- Check at workflow er aktiv i n8n
- Verify webhook path: `/webhook/generate-content`
- Check at workflow ikke er slettet

#### Workflow fails (500 error)
- Open n8n UI og check execution logs
- Look for red nodes (errors)
- Common issues:
  - Anthropic API key invalid
  - Supabase credentials incorrect
  - Loop not configured correctly

#### Loop still doesn't iterate
- Read **LOOP-FIX-GUIDE.md** in root folder
- Check connections i n8n UI:
  - Output 0 → Extract Section
  - Output 1 → Assemble Complete Course
  - Merge Section Data → Loop Sections (back)
- Run `debug-loop-workflow.ts` for detailed diagnostics
- Use `fix-loop-api.ts` for automated fix

---

## 📁 All Scripts Overview

### Setup Scripts
- **`setup-n8n-workflow.ts`** - Main automation script for complete n8n workflow setup
- **`update-env.ts`** - Utility module for updating `.env` files

### Debug & Fix Scripts
- **`test-workflow.sh`** - Test workflow via webhook trigger
- **`debug-loop-workflow.ts`** - Diagnostic tool for loop configuration
- **`fix-loop-api.ts`** - Automated loop connection fix (TypeScript)
- **`fix-loop-curl.sh`** - Automated loop connection fix (cURL)

### Workflow Backups
- **`workflow-backup-*.json`** - Automatic backups before fixes
- **`current-workflow.json`** - Latest workflow state

---

## 🔒 Security Notes

- **Never commit `.env.local`** - Contains sensitive API keys
- **n8n API Key expires** - Check expiration date in JWT token
- **Rotate keys regularly** - Especially before production launch
- **Use environment-specific keys** - Different keys for dev/staging/prod

---

## 📚 Related Documentation

- **[LOOP-FIX-GUIDE.md](../../LOOP-FIX-GUIDE.md)** - Detailed guide to fix loop iteration issue
- **[LOOP-FIX-RESULTS.md](../../LOOP-FIX-RESULTS.md)** - Results of loop fix attempts
- **[N8N-CONTENT-GENERATION-DESIGN.md](../../N8N-CONTENT-GENERATION-DESIGN.md)** - Workflow architecture
- **[N8N-CONTENT-GENERATION-SETUP.md](../../N8N-CONTENT-GENERATION-SETUP.md)** - Manual setup guide
- **[n8n API Documentation](https://docs.n8n.io/api/)** - Official API docs

---

## 🎯 Next Steps After Setup & Loop Fix

1. **Restart Dev Server**
   ```bash
   npm run dev
   ```

2. **Test Workflow**
   - Navigate to `http://localhost:3004/admin/proposals`
   - Click "Godkend" on a PENDING proposal
   - Monitor server logs for webhook trigger
   - Wait 2-4 minutes for content generation
   - Verify course appears with complete content

3. **Generate Test Courses**
   - Generate 3-5 test courses
   - Quality check the generated content
   - Test learning experience on `/courses/[id]/learn`

4. **Launch to Beta Users**
   - Ship to 50 beta testers
   - Collect feedback
   - Iterate on content quality

---

## 🚀 Success Metrics

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
