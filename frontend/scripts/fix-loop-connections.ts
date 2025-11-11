/**
 * n8n Workflow Loop Connections Fix
 *
 * Fixes the Loop Sections node connections to ensure proper iteration
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

function fixLoopConnections(workflow: N8nWorkflow): { fixed: boolean; changes: string[] } {
  console.log('\n🔍 Analyzing Loop Sections connections...\n');

  const changes: string[] = [];

  // Find the Loop Sections node
  const loopNode = workflow.nodes.find(n => n.name === 'Loop Sections');
  if (!loopNode) {
    console.log('❌ ERROR: Could not find Loop Sections node');
    return { fixed: false, changes };
  }

  console.log(`✅ Found Loop Sections node`);

  // Get or initialize connections for Loop Sections
  if (!workflow.connections['Loop Sections']) {
    workflow.connections['Loop Sections'] = { main: [[], []] };
  }

  const loopConnections = workflow.connections['Loop Sections'];
  if (!loopConnections.main) {
    loopConnections.main = [[], []];
  }

  // Ensure we have arrays for both outputs
  if (!loopConnections.main[0]) loopConnections.main[0] = [];
  if (!loopConnections.main[1]) loopConnections.main[1] = [];

  // Output 0 (loop) should connect to Extract Section
  const output0 = loopConnections.main[0];
  const hasExtractConnection = output0.some(conn => conn.node === 'Extract Section');

  if (!hasExtractConnection) {
    console.log(`   🔧 Adding connection: Loop Sections (output 0) → Extract Section`);
    output0.push({
      node: 'Extract Section',
      type: 'main',
      index: 0
    });
    changes.push('Connected Loop Sections output 0 (loop) to Extract Section');
  } else {
    console.log(`   ✅ Loop output already connected to Extract Section`);
  }

  // Output 1 (done) should connect to Assemble Complete Course
  const output1 = loopConnections.main[1];
  const hasAssembleConnection = output1.some(conn => conn.node === 'Assemble Complete Course');

  if (!hasAssembleConnection) {
    console.log(`   🔧 Adding connection: Loop Sections (output 1) → Assemble Complete Course`);
    output1.push({
      node: 'Assemble Complete Course',
      type: 'main',
      index: 0
    });
    changes.push('Connected Loop Sections output 1 (done) to Assemble Complete Course');
  } else {
    console.log(`   ✅ Done output already connected to Assemble Complete Course`);
  }

  // Verify loop-back connection from Merge Section Data
  const mergeConnections = workflow.connections['Merge Section Data'];
  if (!mergeConnections || !mergeConnections.main || !mergeConnections.main[0]) {
    console.log(`   ⚠️  WARNING: Merge Section Data has no connections`);
    if (!workflow.connections['Merge Section Data']) {
      workflow.connections['Merge Section Data'] = { main: [[]] };
    }
    if (!workflow.connections['Merge Section Data'].main) {
      workflow.connections['Merge Section Data'].main = [[]];
    }
    if (!workflow.connections['Merge Section Data'].main[0]) {
      workflow.connections['Merge Section Data'].main[0] = [];
    }
  }

  const mergeOutput = workflow.connections['Merge Section Data']?.main?.[0] || [];
  const hasLoopBack = mergeOutput.some(conn => conn.node === 'Loop Sections');

  if (!hasLoopBack) {
    console.log(`   🔧 Adding loop-back connection: Merge Section Data → Loop Sections`);
    workflow.connections['Merge Section Data'].main![0].push({
      node: 'Loop Sections',
      type: 'main',
      index: 0
    });
    changes.push('Connected Merge Section Data back to Loop Sections');
  } else {
    console.log(`   ✅ Loop-back connection already present`);
  }

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
  console.log('🚀 n8n Loop Connections Fix Script\n');
  console.log(`Workflow ID: ${WORKFLOW_ID}`);
  console.log(`n8n Host: ${N8N_HOST}\n`);
  console.log('─'.repeat(60));

  try {
    // Step 1: Fetch workflow
    const workflow = await fetchWorkflow();

    // Step 2: Save backup
    const backupPath = `workflow-backup-loop-${Date.now()}.json`;
    const fs = require('fs');
    const path = require('path');
    const fullPath = path.join(process.cwd(), 'scripts', backupPath);
    fs.writeFileSync(fullPath, JSON.stringify(workflow, null, 2));
    console.log(`\n💾 Backup saved to: scripts/${backupPath}`);

    // Step 3: Fix loop connections
    const result = fixLoopConnections(workflow);

    if (!result.fixed) {
      console.log('\n❌ Could not fix workflow automatically');
      console.log('Please check the workflow manually in n8n UI');
      process.exit(1);
    }

    if (result.changes.length === 0) {
      console.log('\n✨ Loop connections are already configured correctly!');
      console.log('No changes needed.');
      return;
    }

    // Step 4: Update workflow
    await updateWorkflow(workflow);

    console.log('\n─'.repeat(60));
    console.log('✅ SUCCESS! Loop connections have been fixed.\n');
    console.log('The loop should now iterate through all 5 sections.');
    console.log('Expected behavior:');
    console.log('  - Loop Sections sends each section to Extract Section');
    console.log('  - Each section gets AI content and quiz generated');
    console.log('  - Merge Section Data loops back to Loop Sections');
    console.log('  - After all sections, Loop goes to Done Branch\n');
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
