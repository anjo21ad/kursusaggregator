# 🔧 Fix n8n Loop Iteration Problem

## Problem
Loop Sections node (Split in Batches) går direkte til "Done Branch" uden at iterere gennem de 5 sections.

## Årsag
**Split in Batches** nodes i n8n har 2 outputs der SKAL konfigureres korrekt:

```
Loop Sections Node
├─ Output 0: Loop Iteration (kører for hver batch)
└─ Output 1: Done (kører når alle batches er færdige)
```

**Kritisk:** Loop output SKAL forbindes tilbage til sig selv for at kunne iterere!

---

## ✅ Korrekt Loop Setup

### Visual Diagram
```
Validate & Prepare (outputs 5 items)
         │
         ▼
┌─────────────────────┐
│   Loop Sections     │ ◄────────┐
│  (Split in Batches) │          │
└──┬──────────────┬───┘          │
   │ (0)          │ (1)           │
   │ Loop         │ Done          │
   │              │               │
   ▼              ▼               │
Extract        Assemble           │
Section        Complete           │
   │           Course             │
   ▼                              │
Generate                          │
Content                           │
   │                              │
   ▼                              │
Generate                          │
Quiz                              │
   │                              │
   ▼                              │
Merge                             │
Responses                         │
   │                              │
   ▼                              │
Merge Section ───────────────────┘
Data (loops back!)
```

---

## 🛠 Fix Steps i n8n UI

### 1. Login til n8n
```
URL: https://n8n-production-30ce.up.railway.app
Email: skjoldemosejohansen@gmail.com
Password: Anto0820!
```

### 2. Åbn Workflow
- Klik på **"Workflows"** i sidebar
- Find **"CourseHub - Content Generation Pipeline"**
- Klik på workflow for at åbne editor

### 3. Inspicer Loop Sections Node

Klik på **"Loop Sections"** node og check:

#### Parameters Tab
```json
{
  "batchSize": 1
}
```
✅ Dette skal være 1 (process én section ad gangen)

#### Connections
Klik på Loop Sections node og se på connection dots:

**Output dots (højre side):**
- **Øverste dot (output 0 - loop):** Skal forbinde til **Extract Section**
- **Nederste dot (output 1 - done):** Skal forbinde til **Assemble Complete Course**

**Input dots (venstre side):**
- **Øverste dot (input 0):** Skal modtage fra **Validate & Prepare** OG **Merge Section Data**

---

## 🔍 Diagnose Problemet

### Check 1: Er Output 0 Forbundet?
Klik på Loop Sections node og se på den **øverste output dot** (højre side).

❌ **Forkert:** Ingen forbindelse eller forbinder til forkert node
✅ **Korrekt:** Forbinder til **Extract Section**

### Check 2: Er Der en Loop Back Connection?
Følg path'en fra Loop Sections gennem alle nodes:
```
Loop Sections → Extract Section → Generate Content →
Generate Quiz → Merge Responses → Merge Section Data → ???
```

❌ **Forkert:** Merge Section Data forbinder ikke tilbage
✅ **Korrekt:** Merge Section Data → Loop Sections (input 0)

### Check 3: Er Output 1 Forbundet?
Klik på Loop Sections node og se på den **nederste output dot** (højre side).

❌ **Forkert:** Forbinder til Extract Section eller ingen forbindelse
✅ **Korrekt:** Forbinder til **Assemble Complete Course**

---

## ⚙️ Manual Fix

### Scenario A: Output 1 er forbundet til loop nodes (FORKERT)

**Problem:** Done output går til Extract Section i stedet for loop output.

**Fix:**
1. Klik på **Loop Sections** node
2. Hover over forbindelsen fra nederste output dot
3. Klik på **X** for at slette forbindelsen
4. Drag fra **nederste output dot** (output 1) til **Assemble Complete Course**
5. Drag fra **øverste output dot** (output 0) til **Extract Section**

### Scenario B: Ingen loop back connection (FORKERT)

**Problem:** Merge Section Data forbinder ikke tilbage til Loop Sections.

**Fix:**
1. Find den sidste node i din loop (sandsynligvis **Merge Section Data**)
2. Drag fra denne nodes **output dot** til **Loop Sections** input dot (venstre side)
3. Den vil automatisk forbinde til input 0

### Scenario C: Begge problemer

Udfør både Fix A og Fix B.

---

## 🧪 Test Løsningen

### 1. Manual Test Execution

**Prepare test data:**
```bash
# Course ID 1 har allerede curriculum med 5 sections
# Proposal ID: c3b74454-50a4-40d1-aa61-b66c4dea5043
```

**Trigger workflow:**
1. I n8n UI, klik **"Execute Workflow"** (test mode)
2. Workflow vil pause ved **Webhook Trigger**
3. Send test request:

```bash
curl -X POST https://n8n-production-30ce.up.railway.app/webhook/generate-content \
  -H "Content-Type: application/json" \
  -d '{
    "proposalId": "c3b74454-50a4-40d1-aa61-b66c4dea5043",
    "courseId": 1
  }'
```

### 2. Watch Execution

Du skal se:
- ✅ Webhook triggers
- ✅ Fetch Proposal (1 item)
- ✅ Fetch Course (1 item)
- ✅ Validate & Prepare (outputs 5 items)
- ✅ Loop Sections - **ITERATION 1** (processes item 1)
  - Extract Section (section 1)
  - Generate Section Content
  - Generate Section Quiz
  - Merge Responses
  - Merge Section Data
  - **← LOOPS BACK TO Loop Sections**
- ✅ Loop Sections - **ITERATION 2** (processes item 2)
  - ... repeat ...
- ✅ Loop Sections - **ITERATION 3, 4, 5**
- ✅ **After 5 iterations:** Output 1 (Done) triggers
- ✅ Assemble Complete Course
- ✅ Save to Database
- ✅ Update Proposal Status
- ✅ Respond to Webhook

**Expected execution time:** 5-15 minutter (pga. Claude API calls)

### 3. Check Execution Succeeded

#### I n8n UI:
- Alle nodes skal være **grønne** (success)
- Loop Sections skal vise "**Executed 5 times**"
- Assemble Complete Course skal have modtaget 5 sections

#### I Database:
```sql
-- Check at course har content
SELECT
  id,
  title,
  curriculum_json,
  LENGTH(transcript_url) as has_content
FROM "Course"
WHERE id = 1;

-- Check proposal status
SELECT
  id,
  status,
  actual_generation_cost_usd
FROM "TrendProposal"
WHERE id = 'c3b74454-50a4-40d1-aa61-b66c4dea5043';
```

Expected:
- ✅ `has_content > 0` (content er genereret)
- ✅ `status = 'PUBLISHED'`
- ✅ `actual_generation_cost_usd > 0`

---

## 🚨 Common Mistakes

### Mistake 1: Using "Loop Over Items" instead of "Split in Batches"
❌ **Loop Over Items** kan ikke loop tilbage til sig selv
✅ **Split in Batches** er den korrekte node type for loops

### Mistake 2: Connecting Done output to loop body
❌ Output 1 (Done) → Extract Section (loop aldrig stopper)
✅ Output 1 (Done) → Assemble Complete Course

### Mistake 3: Not connecting loop back
❌ Merge Section Data → (intet) (loop kører kun én gang)
✅ Merge Section Data → Loop Sections input 0

### Mistake 4: Wrong batch size
❌ batchSize = 5 (processer alle på én gang, ingen loop)
✅ batchSize = 1 (process én section ad gangen)

---

## 📊 Debug Output

Hvis loop stadig ikke virker, check execution logs:

### What to look for:

```
✅ CORRECT LOG:
Validate & Prepare: Outputs 5 items
Loop Sections: Batch 1/5
Extract Section: Processing section 1
... (generates content) ...
Merge Section Data: Section 1 complete
Loop Sections: Batch 2/5
Extract Section: Processing section 2
... (repeat 5 times) ...
Loop Sections: All batches done → output 1
Assemble Complete Course: Received 5 sections
```

```
❌ INCORRECT LOG (no loop):
Validate & Prepare: Outputs 5 items
Loop Sections: Batch 1/5
Loop Sections: All batches done → output 1  ← JUMPS DIRECTLY TO DONE
Assemble Complete Course: Received 0 sections
```

---

## 🎯 Success Criteria

Loop er fixed når:
- ✅ Workflow tager 5-15 minutter (ikke 2 sekunder)
- ✅ Loop Sections node eksekverer 5 gange
- ✅ Extract Section og alle loop-nodes eksekverer
- ✅ Claude API calls laves (du kan se dem i Anthropic dashboard)
- ✅ Assemble Complete Course modtager 5 færdige sections
- ✅ Content gemmes til database

---

## 📞 Hvis Det Stadig Ikke Virker

1. **Tag screenshot** af workflow i n8n UI (vis alle connections)
2. **Export workflow** til JSON (Download → Export Workflow)
3. **Check execution log** (klik på failed execution og copy hele log)
4. Send disse 3 ting, så kan jeg diagnosticere videre

---

## 🚀 Næste Steps Efter Fix

Når loop virker:
1. Test at AI content generation faktisk genererer godt indhold
2. Verificer at cost tracking fungerer
3. Test error handling (hvad hvis Claude API fejler?)
4. Deploy til produktion

**Estimated tid til at fikse:** 10-30 minutter (hvis du følger denne guide)
