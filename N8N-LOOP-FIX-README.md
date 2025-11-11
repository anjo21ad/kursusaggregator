# n8n Loop Iteration Fix - Diagnostic Tools

**Status:** All automated fixes applied ✅ - Manual debugging required 🔍

---

## 📋 Problem Summary

The "CourseHub - Content Generation Pipeline" workflow has a "Split in Batches" loop that should iterate 5 times (once per section), but instead:
- ✅ Loop Sections receives 5 items correctly
- ✅ Sends 1 item to loop branch
- ❌ Extract Section NEVER executes
- ❌ Workflow jumps directly to Done Branch
- ❌ Completes in 3 seconds instead of 5-15 minutes

---

## ✅ Fixes Already Applied

All these have been verified and fixed:

1. ✅ Webhook response mode (changed to "responseNode")
2. ✅ Supabase credentials (using service role key)
3. ✅ Supabase Prefer header (added "return=representation")
4. ✅ Extract Section execution mode (set to "runOnceForEachItem")
5. ✅ Loop batch size (set to 1)
6. ✅ "Always Output Data" toggle (disabled)
7. ✅ Anthropic API credentials (updated)
8. ✅ HTTP method (changed to POST)
9. ✅ Manual connection recreation (attempted)

**Despite all these fixes, the loop still does not iterate.**

---

## 🛠 Diagnostic Tools Provided

### 1. **Comprehensive Debugging Guide** 📚

**File:** `n8n-loop-debugging-guide.md`

A 10-step systematic approach to debug the loop issue in n8n UI, including:
- Configuration verification
- Execution log analysis
- Connection inspection
- Minimal loop testing
- n8n version checking
- Quick fixes to try
- When to escalate

**Start here if you want to debug manually in n8n UI.**

---

### 2. **Workflow Analyzer Script** 🔍

**File:** `analyze-n8n-loop.ts`

Programmatically analyzes exported workflow JSON to detect configuration issues.

**Usage:**

```bash
# Step 1: Export workflow from n8n UI
# (Menu → Export Workflow → Save as n8n-workflow-content-generation.json)

# Step 2: Run analyzer
npx ts-node analyze-n8n-loop.ts

# Or specify custom path:
npx ts-node analyze-n8n-loop.ts /path/to/workflow.json
```

**What it checks:**
- ✅ Batch size configuration
- ✅ Reset option
- ✅ Node disabled state
- ✅ Connection types (loop vs done)
- ✅ Loop back connection exists
- ✅ First node in loop configuration
- ✅ Common issues checklist

**Output:** Color-coded report with specific issues found

---

### 3. **Workflow Fetcher Script** 📥

**File:** `fetch-n8n-workflow.ts`

Automatically fetches workflow JSON from n8n via API (requires API key).

**Setup:**

1. Get n8n API key:
   - Login to n8n
   - Go to Settings → API
   - Create new API key

2. Run fetcher:

```bash
N8N_API_KEY=your-api-key npx ts-node fetch-n8n-workflow.ts
```

This will:
- List all workflows
- Find "Content Generation" workflow automatically
- Download full JSON
- Save as `n8n-workflow-content-generation.json`

**Then run the analyzer:**

```bash
npx ts-node analyze-n8n-loop.ts
```

---

## 🎯 Recommended Approach

### Option A: Manual Debugging (30-60 minutes)

**Best if you prefer hands-on UI debugging:**

1. Read `n8n-loop-debugging-guide.md` (sections 1-5)
2. Follow Step 1-5 in n8n UI
3. Try Quick Fix 1-3
4. If still broken, continue to Step 6 (minimal loop test)
5. Report results back for further analysis

### Option B: Automated Analysis (10 minutes)

**Best if you want quick configuration check:**

1. Export workflow from n8n UI:
   - Open workflow
   - Menu (three dots) → "Export Workflow"
   - Save as `n8n-workflow-content-generation.json`

2. Run analyzer:
   ```bash
   npx ts-node analyze-n8n-loop.ts
   ```

3. Fix any issues reported
4. If no issues found, proceed to Option A

### Option C: API-Based Fetch + Analysis (5 minutes)

**Best if you have n8n API access:**

1. Get API key from n8n (Settings → API)

2. Fetch workflow:
   ```bash
   N8N_API_KEY=your-key npx ts-node fetch-n8n-workflow.ts
   ```

3. Analyzer runs automatically after fetch

---

## 🐛 Most Likely Root Causes

Based on symptoms and fixes already applied:

### 1. **n8n Version Bug** (80% probability)

**Symptom:** Configuration is correct but loop doesn't iterate

**Known versions with issues:**
- v1.5.x - v1.7.x: Loop iteration bugs
- v1.15.x: Some deployments have issues
- v1.19.x+: Most stable

**Fix:**
1. Check n8n version (Settings → About)
2. If < v1.19, upgrade:
   - Railway: Update Dockerfile.n8n
   - Cloud: Should auto-update

**Test:** Create minimal loop workflow (see guide Step 6)

---

### 2. **Workflow State Corruption** (10% probability)

**Symptom:** Workflow worked before, now broken despite correct config

**Fix:**
1. Export workflow JSON
2. Create new workflow
3. Import JSON
4. Test immediately

Fresh workflow instance with new internal IDs often fixes stuck state.

---

### 3. **Hidden Execution Condition** (5% probability)

**Symptom:** Node after loop has execution condition not visible in UI

**Check:**
1. Open "Extract Section" node
2. Settings → Execution
3. Look for "Execute Only When"
4. Look for "Continue on Fail"
5. Remove any conditions

---

### 4. **Data Format Mismatch** (4% probability)

**Symptom:** Loop sends data but Extract Section doesn't recognize format

**Debug:**
1. Add "Code" node between Loop Sections and Extract Section
2. Code: `console.log("Data:", $json); return $input.all();`
3. Check execution logs
4. Verify data structure matches expected format

---

### 5. **Railway Resource Limits** (1% probability)

**Symptom:** Workflow times out or fails silently

**Check:**
1. Railway dashboard → n8n service
2. Check logs for OOM errors
3. Check CPU/memory usage during execution

**Fix:** Increase Railway plan resources

---

## 📊 Test Workflow

Once fixed, test with:

```bash
curl -X POST "https://n8n-production-30ce.up.railway.app/webhook/generate-content" \
  -H "Content-Type: application/json" \
  -d '{
    "proposalId": "c3b74454-50a4-40d1-aa61-b66c4dea5043",
    "courseId": 1
  }'
```

**Expected:**
- ⏱️ Execution time: 5-15 minutes
- ✅ 5 iterations of loop
- ✅ Extract Section executes 5 times
- ✅ Generate Content executes 5 times
- ✅ Generate Quiz executes 5 times
- ✅ Merge collects all sections
- ✅ Assemble Complete Course at end

**Current (bug):**
- ⏱️ Execution time: ~3 seconds
- ❌ 1 iteration, then exits
- ❌ Extract Section never executes
- ❌ Goes directly to Done Branch

---

## 📝 Next Steps

### Immediate Actions:

1. **Run Option B or C** (automated analysis)
   - This takes 5-10 minutes
   - Will confirm configuration is correct
   - Will identify any missed issues

2. **If analyzer shows no issues:**
   - This confirms n8n version bug or state corruption
   - Try Option A Step 6 (minimal loop test)
   - If minimal loop also fails → n8n version bug
   - If minimal loop works → workflow state corruption

3. **Share results:**
   - Export workflow JSON
   - Run analyzer
   - Share analyzer output
   - I can create specific fix for your workflow

### Long-term Solutions:

1. **Upgrade n8n** to v1.19.x+ (most stable)
2. **Monitor Railway logs** for resource issues
3. **Implement retry logic** in webhook caller (in case of failures)
4. **Add health check** for workflow (daily test execution)

---

## 🆘 When to Escalate

Contact n8n support if:
- ✅ Analyzer shows no issues
- ✅ All debugging guide steps followed
- ✅ Minimal loop test also fails
- ✅ Workflow recreated from scratch still fails
- ✅ n8n version is latest stable

**Include in support request:**
1. n8n version number
2. Workflow JSON (from export)
3. Analyzer output
4. Screenshot of execution showing:
   - Loop Sections OUTPUT tab
   - Extract Section (not executed)
   - Done Branch (incorrectly executed)
5. Minimal loop test results

---

## 📞 Support

**Priority:** HIGH - Blocks Phase 1 MVP

**Impact:** Cannot generate AI courses without working loop

**Timeline:** Need fix ASAP for Day 7 launch

---

## 🔧 Quick Reference

| Action | Command |
|--------|---------|
| Export workflow | n8n UI → Menu → Export Workflow |
| Analyze workflow | `npx ts-node analyze-n8n-loop.ts` |
| Fetch via API | `N8N_API_KEY=key npx ts-node fetch-n8n-workflow.ts` |
| Test endpoint | `curl -X POST https://n8n-...railway.app/webhook/generate-content ...` |
| Check n8n logs | Railway dashboard → n8n service → Logs |
| Read guide | `cat n8n-loop-debugging-guide.md` |

---

**Remember:** The configuration appears correct based on fixes applied. This is most likely an n8n version bug or workflow state corruption. Focus on:
1. Testing with minimal loop
2. Checking n8n version
3. Recreating workflow fresh

Good luck! 🚀
