#!/bin/bash

# Test n8n Content Generation Workflow
# Usage: ./scripts/test-workflow.sh

set -e

echo "🧪 Testing n8n Content Generation Workflow"
echo ""

# Configuration
N8N_URL="https://n8n-production-30ce.up.railway.app"
WEBHOOK_PATH="/webhook/generate-content"
PROPOSAL_ID="c3b74454-50a4-40d1-aa61-b66c4dea5043"
COURSE_ID="1"

echo "Configuration:"
echo "  n8n URL: $N8N_URL"
echo "  Webhook: $WEBHOOK_PATH"
echo "  Proposal ID: $PROPOSAL_ID"
echo "  Course ID: $COURSE_ID"
echo ""
echo "This will trigger the workflow to generate content for Course ID 1"
echo "(Building Production-Ready RAG Systems - already has curriculum)"
echo ""
echo "Expected execution time: 5-15 minutes"
echo ""
read -p "Press Enter to start test..."
echo ""

# Send webhook request
echo "📤 Sending webhook request..."
echo ""

RESPONSE=$(curl -X POST "${N8N_URL}${WEBHOOK_PATH}" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d "{
    \"proposalId\": \"${PROPOSAL_ID}\",
    \"courseId\": ${COURSE_ID}
  }" \
  -w "\n%{http_code}" \
  -s)

# Extract HTTP status code (last line)
HTTP_STATUS=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

echo "Response:"
echo "─────────────────────────────────────────"
echo "$BODY" | jq . 2>/dev/null || echo "$BODY"
echo "─────────────────────────────────────────"
echo "HTTP Status: $HTTP_STATUS"
echo ""

if [ "$HTTP_STATUS" -eq 200 ]; then
    echo "✅ Webhook triggered successfully!"
    echo ""
    echo "📊 Check workflow execution:"
    echo "  1. Open: ${N8N_URL}/workflow/FimIaNZ66cEz96GM"
    echo "  2. Click 'Executions' tab"
    echo "  3. Watch the execution in real-time"
    echo ""
    echo "Expected behavior:"
    echo "  ✓ Loop Sections should iterate 5 times"
    echo "  ✓ Each iteration generates content for 1 section"
    echo "  ✓ Total execution time: 5-15 minutes"
    echo "  ✓ All nodes should turn green (success)"
    echo ""
    echo "💾 Check database after execution:"
    echo "  SELECT title, curriculum_json, transcript_url"
    echo "  FROM \"Course\""
    echo "  WHERE id = 1;"
    echo ""
elif [ "$HTTP_STATUS" -eq 404 ]; then
    echo "❌ Webhook not found (404)"
    echo ""
    echo "Possible causes:"
    echo "  1. Workflow is not active in n8n"
    echo "  2. Webhook path is incorrect"
    echo "  3. Workflow was deleted or renamed"
    echo ""
    echo "Fix:"
    echo "  1. Open: ${N8N_URL}"
    echo "  2. Find 'CourseHub - Content Generation Pipeline'"
    echo "  3. Toggle 'Active' switch to ON"
    echo ""
elif [ "$HTTP_STATUS" -eq 500 ]; then
    echo "❌ Workflow execution failed (500)"
    echo ""
    echo "Check execution logs in n8n UI:"
    echo "  ${N8N_URL}/workflow/FimIaNZ66cEz96GM"
    echo ""
else
    echo "⚠️  Unexpected status code: $HTTP_STATUS"
    echo ""
    echo "Check n8n logs for details:"
    echo "  ${N8N_URL}/workflow/FimIaNZ66cEz96GM"
    echo ""
fi

echo "🔗 Useful links:"
echo "  n8n Dashboard: ${N8N_URL}"
echo "  Workflow Editor: ${N8N_URL}/workflow/FimIaNZ66cEz96GM"
echo "  Supabase Dashboard: https://supabase.com/dashboard/project/savhtvkgjtkiqnqytppy"
echo ""
