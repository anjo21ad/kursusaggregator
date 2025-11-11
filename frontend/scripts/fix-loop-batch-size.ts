/**
 * n8n Workflow Loop Batch Size Fix
 *
 * Adds missing batchSize parameter to Loop Sections (Split in Batches) node
 * This is THE CRITICAL FIX needed for loop iteration to work
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

function fixLoopBatchSize(workflow: N8nWorkflow): { fixed: boolean; changes: string[] } {
  console.log('\n🔍 Analyzing Loop Sections batch size...\n');

  const changes: string[] = [];

  // Find the Loop Sections node
  const loopNode = workflow.nodes.find(n => n.name === 'Loop Sections');
  if (!loopNode) {
    console.log('❌ ERROR: Could not find Loop Sections node');
    return { fixed: false, changes };
  }

  console.log(`✅ Found Loop Sections node`);
  console.log(`   Current parameters: ${JSON.stringify(loopNode.parameters, null, 2)}`);

  // Check if batchSize is set
  const currentBatchSize = loopNode.parameters?.batchSize;

  if (currentBatchSize === 1) {
    console.log(`   ✅ Batch size is already set to 1`);
    return { fixed: true, changes: [] };
  }

  // Add batchSize parameter
  console.log(`   🔧 Adding batchSize parameter (value: 1)`);

  if (!loopNode.parameters) {
    loopNode.parameters = {};
  }

  loopNode.parameters.batchSize = 1;
  changes.push('Added batchSize: 1 to Loop Sections node');
  console.log(`   ✅ Loop Sections batch size configured`);

  console.log(`\n📊 Summary:`);
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
  console.log('🚀 n8n Loop Batch Size Fix Script\n');
  console.log(`Workflow ID: ${WORKFLOW_ID}`);
  console.log(`n8n Host: ${N8N_HOST}\n`);
  console.log('─'.repeat(60));

  try {
    // Step 1: Fetch workflow
    const workflow = await fetchWorkflow();

    // Step 2: Save backup
    const backupPath = `workflow-backup-batch-size-${Date.now()}.json`;
    const fs = require('fs');
    const path = require('path');
    const fullPath = path.join(process.cwd(), 'scripts', backupPath);
    fs.writeFileSync(fullPath, JSON.stringify(workflow, null, 2));
    console.log(`\n💾 Backup saved to: scripts/${backupPath}`);

    // Step 3: Fix batch size
    const result = fixLoopBatchSize(workflow);

    if (!result.fixed) {
      console.log('\n❌ Could not fix workflow automatically');
      console.log('Please check the workflow manually in n8n UI');
      process.exit(1);
    }

    if (result.changes.length === 0) {
      console.log('\n✨ Batch size is already configured correctly!');
      console.log('No changes needed.');
      return;
    }

    // Step 4: Update workflow
    await updateWorkflow(workflow);

    console.log('\n─'.repeat(60));
    console.log('✅ SUCCESS! Loop batch size has been fixed.\n');
    console.log('🎯 THIS WAS THE CRITICAL MISSING CONFIGURATION!\n');
    console.log('The Split in Batches node now knows to process 1 item at a time.');
    console.log('Expected behavior:');
    console.log('  - Loop Sections receives 5 items from Validate & Prepare');
    console.log('  - Loop Sections sends section 1 → Extract Section processes it');
    console.log('  - After AI generation, loop back to Loop Sections');
    console.log('  - Loop Sections sends section 2 → Extract Section processes it');
    console.log('  - This repeats for all 5 sections');
    console.log('  - After section 5, workflow goes to Done Branch\n');
    console.log('Test the workflow now:');
    console.log('  curl -X POST "https://n8n-production-30ce.up.railway.app/webhook/generate-content" \\');
    console.log('    -H "Content-Type: application/json" \\');
    console.log('    -d \'{"proposalId": "c3b74454-50a4-40d1-aa61-b66c4dea5043", "courseId": 1}\'');
    console.log('');
    console.log('Expected execution time: 5-15 minutes (for AI generation)');
    console.log('');

  } catch (error) {
    console.error('\n❌ ERROR:', error);
    process.exit(1);
  }
}

main();
