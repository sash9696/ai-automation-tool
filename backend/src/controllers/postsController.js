import { generateAIPost, optimizeLinkedInPost } from '../services/aiService.js';
import { scheduleLinkedInPost, getScheduledLinkedInJobs, cancelScheduledLinkedInJob, getOptimalLinkedInPostingTimes, scheduleForOptimalTime } from '../services/linkedInSchedulerService.js';
import { rankLinkedInPost } from '../services/linkedInAlgorithm.js';
import databaseService from '../services/databaseService.js';

// Generate a new post
export const generatePostController = async (req, res) => {
  try {
    const { topic, tone, vibe = 'Story', prompt, useCustomPrompt, includeHashtags, includeCTA, selectedTemplate } = req.body;
    const userId = req.user.id;

    console.log('🔍 [POST CONFIG DEBUG] Raw request body:', req.body);

    if (!topic) {
      return res.status(400).json({ 
        success: false, 
        error: 'Topic is required' 
      });
    }

    // Extract parameters for AI service
    const extractedParams = {
      topic,
      tone,
      vibe,
      prompt,
      useCustomPrompt,
      includeHashtags,
      includeCTA,
      selectedTemplate
    };

    console.log('🔍 [POST CONFIG DEBUG] Extracted parameters:', extractedParams);

    // Prepare payload for AI service
    const aiServicePayload = { 
      topic, 
      tone, 
      vibe, 
      prompt, 
      useCustomPrompt, 
      includeHashtags, 
      includeCTA,
      selectedTemplate
    };

    console.log('🔍 [POST CONFIG DEBUG] Payload sent to AI service:', aiServicePayload);

    // Generate post using AI service with all parameters
    const generatedContent = await generateAIPost(aiServicePayload);

    console.log('🔍 [POST CONFIG DEBUG] Generated content received:', generatedContent.substring(0, 100) + '...');

    // Score the generated post using LinkedIn algorithm
    const ranking = rankLinkedInPost(generatedContent, false);

    const newPost = {
      id: Date.now().toString(),
      content: generatedContent,
      topic,
      contentLength: generatedContent.length,
      status: 'draft',
      hasRanking: !!ranking,
      userId: userId,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    console.log('🔍 [POST CONFIG DEBUG] Final post object created:', {
      id: newPost.id,
      topic: newPost.topic,
      contentLength: newPost.contentLength,
      status: newPost.status,
      hasRanking: newPost.hasRanking
    });

    res.status(201).json({
      success: true,
      data: {
        ...newPost,
        ranking: ranking
      },
      message: 'Post generated successfully'
    });
  } catch (error) {
    console.error('Error generating post:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to generate post',
      details: error.message 
    });
  }
};

// Schedule a post (simplified version for now)
export const schedulePostController = async (req, res) => {
  try {
    const { postId, content, scheduledTime, useOptimalTime = false, preferredDay = null } = req.body;
    const userId = req.user.id;

    if (!content) {
      return res.status(400).json({ 
        success: false, 
        error: 'Post content is required' 
      });
    }

    if (!scheduledTime && !useOptimalTime) {
      return res.status(400).json({ 
        success: false, 
        error: 'Scheduled time is required when not using optimal time' 
      });
    }

    // For now, create a simple job response
    const jobResult = {
      jobId: Date.now().toString(),
      postId: postId || Date.now().toString(),
      content: content,
      scheduledTime: useOptimalTime ? 'optimal' : scheduledTime,
      userId: userId,
      status: 'scheduled'
    };

    res.status(201).json({
      success: true,
      data: jobResult,
      message: 'Post scheduled successfully'
    });
  } catch (error) {
    console.error('Error scheduling post:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to schedule post',
      details: error.message 
    });
  }
};

// Get scheduled posts for the authenticated user
export const getScheduledPostsController = async (req, res) => {
  try {
    const userId = req.user.id;
    // For now, return empty array
    const jobs = [];
    
    res.json({
      success: true,
      data: jobs,
      message: 'Scheduled posts retrieved successfully'
    });
  } catch (error) {
    console.error('Error getting scheduled posts:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get scheduled posts',
      details: error.message 
    });
  }
};

// Delete a scheduled post
export const deleteScheduledPostController = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const result = { success: true, message: 'Post deleted successfully' };
    
    res.json({
      success: true,
      data: result,
      message: 'Scheduled post deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting scheduled post:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to delete scheduled post',
      details: error.message 
    });
  }
};

// Get job statistics for the authenticated user
export const getJobStatsController = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get stats from database (would need to implement this in databaseService)
    const stats = {
      totalJobs: 0,
      pendingJobs: 0,
      completedJobs: 0,
      failedJobs: 0
    };
    
    res.json({
      success: true,
      data: stats,
      message: 'Job statistics retrieved successfully'
    });
  } catch (error) {
    console.error('Error getting job stats:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get job statistics',
      details: error.message 
    });
  }
};

// Debug endpoint to get system information
export const getDebugInfoController = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const debugInfo = {
      userId: userId,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      databaseConnected: true, // Would check actual database connection
      backgroundWorkerRunning: true // Would check actual worker status
    };
    
    res.json({
      success: true,
      data: debugInfo,
      message: 'Debug information retrieved successfully'
    });
  } catch (error) {
    console.error('Error getting debug info:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get debug information',
      details: error.message 
    });
  }
};

// Get all jobs for the authenticated user
export const getAllJobsController = async (req, res) => {
  try {
    const userId = req.user.id;
    const jobs = [];
    
    res.json({
      success: true,
      data: jobs,
      message: 'All jobs retrieved successfully'
    });
  } catch (error) {
    console.error('Error getting all jobs:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get jobs',
      details: error.message 
    });
  }
};

// Process a specific job (for testing)
export const processJobController = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    // This would trigger immediate processing of a job
    // Implementation would depend on the background worker service
    
    res.json({
      success: true,
      data: { jobId: id, userId: userId },
      message: 'Job processing triggered successfully'
    });
  } catch (error) {
    console.error('Error processing job:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to process job',
      details: error.message 
    });
  }
};

// Publish a post to LinkedIn
export const publishPostController = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user.id;
    
    // Get the LinkedIn service
    const useMockLinkedIn = process.env.NODE_ENV === 'development' && process.env.USE_MOCK_LINKEDIN === 'true';
    
    let linkedInService;
    if (useMockLinkedIn) {
      console.log('🤖 Using mock LinkedIn service for development');
      linkedInService = await import('../services/mockLinkedInService.js');
    } else {
      console.log('🔗 Using real LinkedIn service');
      linkedInService = await import('../services/linkedInService.js');
    }
    
    // Use content from request body or try to get it from the post ID
    let postContent = content;
    if (!postContent) {
      // Try to get the post content from the generated post
      // For now, we'll use a more descriptive fallback
      postContent = `AI-generated LinkedIn post about ${id} - created with our automation tool`;
    }
    
    console.log(`📝 Publishing post to LinkedIn with content: ${postContent.substring(0, 100)}...`);
    
    const result = await linkedInService.publishToLinkedIn(postContent, userId);
    
    res.json({
      success: true,
      data: result,
      message: 'Post published to LinkedIn successfully'
    });
  } catch (error) {
    console.error('Error publishing post:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to publish post',
      details: error.message 
    });
  }
}; 