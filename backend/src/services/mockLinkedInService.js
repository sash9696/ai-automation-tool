// Mock LinkedIn service for development and testing
let isAuthenticated = false;
let mockProfile = null;

export const getAuthUrl = () => {
  console.log('🤖 Using mock LinkedIn authentication for development');
  return `http://localhost:3001/api/linkedin/callback?code=mock_code_${Date.now()}&state=${Date.now()}`;
};

export const handleCallback = async (code) => {
  try {
    console.log('🤖 Mock LinkedIn callback received:', { code });
    
    // Simulate successful authentication
    isAuthenticated = true;
    mockProfile = {
      id: 'mock_user_123',
      firstName: 'Mock',
      lastName: 'LinkedIn User',
      profilePicture: null,
      email: 'mock@example.com'
    };
    
    console.log('✅ Mock LinkedIn authentication successful');
    
    return {
      success: true,
      message: 'Mock LinkedIn authentication successful',
      profile: mockProfile
    };
  } catch (error) {
    console.error('Mock LinkedIn callback error:', error);
    throw new Error('Mock LinkedIn authentication failed');
  }
};

export const publishToLinkedIn = async (content) => {
  console.log('🔍 Mock LinkedIn auth status:', { isAuthenticated });
  
  if (!isAuthenticated) {
    throw new Error('Mock LinkedIn not authenticated');
  }

  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Simulate successful posting
  const mockPostId = `mock_post_${Date.now()}`;
  
  console.log('📝 Mock LinkedIn post published successfully:', mockPostId);
  console.log('📝 Content:', content);
  
  return {
    success: true,
    message: 'Mock post published to LinkedIn successfully',
    postId: mockPostId,
    postUrn: mockPostId
  };
};

export const getAuthStatus = () => {
  return {
    connected: isAuthenticated,
    hasValidToken: isAuthenticated,
    profile: mockProfile
  };
};

export const getUserProfile = async () => {
  if (!isAuthenticated) {
    throw new Error('Mock LinkedIn not authenticated');
  }
  
  return mockProfile;
};

export const disconnectLinkedIn = () => {
  isAuthenticated = false;
  mockProfile = null;
  return {
    success: true,
    message: 'Mock LinkedIn disconnected successfully'
  };
}; 