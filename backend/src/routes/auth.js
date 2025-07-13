import express from 'express';
import { 
  register, 
  login, 
  refreshToken,
  quickLogin, 
  logout, 
  logoutAll,
  getCurrentUser, 
  checkAuth,
  changePassword
} from '../controllers/authController.js';
import { requireAuth, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Register new user
router.post('/register', register);

// Login user
router.post('/login', login);

// Refresh access token
router.post('/refresh', refreshToken);

// Quick login (for development/demo)
router.post('/quick-login', quickLogin);

// Logout user
router.post('/logout', logout);

// Logout from all devices
router.post('/logout-all', requireAuth, logoutAll);

// Get current user
router.get('/user', requireAuth, getCurrentUser);

// Check authentication status
router.get('/check', optionalAuth, checkAuth);

// Change password
router.post('/change-password', requireAuth, changePassword);

export default router; 