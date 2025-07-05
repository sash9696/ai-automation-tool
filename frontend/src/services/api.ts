import axios from 'axios';
import type { 
  Post, 
  GeneratePostRequest, 
  SchedulePostRequest, 
  LinkedInAuthResponse,
  AppSettings,
  ApiResponse 
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for auth tokens
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // Add premium user header for premium features
  if (config.url?.includes('/premium')) {
    config.headers['x-premium-user'] = 'true';
  }
  
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const postsApi = {
  // Generate new post
  generate: async (request: GeneratePostRequest): Promise<Post> => {
    const response = await api.post<ApiResponse<Post>>('/posts/generate', request);
    return response.data.data!;
  },

  // Get all posts
  getAll: async (): Promise<Post[]> => {
    const response = await api.get<ApiResponse<Post[]>>('/posts');
    return response.data.data!;
  },

  // Get single post
  getById: async (id: string): Promise<Post> => {
    const response = await api.get<ApiResponse<Post>>(`/posts/${id}`);
    return response.data.data!;
  },

  // Update post
  update: async (id: string, updates: Partial<Post>): Promise<Post> => {
    const response = await api.put<ApiResponse<Post>>(`/posts/${id}`, updates);
    return response.data.data!;
  },

  // Delete post
  delete: async (id: string): Promise<void> => {
    await api.delete(`/posts/${id}`);
  },

  // Schedule post
  schedule: async (request: SchedulePostRequest): Promise<Post> => {
    const response = await api.post<ApiResponse<Post>>('/posts/schedule', request);
    return response.data.data!;
  },

  // Publish post immediately
  publish: async (id: string): Promise<Post> => {
    const response = await api.post<ApiResponse<Post>>(`/posts/${id}/publish`);
    return response.data.data!;
  },

  // Get analytics
  getAnalytics: async (id: string): Promise<Post['analytics']> => {
    const response = await api.get<ApiResponse<Post['analytics']>>(`/posts/${id}/analytics`);
    return response.data.data!;
  },

  // Optimize post
  optimize: async (request: any): Promise<any> => {
    const response = await api.post('/posts/optimize', request);
    return response.data.data;
  },

  // Analyze post
  analyze: async (request: any): Promise<any> => {
    const response = await api.post('/posts/analyze', request);
    return response.data.data;
  },
};

export const linkedInApi = {
  // Get auth URL
  getAuthUrl: async (): Promise<string> => {
    const response = await api.get<ApiResponse<{ authUrl: string }>>('/linkedin/auth-url');
    return response.data.data!.authUrl;
  },

  // Handle OAuth callback
  handleCallback: async (code: string): Promise<LinkedInAuthResponse> => {
    const response = await api.get<ApiResponse<LinkedInAuthResponse>>(`/linkedin/callback?code=${code}`);
    return response.data.data!;
  },

  // Check connection status
  getStatus: async (): Promise<{ connected: boolean; profile?: LinkedInAuthResponse['profile'] }> => {
    const statusResponse = await api.get<ApiResponse<{ connected: boolean; hasValidToken: boolean }>>('/linkedin/status');
    const status = statusResponse.data.data!;
    
    if (status.connected && status.hasValidToken) {
      try {
        const profileResponse = await api.get<ApiResponse<{ profile: LinkedInAuthResponse['profile'] }>>('/linkedin/profile');
        return {
          connected: true,
          profile: profileResponse.data.data!.profile
        };
      } catch (error) {
        console.error('Failed to fetch profile:', error);
        return { connected: true, profile: undefined };
      }
    }
    
    return { connected: false, profile: undefined };
  },

  // Disconnect LinkedIn
  disconnect: async (): Promise<void> => {
    await api.post('/linkedin/disconnect');
  },

  // Schedule LinkedIn post
  schedulePost: async (request: { postId: string; scheduledTime?: string; useOptimalTime?: boolean; preferredDay?: string }): Promise<any> => {
    const response = await api.post<ApiResponse<any>>('/posts/schedule-linkedin', request);
    return response.data.data!;
  },

  // Get scheduled LinkedIn posts
  getScheduledPosts: async (): Promise<any[]> => {
    const response = await api.get<ApiResponse<any[]>>('/posts/scheduled-linkedin');
    return response.data.data!;
  },

  // Cancel scheduled LinkedIn post
  cancelScheduledPost: async (jobId: string): Promise<any> => {
    const response = await api.delete<ApiResponse<any>>(`/posts/scheduled-linkedin/${jobId}`);
    return response.data.data!;
  },

  // Get optimal posting times
  getOptimalTimes: async (): Promise<any[]> => {
    const response = await api.get<ApiResponse<any[]>>('/posts/optimal-times');
    return response.data.data!;
  },

  // Publish post to LinkedIn
  publishPost: async (postData: any): Promise<any> => {
    const response = await api.post('/linkedin/publish', postData);
    return response.data.data;
  },

  // Get LinkedIn profile
  getProfile: async (): Promise<any> => {
    const response = await api.get('/linkedin/profile');
    return response.data.data;
  },
};

export const settingsApi = {
  // Get settings
  get: async (): Promise<AppSettings> => {
    const response = await api.get<ApiResponse<AppSettings>>('/settings');
    return response.data.data!;
  },

  // Update settings
  update: async (settings: Partial<AppSettings>): Promise<AppSettings> => {
    const response = await api.put<ApiResponse<AppSettings>>('/settings', settings);
    return response.data.data!;
  },
};

export const premiumApi = {
  // Generate trending posts
  generateTrendingPosts: async (request: {
    domains?: string[];
    template?: string;
    scheduleTime?: string;
  }): Promise<any> => {
    const response = await api.post('/premium/generate-trending', request);
    return response.data.data;
  },

  // Schedule viral batch
  scheduleViralBatch: async (request: {
    posts: any[];
    scheduleTime?: string;
  }): Promise<any> => {
    const response = await api.post('/premium/schedule-batch', request);
    return response.data.data;
  },

  // Get scheduled batches
  getScheduledBatches: async (): Promise<any[]> => {
    const response = await api.get<ApiResponse<any[]>>('/premium/scheduled-batches');
    return response.data.data!;
  },

  // Get analytics
  getAnalytics: async (): Promise<any> => {
    const response = await api.get<ApiResponse<any>>('/premium/analytics');
    return response.data.data;
  },

  // Pause batch
  pauseBatch: async (batchId: string): Promise<any> => {
    const response = await api.post<ApiResponse<any>>(`/premium/batches/${batchId}/pause`);
    return response.data.data;
  },

  // Resume batch
  resumeBatch: async (batchId: string): Promise<any> => {
    const response = await api.post<ApiResponse<any>>(`/premium/batches/${batchId}/resume`);
    return response.data.data;
  },

  // Cancel batch
  cancelBatch: async (batchId: string): Promise<any> => {
    const response = await api.post<ApiResponse<any>>(`/premium/batches/${batchId}/cancel`);
    return response.data.data;
  },

  // Get batch details
  getBatchDetails: async (batchId: string): Promise<any> => {
    const response = await api.get<ApiResponse<any>>(`/premium/batches/${batchId}`);
    return response.data.data;
  },
};

export default api; 