import axios from 'axios';
import type { LinkedInPostResponse, LinkedInAuthResponse } from '../types';

// LinkedIn API configuration
const LINKEDIN_API_BASE = 'https://api.linkedin.com/v2';
const LINKEDIN_AUTH_BASE = 'https://www.linkedin.com/oauth/v2';

// Mock storage for tokens - in production, use database
let accessToken: string | null = null;
let userProfile: LinkedInAuthResponse['profile'] | null = null;

export const getAuthUrl = (): string => {
  const clientId = process.env['LINKEDIN_CLIENT_ID'];
  const redirectUri = process.env['LINKEDIN_REDIRECT_URI'];
  
  if (!clientId || !redirectUri) {
    throw new Error('LinkedIn configuration missing');
  }
  
  const scope = 'r_liteprofile w_member_social';
  const state = Math.random().toString(36).substring(7);
  
  return `${LINKEDIN_AUTH_BASE}/authorization?` +
    `response_type=code&` +
    `client_id=${clientId}&` +
    `redirect_uri=${encodeURIComponent(redirectUri)}&` +
    `scope=${encodeURIComponent(scope)}&` +
    `state=${state}`;
};

export const handleAuthCallback = async (code: string): Promise<LinkedInAuthResponse> => {
  try {
    const clientId = process.env['LINKEDIN_CLIENT_ID'];
    const clientSecret = process.env['LINKEDIN_CLIENT_SECRET'];
    const redirectUri = process.env['LINKEDIN_REDIRECT_URI'];
    
    if (!clientId || !clientSecret || !redirectUri) {
      throw new Error('LinkedIn configuration missing');
    }
    
    // Exchange code for access token
    const tokenResponse = await axios.post(`${LINKEDIN_AUTH_BASE}/accessToken`, {
      grant_type: 'authorization_code',
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
    });
    
    const { access_token, expires_in } = tokenResponse.data;
    accessToken = access_token;
    
    // Get user profile
    const profileResponse = await axios.get(`${LINKEDIN_API_BASE}/me`, {
      headers: {
        'Authorization': `Bearer ${access_token}`,
      },
    });
    
    const profile = {
      id: profileResponse.data.id,
      firstName: profileResponse.data.localizedFirstName,
      lastName: profileResponse.data.localizedLastName,
    };
    
    userProfile = profile;
    
    return {
      accessToken: access_token,
      expiresAt: new Date(Date.now() + expires_in * 1000),
      profile,
    };
  } catch (error) {
    console.error('LinkedIn auth error:', error);
    throw new Error('Failed to authenticate with LinkedIn');
  }
};

export const publishToLinkedIn = async (content: string): Promise<LinkedInPostResponse> => {
  try {
    if (!accessToken) {
      throw new Error('LinkedIn not authenticated');
    }
    
    const postData = {
      author: `urn:li:person:${userProfile?.id}`,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: {
            text: content,
          },
          shareMediaCategory: 'NONE',
        },
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
      },
    };
    
    const response = await axios.post(
      `${LINKEDIN_API_BASE}/ugcPosts`,
      postData,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'X-Restli-Protocol-Version': '2.0.0',
        },
      }
    );
    
    return {
      id: response.data.id,
      text: content,
      createdAt: new Date(),
      visibility: 'PUBLIC',
    };
  } catch (error) {
    console.error('LinkedIn posting error:', error);
    
    // Mock response for development
    if (process.env['NODE_ENV'] === 'development') {
      return {
        id: `mock-${Date.now()}`,
        text: content,
        createdAt: new Date(),
        visibility: 'PUBLIC',
      };
    }
    
    throw new Error('Failed to post to LinkedIn');
  }
};

export const getLinkedInStatus = (): { connected: boolean; profile?: LinkedInAuthResponse['profile'] } => {
  return {
    connected: !!accessToken,
    ...(userProfile && { profile: userProfile }),
  };
};

export const disconnectLinkedIn = (): void => {
  accessToken = null;
  userProfile = null;
};

export const setLinkedInToken = (token: string): { success: boolean; message: string } => {
  accessToken = token;
  console.log('🔑 LinkedIn token set manually');
  console.log('✅ LinkedIn auth status:', { hasToken: !!accessToken, tokenLength: accessToken?.length });
  return { success: true, message: 'LinkedIn token set successfully' };
}; 