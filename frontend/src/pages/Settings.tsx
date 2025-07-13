import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  LinkIcon, 
  ClockIcon, 
  CheckIcon,
  XMarkIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { linkedInApi, settingsApi } from '../services/api';
import type { AppSettings, PostTopic, LinkedInAuthResponse } from '../types';

const Settings = () => {
  const [searchParams] = useSearchParams();
  const [settings, setSettings] = useState<AppSettings>({
    defaultPostTime: '09:00',
    preferredTopics: ['fullstack'],
    linkedInConnected: false,
    autoSchedule: false,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [linkedInStatus, setLinkedInStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });
  const [linkedInProfile, setLinkedInProfile] = useState<LinkedInAuthResponse['profile'] | undefined>(undefined);
  const [linkedInConnected, setLinkedInConnected] = useState(false);
  const [isRefreshingStatus, setIsRefreshingStatus] = useState(false);

  const topics = [
    { value: 'fullstack', label: 'Full Stack Development' },
    { value: 'dsa', label: 'Data Structures & Algorithms' },
    { value: 'interview', label: 'Interview Preparation' },
    { value: 'placement', label: 'College Placements' },
  ];

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const fetchedSettings = await settingsApi.get();
        setSettings(fetchedSettings);
      } catch (error) {
        console.error('Failed to fetch settings:', error);
      } finally {
        setIsLoading(false);
      }
    };

          const fetchLinkedInStatus = async () => {
        try {
          const status = await linkedInApi.getStatus();
          setLinkedInConnected(status.connected);
          setLinkedInProfile(status.profile || undefined);
        } catch (error) {
          console.error('Failed to fetch LinkedIn status:', error);
          setLinkedInConnected(false);
          setLinkedInProfile(undefined);
        }
      };

    fetchSettings();
    fetchLinkedInStatus();
  }, []);

  // Handle LinkedIn callback status
  useEffect(() => {
    const linkedinParam = searchParams.get('linkedin');
    const messageParam = searchParams.get('message');
    const codeParam = searchParams.get('code');
    
    if (linkedinParam === 'callback' && codeParam) {
      // Handle LinkedIn OAuth callback
      const completeLinkedInAuth = async () => {
        try {
          setIsConnecting(true);
          setLinkedInStatus({ type: 'success', message: 'Processing LinkedIn connection...' });
          
          // Send the authorization code to backend to complete authentication
          const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api'}/linkedin/complete-auth`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
            },
            body: JSON.stringify({ code: codeParam }),
          });
          
          if (response.ok) {
            const result = await response.json();
            setLinkedInStatus({ type: 'success', message: 'LinkedIn connected successfully!' });
            setLinkedInConnected(true);
            setLinkedInProfile(result.data.profile || undefined);
          } else {
            const error = await response.json();
            setLinkedInStatus({ type: 'error', message: error.error || 'LinkedIn connection failed' });
          }
        } catch (error) {
          console.error('LinkedIn auth completion error:', error);
          setLinkedInStatus({ type: 'error', message: 'LinkedIn connection failed' });
        } finally {
          setIsConnecting(false);
          // Clean up URL params
          const newUrl = new URL(window.location.href);
          newUrl.searchParams.delete('linkedin');
          newUrl.searchParams.delete('code');
          window.history.replaceState({}, '', newUrl.toString());
        }
      };
      
      completeLinkedInAuth();
    } else if (linkedinParam === 'success') {
      setLinkedInStatus({ type: 'success', message: 'LinkedIn connected successfully!' });
      // Refresh LinkedIn status to show connected status
      linkedInApi.getStatus().then(status => {
        setLinkedInConnected(status.connected);
        setLinkedInProfile(status.profile || undefined);
      }).catch(console.error);
    } else if (linkedinParam === 'error') {
      setLinkedInStatus({ type: 'error', message: messageParam || 'LinkedIn connection failed' });
    }
  }, [searchParams]);

  const handleLinkedInConnect = async () => {
    setIsConnecting(true);
    try {
      const authUrl = await linkedInApi.getAuthUrl();
      window.open(authUrl, '_blank');
    } catch (error) {
      console.error('Failed to get LinkedIn auth URL:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleLinkedInDisconnect = async () => {
    try {
      await linkedInApi.disconnect();
      setLinkedInConnected(false);
      setLinkedInProfile(undefined);
    } catch (error) {
      console.error('Failed to disconnect LinkedIn:', error);
    }
  };

  const handleRefreshLinkedInStatus = async () => {
    setIsRefreshingStatus(true);
    try {
      const status = await linkedInApi.getStatus();
      setLinkedInConnected(status.connected);
      setLinkedInProfile(status.profile || undefined);
    } catch (error) {
      console.error('Failed to refresh LinkedIn status:', error);
    } finally {
      setIsRefreshingStatus(false);
    }
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      const updatedSettings = await settingsApi.update(settings);
      setSettings(updatedSettings);
      // In a real app, show success notification
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const toggleTopic = (topic: PostTopic) => {
    setSettings(prev => ({
      ...prev,
      preferredTopics: (prev.preferredTopics || []).includes(topic)
        ? (prev.preferredTopics || []).filter(t => t !== topic)
        : [...(prev.preferredTopics || []), topic]
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Configure your LinkedIn automation preferences</p>
      </div>

      {/* LinkedIn Connection */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">LinkedIn Connection</h2>
        
        {/* LinkedIn Status Message */}
        {linkedInStatus.type && (
          <div className={`mb-4 p-4 rounded-lg ${
            linkedInStatus.type === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-800' 
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            <div className="flex items-center">
              {linkedInStatus.type === 'success' ? (
                <CheckIcon className="w-5 h-5 mr-2" />
              ) : (
                <XMarkIcon className="w-5 h-5 mr-2" />
              )}
              <span className="font-medium">{linkedInStatus.message}</span>
            </div>
          </div>
        )}
        
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-3">
            {linkedInConnected ? (
              <CheckIcon className="w-6 h-6 text-green-500" />
            ) : (
              <XMarkIcon className="w-6 h-6 text-red-500" />
            )}
            <div>
              <p className="font-medium text-gray-900">
                {linkedInConnected ? 'Connected to LinkedIn' : 'Not connected'}
              </p>
              <p className="text-sm text-gray-600">
                {linkedInConnected 
                  ? linkedInProfile 
                    ? `Connected as ${linkedInProfile.firstName} ${linkedInProfile.lastName}`
                    : 'Your account is connected and ready to post'
                  : 'Connect your LinkedIn account to start posting'
                }
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={handleRefreshLinkedInStatus}
              disabled={isRefreshingStatus}
              className="btn-secondary flex items-center space-x-2"
            >
              <ArrowPathIcon className={`w-4 h-4 ${isRefreshingStatus ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
            
            {linkedInConnected ? (
              <button
                onClick={handleLinkedInDisconnect}
                className="btn-secondary"
              >
                Disconnect
              </button>
            ) : (
              <button
                onClick={handleLinkedInConnect}
                disabled={isConnecting}
                className="btn-primary flex items-center space-x-2"
              >
                <LinkIcon className="w-4 h-4" />
                <span>{isConnecting ? 'Connecting...' : 'Connect LinkedIn'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Post Preferences */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Post Preferences</h2>
        
        {/* Default Post Time */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Default Post Time
          </label>
          <div className="flex items-center space-x-2">
            <ClockIcon className="w-5 h-5 text-gray-500" />
            <input
              type="time"
              value={settings.defaultPostTime}
              onChange={(e) => setSettings(prev => ({ ...prev, defaultPostTime: e.target.value }))}
              className="input-field w-auto"
            />
          </div>
          <p className="text-sm text-gray-600 mt-1">
            Posts will be scheduled for this time by default
          </p>
        </div>

        {/* Preferred Topics */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Preferred Topics
          </label>
          <div className="grid grid-cols-2 gap-3">
            {topics.map((topic) => (
              <label key={topic.value} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={(settings.preferredTopics || []).includes(topic.value as PostTopic)}
                  onChange={() => toggleTopic(topic.value as PostTopic)}
                  className="mr-3"
                />
                <span className="text-sm">{topic.label}</span>
              </label>
            ))}
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Select topics you want to focus on for content generation
          </p>
        </div>

        {/* Auto Schedule */}
        <div className="mb-6">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={settings.autoSchedule}
              onChange={(e) => setSettings(prev => ({ ...prev, autoSchedule: e.target.checked }))}
              className="mr-3"
            />
            <div>
              <span className="text-sm font-medium text-gray-700">Auto-schedule posts</span>
              <p className="text-sm text-gray-600">
                Automatically schedule generated posts at the default time
              </p>
            </div>
          </label>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSaveSettings}
          disabled={isSaving}
          className="btn-primary"
        >
          {isSaving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
};

export default Settings; 