import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { 
  generatePostController,
  schedulePostController,
  getScheduledPostsController,
  deleteScheduledPostController,
  getJobStatsController,
  getDebugInfoController,
  getAllJobsController,
  processJobController,
  publishPostController,
  getAllPostsController
} from '../controllers/postsController.js';

const router = express.Router();

// All post routes require authentication
router.use(requireAuth);

// Get all posts
router.get('/', getAllPostsController);

// Generate a new post
router.post('/generate', generatePostController);

// Publish a post to LinkedIn
router.post('/:id/publish', publishPostController);

// Schedule a post
router.post('/schedule', schedulePostController);

// Get scheduled posts
router.get('/scheduled', getScheduledPostsController);

// Delete scheduled post
router.delete('/scheduled/:id', deleteScheduledPostController);

// Get job statistics
router.get('/stats', getJobStatsController);

// Debug endpoints
router.get('/debug', getDebugInfoController);
router.get('/jobs', getAllJobsController);
router.post('/process/:id', processJobController);

export default router; 