import express from 'express';
import { generatePostContent, getPosts, getPostById, updatePost, deletePost, schedulePost, publishPost, optimizePost, analyzePost, scheduleLinkedInPostController, getScheduledLinkedInPosts, cancelScheduledLinkedInPost, getOptimalPostingTimes } from '../controllers/postsController.js';
import { validateGeneratePost, validateSchedulePost } from '../middleware/validation.js';

const router = express.Router();

// Generate new post
router.post('/generate', validateGeneratePost, generatePostContent);

// Get all posts
router.get('/', getPosts);

// Get single post
router.get('/:id', getPostById);

// Update post
router.put('/:id', updatePost);

// Delete post
router.delete('/:id', deletePost);

// Schedule post
router.post('/:id/schedule', validateSchedulePost, schedulePost);

// Publish post immediately
router.post('/:id/publish', publishPost);

// Optimize existing post
router.post('/optimize', optimizePost);

// Analyze post content
router.post('/analyze', analyzePost);

// LinkedIn Scheduling Routes
router.post('/schedule-linkedin', scheduleLinkedInPostController);
router.get('/scheduled-linkedin', getScheduledLinkedInPosts);
router.delete('/scheduled-linkedin/:jobId', cancelScheduledLinkedInPost);
router.get('/optimal-times', getOptimalPostingTimes);

export default router; 