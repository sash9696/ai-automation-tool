// LinkedIn service with real API integration - Per-user authentication
import databaseService from './databaseService.js';

// Remove global variables - now everything is per-user
// let isAuthenticated = false;
// let accessToken = null;
// let refreshToken = null;
// let expiresAt = null;

// Initialize session from database on startup - now per user
const initSessionFromDatabase = (userId) => {
  try {
    const session = databaseService.getLinkedInSession(userId);
    if (session && databaseService.isLinkedInSessionValid(userId)) {
      console.log(`🔑 LinkedIn session loaded from database for user ${userId}`);
      return {
        accessToken: session.access_token,
        refreshToken: session.refresh_token,
        expiresAt: new Date(session.expires_at).getTime(),
        isAuthenticated: true
      };
    } else if (session) {
      console.log(`⚠️ LinkedIn session found but expired for user ${userId}, clearing...`);
      databaseService.clearLinkedInSession(userId);
    }
    return null;
  } catch (error) {
    console.error(`❌ Failed to load LinkedIn session from database for user ${userId}:`, error);
    return null;
  }
};

// Get LinkedIn session for a user
const getUserLinkedInSession = (userId) => {
  // Try to get from database first
  try {
    const dbSession = initSessionFromDatabase(userId);
    if (dbSession) {
      return dbSession;
    }
  } catch (error) {
    console.error(`❌ Database error for user ${userId}:`, error);
  }

  // Fallback to env token if no database session (for development)
  const envToken = process.env.LINKEDIN_ACCESS_TOKEN;
  if (envToken && userId === 'dev_user') {
    console.log('🔑 LinkedIn token loaded from environment variable for dev user');
    return {
      accessToken: envToken,
      refreshToken: null,
      expiresAt: Date.now() + (60 * 24 * 60 * 60 * 1000), // 60 days
      isAuthenticated: true
    };
  }

  return null;
};

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

export const handleCallback = async (code, userId) => {
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
    
    // Save session to database for this user
    try {
      databaseService.saveLinkedInSession({
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        expiresAt: new Date(Date.now() + (tokenData.expires_in * 1000)),
        userProfile: null // Will be fetched later
      }, userId);
      console.log(`💾 LinkedIn session saved to database for user ${userId}`);
    } catch (error) {
      console.error(`❌ Failed to save LinkedIn session to database for user ${userId}:`, error);
    }
    
    console.log(`✅ LinkedIn tokens stored for user ${userId}:`, { 
      hasAccessToken: !!tokenData.access_token, 
      hasRefreshToken: !!tokenData.refresh_token, 
      expiresAt: new Date(Date.now() + (tokenData.expires_in * 1000)).toISOString()
    });
    
    return {
      success: true,
      message: 'LinkedIn authentication successful',
      accessToken: tokenData.access_token,
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

export const publishToLinkedIn = async (content, userId) => {
  const session = getUserLinkedInSession(userId);
  
  console.log(`🔍 LinkedIn auth status for user ${userId}:`, { 
    isAuthenticated: !!session, 
    hasToken: !!session?.accessToken, 
    tokenLength: session?.accessToken?.length 
  });
  
  if (!session || !session.accessToken) {
    console.log(`❌ LinkedIn not authenticated for user ${userId}. Current state:`, { 
      isAuthenticated: !!session, 
      hasToken: !!session?.accessToken 
    });
    throw new Error('LinkedIn not authenticated');
  }

  // Check if token is expired and refresh if needed
  if (session.expiresAt && Date.now() > session.expiresAt) {
    await refreshAccessToken(userId);
    // Get updated session
    const updatedSession = getUserLinkedInSession(userId);
    if (!updatedSession) {
      throw new Error('Failed to refresh LinkedIn token');
    }
  }

  let authorUrn = null;

  try {
    // Get user profile using OpenID Connect /v2/userinfo endpoint
    console.log(`📝 Fetching user profile via OpenID Connect /v2/userinfo for user ${userId}...`);
    const profileResponse = await fetch('https://api.linkedin.com/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (profileResponse.ok) {
      const profileData = await profileResponse.json();
      console.log(`📝 OpenID Connect userinfo response for user ${userId}:`, profileData);
      
      if (profileData.sub) {
        // The 'sub' field contains the LinkedIn member ID
        authorUrn = `urn:li:person:${profileData.sub}`;
        console.log(`📝 Got user profile URN from OpenID Connect for user ${userId}:`, authorUrn);
      } else {
        console.log(`📝 No sub field in userinfo response for user ${userId}`);
      }
    } else {
      const errorText = await profileResponse.text();
      console.log(`📝 OpenID Connect userinfo failed for user ${userId}:`, profileResponse.status, errorText);
    }

    // If we don't have an author URN, we can't post
    if (!authorUrn) {
      throw new Error('Unable to get LinkedIn user profile - cannot determine author URN');
    }

    // Create the post
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

    console.log(`📝 Publishing post to LinkedIn for user ${userId}:`, JSON.stringify(postData, null, 2));

    const response = await fetch('https://api.linkedin.com/v2/ugcPosts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0'
      },
      body: JSON.stringify(postData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ LinkedIn post failed for user ${userId}:`, response.status, errorText);
      throw new Error(`LinkedIn API error: ${response.status} - ${errorText}`);
    }

    const responseData = await response.json();
    console.log(`✅ LinkedIn post successful for user ${userId}:`, responseData);
    
    return {
      success: true,
      id: responseData.id,
      urn: responseData.id ? `urn:li:ugcPost:${responseData.id}` : null,
      message: 'Post published successfully to LinkedIn'
    };
  } catch (error) {
    console.error(`❌ LinkedIn publish error for user ${userId}:`, error);
    throw error;
  }
};

export const getAuthStatus = (userId) => {
  const session = getUserLinkedInSession(userId);
  let profile = null;
  
  // Try to get profile from database
  try {
    const dbSession = databaseService.getLinkedInSession(userId);
    if (dbSession && dbSession.userProfile) {
      profile = dbSession.userProfile;
    }
  } catch (error) {
    console.error(`❌ Failed to load user profile from database for auth status for user ${userId}:`, error);
  }
  
  return {
    connected: !!session && !!session.accessToken,
    hasValidToken: !!session && !!session.accessToken && (!session.expiresAt || Date.now() < session.expiresAt),
    profile: profile
  };
};

export const getUserProfile = async (userId) => {
  const session = getUserLinkedInSession(userId);
  
  if (!session || !session.accessToken) {
    throw new Error('LinkedIn not authenticated');
  }

  // Check if token is expired and refresh if needed
  if (session.expiresAt && Date.now() > session.expiresAt) {
    await refreshAccessToken(userId);
  }

  // Try to get profile from database first
  try {
    const dbSession = databaseService.getLinkedInSession(userId);
    if (dbSession && dbSession.userProfile) {
      console.log(`📝 User profile loaded from database for user ${userId}`);
      return dbSession.userProfile;
    }
  } catch (error) {
    console.error(`❌ Failed to load user profile from database for user ${userId}:`, error);
  }

  try {
    // Fetch user profile using OpenID Connect /v2/userinfo endpoint
    const profileResponse = await fetch('https://api.linkedin.com/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (profileResponse.ok) {
      const profileData = await profileResponse.json();
      console.log(`📝 User profile fetched via OpenID Connect for user ${userId}:`, profileData);
      
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
        const dbSession = databaseService.getLinkedInSession(userId);
        if (dbSession) {
          databaseService.updateLinkedInSession({
            accessToken: dbSession.access_token,
            refreshToken: dbSession.refresh_token,
            expiresAt: dbSession.expiresAt,
            userProfile: profile
          }, userId);
          console.log(`💾 LinkedIn user profile saved to database for user ${userId}`);
        }
      } catch (error) {
        console.error(`❌ Failed to save LinkedIn profile to database for user ${userId}:`, error);
      }
      
      return profile;
    } else {
      const errorText = await profileResponse.text();
      console.log(`📝 Failed to fetch user profile for user ${userId}:`, profileResponse.status, errorText);
      
      // Return fallback profile data
      return {
        id: 'linkedin_user',
        firstName: 'LinkedIn',
        lastName: 'User',
        profilePicture: null
      };
    }
  } catch (error) {
    console.log(`📝 Error fetching user profile for user ${userId}:`, error.message);
    
    // Return fallback profile data
    return {
      id: 'linkedin_user',
      firstName: 'LinkedIn',
      lastName: 'User',
      profilePicture: null
    };
  }
};

const refreshAccessToken = async (userId) => {
  const session = getUserLinkedInSession(userId);
  
  if (!session || !session.refreshToken) {
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
      refresh_token: session.refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to refresh access token');
  }

  const tokenData = await response.json();
  
  // Update session in database with refreshed tokens
  try {
    const dbSession = databaseService.getLinkedInSession(userId);
    if (dbSession) {
      databaseService.updateLinkedInSession({
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        expiresAt: new Date(Date.now() + (tokenData.expires_in * 1000)),
        userProfile: dbSession.userProfile
      }, userId);
      console.log(`💾 LinkedIn refreshed tokens saved to database for user ${userId}`);
    }
  } catch (error) {
    console.error(`❌ Failed to save refreshed LinkedIn tokens to database for user ${userId}:`, error);
  }
};

export const disconnectLinkedIn = (userId) => {
  // Clear session from database
  try {
    databaseService.clearLinkedInSession(userId);
    console.log(`🗑️ LinkedIn session cleared from database for user ${userId}`);
  } catch (error) {
    console.error(`❌ Failed to clear LinkedIn session from database for user ${userId}:`, error);
  }
  
  return {
    success: true,
    message: 'LinkedIn disconnected successfully'
  };
};

export const setLinkedInToken = (token, userId) => {
  // Save session to database
  try {
    databaseService.saveLinkedInSession({
      accessToken: token,
      refreshToken: null,
      expiresAt: new Date(Date.now() + (60 * 24 * 60 * 60 * 1000)), // 60 days
      userProfile: null
    }, userId);
    console.log(`💾 LinkedIn manual token saved to database for user ${userId}`);
  } catch (error) {
    console.error(`❌ Failed to save LinkedIn manual token to database for user ${userId}:`, error);
  }
  
  console.log(`🔑 LinkedIn token set manually for user ${userId}`);
  return { success: true, message: 'LinkedIn token set successfully' };
}; 