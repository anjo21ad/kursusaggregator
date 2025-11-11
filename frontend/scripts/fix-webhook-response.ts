/**
 * n8n Workflow Webhook Response Fix via API
 *
 * This script fixes the "Unused Respond to Webhook node" error
 * by connecting the last workflow node to the webhook response.
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

function analyzeAndFixWebhookResponse(workflow: N8nWorkflow): { fixed: boolean; changes: string[] } {
  console.log('\n🔍 Analyzing webhook response configuration...\n');

  const changes: string[] = [];

  // Find the Respond to Webhook node
  const webhookResponseNode = workflow.nodes.find(node =>
    node.name === 'Respond to Webhook' ||
    node.type === 'n8n-nodes-base.respondToWebhook'
  );

  if (!webhookResponseNode) {
    console.log('❌ ERROR: Could not find Respond to Webhook node');
    return { fixed: false, changes };
  }

  console.log(`✅ Found Webhook Response Node: ${webhookResponseNode.name}`);

  // Check if it already has incoming connections
  const existingConnections = Object.entries(workflow.connections).find(
    ([nodeName, conns]) => {
      const mainConns = conns.main || [];
      return mainConns.some(outputConns =>
        outputConns?.some(conn => conn.node === webhookResponseNode.name)
      );
    }
  );

  if (existingConnections) {
    console.log(`✅ Webhook Response already connected from: ${existingConnections[0]}`);
    return { fixed: true, changes: [] };
  }

  // Find candidate nodes to connect to webhook response
  // Priority: Update Proposal Status > Assemble Complete Course
  const candidateNodeNames = [
    'Update Proposal Status',
    'Assemble Complete Course',
    'Save to Database'
  ];

  let sourceNode: N8nNode | undefined;
  for (const nodeName of candidateNodeNames) {
    sourceNode = workflow.nodes.find(n => n.name === nodeName);
    if (sourceNode) {
      console.log(`✅ Found source node: ${sourceNode.name}`);
      break;
    }
  }

  if (!sourceNode) {
    console.log('❌ ERROR: Could not find suitable source node to connect');
    console.log('   Looked for: ' + candidateNodeNames.join(', '));
    return { fixed: false, changes };
  }

  // Connect source node to webhook response
  const sourceConnections = workflow.connections[sourceNode.name] || { main: [[]] };

  // Add connection from source to webhook response
  if (!sourceConnections.main) {
    sourceConnections.main = [[]];
  }
  if (!sourceConnections.main[0]) {
    sourceConnections.main[0] = [];
  }

  // Check if connection already exists
  const alreadyConnected = sourceConnections.main[0].some(
    conn => conn.node === webhookResponseNode.name
  );

  if (!alreadyConnected) {
    console.log(`   🔧 Connecting: ${sourceNode.name} → ${webhookResponseNode.name}`);
    sourceConnections.main[0].push({
      node: webhookResponseNode.name,
      type: 'main',
      index: 0
    });
    workflow.connections[sourceNode.name] = sourceConnections;
    changes.push(`Connected ${sourceNode.name} to ${webhookResponseNode.name}`);
  }

  console.log(`\n✅ Webhook response configuration fixed!`);
  console.log(`   Changes made: ${changes.length}`);
  changes.forEach((change, i) => console.log(`   ${i + 1}. ${change}`));

  return { fixed: true, changes };
}

async function updateWorkflow(workflow: N8nWorkflow): Promise<void> {
  console.log('\n📤 Updating workflow via n8n API...');

  const response = await fetch(`${N8N_HOST}/api/v1/workflows/${WORKFLOW_ID}`, {
    method: 'PUT',
    headers: {
      'X-N8N-API-KEY': N8N_API_KEY,
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(workflow)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to update workflow: ${response.status} ${response.statusText}\n${errorText}`);
  }

  console.log('✅ Workflow updated successfully!');
}

async function activateWorkflow(): Promise<void> {
  console.log('\n🔄 Activating workflow...');

  const response = await fetch(`${N8N_HOST}/api/v1/workflows/${WORKFLOW_ID}/activate`, {
    method: 'POST',
    headers: {
      'X-N8N-API-KEY': N8N_API_KEY,
      'Accept': 'application/json'
    }
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.log(`⚠️  Warning: Could not activate workflow: ${response.status}\n${errorText}`);
    return;
  }

  console.log('✅ Workflow activated!');
}

async function main() {
  console.log('🚀 n8n Webhook Response Fix Script\n');
  console.log(`Workflow ID: ${WORKFLOW_ID}`);
  console.log(`n8n Host: ${N8N_HOST}\n`);
  console.log('─'.repeat(60));

  try {
    // Step 1: Fetch workflow
    const workflow = await fetchWorkflow();

    // Step 2: Save backup
    const backupPath = `workflow-backup-webhook-${Date.now()}.json`;
    const fs = require('fs');
    const path = require('path');
    const fullPath = path.join(process.cwd(), 'scripts', backupPath);
    fs.writeFileSync(fullPath, JSON.stringify(workflow, null, 2));
    console.log(`\n💾 Backup saved to: scripts/${backupPath}`);

    // Step 3: Analyze and fix
    const result = analyzeAndFixWebhookResponse(workflow);

    if (!result.fixed) {
      console.log('\n❌ Could not fix workflow automatically');
      console.log('Please check the workflow manually in n8n UI');
      process.exit(1);
    }

    if (result.changes.length === 0) {
      console.log('\n✨ Webhook response is already configured correctly!');
      console.log('No changes needed.');
      return;
    }

    // Step 4: Update workflow
    await updateWorkflow(workflow);

    // Step 5: Activate workflow
    await activateWorkflow();

    console.log('\n─'.repeat(60));
    console.log('✅ SUCCESS! Webhook response has been fixed.\n');
    console.log('Next steps:');
    console.log('1. Test the workflow:');
    console.log('   curl -X POST "https://n8n-production-30ce.up.railway.app/webhook/generate-content" \\');
    console.log('     -H "Content-Type: application/json" \\');
    console.log('     -d \'{"proposalId": "c3b74454-50a4-40d1-aa61-b66c4dea5043", "courseId": 1}\'');
    console.log('2. Monitor execution in n8n UI:');
    console.log(`   ${N8N_HOST}/workflow/${WORKFLOW_ID}`);
    console.log('3. Should return 200 instead of 500');
    console.log('');

  } catch (error) {
    console.error('\n❌ ERROR:', error);
    process.exit(1);
  }
}

main();
