import express from 'express';
import {
  generateTrendingContent,
  scheduleBatch,
  getBatches,
  getBatchDetails,
  cancelBatch,
  getScheduledJobs,
  getAnalytics,
  getWorkerStatus
} from '../controllers/premiumController.js';
import { validatePremiumRequest } from '../middleware/validation.js';

const router = express.Router();

// Generate trending content
router.post('/generate-trending', validatePremiumRequest, generateTrendingContent);

// Schedule batch of posts
router.post('/schedule-batch', validatePremiumRequest, scheduleBatch);

// Get all batches
router.get('/batches', getBatches);

// Get batch details
router.get('/batches/:batchId', getBatchDetails);

// Cancel batch
router.delete('/batches/:batchId', cancelBatch);

// Get scheduled jobs
router.get('/jobs', getScheduledJobs);

// Get analytics
router.get('/analytics', getAnalytics);

// Get worker status
router.get('/worker/status', getWorkerStatus);

export default router; 