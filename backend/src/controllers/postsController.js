import { generateAIPost, optimizeLinkedInPost } from '../services/aiService.js';
import { schedulePostJob } from '../services/schedulerService.js';
import { rankLinkedInPost } from '../services/linkedInAlgorithm.js';
import { scheduleLinkedInPost, getScheduledLinkedInJobs, cancelScheduledLinkedInJob, getOptimalLinkedInPostingTimes, scheduleForOptimalTime } from '../services/linkedInSchedulerService.js';

// Helper function to get the appropriate LinkedIn service
const getLinkedInService = async () => {
  const useMockLinkedIn = process.env.NODE_ENV === 'development' && process.env.USE_MOCK_LINKEDIN === 'true';
  
  if (useMockLinkedIn) {
    console.log('🤖 Using mock LinkedIn service for development');
    return await import('../services/mockLinkedInService.js');
  } else {
    console.log('🔗 Using real LinkedIn service');
    return await import('../services/linkedInService.js');
  }
};

// In-memory mock data
let mockPosts = [
  {
    id: '1',
    content: '🚀 Excited to share insights about AI and automation in modern business! The future is here, and it\'s transforming how we work. #AI #Automation #Innovation',
    topic: 'AI and Automation',
    status: 'published',
    createdAt: new Date('2024-01-15T10:00:00Z'),
    updatedAt: new Date('2024-01-15T10:00:00Z'),
    scheduledTime: null,
    publishedAt: new Date('2024-01-15T10:00:00Z'),
    analytics: {
      views: 1250,
      likes: 89,
      comments: 12,
      shares: 23,
      engagementRate: 9.9
    }
  },
  {
    id: '2',
    content: '💡 Building scalable systems requires more than just good code. It\'s about architecture, communication, and understanding the bigger picture. #SoftwareEngineering #Architecture #Leadership',
    topic: 'Software Engineering',
    status: 'draft',
    createdAt: new Date('2024-01-16T14:30:00Z'),
    updatedAt: new Date('2024-01-16T14:30:00Z'),
    scheduledTime: null,
    publishedAt: null,
    analytics: null
  }
];

// Helper functions
const findPostById = (id) => mockPosts.find(post => post.id === id);
const updateMockPost = (id, updates) => {
  const index = mockPosts.findIndex(post => post.id === id);
  if (index !== -1) {
    mockPosts[index] = { ...mockPosts[index], ...updates, updatedAt: new Date() };
    return mockPosts[index];
  }
  return null;
};

// Controller functions
export const generatePostContent = async (req, res, next) => {
  try {
    console.log('🔍 [POST CONFIG DEBUG] Raw request body:', JSON.stringify(req.body, null, 2));
    
    const { topic, tone, vibe = 'Story', prompt, useCustomPrompt, includeHashtags, includeCTA, selectedCategory, selectedStyle } = req.body;

    console.log('🔍 [POST CONFIG DEBUG] Extracted parameters:', {
      topic,
      tone,
      vibe,
      prompt: prompt ? `${prompt.substring(0, 100)}...` : 'No prompt',
      useCustomPrompt,
      includeHashtags,
      includeCTA,
      selectedCategory,
      selectedStyle
    });

    if (!topic) {
      console.log('❌ [POST CONFIG DEBUG] Missing topic in request');
      return res.status(400).json({ error: 'Topic is required' });
    }

    // Prepare payload for AI service
    const aiServicePayload = { 
      topic, 
      tone, 
      vibe, 
      prompt, 
      useCustomPrompt, 
      includeHashtags, 
      includeCTA,
      selectedCategory,
      selectedStyle
    };

    console.log('🔍 [POST CONFIG DEBUG] Payload sent to AI service:', JSON.stringify(aiServicePayload, null, 2));

    // Generate post using AI service with all parameters
    const generatedContent = await generateAIPost(aiServicePayload);

    console.log('🔍 [POST CONFIG DEBUG] Generated content received:', generatedContent ? generatedContent.substring(0, 200) + '...' : 'No content generated');

    // Score the generated post using LinkedIn algorithm
    const ranking = rankLinkedInPost(generatedContent, false);

    const newPost = {
      id: Date.now().toString(),
      content: generatedContent,
      topic,
      status: 'draft',
      createdAt: new Date(),
      updatedAt: new Date(),
      scheduledTime: null,
      publishedAt: null,
      analytics: null,
      ranking: ranking
    };

    console.log('🔍 [POST CONFIG DEBUG] Final post object created:', {
      id: newPost.id,
      topic: newPost.topic,
      contentLength: newPost.content?.length || 0,
      status: newPost.status,
      hasRanking: !!newPost.ranking
    });

    mockPosts.push(newPost);

    res.status(201).json({
      success: true,
      data: newPost,
      message: 'Post generated successfully'
    });
  } catch (error) {
    console.error('❌ [POST CONFIG DEBUG] Error generating post:', error);
    res.status(500).json({ error: 'Failed to generate post' });
  }
};

export const optimizePost = async (req, res, next) => {
  try {
    const { postId, vibe = 'Story' } = req.body;

    if (!postId) {
      return res.status(400).json({ error: 'Post ID is required' });
    }

    const post = findPostById(postId);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Optimize the post using LinkedIn algorithm
    const optimizedContent = await optimizeLinkedInPost(post.content, vibe);
    
    // Score the optimized post
    const ranking = rankLinkedInPost(optimizedContent, false);

    const optimizedPost = {
      id: Date.now().toString(),
      content: optimizedContent,
      topic: post.topic,
      status: 'draft',
      createdAt: new Date(),
      updatedAt: new Date(),
      scheduledTime: null,
      publishedAt: null,
      analytics: null,
      ranking: ranking,
      originalPostId: postId
    };

    mockPosts.push(optimizedPost);

    res.status(201).json({
      success: true,
      data: optimizedPost,
      message: 'Post optimized successfully'
    });
  } catch (error) {
    console.error('Error optimizing post:', error);
    res.status(500).json({ error: 'Failed to optimize post' });
  }
};

export const analyzePost = async (req, res, next) => {
  try {
    const { content, hasMedia = false } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    // Analyze the post using LinkedIn algorithm
    const ranking = rankLinkedInPost(content, hasMedia);

    res.status(200).json({
      success: true,
      data: {
        content,
        ranking,
        suggestions: ranking.validations
      },
      message: 'Post analyzed successfully'
    });
  } catch (error) {
    console.error('Error analyzing post:', error);
    res.status(500).json({ error: 'Failed to analyze post' });
  }
};

export const scheduleLinkedInPostController = async (req, res, next) => {
  try {
    const { postId, scheduledTime, useOptimalTime = false, preferredDay = null } = req.body;

    if (!postId) {
      return res.status(400).json({ error: 'Post ID is required' });
    }

    const post = findPostById(postId);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    let result;
    
    if (useOptimalTime) {
      // Schedule for optimal time
      result = await scheduleForOptimalTime(post, preferredDay);
    } else {
      // Schedule for specific time
      if (!scheduledTime) {
        return res.status(400).json({ error: 'Scheduled time is required when not using optimal time' });
      }

      const scheduledDate = new Date(scheduledTime);
      if (isNaN(scheduledDate.getTime())) {
        return res.status(400).json({ error: 'Invalid scheduled time format' });
      }

      result = await scheduleLinkedInPost(post, scheduledDate);
    }

    // Update post status
    const updatedPost = updateMockPost(postId, {
      status: 'scheduled',
      scheduledTime: result.scheduledTime
    });

    res.status(200).json({
      success: true,
      data: {
        jobId: result.jobId,
        post: updatedPost,
        scheduledTime: result.scheduledTime,
        status: result.status
      },
      message: 'LinkedIn post scheduled successfully'
    });
  } catch (error) {
    console.error('Error scheduling LinkedIn post:', error);
    res.status(500).json({ error: 'Failed to schedule LinkedIn post' });
  }
};

export const getScheduledLinkedInPosts = async (req, res, next) => {
  try {
    const scheduledJobs = getScheduledLinkedInJobs();
    
    res.status(200).json({
      success: true,
      data: scheduledJobs,
      message: 'Scheduled LinkedIn posts retrieved successfully'
    });
  } catch (error) {
    console.error('Error getting scheduled LinkedIn posts:', error);
    res.status(500).json({ error: 'Failed to get scheduled LinkedIn posts' });
  }
};

export const cancelScheduledLinkedInPost = async (req, res, next) => {
  try {
    const { jobId } = req.params;

    if (!jobId) {
      return res.status(400).json({ error: 'Job ID is required' });
    }

    const result = await cancelScheduledLinkedInJob(jobId);

    if (result.success) {
      res.status(200).json({
        success: true,
        data: result,
        message: 'Scheduled LinkedIn post cancelled successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.message
      });
    }
  } catch (error) {
    console.error('Error cancelling scheduled LinkedIn post:', error);
    res.status(500).json({ error: 'Failed to cancel scheduled LinkedIn post' });
  }
};

export const getOptimalPostingTimes = async (req, res, next) => {
  try {
    const optimalTimes = getOptimalLinkedInPostingTimes();
    
    res.status(200).json({
      success: true,
      data: optimalTimes,
      message: 'Optimal posting times retrieved successfully'
    });
  } catch (error) {
    console.error('Error getting optimal posting times:', error);
    res.status(500).json({ error: 'Failed to get optimal posting times' });
  }
};

export const getPosts = async (req, res, next) => {
  try {
    res.json({
      success: true,
      data: mockPosts,
      message: 'Posts retrieved successfully'
    });
  } catch (error) {
    console.error('Error getting posts:', error);
    res.status(500).json({ error: 'Failed to get posts' });
  }
};

export const getPostById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const post = findPostById(id);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    res.json({
      success: true,
      data: post,
      message: 'Post retrieved successfully'
    });
  } catch (error) {
    console.error('Error getting post:', error);
    res.status(500).json({ error: 'Failed to get post' });
  }
};

export const updatePost = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const updatedPost = updateMockPost(id, updates);

    if (!updatedPost) {
      return res.status(404).json({ error: 'Post not found' });
    }

    res.json({
      success: true,
      data: updatedPost,
      message: 'Post updated successfully'
    });
  } catch (error) {
    console.error('Error updating post:', error);
    res.status(500).json({ error: 'Failed to update post' });
  }
};

export const deletePost = async (req, res, next) => {
  try {
    const { id } = req.params;
    const index = mockPosts.findIndex(post => post.id === id);

    if (index === -1) {
      return res.status(404).json({ error: 'Post not found' });
    }

    mockPosts.splice(index, 1);

    res.json({
      success: true,
      message: 'Post deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ error: 'Failed to delete post' });
  }
};

export const schedulePost = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { scheduledTime } = req.body;

    if (!scheduledTime) {
      return res.status(400).json({ error: 'Scheduled time is required' });
    }

    const post = findPostById(id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const scheduledDate = new Date(scheduledTime);
    if (isNaN(scheduledDate.getTime())) {
      return res.status(400).json({ error: 'Invalid scheduled time format' });
    }

    const updatedPost = updateMockPost(id, {
      status: 'scheduled',
      scheduledTime: scheduledDate
    });

    // Schedule the job
    await schedulePostJob(updatedPost, scheduledDate);

    res.json({
      success: true,
      data: updatedPost,
      message: 'Post scheduled successfully'
    });
  } catch (error) {
    console.error('Error scheduling post:', error);
    res.status(500).json({ error: 'Failed to schedule post' });
  }
};

export const publishPost = async (req, res, next) => {
  try {
    const { id } = req.params;
    const post = findPostById(id);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Try to publish to LinkedIn
    try {
      const linkedInService = await getLinkedInService();
      await linkedInService.publishToLinkedIn(post.content);
      
      const updatedPost = updateMockPost(id, {
        status: 'published',
        publishedAt: new Date(),
        analytics: {
          views: 0,
          likes: 0,
          comments: 0,
          shares: 0,
          engagementRate: 0
        }
      });

      res.json({
        success: true,
        data: updatedPost,
        message: 'Post published successfully'
      });
    } catch (linkedinError) {
      console.error('LinkedIn posting error:', linkedinError);
      
      // Update post status even if LinkedIn fails (for demo purposes)
      const updatedPost = updateMockPost(id, {
        status: 'published',
        publishedAt: new Date(),
        analytics: {
          views: 0,
          likes: 0,
          comments: 0,
          shares: 0,
          engagementRate: 0
        }
      });

      res.json({
        success: true,
        data: updatedPost,
        message: 'Post published (LinkedIn integration failed)',
        warning: 'LinkedIn posting failed but post was saved'
      });
    }
  } catch (error) {
    console.error('Error publishing post:', error);
    res.status(500).json({ error: 'Failed to publish post' });
  }
}; 