// LinkedIn service with real API integration
let isAuthenticated = false;
let accessToken = null;
let refreshToken = null;
let expiresAt = null;

// Initialize token from environment variable if available
const initTokenFromEnv = () => {
  const envToken = process.env.LINKEDIN_ACCESS_TOKEN;
  if (envToken) {
    accessToken = envToken;
    isAuthenticated = true;
    // Set expiration to 2 months from now (typical LinkedIn token lifetime)
    expiresAt = Date.now() + (60 * 24 * 60 * 60 * 1000); // 60 days
    console.log('🔑 LinkedIn token loaded from environment variable');
    console.log('✅ LinkedIn auth status:', { isAuthenticated, hasToken: !!accessToken, tokenLength: accessToken?.length });
  }
};

// Initialize on module load
initTokenFromEnv();

export const getAuthUrl = () => {
  const clientId = process.env.LINKEDIN_CLIENT_ID;
  const redirectUri = process.env.LINKEDIN_REDIRECT_URI || 'http://localhost:3001/api/linkedin/callback';
  const scope = 'w_member_social openid profile'; // Request scopes needed for posting and getting Person URN via OpenID Connect
  
  // For development, if no client ID is provided, return a mock URL
  if (!clientId) {
    console.warn('LinkedIn CLIENT_ID not found in environment variables. Using mock authentication for development.');
    return `http://localhost:3001/api/linkedin/callback?code=mock_code_${Date.now()}&state=${Date.now()}`;
  }
  
  // Check if we should use mock authentication (for development/testing)
  const useMockAuth = process.env.NODE_ENV === 'development' && process.env.USE_MOCK_LINKEDIN === 'true';
  
  if (useMockAuth) {
    console.log('Using mock LinkedIn authentication for development');
    return `http://localhost:3001/api/linkedin/callback?code=mock_code_${Date.now()}&state=${Date.now()}`;
  }
  
  return `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}&state=${Date.now()}`;
};

export const handleCallback = async (code) => {
  try {
    const clientId = process.env.LINKEDIN_CLIENT_ID;
    const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;
    const redirectUri = process.env.LINKEDIN_REDIRECT_URI;
    
    if (!clientId || !clientSecret) {
      throw new Error('LinkedIn credentials not configured');
    }

    // Exchange authorization code for access token
    const tokenResponse = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error('LinkedIn token exchange failed:', errorData);
      throw new Error('Failed to exchange authorization code for access token');
    }

    const tokenData = await tokenResponse.json();
    
    // Store tokens
    accessToken = tokenData.access_token;
    refreshToken = tokenData.refresh_token;
    expiresAt = Date.now() + (tokenData.expires_in * 1000);
    isAuthenticated = true;
    
    console.log('✅ LinkedIn tokens stored:', { 
      hasAccessToken: !!accessToken, 
      hasRefreshToken: !!refreshToken, 
      expiresAt: new Date(expiresAt).toISOString(),
      isAuthenticated
    });
    
    return {
      success: true,
      message: 'LinkedIn authentication successful',
      accessToken,
      profile: {
        id: 'linkedin_user',
        firstName: 'LinkedIn',
        lastName: 'User',
        profilePicture: null
      }
    };
  } catch (error) {
    console.error('LinkedIn callback error:', error);
    throw new Error('LinkedIn authentication failed');
  }
};

export const publishToLinkedIn = async (content) => {
  console.log('🔍 LinkedIn auth status:', { isAuthenticated, hasToken: !!accessToken, tokenLength: accessToken?.length });
  
  if (!isAuthenticated || !accessToken) {
    console.log('❌ LinkedIn not authenticated. Current state:', { isAuthenticated, hasToken: !!accessToken });
    throw new Error('LinkedIn not authenticated');
  }

  // Check if token is expired and refresh if needed
  if (expiresAt && Date.now() > expiresAt) {
    await refreshAccessToken();
  }

  let authorUrn = null;

  try {
    // Try to get user profile using OpenID Connect /v2/userinfo endpoint
    try {
      console.log('📝 Fetching user profile via OpenID Connect /v2/userinfo...');
      const profileResponse = await fetch('https://api.linkedin.com/v2/userinfo', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        console.log('📝 OpenID Connect userinfo response:', profileData);
        
        if (profileData.sub) {
          // The 'sub' field contains the LinkedIn member ID
          authorUrn = `urn:li:person:${profileData.sub}`;
          console.log('📝 Got user profile URN from OpenID Connect:', authorUrn);
        } else {
          console.log('📝 No sub field in userinfo response');
        }
      } else {
        const errorText = await profileResponse.text();
        console.log('📝 OpenID Connect userinfo failed:', profileResponse.status, errorText);
      }
    } catch (error) {
      console.log('📝 OpenID Connect profile fetch failed:', error.message);
    }

    // If we still don't have an author URN, try to use a fallback
    if (!authorUrn) {
      // For development/testing, use a mock URN if configured
      if (process.env.NODE_ENV === 'development' && process.env.USE_MOCK_LINKEDIN === 'true') {
        authorUrn = 'urn:li:person:mock_user_123';
        console.log('📝 Using mock author URN for development:', authorUrn);
      } else {
        // Since we have w_member_social permission, we can try to post without the profile URN
        // LinkedIn API sometimes allows posting with just the access token
        console.log('📝 No profile URN available, attempting to post with access token only...');
        
        // Try posting without author URN first (as authenticated user)
        try {
          const postDataWithoutAuthor = {
            lifecycleState: 'PUBLISHED',
            specificContent: {
              'com.linkedin.ugc.ShareContent': {
                shareCommentary: {
                  text: content
                },
                shareMediaCategory: 'NONE'
              }
            },
            visibility: {
              'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
            }
          };

          console.log('📝 Attempting to post to LinkedIn without author URN:', JSON.stringify(postDataWithoutAuthor, null, 2));

          const postResponse = await fetch('https://api.linkedin.com/v2/ugcPosts', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
              'X-Restli-Protocol-Version': '2.0.0',
              'LinkedIn-Version': '202401',
            },
            body: JSON.stringify(postDataWithoutAuthor),
          });

          if (postResponse.ok) {
            const postResult = await postResponse.json();
            console.log('📝 LinkedIn post published successfully without author URN:', postResult.id);
            return {
              success: true,
              message: 'Post published to LinkedIn successfully',
              postId: postResult.id,
              postUrn: postResult.id
            };
          } else {
            const errorText = await postResponse.text();
            console.log('📝 Posting without author URN failed:', postResponse.status, errorText);
          }
        } catch (error) {
          console.log('📝 Error posting without author URN:', error.message);
        }
        
        // Fallback to a default URN
        authorUrn = 'urn:li:person:default_user';
        console.log('📝 Using fallback author URN:', authorUrn);
      }
    }

    // Create post using LinkedIn UGC API (exactly as per LinkedIn documentation)
    const postData = {
      author: authorUrn,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: {
            text: content
          },
          shareMediaCategory: 'NONE'
        }
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
      }
    };

    console.log('📝 Attempting to post to LinkedIn with data:', JSON.stringify(postData, null, 2));

    // Try the LinkedIn UGC API for posting
    let postResponse = await fetch('https://api.linkedin.com/v2/ugcPosts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0',
        'LinkedIn-Version': '202401',
      },
      body: JSON.stringify(postData),
    });



    // Log the response details for debugging
    console.log('📝 LinkedIn API Response Status:', postResponse.status);
    console.log('📝 LinkedIn API Response Headers:', Object.fromEntries(postResponse.headers.entries()));

    if (!postResponse.ok) {
      const errorData = await postResponse.text();
      console.error('LinkedIn posting failed:', {
        status: postResponse.status,
        statusText: postResponse.statusText,
        headers: Object.fromEntries(postResponse.headers.entries()),
        body: errorData
      });
      throw new Error(`Failed to publish post to LinkedIn: ${postResponse.status} ${postResponse.statusText}`);
    }

    const postResult = await postResponse.json();
    
    console.log('📝 LinkedIn post published successfully:', postResult.id);
    
    return {
      success: true,
      message: 'Post published to LinkedIn successfully',
      postId: postResult.id,
      postUrn: postResult.id
    };
  } catch (error) {
    console.error('LinkedIn posting error:', error);
    throw new Error('Failed to publish to LinkedIn: ' + error.message);
  }
};

export const getAuthStatus = () => {
  return {
    connected: isAuthenticated && !!accessToken,
    hasValidToken: isAuthenticated && accessToken && (!expiresAt || Date.now() < expiresAt),
    profile: null // Profile will be fetched on demand
  };
};

export const getUserProfile = async () => {
  if (!isAuthenticated || !accessToken) {
    throw new Error('LinkedIn not authenticated');
  }

  // Check if token is expired and refresh if needed
  if (expiresAt && Date.now() > expiresAt) {
    await refreshAccessToken();
  }

  try {
    // Fetch user profile using OpenID Connect /v2/userinfo endpoint
    const profileResponse = await fetch('https://api.linkedin.com/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (profileResponse.ok) {
      const profileData = await profileResponse.json();
      console.log('📝 User profile fetched via OpenID Connect:', profileData);
      
      return {
        id: profileData.sub || 'linkedin_user',
        firstName: profileData.given_name || 'LinkedIn',
        lastName: profileData.family_name || 'User',
        email: profileData.email || null,
        profilePicture: profileData.picture || null,
        locale: profileData.locale || null
      };
    } else {
      const errorText = await profileResponse.text();
      console.log('📝 Failed to fetch user profile:', profileResponse.status, errorText);
      
      // Return fallback profile data
      return {
        id: 'linkedin_user',
        firstName: 'LinkedIn',
        lastName: 'User',
        profilePicture: null
      };
    }
  } catch (error) {
    console.log('📝 Error fetching user profile:', error.message);
    
    // Return fallback profile data
    return {
      id: 'linkedin_user',
      firstName: 'LinkedIn',
      lastName: 'User',
      profilePicture: null
    };
  }
};

const refreshAccessToken = async () => {
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  const clientId = process.env.LINKEDIN_CLIENT_ID;
  const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;

  const response = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to refresh access token');
  }

  const tokenData = await response.json();
  accessToken = tokenData.access_token;
  refreshToken = tokenData.refresh_token;
  expiresAt = Date.now() + (tokenData.expires_in * 1000);
};

export const disconnectLinkedIn = () => {
  isAuthenticated = false;
  accessToken = null;
  refreshToken = null;
  expiresAt = null;
  return {
    success: true,
    message: 'LinkedIn disconnected successfully'
  };
};

export const setLinkedInToken = (token) => {
  accessToken = token;
  isAuthenticated = true;
  // Set expiration to 2 months from now (typical LinkedIn token lifetime)
  expiresAt = Date.now() + (60 * 24 * 60 * 60 * 1000); // 60 days
  console.log('🔑 LinkedIn token set manually');
  console.log('✅ LinkedIn auth status:', { isAuthenticated, hasToken: !!accessToken, tokenLength: accessToken?.length });
  return { success: true, message: 'LinkedIn token set successfully' };
}; 