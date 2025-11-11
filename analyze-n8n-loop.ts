/**
 * n8n Loop Analyzer
 *
 * Analyzes exported n8n workflow JSON to diagnose loop iteration issues
 *
 * Usage:
 *   1. Export workflow from n8n UI
 *   2. Save as: n8n-workflow-content-generation.json
 *   3. Run: npx ts-node analyze-n8n-loop.ts
 */

import * as fs from 'fs';
import * as path from 'path';

interface N8nNode {
  id: string;
  name: string;
  type: string;
  parameters: any;
  position: [number, number];
  typeVersion?: number;
  disabled?: boolean;
  notes?: string;
}

interface N8nConnection {
  node: string;
  type: string;
  index: number;
}

interface N8nWorkflow {
  name: string;
  nodes: N8nNode[];
  connections: {
    [nodeName: string]: {
      main: N8nConnection[][][];
    };
  };
  settings?: any;
}

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function log(message: string, color: string = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function analyzeWorkflow(workflowPath: string) {
  log('\n=== n8n Loop Iteration Analyzer ===\n', colors.bright);

  // Read workflow JSON
  if (!fs.existsSync(workflowPath)) {
    log(`❌ ERROR: File not found: ${workflowPath}`, colors.red);
    log('\nPlease export your workflow from n8n and save it as:', colors.yellow);
    log('  n8n-workflow-content-generation.json', colors.cyan);
    process.exit(1);
  }

  const workflow: N8nWorkflow = JSON.parse(fs.readFileSync(workflowPath, 'utf-8'));
  log(`📋 Workflow: ${workflow.name}`, colors.cyan);
  log(`📊 Total nodes: ${workflow.nodes.length}\n`, colors.cyan);

  // Find Split in Batches nodes
  const splitInBatchesNodes = workflow.nodes.filter(
    node => node.type === 'n8n-nodes-base.splitInBatches'
  );

  if (splitInBatchesNodes.length === 0) {
    log('❌ No "Split in Batches" nodes found in workflow', colors.red);
    process.exit(1);
  }

  log(`🔍 Found ${splitInBatchesNodes.length} Split in Batches node(s)\n`, colors.green);

  // Analyze each Split in Batches node
  splitInBatchesNodes.forEach((loopNode, index) => {
    log(`\n${'='.repeat(60)}`, colors.blue);
    log(`Loop ${index + 1}: ${loopNode.name}`, colors.bright);
    log('='.repeat(60), colors.blue);

    // Check node configuration
    log('\n1️⃣  Node Configuration:', colors.cyan);
    const batchSize = loopNode.parameters?.batchSize;
    const options = loopNode.parameters?.options || {};

    log(`   Batch Size: ${batchSize ?? 'NOT SET'} ${batchSize === 1 ? '✅' : '❌'}`,
        batchSize === 1 ? colors.green : colors.red);
    log(`   Type Version: ${loopNode.typeVersion ?? 'unknown'}`, colors.reset);

    if (options.reset !== undefined) {
      log(`   Reset: ${options.reset ? 'ON' : 'OFF'} ${options.reset ? '⚠️' : '✅'}`,
          options.reset ? colors.yellow : colors.green);
    } else {
      log(`   Reset: NOT SET ✅`, colors.green);
    }

    // Check disabled state
    if (loopNode.disabled) {
      log(`   ⚠️  WARNING: Node is DISABLED`, colors.yellow);
    }

    // Check connections
    log('\n2️⃣  Connections:', colors.cyan);
    const connections = workflow.connections[loopNode.name];

    if (!connections || !connections.main) {
      log(`   ❌ ERROR: No connections defined for this node`, colors.red);
      return;
    }

    // Output 0 (loop) connections
    const loopConnections = connections.main[0] || [];
    const doneConnections = connections.main[1] || [];

    log(`   Output 0 (loop): ${loopConnections.length} connection(s)`, colors.reset);
    loopConnections.forEach((connGroup, idx) => {
      connGroup.forEach(conn => {
        const targetNode = workflow.nodes.find(n => n.name === conn.node);
        const disabled = targetNode?.disabled ? ' [DISABLED]' : '';
        log(`     → ${conn.node}${disabled}`, disabled ? colors.yellow : colors.green);

        // Check if target node exists
        if (!targetNode) {
          log(`       ❌ ERROR: Target node not found!`, colors.red);
        }
      });
    });

    log(`   Output 1 (done): ${doneConnections.length} connection(s)`, colors.reset);
    doneConnections.forEach((connGroup, idx) => {
      connGroup.forEach(conn => {
        const targetNode = workflow.nodes.find(n => n.name === conn.node);
        const disabled = targetNode?.disabled ? ' [DISABLED]' : '';
        log(`     → ${conn.node}${disabled}`, disabled ? colors.yellow : colors.green);
      });
    });

    // Check for loop back connection
    log('\n3️⃣  Loop Back Connection:', colors.cyan);
    let hasLoopBack = false;

    if (loopConnections.length > 0) {
      const firstLoopTarget = loopConnections[0]?.[0]?.node;
      if (firstLoopTarget) {
        // Traverse the connection graph to find if it loops back
        const visited = new Set<string>();
        const queue = [firstLoopTarget];

        while (queue.length > 0) {
          const currentNode = queue.shift()!;

          if (currentNode === loopNode.name) {
            hasLoopBack = true;
            break;
          }

          if (visited.has(currentNode)) continue;
          visited.add(currentNode);

          const nodeConnections = workflow.connections[currentNode];
          if (nodeConnections?.main) {
            nodeConnections.main.forEach(outputConnections => {
              outputConnections?.forEach(connGroup => {
                connGroup.forEach(conn => {
                  queue.push(conn.node);
                });
              });
            });
          }
        }
      }
    }

    log(`   Loop back exists: ${hasLoopBack ? '✅ YES' : '❌ NO'}`,
        hasLoopBack ? colors.green : colors.red);

    // Analyze first node in loop (most likely to have issues)
    if (loopConnections.length > 0 && loopConnections[0].length > 0) {
      const firstLoopTargetName = loopConnections[0][0].node;
      const firstLoopTarget = workflow.nodes.find(n => n.name === firstLoopTargetName);

      if (firstLoopTarget) {
        log(`\n4️⃣  First Node in Loop: ${firstLoopTarget.name}`, colors.cyan);
        log(`   Type: ${firstLoopTarget.type}`, colors.reset);
        log(`   Disabled: ${firstLoopTarget.disabled ? 'YES ❌' : 'NO ✅'}`,
            firstLoopTarget.disabled ? colors.red : colors.green);

        // Check execution mode for Code nodes
        if (firstLoopTarget.type === 'n8n-nodes-base.code') {
          const mode = firstLoopTarget.parameters?.mode || 'runOnceForEachItem';
          log(`   Execution Mode: ${mode}`, colors.reset);

          if (mode === 'runOnceForAllItems') {
            log(`     ⚠️  WARNING: Should be "runOnceForEachItem" for loop iteration`, colors.yellow);
          } else {
            log(`     ✅ Correct mode for loop`, colors.green);
          }
        }

        // Check for "continueOnFail" setting
        if (firstLoopTarget.parameters?.continueOnFail) {
          log(`   ⚠️  WARNING: Continue on Fail is enabled`, colors.yellow);
        }

        // Check for "alwaysOutputData" setting
        if (firstLoopTarget.parameters?.alwaysOutputData) {
          log(`   ⚠️  WARNING: Always Output Data is enabled`, colors.yellow);
        }
      }
    }

    // Check for common issues
    log('\n5️⃣  Common Issues Check:', colors.cyan);
    const issues: string[] = [];

    if (batchSize !== 1) {
      issues.push('Batch size is not set to 1');
    }

    if (!hasLoopBack) {
      issues.push('No loop back connection found');
    }

    if (loopNode.disabled) {
      issues.push('Loop node is disabled');
    }

    if (loopConnections.length === 0) {
      issues.push('No connections from loop output (output 0)');
    }

    if (options.alwaysOutputData) {
      issues.push('"Always Output Data" is enabled (should be OFF)');
    }

    if (issues.length === 0) {
      log(`   ✅ No obvious configuration issues found`, colors.green);
    } else {
      log(`   ❌ Found ${issues.length} issue(s):`, colors.red);
      issues.forEach(issue => {
        log(`     • ${issue}`, colors.red);
      });
    }
  });

  // Summary
  log('\n\n=== Summary ===\n', colors.bright);

  const totalIssues = splitInBatchesNodes.reduce((count, node) => {
    let issues = 0;
    if (node.parameters?.batchSize !== 1) issues++;
    if (node.disabled) issues++;
    return count + issues;
  }, 0);

  if (totalIssues === 0) {
    log('✅ All loop configurations look correct', colors.green);
    log('\nIf loop still doesn\'t work, this is likely:', colors.yellow);
    log('  1. An n8n version-specific bug', colors.yellow);
    log('  2. A workflow state corruption issue', colors.yellow);
    log('  3. A data format mismatch between nodes', colors.yellow);
    log('\nRecommended actions:', colors.cyan);
    log('  • Try duplicating the workflow to a fresh instance', colors.reset);
    log('  • Test with a minimal loop (see debugging guide)', colors.reset);
    log('  • Check n8n version and upgrade to latest', colors.reset);
    log('  • Review the detailed debugging guide: n8n-loop-debugging-guide.md', colors.reset);
  } else {
    log(`❌ Found ${totalIssues} configuration issue(s)`, colors.red);
    log('\nFix these issues and test again.', colors.yellow);
  }

  log('\n');
}

// Main execution
const workflowPath = process.argv[2] || path.join(__dirname, 'n8n-workflow-content-generation.json');

try {
  analyzeWorkflow(workflowPath);
} catch (error) {
  log('\n❌ ERROR analyzing workflow:', colors.red);
  if (error instanceof Error) {
    log(error.message, colors.red);
    if (error.stack) {
      log('\nStack trace:', colors.yellow);
      log(error.stack, colors.reset);
    }
  }
  process.exit(1);
}
