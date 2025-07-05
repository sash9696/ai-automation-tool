import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import PostGenerator from './pages/PostGenerator';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import Premium from './pages/Premium';
import { linkedInApi } from './services/api';
import type { LinkedInAuthResponse } from './types';

function App() {
  const [linkedInProfile, setLinkedInProfile] = useState<LinkedInAuthResponse['profile'] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkLinkedInStatus = async () => {
      try {
        const status = await linkedInApi.getStatus();
        if (status.connected && status.profile) {
          setLinkedInProfile(status.profile);
        }
      } catch (error) {
        console.error('Failed to check LinkedIn status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkLinkedInStatus();
  }, []);

  if (isLoading) {
  return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar linkedInProfile={linkedInProfile} />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/generate" element={<PostGenerator />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/premium" element={<Premium />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
