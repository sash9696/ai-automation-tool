import { TrendingContentFactory } from '../services/trendingContentFactory.js';
import { ViralTemplateEngine } from '../services/viralTemplateEngine.js';
import { ContentScheduler } from '../services/contentScheduler.js';
import { PremiumAnalytics } from '../services/premiumAnalytics.js';
import { logger } from '../utils/logger.js';

// Mock premium user check - in production, implement proper auth
const isPremiumUser = (req) => {
  // Premium is enabled for all users
  return true;
};

export const generateTrendingPosts = async (req, res) => {
  try {
    if (!isPremiumUser(req)) {
      return res.status(403).json({
        success: false,
        error: 'Premium feature requires subscription',
        message: 'Upgrade to premium to access viral content scheduler'
      });
    }

    const { domains = ['technology', 'frontend', 'ai'] } = req.body;
    
    logger.info(`🎯 Generating trending posts for domains: ${domains.join(', ')}`);
    
    const factory = new TrendingContentFactory();
    const templateEngine = new ViralTemplateEngine();
    
    const trendingPosts = [];
    
    for (const domain of domains) {
      try {
        const content = await factory.createContent(domain);
        const formattedPosts = content.map(item => 
          templateEngine.applyTemplate(item, 'viral')
        );
        trendingPosts.push(...formattedPosts);
      } catch (error) {
        logger.error(`Failed to generate content for domain ${domain}:`, error);
      }
    }
    
    // Take top 7 posts based on viral potential
    const topPosts = trendingPosts
      .sort((a, b) => b.viralScore - a.viralScore)
      .slice(0, 7);
    
    res.json({
      success: true,
      data: {
        posts: topPosts,
        batchId: `batch_${Date.now()}`,
        generatedAt: new Date().toISOString(),
        domains,
        totalGenerated: trendingPosts.length,
        selectedCount: topPosts.length
      },
      message: `Generated ${topPosts.length} viral posts across ${domains.length} domains`
    });
    
  } catch (error) {
    logger.error('Premium content generation failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate trending posts',
      message: error.message
    });
  }
};

export const scheduleViralBatch = async (req, res) => {
  try {
    if (!isPremiumUser(req)) {
      return res.status(403).json({
        success: false,
        error: 'Premium feature requires subscription'
      });
    }

    const { posts, scheduleTime = '09:00' } = req.body;
    
    if (!posts || !Array.isArray(posts) || posts.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Posts array is required'
      });
    }
    
    const scheduler = new ContentScheduler();
    const scheduledBatch = await scheduler.scheduleBatch(posts, scheduleTime);
    
    logger.info(`📅 Scheduled viral batch with ${posts.length} posts`);
    
    res.json({
      success: true,
      data: scheduledBatch,
      message: `Successfully scheduled ${posts.length} posts for 9 AM daily`
    });
    
  } catch (error) {
    logger.error('Viral batch scheduling failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to schedule viral batch',
      message: error.message
    });
  }
};

export const getScheduledBatches = async (req, res) => {
  try {
    if (!isPremiumUser(req)) {
      return res.status(403).json({
        success: false,
        error: 'Premium feature requires subscription'
      });
    }

    const scheduler = new ContentScheduler();
    const batches = await scheduler.getScheduledBatches();
    
    res.json({
      success: true,
      data: batches,
      message: `Found ${batches.length} scheduled batches`
    });
    
  } catch (error) {
    logger.error('Failed to get scheduled batches:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch scheduled batches',
      message: error.message
    });
  }
};

export const getPremiumAnalytics = async (req, res) => {
  try {
    if (!isPremiumUser(req)) {
      return res.status(403).json({
        success: false,
        error: 'Premium feature requires subscription'
      });
    }

    const analytics = new PremiumAnalytics();
    const data = await analytics.getViralMetrics();
    
    res.json({
      success: true,
      data,
      message: 'Premium analytics retrieved successfully'
    });
    
  } catch (error) {
    logger.error('Premium analytics failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch premium analytics',
      message: error.message
    });
  }
}; 