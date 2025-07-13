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

export type PostTone = 
  | 'conversational' 
  | 'storytelling' 
  | 'mentor-like' 
  | 'colleague-sharing' 
  | 'thoughtful' 
  | 'enthusiastic' 
  | 'humble-expert' 
  | 'community-focused';

export type PostStatus = 'draft' | 'scheduled' | 'published' | 'failed';

export interface PostAnalytics {
  views: number;
  likes: number;
  comments: number;
  shares: number;
  engagementRate: number;
}

export interface GeneratePostRequest {
  topic?: PostTopic;
  includeHashtags?: boolean;
  includeCTA?: boolean;
  customPrompt?: string;
  useCustomPrompt?: boolean;
  vibe?: string;
  postType?: string;
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

export interface User {
  id: string;
  email: string;
  name: string;
  linkedInProfile?: LinkedInAuthResponse['profile'];
  settings: AppSettings;
  createdAt: Date;
  updatedAt: Date;
}

export interface LinkedInPostRequest {
  text: string;
  visibility?: 'PUBLIC' | 'CONNECTIONS';
}

export interface LinkedInPostResponse {
  id: string;
  text: string;
  createdAt: Date;
  visibility: string;
}

export interface QueueJob {
  id: string;
  type: 'post' | 'schedule' | 'analytics';
  data: any;
  priority?: number;
  delay?: number;
}

export interface ErrorResponse {
  success: false;
  error: string;
  message?: string;
  code?: string;
}

export interface SuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
} 