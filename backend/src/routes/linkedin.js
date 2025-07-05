import express from 'express';
import { getAuthUrlController, handleCallbackController, getAuthStatusController, getProfileController, disconnectController, setTokenController } from '../controllers/linkedInController.js';

const router = express.Router();

// Get LinkedIn auth URL
router.get('/auth-url', getAuthUrlController);

// Handle LinkedIn OAuth callback
router.get('/callback', handleCallbackController);

// Get authentication status
router.get('/status', getAuthStatusController);

// Get user profile
router.get('/profile', getProfileController);

// Disconnect LinkedIn
router.post('/disconnect', disconnectController);

// Set LinkedIn token manually
router.post('/set-token', setTokenController);

// Test endpoint to check if LinkedIn service is working
router.get('/test', (req, res) => {
  res.json({
    success: true,
    data: {
      clientId: process.env.LINKEDIN_CLIENT_ID ? 'configured' : 'not configured',
      useMockAuth: process.env.USE_MOCK_LINKEDIN === 'true',
      nodeEnv: process.env.NODE_ENV,
      hasAccessToken: !!process.env.LINKEDIN_ACCESS_TOKEN,
      tokenLength: process.env.LINKEDIN_ACCESS_TOKEN ? process.env.LINKEDIN_ACCESS_TOKEN.length : 0,
      tokenPrefix: process.env.LINKEDIN_ACCESS_TOKEN ? process.env.LINKEDIN_ACCESS_TOKEN.substring(0, 10) + '...' : 'none'
    },
    message: 'LinkedIn service test endpoint'
  });
});

// Test endpoint to test database session persistence
router.get('/test-session', async (req, res) => {
  try {
    const databaseService = (await import('../services/databaseService.js')).default;
    
    // Test saving a session
    const testSession = {
      accessToken: 'test_token_' + Date.now(),
      refreshToken: 'test_refresh_' + Date.now(),
      expiresAt: new Date(Date.now() + 3600000), // 1 hour from now
      userProfile: {
        id: 'test_user',
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com'
      }
    };
    
    databaseService.saveLinkedInSession(testSession);
    
    // Test retrieving the session
    const retrievedSession = databaseService.getLinkedInSession();
    const isValid = databaseService.isLinkedInSessionValid();
    
    res.json({
      success: true,
      data: {
        saved: true,
        retrieved: !!retrievedSession,
        isValid: isValid,
        sessionData: retrievedSession ? {
          id: retrievedSession.id,
          hasAccessToken: !!retrievedSession.access_token,
          hasRefreshToken: !!retrievedSession.refresh_token,
          expiresAt: retrievedSession.expires_at,
          hasProfile: !!retrievedSession.userProfile
        } : null
      },
      message: 'Database session persistence test completed'
    });
  } catch (error) {
    console.error('Session test error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Database session persistence test failed'
    });
  }
});

export default router; 