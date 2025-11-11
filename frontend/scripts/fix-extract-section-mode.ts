/**
 * n8n Workflow Extract Section Mode Fix
 *
 * Changes Extract Section node from "Run Once for All Items" to "Run Once for Each Item"
 * This is critical for the loop to iterate properly through all sections
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

function fixExtractSectionMode(workflow: N8nWorkflow): { fixed: boolean; changes: string[] } {
  console.log('\n🔍 Analyzing Extract Section node mode...\n');

  const changes: string[] = [];

  // Find the Extract Section node
  const extractNode = workflow.nodes.find(n => n.name === 'Extract Section');
  if (!extractNode) {
    console.log('❌ ERROR: Could not find Extract Section node');
    return { fixed: false, changes };
  }

  console.log(`✅ Found Extract Section node`);
  console.log(`   Current mode: ${extractNode.parameters?.mode || 'runOnceForAllItems'}`);

  // Check current mode
  const currentMode = extractNode.parameters?.mode;

  if (currentMode === 'runOnceForEachItem') {
    console.log(`   ✅ Mode is already set to "runOnceForEachItem"`);
    return { fixed: true, changes: [] };
  }

  // Change mode to runOnceForEachItem
  console.log(`   🔧 Changing mode from "${currentMode || 'runOnceForAllItems'}" to "runOnceForEachItem"`);

  if (!extractNode.parameters) {
    extractNode.parameters = {};
  }

  extractNode.parameters.mode = 'runOnceForEachItem';
  changes.push('Changed Extract Section mode to "Run Once for Each Item"');
  console.log(`   ✅ Extract Section mode updated`);

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
  console.log('🚀 n8n Extract Section Mode Fix Script\n');
  console.log(`Workflow ID: ${WORKFLOW_ID}`);
  console.log(`n8n Host: ${N8N_HOST}\n`);
  console.log('─'.repeat(60));

  try {
    // Step 1: Fetch workflow
    const workflow = await fetchWorkflow();

    // Step 2: Save backup
    const backupPath = `workflow-backup-extract-mode-${Date.now()}.json`;
    const fs = require('fs');
    const path = require('path');
    const fullPath = path.join(process.cwd(), 'scripts', backupPath);
    fs.writeFileSync(fullPath, JSON.stringify(workflow, null, 2));
    console.log(`\n💾 Backup saved to: scripts/${backupPath}`);

    // Step 3: Fix Extract Section mode
    const result = fixExtractSectionMode(workflow);

    if (!result.fixed) {
      console.log('\n❌ Could not fix workflow automatically');
      console.log('Please check the workflow manually in n8n UI');
      process.exit(1);
    }

    if (result.changes.length === 0) {
      console.log('\n✨ Extract Section mode is already configured correctly!');
      console.log('No changes needed.');
      return;
    }

    // Step 4: Update workflow
    await updateWorkflow(workflow);

    console.log('\n─'.repeat(60));
    console.log('✅ SUCCESS! Extract Section mode has been fixed.\n');
    console.log('The node will now run once for EACH item instead of ALL items.');
    console.log('This is the critical fix needed for the loop to iterate properly.\n');
    console.log('Expected behavior:');
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
