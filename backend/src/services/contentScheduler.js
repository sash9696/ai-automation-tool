import { logger } from '../utils/logger.js';
import { publishToLinkedIn } from './linkedInService.js';

// In-memory storage for scheduled batches (in production, use Redis/Database)
const scheduledBatches = new Map();
const batchQueue = [];

export class ContentScheduler {
  constructor() {
    this.batchCounter = 0;
    this.scheduledBatches = scheduledBatches;
    this.batchQueue = batchQueue;
  }

  async scheduleBatch(posts, scheduleTime = '09:00') {
    try {
      logger.info(`📅 Scheduling batch with ${posts.length} posts:`, JSON.stringify(posts, null, 2));
      
      const batchId = `batch_${Date.now()}_${++this.batchCounter}`;
      
      // Calculate 7-day schedule starting from tomorrow
      const schedule = this.calculateSchedule(scheduleTime);
      
      const batch = {
        id: batchId,
        posts: posts.map((post, index) => {
          logger.info(`📝 Processing post ${index}:`, JSON.stringify(post, null, 2));
          return {
            ...post,
            scheduledDate: schedule[index],
            status: 'scheduled',
            postId: `${batchId}_post_${index + 1}`
          };
        }),
        scheduleTime,
        createdAt: new Date(),
        status: 'active',
        totalPosts: posts.length,
        completedPosts: 0,
        failedPosts: 0
      };
      
      // Store the batch
      this.scheduledBatches.set(batchId, batch);
      
      // Add to processing queue
      this.batchQueue.push(batchId);
      
      logger.info(`📅 Scheduled batch ${batchId} with ${posts.length} posts`);
      
      // Start processing if not already running
      this.startProcessing();
      
      return {
        batchId,
        schedule: schedule.map((date, index) => ({
          day: index + 1,
          date: date.toISOString(),
          post: {
            title: posts[index]?.title || 'Untitled',
            topic: posts[index]?.topic || 'General',
            viralScore: posts[index]?.viralScore || 0
          }
        })),
        status: 'scheduled',
        message: `Successfully scheduled ${posts.length} posts for 9 AM daily`
      };
      
    } catch (error) {
      logger.error('Batch scheduling failed:', error);
      throw new Error(`Failed to schedule batch: ${error.message}`);
    }
  }

  calculateSchedule(scheduleTime) {
    const schedule = [];
    const [hours, minutes] = scheduleTime.split(':').map(Number);
    
    // Start from tomorrow
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 1);
    startDate.setHours(hours, minutes, 0, 0);
    
    // Generate 7 days of schedule
    for (let i = 0; i < 7; i++) {
      const scheduledDate = new Date(startDate);
      scheduledDate.setDate(startDate.getDate() + i);
      schedule.push(scheduledDate);
    }
    
    return schedule;
  }

  async getScheduledBatches() {
    const batches = [];
    
    for (const [batchId, batch] of this.scheduledBatches) {
      batches.push({
        id: batchId,
        status: batch.status,
        totalPosts: batch.totalPosts,
        completedPosts: batch.completedPosts,
        failedPosts: batch.failedPosts,
        createdAt: batch.createdAt,
        nextPostDate: this.getNextPostDate(batch),
        progress: this.calculateProgress(batch)
      });
    }
    
    return batches.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  getNextPostDate(batch) {
    const now = new Date();
    const pendingPosts = batch.posts.filter(post => 
      new Date(post.scheduledDate) > now && post.status === 'scheduled'
    );
    
    if (pendingPosts.length === 0) return null;
    
    return pendingPosts[0].scheduledDate;
  }

  calculateProgress(batch) {
    const total = batch.totalPosts;
    const completed = batch.completedPosts;
    const failed = batch.failedPosts;
    
    return {
      percentage: Math.round((completed / total) * 100),
      completed,
      failed,
      remaining: total - completed - failed
    };
  }

  async getBatchDetails(batchId) {
    const batch = this.scheduledBatches.get(batchId);
    
    if (!batch) {
      throw new Error(`Batch ${batchId} not found`);
    }
    
    return {
      ...batch,
      progress: this.calculateProgress(batch),
      nextPostDate: this.getNextPostDate(batch),
      posts: batch.posts.map(post => ({
        ...post,
        status: this.getPostStatus(post)
      }))
    };
  }

  getPostStatus(post) {
    const now = new Date();
    const scheduledDate = new Date(post.scheduledDate);
    
    if (post.status === 'published') return 'published';
    if (post.status === 'failed') return 'failed';
    if (scheduledDate <= now) return 'overdue';
    return 'scheduled';
  }

  async cancelBatch(batchId) {
    const batch = this.scheduledBatches.get(batchId);
    
    if (!batch) {
      throw new Error(`Batch ${batchId} not found`);
    }
    
    batch.status = 'cancelled';
    
    // Remove from processing queue
    const queueIndex = this.batchQueue.indexOf(batchId);
    if (queueIndex > -1) {
      this.batchQueue.splice(queueIndex, 1);
    }
    
    logger.info(`❌ Cancelled batch ${batchId}`);
    
    return {
      batchId,
      status: 'cancelled',
      message: 'Batch cancelled successfully'
    };
  }

  async pauseBatch(batchId) {
    const batch = this.scheduledBatches.get(batchId);
    
    if (!batch) {
      throw new Error(`Batch ${batchId} not found`);
    }
    
    batch.status = 'paused';
    
    logger.info(`⏸️ Paused batch ${batchId}`);
    
    return {
      batchId,
      status: 'paused',
      message: 'Batch paused successfully'
    };
  }

  async resumeBatch(batchId) {
    const batch = this.scheduledBatches.get(batchId);
    
    if (!batch) {
      throw new Error(`Batch ${batchId} not found`);
    }
    
    batch.status = 'active';
    
    // Add back to queue if not already there
    if (!this.batchQueue.includes(batchId)) {
      this.batchQueue.push(batchId);
    }
    
    logger.info(`▶️ Resumed batch ${batchId}`);
    
    return {
      batchId,
      status: 'active',
      message: 'Batch resumed successfully'
    };
  }

  startProcessing() {
    // In production, this would be a background job
    // For now, simulate processing
    setInterval(() => {
      this.processNextBatch();
    }, 60000); // Check every minute
  }

  async processNextBatch() {
    if (this.batchQueue.length === 0) return;
    
    const batchId = this.batchQueue[0];
    const batch = this.scheduledBatches.get(batchId);
    
    if (!batch || batch.status !== 'active') {
      this.batchQueue.shift(); // Remove from queue
      return;
    }
    
    const now = new Date();
    const duePosts = batch.posts.filter(post => 
      new Date(post.scheduledDate) <= now && post.status === 'scheduled'
    );
    
    if (duePosts.length === 0) return;
    
    logger.info(`🚀 Processing ${duePosts.length} due posts from batch ${batchId}`);
    
    for (const post of duePosts) {
      try {
        await this.publishPost(post, batch);
        post.status = 'published';
        batch.completedPosts++;
        
        logger.info(`✅ Published post: ${post.title}`);
        
      } catch (error) {
        logger.error(`❌ Failed to publish post: ${post.title}`, error);
        post.status = 'failed';
        batch.failedPosts++;
      }
    }
    
    // Check if batch is complete
    if (batch.completedPosts + batch.failedPosts === batch.totalPosts) {
      batch.status = 'completed';
      this.batchQueue.shift(); // Remove from queue
      
      logger.info(`🎉 Batch ${batchId} completed`);
    }
  }

  async publishPost(post, batch) {
    try {
      logger.info(`📤 Publishing post to LinkedIn: ${post.title}`);
      
      // Actually post to LinkedIn using the LinkedIn service
      const result = await publishToLinkedIn(post.content);
      
      logger.info(`✅ Successfully published post to LinkedIn: ${post.title}`, result);
      
      return {
        success: true,
        postId: post.postId,
        publishedAt: new Date(),
        linkedInPostId: result.postId,
        linkedInPostUrn: result.postUrn
      };
    } catch (error) {
      logger.error(`❌ Failed to publish post to LinkedIn: ${post.title}`, error);
      throw new Error(`LinkedIn publishing failed: ${error.message}`);
    }
  }

  // Analytics methods
  getBatchAnalytics() {
    const analytics = {
      totalBatches: this.scheduledBatches.size,
      activeBatches: 0,
      completedBatches: 0,
      failedBatches: 0,
      totalPosts: 0,
      publishedPosts: 0,
      failedPosts: 0,
      averageViralScore: 0
    };
    
    let totalViralScore = 0;
    let postCount = 0;
    
    for (const batch of this.scheduledBatches.values()) {
      if (batch.status === 'active') analytics.activeBatches++;
      if (batch.status === 'completed') analytics.completedBatches++;
      if (batch.status === 'failed') analytics.failedBatches++;
      
      analytics.totalPosts += batch.totalPosts;
      analytics.publishedPosts += batch.completedPosts;
      analytics.failedPosts += batch.failedPosts;
      
      batch.posts.forEach(post => {
        totalViralScore += post.viralScore || 0;
        postCount++;
      });
    }
    
    analytics.averageViralScore = postCount > 0 ? totalViralScore / postCount : 0;
    
    return analytics;
  }

  // Cleanup old batches
  cleanupOldBatches(daysToKeep = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
    
    let cleanedCount = 0;
    
    for (const [batchId, batch] of this.scheduledBatches) {
      if (batch.status === 'completed' && new Date(batch.createdAt) < cutoffDate) {
        this.scheduledBatches.delete(batchId);
        cleanedCount++;
      }
    }
    
    logger.info(`🧹 Cleaned up ${cleanedCount} old batches`);
    return cleanedCount;
  }
} 