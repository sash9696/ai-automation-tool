export type PostTopic = 'fullstack' | 'dsa' | 'interview' | 'placement';

export type PostStatus = 'draft' | 'scheduled' | 'published' | 'failed';

export type PostTone = 'professional' | 'casual' | 'motivational';

export interface Post {
  id: string;
  content: string;
  topic: PostTopic;
  tone?: PostTone;
  status: PostStatus;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  scheduledTime?: string;
  analytics?: {
    views: number;
    likes: number;
    comments: number;
    shares: number;
    engagementRate: number;
  };
}

export interface GeneratePostRequest {
  topic: PostTopic;
  tone?: PostTone;
  includeHashtags?: boolean;
  includeCTA?: boolean;
}

export interface SchedulePostRequest {
  postId: string;
  scheduledTime: Date;
}

export interface LinkedInAuthResponse {
  connected: boolean;
  profile?: {
    id: string;
    firstName: string;
    lastName: string;
    profilePicture?: string;
  };
}

export interface AppSettings {
  defaultPostTime: string;
  preferredTopics: PostTopic[];
  linkedInConnected: boolean;
  autoSchedule: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Premium Types
export interface ViralPost {
  id: string;
  title: string;
  topic: string;
  viralScore: number;
  formattedContent: string;
  template: string;
  hashtags: string[];
  resources: Array<{
    name: string;
    url: string;
  }>;
  aiInsights?: string;
  engagementPrediction?: number;
  bestPostingTime?: {
    day: string;
    time: string;
    timezone: string;
  };
  estimatedEngagement?: number;
  viralPotential?: number;
}

export interface ScheduledBatch {
  id: string;
  status: 'active' | 'paused' | 'completed' | 'cancelled';
  totalPosts: number;
  completedPosts: number;
  failedPosts: number;
  createdAt: string;
  nextPostDate?: string;
  progress: {
    percentage: number;
    completed: number;
    failed: number;
    remaining: number;
  };
}

export interface ScheduledJob {
  id: string;
  batch_id: string;
  post_id: string;
  post_data: ViralPost;
  scheduled_time: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  created_at: string;
  updated_at: string;
  published_at?: string;
  linkedin_post_id?: string;
  linkedin_post_urn?: string;
  error_message?: string;
}

export interface PremiumAnalytics {
  overview: {
    totalPosts: number;
    totalEngagement: number;
    averageViralScore: number;
    topPerformingTemplates: Array<{
      template: string;
      engagement: number;
      usage: number;
    }>;
    domainPerformance: Record<string, {
      posts: number;
      avgEngagement: number;
      viralScore: number;
    }>;
    engagementTrends: Array<{
      date: string;
      engagement: number;
      posts: number;
    }>;
  };
  insights: Array<{
    type: string;
    title: string;
    message: string;
    impact: 'high' | 'medium' | 'low';
    recommendation: string;
  }>;
  recommendations: Array<{
    type: string;
    title: string;
    description: string;
    actions: string[];
    expectedImpact: 'high' | 'medium' | 'low';
  }>;
  performance: {
    byTemplate: Array<{
      template: string;
      engagement: number;
      usage: number;
    }>;
    byDomain: Record<string, {
      posts: number;
      avgEngagement: number;
      viralScore: number;
    }>;
    byTime: Record<string, {
      posts: number;
      avgEngagement: number;
    }>;
    byEngagement: Record<string, {
      count: number;
      percentage: number;
    }>;
  };
} 