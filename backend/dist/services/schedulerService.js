"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.shutdownScheduler = exports.getQueueStats = exports.cleanupOldJobs = exports.scheduleDailyPost = exports.schedulePostJob = void 0;
const node_cron_1 = __importDefault(require("node-cron"));
const bullmq_1 = require("bullmq");
const ioredis_1 = __importDefault(require("ioredis"));
let redis = null;
let postQueue = null;
let scheduleQueue = null;
let postWorker = null;
const initializeRedis = async () => {
    try {
        if (!redis) {
            redis = new ioredis_1.default(process.env['REDIS_URL'] || 'redis://localhost:6379', {
                maxRetriesPerRequest: null,
                lazyConnect: true
            });
            await redis.connect();
            postQueue = new bullmq_1.Queue('post-queue', { connection: redis });
            scheduleQueue = new bullmq_1.Queue('schedule-queue', { connection: redis });
            postWorker = new bullmq_1.Worker('post-queue', async (job) => {
                const { postId, content } = job.data;
                try {
                    await publishToLinkedIn(content);
                    console.log(`Published scheduled post: ${postId}`);
                }
                catch (error) {
                    console.error(`Failed to publish scheduled post ${postId}:`, error);
                    throw error;
                }
            }, { connection: redis });
            console.log('✅ Redis and BullMQ initialized successfully');
            return true;
        }
        return true;
    }
    catch (error) {
        console.warn('⚠️  Redis not available - scheduling features disabled:', error.message);
        return false;
    }
};
const schedulePostJob = async (post, scheduledTime) => {
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
        await postQueue.add('publish-post', {
            postId: post.id,
            content: post.content,
        }, {
            delay,
            attempts: 3,
            backoff: {
                type: 'exponential',
                delay: 2000,
            },
        });
        console.log(`Scheduled post ${post.id} for ${scheduledTime}`);
    }
    catch (error) {
        console.error('Failed to schedule post:', error);
        throw error;
    }
};
exports.schedulePostJob = schedulePostJob;
const scheduleDailyPost = async () => {
    const redisAvailable = await initializeRedis();
    if (!redisAvailable) {
        console.warn('⚠️  Daily post scheduling disabled - Redis not available');
        return;
    }
    try {
        node_cron_1.default.schedule('0 8 * * *', async () => {
            console.log('Running daily post generation...');
            try {
                const post = await generateDailyPost();
                const scheduledTime = new Date();
                scheduledTime.setHours(9, 0, 0, 0);
                await (0, exports.schedulePostJob)(post, scheduledTime);
            }
            catch (error) {
                console.error('Daily post generation failed:', error);
            }
        });
        console.log('Daily post scheduler started');
    }
    catch (error) {
        console.error('Failed to start daily post scheduler:', error);
    }
};
exports.scheduleDailyPost = scheduleDailyPost;
const generateDailyPost = async () => {
    const topics = ['fullstack', 'dsa', 'interview', 'placement'];
    const randomTopic = topics[Math.floor(Math.random() * topics.length)];
    const post = {
        id: Date.now().toString(),
        content: `Daily ${randomTopic} tip: Stay consistent with your learning journey! 💪`,
        topic: randomTopic,
        status: 'draft',
        createdAt: new Date(),
        updatedAt: new Date(),
    };
    return post;
};
const cleanupOldJobs = async () => {
    const redisAvailable = await initializeRedis();
    if (!redisAvailable) {
        return;
    }
    try {
        const completedJobs = await postQueue.getCompleted();
        const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
        for (const job of completedJobs) {
            if (job.finishedOn && job.finishedOn < weekAgo) {
                await job.remove();
            }
        }
        console.log('Cleaned up old scheduled jobs');
    }
    catch (error) {
        console.error('Failed to cleanup old jobs:', error);
    }
};
exports.cleanupOldJobs = cleanupOldJobs;
const getQueueStats = async () => {
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
            postQueue.getWaiting(),
            postQueue.getActive(),
            postQueue.getCompleted(),
            postQueue.getFailed(),
        ]);
        return {
            waiting: waiting.length,
            active: active.length,
            completed: completed.length,
            failed: failed.length,
            redisAvailable: true
        };
    }
    catch (error) {
        console.error('Failed to get queue stats:', error);
        return null;
    }
};
exports.getQueueStats = getQueueStats;
const shutdownScheduler = async () => {
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
    }
    catch (error) {
        console.error('Error during scheduler shutdown:', error);
    }
};
exports.shutdownScheduler = shutdownScheduler;
const publishToLinkedIn = async (content) => {
    console.log(`Publishing to LinkedIn: ${content.substring(0, 50)}...`);
    await new Promise(resolve => setTimeout(resolve, 1000));
};
//# sourceMappingURL=schedulerService.js.map