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
import { validatePremiumRequest, validateScheduleBatch } from '../middleware/validation.js';
import backgroundWorker from '../services/backgroundWorker.js';
import databaseService from '../services/databaseService.js';

const router = express.Router();

// Generate trending content
router.post('/generate-trending', validatePremiumRequest, generateTrendingContent);

// Schedule batch of posts
router.post('/schedule-batch', validateScheduleBatch, scheduleBatch);

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

// Debug: Manually process due jobs
router.post('/debug/process-jobs', (req, res) => {
  try {
    backgroundWorker.processDueJobs();
    res.json({ success: true, message: 'Processing due jobs...' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Debug: Check database directly
router.get('/debug/due-jobs', (req, res) => {
  try {
    const now = new Date().toISOString();
    
    // Get all pending jobs
    const stmt = databaseService.db.prepare(`
      SELECT id, scheduled_time, status, 
             datetime('now') as current_time,
             scheduled_time <= datetime('now') as is_due
      FROM scheduled_jobs 
      WHERE status = 'pending'
      ORDER BY scheduled_time ASC
    `);
    
    const jobs = stmt.all();
    
    res.json({
      success: true,
      data: {
        currentTime: now,
        jobs: jobs
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router; 