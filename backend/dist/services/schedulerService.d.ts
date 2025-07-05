import type { Post } from '../types';
export declare const schedulePostJob: (post: Post, scheduledTime: Date) => Promise<void>;
export declare const scheduleDailyPost: () => Promise<void>;
export declare const cleanupOldJobs: () => Promise<void>;
export declare const getQueueStats: () => Promise<{
    waiting: number;
    active: number;
    completed: number;
    failed: number;
    redisAvailable: boolean;
} | null>;
export declare const shutdownScheduler: () => Promise<void>;
//# sourceMappingURL=schedulerService.d.ts.map