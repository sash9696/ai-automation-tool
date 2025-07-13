import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import PostGenerator from './pages/PostGenerator';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import Premium from './pages/Premium';
import Login from './pages/Login';
import { linkedInApi, authApi } from './services/api';
import type { LinkedInAuthResponse, User } from './types';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [linkedInProfile, setLinkedInProfile] = useState<LinkedInAuthResponse['profile'] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // Check if we have an access token
        const accessToken = localStorage.getItem('accessToken');
        if (!accessToken) {
          setIsLoading(false);
          return;
        }

        // Check if user is authenticated with the token
        const authData = await authApi.check();
        
        if (authData.authenticated && authData.user) {
          setUser(authData.user);
          
          // If user is authenticated, check LinkedIn status
      try {
        const status = await linkedInApi.getStatus();
        if (status.connected && status.profile) {
          setLinkedInProfile(status.profile);
        }
      } catch (error) {
        console.error('Failed to check LinkedIn status:', error);
          }
        } else {
          // Token is invalid, clear it
          localStorage.removeItem('accessToken');
        }
      } catch (error) {
        console.error('Failed to check auth status:', error);
        // Clear invalid token
        localStorage.removeItem('accessToken');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const handleLogin = (userData: User) => {
    setUser(userData);
  };

  const handleLogout = async () => {
    try {
      await authApi.logout();
      localStorage.removeItem('accessToken');
      setUser(null);
      setLinkedInProfile(null);
    } catch (error) {
      console.error('Logout failed:', error);
      // Clear local state even if logout request fails
      localStorage.removeItem('accessToken');
      setUser(null);
      setLinkedInProfile(null);
    }
  };

  if (isLoading) {
  return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Show login page if not authenticated
  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar 
          linkedInProfile={linkedInProfile} 
          user={user}
          onLogout={handleLogout}
        />
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
