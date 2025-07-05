import { useState, useEffect } from 'react';
import { 
  Eye, 
  Heart, 
  MessageCircle,
  Share,
  BarChart3,
  Calendar
} from 'lucide-react';
import { postsApi } from '../services/api';
import type { Post } from '../types';

const Analytics = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const fetchedPosts = await postsApi.getAll();
        setPosts(fetchedPosts);
      } catch (error) {
        console.error('Failed to fetch posts:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, []);

  // Calculate analytics
  const publishedPosts = posts.filter(p => p.status === 'published');
  const totalViews = publishedPosts.reduce((sum, post) => sum + (post.analytics?.views || 0), 0);
  const totalLikes = publishedPosts.reduce((sum, post) => sum + (post.analytics?.likes || 0), 0);
  const totalComments = publishedPosts.reduce((sum, post) => sum + (post.analytics?.comments || 0), 0);
  const totalShares = publishedPosts.reduce((sum, post) => sum + (post.analytics?.shares || 0), 0);
  const avgEngagement = publishedPosts.length > 0 
    ? publishedPosts.reduce((sum, post) => sum + (post.analytics?.engagementRate || 0), 0) / publishedPosts.length
    : 0;

  const topPosts = publishedPosts
    .sort((a, b) => (b.analytics?.views || 0) - (a.analytics?.views || 0))
    .slice(0, 5);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600 mt-1">Track your post performance and engagement</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Calendar className="w-5 h-5 text-gray-500" />
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value as typeof selectedPeriod)}
            className="w-auto px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Views</p>
              <p className="text-2xl font-bold text-gray-900">{totalViews.toLocaleString()}</p>
            </div>
            <Eye className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Likes</p>
              <p className="text-2xl font-bold text-gray-900">{totalLikes.toLocaleString()}</p>
            </div>
            <Heart className="w-8 h-8 text-red-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Comments</p>
              <p className="text-2xl font-bold text-gray-900">{totalComments.toLocaleString()}</p>
            </div>
            <MessageCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Shares</p>
              <p className="text-2xl font-bold text-gray-900">{totalShares.toLocaleString()}</p>
            </div>
            <Share className="w-8 h-8 text-purple-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Engagement</p>
              <p className="text-2xl font-bold text-gray-900">{avgEngagement.toFixed(1)}%</p>
            </div>
            <BarChart3 className="w-8 h-8 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Top Performing Posts */}
              <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Top Performing Posts</h2>
          
          {topPosts.length === 0 ? (
            <div className="text-center py-12">
              <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No published posts yet</h3>
              <p className="text-gray-600">Publish some posts to see analytics here</p>
            </div>
        ) : (
          <div className="space-y-4">
            {topPosts.map((post, index) => (
              <div key={post.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                      <span className="text-sm text-gray-500">
                        {new Date(post.publishedAt!).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-gray-900 line-clamp-2 mb-3">{post.content}</p>
                    
                    {post.analytics && (
                      <div className="flex items-center space-x-6 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <Eye className="w-4 h-4" />
                          <span>{post.analytics.views.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Heart className="w-4 h-4" />
                          <span>{post.analytics.likes.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MessageCircle className="w-4 h-4" />
                          <span>{post.analytics.comments.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Share className="w-4 h-4" />
                          <span>{post.analytics.shares.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <BarChart3 className="w-4 h-4" />
                          <span>{post.analytics.engagementRate.toFixed(1)}%</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Topic Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Performance by Topic</h2>
          <div className="space-y-4">
            {['fullstack', 'dsa', 'interview', 'placement'].map((topic) => {
              const topicPosts = publishedPosts.filter(p => p.topic === topic);
              const topicViews = topicPosts.reduce((sum, post) => sum + (post.analytics?.views || 0), 0);
              const topicEngagement = topicPosts.length > 0 
                ? topicPosts.reduce((sum, post) => sum + (post.analytics?.engagementRate || 0), 0) / topicPosts.length
                : 0;
              
              return (
                <div key={topic} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 capitalize">{topic}</p>
                    <p className="text-sm text-gray-600">{topicPosts.length} posts</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">{topicViews.toLocaleString()} views</p>
                    <p className="text-sm text-gray-600">{topicEngagement.toFixed(1)}% engagement</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Activity</h2>
          <div className="space-y-4">
            {publishedPosts.slice(0, 5).map((post) => (
              <div key={post.id} className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900 line-clamp-1">{post.content}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(post.publishedAt!).toLocaleDateString()} • {post.analytics?.views || 0} views
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics; 