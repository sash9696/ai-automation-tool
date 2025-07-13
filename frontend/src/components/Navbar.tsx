import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Sparkles, 
  BarChart3, 
  Settings,
  Crown,
  User,
  LogOut
} from 'lucide-react';
import type { LinkedInAuthResponse } from '../types';

interface User {
  id: string;
  email: string;
  name: string;
}

interface NavbarProps {
  linkedInProfile: LinkedInAuthResponse['profile'] | null;
  user: User;
  onLogout: () => Promise<void>;
}

const Navbar = ({ linkedInProfile, user, onLogout }: NavbarProps) => {
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Generate Post', href: '/generate', icon: Sparkles },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
    { name: 'Premium', href: '/premium', icon: Crown },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">AI</span>
              </div>
              <span className="text-xl font-bold text-gray-900">LinkedIn AI</span>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.name}</span>
                  {item.name === 'Premium' && (
                    <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs px-2 py-1 rounded-full">
                      PRO
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* User Profile & LinkedIn Status */}
          <div className="flex items-center space-x-4">
            {/* User Info */}
              <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-blue-600" />
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-gray-900">
                  {user.name}
                  </p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
            </div>

            {/* LinkedIn Status */}
            <div className="flex items-center space-x-2">
              {linkedInProfile ? (
              <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs text-green-600 font-medium">LinkedIn Connected</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  <span className="text-xs text-gray-500">LinkedIn Disconnected</span>
                </div>
              )}
              </div>

            {/* Logout Button */}
            <button
              onClick={onLogout}
              className="flex items-center space-x-1 px-3 py-2 text-sm text-gray-600 hover:text-red-600 transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 