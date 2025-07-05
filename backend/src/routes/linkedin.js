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

export default router; 