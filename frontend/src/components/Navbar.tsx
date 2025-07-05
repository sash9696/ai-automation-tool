import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Sparkles, 
  BarChart3, 
  Settings,
  User 
} from 'lucide-react';
import type { LinkedInAuthResponse } from '../types';

interface NavbarProps {
  linkedInProfile: LinkedInAuthResponse['profile'] | null;
}

const Navbar = ({ linkedInProfile }: NavbarProps) => {
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Generate Post', href: '/generate', icon: Sparkles },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
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
                </Link>
              );
            })}
          </div>

          {/* LinkedIn Status */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              {linkedInProfile ? (
                <div className="flex items-center space-x-2">
                  {linkedInProfile.profilePicture ? (
                    <img
                      src={linkedInProfile.profilePicture}
                      alt="Profile"
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <User className="w-8 h-8 text-blue-600" />
                  )}
                  <div className="hidden sm:block">
                    <p className="text-sm font-medium text-gray-900">
                      {linkedInProfile.firstName} {linkedInProfile.lastName}
                    </p>
                    <p className="text-xs text-green-600">Connected</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Not Connected</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 