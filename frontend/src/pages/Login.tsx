import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { authApi } from '../services/api';
import type { User } from '../types';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string) => {
    if (password.length < 8) {
      return 'Password must be at least 8 characters long';
    }
    if (!/(?=.*[a-z])/.test(password)) {
      return 'Password must contain at least one lowercase letter';
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      return 'Password must contain at least one uppercase letter';
    }
    if (!/(?=.*\d)/.test(password)) {
      return 'Password must contain at least one number';
    }
    if (!/(?=.*[@$!%*?&])/.test(password)) {
      return 'Password must contain at least one special character (@$!%*?&)';
    }
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!email || (!isLogin && !name) || !password) {
      setError('Please fill in all required fields');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (!isLogin) {
      const passwordError = validatePassword(password);
      if (passwordError) {
        setError(passwordError);
        return;
      }

      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }
    }

    setIsLoading(true);
    setError('');

    try {
      let data;
      if (isLogin) {
        data = await authApi.login({ email, password });
      } else {
        data = await authApi.register({ email, name, password });
      }

      // Store access token in localStorage
      localStorage.setItem('accessToken', data.accessToken);
      
      onLogin(data.user);
    } catch (error: any) {
      console.error('Authentication error:', error);
      setError(error.response?.data?.error || error.message || 'Authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = async () => {
    if (!email || !name) {
      setError('Please enter both email and name for quick login');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const data = await authApi.quickLogin({ email, name });
      
      // Store access token in localStorage
      localStorage.setItem('accessToken', data.accessToken);
      
      onLogin(data.user);
    } catch (error: any) {
      console.error('Quick login error:', error);
      setError(error.response?.data?.error || error.message || 'Quick login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <Card className="w-full max-w-md p-8 shadow-xl">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">AI</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            LinkedIn AI Tool
          </h1>
          <p className="text-gray-600">
            {isLogin ? 'Sign in to your account' : 'Create your account'}
          </p>
        </div>

        <div className="flex mb-6">
          <button
            type="button"
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-2 px-4 text-sm font-medium rounded-l-lg border ${
              isLogin
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-2 px-4 text-sm font-medium rounded-r-lg border-t border-r border-b ${
              !isLogin
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address *
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your email"
              required
            />
          </div>

          {!isLogin && (
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your full name"
                required
              />
            </div>
          )}

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password *
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder={isLogin ? 'Enter your password' : 'Create a strong password'}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            {!isLogin && (
              <div className="mt-1 text-xs text-gray-500">
                Password must contain at least 8 characters, including uppercase, lowercase, number, and special character
              </div>
            )}
          </div>

          {!isLogin && (
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password *
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Confirm your password"
                required
              />
            </div>
          )}

          {error && (
            <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md border border-red-200">
              {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors disabled:opacity-50"
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {isLogin ? 'Signing in...' : 'Creating account...'}
              </span>
            ) : (
              isLogin ? 'Sign In' : 'Create Account'
            )}
          </Button>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Development Mode</span>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            {isLogin && (
              <div className="space-y-2">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Enter your name for quick login"
                />
                <Button
                  type="button"
                  onClick={handleQuickLogin}
                  disabled={isLoading}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md transition-colors"
                >
                  {isLoading ? 'Logging in...' : 'Quick Login (No Password)'}
                </Button>
              </div>
            )}
            
            <p className="text-xs text-center text-gray-500">
              {isLogin ? 'Quick login is available for development/demo purposes' : 'Use strong credentials for your account'}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Login; 