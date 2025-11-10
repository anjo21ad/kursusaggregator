#!/usr/bin/env ts-node
/**
 * Update n8n Workflow Credentials Script
 *
 * Automatically updates CourseHub workflow nodes with Supabase credentials
 * Usage: npm run n8n:update-credentials
 */

import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env.local') });

const N8N_HOST = process.env.N8N_HOST;
const N8N_API_KEY = process.env.N8N_API_KEY;

// Get credential ID from command line argument or environment variable
const CREDENTIAL_ID = process.argv[2] || process.env.SUPABASE_CREDENTIAL_ID;

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

async function getWorkflowDetails(workflowId: string) {
  const result = await n8nRequest(`/api/v1/workflows/${workflowId}`);
  return result.data || result;
}

async function updateWorkflow(workflowId: string, workflowData: any) {
  // Clean workflow data - include all required fields
  const workflow = {
    name: workflowData.name || 'CourseHub - Content Generation Pipeline',
    nodes: workflowData.nodes,
    connections: workflowData.connections,
    settings: workflowData.settings || { executionOrder: 'v1' }
  };

  const result = await n8nRequest(`/api/v1/workflows/${workflowId}`, {
    method: 'PUT',
    body: JSON.stringify(workflow)
  });
  return result.data || result;
}

async function findSupabaseCredential(): Promise<string | null> {
  console.log('\n🔍 Searching for Supabase credentials in workflow...');

  try {
    const workflow = await getWorkflowDetails('XJvSFsbuKxz7YQGv');

    // Find any existing Supabase credential ID from workflow nodes
    for (const node of workflow.nodes) {
      if (node.credentials?.httpHeaderAuth?.id) {
        const credId = node.credentials.httpHeaderAuth.id;
        console.log(`   ✅ Found existing credential ID: ${credId}`);
        return credId;
      }
    }
  } catch (error) {
    console.log('   ⚠️  No existing credentials found in workflow');
  }

  return null;
}

async function updateWorkflowCredentials() {
  console.log('🔧 UPDATE WORKFLOW CREDENTIALS\n');
  console.log('='.repeat(60));

  try {
    const workflowId = 'XJvSFsbuKxz7YQGv';

    // Try to get credential ID from CLI arg, env var, or find in workflow
    let credentialId = CREDENTIAL_ID || await findSupabaseCredential();

    if (!credentialId) {
      console.log('\n❌ Credential ID not found!');
      console.log('\n📋 How to provide credential ID:');
      console.log('   Method 1: Command line argument');
      console.log('   npm run n8n:update-credentials -- YOUR_CREDENTIAL_ID');
      console.log('\n   Method 2: Find it in n8n UI');
      console.log('   1. Go to n8n → Credentials');
      console.log('   2. Click on "Supabase Auth - CourseHub"');
      console.log('   3. Look at URL: /credentials/{ID}');
      console.log('   4. Run: npm run n8n:update-credentials -- {ID}');
      process.exit(1);
    }

    console.log(`\n✅ Using credential ID: ${credentialId}`);
    console.log('\n📥 Fetching workflow...');
    const workflow = await getWorkflowDetails(workflowId);

    console.log('\n🔧 Updating nodes with Supabase credentials...');

    const nodesToUpdate = [
      'Fetch Proposal',
      'Fetch Course',
      'Save to Database',
      'Update Proposal Status'
    ];

    let updatedCount = 0;

    workflow.nodes.forEach((node: any) => {
      if (nodesToUpdate.includes(node.name)) {
        // Update httpHeaderAuth credential
        if (!node.credentials) {
          node.credentials = {};
        }

        node.credentials.httpHeaderAuth = {
          id: credentialId,
          name: 'Supabase Auth - CourseHub'
        };

        console.log(`   ✅ Updated: ${node.name}`);
        updatedCount++;
      }
    });

    if (updatedCount === 0) {
      console.log('   ⚠️  No nodes found to update');
      return;
    }

    console.log(`\n📤 Saving workflow (${updatedCount} nodes updated)...`);
    await updateWorkflow(workflowId, workflow);

    console.log('\n' + '='.repeat(60));
    console.log('✅ WORKFLOW UPDATED SUCCESSFULLY!\n');
    console.log('📊 Summary:');
    console.log(`   - Workflow ID: ${workflowId}`);
    console.log(`   - Credential ID: ${credentialId}`);
    console.log(`   - Nodes updated: ${updatedCount}/4`);

    console.log('\n🎯 Next Steps:');
    console.log('   1. Run diagnostics: npm run n8n:diagnose');
    console.log('   2. Verify: "Supabase Cred: ✅ Configured"');
    console.log('   3. Test workflow: Approve a proposal in /admin/proposals');

  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    console.error('\nTroubleshooting:');
    console.error('   1. Verify credential ID is correct');
    console.error('   2. Check workflow ID: XJvSFsbuKxz7YQGv');
    console.error('   3. Ensure N8N_API_KEY is valid');
    process.exit(1);
  }
}

updateWorkflowCredentials();
