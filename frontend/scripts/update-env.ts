/**
 * Environment File Update Utility
 *
 * Helper functions for programmatically updating .env files
 * Used by setup scripts to auto-configure environment variables
 */

import * as fs from 'fs';
import * as path from 'path';

export type EnvUpdate = {
  key: string;
  value: string;
  comment?: string;
};

/**
 * Update or add environment variable in .env file
 *
 * @param filePath - Path to .env file
 * @param updates - Array of key-value pairs to update
 */
export function updateEnvFile(
  filePath: string,
  updates: EnvUpdate[]
): void {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  let content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const updatedKeys = new Set<string>();

  // Update existing keys
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Skip comments and empty lines
    if (line.startsWith('#') || line === '') continue;

    // Check if this line contains a key we want to update
    for (const update of updates) {
      if (line.startsWith(`${update.key}=`)) {
        lines[i] = `${update.key}=${update.value}`;
        updatedKeys.add(update.key);
        console.log(`   Updated: ${update.key}`);
        break;
      }
    }
  }

  // Add new keys that weren't found
  const newUpdates = updates.filter(u => !updatedKeys.has(u.key));
  if (newUpdates.length > 0) {
    // Add newline if file doesn't end with one
    if (!content.endsWith('\n')) {
      lines.push('');
    }

    // Add new variables
    for (const update of newUpdates) {
      if (update.comment) {
        lines.push(`# ${update.comment}`);
      }
      lines.push(`${update.key}=${update.value}`);
      console.log(`   Added: ${update.key}`);
    }
  }

  // Write back to file
  fs.writeFileSync(filePath, lines.join('\n'), 'utf-8');
}

/**
 * Read environment variable from .env file
 *
 * @param filePath - Path to .env file
 * @param key - Variable key to read
 * @returns Variable value or undefined if not found
 */
export function readEnvVariable(
  filePath: string,
  key: string
): string | undefined {
  if (!fs.existsSync(filePath)) {
    return undefined;
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith(`${key}=`)) {
      return trimmed.substring(key.length + 1);
    }
  }

  return undefined;
}

/**
 * Validate that required environment variables exist
 *
 * @param filePath - Path to .env file
 * @param requiredKeys - Array of required variable keys
 * @throws Error if any required variable is missing
 */
export function validateEnvVariables(
  filePath: string,
  requiredKeys: string[]
): void {
  const missing: string[] = [];

  for (const key of requiredKeys) {
    const value = readEnvVariable(filePath, key);
    if (!value || value.trim() === '') {
      missing.push(key);
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables in ${filePath}:\n` +
      missing.map(k => `  - ${k}`).join('\n')
    );
  }
}

/**
 * Create backup of .env file before modifications
 *
 * @param filePath - Path to .env file
 * @returns Path to backup file
 */
export function backupEnvFile(filePath: string): string {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = `${filePath}.backup-${timestamp}`;

  fs.copyFileSync(filePath, backupPath);
  console.log(`📦 Backup created: ${path.basename(backupPath)}`);

  return backupPath;
}

/**
 * Example usage:
 *
 * ```typescript
 * import { updateEnvFile, validateEnvVariables } from './update-env';
 *
 * // Validate required variables
 * validateEnvVariables('.env.local', [
 *   'DATABASE_URL',
 *   'ANTHROPIC_API_KEY'
 * ]);
 *
 * // Update variables
 * updateEnvFile('.env.local', [
 *   {
 *     key: 'N8N_WEBHOOK_URL',
 *     value: 'https://example.com/webhook',
 *     comment: 'Generated webhook URL from n8n setup'
 *   }
 * ]);
 * ```
 */
