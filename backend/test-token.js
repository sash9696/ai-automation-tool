import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '.env') });

const accessToken = process.env.LINKEDIN_ACCESS_TOKEN;

if (!accessToken) {
  console.log('❌ No LinkedIn access token found in environment variables');
  process.exit(1);
}

console.log('🔑 Testing LinkedIn token with OpenID Connect...');
console.log('📝 Token length:', accessToken.length);
console.log('📝 Token prefix:', accessToken.substring(0, 20) + '...');

async function testLinkedInToken() {
  try {
    let userinfoData = null;
    
    // Test the OpenID Connect /v2/userinfo endpoint
    console.log('\n📝 Testing /v2/userinfo endpoint...');
    const userinfoResponse = await fetch('https://api.linkedin.com/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('📝 Response status:', userinfoResponse.status);
    console.log('📝 Response headers:', Object.fromEntries(userinfoResponse.headers.entries()));

    if (userinfoResponse.ok) {
      userinfoData = await userinfoResponse.json();
      console.log('✅ /v2/userinfo successful!');
      console.log('📝 User info:', JSON.stringify(userinfoData, null, 2));
      
      if (userinfoData.sub) {
        console.log('✅ Found LinkedIn member ID:', userinfoData.sub);
        console.log('✅ Author URN would be:', `urn:li:person:${userinfoData.sub}`);
      } else {
        console.log('❌ No "sub" field found in response');
      }
    } else {
      const errorText = await userinfoResponse.text();
      console.log('❌ /v2/userinfo failed:', errorText);
    }

    // Test posting capability (without actually posting)
    if (userinfoData?.sub) {
      console.log('\n📝 Testing posting capability...');
      const testPostData = {
        author: `urn:li:person:${userinfoData.sub}`,
        lifecycleState: 'DRAFT', // Use DRAFT to avoid actually posting
        specificContent: {
          'com.linkedin.ugc.ShareContent': {
            shareCommentary: {
              text: 'Test post - this should not be published'
            },
            shareMediaCategory: 'NONE'
          }
        },
        visibility: {
          'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
        }
      };

      const postResponse = await fetch('https://api.linkedin.com/v2/ugcPosts', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'X-Restli-Protocol-Version': '2.0.0',
          'LinkedIn-Version': '202401',
        },
        body: JSON.stringify(testPostData),
      });

      console.log('📝 Post test response status:', postResponse.status);
      
      if (postResponse.ok) {
        const postResult = await postResponse.json();
        console.log('✅ Posting capability confirmed!');
        console.log('📝 Post result:', JSON.stringify(postResult, null, 2));
      } else {
        const errorText = await postResponse.text();
        console.log('❌ Posting test failed:', errorText);
      }
    } else {
      console.log('\n❌ Cannot test posting without user ID from /v2/userinfo');
    }

  } catch (error) {
    console.error('❌ Error testing LinkedIn token:', error.message);
  }
}

testLinkedInToken(); 