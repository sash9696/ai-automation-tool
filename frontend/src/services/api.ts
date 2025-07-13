import axios from 'axios';
import type { 
  Post, 
  GeneratePostRequest, 
  SchedulePostRequest, 
  LinkedInAuthResponse,
  AppSettings,
  ApiResponse,
  ViralPost,
  ScheduledBatch,
  PremiumAnalytics,
  ScheduledJob,
  User
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor for auth tokens
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // Add premium user header for premium features
  if (config.url?.includes('/premium')) {
    config.headers['x-premium-user'] = 'true';
  }
  
  return config;
});

// Response interceptor for error handling and token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh the token
        const refreshResponse = await api.post('/auth/refresh');
        const newAccessToken = refreshResponse.data.data.accessToken;
        
        // Store new access token
        localStorage.setItem('accessToken', newAccessToken);
        
        // Retry the original request with new token
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, clear tokens and redirect to login
        localStorage.removeItem('accessToken');
        window.location.href = '/';
        return Promise.reject(refreshError);
    }
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
  publish: async (id: string, content?: string): Promise<Post> => {
    const response = await api.post<ApiResponse<Post>>(`/posts/${id}/publish`, { content });
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

export const authApi = {
  // Register new user
  register: async (credentials: { email: string; name: string; password: string }): Promise<{ user: User; accessToken: string }> => {
    const response = await api.post<ApiResponse<{ user: User; accessToken: string }>>('/auth/register', credentials);
    return response.data.data!;
  },

  // Login user
  login: async (credentials: { email: string; password: string }): Promise<{ user: User; accessToken: string }> => {
    const response = await api.post<ApiResponse<{ user: User; accessToken: string }>>('/auth/login', credentials);
    return response.data.data!;
  },

  // Refresh access token
  refresh: async (): Promise<{ user: User; accessToken: string }> => {
    const response = await api.post<ApiResponse<{ user: User; accessToken: string }>>('/auth/refresh');
    return response.data.data!;
  },

  // Check authentication status
  check: async (): Promise<{ authenticated: boolean; user?: User }> => {
    const response = await api.get<ApiResponse<{ authenticated: boolean; user?: User }>>('/auth/check');
    return response.data.data!;
  },

  // Quick login
  quickLogin: async (credentials: { email: string; name: string }): Promise<{ user: User; accessToken: string }> => {
    const response = await api.post<ApiResponse<{ user: User; accessToken: string }>>('/auth/quick-login', credentials);
    return response.data.data!;
  },

  // Logout
  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
  },

  // Logout from all devices
  logoutAll: async (): Promise<void> => {
    await api.post('/auth/logout-all');
  },

  // Change password
  changePassword: async (passwords: { currentPassword: string; newPassword: string }): Promise<void> => {
    await api.post('/auth/change-password', passwords);
  },

  // Get current user
  getCurrentUser: async (): Promise<{ user: User }> => {
    const response = await api.get<ApiResponse<{ user: User }>>('/auth/user');
    return response.data.data!;
  },
};

export const premiumApi = {
  // Generate trending content
  generateTrending: async (data: { domains: string[], template?: string, count?: number }): Promise<ApiResponse<{ posts: ViralPost[], totalPosts: number, domains: string[], template: string, generatedAt: string }>> => {
    const response = await fetch(`${API_BASE_URL}/premium/generate-trending`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  },

  // Schedule batch
  scheduleBatch: async (data: { posts: ViralPost[], scheduleTime?: string, timezone?: string }): Promise<ApiResponse<{ batchId: string, totalPosts: number, scheduleTime: string, status: string, message: string, createdAt: string }>> => {
    const response = await fetch(`${API_BASE_URL}/premium/schedule-batch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  },

  // Get all batches
  getBatches: async (): Promise<ApiResponse<{ batches: ScheduledBatch[], totalBatches: number }>> => {
    const response = await fetch(`${API_BASE_URL}/premium/batches`);
    const data = await response.json();
    
    // Transform snake_case to camelCase
    if (data.success && data.data?.batches) {
      data.data.batches = data.data.batches.map((batch: {
        id: string;
        status: string;
        total_posts?: number;
        completed_posts?: number;
        failed_posts?: number;
        created_at: string;
        next_post_date?: string;
        jobStats?: {
          total: number;
          completed: number;
          failed: number;
        };
      }) => ({
        id: batch.id,
        status: batch.status as 'active' | 'paused' | 'completed' | 'cancelled',
        totalPosts: batch.total_posts || 0,
        completedPosts: batch.completed_posts || 0,
        failedPosts: batch.failed_posts || 0,
        createdAt: batch.created_at,
        nextPostDate: batch.next_post_date,
        progress: {
          percentage: batch.jobStats ? Math.round(((batch.jobStats.completed || 0) / (batch.jobStats.total || 1)) * 100) : 0,
          completed: batch.jobStats?.completed || 0,
          failed: batch.jobStats?.failed || 0,
          remaining: (batch.jobStats?.total || 0) - (batch.jobStats?.completed || 0) - (batch.jobStats?.failed || 0)
        }
      }));
    }
    
    return data;
  },

  // Get batch details
  getBatchDetails: async (batchId: string): Promise<ApiResponse<ScheduledBatch>> => {
    const response = await fetch(`${API_BASE_URL}/premium/batches/${batchId}`);
    return response.json();
  },

  // Cancel batch
  cancelBatch: async (batchId: string): Promise<ApiResponse<{ success: boolean, message: string }>> => {
    const response = await fetch(`${API_BASE_URL}/premium/batches/${batchId}`, {
      method: 'DELETE'
    });
    return response.json();
  },

  // Get scheduled jobs
  getScheduledJobs: async (limit?: number): Promise<ApiResponse<{ jobs: ScheduledJob[], totalJobs: number }>> => {
    const params = limit ? `?limit=${limit}` : '';
    const response = await fetch(`${API_BASE_URL}/premium/jobs${params}`);
    return response.json();
  },

  // Get analytics
  getAnalytics: async (): Promise<ApiResponse<PremiumAnalytics>> => {
    const response = await fetch(`${API_BASE_URL}/premium/analytics`);
    return response.json();
  },

  // Get worker status
  getWorkerStatus: async (): Promise<ApiResponse<{ isRunning: boolean, lastCheck: string, stats: { total: number, pending: number, completed: number, failed: number } }>> => {
    const response = await fetch(`${API_BASE_URL}/premium/worker/status`);
    return response.json();
  },

  // Pause batch
  pauseBatch: async (batchId: string): Promise<ApiResponse<{ success: boolean, message: string }>> => {
    const response = await fetch(`${API_BASE_URL}/premium/batches/${batchId}/pause`, {
      method: 'POST'
    });
    return response.json();
  },

  // Resume batch
  resumeBatch: async (batchId: string): Promise<ApiResponse<{ success: boolean, message: string }>> => {
    const response = await fetch(`${API_BASE_URL}/premium/batches/${batchId}/resume`, {
      method: 'POST'
    });
    return response.json();
  }
};

export default api; 