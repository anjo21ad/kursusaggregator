/**
 * Fetch n8n Workflow via API
 *
 * Fetches workflow JSON from n8n instance using API credentials
 *
 * Usage:
 *   N8N_API_KEY=your-key N8N_URL=https://your-n8n.app npx ts-node fetch-n8n-workflow.ts
 *
 * To get API key:
 *   1. Login to n8n
 *   2. Go to Settings → API
 *   3. Create new API key
 */

import * as https from 'https';
import * as fs from 'fs';

const N8N_URL = process.env.N8N_URL || 'https://n8n-production-30ce.up.railway.app';
const N8N_API_KEY = process.env.N8N_API_KEY;

interface N8nWorkflow {
  id: string;
  name: string;
  active: boolean;
  nodes: any[];
  connections: any;
  createdAt: string;
  updatedAt: string;
}

async function fetchWorkflows(): Promise<N8nWorkflow[]> {
  if (!N8N_API_KEY) {
    console.error('❌ ERROR: N8N_API_KEY environment variable not set');
    console.error('\nTo get your API key:');
    console.error('  1. Login to n8n');
    console.error('  2. Go to Settings → API');
    console.error('  3. Create new API key');
    console.error('\nThen run:');
    console.error(`  N8N_API_KEY=your-key npx ts-node ${__filename}`);
    process.exit(1);
  }

  const url = new URL(`/api/v1/workflows`, N8N_URL);

  return new Promise((resolve, reject) => {
    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname,
      method: 'GET',
      headers: {
        'X-N8N-API-KEY': N8N_API_KEY,
        'Accept': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode !== 200) {
          reject(new Error(`API returned status ${res.statusCode}: ${data}`));
          return;
        }

        try {
          const response = JSON.parse(data);
          resolve(response.data || response);
        } catch (err) {
          reject(new Error(`Failed to parse JSON: ${err}`));
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.end();
  });
}

async function fetchWorkflowById(id: string): Promise<N8nWorkflow> {
  const url = new URL(`/api/v1/workflows/${id}`, N8N_URL);

  return new Promise((resolve, reject) => {
    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname,
      method: 'GET',
      headers: {
        'X-N8N-API-KEY': N8N_API_KEY!,
        'Accept': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode !== 200) {
          reject(new Error(`API returned status ${res.statusCode}: ${data}`));
          return;
        }

        try {
          const workflow = JSON.parse(data);
          resolve(workflow);
        } catch (err) {
          reject(new Error(`Failed to parse JSON: ${err}`));
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.end();
  });
}

async function main() {
  console.log('🔍 Fetching workflows from n8n...\n');

  try {
    const workflows = await fetchWorkflows();

    console.log(`✅ Found ${workflows.length} workflow(s):\n`);

    workflows.forEach((workflow, index) => {
      console.log(`${index + 1}. ${workflow.name}`);
      console.log(`   ID: ${workflow.id}`);
      console.log(`   Active: ${workflow.active ? '✅ Yes' : '❌ No'}`);
      console.log(`   Nodes: ${workflow.nodes?.length || 0}`);
      console.log('');
    });

    // Find content generation workflow
    const contentGenWorkflow = workflows.find(w =>
      w.name.toLowerCase().includes('content') &&
      w.name.toLowerCase().includes('generation')
    );

    if (contentGenWorkflow) {
      console.log('🎯 Found Content Generation workflow!\n');
      console.log(`Fetching full details for: ${contentGenWorkflow.name}...\n`);

      const fullWorkflow = await fetchWorkflowById(contentGenWorkflow.id);

      const filename = 'n8n-workflow-content-generation.json';
      fs.writeFileSync(filename, JSON.stringify(fullWorkflow, null, 2));

      console.log(`✅ Saved to: ${filename}`);
      console.log(`\nNext steps:`);
      console.log(`  1. Run analyzer: npx ts-node analyze-n8n-loop.ts`);
      console.log(`  2. Review output for configuration issues`);
    } else {
      console.log('⚠️  Could not find "Content Generation" workflow automatically');
      console.log('\nIf you see it in the list above, you can fetch it manually:');
      console.log(`  N8N_WORKFLOW_ID=<id> npx ts-node ${__filename}`);
    }

  } catch (error) {
    console.error('\n❌ ERROR:', error instanceof Error ? error.message : error);

    if (error instanceof Error && error.message.includes('401')) {
      console.error('\n⚠️  Authentication failed - check your API key');
    } else if (error instanceof Error && error.message.includes('ENOTFOUND')) {
      console.error(`\n⚠️  Could not connect to ${N8N_URL}`);
      console.error('    Make sure the URL is correct and the server is running');
    }

    process.exit(1);
  }
}

// If specific workflow ID provided, fetch that one
const workflowId = process.env.N8N_WORKFLOW_ID || process.argv[2];

if (workflowId && workflowId !== __filename) {
  console.log(`🔍 Fetching workflow ${workflowId}...\n`);

  fetchWorkflowById(workflowId)
    .then(workflow => {
      const filename = `n8n-workflow-${workflow.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.json`;
      fs.writeFileSync(filename, JSON.stringify(workflow, null, 2));
      console.log(`✅ Saved to: ${filename}`);
      console.log(`\nNext steps:`);
      console.log(`  1. Run analyzer: npx ts-node analyze-n8n-loop.ts ${filename}`);
    })
    .catch(error => {
      console.error('❌ ERROR:', error instanceof Error ? error.message : error);
      process.exit(1);
    });
} else {
  main();
}
