import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, 'backend', '.env') });

async function testLinkedInCredentials() {
  console.log('🔧 LinkedIn Credentials Test');
  console.log('============================');
  
  const clientId = process.env.LINKEDIN_CLIENT_ID;
  const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;
  const redirectUri = process.env.LINKEDIN_REDIRECT_URI;
  const useMock = process.env.USE_MOCK_LINKEDIN;
  const nodeEnv = process.env.NODE_ENV;
  
  console.log('Configuration:');
  console.log(`- NODE_ENV: ${nodeEnv}`);
  console.log(`- USE_MOCK_LINKEDIN: ${useMock}`);
  console.log(`- Client ID: ${clientId}`);
  console.log(`- Client Secret: ${clientSecret ? clientSecret.substring(0, 10) + '...' : 'NOT SET'}`);
  console.log(`- Redirect URI: ${redirectUri}`);
  console.log('');
  
  // Test service selection logic
  const useMockLinkedIn = nodeEnv === 'development' && useMock === 'true';
  console.log('Service Selection Logic:');
  console.log(`- nodeEnv === 'development': ${nodeEnv === 'development'}`);
  console.log(`- useMock === 'true': ${useMock === 'true'}`);
  console.log(`- useMockLinkedIn: ${useMockLinkedIn}`);
  console.log(`- Will use: ${useMockLinkedIn ? 'MOCK' : 'REAL'} LinkedIn service`);
  console.log('');
  
  if (!useMockLinkedIn) {
    console.log('🔗 Testing Real LinkedIn Configuration...');
    
    if (!clientId || !clientSecret) {
      console.log('❌ Missing LinkedIn credentials');
      return;
    }
    
    // Test auth URL generation
    const scope = 'w_member_social openid profile';
    const authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}&state=${Date.now()}`;
    
    console.log('Generated Auth URL:');
    console.log(authUrl);
    console.log('');
    
    console.log('📋 Next Steps:');
    console.log('1. Copy the auth URL above');
    console.log('2. Open it in your browser');
    console.log('3. Complete the LinkedIn OAuth flow');
    console.log('4. Check if you get a valid authorization code');
    console.log('');
    
    console.log('🔍 Troubleshooting Tips:');
    console.log('- Make sure your LinkedIn app has the correct redirect URI');
    console.log('- Verify your client ID and secret are correct');
    console.log('- Check that your LinkedIn app has the required permissions');
    console.log('- Ensure your app is not in development mode if you want production access');
  } else {
    console.log('🤖 Mock LinkedIn service is enabled');
    console.log('To use real LinkedIn, set USE_MOCK_LINKEDIN=false in your .env file');
  }
}

testLinkedInCredentials().catch(console.error); 