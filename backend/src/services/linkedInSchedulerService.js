// LinkedIn Scheduling Service
// Handles scheduling posts to LinkedIn at specific times

import { publishToLinkedIn } from './linkedInService.js';

// In-memory storage for scheduled jobs (in production, use Redis or database)
const scheduledJobs = new Map();

export const scheduleLinkedInPost = async (post, scheduledTime) => {
  try {
    const jobId = `linkedin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Validate scheduled time
    const scheduledDate = new Date(scheduledTime);
    const now = new Date();
    
    if (scheduledDate <= now) {
      throw new Error('Scheduled time must be in the future');
    }
    
    // Calculate delay in milliseconds
    const delay = scheduledDate.getTime() - now.getTime();
    
    // Store job information
    scheduledJobs.set(jobId, {
      id: jobId,
      post,
      scheduledTime: scheduledDate,
      status: 'scheduled',
      platform: 'linkedin',
      createdAt: new Date()
    });
    
    console.log(`⏰ Scheduled LinkedIn post ${post.id} for ${scheduledDate.toISOString()}`);
    
    // Set timeout to execute the job
    setTimeout(async () => {
      try {
        console.log(`🚀 Executing scheduled LinkedIn post: ${post.content}`);
        
        // Update job status to executing
        scheduledJobs.set(jobId, {
          ...scheduledJobs.get(jobId),
          status: 'executing',
          executedAt: new Date()
        });
        
        // Publish to LinkedIn
        const result = await publishToLinkedIn(post.content);
        
        // Update job status to completed
        scheduledJobs.set(jobId, {
          ...scheduledJobs.get(jobId),
          status: 'completed',
          result,
          completedAt: new Date()
        });
        
        console.log(`✅ Scheduled LinkedIn post completed: ${result.message}`);
        
      } catch (error) {
        console.error(`❌ Scheduled LinkedIn post failed: ${error.message}`);
        
        // Update job status to failed
        scheduledJobs.set(jobId, {
          ...scheduledJobs.get(jobId),
          status: 'failed',
          error: error.message,
          failedAt: new Date()
        });
      }
    }, delay);
    
    return {
      jobId,
      scheduledTime: scheduledDate,
      status: 'scheduled'
    };
    
  } catch (error) {
    console.error('LinkedIn scheduling error:', error);
    throw new Error('Failed to schedule LinkedIn post');
  }
};

export const getScheduledLinkedInJobs = () => {
  return Array.from(scheduledJobs.entries()).map(([jobId, job]) => ({
    id: jobId,
    postId: job.post.id,
    scheduledTime: job.scheduledTime,
    status: job.status,
    platform: job.platform,
    createdAt: job.createdAt,
    executedAt: job.executedAt,
    completedAt: job.completedAt,
    failedAt: job.failedAt,
    error: job.error
  }));
};

export const cancelScheduledLinkedInJob = async (jobId) => {
  if (scheduledJobs.has(jobId)) {
    const job = scheduledJobs.get(jobId);
    
    if (job.status === 'scheduled') {
      scheduledJobs.delete(jobId);
      console.log(`❌ Cancelled scheduled LinkedIn job: ${jobId}`);
      return { success: true, message: 'Job cancelled successfully' };
    } else {
      return { success: false, message: 'Cannot cancel job that is already executing or completed' };
    }
  }
  
  return { success: false, message: 'Job not found' };
};

export const getLinkedInJobStatus = (jobId) => {
  if (scheduledJobs.has(jobId)) {
    return scheduledJobs.get(jobId);
  }
  return null;
};

// Get optimal posting times for LinkedIn
export const getOptimalLinkedInPostingTimes = () => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  // LinkedIn optimal posting times (based on research)
  const optimalTimes = [
    { time: '9:00 AM', day: 'Tuesday', description: 'Best time for B2B content' },
    { time: '10:00 AM', day: 'Wednesday', description: 'High engagement time' },
    { time: '12:00 PM', day: 'Thursday', description: 'Lunch break engagement' },
    { time: '5:00 PM', day: 'Friday', description: 'End of work week' },
    { time: '8:00 AM', day: 'Monday', description: 'Start of work week' }
  ];
  
  return optimalTimes.map(opt => {
    const [hours, minutes] = opt.time.split(':');
    const suggestedTime = new Date(today);
    suggestedTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    
    // If the time has passed today, suggest for tomorrow
    if (suggestedTime <= now) {
      suggestedTime.setDate(suggestedTime.getDate() + 1);
    }
    
    return {
      ...opt,
      suggestedTime: suggestedTime.toISOString(),
      timestamp: suggestedTime.getTime()
    };
  });
};

// Schedule post for optimal time
export const scheduleForOptimalTime = async (post, preferredDay = null) => {
  const optimalTimes = getOptimalLinkedInPostingTimes();
  
  let selectedTime;
  
  if (preferredDay) {
    // Find optimal time for preferred day
    selectedTime = optimalTimes.find(opt => 
      opt.day.toLowerCase() === preferredDay.toLowerCase()
    );
  }
  
  // If no preferred day or no match, use the next available optimal time
  if (!selectedTime) {
    selectedTime = optimalTimes[0];
  }
  
  const scheduledTime = new Date(selectedTime.suggestedTime);
  
  return await scheduleLinkedInPost(post, scheduledTime);
}; 