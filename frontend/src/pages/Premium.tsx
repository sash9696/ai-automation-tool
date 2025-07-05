import { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Calendar, 
  TrendingUp, 
  Zap,
  Clock,
  CheckCircle,
  AlertTriangle,
  Play,
  Pause,
  X,
  RefreshCw,
  ExternalLink,
  Crown,
  Target,
  Users,
  Activity
} from 'lucide-react';
import { premiumApi } from '../services/api';
import type { ViralPost, ScheduledBatch, PremiumAnalytics } from '../types';

const Premium = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);
  const [generatedPosts, setGeneratedPosts] = useState<ViralPost[]>([]);
  const [scheduledBatches, setScheduledBatches] = useState<ScheduledBatch[]>([]);
  const [analytics, setAnalytics] = useState<PremiumAnalytics | null>(null);
  const [selectedDomains, setSelectedDomains] = useState<string[]>(['technology', 'frontend', 'ai']);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('viral');
  const [isLoading, setIsLoading] = useState(true);

  const domains = [
    { value: 'technology', label: 'Technology', icon: '💻', description: 'Latest tech trends and innovations' },
    { value: 'frontend', label: 'Frontend Development', icon: '🎨', description: 'UI/UX, frameworks, and best practices' },
    { value: 'ai', label: 'Artificial Intelligence', icon: '🤖', description: 'AI, ML, and automation insights' }
  ];

  const templates = [
    { value: 'viral', label: 'Viral Hook', score: 95, description: 'High-engagement hooks with compelling stories' },
    { value: 'controversy', label: 'Controversial Take', score: 98, description: 'Provocative insights that spark discussion' },
    { value: 'educational', label: 'Educational Value', score: 92, description: 'Problem-solution format with resources' },
    { value: 'story', label: 'Story-Driven', score: 88, description: 'Personal narratives with lessons learned' },
    { value: 'listicle', label: 'Listicle', score: 85, description: 'Numbered lists for easy consumption' }
  ];

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [batchesResponse, analyticsResponse] = await Promise.all([
        premiumApi.getBatches(),
        premiumApi.getAnalytics()
      ]);
      
      setScheduledBatches(batchesResponse.data?.batches || []);
      setAnalytics(analyticsResponse.data || null);
    } catch (error) {
      console.error('Failed to fetch premium data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateTrendingPosts = async () => {
    setIsGenerating(true);
    try {
      const response = await premiumApi.generateTrending({
        domains: selectedDomains,
        template: selectedTemplate
      });
      
      setGeneratedPosts(response.data?.posts || []);
    } catch (error) {
      console.error('Failed to generate trending posts:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleScheduleBatch = async () => {
    if (generatedPosts.length === 0) return;
    
    setIsScheduling(true);
    try {
      await premiumApi.scheduleBatch({
        posts: generatedPosts,
        scheduleTime: '09:00'
      });
      
      // Refresh the batches list
      const batchesResponse = await premiumApi.getBatches();
      setScheduledBatches(batchesResponse.data?.batches || []);
      setGeneratedPosts([]);
      
      // Refresh analytics
      const analyticsResponse = await premiumApi.getAnalytics();
      setAnalytics(analyticsResponse.data || null);
      
    } catch (error) {
      console.error('Failed to schedule batch:', error);
    } finally {
      setIsScheduling(false);
    }
  };

  const handleBatchAction = async (batchId: string, action: 'pause' | 'resume' | 'cancel') => {
    try {
      switch (action) {
        case 'pause':
          await premiumApi.pauseBatch(batchId);
          break;
        case 'resume':
          await premiumApi.resumeBatch(batchId);
          break;
        case 'cancel':
          await premiumApi.cancelBatch(batchId);
          break;
      }
      
      // Refresh the batches list to get updated status
      const batchesResponse = await premiumApi.getBatches();
      setScheduledBatches(batchesResponse.data?.batches || []);
      
    } catch (error) {
      console.error(`Failed to ${action} batch:`, error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <Play className="w-4 h-4 text-green-500" />;
      case 'paused':
        return <Pause className="w-4 h-4 text-yellow-500" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-blue-500" />;
      case 'cancelled':
        return <X className="w-4 h-4 text-red-500" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <Crown className="w-8 h-8 text-yellow-500" />
            <h1 className="text-3xl font-bold text-gray-900">Premium Viral Scheduler</h1>
          </div>
          <p className="text-gray-600">Generate and schedule 7 days of trending content with one click</p>
        </div>
        
        <div className="flex items-center space-x-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-lg">
          <Sparkles className="w-5 h-5" />
          <span className="font-semibold">Premium Feature</span>
        </div>
      </div>

      {/* Quick Stats */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Viral Posts</p>
                <p className="text-2xl font-bold text-gray-900">{analytics?.overview?.totalPosts ?? 0}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Engagement</p>
                <p className="text-2xl font-bold text-blue-600">{analytics?.overview?.totalEngagement ?? 0}</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Viral Score</p>
                <p className="text-2xl font-bold text-purple-600">{analytics?.overview?.averageViralScore ?? 0}</p>
              </div>
              <Target className="w-8 h-8 text-purple-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Batches</p>
                <p className="text-2xl font-bold text-orange-600">{scheduledBatches.filter(b => b.status === 'active').length}</p>
              </div>
              <Activity className="w-8 h-8 text-orange-500" />
            </div>
          </div>
        </div>
      )}

      {/* Content Generation */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Generate Viral Content</h2>
          <p className="text-gray-600 mt-1">Select domains and templates to generate trending posts</p>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Domain Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Content Domains</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {domains.map((domain) => (
                <label key={domain.value} className="relative flex items-start">
                  <input
                    type="checkbox"
                    checked={selectedDomains.includes(domain.value)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedDomains(prev => [...prev, domain.value]);
                      } else {
                        setSelectedDomains(prev => prev.filter(d => d !== domain.value));
                      }
                    }}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <div className="ml-3">
                    <div className="flex items-center">
                      <span className="text-lg mr-2">{domain.icon}</span>
                      <span className="text-sm font-medium text-gray-900">{domain.label}</span>
                    </div>
                    <p className="text-xs text-gray-500">{domain.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Template Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Viral Template</label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates.map((template) => (
                <label key={template.value} className="relative flex items-start">
                  <input
                    type="radio"
                    name="template"
                    value={template.value}
                    checked={selectedTemplate === template.value}
                    onChange={(e) => setSelectedTemplate(e.target.value)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <div className="ml-3 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900">{template.label}</span>
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                        {template.score}%
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{template.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <div className="flex items-center space-x-4">
            <button
              onClick={handleGenerateTrendingPosts}
              disabled={isGenerating || selectedDomains.length === 0}
              className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                <Zap className="w-5 h-5" />
              )}
              <span>{isGenerating ? 'Generating...' : 'Generate Viral Posts'}</span>
            </button>
            
            {generatedPosts.length > 0 && (
              <button
                onClick={handleScheduleBatch}
                disabled={isScheduling}
                className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isScheduling ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  <Calendar className="w-5 h-5" />
                )}
                <span>{isScheduling ? 'Scheduling...' : `Schedule ${generatedPosts.length} Posts`}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Generated Posts Preview */}
      {generatedPosts.length > 0 && (
        <div className="bg-white rounded-lg shadow-md border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Generated Posts ({generatedPosts.length})</h3>
            <p className="text-gray-600 mt-1">Preview your viral content before scheduling</p>
          </div>
          
          <div className="p-6 space-y-4">
            {generatedPosts.map((post, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-500">Day {index + 1}</span>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      {post.template}
                    </span>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                      {post.viralScore}% viral
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">9:00 AM</span>
                </div>
                
                <h4 className="font-medium text-gray-900 mb-2">{post.title}</h4>
                <p className="text-sm text-gray-600 line-clamp-3">{post.formattedContent}</p>
                
                {post.resources && post.resources.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs font-medium text-gray-700 mb-1">Resources:</p>
                    <div className="flex flex-wrap gap-2">
                      {post.resources.slice(0, 3).map((resource, idx) => (
                        <a
                          key={idx}
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                        >
                          <span>{resource.name}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Scheduled Batches */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Scheduled Batches</h3>
              <p className="text-gray-600 mt-1">Manage your viral content schedule</p>
            </div>
            <button
              onClick={fetchInitialData}
              className="text-blue-600 hover:text-blue-700"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <div className="p-6">
          {scheduledBatches.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No scheduled batches</h3>
              <p className="text-gray-600">Generate and schedule your first viral content batch</p>
            </div>
          ) : (
            <div className="space-y-4">
              {scheduledBatches.map((batch) => (
                <div key={batch.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(batch.status)}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(batch.status)}`}>
                        {batch.status}
                      </span>
                      <span className="text-sm text-gray-600">
                        {new Date(batch.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {batch.status === 'active' && (
                        <button
                          onClick={() => handleBatchAction(batch.id, 'pause')}
                          className="text-yellow-600 hover:text-yellow-700"
                        >
                          <Pause className="w-4 h-4" />
                        </button>
                      )}
                      
                      {batch.status === 'paused' && (
                        <button
                          onClick={() => handleBatchAction(batch.id, 'resume')}
                          className="text-green-600 hover:text-green-700"
                        >
                          <Play className="w-4 h-4" />
                        </button>
                      )}
                      
                      {batch.status !== 'completed' && batch.status !== 'cancelled' && (
                        <button
                          onClick={() => handleBatchAction(batch.id, 'cancel')}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span>{batch.totalPosts ?? 0} posts</span>
                      <span>{batch.completedPosts ?? 0} completed</span>
                      <span>{batch.failedPosts ?? 0} failed</span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${batch.progress?.percentage ?? 0}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-600">{batch.progress?.percentage ?? 0}%</span>
                    </div>
                  </div>
                  
                  {batch.nextPostDate && (
                    <div className="mt-3 text-sm text-gray-600">
                      <Clock className="w-4 h-4 inline mr-1" />
                      Next post: {batch.nextPostDate ? new Date(batch.nextPostDate).toLocaleString() : 'N/A'}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Premium; 