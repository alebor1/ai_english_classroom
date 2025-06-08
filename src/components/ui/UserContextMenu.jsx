import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';

const UserContextMenu = ({ user, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  const handleLogout = () => {
    closeMenu();
    if (onLogout) {
      onLogout();
    } else {
      navigate('/user-login');
    }
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        closeMenu();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close menu on escape key
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        closeMenu();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  if (!user) {
    return null;
  }

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'student':
        return 'bg-primary-100 text-primary';
      case 'teacher':
        return 'bg-secondary-100 text-secondary';
      case 'admin':
        return 'bg-warning-100 text-warning';
      default:
        return 'bg-border text-text-secondary';
    }
  };

  const menuItems = [
    {
      label: 'Profile Settings',
      path: '/user-profile-management',
      icon: 'Settings',
      description: 'Manage your account preferences'
    },
    {
      label: 'Notifications',
      path: '/notifications',
      icon: 'Bell',
      description: 'View your notifications',
      badge: '3' // Example notification count
    },
    {
      label: 'Help & Support',
      path: '/help',
      icon: 'HelpCircle',
      description: 'Get help and support'
    }
  ];

  return (
    <div className="relative" ref={menuRef}>
      {/* User Menu Trigger */}
      <button
        onClick={toggleMenu}
        className="flex items-center space-x-2 p-2 rounded-lg hover:bg-primary-50 animation-smooth focus-ring"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {/* User Avatar */}
        <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center overflow-hidden">
          {user.avatar ? (
            <img 
              src={user.avatar} 
              alt={user.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : null}
          <div className={`w-full h-full flex items-center justify-center ${user.avatar ? 'hidden' : ''}`}>
            <Icon name="User" size={16} color="#2563EB" />
          </div>
        </div>

        {/* User Info - Hidden on small screens */}
        <div className="hidden sm:block text-left">
          <div className="text-sm font-medium text-text-primary truncate max-w-32">
            {user.name}
          </div>
          <div className={`text-xs px-2 py-0.5 rounded-full inline-block ${getRoleBadgeColor(user.role)}`}>
            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
          </div>
        </div>

        {/* Dropdown Arrow */}
        <Icon 
          name="ChevronDown" 
          size={16} 
          className={`transform transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-surface rounded-lg shadow-lg border border-border animate-fade-in z-1100">
          {/* User Info Header */}
          <div className="px-4 py-3 border-b border-border">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center overflow-hidden">
                {user.avatar ? (
                  <img 
                    src={user.avatar} 
                    alt={user.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div className={`w-full h-full flex items-center justify-center ${user.avatar ? 'hidden' : ''}`}>
                  <Icon name="User" size={20} color="#2563EB" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-text-primary truncate">
                  {user.name}
                </div>
                <div className="text-xs text-text-secondary truncate">
                  {user.email || 'user@example.com'}
                </div>
                <div className={`text-xs px-2 py-0.5 rounded-full inline-block mt-1 ${getRoleBadgeColor(user.role)}`}>
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </div>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-1">
            {menuItems.map((item, index) => (
              <Link
                key={index}
                to={item.path}
                className="flex items-center px-4 py-3 text-sm text-text-secondary hover:text-primary hover:bg-primary-50 animation-smooth"
                onClick={closeMenu}
              >
                <Icon name={item.icon} size={16} className="mr-3" />
                <div className="flex-1">
                  <div className="font-medium">{item.label}</div>
                  <div className="text-xs text-text-secondary">{item.description}</div>
                </div>
                {item.badge && (
                  <span className="ml-2 bg-accent text-white text-xs px-2 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </Link>
            ))}
          </div>

          {/* Divider */}
          <div className="border-t border-border"></div>

          {/* Logout */}
          <div className="py-1">
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-4 py-3 text-sm text-text-secondary hover:text-accent hover:bg-accent-50 animation-smooth"
            >
              <Icon name="LogOut" size={16} className="mr-3" />
              <div className="text-left">
                <div className="font-medium">Sign Out</div>
                <div className="text-xs text-text-secondary">Sign out of your account</div>
              </div>
            </button>
          </div>

          {/* Footer */}
          <div className="px-4 py-2 border-t border-border bg-background rounded-b-lg">
            <div className="flex items-center justify-between text-xs text-text-secondary">
              <span>Version 1.0.0</span>
              <div className="flex items-center space-x-1">
                <Icon name="Shield" size={12} />
                <span>Secure</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserContextMenu;