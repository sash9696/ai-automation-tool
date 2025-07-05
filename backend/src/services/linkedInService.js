// LinkedIn service with real API integration
import databaseService from './databaseService.js';

let isAuthenticated = false;
let accessToken = null;
let refreshToken = null;
let expiresAt = null;

// Initialize session from database on startup
const initSessionFromDatabase = () => {
  try {
    const session = databaseService.getLinkedInSession();
    if (session && databaseService.isLinkedInSessionValid()) {
      accessToken = session.access_token;
      refreshToken = session.refresh_token;
      expiresAt = new Date(session.expires_at).getTime();
      isAuthenticated = true;
      console.log('🔑 LinkedIn session loaded from database');
      console.log('✅ LinkedIn auth status:', { isAuthenticated, hasToken: !!accessToken, tokenLength: accessToken?.length });
    } else if (session) {
      console.log('⚠️ LinkedIn session found but expired, clearing...');
      databaseService.clearLinkedInSession();
    }
  } catch (error) {
    console.error('❌ Failed to load LinkedIn session from database:', error);
  }
};

// Initialize token from environment variable if available (fallback)
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
initSessionFromDatabase();
initTokenFromEnv(); // Fallback to env token if no database session

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
    
    // Store tokens in memory
    accessToken = tokenData.access_token;
    refreshToken = tokenData.refresh_token;
    expiresAt = Date.now() + (tokenData.expires_in * 1000);
    isAuthenticated = true;
    
    // Save session to database for persistence
    try {
      databaseService.saveLinkedInSession({
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        expiresAt: new Date(expiresAt),
        userProfile: null // Will be fetched later
      });
      console.log('💾 LinkedIn session saved to database');
    } catch (error) {
      console.error('❌ Failed to save LinkedIn session to database:', error);
    }
    
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
    // Get user profile using OpenID Connect /v2/userinfo endpoint
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

    // If we don't have an author URN, we can't post
    if (!authorUrn) {
      throw new Error('Unable to get LinkedIn user profile - cannot determine author URN');
    }

    // Create post using LinkedIn UGC API with the real author URN
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

    // Post to LinkedIn UGC API
    const postResponse = await fetch('https://api.linkedin.com/v2/ugcPosts', {
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
  let profile = null;
  
  // Try to get profile from database
  try {
    const session = databaseService.getLinkedInSession();
    if (session && session.userProfile) {
      profile = session.userProfile;
    }
  } catch (error) {
    console.error('❌ Failed to load user profile from database for auth status:', error);
  }
  
  return {
    connected: isAuthenticated && !!accessToken,
    hasValidToken: isAuthenticated && accessToken && (!expiresAt || Date.now() < expiresAt),
    profile: profile
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

  // Try to get profile from database first
  try {
    const session = databaseService.getLinkedInSession();
    if (session && session.userProfile) {
      console.log('📝 User profile loaded from database');
      return session.userProfile;
    }
  } catch (error) {
    console.error('❌ Failed to load user profile from database:', error);
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
      
      const profile = {
        id: profileData.sub || 'linkedin_user',
        firstName: profileData.given_name || 'LinkedIn',
        lastName: profileData.family_name || 'User',
        email: profileData.email || null,
        profilePicture: profileData.picture || null,
        locale: profileData.locale || null
      };

      // Update session with user profile in database
      try {
        const session = databaseService.getLinkedInSession();
        if (session) {
          databaseService.updateLinkedInSession({
            accessToken: session.access_token,
            refreshToken: session.refresh_token,
            expiresAt: session.expiresAt,
            userProfile: profile
          });
          console.log('💾 LinkedIn user profile saved to database');
        }
      } catch (error) {
        console.error('❌ Failed to save LinkedIn profile to database:', error);
      }
      
      return profile;
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
  
  // Update session in database with refreshed tokens
  try {
    const session = databaseService.getLinkedInSession();
    if (session) {
      databaseService.updateLinkedInSession({
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        expiresAt: new Date(expiresAt),
        userProfile: session.userProfile
      });
      console.log('💾 LinkedIn refreshed tokens saved to database');
    }
  } catch (error) {
    console.error('❌ Failed to save refreshed LinkedIn tokens to database:', error);
  }
};

export const disconnectLinkedIn = () => {
  isAuthenticated = false;
  accessToken = null;
  refreshToken = null;
  expiresAt = null;
  
  // Clear session from database
  try {
    databaseService.clearLinkedInSession();
    console.log('🗑️ LinkedIn session cleared from database');
  } catch (error) {
    console.error('❌ Failed to clear LinkedIn session from database:', error);
  }
  
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
  
  // Save session to database
  try {
    databaseService.saveLinkedInSession({
      accessToken: token,
      refreshToken: null,
      expiresAt: new Date(expiresAt),
      userProfile: null
    });
    console.log('💾 LinkedIn manual token saved to database');
  } catch (error) {
    console.error('❌ Failed to save LinkedIn manual token to database:', error);
  }
  
  console.log('🔑 LinkedIn token set manually');
  console.log('✅ LinkedIn auth status:', { isAuthenticated, hasToken: !!accessToken, tokenLength: accessToken?.length });
  return { success: true, message: 'LinkedIn token set successfully' };
}; 