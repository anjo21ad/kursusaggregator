#!/usr/bin/env python3
"""
N8N Loop Analyzer - Python version
Analyzes n8n workflow JSON for loop configuration issues
"""

import json
import sys

# Colors
class Color:
    RESET = '\033[0m'
    BRIGHT = '\033[1m'
    RED = '\033[31m'
    GREEN = '\033[32m'
    YELLOW = '\033[33m'
    CYAN = '\033[36m'

def log(message, color=Color.RESET):
    print(f"{color}{message}{Color.RESET}")

def analyze_workflow(workflow_path):
    log("\n=== n8n Loop Iteration Analyzer ===\n", Color.BRIGHT)

    # Read workflow JSON
    try:
        with open(workflow_path, 'r', encoding='utf-8') as f:
            workflow = json.load(f)
    except FileNotFoundError:
        log(f"❌ ERROR: File not found: {workflow_path}", Color.RED)
        return False
    except json.JSONDecodeError as e:
        log(f"❌ ERROR: Invalid JSON: {e}", Color.RED)
        return False

    log(f"📋 Workflow: {workflow['name']}", Color.CYAN)
    log(f"📊 Total nodes: {len(workflow['nodes'])}\n", Color.CYAN)

    # Find Split in Batches nodes
    loop_nodes = [n for n in workflow['nodes'] if n['type'] == 'n8n-nodes-base.splitInBatches']

    if not loop_nodes:
        log("❌ No 'Split in Batches' nodes found", Color.RED)
        return False

    log(f"🔍 Found {len(loop_nodes)} Split in Batches node(s)\n", Color.GREEN)

    issues_found = []

    for idx, loop_node in enumerate(loop_nodes):
        log(f"\n{'='*60}", Color.CYAN)
        log(f"Loop {idx+1}: {loop_node['name']}", Color.BRIGHT)
        log('='*60, Color.CYAN)

        # Check node configuration
        log("\n1️⃣  Node Configuration:", Color.CYAN)

        params = loop_node.get('parameters', {})
        options = params.get('options', {})
        batch_size = params.get('batchSize')

        # Check batch size
        if batch_size is None:
            log(f"   Batch Size: NOT SET (using default) ❌", Color.RED)
            log(f"   ⚠️  WARNING: Batch size must be explicitly set to 1", Color.YELLOW)
            issues_found.append(f"{loop_node['name']}: Batch size not set")
        elif batch_size == 1:
            log(f"   Batch Size: {batch_size} ✅", Color.GREEN)
        else:
            log(f"   Batch Size: {batch_size} ❌", Color.RED)
            issues_found.append(f"{loop_node['name']}: Batch size is {batch_size}, should be 1")

        # Check reset option
        reset = options.get('reset')
        if reset is not None:
            status = "ON" if reset else "OFF"
            color = Color.YELLOW if reset else Color.GREEN
            log(f"   Reset: {status} {'⚠️' if reset else '✅'}", color)
        else:
            log(f"   Reset: NOT SET ✅", Color.GREEN)

        # Check alwaysOutputData
        always_output = loop_node.get('alwaysOutputData')
        if always_output:
            log(f"   Always Output Data: ON ❌", Color.RED)
            issues_found.append(f"{loop_node['name']}: Always Output Data is enabled")
        else:
            log(f"   Always Output Data: OFF ✅", Color.GREEN)

        # Check disabled state
        if loop_node.get('disabled'):
            log(f"   ⚠️  WARNING: Node is DISABLED", Color.YELLOW)
            issues_found.append(f"{loop_node['name']}: Node is disabled")

        # Check connections
        log("\n2️⃣  Connections:", Color.CYAN)
        connections = workflow.get('connections', {}).get(loop_node['name'], {})
        main_connections = connections.get('main', [])

        if not main_connections or len(main_connections) < 2:
            log("   ❌ ERROR: Missing loop/done outputs", Color.RED)
            issues_found.append(f"{loop_node['name']}: Invalid connection structure")
            continue

        # Output 0 (loop)
        loop_conns = main_connections[0] if len(main_connections) > 0 else []
        done_conns = main_connections[1] if len(main_connections) > 1 else []

        log(f"   Output 0 (loop): {len(loop_conns)} connection(s)", Color.RESET)
        for conn_group in loop_conns:
            for conn in conn_group:
                target_name = conn['node']
                target_node = next((n for n in workflow['nodes'] if n['name'] == target_name), None)
                disabled = " [DISABLED]" if (target_node and target_node.get('disabled')) else ""
                color = Color.YELLOW if disabled else Color.GREEN
                log(f"     → {target_name}{disabled}", color)

        log(f"   Output 1 (done): {len(done_conns)} connection(s)", Color.RESET)
        for conn_group in done_conns:
            for conn in conn_group:
                target_name = conn['node']
                log(f"     → {target_name}", Color.GREEN)

        # Check loop back connection
        log("\n3️⃣  Loop Back Connection:", Color.CYAN)
        has_loop_back = False

        if loop_conns:
            first_target = loop_conns[0][0]['node'] if loop_conns[0] else None
            if first_target:
                # Simple check - does any node connect back to loop?
                visited = set()
                queue = [first_target]

                while queue and not has_loop_back:
                    current = queue.pop(0)
                    if current == loop_node['name']:
                        has_loop_back = True
                        break
                    if current in visited:
                        continue
                    visited.add(current)

                    node_conns = workflow.get('connections', {}).get(current, {}).get('main', [])
                    for output in node_conns:
                        for conn_group in output:
                            for conn in conn_group:
                                queue.append(conn['node'])

        color = Color.GREEN if has_loop_back else Color.RED
        log(f"   Loop back exists: {'✅ YES' if has_loop_back else '❌ NO'}", color)
        if not has_loop_back:
            issues_found.append(f"{loop_node['name']}: No loop back connection found")

        # Check first node in loop
        if loop_conns and loop_conns[0]:
            first_target_name = loop_conns[0][0]['node']
            first_target = next((n for n in workflow['nodes'] if n['name'] == first_target_name), None)

            if first_target:
                log(f"\n4️⃣  First Node in Loop: {first_target['name']}", Color.CYAN)
                log(f"   Type: {first_target['type']}", Color.RESET)

                if first_target.get('disabled'):
                    log(f"   Disabled: YES ❌", Color.RED)
                    issues_found.append(f"{first_target_name}: First node in loop is disabled")
                else:
                    log(f"   Disabled: NO ✅", Color.GREEN)

                # Check execution mode for Code nodes
                if first_target['type'] == 'n8n-nodes-base.code':
                    mode = first_target.get('parameters', {}).get('mode', 'runOnceForEachItem')
                    log(f"   Execution Mode: {mode}", Color.RESET)
                    if mode == 'runOnceForAllItems':
                        log(f"     ⚠️  WARNING: Should be 'runOnceForEachItem' for loop iteration", Color.YELLOW)
                    else:
                        log(f"     ✅ Correct mode for loop", Color.GREEN)

    # Summary
    log("\n\n=== Summary ===\n", Color.BRIGHT)

    if not issues_found:
        log("✅ All loop configurations look correct", Color.GREEN)
        log("\nIf loop still doesn't work, this is likely:", Color.YELLOW)
        log("  1. An n8n version-specific bug", Color.YELLOW)
        log("  2. A workflow state corruption issue", Color.YELLOW)
        log("  3. A data format mismatch between nodes", Color.YELLOW)
        return True
    else:
        log(f"❌ Found {len(issues_found)} configuration issue(s):", Color.RED)
        for issue in issues_found:
            log(f"  • {issue}", Color.RED)
        log("\nFix these issues and test again.", Color.YELLOW)
        return False

if __name__ == '__main__':
    workflow_path = sys.argv[1] if len(sys.argv) > 1 else 'n8n-workflow-content-generation.json'
    success = analyze_workflow(workflow_path)
    sys.exit(0 if success else 1)
