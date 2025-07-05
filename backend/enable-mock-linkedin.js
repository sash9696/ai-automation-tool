#!/usr/bin/env node

/**
 * Enable Mock LinkedIn Service
 * 
 * This script enables the mock LinkedIn service for development.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🤖 Enabling Mock LinkedIn Service for Development\n');

const envPath = path.join(__dirname, '.env');

// Check if .env file exists
if (!fs.existsSync(envPath)) {
  console.log('❌ .env file not found. Please run the setup script first:');
  console.log('   npm run setup-linkedin');
  process.exit(1);
}

// Read current .env content
let envContent = fs.readFileSync(envPath, 'utf8');

// Check if USE_MOCK_LINKEDIN is already set
if (envContent.includes('USE_MOCK_LINKEDIN=')) {
  // Update existing setting
  envContent = envContent.replace(/USE_MOCK_LINKEDIN=.*/g, 'USE_MOCK_LINKEDIN=true');
  console.log('✅ Updated USE_MOCK_LINKEDIN=true in .env file');
} else {
  // Add new setting
  envContent += '\n# Development/Testing\nUSE_MOCK_LINKEDIN=true\n';
  console.log('✅ Added USE_MOCK_LINKEDIN=true to .env file');
}

// Write back to .env file
fs.writeFileSync(envPath, envContent);

console.log('\n🎉 Mock LinkedIn service enabled!');
console.log('\n📋 What this means:');
console.log('   - No real LinkedIn credentials required');
console.log('   - Simulates LinkedIn authentication and posting');
console.log('   - Perfect for development and testing');
console.log('\n🚀 Next steps:');
console.log('   1. Restart your backend server');
console.log('   2. Try connecting to LinkedIn in the frontend');
console.log('   3. Create and publish posts - they will work with mock service');
console.log('\n✨ Ready to test!'); 