import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Icon from '../AppIcon';

const PrimaryNavigation = () => {
  const [user, setUser] = useState(null);
  const location = useLocation();

  // Mock user data - in real app this would come from auth context
  useEffect(() => {
    const mockUser = {
      role: 'student', // student, teacher, admin
    };
    setUser(mockUser);
  }, []);

  const navigationItems = [
    {
      label: 'Dashboard',
      path: user?.role === 'student' ? '/student-dashboard' : '/teacher-dashboard',
      icon: 'LayoutDashboard',
      roles: ['student', 'teacher', 'admin'],
      tooltip: 'Your personalized learning hub'
    },
    {
      label: 'Library',
      path: '/learning-content-library',
      icon: 'BookOpen',
      roles: ['student', 'teacher', 'admin'],
      tooltip: 'Explore learning materials'
    },
    {
      label: 'Profile',
      path: '/user-profile-management',
      icon: 'User',
      roles: ['student', 'teacher', 'admin'],
      tooltip: 'Manage your account'
    }
  ];

  const filteredNavItems = navigationItems.filter(item => 
    user && item.roles.includes(user.role)
  );

  const isAuthPage = location.pathname === '/user-login' || location.pathname === '/user-registration';

  if (isAuthPage || !user) {
    return null;
  }

  return (
    <>
      {/* Desktop Navigation - Hidden on mobile */}
      <nav className="hidden md:block">
        {/* This is handled by Header component on desktop */}
      </nav>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-1000 bg-surface border-t border-border md:hidden">
        <div className="flex items-center justify-around h-20 px-4">
          {filteredNavItems.map((item) => {
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center justify-center space-y-1 px-3 py-2 rounded-lg min-w-0 flex-1 animation-smooth hover-lift ${
                  isActive
                    ? 'text-primary bg-primary-50' :'text-text-secondary hover:text-primary hover:bg-primary-50'
                }`}
                title={item.tooltip}
              >
                <div className={`p-1 rounded-md ${isActive ? 'bg-primary text-white' : ''}`}>
                  <Icon 
                    name={item.icon} 
                    size={20} 
                    color={isActive ? 'white' : 'currentColor'}
                  />
                </div>
                <span className={`text-xs font-medium truncate ${
                  isActive ? 'font-semibold' : ''
                }`}>
                  {item.label}
                </span>
                {isActive && (
                  <div className="w-1 h-1 bg-primary rounded-full animate-scale-in"></div>
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Spacer for mobile bottom navigation */}
      <div className="h-20 md:hidden"></div>
    </>
  );
};

export default PrimaryNavigation;