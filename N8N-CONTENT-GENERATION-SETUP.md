# n8n Content Generation Workflow - Setup Guide

## 🎯 Oversigt

Denne guide forklarer hvordan du sætter det komplette n8n Content Generation Workflow op - fra admin approval til publiceret kursus med alt indhold.

**Hvad dette workflow gør:**
1. ✅ Admin godkender TrendProposal i admin dashboard
2. ✅ Backend genererer curriculum outline (section titler, beskrivelser)
3. ✅ n8n workflow trigger'es automatisk
4. ✅ For hver section:
   - Genererer detaljeret lesson content (500-1000 ord)
   - Genererer quiz (3-5 spørgsmål med forklaringer)
   - Merger alt sammen
5. ✅ Gemmer komplet kursus til database
6. ✅ Brugere kan nu lære fra CoursePlayer med alt indhold!

**Økonomi:**
- Cost per kursus: ~$0.67-1.02 (under $1.50 target) ✅
- Generation tid: 2-4 minutter (under 2 timer target) ✅

---

## 📋 Prerequisites

Før du starter, skal du have:

1. ✅ **n8n account** (n8n.io/cloud - free tier 5,000 executions/month)
2. ✅ **Anthropic API key** (for Claude Sonnet 4)
3. ✅ **Supabase project** (allerede sat op)
4. ✅ **Next.js deployment** (localhost eller production)

---

## 🚀 Step 1: Installer Dependencies

Tilføj syntax highlighting til frontend:

```bash
cd frontend
npm install react-syntax-highlighter
npm install --save-dev @types/react-syntax-highlighter
```

---

## 🔧 Step 2: Environment Variables

Tilføj følgende til `frontend/.env.local`:

```bash
# Existing variables (no changes)
DATABASE_URL="..."
NEXT_PUBLIC_SUPABASE_URL="..."
NEXT_PUBLIC_SUPABASE_ANON_KEY="..."
SUPABASE_SERVICE_ROLE_KEY="..."
ANTHROPIC_API_KEY="..."

# NEW: n8n Content Generation Webhook
N8N_CONTENT_GENERATION_WEBHOOK_URL="https://YOUR_N8N_INSTANCE.app.n8n.cloud/webhook/generate-content"

# NEW: Site URL (for server-side API calls)
NEXT_PUBLIC_SITE_URL="http://localhost:3000"  # Production: https://your-domain.com
```

---

## 📤 Step 3: Import n8n Workflow

### 3.1 Login to n8n Cloud

1. Go to [n8n.io/cloud](https://n8n.io/cloud)
2. Login or create free account

### 3.2 Import Workflow

1. Click **"Workflows"** → **"Add Workflow"** → **"Import from File"**
2. Upload: `/n8n-workflow-content-generation.json`
3. Workflow navn: **"CourseHub - Content Generation Pipeline"**

### 3.3 Configure Credentials

#### A) Supabase HTTP Header Auth

1. Click **Settings** → **Credentials** → **Create New**
2. Type: **HTTP Header Auth**
3. Name: `Supabase Auth`
4. Header Name: `apikey`
5. Header Value: Your `SUPABASE_SERVICE_ROLE_KEY`
6. Save

#### B) Anthropic API

1. Click **Settings** → **Credentials** → **Create New**
2. Type: **Anthropic API**
3. Name: `Anthropic API`
4. API Key: Your `ANTHROPIC_API_KEY` (sk-ant-api03-...)
5. Save

### 3.4 Configure Environment Variables (n8n)

1. Go to **Settings** → **Environments**
2. Add:

```bash
SUPABASE_URL=https://your-project.supabase.co
```

### 3.5 Get Webhook URL

1. Open **"Webhook Trigger"** node
2. Copy **"Production URL"** (looks like: `https://xxx.app.n8n.cloud/webhook/generate-content`)
3. Add this URL to your `.env.local` as `N8N_CONTENT_GENERATION_WEBHOOK_URL`

### 3.6 Activate Workflow

1. Toggle **"Active"** switch (top-right)
2. Workflow is now ready to receive webhooks!

---

## 🧪 Step 4: Test Complete Flow

### Test 1: Admin Approval → Content Generation

1. **Start Next.js dev server:**
   ```bash
   cd frontend
   npm run dev
   ```

2. **Login as SUPER_ADMIN:**
   - Go to http://localhost:3000/login
   - Login with your admin account

3. **Go to Admin Proposals:**
   - Navigate to http://localhost:3000/admin/proposals
   - Find a PENDING proposal (if none exist, trigger HackerNews scraper first)

4. **Approve Proposal:**
   - Click **"Godkend"** (Approve) button
   - Watch console logs:
     ```
     [admin/approve] Approved proposal: uuid
     [admin/approve] Triggering curriculum generation...
     [course-generator] Starting generation for: <title>
     [course-generator] ✅ Curriculum generated
     [course-generator] ✅ Course saved: 123
     [admin/approve] ✅ Curriculum generated, courseId: 123
     [admin/approve] Triggering content generation workflow...
     [n8n-generate-content] Triggering content generation for course 123
     [admin/approve] ✅ Content generation workflow triggered
     ```

5. **Monitor n8n Workflow:**
   - Go to n8n → **"Executions"** tab
   - You should see a new execution running
   - Watch nodes turn green as they complete
   - **Expected duration:** 2-4 minutes for 5 sections

6. **Verify Database:**
   - Use Supabase MCP or Prisma Studio:
     ```bash
     npx prisma studio
     ```
   - Find the Course record (id=123)
   - Check `curriculumJson` field:
     ```json
     {
       "courseTitle": "...",
       "sections": [
         {
           "sectionNumber": 1,
           "title": "...",
           "content": {
             "introduction": "100-200 ord...",
             "blocks": [...],
             "summary": "...",
             "keyTakeaways": [...]
           },
           "quiz": {
             "questions": [...]
           }
         }
       ]
     }
     ```
   - **VERIFY:** Each section has `content`, `quiz`, and optionally `codeExamples`

7. **Test Course Player:**
   - Go to http://localhost:3000/courses/123
   - Click **"Start kursus →"**
   - You should see:
     ✅ Section navigation (left sidebar)
     ✅ Rich text content (paragraphs, headings, lists, callouts)
     ✅ Code examples with syntax highlighting
     ✅ Interactive quiz at end of section
     ✅ Progress tracking

---

## 📊 Monitoring & Debugging

### Check n8n Execution Logs

1. Go to n8n → **"Executions"**
2. Click on execution to see details
3. Check each node output:
   - **Fetch Proposal**: Should return proposal data
   - **Fetch Course**: Should return course with curriculum
   - **Loop Sections**: Processes each section
   - **Generate Section Content**: Claude API response with content
   - **Generate Section Quiz**: Claude API response with quiz
   - **Save to Database**: Database update confirmation

### Check API Logs

**Backend logs (Next.js):**
```bash
# Terminal where npm run dev is running
# Look for:
[admin/approve] logs
[course-generator] logs
[n8n-generate-content] logs
```

### Common Issues & Fixes

#### Issue 1: "n8n webhook URL not configured"

**Error:**
```
[n8n-generate-content] Server configuration error: n8n webhook URL not configured
```

**Fix:**
```bash
# Add to .env.local:
N8N_CONTENT_GENERATION_WEBHOOK_URL="https://your-n8n-instance.app.n8n.cloud/webhook/generate-content"

# Restart dev server:
npm run dev
```

---

#### Issue 2: "Course must have curriculum generated first"

**Error in n8n:**
```
Error: Course must have curriculum generated first
```

**Fix:**
This means the admin approval flow didn't generate curriculum first. Check:
1. `/api/admin/generate-course/[proposalId]` succeeded
2. Course record exists in database
3. Course has `curriculumJson` with `sections` array

**Manual fix:**
```bash
# Re-run curriculum generation:
curl -X POST http://localhost:3000/api/admin/generate-course/<proposalId>
```

---

#### Issue 3: n8n Workflow Not Triggering

**Symptoms:**
- Admin approval succeeds
- But no execution appears in n8n

**Debug steps:**
1. Check n8n workflow is **Active** (toggle in top-right)
2. Verify `N8N_CONTENT_GENERATION_WEBHOOK_URL` is correct
3. Test webhook manually:
   ```bash
   curl -X POST "https://your-n8n-instance.app.n8n.cloud/webhook/generate-content" \
     -H "Content-Type: application/json" \
     -d '{
       "proposalId": "test-uuid",
       "courseId": 999
     }'
   ```
4. Check n8n webhook logs (Settings → Logs)

---

#### Issue 4: "Failed to parse JSON from response"

**Error in n8n Merge Section Data:**
```
Error: Could not extract JSON from response
```

**Cause:**
Claude API sometimes wraps JSON in markdown code blocks:
```markdown
```json
{ "introduction": "..." }
```
```

**Fix:**
Already handled in workflow! Check **Merge Section Data** node (line 127-145 in workflow):
- Tries direct JSON.parse first
- Falls back to extracting from markdown code blocks
- Handles both `json` and plain code blocks

If still failing, check Claude API response in **Generate Section Content** node output.

---

#### Issue 5: Workflow Execution Timeout

**Symptoms:**
- n8n execution stops mid-way
- Some sections generated, some missing

**Cause:**
n8n free tier has 5-minute execution timeout per workflow.

**Fix (short-term):**
- Reduce number of sections (curriculum generation prompt)
- Run workflow manually for failed executions

**Fix (long-term):**
- Upgrade to n8n paid tier (10-60 min timeout)
- OR: Split into smaller workflows (1 workflow per section)

---

#### Issue 6: High API Costs

**Symptoms:**
- Costs exceed $1.00 per course

**Debug:**
Check actual usage in **Assemble Complete Course** node:
```javascript
totalGenerationCost: 1.23  // Should be < 1.00
```

**Optimize:**
1. Reduce `max_tokens` in Claude API calls:
   - Content: 4000 → 3000 tokens
   - Quiz: 2000 → 1500 tokens
2. Reduce content length in prompts:
   - "500-800 ord" → "400-600 ord"
3. Skip code examples for non-technical courses

---

## 📈 Success Metrics

After successful setup, verify:

- ✅ **Workflow executes:** n8n execution completes without errors
- ✅ **Database updated:** Course.curriculumJson has complete sections with content + quiz
- ✅ **Cost target met:** <$1.00 per course (check metadata.generationCostUsd)
- ✅ **Time target met:** <5 minutes generation time (check metadata.generationTimeSeconds)
- ✅ **CoursePlayer works:** Users can navigate sections, see content, complete quiz
- ✅ **Progress tracking:** User progress saves correctly

---

## 🎓 Phase 1 MVP Checklist

Before launching to beta users:

### Backend
- [ ] n8n content generation workflow active and tested
- [ ] Webhook endpoint `/api/webhooks/n8n-generate-content` deployed
- [ ] Admin approval flow triggers both curriculum + content generation
- [ ] Database saves complete curriculum correctly
- [ ] Environment variables configured (production)

### Frontend
- [ ] CoursePlayer displays all content types (paragraphs, headings, lists, callouts)
- [ ] Code syntax highlighting works
- [ ] Quiz interface functional (select answers, submit, see results)
- [ ] Progress tracking saves to database
- [ ] Mobile responsive (test on phone)

### Content Quality
- [ ] Generate 3 test courses on different topics
- [ ] Verify content quality (readable, educational, accurate)
- [ ] Verify quiz questions test understanding (not just facts)
- [ ] Verify code examples work (if applicable)

### Performance
- [ ] Average generation time: <5 min ✅
- [ ] Average cost: <$1.00 ✅
- [ ] Course player loads fast (<2 sec)
- [ ] No browser console errors

---

## 🚢 Deployment (Production)

### 1. Deploy Next.js to Vercel/Railway

```bash
# Set environment variables in Vercel dashboard:
DATABASE_URL="..."
NEXT_PUBLIC_SUPABASE_URL="..."
SUPABASE_SERVICE_ROLE_KEY="..."
ANTHROPIC_API_KEY="..."
N8N_CONTENT_GENERATION_WEBHOOK_URL="https://your-n8n.app.n8n.cloud/webhook/generate-content"
NEXT_PUBLIC_SITE_URL="https://your-domain.com"
```

### 2. Update n8n Webhook Environment

In n8n Settings → Environments, update:
```bash
# Point to production instead of localhost
SUPABASE_URL=https://your-project.supabase.co
```

### 3. Test Production Flow

1. Login to production admin dashboard
2. Approve a test proposal
3. Verify workflow executes correctly
4. Verify course appears with full content
5. Test as end user (signup, access course, complete quiz)

---

## 💡 Future Optimizations (Phase 2+)

### Parallel Section Generation
**Current:** Sequential (section 1 → section 2 → section 3)
**Optimized:** Parallel (all sections at once)
**Time saved:** 2-3 minutes per course

**Implementation:**
- Use n8n **"Split In Batches"** with `batchSize: 5`
- Run all sections concurrently
- Requires n8n paid tier for higher execution timeout

### Smart Content Length
**Current:** Fixed 500-800 words per section
**Optimized:** Dynamic based on complexity

**Implementation:**
```javascript
// In curriculum generation prompt:
estimatedMinutes: 20  // → 600-800 words
estimatedMinutes: 10  // → 400-500 words
estimatedMinutes: 5   // → 200-300 words
```

### A/B Testing Content Formats
**Test different approaches:**
- Variant A: Text-heavy (current)
- Variant B: More callouts, less paragraphs
- Variant C: More code examples, less theory

**Measure:** Completion rate, quiz scores, user feedback

---

## 📚 Files Created/Modified

### New Files:
1. `/N8N-CONTENT-GENERATION-DESIGN.md` - Design documentation
2. `/n8n-workflow-content-generation.json` - n8n workflow
3. `/frontend/src/pages/api/webhooks/n8n-generate-content.ts` - Webhook endpoint
4. `/frontend/src/components/course/CoursePlayer.tsx` - Course player component
5. `/frontend/src/pages/courses/[id]/learn.tsx` - Learning page

### Modified Files:
1. `/frontend/src/pages/api/admin/proposals/[id]/approve.ts` - Added auto-trigger flow
2. `/frontend/src/pages/courses/[id].tsx` - Added "Start kursus" link

### Configuration:
1. `frontend/.env.local` - Added N8N_CONTENT_GENERATION_WEBHOOK_URL
2. `frontend/package.json` - Added react-syntax-highlighter

---

## 🎯 Next Steps

1. **Install dependencies:** `npm install react-syntax-highlighter`
2. **Import n8n workflow:** Follow Step 3 above
3. **Configure environment:** Add N8N_CONTENT_GENERATION_WEBHOOK_URL
4. **Test flow:** Follow Step 4 test guide
5. **Generate 3-5 courses:** Test with different topics
6. **Invite beta users:** Get feedback on content quality
7. **Iterate:** Improve prompts based on feedback

---

**Status:** Implementation Complete ✅

**Ready for:** Testing and beta launch

**Phase 1 MVP:** Ship when 5 courses generated with good content quality
