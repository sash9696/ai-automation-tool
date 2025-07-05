// Mock scheduler service for development
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
      scheduledTime,
      status: 'scheduled',
      createdAt: new Date()
    });

    // Mock job scheduling (in real implementation, this would use BullMQ or similar)
    console.log(`⏰ Scheduled post ${post.id} for ${scheduledTime.toISOString()}`);
    
    // Simulate job execution after delay
    setTimeout(() => {
      console.log(`🚀 Executing scheduled post: ${post.content}`);
      scheduledJobs.set(jobId, {
        ...scheduledJobs.get(jobId),
        status: 'completed',
        executedAt: new Date()
      });
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