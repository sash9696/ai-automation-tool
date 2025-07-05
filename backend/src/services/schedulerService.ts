import cron from 'node-cron';
import { Queue, Worker } from 'bullmq';
import Redis from 'ioredis';
import type { Post } from '../types';

// Redis connection with graceful degradation
let redis: Redis | null = null;
let postQueue: Queue | null = null;
let scheduleQueue: Queue | null = null;
let postWorker: Worker | null = null;

// Initialize Redis connection only if needed
const initializeRedis = async (): Promise<boolean> => {
  try {
    if (!redis) {
      redis = new Redis(process.env['REDIS_URL'] || 'redis://localhost:6379', {
        maxRetriesPerRequest: null,
        lazyConnect: true
      });
      
      await redis.connect();
      
      // Create queues only if Redis is available
      postQueue = new Queue('post-queue', { connection: redis });
      scheduleQueue = new Queue('schedule-queue', { connection: redis });
      
      // Worker for processing scheduled posts
      postWorker = new Worker('post-queue', async (job) => {
        const { postId, content } = job.data;
        
        try {
          // Publish to LinkedIn
          await publishToLinkedIn(content);
          
          console.log(`Published scheduled post: ${postId}`);
          
          // Update post status in database
          // await updatePostStatus(postId, 'published');
          
        } catch (error) {
          console.error(`Failed to publish scheduled post ${postId}:`, error);
          throw error;
        }
      }, { connection: redis });
      
      console.log('✅ Redis and BullMQ initialized successfully');
      return true;
    }
    return true;
  } catch (error) {
    console.warn('⚠️  Redis not available - scheduling features disabled:', (error as Error).message);
    return false;
  }
};

// Schedule a post for later publication
export const schedulePostJob = async (post: Post, scheduledTime: Date): Promise<void> => {
  const redisAvailable = await initializeRedis();
  
  if (!redisAvailable) {
    console.warn('⚠️  Cannot schedule post - Redis not available');
    throw new Error('Scheduling service not available');
  }
  
  try {
    const delay = scheduledTime.getTime() - Date.now();
    
    if (delay <= 0) {
      throw new Error('Scheduled time must be in the future');
    }
    
    await postQueue!.add(
      'publish-post',
      {
        postId: post.id,
        content: post.content,
      },
      {
        delay,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
      }
    );
    
    console.log(`Scheduled post ${post.id} for ${scheduledTime}`);
  } catch (error) {
    console.error('Failed to schedule post:', error);
    throw error;
  }
};

// Daily post generation job
export const scheduleDailyPost = async (): Promise<void> => {
  const redisAvailable = await initializeRedis();
  
  if (!redisAvailable) {
    console.warn('⚠️  Daily post scheduling disabled - Redis not available');
    return;
  }
  
  try {
    // Schedule daily post generation at 8 AM
    cron.schedule('0 8 * * *', async () => {
      console.log('Running daily post generation...');
      
      try {
        // Generate a post based on user preferences
        const post = await generateDailyPost();
        
        // Schedule it for optimal posting time (9 AM)
        const scheduledTime = new Date();
        scheduledTime.setHours(9, 0, 0, 0);
        
        await schedulePostJob(post, scheduledTime);
        
      } catch (error) {
        console.error('Daily post generation failed:', error);
      }
    });
    
    console.log('Daily post scheduler started');
  } catch (error) {
    console.error('Failed to start daily post scheduler:', error);
  }
};

// Generate a daily post based on user preferences
const generateDailyPost = async (): Promise<Post> => {
  // Mock implementation - in production, fetch user preferences
  const topics = ['fullstack', 'dsa', 'interview', 'placement'];
  const randomTopic = topics[Math.floor(Math.random() * topics.length)];
  
  const post: Post = {
    id: Date.now().toString(),
    content: `Daily ${randomTopic} tip: Stay consistent with your learning journey! 💪`,
    topic: randomTopic as any,
    status: 'draft',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  
  return post;
};

// Clean up old scheduled jobs
export const cleanupOldJobs = async (): Promise<void> => {
  const redisAvailable = await initializeRedis();
  
  if (!redisAvailable) {
    return;
  }
  
  try {
    // Remove completed jobs older than 7 days
    const completedJobs = await postQueue!.getCompleted();
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    
    for (const job of completedJobs) {
      if (job.finishedOn && job.finishedOn < weekAgo) {
        await job.remove();
      }
    }
    
    console.log('Cleaned up old scheduled jobs');
  } catch (error) {
    console.error('Failed to cleanup old jobs:', error);
  }
};

// Get queue statistics
export const getQueueStats = async () => {
  const redisAvailable = await initializeRedis();
  
  if (!redisAvailable) {
    return {
      waiting: 0,
      active: 0,
      completed: 0,
      failed: 0,
      redisAvailable: false
    };
  }
  
  try {
    const [waiting, active, completed, failed] = await Promise.all([
      postQueue!.getWaiting(),
      postQueue!.getActive(),
      postQueue!.getCompleted(),
      postQueue!.getFailed(),
    ]);
    
    return {
      waiting: waiting.length,
      active: active.length,
      completed: completed.length,
      failed: failed.length,
      redisAvailable: true
    };
  } catch (error) {
    console.error('Failed to get queue stats:', error);
    return null;
  }
};

// Graceful shutdown
export const shutdownScheduler = async (): Promise<void> => {
  try {
    if (postWorker) {
      await postWorker.close();
    }
    if (postQueue) {
      await postQueue.close();
    }
    if (scheduleQueue) {
      await scheduleQueue.close();
    }
    if (redis) {
      await redis.quit();
    }
    
    console.log('Scheduler shutdown complete');
  } catch (error) {
    console.error('Error during scheduler shutdown:', error);
  }
};

// Mock LinkedIn service function (will be implemented separately)
const publishToLinkedIn = async (content: string): Promise<void> => {
  // Mock implementation
  console.log(`Publishing to LinkedIn: ${content.substring(0, 50)}...`);
  await new Promise(resolve => setTimeout(resolve, 1000));
}; 