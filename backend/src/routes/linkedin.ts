import { Router } from 'express';
import { getAuthUrl, handleCallback, getStatus, disconnect, postToLinkedIn, setToken } from '../controllers/linkedInController';

const router = Router();

// Get LinkedIn OAuth URL
router.get('/auth-url', getAuthUrl);

// Handle OAuth callback
router.post('/callback', handleCallback);

// Check connection status
router.get('/status', getStatus);

// Disconnect LinkedIn
router.post('/disconnect', disconnect);

// Post to LinkedIn
router.post('/post', postToLinkedIn);

// Set LinkedIn token manually
router.post('/set-token', setToken);

export default router; 