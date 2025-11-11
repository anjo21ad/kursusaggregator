# Gemini RAG API Setup Guide

## Step 1: Få Gemini API Key

1. **Gå til Google AI Studio:**
   - https://aistudio.google.com/app/apikey

2. **Opret ny API key:**
   - Klik "Get API Key" eller "Create API Key"
   - Vælg Google Cloud project (eller opret ny)
   - Kopier API key'en

3. **Gem API key:**
   ```bash
   # Tilføj til frontend/.env.local
   GEMINI_API_KEY=your-api-key-here
   ```

## Step 2: Test Gemini API

```bash
# Test basic Gemini API call
curl -X POST "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "contents": [{
      "parts": [{
        "text": "Explain how n8n Split in Batches node works"
      }]
    }]
  }'
```

## Step 3: Gemini RAG (Grounding with Google Search)

Gemini RAG kan bruges på 2 måder:

### Option A: Grounding with Google Search
```bash
curl -X POST "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "contents": [{
      "parts": [{
        "text": "What are the latest n8n features in 2024?"
      }]
    }],
    "tools": [{
      "googleSearchRetrieval": {}
    }]
  }'
```

### Option B: Custom RAG with Embeddings
```bash
# 1. Generate embeddings
curl -X POST "https://generativelanguage.googleapis.com/v1beta/models/embedding-001:embedContent?key=YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "models/embedding-001",
    "content": {
      "parts": [{
        "text": "n8n workflow debugging techniques"
      }]
    }
  }'

# 2. Store in vector database (Supabase pgvector)

# 3. Query with context
curl -X POST "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "contents": [{
      "parts": [{
        "text": "Context: [retrieved docs here]\n\nQuestion: How to fix n8n loop issues?"
      }]
    }]
  }'
```

## Step 4: Integration i N8N Agent

Agent kan bruge Gemini RAG til:
1. **Search n8n documentation** dynamisk
2. **Find lignende issues** på n8n community forum
3. **Get real-time n8n best practices**
4. **Cross-reference error messages** med kendte fixes

## Example: Gemini RAG for N8N Debugging

```typescript
// Agent kan kalde dette via Bash tool
const geminiRagQuery = `
curl -X POST "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "contents": [{
      "parts": [{
        "text": "Search for n8n Split in Batches loop iteration issues. Include: version-specific bugs, common misconfigurations, and working solutions from 2024."
      }]
    }],
    "tools": [{
      "googleSearchRetrieval": {}
    }]
  }'
`;
```

## Step 5: Add to Environment

```bash
# frontend/.env.local
GEMINI_API_KEY=your-gemini-api-key

# For agent usage
export GEMINI_API_KEY=your-gemini-api-key
```

## Gemini RAG Use Cases for N8N Agent

1. **Documentation Lookup:**
   - "What does n8n Split in Batches reset option do?"
   - Get real-time docs even if they updated

2. **Error Research:**
   - "Find n8n errors related to 'node not executing'"
   - Search community forums and GitHub issues

3. **Best Practices:**
   - "What are best practices for n8n loop workflows?"
   - Get current recommendations

4. **Version Information:**
   - "What n8n version fixed Split in Batches bugs?"
   - Find changelog and release notes

## Pricing

Gemini API pricing (as of 2024):
- **Free tier**: 60 requests/minute
- **Gemini Pro**: Free up to rate limit
- **Grounding with Google Search**: Free during preview

Check current pricing: https://ai.google.dev/pricing
