import React from 'react';
import { Link } from 'react-router-dom';
import Icon from 'components/AppIcon';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-surface border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2 hover-lift">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Icon name="GraduationCap" size={20} color="white" />
              </div>
              <span className="text-xl font-semibold text-text-primary">AI English Classroom</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="text-center max-w-md mx-auto">
          <div className="mb-8">
            <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Icon name="AlertTriangle" size={48} color="var(--color-primary)" />
            </div>
            <h1 className="text-4xl font-bold text-text-primary mb-4">404</h1>
            <h2 className="text-xl font-semibold text-text-primary mb-2">Page Not Found</h2>
            <p className="text-text-secondary mb-8">
              The page you're looking for doesn't exist or has been moved.
            </p>
          </div>

          <div className="space-y-4">
            <Link
              to="/user-registration"
              className="w-full bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700 animation-smooth hover-lift inline-block"
            >
              Go to Registration
            </Link>
            <Link
              to="/user-login"
              className="w-full bg-surface text-primary border border-primary px-6 py-3 rounded-lg font-medium hover:bg-primary-50 animation-smooth hover-lift inline-block"
            >
              Sign In Instead
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-surface border-t border-border">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="text-center text-sm text-text-secondary">
            © {new Date().getFullYear()} AI English Classroom. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default NotFound;