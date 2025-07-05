import cron from 'node-cron';
import databaseService from './databaseService.js';
import { publishToLinkedIn } from './linkedInService.js';
import { logger } from '../utils/logger.js';

class BackgroundWorker {
  constructor() {
    this.isRunning = false;
    this.jobInterval = null;
  }

  start() {
    if (this.isRunning) {
      logger.info('🔄 Background worker is already running');
      return;
    }

    logger.info('🚀 Starting background worker...');
    this.isRunning = true;

    // Check for due jobs every minute
    this.jobInterval = setInterval(async () => {
      await this.processDueJobs();
    }, 60000); // 60 seconds

    // Also run immediately on startup
    this.processDueJobs();

    logger.info('✅ Background worker started successfully');
  }

  stop() {
    if (!this.isRunning) {
      logger.info('🔄 Background worker is not running');
      return;
    }

    logger.info('🛑 Stopping background worker...');
    this.isRunning = false;

    if (this.jobInterval) {
      clearInterval(this.jobInterval);
      this.jobInterval = null;
    }

    logger.info('✅ Background worker stopped successfully');
  }

  async processDueJobs() {
    try {
      const dueJobs = databaseService.getDueJobs();
      
      if (dueJobs.length === 0) {
        logger.debug('⏰ No due jobs found');
        return;
      }

      logger.info(`📅 Processing ${dueJobs.length} due job(s)`);

      for (const job of dueJobs) {
        await this.processJob(job);
      }

    } catch (error) {
      logger.error('❌ Error processing due jobs:', error);
    }
  }

  async processJob(job) {
    try {
      logger.info(`📤 Processing job ${job.id}: ${job.postData.title || 'Untitled Post'}`);

      // Update job status to processing
      databaseService.updateJobStatus(job.id, 'processing');

      // Publish to LinkedIn
      const result = await publishToLinkedIn(job.postData.formattedContent || job.postData.content);

      // Update job status to completed
      databaseService.updateJobStatus(
        job.id, 
        'completed',
        result.postId,
        result.postUrn
      );

      // Update batch progress
      databaseService.updateBatchProgress(job.batch_id, 1, 0);

      logger.info(`✅ Job ${job.id} completed successfully: ${result.postUrn}`);

      // Record analytics
      this.recordJobAnalytics(job, true);

    } catch (error) {
      logger.error(`❌ Job ${job.id} failed:`, error);

      // Update job status to failed
      databaseService.updateJobStatus(
        job.id, 
        'failed',
        null,
        null,
        error.message
      );

      // Update batch progress
      databaseService.updateBatchProgress(job.batch_id, 0, 1);

      // Record analytics
      this.recordJobAnalytics(job, false);
    }
  }

  recordJobAnalytics(job, success) {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Get existing analytics for today
      const analytics = databaseService.getAnalytics(1);
      const todayAnalytics = analytics.find(a => a.date === today);

      if (todayAnalytics) {
        // Update existing record
        const stmt = databaseService.db.prepare(`
          UPDATE analytics 
          SET total_posts = total_posts + 1,
              successful_posts = successful_posts + ?,
              failed_posts = failed_posts + ?
          WHERE date = ?
        `);
        stmt.run(success ? 1 : 0, success ? 0 : 1, today);
      } else {
        // Create new record
        databaseService.recordAnalytics({
          date: today,
          totalPosts: 1,
          successfulPosts: success ? 1 : 0,
          failedPosts: success ? 0 : 1,
          totalEngagement: 0 // Will be updated later when we fetch LinkedIn metrics
        });
      }
    } catch (error) {
      logger.error('❌ Error recording analytics:', error);
    }
  }

  // Manual job processing (for testing)
  async processJobById(jobId) {
    const job = databaseService.getJobById(jobId);
    if (!job) {
      throw new Error(`Job ${jobId} not found`);
    }

    await this.processJob(job);
  }

  // Get worker status
  getStatus() {
    return {
      isRunning: this.isRunning,
      lastCheck: new Date().toISOString(),
      stats: databaseService.getStats()
    };
  }
}

// Create singleton instance
const backgroundWorker = new BackgroundWorker();

export default backgroundWorker; 