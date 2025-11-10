#!/usr/bin/env ts-node
/**
 * Extract Supabase credential ID from n8n browser page
 *
 * This script navigates to n8n credentials page and extracts the ID
 */

import { execSync } from 'child_process';

console.log('🌐 Opening n8n credentials page in browser...\n');
console.log('📋 Manual steps:');
console.log('   1. Browser window will open');
console.log('   2. Navigate to Credentials in left sidebar');
console.log('   3. Click on "Supabase Auth - CourseHub"');
console.log('   4. Copy the ID from URL: /credentials/{ID}');
console.log('   5. Close browser');
console.log('\n📍 URL: https://n8n-production-30ce.up.railway.app/home/credentials\n');

// Open browser
const url = 'https://n8n-production-30ce.up.railway.app/home/credentials';

try {
  if (process.platform === 'win32') {
    execSync(`start ${url}`);
  } else if (process.platform === 'darwin') {
    execSync(`open ${url}`);
  } else {
    execSync(`xdg-open ${url}`);
  }

  console.log('✅ Browser opened!\n');
  console.log('After you find the credential ID, run:');
  console.log('   npm run n8n:update-credentials -- YOUR_CREDENTIAL_ID');
} catch (error) {
  console.error('❌ Failed to open browser');
  console.log('\nManually navigate to:');
  console.log('   https://n8n-production-30ce.up.railway.app/home/credentials');
}
