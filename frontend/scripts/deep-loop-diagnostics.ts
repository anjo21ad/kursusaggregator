/**
 * Deep Loop Diagnostics - Comprehensive analysis of Loop Sections issue
 *
 * This script performs detailed inspection of:
 * - Loop Sections (Split in Batches) configuration
 * - Extract Section configuration
 * - Connection details and metadata
 * - Execution flow settings
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
  disabled?: boolean;
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
  console.log('📥 Fetching workflow from n8n API...\n');
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
  return workflow;
}

function analyzeLoopSections(workflow: N8nWorkflow) {
  console.log('🔍 ANALYZING LOOP SECTIONS NODE\n');
  console.log('═'.repeat(60));

  const loopNode = workflow.nodes.find(n => n.name === 'Loop Sections');
  if (!loopNode) {
    console.log('❌ ERROR: Loop Sections node not found!');
    return;
  }

  console.log('\n📋 BASIC INFO:');
  console.log(`   Node ID: ${loopNode.id}`);
  console.log(`   Node Type: ${loopNode.type}`);
  console.log(`   Type Version: ${loopNode.typeVersion || 'default'}`);
  console.log(`   Disabled: ${loopNode.disabled ? '❌ YES - NODE IS DISABLED!' : '✅ No'}`);
  console.log(`   Position: [${loopNode.position[0]}, ${loopNode.position[1]}]`);

  console.log('\n⚙️  PARAMETERS:');
  console.log(JSON.stringify(loopNode.parameters, null, 2));

  console.log('\n🔌 OUTPUTS:');
  const connections = workflow.connections['Loop Sections'];
  if (!connections || !connections.main) {
    console.log('   ❌ NO CONNECTIONS FOUND!');
    return;
  }

  console.log(`   Total outputs: ${connections.main.length}`);

  connections.main.forEach((output, idx) => {
    console.log(`\n   Output ${idx} (${idx === 0 ? 'loop' : 'done'}):`);
    if (!output || output.length === 0) {
      console.log('      ⚠️  No connections');
    } else {
      output.forEach((conn, connIdx) => {
        console.log(`      ${connIdx + 1}. → ${conn.node} (type: ${conn.type}, index: ${conn.index})`);
      });
    }
  });

  console.log('\n═'.repeat(60));
}

function analyzeExtractSection(workflow: N8nWorkflow) {
  console.log('\n🔍 ANALYZING EXTRACT SECTION NODE\n');
  console.log('═'.repeat(60));

  const extractNode = workflow.nodes.find(n => n.name === 'Extract Section');
  if (!extractNode) {
    console.log('❌ ERROR: Extract Section node not found!');
    return;
  }

  console.log('\n📋 BASIC INFO:');
  console.log(`   Node ID: ${extractNode.id}`);
  console.log(`   Node Type: ${extractNode.type}`);
  console.log(`   Type Version: ${extractNode.typeVersion || 'default'}`);
  console.log(`   Disabled: ${extractNode.disabled ? '❌ YES - NODE IS DISABLED!' : '✅ No'}`);
  console.log(`   Position: [${extractNode.position[0]}, ${extractNode.position[1]}]`);

  console.log('\n⚙️  PARAMETERS:');
  console.log(JSON.stringify(extractNode.parameters, null, 2));

  console.log('\n🔌 INPUTS:');
  // Find which nodes connect TO Extract Section
  const inputConnections: Array<{ from: string; output: number }> = [];
  for (const [nodeName, nodeConns] of Object.entries(workflow.connections)) {
    if (nodeConns.main) {
      nodeConns.main.forEach((outputArr, outputIdx) => {
        outputArr?.forEach(conn => {
          if (conn.node === 'Extract Section') {
            inputConnections.push({ from: nodeName, output: outputIdx });
          }
        });
      });
    }
  }

  if (inputConnections.length === 0) {
    console.log('   ❌ NO INPUT CONNECTIONS FOUND!');
  } else {
    inputConnections.forEach((conn, idx) => {
      console.log(`   ${idx + 1}. ${conn.from} (output ${conn.output})`);
    });
  }

  console.log('\n🔌 OUTPUTS:');
  const connections = workflow.connections['Extract Section'];
  if (!connections || !connections.main || connections.main[0]?.length === 0) {
    console.log('   ⚠️  No output connections');
  } else {
    connections.main[0]?.forEach((conn, idx) => {
      console.log(`   ${idx + 1}. → ${conn.node} (type: ${conn.type}, index: ${conn.index})`);
    });
  }

  console.log('\n═'.repeat(60));
}

function analyzeNodeSettings(workflow: N8nWorkflow) {
  console.log('\n🔍 ANALYZING NODE SETTINGS\n');
  console.log('═'.repeat(60));

  const criticalNodes = [
    'Loop Sections',
    'Extract Section',
    'Generate Section Content',
    'Generate Section Quiz',
    'Merge Section Data'
  ];

  criticalNodes.forEach(nodeName => {
    const node = workflow.nodes.find(n => n.name === nodeName);
    if (!node) {
      console.log(`\n⚠️  ${nodeName}: NOT FOUND`);
      return;
    }

    console.log(`\n📌 ${nodeName}:`);
    console.log(`   Type: ${node.type}`);
    console.log(`   Disabled: ${node.disabled ? '❌ YES' : '✅ No'}`);

    if (node.parameters?.mode) {
      console.log(`   Mode: ${node.parameters.mode}`);
    }

    if (node.type === 'n8n-nodes-base.splitInBatches') {
      console.log(`   Batch Size: ${node.parameters?.batchSize || 'not set'}`);
      console.log(`   Options:`);
      console.log(`      ${JSON.stringify(node.parameters?.options || {}, null, 6)}`);
    }
  });

  console.log('\n═'.repeat(60));
}

function checkWorkflowSettings(workflow: N8nWorkflow) {
  console.log('\n🔍 ANALYZING WORKFLOW SETTINGS\n');
  console.log('═'.repeat(60));

  console.log('\n⚙️  Workflow Settings:');
  if (workflow.settings) {
    console.log(JSON.stringify(workflow.settings, null, 2));
  } else {
    console.log('   No custom settings');
  }

  console.log('\n📊 Static Data:');
  if (workflow.staticData && Object.keys(workflow.staticData).length > 0) {
    console.log(JSON.stringify(workflow.staticData, null, 2));
  } else {
    console.log('   No static data');
  }

  console.log('\n═'.repeat(60));
}

function analyzeLoopPath(workflow: N8nWorkflow) {
  console.log('\n🔍 ANALYZING COMPLETE LOOP PATH\n');
  console.log('═'.repeat(60));

  const loopPath = [
    'Loop Sections',
    'Extract Section',
    'Generate Section Content',
    'Generate Section Quiz',
    'Merge Section Data'
  ];

  console.log('\n🔄 Expected Loop Flow:');
  console.log('   Loop Sections (output 0: loop) → Extract Section');
  console.log('   Extract Section → Generate Section Content');
  console.log('   Extract Section → Generate Section Quiz');
  console.log('   Generate Section Content → Merge Responses (input 0)');
  console.log('   Generate Section Quiz → Merge Responses (input 1)');
  console.log('   Merge Responses → Merge Section Data');
  console.log('   Merge Section Data → Loop Sections (loop back)');
  console.log('   Loop Sections (output 1: done) → Assemble Complete Course');

  console.log('\n✅ Actual Connections:');

  // Check Loop Sections outputs
  const loopConns = workflow.connections['Loop Sections'];
  if (loopConns?.main) {
    console.log('\n   Loop Sections outputs:');
    loopConns.main.forEach((output, idx) => {
      const label = idx === 0 ? 'loop' : 'done';
      console.log(`      Output ${idx} (${label}):`);
      output?.forEach(conn => {
        console.log(`         → ${conn.node}`);
      });
    });
  }

  // Check Extract Section outputs
  const extractConns = workflow.connections['Extract Section'];
  if (extractConns?.main && extractConns.main[0]) {
    console.log('\n   Extract Section outputs:');
    extractConns.main[0].forEach(conn => {
      console.log(`      → ${conn.node}`);
    });
  } else {
    console.log('\n   ⚠️  Extract Section: NO OUTPUTS FOUND');
  }

  // Check Merge Section Data loop back
  const mergeConns = workflow.connections['Merge Section Data'];
  if (mergeConns?.main && mergeConns.main[0]) {
    console.log('\n   Merge Section Data outputs:');
    mergeConns.main[0].forEach(conn => {
      console.log(`      → ${conn.node}`);
    });
  }

  console.log('\n═'.repeat(60));
}

async function main() {
  console.log('🚀 DEEP LOOP DIAGNOSTICS\n');
  console.log(`Workflow ID: ${WORKFLOW_ID}`);
  console.log(`n8n Host: ${N8N_HOST}\n`);
  console.log('═'.repeat(60));

  try {
    const workflow = await fetchWorkflow();

    // Run all diagnostic checks
    analyzeLoopSections(workflow);
    analyzeExtractSection(workflow);
    analyzeNodeSettings(workflow);
    checkWorkflowSettings(workflow);
    analyzeLoopPath(workflow);

    console.log('\n' + '═'.repeat(60));
    console.log('✅ DIAGNOSTICS COMPLETE');
    console.log('═'.repeat(60));

  } catch (error) {
    console.error('\n❌ ERROR:', error);
    process.exit(1);
  }
}

main();
