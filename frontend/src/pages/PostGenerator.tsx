import { useState } from 'react';
import { 
  Sparkles, 
  Clock, 
  Send,
  FileText
} from 'lucide-react';
import { postsApi } from '../services/api';
import type { Post, PostTopic, GeneratePostRequest } from '../types';

const PostGenerator = () => {
  const [topic, setTopic] = useState<PostTopic>('fullstack');
  const [tone, setTone] = useState<'professional' | 'casual' | 'motivational'>('professional');
  const [includeHashtags, setIncludeHashtags] = useState(true);
  const [includeCTA, setIncludeCTA] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPost, setGeneratedPost] = useState<Post | null>(null);
  const [scheduledTime, setScheduledTime] = useState('');
  const [isScheduling, setIsScheduling] = useState(false);

  const topics = [
    { value: 'fullstack', label: 'Full Stack Development', emoji: '💻' },
    { value: 'dsa', label: 'Data Structures & Algorithms', emoji: '🧮' },
    { value: 'interview', label: 'Interview Preparation', emoji: '🎯' },
    { value: 'placement', label: 'College Placements', emoji: '🎓' },
  ];

  const tones = [
    { value: 'professional', label: 'Professional' },
    { value: 'casual', label: 'Casual' },
    { value: 'motivational', label: 'Motivational' },
  ];

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const request: GeneratePostRequest = {
        topic,
        tone,
        includeHashtags,
        includeCTA,
      };
      
      const post = await postsApi.generate(request);
      setGeneratedPost(post);
    } catch (error) {
      console.error('Failed to generate post:', error);
      // In a real app, show a toast notification
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSchedule = async () => {
    if (!generatedPost || !scheduledTime) return;
    
    setIsScheduling(true);
    try {
      const scheduledDate = new Date(scheduledTime);
      await postsApi.schedule({
        postId: generatedPost.id,
        scheduledTime: scheduledDate,
      });
      
      // Reset form
      setGeneratedPost(null);
      setScheduledTime('');
      // In a real app, show success notification and redirect
    } catch (error) {
      console.error('Failed to schedule post:', error);
    } finally {
      setIsScheduling(false);
    }
  };

  const handlePublishNow = async () => {
    if (!generatedPost) return;
    
    setIsScheduling(true);
    try {
      await postsApi.publish(generatedPost.id);
      setGeneratedPost(null);
      // In a real app, show success notification
    } catch (error) {
      console.error('Failed to publish post:', error);
    } finally {
      setIsScheduling(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Generate Post</h1>
        <p className="text-gray-600 mt-1">Create viral LinkedIn posts with AI</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Configuration Panel */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Post Configuration</h2>
          
          {/* Topic Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Topic Category
            </label>
            <div className="grid grid-cols-2 gap-3">
              {topics.map((t) => (
                <button
                  key={t.value}
                  onClick={() => setTopic(t.value as PostTopic)}
                  className={`p-3 rounded-lg border-2 text-left transition-colors ${
                    topic === t.value
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-2xl mb-1">{t.emoji}</div>
                  <div className="text-sm font-medium">{t.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Tone Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Tone
            </label>
            <div className="space-y-2">
              {tones.map((t) => (
                <label key={t.value} className="flex items-center">
                  <input
                    type="radio"
                    name="tone"
                    value={t.value}
                    checked={tone === t.value}
                    onChange={(e) => setTone(e.target.value as typeof tone)}
                    className="mr-3"
                  />
                  <span className="text-sm">{t.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Options */}
          <div className="space-y-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={includeHashtags}
                onChange={(e) => setIncludeHashtags(e.target.checked)}
                className="mr-3"
              />
              <span className="text-sm">Include relevant hashtags</span>
            </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={includeCTA}
                onChange={(e) => setIncludeCTA(e.target.checked)}
                className="mr-3"
              />
              <span className="text-sm">Include call-to-action</span>
            </label>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 w-full mt-6 flex items-center justify-center space-x-2"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Generating...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>Generate Post</span>
              </>
            )}
          </button>
        </div>

        {/* Generated Post Preview */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Post Preview</h2>
          
          {!generatedPost ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No post generated yet</h3>
              <p className="text-gray-600">Configure your settings and click "Generate Post" to create content</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Post Content */}
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-900 whitespace-pre-wrap">{generatedPost.content}</p>
              </div>

              {/* Post Details */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Topic:</span>
                  <span className="font-medium">{topics.find(t => t.value === generatedPost.topic)?.label}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Status:</span>
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                    Draft
                  </span>
                </div>
              </div>

              {/* Scheduling */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  Schedule Post
                </label>
                <input
                  type="datetime-local"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min={new Date().toISOString().slice(0, 16)}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <button
                  onClick={handlePublishNow}
                  disabled={isScheduling}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex-1 flex items-center justify-center space-x-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Publish Now</span>
                </button>
                
                <button
                  onClick={handleSchedule}
                  disabled={isScheduling || !scheduledTime}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex-1 flex items-center justify-center space-x-2"
                >
                  <Clock className="w-4 h-4" />
                  <span>Schedule</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PostGenerator; 