/**
 * n8n Workflow Supabase Credentials Fix
 *
 * Updates "Save to Database" and "Update Proposal Status" nodes
 * to use service role key instead of anon key for write operations
 */

const N8N_HOST = 'https://n8n-production-30ce.up.railway.app';
const N8N_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1NzgzYzZkNC0wN2VlLTQ4Y2YtYTQ0NS0xNjA5ZWNhMjMxOTEiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzYyNzc4MjIxLCJleHAiOjE3NzA1MjY4MDB9.33txPypsZvgEwpvKkcBnaSkGJHQErFBBJmfrHGI3mTw';
const WORKFLOW_ID = 'FimIaNZ66cEz96GM';

// Supabase keys
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNhdmh0dmtnanRraXFucXl0cHB5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc4NjYyNDgsImV4cCI6MjA3MzQ0MjI0OH0.VED7UniItQntWv5hRo0QcToctD0TujvWBRSWkdhMLSU';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNhdmh0dmtnanRraXFucXl0cHB5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Nzg2NjI0OCwiZXhwIjoyMDczNDQyMjQ4fQ.NoGk_DwqPoe2Qap7dnjxHtkr3JHt8w1cqaBAiQXyXeo';

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

function fixSupabaseCredentials(workflow: N8nWorkflow): { fixed: boolean; changes: string[] } {
  console.log('\n🔍 Analyzing Supabase credentials...\n');

  const changes: string[] = [];

  // Nodes that need service role key for write operations
  const writeNodes = [
    'Save to Database',
    'Update Proposal Status'
  ];

  for (const nodeName of writeNodes) {
    const node = workflow.nodes.find(n => n.name === nodeName);

    if (!node) {
      console.log(`⚠️  Node not found: ${nodeName}`);
      continue;
    }

    console.log(`\n📝 Checking node: ${nodeName}`);

    // Check if node has headerParameters
    if (!node.parameters?.headerParameters?.parameters) {
      console.log(`   ⚠️  No headerParameters found`);
      continue;
    }

    const headers = node.parameters.headerParameters.parameters;
    let updated = false;

    // Update apikey header
    const apikeyHeader = headers.find((h: any) => h.name === 'apikey');
    if (apikeyHeader && apikeyHeader.value === ANON_KEY) {
      console.log(`   🔧 Updating apikey to service role key`);
      apikeyHeader.value = SERVICE_ROLE_KEY;
      updated = true;
    }

    // Update Authorization header
    const authHeader = headers.find((h: any) => h.name === 'Authorization');
    if (authHeader && authHeader.value === `Bearer ${ANON_KEY}`) {
      console.log(`   🔧 Updating Authorization to service role key`);
      authHeader.value = `Bearer ${SERVICE_ROLE_KEY}`;
      updated = true;
    }

    if (updated) {
      changes.push(`Updated ${nodeName} to use service role key`);
      console.log(`   ✅ ${nodeName} updated`);
    } else {
      console.log(`   ℹ️  ${nodeName} already using service role key or no changes needed`);
    }
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
  console.log('🚀 n8n Supabase Credentials Fix Script\n');
  console.log(`Workflow ID: ${WORKFLOW_ID}`);
  console.log(`n8n Host: ${N8N_HOST}\n`);
  console.log('─'.repeat(60));

  try {
    // Step 1: Fetch workflow
    const workflow = await fetchWorkflow();

    // Step 2: Save backup
    const backupPath = `workflow-backup-creds-${Date.now()}.json`;
    const fs = require('fs');
    const path = require('path');
    const fullPath = path.join(process.cwd(), 'scripts', backupPath);
    fs.writeFileSync(fullPath, JSON.stringify(workflow, null, 2));
    console.log(`\n💾 Backup saved to: scripts/${backupPath}`);

    // Step 3: Fix credentials
    const result = fixSupabaseCredentials(workflow);

    if (!result.fixed) {
      console.log('\n❌ Could not fix workflow automatically');
      console.log('Please check the workflow manually in n8n UI');
      process.exit(1);
    }

    if (result.changes.length === 0) {
      console.log('\n✨ Credentials are already configured correctly!');
      console.log('No changes needed.');
      return;
    }

    // Step 4: Update workflow
    await updateWorkflow(workflow);

    console.log('\n─'.repeat(60));
    console.log('✅ SUCCESS! Supabase credentials have been updated.\n');
    console.log('Write operations will now use service role key.');
    console.log('This allows bypassing RLS policies for system operations.\n');
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
