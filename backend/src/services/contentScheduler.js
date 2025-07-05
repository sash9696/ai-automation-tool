import { logger } from '../utils/logger.js';
import { publishToLinkedIn } from './linkedInService.js';
import databaseService from './databaseService.js';

class ContentScheduler {
  constructor() {
    this.batchCounter = 0;
  }

  async scheduleBatch(posts, scheduleTime = '09:00') {
    try {
      logger.info(`📅 Scheduling batch with ${posts.length} posts:`, JSON.stringify(posts, null, 2));
      
      const batchId = `batch_${Date.now()}_${++this.batchCounter}`;
      
      // Calculate 7-day schedule starting from tomorrow
      const schedule = this.calculateSchedule(scheduleTime);
      
      // Create batch record
      databaseService.createBatch({
        id: batchId,
        name: `Viral Content Batch ${this.batchCounter}`,
        scheduleTime: scheduleTime,
        totalPosts: posts.length
      });

      // Schedule each post
      const scheduledJobs = [];
      
      for (let i = 0; i < posts.length; i++) {
        const post = posts[i];
        logger.info(`📝 Processing post ${i}:`, JSON.stringify(post, null, 2));
        
        const jobId = `${batchId}_post_${i + 1}`;
        const scheduledDate = schedule[i];
        
        // Create job in database
        databaseService.createScheduledJob({
          id: jobId,
          batchId: batchId,
          postId: post.postId || `post_${i + 1}`,
          postData: {
            ...post,
            scheduledDate: scheduledDate,
            status: 'scheduled'
          },
          scheduledTime: scheduledDate
        });

        scheduledJobs.push({
          id: jobId,
          postId: post.postId || `post_${i + 1}`,
          title: post.title,
          scheduledDate: scheduledDate,
          status: 'scheduled'
        });
      }

      const batch = {
        id: batchId,
        posts: scheduledJobs,
        scheduleTime,
        createdAt: new Date(),
        totalPosts: posts.length,
        completedPosts: 0,
        failedPosts: 0,
        status: 'active'
      };

      logger.info(`✅ Batch ${batchId} scheduled successfully with ${posts.length} posts`);
      
      return batch;
    } catch (error) {
      logger.error('❌ Error scheduling batch:', error);
      throw error;
    }
  }

  calculateSchedule(scheduleTime) {
    const schedule = [];
    const [hours, minutes] = scheduleTime.split(':').map(Number);
    
    // Start from tomorrow
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 1);
    startDate.setHours(hours, minutes, 0, 0);
    
    // Generate 7-day schedule
    for (let i = 0; i < 7; i++) {
      const scheduledDate = new Date(startDate);
      scheduledDate.setDate(startDate.getDate() + i);
      schedule.push(scheduledDate);
    }
    
    return schedule;
  }

  async getBatchStatus(batchId) {
    try {
      const batch = databaseService.getBatchById(batchId);
      if (!batch) {
        throw new Error(`Batch ${batchId} not found`);
      }

      // Get all jobs for this batch
      const stmt = databaseService.db.prepare(`
        SELECT * FROM scheduled_jobs 
        WHERE batch_id = ? 
        ORDER BY scheduled_time ASC
      `);
      
      const jobs = stmt.all(batchId).map(job => ({
        ...job,
        postData: JSON.parse(job.post_data),
        scheduledTime: new Date(job.scheduled_time)
      }));

      return {
        ...batch,
        jobs: jobs
      };
    } catch (error) {
      logger.error(`❌ Error getting batch status for ${batchId}:`, error);
      throw error;
    }
  }

  async getAllBatches() {
    try {
      const batches = databaseService.getAllBatches();
      
      // Get job counts for each batch
      const batchesWithJobs = batches.map(batch => {
        const stmt = databaseService.db.prepare(`
          SELECT 
            COUNT(*) as total,
            SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
            SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed,
            SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending
          FROM scheduled_jobs 
          WHERE batch_id = ?
        `);
        
        const jobStats = stmt.get(batch.id);
        
        return {
          ...batch,
          jobStats: {
            total: jobStats.total || 0,
            completed: jobStats.completed || 0,
            failed: jobStats.failed || 0,
            pending: jobStats.pending || 0
          }
        };
      });

      return batchesWithJobs;
    } catch (error) {
      logger.error('❌ Error getting all batches:', error);
      throw error;
    }
  }

  async cancelBatch(batchId) {
    try {
      // Update batch status
      const stmt = databaseService.db.prepare(`
        UPDATE batches 
        SET status = 'cancelled', updated_at = datetime('now')
        WHERE id = ?
      `);
      
      const result = stmt.run(batchId);
      
      if (result.changes === 0) {
        throw new Error(`Batch ${batchId} not found`);
      }

      // Cancel all pending jobs for this batch
      const cancelJobsStmt = databaseService.db.prepare(`
        UPDATE scheduled_jobs 
        SET status = 'cancelled', updated_at = datetime('now')
        WHERE batch_id = ? AND status = 'pending'
      `);
      
      cancelJobsStmt.run(batchId);

      logger.info(`✅ Batch ${batchId} cancelled successfully`);
      return { success: true, message: 'Batch cancelled successfully' };
    } catch (error) {
      logger.error(`❌ Error cancelling batch ${batchId}:`, error);
      throw error;
    }
  }

  async rescheduleJob(jobId, newScheduledTime) {
    try {
      const job = databaseService.getJobById(jobId);
      if (!job) {
        throw new Error(`Job ${jobId} not found`);
      }

      if (job.status !== 'pending') {
        throw new Error(`Cannot reschedule job with status: ${job.status}`);
      }

      const newDate = new Date(newScheduledTime);
      
      // Update job scheduled time
      const stmt = databaseService.db.prepare(`
        UPDATE scheduled_jobs 
        SET scheduled_time = ?, updated_at = datetime('now')
        WHERE id = ?
      `);
      
      stmt.run(newDate.toISOString(), jobId);

      logger.info(`✅ Job ${jobId} rescheduled to ${newScheduledTime}`);
      return { success: true, message: 'Job rescheduled successfully' };
    } catch (error) {
      logger.error(`❌ Error rescheduling job ${jobId}:`, error);
      throw error;
    }
  }

  async getScheduledJobs(limit = 50) {
    try {
      const stmt = databaseService.db.prepare(`
        SELECT * FROM scheduled_jobs 
        ORDER BY scheduled_time ASC 
        LIMIT ?
      `);
      
      const jobs = stmt.all(limit).map(job => ({
        ...job,
        postData: JSON.parse(job.post_data),
        scheduledTime: new Date(job.scheduled_time)
      }));

      return jobs;
    } catch (error) {
      logger.error('❌ Error getting scheduled jobs:', error);
      throw error;
    }
  }

  async getJobById(jobId) {
    try {
      return databaseService.getJobById(jobId);
    } catch (error) {
      logger.error(`❌ Error getting job ${jobId}:`, error);
      throw error;
    }
  }

  // Legacy method for backward compatibility
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
      
      return {
        success: false,
        postId: post.postId,
        error: error.message,
        publishedAt: new Date()
      };
    }
  }
}

export default new ContentScheduler(); 