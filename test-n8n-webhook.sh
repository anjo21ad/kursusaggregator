#!/bin/bash

# Test n8n Content Generation Webhook
# Usage: ./test-n8n-webhook.sh

echo "🚀 Testing n8n Content Generation Workflow..."
echo ""

# Webhook URL from your n8n instance
WEBHOOK_URL="https://n8n-production-30ce.up.railway.app/webhook/generate-content"

# Test payload with your existing proposal
PAYLOAD='{
  "proposalId": "c3b74454-50a4-40d1-aa61-b66c4dea5043",
  "courseId": 1
}'

echo "📤 Sending request to: $WEBHOOK_URL"
echo "📝 Payload: $PAYLOAD"
echo ""
echo "⏱️  Expected execution time: 5-15 minutes (if loop works)"
echo "⏱️  Bug execution time: ~3 seconds (if loop still broken)"
echo ""

# Send request and capture response
response=$(curl -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d "$PAYLOAD" \
  -w "\n\nHTTP Status: %{http_code}\nTime: %{time_total}s" \
  -s)

echo "📥 Response:"
echo "$response"
echo ""
echo "✅ Request sent! Check n8n Executions tab for results."
