// src/components/ui/AuthRouter.jsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSupabase } from 'context/SupabaseContext';

// Loading component
const AuthLoading = () => (
  <div className="flex items-center justify-center min-h-screen bg-background">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
      <p className="text-text-secondary">Loading...</p>
    </div>
  </div>
);

// Protected Route Component
export const ProtectedRoute = ({ children }) => {
  const { user, loading, initialized } = useSupabase();
  const location = useLocation();

  // Show loading while authentication is being initialized
  if (!initialized || loading) {
    return <AuthLoading />;
  }

  // Redirect to login if not authenticated
  if (!user) {
    return (
      <Navigate 
        to="/user-login" 
        state={{ from: location.pathname }} 
        replace 
      />
    );
  }

  return children;
};

// Public Route Component (redirects to dashboard if already authenticated)
export const PublicRoute = ({ children }) => {
  const { user, loading, initialized } = useSupabase();
  const location = useLocation();

  // Show loading while authentication is being initialized
  if (!initialized || loading) {
    return <AuthLoading />;
  }

  // Redirect to dashboard if already authenticated
  if (user) {
    const from = location.state?.from || '/student-dashboard';
    return <Navigate to={from} replace />;
  }

  return children;
};

// Role-based Route Component (for future expansion)
export const RoleBasedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading, initialized } = useSupabase();
  const location = useLocation();

  // Show loading while authentication is being initialized
  if (!initialized || loading) {
    return <AuthLoading />;
  }

  // Redirect to login if not authenticated
  if (!user) {
    return (
      <Navigate 
        to="/user-login" 
        state={{ from: location.pathname }} 
        replace 
      />
    );
  }

  // Check if user has required role (when roles are implemented)
  const userRole = user?.user_metadata?.role || 'student';
  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    return (
      <Navigate 
        to="/unauthorized" 
        state={{ from: location.pathname }} 
        replace 
      />
    );
  }

  return children;
};

export default { ProtectedRoute, PublicRoute, RoleBasedRoute };