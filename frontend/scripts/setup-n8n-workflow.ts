#!/usr/bin/env ts-node
/**
 * n8n Workflow Automatic Setup Script
 *
 * This script automates the complete setup of the Content Generation workflow in n8n:
 * 1. Creates Anthropic API credential
 * 2. Creates Supabase Auth credential
 * 3. Updates workflow JSON with credential IDs
 * 4. Uploads workflow to n8n
 * 5. Activates workflow
 * 6. Extracts webhook URL
 * 7. Updates .env.local with webhook URL
 *
 * Usage:
 *   npm run setup:n8n
 *
 * Prerequisites:
 *   - N8N_API_KEY in .env.local
 *   - N8N_HOST in .env.local (your n8n instance URL)
 *   - ANTHROPIC_API_KEY in .env.local
 *   - SUPABASE_SERVICE_ROLE_KEY in .env.local
 *   - NEXT_PUBLIC_SUPABASE_URL in .env.local
 */

import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env.local') });

// ============================================================================
// TYPES
// ============================================================================

type N8nCredential = {
  id: string;
  name: string;
  type: string;
};

type N8nWorkflow = {
  id: string;
  name: string;
  active: boolean;
  nodes: any[];
  connections: any;
};

type CreateCredentialPayload = {
  name: string;
  type: string;
  nodesAccess: Array<{ nodeType: string }>;
  data: Record<string, any>;
};

// ============================================================================
// CONFIGURATION
// ============================================================================

const N8N_HOST = process.env.N8N_HOST;
const N8N_API_KEY = process.env.N8N_API_KEY;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;

const WORKFLOW_JSON_PATH = path.join(__dirname, '../../n8n-workflow-content-generation.json');
const ENV_LOCAL_PATH = path.join(__dirname, '../.env.local');

// ============================================================================
// VALIDATION
// ============================================================================

function validateEnvironment() {
  const missing: string[] = [];

  if (!N8N_HOST) missing.push('N8N_HOST');
  if (!N8N_API_KEY) missing.push('N8N_API_KEY');
  if (!ANTHROPIC_API_KEY) missing.push('ANTHROPIC_API_KEY');
  if (!SUPABASE_SERVICE_ROLE_KEY) missing.push('SUPABASE_SERVICE_ROLE_KEY');
  if (!SUPABASE_URL) missing.push('NEXT_PUBLIC_SUPABASE_URL');

  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:');
    missing.forEach(v => console.error(`   - ${v}`));
    console.error('\nPlease add these to frontend/.env.local');
    process.exit(1);
  }

  console.log('✅ Environment variables validated');
}

// ============================================================================
// N8N API CLIENT
// ============================================================================

async function n8nRequest(
  endpoint: string,
  options: RequestInit = {}
): Promise<any> {
  const url = `${N8N_HOST}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'X-N8N-API-KEY': N8N_API_KEY!,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`n8n API error (${response.status}): ${error}`);
  }

  return response.json();
}

// ============================================================================
// CREDENTIAL MANAGEMENT
// ============================================================================

async function createAnthropicCredential(): Promise<string> {
  console.log('\n📝 Creating Anthropic API credential...');

  const payload: CreateCredentialPayload = {
    name: 'Anthropic API - CourseHub',
    type: 'anthropicApi',
    nodesAccess: [
      { nodeType: 'n8n-nodes-base.anthropic' },
      { nodeType: 'n8n-nodes-base.httpRequest' }
    ],
    data: {
      apiKey: ANTHROPIC_API_KEY!
    }
  };

  const result = await n8nRequest('/api/v1/credentials', {
    method: 'POST',
    body: JSON.stringify(payload)
  });

  console.log(`✅ Anthropic credential created: ${result.data.id}`);
  return result.data.id;
}

async function createSupabaseCredential(): Promise<string> {
  console.log('\n📝 Creating Supabase Auth credential...');

  const payload: CreateCredentialPayload = {
    name: 'Supabase Auth - CourseHub',
    type: 'httpHeaderAuth',
    nodesAccess: [
      { nodeType: 'n8n-nodes-base.httpRequest' }
    ],
    data: {
      name: 'Authorization',
      value: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
    }
  };

  const result = await n8nRequest('/api/v1/credentials', {
    method: 'POST',
    body: JSON.stringify(payload)
  });

  console.log(`✅ Supabase credential created: ${result.data.id}`);
  return result.data.id;
}

// ============================================================================
// WORKFLOW MANAGEMENT
// ============================================================================

async function updateWorkflowWithCredentials(
  anthropicCredId: string,
  supabaseCredId: string
): Promise<any> {
  console.log('\n📄 Reading workflow JSON...');

  if (!fs.existsSync(WORKFLOW_JSON_PATH)) {
    throw new Error(`Workflow file not found: ${WORKFLOW_JSON_PATH}`);
  }

  const workflowJson = JSON.parse(fs.readFileSync(WORKFLOW_JSON_PATH, 'utf-8'));

  console.log('🔧 Updating workflow with credential IDs...');

  // Update all nodes with Anthropic credentials
  workflowJson.nodes.forEach((node: any) => {
    if (node.credentials?.anthropicApi) {
      node.credentials.anthropicApi = {
        id: anthropicCredId,
        name: 'Anthropic API - CourseHub'
      };
      console.log(`   Updated node: ${node.name}`);
    }

    if (node.credentials?.httpHeaderAuth) {
      node.credentials.httpHeaderAuth = {
        id: supabaseCredId,
        name: 'Supabase Auth - CourseHub'
      };
      console.log(`   Updated node: ${node.name}`);
    }
  });

  console.log('✅ Workflow updated with credentials');
  return workflowJson;
}

async function uploadWorkflow(workflowData: any): Promise<string> {
  console.log('\n📤 Uploading workflow to n8n...');

  const result = await n8nRequest('/api/v1/workflows', {
    method: 'POST',
    body: JSON.stringify(workflowData)
  });

  console.log(`✅ Workflow uploaded: ${result.data.id}`);
  return result.data.id;
}

async function activateWorkflow(workflowId: string): Promise<void> {
  console.log('\n⚡ Activating workflow...');

  await n8nRequest(`/api/v1/workflows/${workflowId}`, {
    method: 'PATCH',
    body: JSON.stringify({ active: true })
  });

  console.log('✅ Workflow activated');
}

// ============================================================================
// ENV UPDATE
// ============================================================================

function updateEnvLocal(webhookUrl: string): void {
  console.log('\n📝 Updating .env.local with webhook URL...');

  let envContent = fs.readFileSync(ENV_LOCAL_PATH, 'utf-8');

  // Replace placeholder webhook URL with actual URL
  const oldUrl = 'N8N_CONTENT_GENERATION_WEBHOOK_URL=https://YOUR_N8N_INSTANCE.app.n8n.cloud/webhook/generate-content';
  const newUrl = `N8N_CONTENT_GENERATION_WEBHOOK_URL=${webhookUrl}`;

  if (envContent.includes(oldUrl)) {
    envContent = envContent.replace(oldUrl, newUrl);
  } else {
    // If already updated, replace existing value
    envContent = envContent.replace(
      /N8N_CONTENT_GENERATION_WEBHOOK_URL=.*/,
      newUrl
    );
  }

  fs.writeFileSync(ENV_LOCAL_PATH, envContent, 'utf-8');

  console.log(`✅ .env.local updated with webhook URL: ${webhookUrl}`);
}

// ============================================================================
// MAIN SETUP FUNCTION
// ============================================================================

async function setupN8nWorkflow() {
  console.log('🚀 Starting n8n Workflow Automatic Setup\n');
  console.log('='.repeat(60));

  try {
    // Step 1: Validate environment
    validateEnvironment();

    // Step 2: Create credentials
    const anthropicCredId = await createAnthropicCredential();
    const supabaseCredId = await createSupabaseCredential();

    // Step 3: Update workflow JSON
    const workflowData = await updateWorkflowWithCredentials(
      anthropicCredId,
      supabaseCredId
    );

    // Step 4: Upload workflow
    const workflowId = await uploadWorkflow(workflowData);

    // Step 5: Activate workflow
    await activateWorkflow(workflowId);

    // Step 6: Construct webhook URL
    const webhookUrl = `${N8N_HOST}/webhook/generate-content`;

    // Step 7: Update .env.local
    updateEnvLocal(webhookUrl);

    // Success summary
    console.log('\n' + '='.repeat(60));
    console.log('✅ SETUP COMPLETE!\n');
    console.log('📊 Summary:');
    console.log(`   - Workflow ID: ${workflowId}`);
    console.log(`   - Webhook URL: ${webhookUrl}`);
    console.log(`   - Status: Active`);
    console.log('\n🎯 Next Steps:');
    console.log('   1. Restart your dev server: npm run dev');
    console.log('   2. Test workflow: Approve a proposal in /admin/proposals');
    console.log('   3. Monitor course generation (takes 2-4 minutes)');
    console.log('\n🎉 CourseHub Content Generation Pipeline is ready!');

  } catch (error) {
    console.error('\n❌ Setup failed:', error);
    console.error('\nTroubleshooting:');
    console.error('   1. Verify N8N_HOST is correct in .env.local');
    console.error('   2. Verify N8N_API_KEY is valid (not expired)');
    console.error('   3. Check n8n instance is accessible');
    console.error('   4. Review error message above for details');
    process.exit(1);
  }
}

// ============================================================================
// RUN
// ============================================================================

setupN8nWorkflow();
