#!/usr/bin/env ts-node
/**
 * n8n Diagnostics & Auto-Fix Script
 *
 * Smart script that:
 * 1. Diagnoses current n8n setup
 * 2. Lists all workflows and credentials
 * 3. Identifies what's missing
 * 4. Auto-fixes everything possible via API
 *
 * Usage: npm run n8n:diagnose
 */

import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env.local') });

const N8N_HOST = process.env.N8N_HOST;
const N8N_API_KEY = process.env.N8N_API_KEY;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function n8nRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
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

async function listWorkflows() {
  console.log('\n📋 Listing all workflows...');
  const result = await n8nRequest('/api/v1/workflows');

  console.log(`\nFound ${result.data.length} workflow(s):\n`);
  result.data.forEach((wf: any, idx: number) => {
    console.log(`${idx + 1}. ${wf.name}`);
    console.log(`   ID: ${wf.id}`);
    console.log(`   Active: ${wf.active ? '✅ Yes' : '❌ No'}`);
    console.log(`   Updated: ${new Date(wf.updatedAt).toLocaleString()}`);
    console.log(`   Nodes: ${wf.nodes?.length || 0}`);
    console.log('');
  });

  return result.data;
}

async function checkWorkflowCredentials(workflowId: string): Promise<{
  hasAnthropicCred: boolean;
  hasSupabaseCred: boolean;
  missingCredentials: string[];
}> {
  console.log('\n🔑 Checking workflow credentials...');

  const workflow = await getWorkflowDetails(workflowId);
  const missingCredentials: string[] = [];
  let hasAnthropicCred = false;
  let hasSupabaseCred = false;

  // Check each node for credentials
  workflow.nodes.forEach((node: any) => {
    if (node.credentials?.anthropicApi) {
      if (node.credentials.anthropicApi.id) {
        hasAnthropicCred = true;
        console.log(`   ✅ ${node.name}: Anthropic credential configured`);
      } else {
        missingCredentials.push(`${node.name} (Anthropic API)`);
      }
    }

    if (node.credentials?.httpHeaderAuth) {
      if (node.credentials.httpHeaderAuth.id) {
        hasSupabaseCred = true;
        console.log(`   ✅ ${node.name}: Supabase credential configured`);
      } else {
        missingCredentials.push(`${node.name} (Supabase Auth)`);
      }
    }
  });

  return { hasAnthropicCred, hasSupabaseCred, missingCredentials };
}

async function getWorkflowDetails(workflowId: string) {
  console.log(`\n🔍 Fetching workflow details for ID: ${workflowId}...`);
  const result = await n8nRequest(`/api/v1/workflows/${workflowId}`);

  // n8n API returns data directly or wrapped in { data: ... }
  // Handle both cases
  if (result.data) {
    return result.data;
  }
  return result;
}

async function activateWorkflow(workflowId: string) {
  console.log(`\n⚡ Activating workflow ${workflowId}...`);
  try {
    // Try the /activate endpoint first (newer n8n versions)
    await n8nRequest(`/api/v1/workflows/${workflowId}/activate`, {
      method: 'POST',
      body: JSON.stringify({})
    });
    console.log('✅ Workflow activated');
  } catch (error: any) {
    // Fallback: Try PUT method with active: true
    if (error.message.includes('404')) {
      console.log('   Trying fallback activation method...');
      await n8nRequest(`/api/v1/workflows/${workflowId}`, {
        method: 'PUT',
        body: JSON.stringify({ active: true })
      });
      console.log('✅ Workflow activated (fallback method)');
    } else {
      throw error;
    }
  }
}

async function diagnoseAndFix() {
  console.log('🔍 n8n DIAGNOSTICS & AUTO-FIX\n');
  console.log('='.repeat(60));

  try {
    // 1. List workflows
    const workflows = await listWorkflows();

    // 2. Find CourseHub workflow
    const courseHubWorkflow = workflows.find((wf: any) =>
      wf.name.includes('CourseHub') || wf.name.includes('Content Generation')
    );

    if (!courseHubWorkflow) {
      console.log('❌ CourseHub workflow not found!');
      console.log('\n💡 Solution: Import the workflow manually in n8n UI:');
      console.log('   1. Go to your n8n instance');
      console.log('   2. Click "+" → "Import from File"');
      console.log('   3. Select n8n-workflow-content-generation.json');
      return;
    }

    console.log(`✅ Found CourseHub workflow: ${courseHubWorkflow.id}`);

    // 3. Check workflow credentials
    const credStatus = await checkWorkflowCredentials(courseHubWorkflow.id);

    // 4. Report missing credentials
    if (credStatus.missingCredentials.length > 0) {
      console.log('\n⚠️  Missing credentials detected:');
      credStatus.missingCredentials.forEach(cred => {
        console.log(`   - ${cred}`);
      });
      console.log('\n💡 Manual Setup Required:');
      console.log('   1. Go to n8n → Credentials');
      console.log('   2. Create "Anthropic API" credential:');
      console.log(`      - Name: Anthropic API - CourseHub`);
      console.log(`      - API Key: ${ANTHROPIC_API_KEY?.substring(0, 20)}...`);
      console.log('   3. Create "Header Auth" credential for Supabase:');
      console.log(`      - Name: Supabase Auth - CourseHub`);
      console.log(`      - Header: Authorization`);
      console.log(`      - Value: Bearer ${SUPABASE_SERVICE_ROLE_KEY?.substring(0, 20)}...`);
      console.log('   4. Open workflow → Update nodes with credentials');
      console.log('   5. Save workflow');
    }

    // 5. Activate workflow if inactive
    if (!courseHubWorkflow.active) {
      console.log('\n⚠️  Workflow is INACTIVE - Activating...');
      await activateWorkflow(courseHubWorkflow.id);
    } else {
      console.log('\n✅ Workflow is already ACTIVE');
    }

    // 6. Fetch webhook URL
    const workflowDetails = await getWorkflowDetails(courseHubWorkflow.id);
    const webhookNode = workflowDetails.nodes.find((n: any) =>
      n.type === 'n8n-nodes-base.webhook'
    );

    let webhookUrl = '';
    if (webhookNode) {
      const webhookPath = webhookNode.parameters.path;
      webhookUrl = `${N8N_HOST}/webhook/${webhookPath}`;
      console.log(`\n📍 Webhook URL: ${webhookUrl}`);

      // Check if .env.local has correct webhook URL
      const envWebhookUrl = process.env.N8N_CONTENT_GENERATION_WEBHOOK_URL;
      if (envWebhookUrl !== webhookUrl) {
        console.log('\n⚠️  Webhook URL mismatch in .env.local!');
        console.log(`   Current: ${envWebhookUrl}`);
        console.log(`   Expected: ${webhookUrl}`);
        console.log('\n💡 Update .env.local with the correct webhook URL above');
      }
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('✅ DIAGNOSTICS COMPLETE!\n');
    console.log('📊 Summary:');
    console.log(`   - Workflow: ${courseHubWorkflow.name}`);
    console.log(`   - Workflow ID: ${courseHubWorkflow.id}`);
    console.log(`   - Status: ${courseHubWorkflow.active ? '✅ Active' : '⚠️  Inactive'}`);
    console.log(`   - Anthropic Cred: ${credStatus.hasAnthropicCred ? '✅ Configured' : '❌ Missing'}`);
    console.log(`   - Supabase Cred: ${credStatus.hasSupabaseCred ? '✅ Configured' : '❌ Missing'}`);
    if (webhookUrl) {
      console.log(`   - Webhook URL: ${webhookUrl}`);
    }

    console.log('\n🎯 Next Steps:');
    if (credStatus.missingCredentials.length > 0) {
      console.log('   1. ⚠️  Set up credentials in n8n UI (see instructions above)');
      console.log('   2. ⚠️  Update workflow nodes with credentials');
      console.log('   3. Run this script again to verify');
    } else {
      console.log('   1. ✅ All credentials configured!');
      console.log('   2. Verify webhook URL in .env.local');
      console.log('   3. Restart dev server: npm run dev');
      console.log('   4. Test workflow: Approve a proposal in /admin/proposals');
      console.log('   5. Monitor course generation (2-4 minutes)');
    }

  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    console.error('\nTroubleshooting:');
    console.error('   1. Check N8N_HOST is correct in .env.local');
    console.error('   2. Verify N8N_API_KEY is valid');
    console.error('   3. Ensure n8n instance is accessible');
    process.exit(1);
  }
}

diagnoseAndFix();
