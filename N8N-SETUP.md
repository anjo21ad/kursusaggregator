# n8n HackerNews Scraper Setup Guide

## 🎯 Overview

This n8n workflow scrapes HackerNews top 5 stories daily at 06:00 CET, analyzes them with Claude AI, and creates TrendProposals in the CourseHub database.

**Status:** Phase 1 MVP - Manual approval required for generated proposals.

---

## 📋 Prerequisites

1. **n8n Account** - Sign up at [n8n.io/cloud](https://n8n.io/cloud) (Free tier: 5,000 executions/month)
2. **Anthropic API Key** - Already configured in `.env.local` ✅
3. **Webhook URL** - Your Next.js deployment URL (localhost for testing)

---

## 🚀 Quick Setup (n8n Cloud)

### Step 1: Import Workflow

1. Login to n8n.io/cloud
2. Click **"Workflows"** → **"Add Workflow"** → **"Import from File"**
3. Upload: `n8n-workflow-hackernews-scraper.json`
4. Workflow will appear as **"HackerNews Course Trend Scraper"**

### Step 2: Configure Environment Variables

In n8n Cloud, go to **Settings** → **Environments** and add:

```bash
# Your Anthropic API Key (Claude Sonnet 4.5)
ANTHROPIC_API_KEY=sk-ant-api03-...

# Your Next.js webhook URL (production)
WEBHOOK_URL=https://your-domain.com

# Your webhook secret (same as in .env.local)
WEBHOOK_SECRET=coursehub_n8n_secure_key_2025_change_in_production
```

**For local testing:**
```bash
WEBHOOK_URL=http://localhost:3000
WEBHOOK_SECRET=coursehub_n8n_secure_key_2025_change_in_production
```

### Step 3: Configure Anthropic Credentials

1. In n8n workflow, click on **"AI Analysis (Claude)"** node
2. Click **"Credentials"** → **"Create New"**
3. Select **"Anthropic API"**
4. Enter your API key: `sk-ant-api03-...`
5. Save credentials

### Step 4: Activate Workflow

1. Toggle **"Active"** switch in top-right corner
2. Workflow will now run daily at 06:00 CET
3. Manual test: Click **"Execute Workflow"** button

---

## 🧪 Testing the Workflow

### Option 1: Test in n8n

1. Open workflow in n8n
2. Click **"Execute Workflow"** button (top-right)
3. Watch each node execute (green = success, red = error)
4. Check output in **"Send to Next.js Webhook"** node

### Option 2: Test Webhook Locally

Start Next.js dev server:
```bash
cd frontend
npm run dev
```

Send test request with curl:
```bash
curl -X POST http://localhost:3000/api/webhooks/n8n-trend \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer coursehub_n8n_secure_key_2025_change_in_production" \
  -d '{
    "sourceId": "12345678",
    "sourceUrl": "https://example.com/article",
    "title": "New AI Framework Released",
    "score": 500,
    "author": "test_user",
    "time": 1735207200,
    "aiAnalysis": {
      "relevanceScore": 85,
      "suggestedCourseTitle": "Introduction to New AI Framework",
      "suggestedDescription": "Learn the basics of this cutting-edge AI framework",
      "keywords": ["AI", "Framework", "Machine Learning"],
      "estimatedDurationMinutes": 120,
      "estimatedGenerationCostUsd": 0.75
    }
  }'
```

Expected response:
```json
{
  "success": true,
  "message": "Trend proposal created successfully",
  "data": {
    "id": "uuid-here",
    "status": "PENDING"
  }
}
```

---

## 📊 Workflow Nodes Explained

### 1. Schedule Trigger (06:00 CET)
- **Type:** Cron trigger
- **Schedule:** `0 6 * * *` (daily at 06:00)
- **Timezone:** CET (Central European Time)

### 2. Fetch HackerNews Top Stories
- **Type:** HTTP Request
- **URL:** `https://hacker-news.firebaseio.com/v0/topstories.json`
- **Returns:** Array of story IDs (e.g., `[12345, 12346, ...]`)

### 3. Limit to Top 5
- **Type:** Set/Transform
- **Function:** Takes first 5 items from array
- **Why:** MVP scope - process only top 5 stories per day

### 4. Loop Over Stories
- **Type:** Split in Batches
- **Batch Size:** 1 (process one story at a time)
- **Why:** Sequential processing for API rate limiting

### 5. Fetch Story Details
- **Type:** HTTP Request
- **URL:** `https://hacker-news.firebaseio.com/v0/item/{{id}}.json`
- **Returns:** Story data (title, url, score, author, time)

### 6. AI Analysis (Claude)
- **Type:** HTTP Request (Anthropic API)
- **Model:** claude-sonnet-4-5-20250929
- **Temperature:** 0.3 (consistent output)
- **Prompt:** Analyzes if story is suitable for a tech course
- **Output:** JSON with relevance score, suggested title, description, etc.

### 7. Merge Data
- **Type:** Code (JavaScript)
- **Function:** Combines HackerNews data + AI analysis into single object
- **Handles:** JSON parsing from AI response

### 8. Filter: Relevance >= 40
- **Type:** IF condition
- **Filter:** Only pass stories with relevance score >= 40
- **Why:** Skip news/opinions, focus on educational content

### 9. Send to Next.js Webhook
- **Type:** HTTP Request (POST)
- **URL:** `{{WEBHOOK_URL}}/api/webhooks/n8n-trend`
- **Headers:** `Authorization: Bearer {{WEBHOOK_SECRET}}`
- **Body:** Complete trend data (HackerNews + AI analysis)

---

## 📈 Expected Results

**Daily Output:**
- 5 stories fetched from HackerNews
- ~2-4 stories pass relevance filter (score >= 40)
- 2-4 TrendProposals created in database (status: PENDING)

**Cost per run:**
- Claude API: ~$0.05-0.10 (5 stories × ~$0.01 each)
- n8n Cloud: Free (within 5,000 executions/month)

**Total monthly cost:** ~$3-5 for AI analysis

---

## 🔍 Monitoring & Debugging

### Check Executions in n8n

1. Go to **"Executions"** tab in n8n
2. View execution history (success/failed)
3. Click on execution to see detailed logs

### Check Database

Use Supabase MCP or Prisma Studio:

```bash
# Prisma Studio
cd frontend
npx prisma studio

# Query via Supabase MCP
SELECT * FROM trend_proposals
WHERE source = 'hackernews'
ORDER BY created_at DESC
LIMIT 10;
```

### Common Issues

**Issue:** Workflow not triggering
- **Fix:** Check "Active" toggle is ON
- **Fix:** Verify timezone is set to CET

**Issue:** 401 Unauthorized from webhook
- **Fix:** Check `N8N_WEBHOOK_SECRET` matches in both .env.local and n8n environment

**Issue:** AI analysis fails
- **Fix:** Verify Anthropic API key is valid
- **Fix:** Check API quota/billing

**Issue:** Duplicate stories
- **Fix:** Webhook endpoint checks `sourceId` for duplicates (returns 200 if exists)

---

## 📝 Phase 1 Constraints

**What's included:**
- ✅ HackerNews ONLY (no Reddit, GitHub, arXiv)
- ✅ Top 5 stories ONLY (not 10 or 20)
- ✅ Text analysis ONLY (no fancy metrics)
- ✅ Manual approval (admin dashboard needed)

**What comes later:**
- ❌ Auto-approval (Phase 3)
- ❌ Multiple sources (Phase 2)
- ❌ Advanced scoring (Phase 3)
- ❌ Real-time scraping (Phase 3)

---

## 🚢 Deployment Checklist

Before going live:

- [ ] n8n workflow imported and activated
- [ ] Environment variables configured (ANTHROPIC_API_KEY, WEBHOOK_URL, WEBHOOK_SECRET)
- [ ] Anthropic credentials added to n8n
- [ ] Webhook endpoint tested with curl
- [ ] Database TrendProposal table verified
- [ ] Schedule set to 06:00 CET
- [ ] First test execution successful
- [ ] Monitoring/alerts configured (optional)

---

## 📚 Next Steps

After n8n scraper is working:

1. **Day 3-4:** Build course generator (Claude API)
2. **Day 4-5:** Build admin approval UI (`/admin/proposals`)
3. **Day 5-6:** Test full flow (scrape → approve → generate)
4. **Day 7:** Launch with 5 generated courses

---

**Remember:** Ship → Learn → Iterate → Scale

This is MVP. We can improve based on real data!
