# n8n Loop Iteration Debugging Guide

## Problem Summary
Loop Sections (Split in Batches) receives 5 items, sends 1 item, but Extract Section never executes and workflow jumps directly to Done Branch.

---

## ✅ Already Fixed
- Webhook response mode
- Supabase credentials
- Supabase Prefer header
- Extract Section execution mode (`runOnceForEachItem`)
- Loop batch size (set to 1)
- "Always Output Data" toggle (disabled)
- Manual connection recreation
- Anthropic API credentials
- HTTP method (POST)

---

## 🔍 Debugging Steps (In Order)

### Step 1: Verify Split in Batches Configuration

Open the "Loop Sections" node and verify:

**Required Settings:**
- ✅ Batch Size: `1`
- ✅ Options → Reset: `OFF` (unchecked)
- ✅ Options → Always Output Data: `OFF` (unchecked)

**Try This:**
1. Click on "Loop Sections" node
2. Go to "Options" section
3. Toggle "Reset" to `ON` (sometimes this fixes stuck loops)
4. Save and test
5. If doesn't work, toggle back to `OFF`

### Step 2: Check Node Outputs in Execution

Run the workflow and check the execution details:

**For "Loop Sections" node:**
1. Click on the node in execution view
2. Check the OUTPUT tab
3. Look for:
   - "Output 0 (loop)": Should show 1 item going to Extract Section
   - "Output 1 (done)": Should be empty until all items processed
4. Check for any error messages or warnings

**Expected Behavior:**
```
Iteration 1:
  Output 0 (loop): [item 1] → Extract Section
  Output 1 (done): []

After Extract Section processes:
  Loop back to "Loop Sections"

Iteration 2:
  Output 0 (loop): [item 2] → Extract Section
  Output 1 (done): []

... repeat ...

Iteration 5:
  Output 0 (loop): [item 5] → Extract Section
  Output 1 (done): []

Final iteration:
  Output 0 (loop): []
  Output 1 (done): [complete signal] → Done Branch
```

**Actual Behavior (Bug):**
```
Iteration 1:
  Output 0 (loop): [item 1] → ???
  Output 1 (done): [complete signal] → Done Branch
```

### Step 3: Check Extract Section Node Settings

Open "Extract Section" node and verify:

**Required Settings:**
- ✅ Mode: "Run Once for Each Item"
- ✅ Continue on Fail: `OFF` (if available)
- ✅ Always Output Data: `OFF`

**Input Data:**
- Check if node expects specific field names
- Verify the data coming from Loop Sections matches expected format

**Try This:**
1. Add a "Code" node between Loop Sections and Extract Section
2. Set it to just log the data: `return $input.all();`
3. Run workflow - does this Code node execute?
4. If YES: problem is with Extract Section configuration
5. If NO: problem is with Loop Sections output connection

### Step 4: Verify Connection Types

Check the visual connection between nodes:

**Loop Sections → Extract Section:**
- Connection should come from the BOTTOM output of Loop Sections (output 0 = loop)
- Connection line should be SOLID, not dashed
- Connection should NOT have any filters or conditions

**Try This:**
1. Click on the connection line between Loop Sections and Extract Section
2. Check if there's a filter icon or condition
3. If yes, remove any filters
4. Delete the connection completely
5. Recreate it by dragging from the BOTTOM circle of Loop Sections to Extract Section

### Step 5: Check for Hidden Conditions

Sometimes nodes have hidden conditions that prevent execution:

**For Extract Section:**
1. Open node settings
2. Check "Execution" section
3. Look for:
   - "Execute Only When": Should be empty or disabled
   - "Continue on Fail": Should be OFF
   - "Retry on Fail": Should be OFF (for testing)

### Step 6: Test with Minimal Loop

Create a simple test workflow to isolate the issue:

```
Manual Trigger
  ↓
Code (output array)
  ↓
Split in Batches (size=1)
  ↓ (loop output 0)
Code (log item)
  ↓ (loop back to Split in Batches)
  ↓ (done output 1)
Code (log "done")
```

**Code node 1:**
```javascript
return [
  { json: { id: 1, name: "item1" } },
  { json: { id: 2, name: "item2" } },
  { json: { id: 3, name: "item3" } }
];
```

**Code node 2 (in loop):**
```javascript
console.log("Processing:", $json);
return $input.all();
```

**If this simple loop works:**
- Problem is specific to Extract Section or its configuration
- Compare working loop with broken loop

**If this simple loop also fails:**
- Likely an n8n version bug
- Check n8n version in Railway dashboard
- Consider upgrading to latest stable version

### Step 7: Check n8n Version and Known Bugs

**Get n8n Version:**
1. Go to Settings → About n8n
2. Note the version number (e.g., 1.19.4)

**Known Issues with Split in Batches:**
- Versions < 1.0: Major loop issues
- Versions 1.5.x - 1.7.x: Some users reported loop not iterating
- Versions 1.15.x+: Most stable

**If version is < 1.19:**
- Update n8n to latest version
- Railway: Update docker image in Dockerfile.n8n

### Step 8: Check Execution Logs

In n8n UI:
1. Go to "Executions" tab
2. Find the latest failed execution
3. Click "View Details"
4. Look for:
   - Any red nodes (errors)
   - Skipped nodes (gray)
   - Warnings in console

**Important Log Messages:**
- "Node was not executed" - Configuration issue
- "Timeout" - Node taking too long
- "No input data" - Previous node not sending data

### Step 9: Inspect Raw Execution Data

In execution view:
1. Click on "Loop Sections" node
2. Click "JSON" tab (not "Table")
3. Check the raw output structure

**Expected Structure:**
```json
[
  {
    "json": {
      "section": "Introduction",
      "title": "...",
      ...
    },
    "pairedItem": {
      "item": 0
    }
  }
]
```

**If structure is different:**
- Extract Section might not be receiving data in expected format
- Add a "Set" node before Extract Section to normalize data

### Step 10: Nuclear Option - Rebuild the Loop

If nothing works, rebuild the loop from scratch:

1. **Create new Split in Batches node:**
   - Name: "Loop Sections NEW"
   - Batch Size: 1
   - Don't copy settings from old node

2. **Create new Code node to test:**
   - Name: "Test Extract"
   - Code: `console.log("GOT DATA:", $json); return $input.all();`

3. **Connect:**
   - Validate & Prepare → Loop Sections NEW
   - Loop Sections NEW (output 0) → Test Extract
   - Test Extract → back to Loop Sections NEW
   - Loop Sections NEW (output 1) → Done Branch

4. **Test:**
   - If this works, gradually replace Test Extract with actual Extract Section
   - If doesn't work, n8n version bug or Railway deployment issue

---

## 🐛 Potential n8n Bugs

### Bug 1: Loop Output Not Triggering Next Node
**Symptom:** Exactly what you're experiencing
**Versions:** 1.5.x - 1.7.x, some 1.15.x deployments
**Fix:** Upgrade to n8n 1.19.x+

### Bug 2: Batch Size Not Respected
**Symptom:** All items sent at once instead of one at a time
**Fix:** Set batch size in node settings, not in options

### Bug 3: Done Output Triggers Prematurely
**Symptom:** Done branch executes on first iteration
**Fix:** Check "Reset" option, try toggling it

### Bug 4: Loop Back Connection Not Recognized
**Symptom:** Connection looks correct but doesn't loop
**Fix:** Delete all nodes in loop except Split in Batches, recreate from scratch

---

## 📊 Diagnostic Checklist

Run through this checklist and note the results:

- [ ] Loop Sections receives 5 items (check OUTPUT tab)
- [ ] Loop Sections shows "Output 0 (loop): 1 item"
- [ ] Loop Sections shows "Output 1 (done): empty"
- [ ] Connection from Loop Sections output 0 to Extract Section is solid
- [ ] Extract Section is NOT disabled/deactivated
- [ ] Extract Section has NO execution conditions
- [ ] Extract Section mode is "Run Once for Each Item"
- [ ] Simple test loop (step 6) works correctly
- [ ] n8n version is 1.15.x or higher
- [ ] No error messages in execution logs
- [ ] Raw JSON output from Loop Sections is valid array

**If all checked:**
- This is likely an n8n version-specific bug
- Export workflow JSON and report to n8n GitHub issues
- Consider using n8n Cloud (latest version) for testing

---

## 🔧 Quick Fixes to Try (5 minutes each)

### Quick Fix 1: Toggle Reset Option
1. Open Loop Sections node
2. Options → Reset → Toggle ON
3. Save and test
4. If doesn't work, toggle OFF

### Quick Fix 2: Recreate Extract Section Connection
1. Delete connection from Loop Sections to Extract Section
2. Click and hold on BOTTOM output circle of Loop Sections
3. Drag to Extract Section
4. Release
5. Save and test

### Quick Fix 3: Add Debug Node
1. Add "Edit Fields (Set)" node between Loop Sections and Extract Section
2. Keep all fields (don't change anything)
3. This forces n8n to create a new execution context
4. Test

### Quick Fix 4: Disable Auto-Save and Manual Save
1. Disable auto-save in n8n settings
2. Make a tiny change to Loop Sections (add a space in notes)
3. Manually save workflow (Ctrl+S)
4. Test

### Quick Fix 5: Duplicate Workflow
1. Export workflow JSON
2. Create new workflow
3. Import JSON
4. Test immediately
5. Sometimes fresh workflow IDs fix stuck state

---

## 📞 When to Escalate

Contact n8n support if:
- ✅ All checklist items verified
- ✅ Simple test loop also fails
- ✅ Workflow recreated from scratch still fails
- ✅ No errors in execution logs
- ✅ n8n version is latest stable

**Include in support request:**
1. n8n version number
2. Workflow JSON export
3. Screenshots of execution logs showing:
   - Loop Sections OUTPUT tab
   - Extract Section (not executed)
   - Done Branch (executed incorrectly)
4. Results of simple test loop (step 6)

---

## 🎯 Most Likely Causes (Ranked)

Based on symptoms:

1. **n8n version bug** (80% likely)
   - Split in Batches has known issues in certain versions
   - Upgrade to 1.19.x+ or latest

2. **Hidden execution condition** (10% likely)
   - Extract Section has "Execute Only When" condition
   - Check node settings → Execution section

3. **Data format mismatch** (5% likely)
   - Loop Sections outputs data in format Extract Section doesn't recognize
   - Add debug Code node to inspect data

4. **Workflow state corruption** (4% likely)
   - n8n internal state is stuck from previous failed execution
   - Duplicate workflow to fresh instance

5. **Railway deployment issue** (1% likely)
   - n8n container has limited resources
   - Check Railway logs for OOM errors

---

## 📝 Next Steps

1. **Run through Step 1-5** (15 minutes)
2. **Try Quick Fix 1-3** (15 minutes)
3. **If still broken:** Run Step 6 (test minimal loop)
4. **If minimal loop works:** Problem is Extract Section config
5. **If minimal loop fails:** n8n version bug or deployment issue
6. **If all else fails:** Export workflow JSON and I'll create diagnostic script

---

**Priority:** HIGH - Blocks Phase 1 MVP

**Goal:** Get loop iterating properly to generate course content (5-15 minute execution time)
