import { useState } from 'react';
import { 
  Sparkles, 
  Clock, 
  Send,
  FileText,
  RefreshCw,
  Copy,
  Check,
  Brain,
  TrendingUp,
  CheckCircle,
  XCircle,
  X
} from 'lucide-react';
import { postsApi } from '../services/api';
import { postGenerator, analyzePost } from '../services/postGenerator';
import { TEMPLATE_CATEGORIES, TEMPLATE_STYLES } from '../constants/postTemplates';
import type { Post, PostTopic, GeneratePostRequest } from '../types';
import type { TemplateCategory, TemplateStyle } from '../constants/postTemplates';

const PostGenerator = () => {
  const [topic, setTopic] = useState<PostTopic>('fullstack');
  const [tone, setTone] = useState<'professional' | 'casual' | 'motivational'>('professional');
  const [includeHashtags, setIncludeHashtags] = useState(true);
  const [includeCTA, setIncludeCTA] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPost, setGeneratedPost] = useState<Post | null>(null);
  const [scheduledTime, setScheduledTime] = useState('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('09:00');
  const [isScheduling, setIsScheduling] = useState(false);
  
  // Template system state
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory>('frontend');
  const [selectedStyle, setSelectedStyle] = useState<TemplateStyle>('story');
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [copied, setCopied] = useState(false);
  const [postAnalysis, setPostAnalysis] = useState<{
    readabilityScore: number;
    engagementPotential: number;
    suggestions: string[];
  } | null>(null);
  
  // Toast notification state
  const [toast, setToast] = useState<{
    show: boolean;
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const topics = [
    { value: 'fullstack', label: 'Full Stack Development', emoji: '💻' },
    { value: 'dsa', label: 'Data Structures & Algorithms', emoji: '🧮' },
    { value: 'interview', label: 'Interview Preparation', emoji: '🎯' },
    { value: 'placement', label: 'College Placements', emoji: '🎓' },
  ];

  // Topic to category mapping (same as in postGenerator service)
  const topicToCategory: Record<PostTopic, TemplateCategory> = {
    'fullstack': 'frontend',
    'dsa': 'cs-concepts',
    'interview': 'interview-prep',
    'placement': 'tech-career'
  };

  // Handler for topic selection that updates category automatically
  const handleTopicChange = (newTopic: PostTopic) => {
    setTopic(newTopic);
    // Automatically update category based on topic
    const mappedCategory = topicToCategory[newTopic];
    if (mappedCategory) {
      setSelectedCategory(mappedCategory);
    }
  };

  const timeSlots = [
    { value: '07:00', label: '7:00 AM', description: 'Early morning engagement' },
    { value: '08:00', label: '8:00 AM', description: 'Morning commute time' },
    { value: '09:00', label: '9:00 AM', description: 'Work start time (Recommended)' },
    { value: '10:00', label: '10:00 AM', description: 'Mid-morning break' },
    { value: '11:00', label: '11:00 AM', description: 'Late morning' },
    { value: '12:00', label: '12:00 PM', description: 'Lunch break' },
    { value: '13:00', label: '1:00 PM', description: 'Early afternoon' },
    { value: '14:00', label: '2:00 PM', description: 'Mid-afternoon' },
    { value: '15:00', label: '3:00 PM', description: 'Late afternoon' },
    { value: '16:00', label: '4:00 PM', description: 'End of workday' },
    { value: '16:15', label: '4:15 PM', description: 'Late afternoon peak' },
    { value: '17:00', label: '5:00 PM', description: 'Evening commute' },
    { value: '18:00', label: '6:00 PM', description: 'Evening time' }
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
        selectedCategory,
        selectedStyle,
      };
      
      // Use the new template-based post generator
      const post = await postGenerator.generatePost(request);
      setGeneratedPost(post);
      
      // Analyze the generated post
      const analysis = analyzePost(post);
      setPostAnalysis(analysis);
      showToast('success', 'Post generated successfully! ✨');
    } catch (error) {
      console.error('Failed to generate post:', error);
      showToast('error', 'Failed to generate post. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRegenerate = async () => {
    setIsGenerating(true);
    try {
      const request: GeneratePostRequest = {
        topic,
        tone,
        includeHashtags,
        includeCTA,
        selectedCategory,
        selectedStyle,
      };
      
      // Regenerate with different template
      const post = await postGenerator.regeneratePost(request);
      setGeneratedPost(post);
      
      // Analyze the new post
      const analysis = analyzePost(post);
      setPostAnalysis(analysis);
      showToast('success', 'Post regenerated successfully! 🔄');
    } catch (error) {
      console.error('Failed to regenerate post:', error);
      showToast('error', 'Failed to regenerate post. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    if (generatedPost) {
      try {
        await navigator.clipboard.writeText(generatedPost.content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        showToast('success', 'Post copied to clipboard! 📋');
      } catch (error) {
        console.error('Failed to copy post:', error);
        showToast('error', 'Failed to copy post to clipboard.');
      }
    }
  };

  const createScheduledDateTime = (timeSlot: string, date: string) => {
    const scheduledDate = new Date(date + 'T' + timeSlot);
    return scheduledDate;
  };

  const handleSchedule = async () => {
    if (!generatedPost || !scheduledTime) return;
    
    setIsScheduling(true);
    try {
      const scheduledDate = createScheduledDateTime(selectedTimeSlot, scheduledTime);
      await postsApi.schedule({
        postId: generatedPost.id,
        scheduledTime: scheduledDate,
      });
      
      // Reset form
      setGeneratedPost(null);
      setScheduledTime('');
      setSelectedTimeSlot('09:00');
      showToast('success', 'Post scheduled successfully! ⏰');
    } catch (error) {
      console.error('Failed to schedule post:', error);
      showToast('error', 'Failed to schedule post. Please try again.');
    } finally {
      setIsScheduling(false);
    }
  };

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ show: true, type, message });
    setTimeout(() => setToast(null), 5000);
  };

  const handlePublishNow = async () => {
    if (!generatedPost) return;
    
    setIsScheduling(true);
    try {
      await postsApi.publish(generatedPost.id, generatedPost.content);
      setGeneratedPost(null);
      showToast('success', 'Post published successfully to LinkedIn! 🎉');
    } catch (error) {
      console.error('Failed to publish post:', error);
      showToast('error', 'Failed to publish post. Please try again.');
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
                  onClick={() => handleTopicChange(t.value as PostTopic)}
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

          {/* Template Selector Toggle */}
          <div className="mt-6">
            <button
              onClick={() => setShowTemplateSelector(!showTemplateSelector)}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center space-x-2"
            >
              <Brain className="w-4 h-4" />
              <span>{showTemplateSelector ? 'Hide' : 'Show'} Template Options</span>
            </button>
          </div>

          {/* Template Selector */}
          {showTemplateSelector && (
            <div className="mt-4 space-y-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Template Category
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {TEMPLATE_CATEGORIES.map((cat) => (
                    <button
                      key={cat.value}
                      onClick={() => setSelectedCategory(cat.value as TemplateCategory)}
                      className={`p-2 rounded text-sm text-left transition-colors ${
                        selectedCategory === cat.value
                          ? 'bg-blue-100 text-blue-700 border border-blue-300'
                          : 'bg-white border border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-lg mb-1">{cat.emoji}</div>
                      <div className="font-medium">{cat.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Template Style
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {TEMPLATE_STYLES.map((style) => (
                    <button
                      key={style.value}
                      onClick={() => setSelectedStyle(style.value as TemplateStyle)}
                      className={`p-2 rounded text-sm text-left transition-colors ${
                        selectedStyle === style.value
                          ? 'bg-blue-100 text-blue-700 border border-blue-300'
                          : 'bg-white border border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-lg mb-1">{style.emoji}</div>
                      <div className="font-medium">{style.label}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

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

              {/* Post Analysis */}
              {postAnalysis && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-3 flex items-center">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Post Analysis
                  </h4>
                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <div className="text-sm text-blue-700">Readability</div>
                      <div className="text-lg font-semibold text-blue-900">{postAnalysis.readabilityScore}/10</div>
                    </div>
                    <div>
                      <div className="text-sm text-blue-700">Engagement Potential</div>
                      <div className="text-lg font-semibold text-blue-900">{postAnalysis.engagementPotential}/10</div>
                    </div>
                  </div>
                  {postAnalysis.suggestions.length > 0 && (
                    <div>
                      <div className="text-sm text-blue-700 mb-2">Suggestions:</div>
                      <ul className="text-sm text-blue-800 space-y-1">
                        {postAnalysis.suggestions.map((suggestion, index) => (
                          <li key={index} className="flex items-start">
                            <span className="text-blue-600 mr-2">•</span>
                            {suggestion}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <button
                  onClick={handleRegenerate}
                  disabled={isGenerating}
                  className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex-1 flex items-center justify-center space-x-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Regenerate</span>
                </button>
                
                <button
                  onClick={handleCopy}
                  className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex-1 flex items-center justify-center space-x-2"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
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
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Schedule Date
                </label>
                <input
                    type="date"
                    value={scheduledTime ? scheduledTime.split('T')[0] : ''}
                    onChange={(e) => {
                      const date = e.target.value;
                      if (date) {
                        setScheduledTime(date + 'T' + selectedTimeSlot);
                      } else {
                        setScheduledTime('');
                      }
                    }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Schedule Time
                  </label>
                  <div className="grid grid-cols-3 gap-2 max-h-32 overflow-y-auto">
                    {timeSlots.map((timeSlot) => (
                      <label key={timeSlot.value} className="relative flex items-start">
                        <input
                          type="radio"
                          name="scheduleTime"
                          value={timeSlot.value}
                          checked={selectedTimeSlot === timeSlot.value}
                          onChange={(e) => {
                            setSelectedTimeSlot(e.target.value);
                            if (scheduledTime && scheduledTime.includes('T')) {
                              setScheduledTime(scheduledTime.split('T')[0] + 'T' + e.target.value);
                            }
                          }}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                        />
                        <div className="ml-2 flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-900">{timeSlot.label}</span>
                            {timeSlot.value === '09:00' && (
                              <span className="text-xs bg-blue-100 text-blue-800 px-1 py-0.5 rounded-full">
                                Best
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500">{timeSlot.description}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
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

      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 max-w-sm w-full transition-all duration-300">
          <div className={`${
            toast.type === 'success' 
              ? 'bg-green-50 border-green-200' 
              : 'bg-red-50 border-red-200'
          } border rounded-lg shadow-lg p-4 flex items-start space-x-3`}>
            {toast.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : (
              <XCircle className="w-5 h-5 text-red-500" />
            )}
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">{toast.message}</p>
            </div>
            <button
              onClick={() => setToast(null)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostGenerator; 