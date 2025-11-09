# n8n Workflow Setup Scripts

This directory contains automation scripts for setting up the CourseHub n8n Content Generation workflow.

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

## 🚀 Usage

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

## 🔧 Troubleshooting

### Error: "Missing required environment variables"

**Solution:** Ensure all required variables are in `.env.local`:
```bash
N8N_HOST=https://your-instance.app.n8n.cloud
N8N_API_KEY=eyJ...
ANTHROPIC_API_KEY=sk-ant-...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
NEXT_PUBLIC_SUPABASE_URL=https://...supabase.co
```

### Error: "n8n API error (401): Unauthorized"

**Solution:** Your n8n API key is invalid or expired.
1. Go to n8n Settings → API
2. Delete old key
3. Create new API key
4. Update `N8N_API_KEY` in `.env.local`
5. Run `npm run setup:n8n` again

### Error: "Workflow file not found"

**Solution:** Ensure you're running from the `frontend/` directory:
```bash
cd frontend
npm run setup:n8n
```

### Error: "n8n API error (500): Internal Server Error"

**Solution:** n8n instance might be down or misconfigured.
1. Verify `N8N_HOST` is correct
2. Check n8n instance is accessible in browser
3. Try manual setup as fallback

## 📁 Scripts

### `setup-n8n-workflow.ts`
Main automation script that handles complete n8n workflow setup.

### `update-env.ts`
Utility module for programmatically updating `.env` files. Used by setup script to auto-configure environment variables.

## 🔒 Security Notes

- **Never commit `.env.local`** - Contains sensitive API keys
- **n8n API Key expires** - Check expiration date in JWT token
- **Rotate keys regularly** - Especially before production launch
- **Use environment-specific keys** - Different keys for dev/staging/prod

## 📚 Related Documentation

- [N8N-CONTENT-GENERATION-DESIGN.md](../../N8N-CONTENT-GENERATION-DESIGN.md) - Workflow architecture
- [N8N-CONTENT-GENERATION-SETUP.md](../../N8N-CONTENT-GENERATION-SETUP.md) - Manual setup guide
- [n8n API Documentation](https://docs.n8n.io/api/)

## 🎯 Next Steps After Setup

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

**Questions?** Check the full documentation in [N8N-CONTENT-GENERATION-SETUP.md](../../N8N-CONTENT-GENERATION-SETUP.md)
