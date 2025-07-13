import express from 'express';
import { 
  getAuthUrlController, 
  handleCallbackController, 
  completeAuthController,
  getAuthStatusController, 
  getUserProfileController,
  publishPostController,
  setTokenController,
  disconnectController
} from '../controllers/linkedInController.js';
import { requireAuth, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Public routes (no auth required)
router.get('/auth-url', getAuthUrlController);
router.get('/callback', handleCallbackController);

// Protected routes (require authentication)
router.post('/complete-auth', requireAuth, completeAuthController);
router.get('/status', requireAuth, getAuthStatusController);
router.get('/profile', requireAuth, getUserProfileController);
router.post('/publish', requireAuth, publishPostController);
router.post('/set-token', requireAuth, setTokenController);
router.post('/disconnect', requireAuth, disconnectController);

// Test endpoint to test database session persistence
router.get('/test-session', optionalAuth, async (req, res) => {
  try {
    const databaseService = (await import('../services/databaseService.js')).default;
    const userId = req.user?.id || 'test_user';
    
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
    
    databaseService.saveLinkedInSession(testSession, userId);
    
    // Test retrieving the session
    const retrievedSession = databaseService.getLinkedInSession(userId);
    const isValid = databaseService.isLinkedInSessionValid(userId);
    
    res.json({
      success: true,
      data: {
        userId: userId,
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