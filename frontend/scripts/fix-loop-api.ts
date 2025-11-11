/**
 * n8n Workflow Loop Fix via API
 *
 * This script fetches the Content Generation Pipeline workflow,
 * fixes the loop connections, and updates it via the n8n API.
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

function analyzeAndFixLoop(workflow: N8nWorkflow): { fixed: boolean; changes: string[] } {
  console.log('\n🔍 Analyzing loop configuration...\n');

  const changes: string[] = [];

  // Find the Loop Sections node
  const loopNode = workflow.nodes.find(node =>
    node.name === 'Loop Sections' ||
    node.type === 'n8n-nodes-base.splitInBatches'
  );

  if (!loopNode) {
    console.log('❌ ERROR: Could not find Loop Sections node');
    return { fixed: false, changes };
  }

  console.log(`✅ Found Loop Node: ${loopNode.name}`);

  // Verify batch size
  if (!loopNode.parameters?.batchSize || loopNode.parameters.batchSize !== 1) {
    console.log(`   ⚠️  batchSize is ${loopNode.parameters?.batchSize}, setting to 1`);
    loopNode.parameters = loopNode.parameters || {};
    loopNode.parameters.batchSize = 1;
    changes.push('Set batchSize to 1');
  }

  // Find nodes that should be in the loop path
  const extractSectionNode = workflow.nodes.find(n => n.name === 'Extract Section');
  const mergeSectionNode = workflow.nodes.find(n => n.name === 'Merge Section Data');
  const assembleCourseNode = workflow.nodes.find(n => n.name === 'Assemble Complete Course');

  if (!extractSectionNode || !mergeSectionNode || !assembleCourseNode) {
    console.log('❌ ERROR: Missing required nodes');
    console.log(`   Extract Section: ${extractSectionNode ? '✓' : '✗'}`);
    console.log(`   Merge Section Data: ${mergeSectionNode ? '✓' : '✗'}`);
    console.log(`   Assemble Complete Course: ${assembleCourseNode ? '✓' : '✗'}`);
    return { fixed: false, changes };
  }

  console.log(`✅ Found all required nodes`);

  // Fix connections
  const loopConnections = workflow.connections[loopNode.name] || { main: [[], []] };

  // Output 0 (loop) should go to Extract Section
  const currentOutput0 = loopConnections.main?.[0]?.[0];
  if (!currentOutput0 || currentOutput0.node !== extractSectionNode.name) {
    console.log(`   🔧 Fixing output 0: ${loopNode.name} → ${extractSectionNode.name}`);
    loopConnections.main = loopConnections.main || [[], []];
    loopConnections.main[0] = [{
      node: extractSectionNode.name,
      type: 'main',
      index: 0
    }];
    changes.push(`Connected output 0 to ${extractSectionNode.name}`);
  }

  // Output 1 (done) should go to Assemble Complete Course
  const currentOutput1 = loopConnections.main?.[1]?.[0];
  if (!currentOutput1 || currentOutput1.node !== assembleCourseNode.name) {
    console.log(`   🔧 Fixing output 1: ${loopNode.name} → ${assembleCourseNode.name}`);
    loopConnections.main[1] = [{
      node: assembleCourseNode.name,
      type: 'main',
      index: 0
    }];
    changes.push(`Connected output 1 to ${assembleCourseNode.name}`);
  }

  workflow.connections[loopNode.name] = loopConnections;

  // Merge Section Data should loop back to Loop Sections
  const mergeConnections = workflow.connections[mergeSectionNode.name] || { main: [[]] };
  const currentLoopBack = mergeConnections.main?.[0]?.[0];

  if (!currentLoopBack || currentLoopBack.node !== loopNode.name) {
    console.log(`   🔧 Fixing loop back: ${mergeSectionNode.name} → ${loopNode.name}`);
    mergeConnections.main = [
      [{
        node: loopNode.name,
        type: 'main',
        index: 0
      }]
    ];
    changes.push(`Connected ${mergeSectionNode.name} back to ${loopNode.name}`);
  }

  workflow.connections[mergeSectionNode.name] = mergeConnections;

  console.log(`\n✅ Loop configuration fixed!`);
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
  console.log('🚀 n8n Loop Fix Script\n');
  console.log(`Workflow ID: ${WORKFLOW_ID}`);
  console.log(`n8n Host: ${N8N_HOST}\n`);
  console.log('─'.repeat(60));

  try {
    // Step 1: Fetch workflow
    const workflow = await fetchWorkflow();

    // Step 2: Save backup
    const backupPath = `frontend/scripts/workflow-backup-${Date.now()}.json`;
    const fs = require('fs');
    fs.writeFileSync(backupPath, JSON.stringify(workflow, null, 2));
    console.log(`\n💾 Backup saved to: ${backupPath}`);

    // Step 3: Analyze and fix
    const result = analyzeAndFixLoop(workflow);

    if (!result.fixed) {
      console.log('\n❌ Could not fix workflow automatically');
      console.log('Please check the workflow manually in n8n UI');
      process.exit(1);
    }

    if (result.changes.length === 0) {
      console.log('\n✨ Loop configuration is already correct!');
      console.log('No changes needed.');
      return;
    }

    // Step 4: Update workflow
    await updateWorkflow(workflow);

    // Step 5: Activate workflow
    await activateWorkflow();

    console.log('\n─'.repeat(60));
    console.log('✅ SUCCESS! Loop configuration has been fixed.\n');
    console.log('Next steps:');
    console.log('1. Test the workflow:');
    console.log('   cd frontend && ./scripts/test-workflow.sh');
    console.log('2. Monitor execution in n8n UI:');
    console.log(`   ${N8N_HOST}/workflow/${WORKFLOW_ID}`);
    console.log('3. Verify loop iterates 5 times');
    console.log('');

  } catch (error) {
    console.error('\n❌ ERROR:', error);
    process.exit(1);
  }
}

main();
