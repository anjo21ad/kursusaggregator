/**
 * n8n Workflow Loop Diagnostics
 *
 * This script inspects the Content Generation Pipeline workflow
 * to diagnose why the "Loop Sections" node is not iterating.
 */

import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const N8N_API_URL = process.env.N8N_API_URL || 'https://n8n-production-30ce.up.railway.app';
const N8N_API_KEY = process.env.N8N_API_KEY;
const WORKFLOW_ID = 'FimIaNZ66cEz96GM'; // Content Generation Pipeline

interface N8nNode {
  id: string;
  name: string;
  type: string;
  parameters: any;
  position: [number, number];
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
}

async function fetchWorkflow(): Promise<N8nWorkflow> {
  const response = await fetch(`${N8N_API_URL}/api/v1/workflows/${WORKFLOW_ID}`, {
    method: 'GET',
    headers: {
      'X-N8N-API-KEY': N8N_API_KEY!,
      'Accept': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch workflow: ${response.status} ${response.statusText}`);
  }

  return await response.json();
}

function analyzeLoopConfiguration(workflow: N8nWorkflow) {
  console.log('🔍 Analyzing Loop Configuration...\n');

  // Find the Loop Sections node
  const loopNode = workflow.nodes.find(node =>
    node.name === 'Loop Sections' ||
    node.type === 'n8n-nodes-base.splitInBatches'
  );

  if (!loopNode) {
    console.log('❌ ERROR: Could not find "Loop Sections" node');
    return;
  }

  console.log('✅ Found Loop Node:');
  console.log(`   Name: ${loopNode.name}`);
  console.log(`   Type: ${loopNode.type}`);
  console.log(`   ID: ${loopNode.id}`);
  console.log(`   Parameters:`, JSON.stringify(loopNode.parameters, null, 2));
  console.log('');

  // Check batch size
  const batchSize = loopNode.parameters?.batchSize;
  console.log(`   Batch Size: ${batchSize || 'NOT SET ⚠️'}`);

  if (!batchSize || batchSize < 1) {
    console.log('   ⚠️  WARNING: batchSize should be 1 or higher');
  }
  console.log('');

  // Check connections FROM the loop node
  const loopConnections = workflow.connections[loopNode.name];
  console.log('📊 Connections FROM Loop Node:');

  if (!loopConnections || !loopConnections.main) {
    console.log('   ❌ ERROR: No connections found from Loop Node');
    return;
  }

  // Split in Batches has TWO outputs:
  // - Output 0: Loop iteration (continues processing)
  // - Output 1: Done (when all batches processed)
  console.log(`   Output 0 (Loop Iteration):`, loopConnections.main[0] || 'NOT CONNECTED ⚠️');
  console.log(`   Output 1 (Done):`, loopConnections.main[1] || 'NOT CONNECTED ⚠️');
  console.log('');

  // Find what connects BACK to the loop node
  console.log('🔁 Connections TO Loop Node (Loop Back):');
  let hasLoopBack = false;

  for (const [sourceName, connections] of Object.entries(workflow.connections)) {
    if (connections.main) {
      for (const outputIndex in connections.main) {
        const outputConnections = connections.main[outputIndex];
        for (const connection of outputConnections) {
          if (connection.node === loopNode.name) {
            console.log(`   ✅ ${sourceName} → ${loopNode.name} (output ${outputIndex}, input ${connection.index})`);
            hasLoopBack = true;
          }
        }
      }
    }
  }

  if (!hasLoopBack) {
    console.log('   ❌ ERROR: No node connects back to the loop!');
    console.log('   🔧 FIX: You need to connect the last node in the loop back to "Loop Sections"');
  }
  console.log('');

  // Trace the loop path
  console.log('🛤️  Loop Path:');
  if (loopConnections.main[0] && loopConnections.main[0].length > 0) {
    const firstNodeInLoop = loopConnections.main[0][0].node;
    console.log(`   1. Loop Sections (output 0) → ${firstNodeInLoop}`);

    let currentNode = firstNodeInLoop;
    let depth = 2;
    let visited = new Set<string>();

    while (currentNode && depth < 20 && !visited.has(currentNode)) {
      visited.add(currentNode);
      const connections = workflow.connections[currentNode];

      if (connections?.main?.[0]?.[0]) {
        const nextNode = connections.main[0][0].node;
        console.log(`   ${depth}. ${currentNode} → ${nextNode}`);

        if (nextNode === loopNode.name) {
          console.log(`   ✅ Loop closes correctly!`);
          break;
        }

        currentNode = nextNode;
        depth++;
      } else {
        console.log(`   ❌ ${currentNode} → (NO CONNECTION)`);
        console.log(`   🔧 FIX: "${currentNode}" should connect back to "${loopNode.name}"`);
        break;
      }
    }
  } else {
    console.log('   ❌ Loop output 0 is not connected to any node');
  }
  console.log('');

  // Check the "Done" path
  console.log('✅ Done Path:');
  if (loopConnections.main[1] && loopConnections.main[1].length > 0) {
    const doneNode = loopConnections.main[1][0].node;
    console.log(`   Loop Sections (output 1 - Done) → ${doneNode}`);
  } else {
    console.log('   ⚠️  Done output (output 1) is not connected');
  }
  console.log('');
}

function generateFixInstructions(workflow: N8nWorkflow) {
  console.log('🔧 FIX INSTRUCTIONS:\n');
  console.log('The "Split in Batches" node requires a proper loop setup:');
  console.log('');
  console.log('1. **Output 0 (Loop)** should connect to the first node in your loop');
  console.log('   Example: Loop Sections → Extract Section');
  console.log('');
  console.log('2. **The last node in the loop** should connect BACK to Loop Sections');
  console.log('   Example: Merge Section Data → Loop Sections (input 0)');
  console.log('');
  console.log('3. **Output 1 (Done)** should connect to the node that runs after the loop finishes');
  console.log('   Example: Loop Sections → Assemble Complete Course');
  console.log('');
  console.log('Visual representation:');
  console.log('');
  console.log('┌─────────────────┐');
  console.log('│ Validate & Prep │');
  console.log('└────────┬────────┘');
  console.log('         │');
  console.log('         ▼');
  console.log('┌─────────────────┐ output 0 (loop)  ┌──────────────┐');
  console.log('│  Loop Sections  ├─────────────────→│ Extract Sect │');
  console.log('│                 │                   └──────┬───────┘');
  console.log('│  (Split in      │                          │');
  console.log('│   Batches)      │                          ▼');
  console.log('│                 │                   ┌──────────────┐');
  console.log('│                 │◄──────────────────┤ Merge Section│ (loops back)');
  console.log('│                 │ input 0           └──────────────┘');
  console.log('│                 │');
  console.log('│                 │ output 1 (done)');
  console.log('└────────┬────────┘');
  console.log('         │');
  console.log('         ▼');
  console.log('┌─────────────────┐');
  console.log('│ Assemble Course │');
  console.log('└─────────────────┘');
  console.log('');
  console.log('To fix in n8n UI:');
  console.log('1. Delete the connection from Loop Sections output 1 → next node');
  console.log('2. Connect Loop Sections output 0 → Extract Section');
  console.log('3. Find the last node in your loop (probably "Merge Section Data")');
  console.log('4. Connect that node → Loop Sections (it will auto-connect to input 0)');
  console.log('5. Connect Loop Sections output 1 → Assemble Complete Course');
  console.log('');
}

async function main() {
  console.log('🚀 n8n Loop Diagnostics Tool\n');
  console.log(`Workflow ID: ${WORKFLOW_ID}`);
  console.log(`n8n URL: ${N8N_API_URL}\n`);

  if (!N8N_API_KEY) {
    console.error('❌ ERROR: N8N_API_KEY not found in .env.local');
    process.exit(1);
  }

  try {
    const workflow = await fetchWorkflow();
    console.log(`✅ Fetched workflow: ${workflow.name}\n`);
    console.log(`Total nodes: ${workflow.nodes.length}`);
    console.log('─'.repeat(60));
    console.log('');

    analyzeLoopConfiguration(workflow);
    generateFixInstructions(workflow);

    console.log('─'.repeat(60));
    console.log('');
    console.log('💡 NEXT STEPS:');
    console.log('1. Open n8n UI: https://n8n-production-30ce.up.railway.app');
    console.log('2. Edit the "CourseHub - Content Generation Pipeline" workflow');
    console.log('3. Fix the connections as described above');
    console.log('4. Save and test the workflow');
    console.log('');

  } catch (error) {
    console.error('❌ ERROR:', error);
    process.exit(1);
  }
}

main();
