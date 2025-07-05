import { TrendingContentFactory } from '../services/trendingContentFactory.js';
import { ViralTemplateEngine } from '../services/viralTemplateEngine.js';
import contentScheduler from '../services/contentScheduler.js';
import { PremiumAnalytics } from '../services/premiumAnalytics.js';
import { logger } from '../utils/logger.js';

// Create instances
const trendingContentFactory = new TrendingContentFactory();
const viralTemplateEngine = new ViralTemplateEngine();
const premiumAnalytics = new PremiumAnalytics();

// Mock premium user check - in production, implement proper auth
const isPremiumUser = (req) => {
  // Premium is enabled for all users
  return true;
};

// Generate trending content
export const generateTrendingContent = async (req, res) => {
  try {
    if (!isPremiumUser(req)) {
      return res.status(403).json({
        success: false,
        message: 'Premium access required'
      });
    }

    const { domains = ['technology'], template = 'viral', count = 7 } = req.body;

    logger.info(`🎯 Generating trending content for domains: ${domains.join(', ')}`);

    // Generate trending posts for each domain
    let posts = [];
    for (const domain of domains) {
      const domainPosts = await trendingContentFactory.createContent(domain);
      posts = posts.concat(domainPosts);
    }

    // Limit to requested count
    posts = posts.slice(0, count);

    // Apply viral template
    const viralPosts = posts.map(post => 
      viralTemplateEngine.applyTemplate(post, template)
    );

    logger.info(`✅ Generated ${viralPosts.length} viral posts`);

    res.json({
      success: true,
      data: {
        posts: viralPosts,
        totalPosts: viralPosts.length,
        domains,
        template,
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    logger.error('❌ Error generating trending content:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate trending content',
      error: error.message
    });
  }
};

// Schedule batch of posts
export const scheduleBatch = async (req, res) => {
  try {
    if (!isPremiumUser(req)) {
      return res.status(403).json({
        success: false,
        message: 'Premium access required'
      });
    }

    const { posts, scheduleTime = '09:00', timezone = 'UTC' } = req.body;

    if (!posts || !Array.isArray(posts) || posts.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Posts array is required and must not be empty'
      });
    }

    logger.info(`📅 Scheduling batch with ${posts.length} posts for ${scheduleTime} in timezone ${timezone}`);

    // Schedule the batch
    const batch = await contentScheduler.scheduleBatch(posts, scheduleTime, timezone);

    logger.info(`✅ Batch ${batch.id} scheduled successfully`);

    res.json({
      success: true,
      data: {
        batchId: batch.id,
        totalPosts: batch.totalPosts,
        scheduleTime,
        status: 'scheduled',
        message: `Successfully scheduled ${posts.length} posts for ${scheduleTime} daily`,
        createdAt: batch.createdAt
      }
    });

  } catch (error) {
    logger.error('❌ Error scheduling batch:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to schedule batch',
      error: error.message
    });
  }
};

// Get all batches
export const getBatches = async (req, res) => {
  try {
    if (!isPremiumUser(req)) {
      return res.status(403).json({
        success: false,
        message: 'Premium access required'
      });
    }

    const batches = await contentScheduler.getAllBatches();

    res.json({
      success: true,
      data: {
        batches,
        totalBatches: batches.length
      }
    });

  } catch (error) {
    logger.error('❌ Error getting batches:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get batches',
      error: error.message
    });
  }
};

// Get batch details
export const getBatchDetails = async (req, res) => {
  try {
    if (!isPremiumUser(req)) {
      return res.status(403).json({
        success: false,
        message: 'Premium access required'
      });
    }

    const { batchId } = req.params;
    const batch = await contentScheduler.getBatchStatus(batchId);

    if (!batch) {
      return res.status(404).json({
        success: false,
        message: 'Batch not found'
      });
    }

    res.json({
      success: true,
      data: batch
    });

  } catch (error) {
    logger.error(`❌ Error getting batch details for ${req.params.batchId}:`, error);
    res.status(500).json({
      success: false,
      message: 'Failed to get batch details',
      error: error.message
    });
  }
};

// Cancel batch
export const cancelBatch = async (req, res) => {
  try {
    if (!isPremiumUser(req)) {
      return res.status(403).json({
        success: false,
        message: 'Premium access required'
      });
    }

    const { batchId } = req.params;
    const result = await contentScheduler.cancelBatch(batchId);

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    logger.error(`❌ Error cancelling batch ${req.params.batchId}:`, error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel batch',
      error: error.message
    });
  }
};

// Get scheduled jobs
export const getScheduledJobs = async (req, res) => {
  try {
    if (!isPremiumUser(req)) {
      return res.status(403).json({
        success: false,
        message: 'Premium access required'
      });
    }

    const { limit = 50 } = req.query;
    const jobs = await contentScheduler.getScheduledJobs(parseInt(limit));

    res.json({
      success: true,
      data: {
        jobs,
        totalJobs: jobs.length
      }
    });

  } catch (error) {
    logger.error('❌ Error getting scheduled jobs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get scheduled jobs',
      error: error.message
    });
  }
};

// Get analytics
export const getAnalytics = async (req, res) => {
  try {
    if (!isPremiumUser(req)) {
      return res.status(403).json({
        success: false,
        message: 'Premium access required'
      });
    }

    const analytics = await premiumAnalytics.getViralMetrics();

    res.json({
      success: true,
      data: analytics
    });

  } catch (error) {
    logger.error('❌ Error getting analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get analytics',
      error: error.message
    });
  }
};

// Get worker status
export const getWorkerStatus = async (req, res) => {
  try {
    if (!isPremiumUser(req)) {
      return res.status(403).json({
        success: false,
        message: 'Premium access required'
      });
    }

    // Import here to avoid circular dependency
    const backgroundWorker = (await import('../services/backgroundWorker.js')).default;
    const status = backgroundWorker.getStatus();

    res.json({
      success: true,
      data: status
    });

  } catch (error) {
    logger.error('❌ Error getting worker status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get worker status',
      error: error.message
    });
  }
}; 