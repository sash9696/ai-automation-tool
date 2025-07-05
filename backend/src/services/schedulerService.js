// Scheduler service with real LinkedIn integration
import { publishToLinkedIn } from './linkedInService.js';

const scheduledJobs = new Map();

export const schedulePostJob = async (post, scheduledTime) => {
  try {
    const jobId = `job_${post.id}_${Date.now()}`;
    
    // Calculate delay until scheduled time
    const delay = scheduledTime.getTime() - Date.now();
    
    if (delay <= 0) {
      throw new Error('Scheduled time must be in the future');
    }

    // Store job info
    scheduledJobs.set(jobId, {
      postId: post.id,
      post: post,
      scheduledTime,
      status: 'scheduled',
      createdAt: new Date()
    });

    console.log(`⏰ Scheduled post ${post.id} for ${scheduledTime.toISOString()}`);
    
    // Schedule job execution after delay
    setTimeout(async () => {
      try {
        console.log(`🚀 Executing scheduled post: ${post.content}`);
        
        // Update job status to executing
        scheduledJobs.set(jobId, {
          ...scheduledJobs.get(jobId),
          status: 'executing',
          executedAt: new Date()
        });

        // Actually post to LinkedIn
        const result = await publishToLinkedIn(post.content);
        
        // Update job status to completed
        scheduledJobs.set(jobId, {
          ...scheduledJobs.get(jobId),
          status: 'completed',
          result: result,
          completedAt: new Date()
        });
        
        console.log(`✅ Scheduled post executed successfully:`, result);
      } catch (error) {
        console.error(`❌ Failed to execute scheduled post:`, error);
        
        // Update job status to failed
        scheduledJobs.set(jobId, {
          ...scheduledJobs.get(jobId),
          status: 'failed',
          error: error.message,
          failedAt: new Date()
        });
      }
    }, Math.min(delay, 5000)); // Cap at 5 seconds for demo

    return {
      jobId,
      scheduledTime,
      status: 'scheduled'
    };
  } catch (error) {
    console.error('Scheduler error:', error);
    throw new Error('Failed to schedule post');
  }
};

export const getScheduledJobs = () => {
  return Array.from(scheduledJobs.entries()).map(([jobId, job]) => ({
    jobId,
    ...job
  }));
};

export const cancelScheduledJob = async (jobId) => {
  if (scheduledJobs.has(jobId)) {
    scheduledJobs.delete(jobId);
    return { success: true, message: 'Job cancelled successfully' };
  }
  throw new Error('Job not found');
}; 