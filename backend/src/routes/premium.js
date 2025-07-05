import express from 'express';
import { 
  generateTrendingPosts, 
  scheduleViralBatch, 
  getScheduledBatches,
  getPremiumAnalytics 
} from '../controllers/premiumController.js';
import { validatePremiumRequest } from '../middleware/validation.js';

const router = express.Router();

// Generate trending posts for 7-day batch
router.post('/generate-trending', validatePremiumRequest, generateTrendingPosts);

// Schedule viral content batch
router.post('/schedule-batch', scheduleViralBatch);

// Get scheduled batches
router.get('/scheduled-batches', getScheduledBatches);

// Get premium analytics
router.get('/analytics', getPremiumAnalytics);

export default router; 