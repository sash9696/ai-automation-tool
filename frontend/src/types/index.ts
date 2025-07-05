export interface Post {
  id: string;
  content: string;
  topic: PostTopic;
  scheduledTime?: Date;
  publishedAt?: Date;
  status: PostStatus;
  analytics?: PostAnalytics;
  createdAt: Date;
  updatedAt: Date;
}

export type PostTopic = 'fullstack' | 'dsa' | 'interview' | 'placement';

export type PostStatus = 'draft' | 'scheduled' | 'published' | 'failed';

export interface PostAnalytics {
  views: number;
  likes: number;
  comments: number;
  shares: number;
  engagementRate: number;
}

export interface GeneratePostRequest {
  topic: PostTopic;
  tone?: 'professional' | 'casual' | 'motivational';
  includeHashtags?: boolean;
  includeCTA?: boolean;
}

export interface SchedulePostRequest {
  postId: string;
  scheduledTime: Date;
}

export interface LinkedInAuthResponse {
  accessToken: string;
  expiresAt: Date;
  profile: {
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