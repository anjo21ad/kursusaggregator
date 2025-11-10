#!/usr/bin/env ts-node
/**
 * List all n8n credentials
 */

import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env.local') });

const N8N_HOST = process.env.N8N_HOST;
const N8N_API_KEY = process.env.N8N_API_KEY;

async function n8nRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
  const url = `${N8N_HOST}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'X-N8N-API-KEY': N8N_API_KEY!,
      ...options.headers,
    },
  });

  const text = await response.text();

  if (!response.ok) {
    console.log(`Status: ${response.status}`);
    console.log(`Response: ${text}`);
    throw new Error(`n8n API error (${response.status})`);
  }

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

async function listCredentials() {
  console.log('🔑 Fetching all credentials from n8n...\n');

  try {
    // Try different endpoints
    const endpoints = [
      '/api/v1/credentials',
      '/rest/credentials',
      '/api/credentials'
    ];

    for (const endpoint of endpoints) {
      try {
        console.log(`Trying: ${endpoint}`);
        const result = await n8nRequest(endpoint);

        console.log('\n✅ Success!\n');
        console.log(JSON.stringify(result, null, 2));

        // Extract Supabase credential
        const data = result.data || result;
        if (Array.isArray(data)) {
          const supabaseCred = data.find((c: any) =>
            c.name?.includes('Supabase') || c.type === 'httpHeaderAuth'
          );

          if (supabaseCred) {
            console.log('\n\n🎯 SUPABASE CREDENTIAL FOUND:');
            console.log(`   ID: ${supabaseCred.id}`);
            console.log(`   Name: ${supabaseCred.name}`);
            console.log(`   Type: ${supabaseCred.type}`);
            console.log('\n📋 Run this command:');
            console.log(`   npm run n8n:update-credentials -- ${supabaseCred.id}`);
          }
        }

        return;
      } catch (error: any) {
        console.log(`   Failed: ${error.message}\n`);
      }
    }

    console.log('❌ All endpoints failed. Credentials API may not be available.');

  } catch (error: any) {
    console.error('Error:', error.message);
  }
}

listCredentials();
