import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route } from "react-router-dom";
import ScrollToTop from "components/ScrollToTop";
import ErrorBoundary from "components/ErrorBoundary";
import { ProtectedRoute, PublicRoute } from "components/ui/AuthRouter";

// Page imports
import UserRegistration from "pages/user-registration";
import UserLogin from "pages/user-login";
import EmailVerification from "pages/email-verification";
import StudentDashboard from "pages/student-dashboard";
import LessonChat from "pages/student-dashboard/components/LessonChat";
import SpeechSettingsModal from "pages/speech-settings-modal";
import NotFound from "pages/NotFound";

const Routes = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <ScrollToTop />
        <RouterRoutes>
          {/* Public routes - redirect to dashboard if authenticated */}
          <Route 
            path="/user-registration" 
            element={
              <PublicRoute>
                <UserRegistration />
              </PublicRoute>
            } 
          />
          <Route 
            path="/user-login" 
            element={
              <PublicRoute>
                <UserLogin />
              </PublicRoute>
            } 
          />
          <Route 
            path="/email-verification" 
            element={
              <PublicRoute>
                <EmailVerification />
              </PublicRoute>
            } 
          />
          
          {/* Protected routes - require authentication */}
          <Route 
            path="/student-dashboard" 
            element={
              <ProtectedRoute>
                <StudentDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/lesson-chat/:sessionId" 
            element={
              <ProtectedRoute>
                <LessonChat />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/speech-settings-modal" 
            element={
              <ProtectedRoute>
                <SpeechSettingsModal />
              </ProtectedRoute>
            } 
          />
          
          {/* Default route */}
          <Route path="/" element={<UserRegistration />} />
          
          {/* 404 route */}
          <Route path="*" element={<NotFound />} />
        </RouterRoutes>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;