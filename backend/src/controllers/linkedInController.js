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

export const getAuthUrlController = async (req, res) => {
  try {
    const linkedInService = await getLinkedInService();
    const authUrl = linkedInService.getAuthUrl();
    res.json({
      success: true,
      data: { authUrl },
      message: 'LinkedIn auth URL generated successfully'
    });
  } catch (error) {
    console.error('Error generating auth URL:', error);
    res.status(500).json({ error: 'Failed to generate auth URL' });
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

    console.log('Processing authorization code:', code);
    const linkedInService = await getLinkedInService();
    const result = await linkedInService.handleCallback(code);
    
    // Redirect to frontend with success
    res.redirect('http://localhost:5173/settings?linkedin=success');
  } catch (error) {
    console.error('LinkedIn callback error:', error);
    // Redirect to frontend with error
    res.redirect(`http://localhost:5173/settings?linkedin=error&message=${encodeURIComponent(error.message)}`);
  }
};

export const getAuthStatusController = async (req, res) => {
  try {
    const linkedInService = await getLinkedInService();
    const status = linkedInService.getAuthStatus();
    res.json({
      success: true,
      data: status,
      message: 'Auth status retrieved successfully'
    });
  } catch (error) {
    console.error('Error getting auth status:', error);
    res.status(500).json({ error: 'Failed to get auth status' });
  }
};

export const disconnectController = async (req, res) => {
  try {
    const linkedInService = await getLinkedInService();
    const result = linkedInService.disconnectLinkedIn();
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

export const getProfileController = async (req, res) => {
  try {
    const linkedInService = await getLinkedInService();
    const profile = await linkedInService.getUserProfile();
    res.json({
      success: true,
      data: { profile },
      message: 'Profile retrieved successfully'
    });
  } catch (error) {
    console.error('Error getting profile:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
};

export const setTokenController = async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ error: 'LinkedIn access token is required' });
    }
    
    const linkedInService = await getLinkedInService();
    const result = linkedInService.setLinkedInToken(token);
    
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