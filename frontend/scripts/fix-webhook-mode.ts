/**
 * n8n Workflow Webhook Mode Fix via API
 *
 * Fixes "Unused Respond to Webhook node" by changing responseMode
 * from "lastNode" to "responseNode"
 */

const N8N_HOST = 'https://n8n-production-30ce.up.railway.app';
const N8N_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1NzgzYzZkNC0wN2VlLTQ4Y2YtYTQ0NS0xNjA5ZWNhMjMxOTEiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzYyNzc4MjIxLCJleHAiOjE3NzA1MjY4MDB9.33txPypsZvgEwpvKkcBnaSkGJHQErFBBJmfrHGI3mTw';
const WORKFLOW_ID = 'FimIaNZ66cEz96GM';

interface N8nNode {
  id: string;
  name: string;
  type: string;
  parameters: any;
  position: [number, number];
  typeVersion?: number;
}

interface N8nConnection {
  node: string;
  type: string;
  index: number;
}

interface N8nWorkflow {
  id: string;
  name: string;
  nodes: N8nNode[];
  connections: Record<string, { main?: N8nConnection[][] }>;
  settings?: any;
  staticData?: any;
}

async function fetchWorkflow(): Promise<N8nWorkflow> {
  console.log('📥 Fetching workflow from n8n API...');
  const response = await fetch(`${N8N_HOST}/api/v1/workflows/${WORKFLOW_ID}`, {
    method: 'GET',
    headers: {
      'X-N8N-API-KEY': N8N_API_KEY,
      'Accept': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch workflow: ${response.status} ${response.statusText}`);
  }

  const workflow = await response.json();
  console.log(`✅ Fetched workflow: ${workflow.name}`);
  console.log(`   Total nodes: ${workflow.nodes.length}`);
  return workflow;
}

function fixWebhookMode(workflow: N8nWorkflow): { fixed: boolean; changes: string[] } {
  console.log('\n🔍 Analyzing webhook configuration...\n');

  const changes: string[] = [];

  // Find the Webhook Trigger node
  const webhookTrigger = workflow.nodes.find(node =>
    node.name === 'Webhook Trigger' ||
    node.type === 'n8n-nodes-base.webhook'
  );

  if (!webhookTrigger) {
    console.log('❌ ERROR: Could not find Webhook Trigger node');
    return { fixed: false, changes };
  }

  console.log(`✅ Found Webhook Trigger: ${webhookTrigger.name}`);
  console.log(`   Current responseMode: ${webhookTrigger.parameters?.responseMode || 'undefined'}`);

  // Check if there's a "Respond to Webhook" node
  const respondNode = workflow.nodes.find(node =>
    node.name === 'Respond to Webhook' ||
    node.type === 'n8n-nodes-base.respondToWebhook'
  );

  if (!respondNode) {
    console.log('ℹ️  No "Respond to Webhook" node found - no changes needed');
    return { fixed: true, changes: [] };
  }

  console.log(`✅ Found "Respond to Webhook" node`);

  // If responseMode is "lastNode", change it to "responseNode"
  const currentMode = webhookTrigger.parameters?.responseMode;

  if (currentMode === 'lastNode') {
    console.log(`   🔧 Changing responseMode from "lastNode" to "responseNode"`);
    webhookTrigger.parameters.responseMode = 'responseNode';
    changes.push('Changed Webhook Trigger responseMode to "responseNode"');
  } else if (currentMode === 'responseNode') {
    console.log(`   ✅ responseMode is already "responseNode" - no change needed`);
  } else {
    console.log(`   ⚠️  Unexpected responseMode: ${currentMode}`);
    webhookTrigger.parameters.responseMode = 'responseNode';
    changes.push(`Changed responseMode from "${currentMode}" to "responseNode"`);
  }

  console.log(`\n✅ Webhook configuration fixed!`);
  console.log(`   Changes made: ${changes.length}`);
  changes.forEach((change, i) => console.log(`   ${i + 1}. ${change}`));

  return { fixed: true, changes };
}

async function updateWorkflow(workflow: N8nWorkflow): Promise<void> {
  console.log('\n📤 Updating workflow via n8n API...');

  // Only send fields that n8n API expects (remove metadata)
  const cleanedWorkflow = {
    name: workflow.name,
    nodes: workflow.nodes,
    connections: workflow.connections,
    settings: workflow.settings || {},
    staticData: workflow.staticData || {}
  };

  const response = await fetch(`${N8N_HOST}/api/v1/workflows/${WORKFLOW_ID}`, {
    method: 'PUT',
    headers: {
      'X-N8N-API-KEY': N8N_API_KEY,
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(cleanedWorkflow)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to update workflow: ${response.status} ${response.statusText}\n${errorText}`);
  }

  console.log('✅ Workflow updated successfully!');
}

async function main() {
  console.log('🚀 n8n Webhook Mode Fix Script\n');
  console.log(`Workflow ID: ${WORKFLOW_ID}`);
  console.log(`n8n Host: ${N8N_HOST}\n`);
  console.log('─'.repeat(60));

  try {
    // Step 1: Fetch workflow
    const workflow = await fetchWorkflow();

    // Step 2: Save backup
    const backupPath = `workflow-backup-mode-${Date.now()}.json`;
    const fs = require('fs');
    const path = require('path');
    const fullPath = path.join(process.cwd(), 'scripts', backupPath);
    fs.writeFileSync(fullPath, JSON.stringify(workflow, null, 2));
    console.log(`\n💾 Backup saved to: scripts/${backupPath}`);

    // Step 3: Fix webhook mode
    const result = fixWebhookMode(workflow);

    if (!result.fixed) {
      console.log('\n❌ Could not fix workflow automatically');
      console.log('Please check the workflow manually in n8n UI');
      process.exit(1);
    }

    if (result.changes.length === 0) {
      console.log('\n✨ Webhook mode is already configured correctly!');
      console.log('No changes needed.');
      return;
    }

    // Step 4: Update workflow
    await updateWorkflow(workflow);

    console.log('\n─'.repeat(60));
    console.log('✅ SUCCESS! Webhook mode has been fixed.\n');
    console.log('The workflow will now use the "Respond to Webhook" node');
    console.log('instead of automatically responding with the last node.\n');
    console.log('Test the workflow now:');
    console.log('  curl -X POST "https://n8n-production-30ce.up.railway.app/webhook/generate-content" \\');
    console.log('    -H "Content-Type: application/json" \\');
    console.log('    -d \'{"proposalId": "c3b74454-50a4-40d1-aa61-b66c4dea5043", "courseId": 1}\'');
    console.log('');

  } catch (error) {
    console.error('\n❌ ERROR:', error);
    process.exit(1);
  }
}

main();
