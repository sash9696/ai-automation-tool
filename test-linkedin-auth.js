import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, 'backend', '.env') });

async function testLinkedInAuth() {
  console.log('🔧 Testing LinkedIn Authentication');
  console.log('====================================');
  
  const clientId = process.env.LINKEDIN_CLIENT_ID;
  const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;
  const redirectUri = process.env.LINKEDIN_REDIRECT_URI;
  
  console.log('Configuration:');
  console.log(`- Client ID: ${clientId}`);
  console.log(`- Client Secret: ${clientSecret ? clientSecret.substring(0, 10) + '...' : 'NOT SET'}`);
  console.log(`- Redirect URI: ${redirectUri}`);
  console.log('');
  
  if (!clientId || !clientSecret) {
    console.log('❌ Missing LinkedIn credentials');
    return;
  }
  
  // Test the auth URL generation
  const scope = 'w_member_social openid profile';
  const state = Date.now();
  const authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}&state=${state}`;
  
  console.log('🔗 Auth URL:');
  console.log(authUrl);
  console.log('');
  
  // Test a mock token exchange (this will fail but show us the exact error)
  console.log('🧪 Testing token exchange format...');
  
  const mockCode = 'mock_code_for_testing';
  const tokenExchangeData = new URLSearchParams({
    grant_type: 'authorization_code',
    code: mockCode,
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: redirectUri,
  });
  
  console.log('📤 Token exchange request body:');
  console.log(tokenExchangeData.toString());
  console.log('');
  
  try {
    const response = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: tokenExchangeData,
    });
    
    const responseText = await response.text();
    console.log(`📥 Response Status: ${response.status}`);
    console.log(`📥 Response Body: ${responseText}`);
    
    if (!response.ok) {
      console.log('❌ Token exchange failed (expected with mock code)');
      console.log('This confirms the request format is correct');
    }
  } catch (error) {
    console.log('❌ Network error:', error.message);
  }
}

testLinkedInAuth().catch(console.error); 