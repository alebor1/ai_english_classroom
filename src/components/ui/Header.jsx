import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Mock user data - in real app this would come from auth context
  useEffect(() => {
    const mockUser = {
      name: 'John Doe',
      role: 'student', // student, teacher, admin
      avatar: '/assets/images/avatar.png'
    };
    setUser(mockUser);
  }, []);

  const isAuthPage = location.pathname === '/user-login' || location.pathname === '/user-registration';

  const navigationItems = [
    {
      label: 'Dashboard',
      path: user?.role === 'student' ? '/student-dashboard' : '/teacher-dashboard',
      icon: 'LayoutDashboard',
      roles: ['student', 'teacher', 'admin']
    },
    {
      label: 'Library',
      path: '/learning-content-library',
      icon: 'BookOpen',
      roles: ['student', 'teacher', 'admin']
    },
    {
      label: 'Profile',
      path: '/user-profile-management',
      icon: 'User',
      roles: ['student', 'teacher', 'admin']
    }
  ];

  const filteredNavItems = navigationItems.filter(item => 
    user && item.roles.includes(user.role)
  );

  const handleLogout = () => {
    setUser(null);
    setIsUserMenuOpen(false);
    navigate('/user-login');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  const closeMenus = () => {
    setIsMenuOpen(false);
    setIsUserMenuOpen(false);
  };

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.menu-container')) {
        closeMenus();
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  if (isAuthPage) {
    return (
      <header className="fixed top-0 left-0 right-0 z-1000 bg-surface border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2 hover-lift">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Icon name="GraduationCap" size={20} color="white" />
              </div>
              <span className="text-xl font-semibold text-text-primary">EduLearn</span>
            </Link>
            
            <div className="flex items-center space-x-4">
              <Link 
                to="/user-login" 
                className="text-text-secondary hover:text-primary animation-smooth"
              >
                Sign In
              </Link>
              <Link 
                to="/user-registration" 
                className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-700 animation-smooth hover-lift"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-1000 bg-surface border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 hover-lift">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Icon name="GraduationCap" size={20} color="white" />
            </div>
            <span className="text-xl font-semibold text-text-primary">EduLearn</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {filteredNavItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium animation-smooth hover-lift ${
                  location.pathname === item.path
                    ? 'text-primary bg-primary-50' :'text-text-secondary hover:text-primary hover:bg-primary-50'
                }`}
              >
                <Icon name={item.icon} size={18} />
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* User Menu & Mobile Menu Button */}
          <div className="flex items-center space-x-4">
            {user && (
              <div className="relative menu-container">
                <button
                  onClick={toggleUserMenu}
                  className="flex items-center space-x-2 p-2 rounded-md hover:bg-primary-50 animation-smooth focus-ring"
                >
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <Icon name="User" size={16} color="#2563EB" />
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-text-primary">
                    {user.name}
                  </span>
                  <Icon 
                    name="ChevronDown" 
                    size={16} 
                    className={`transform transition-transform duration-200 ${
                      isUserMenuOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-surface rounded-md shadow-lg border border-border animate-fade-in">
                    <div className="py-1">
                      <div className="px-4 py-2 border-b border-border">
                        <p className="text-sm font-medium text-text-primary">{user.name}</p>
                        <p className="text-xs text-text-secondary capitalize">{user.role}</p>
                      </div>
                      <Link
                        to="/user-profile-management"
                        className="block px-4 py-2 text-sm text-text-secondary hover:text-primary hover:bg-primary-50 animation-smooth"
                        onClick={closeMenus}
                      >
                        <div className="flex items-center space-x-2">
                          <Icon name="Settings" size={16} />
                          <span>Settings</span>
                        </div>
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-text-secondary hover:text-accent hover:bg-accent-50 animation-smooth"
                      >
                        <div className="flex items-center space-x-2">
                          <Icon name="LogOut" size={16} />
                          <span>Sign Out</span>
                        </div>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMenu}
              className="md:hidden p-2 rounded-md hover:bg-primary-50 animation-smooth focus-ring menu-container"
            >
              <Icon name={isMenuOpen ? "X" : "Menu"} size={20} />
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-border bg-surface animate-slide-up">
            <nav className="px-2 pt-2 pb-3 space-y-1">
              {filteredNavItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium animation-smooth ${
                    location.pathname === item.path
                      ? 'text-primary bg-primary-50' :'text-text-secondary hover:text-primary hover:bg-primary-50'
                  }`}
                  onClick={closeMenus}
                >
                  <Icon name={item.icon} size={20} />
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;