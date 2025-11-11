#!/bin/bash

# Fix n8n Loop Configuration via API (using curl)
# This script uses curl instead of Node.js fetch to avoid DNS issues

set -e

N8N_HOST="https://n8n-production-30ce.up.railway.app"
N8N_API_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1NzgzYzZkNC0wN2VlLTQ4Y2YtYTQ0NS0xNjA5ZWNhMjMxOTEiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzYyNzc4MjIxLCJleHAiOjE3NzA1MjY4MDB9.33txPypsZvgEwpvKkcBnaSkGJHQErFBBJmfrHGI3mTw"
WORKFLOW_ID="FimIaNZ66cEz96GM"

echo "🚀 n8n Loop Fix Script (curl version)"
echo ""
echo "Workflow ID: $WORKFLOW_ID"
echo "n8n Host: $N8N_HOST"
echo ""
echo "────────────────────────────────────────────────────────────"
echo ""

# Step 1: Fetch current workflow
echo "📥 Fetching workflow from n8n API..."
WORKFLOW_JSON=$(curl -s -X GET "$N8N_HOST/api/v1/workflows/$WORKFLOW_ID" \
  -H "X-N8N-API-KEY: $N8N_API_KEY" \
  -H "Accept: application/json")

# Check if fetch was successful
if echo "$WORKFLOW_JSON" | jq -e '.id' > /dev/null 2>&1; then
  WORKFLOW_NAME=$(echo "$WORKFLOW_JSON" | jq -r '.name')
  NODE_COUNT=$(echo "$WORKFLOW_JSON" | jq '.nodes | length')
  echo "✅ Fetched workflow: $WORKFLOW_NAME"
  echo "   Total nodes: $NODE_COUNT"
else
  echo "❌ Failed to fetch workflow"
  echo "$WORKFLOW_JSON" | jq . 2>/dev/null || echo "$WORKFLOW_JSON"
  exit 1
fi

# Step 2: Save backup
BACKUP_FILE="scripts/workflow-backup-$(date +%s).json"
echo "$WORKFLOW_JSON" | jq . > "$BACKUP_FILE"
echo ""
echo "💾 Backup saved to: $BACKUP_FILE"

# Step 3: Analyze current loop configuration
echo ""
echo "🔍 Analyzing loop configuration..."
echo ""

# Find Loop Sections node
LOOP_NODE_NAME=$(echo "$WORKFLOW_JSON" | jq -r '.nodes[] | select(.type == "n8n-nodes-base.splitInBatches") | .name')

if [ -z "$LOOP_NODE_NAME" ]; then
  echo "❌ ERROR: Could not find Loop Sections node (splitInBatches)"
  exit 1
fi

echo "✅ Found Loop Node: $LOOP_NODE_NAME"

# Check batch size
BATCH_SIZE=$(echo "$WORKFLOW_JSON" | jq -r ".nodes[] | select(.name == \"$LOOP_NODE_NAME\") | .parameters.batchSize // 0")
echo "   Current batchSize: $BATCH_SIZE"

# Check connections
LOOP_OUTPUT_0=$(echo "$WORKFLOW_JSON" | jq -r ".connections[\"$LOOP_NODE_NAME\"].main[0][0].node // \"NOT_CONNECTED\"")
LOOP_OUTPUT_1=$(echo "$WORKFLOW_JSON" | jq -r ".connections[\"$LOOP_NODE_NAME\"].main[1][0].node // \"NOT_CONNECTED\"")

echo "   Output 0 (loop) → $LOOP_OUTPUT_0"
echo "   Output 1 (done) → $LOOP_OUTPUT_1"
echo ""

# Step 4: Fix the loop configuration using jq
echo "🔧 Fixing loop configuration..."
echo ""

FIXED_WORKFLOW=$(echo "$WORKFLOW_JSON" | jq '
  # Keep only essential fields for PUT request
  {
    name: .name,
    nodes: .nodes,
    connections: .connections,
    settings: .settings,
    staticData: .staticData
  } |

  # Set batchSize to 1
  .nodes |= map(
    if .type == "n8n-nodes-base.splitInBatches" then
      .parameters.batchSize = 1
    else
      .
    end
  ) |

  # Fix connections
  .connections["Loop Sections"].main[0] = [{
    "node": "Extract Section",
    "type": "main",
    "index": 0
  }] |
  .connections["Loop Sections"].main[1] = [{
    "node": "Assemble Complete Course",
    "type": "main",
    "index": 0
  }] |
  .connections["Merge Section Data"].main[0] = [{
    "node": "Loop Sections",
    "type": "main",
    "index": 0
  }]
')

# Verify fixes
NEW_BATCH_SIZE=$(echo "$FIXED_WORKFLOW" | jq -r '.nodes[] | select(.type == "n8n-nodes-base.splitInBatches") | .parameters.batchSize')
NEW_OUTPUT_0=$(echo "$FIXED_WORKFLOW" | jq -r '.connections["Loop Sections"].main[0][0].node')
NEW_OUTPUT_1=$(echo "$FIXED_WORKFLOW" | jq -r '.connections["Loop Sections"].main[1][0].node')
NEW_LOOP_BACK=$(echo "$FIXED_WORKFLOW" | jq -r '.connections["Merge Section Data"].main[0][0].node')

echo "✅ Loop configuration fixed:"
echo "   batchSize: $BATCH_SIZE → $NEW_BATCH_SIZE"
echo "   Output 0: $LOOP_OUTPUT_0 → $NEW_OUTPUT_0"
echo "   Output 1: $LOOP_OUTPUT_1 → $NEW_OUTPUT_1"
echo "   Loop back: Merge Section Data → $NEW_LOOP_BACK"
echo ""

# Step 5: Update workflow
echo "📤 Updating workflow via n8n API..."

UPDATE_RESPONSE=$(curl -s -w "\n%{http_code}" -X PUT "$N8N_HOST/api/v1/workflows/$WORKFLOW_ID" \
  -H "X-N8N-API-KEY: $N8N_API_KEY" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -d "$FIXED_WORKFLOW")

# Extract HTTP status code (last line)
HTTP_STATUS=$(echo "$UPDATE_RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$UPDATE_RESPONSE" | head -n-1)

if [ "$HTTP_STATUS" -eq 200 ]; then
  echo "✅ Workflow updated successfully!"
else
  echo "❌ Failed to update workflow (HTTP $HTTP_STATUS)"
  echo "$RESPONSE_BODY" | jq . 2>/dev/null || echo "$RESPONSE_BODY"
  exit 1
fi

echo ""
echo "────────────────────────────────────────────────────────────"
echo ""
echo "✅ SUCCESS! Loop configuration has been fixed."
echo ""
echo "Next steps:"
echo "1. Test the workflow:"
echo "   cd frontend && ./scripts/test-workflow.sh"
echo "2. Monitor execution in n8n UI:"
echo "   $N8N_HOST/workflow/$WORKFLOW_ID"
echo "3. Verify loop iterates 5 times (execution should take 5-15 minutes)"
echo ""
