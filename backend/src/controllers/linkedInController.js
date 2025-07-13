import { requireAuth } from '../middleware/auth.js';

// Helper function to get the appropriate LinkedIn service
const getLinkedInService = async () => {
  const useMockLinkedIn = process.env.NODE_ENV === 'development' && process.env.USE_MOCK_LINKEDIN === 'true';
  
  if (useMockLinkedIn) {
    console.log('🤖 Using mock LinkedIn service for development');
    return await import('../services/mockLinkedInService.js');
  } else {
    console.log('🔗 Using real LinkedIn service');
    return await import('../services/linkedInService.js');
  }
};

// Apply authentication middleware to all LinkedIn routes
export const authMiddleware = requireAuth;

export const getAuthUrlController = async (req, res) => {
  try {
    const linkedInService = await getLinkedInService();
    const authUrl = linkedInService.getAuthUrl();
    
    res.json({
      success: true,
      data: { authUrl },
      message: 'LinkedIn authorization URL generated'
    });
  } catch (error) {
    console.error('Error generating LinkedIn auth URL:', error);
    res.status(500).json({ error: 'Failed to generate LinkedIn authorization URL' });
  }
};

export const handleCallbackController = async (req, res) => {
  try {
    console.log('LinkedIn callback received:', req.query);
    console.log('Full URL:', req.url);
    
    const { code, error, error_description, state } = req.query;
    
    // Check for OAuth errors
    if (error) {
      console.error('LinkedIn OAuth error:', error, error_description);
      return res.status(400).json({ 
        error: 'LinkedIn authorization failed', 
        details: error_description || error 
      });
    }
    
    if (!code) {
      console.error('No authorization code received');
      return res.status(400).json({ 
        error: 'Authorization code is required',
        received: Object.keys(req.query)
      });
    }

    // For callback from LinkedIn, we need to extract user from session
    // This is a bit tricky since LinkedIn redirects don't include our auth
    // For now, we'll use a temporary solution - store the code and let frontend handle it
    console.log('Processing authorization code:', code);
    
    // Redirect to frontend with code so it can complete the auth with proper session
    res.redirect(`http://localhost:5173/settings?linkedin=callback&code=${code}`);
  } catch (error) {
    console.error('LinkedIn callback error:', error);
    // Redirect to frontend with error
    res.redirect(`http://localhost:5173/settings?linkedin=error&message=${encodeURIComponent(error.message)}`);
  }
};

export const completeAuthController = async (req, res) => {
  try {
    const { code } = req.body;
    const userId = req.user.id; // Get user ID from authenticated session
    
    if (!code) {
      return res.status(400).json({ 
        error: 'Authorization code is required'
      });
    }

    console.log(`Processing LinkedIn authorization for user ${userId} with code:`, code);
    const linkedInService = await getLinkedInService();
    const result = await linkedInService.handleCallback(code, userId);
    
    res.json({
      success: true,
      data: result,
      message: 'LinkedIn connected successfully'
    });
  } catch (error) {
    console.error('LinkedIn auth completion error:', error);
    res.status(500).json({ 
      error: 'Failed to complete LinkedIn authentication',
      details: error.message 
    });
  }
};

export const getAuthStatusController = async (req, res) => {
  try {
    const userId = req.user.id; // Get user ID from authenticated session
    const linkedInService = await getLinkedInService();
    const status = linkedInService.getAuthStatus(userId);
    
    res.json({
      success: true,
      data: status,
      message: 'LinkedIn auth status retrieved'
    });
  } catch (error) {
    console.error('Error getting LinkedIn auth status:', error);
    res.status(500).json({ error: 'Failed to get LinkedIn auth status' });
  }
};

export const getUserProfileController = async (req, res) => {
  try {
    const userId = req.user.id; // Get user ID from authenticated session
    const linkedInService = await getLinkedInService();
    const profile = await linkedInService.getUserProfile(userId);
    
    res.json({
      success: true,
      data: { profile },
      message: 'LinkedIn user profile retrieved'
    });
  } catch (error) {
    console.error('Error getting LinkedIn user profile:', error);
    res.status(500).json({ error: 'Failed to get LinkedIn user profile' });
  }
};

export const publishPostController = async (req, res) => {
  try {
    const { content } = req.body;
    const userId = req.user.id; // Get user ID from authenticated session
    
    if (!content) {
      return res.status(400).json({ error: 'Post content is required' });
    }
    
    const linkedInService = await getLinkedInService();
    const result = await linkedInService.publishToLinkedIn(content, userId);
    
    res.json({
      success: true,
      data: result,
      message: 'Post published to LinkedIn successfully'
    });
  } catch (error) {
    console.error('Error publishing to LinkedIn:', error);
    res.status(500).json({ error: 'Failed to publish to LinkedIn' });
  }
};

export const setTokenController = async (req, res) => {
  try {
    const { token } = req.body;
    const userId = req.user.id; // Get user ID from authenticated session
    
    if (!token) {
      return res.status(400).json({ error: 'LinkedIn access token is required' });
    }
    
    const linkedInService = await getLinkedInService();
    const result = linkedInService.setLinkedInToken(token, userId);
    
    res.json({
      success: true,
      data: result,
      message: 'LinkedIn token set successfully'
    });
  } catch (error) {
    console.error('Error setting LinkedIn token:', error);
    res.status(500).json({ error: 'Failed to set LinkedIn token' });
  }
};

export const disconnectController = async (req, res) => {
  try {
    const userId = req.user.id; // Get user ID from authenticated session
    const linkedInService = await getLinkedInService();
    const result = linkedInService.disconnectLinkedIn(userId);
    
    res.json({
      success: true,
      data: result,
      message: 'LinkedIn disconnected successfully'
    });
  } catch (error) {
    console.error('Error disconnecting LinkedIn:', error);
    res.status(500).json({ error: 'Failed to disconnect LinkedIn' });
  }
}; 