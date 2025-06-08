// /home/ubuntu/app/ai_english_classroom/src/pages/student-dashboard/index.jsx
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Header from 'components/ui/Header';
import ProgressOverview from './components/ProgressOverview';
import CurrentLessonCard from './components/CurrentLessonCard';
import UpcomingLessons from './components/UpcomingLessons';
import AITutorChat from './components/AITutorChat';
import RecentAchievements from './components/RecentAchievements';
import DailyGoals from './components/DailyGoals';
import QuickActions from './components/QuickActions';
import Icon from 'components/AppIcon';

const StudentDashboard = () => {
  const location = useLocation();
  const [toast, setToast] = useState(null);
  
  // Handle toast display from navigation state
  useEffect(() => {
    if (location.state?.showToast) {
      setToast({
        message: location.state.toastMessage || 'Operation successful',
        type: location.state.toastType || 'success',
      });
      
      // Clear the toast after 5 seconds
      const timer = setTimeout(() => {
        setToast(null);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [location.state]);
  
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Toast notification */}
      {toast && (
        <div className={`fixed top-20 right-4 z-50 animate-in fade-in slide-in-from-top-4 duration-300 max-w-sm ${
          toast.type === 'success' ? 'bg-success/10 border-success/30 text-success' : 
          toast.type === 'error'? 'bg-error/10 border-error/30 text-error' : 'bg-primary/10 border-primary/30 text-primary'
        } border rounded-lg px-4 py-3 shadow-lg`}>
          <div className="flex items-center">
            <Icon 
              name={
                toast.type === 'success' ? 'CheckCircle' : 
                toast.type === 'error'? 'AlertCircle' : 'Info'
              } 
              className="mr-2" 
              size={20} 
            />
            <p>{toast.message}</p>
            <button 
              onClick={() => setToast(null)}
              className="ml-auto text-current hover:text-current/80"
            >
              <Icon name="X" size={16} />
            </button>
          </div>
        </div>
      )}
      
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column */}
          <div className="lg:col-span-2 space-y-6">
            <ProgressOverview />
            <CurrentLessonCard />
            <UpcomingLessons />
          </div>
          
          {/* Right column */}
          <div className="space-y-6">
            <AITutorChat />
            <RecentAchievements />
            <DailyGoals />
            <QuickActions />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;