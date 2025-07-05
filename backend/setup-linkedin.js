#!/usr/bin/env node

/**
 * LinkedIn Integration Setup Script
 * 
 * This script helps you configure LinkedIn integration for development.
 * Run with: node setup-linkedin.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔗 LinkedIn Integration Setup\n');

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
const envExamplePath = path.join(__dirname, 'env.example');

if (!fs.existsSync(envPath)) {
  console.log('📝 Creating .env file from env.example...');
  
  if (fs.existsSync(envExamplePath)) {
    fs.copyFileSync(envExamplePath, envPath);
    console.log('✅ .env file created successfully');
  } else {
    console.log('❌ env.example not found. Please create a .env file manually.');
    process.exit(1);
  }
} else {
  console.log('✅ .env file already exists');
}

// Read current .env content
let envContent = fs.readFileSync(envPath, 'utf8');

// Check if USE_MOCK_LINKEDIN is already set
if (!envContent.includes('USE_MOCK_LINKEDIN=')) {
  console.log('\n🤖 Adding USE_MOCK_LINKEDIN configuration...');
  envContent += '\n# Development/Testing\nUSE_MOCK_LINKEDIN=true\n';
  fs.writeFileSync(envPath, envContent);
  console.log('✅ USE_MOCK_LINKEDIN=true added to .env file');
} else {
  console.log('✅ USE_MOCK_LINKEDIN already configured');
}

console.log('\n📋 Setup Summary:');
console.log('================');

// Check LinkedIn configuration
const hasClientId = envContent.includes('LINKEDIN_CLIENT_ID=') && 
                   !envContent.includes('LINKEDIN_CLIENT_ID=your_linkedin_client_id');
const hasClientSecret = envContent.includes('LINKEDIN_CLIENT_SECRET=') && 
                       !envContent.includes('LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret');
const useMock = envContent.includes('USE_MOCK_LINKEDIN=true');

if (useMock) {
  console.log('✅ Mock LinkedIn service enabled (recommended for development)');
  console.log('   - No real LinkedIn credentials required');
  console.log('   - Simulates LinkedIn API responses');
  console.log('   - Safe for development and testing');
} else {
  console.log('🔗 Real LinkedIn API enabled');
  if (hasClientId && hasClientSecret) {
    console.log('✅ LinkedIn credentials configured');
  } else {
    console.log('❌ LinkedIn credentials not configured');
    console.log('   - Set LINKEDIN_CLIENT_ID and LINKEDIN_CLIENT_SECRET in .env');
    console.log('   - Or set USE_MOCK_LINKEDIN=true for development');
  }
}

console.log('\n🚀 Next Steps:');
if (useMock) {
  console.log('1. Start the backend server: npm run dev');
  console.log('2. Navigate to Settings page in the frontend');
  console.log('3. Click "Connect LinkedIn" - it will work immediately with mock service');
  console.log('4. Try creating and publishing posts');
} else {
  console.log('1. Create a LinkedIn Developer App at https://www.linkedin.com/developers/');
  console.log('2. Configure required scopes: w_member_social, r_liteprofile, r_emailaddress');
  console.log('3. Set redirect URI to: http://localhost:3001/api/linkedin/callback');
  console.log('4. Add your Client ID and Client Secret to .env file');
  console.log('5. Start the backend server: npm run dev');
}

console.log('\n📚 For more information, see: LINKEDIN_SETUP.md');
console.log('\n✨ Setup complete!'); 