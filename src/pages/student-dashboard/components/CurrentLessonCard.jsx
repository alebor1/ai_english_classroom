// src/pages/student-dashboard/components/CurrentLessonCard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from 'components/ui/Button';
import { useSupabase } from 'context/SupabaseContext';

const CurrentLessonCard = () => {
  const navigate = useNavigate();
  const { getLessonSessions, user, initialized } = useSupabase();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch current active session on component mount
  useEffect(() => {
    const fetchCurrentSession = async () => {
      // Don't fetch if authentication context is not initialized
      if (!initialized) {
        setLoading(false);
        return;
      }

      // Don't fetch if user is not authenticated
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        setError(null);
        const sessions = await getLessonSessions();
        // Find the most recent active session
        const activeSession = sessions?.find(s => s?.status === 'active');
        setSession(activeSession || null);
      } catch (err) {
        console.error('Error fetching current session:', err);
        setError(err?.message || 'Failed to load current session');
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentSession();
  }, [getLessonSessions, user?.id, initialized]);

  // Show loading state
  if (loading) {
    return (
      <div className="bg-surface rounded-xl shadow-sm border border-border overflow-hidden p-4">
        <h3 className="font-semibold text-lg text-text-primary mb-1">Current Lesson</h3>
        <div className="animate-pulse space-y-4">
          <div className="h-20 bg-border/50 rounded"></div>
          <div className="h-10 bg-border/50 rounded"></div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="bg-surface rounded-xl shadow-sm border border-border overflow-hidden">
        <div className="p-4">
          <h3 className="font-semibold text-lg text-text-primary mb-1">Current Lesson</h3>
          <div className="bg-error/10 border border-error/30 text-error rounded-lg px-4 py-3 mb-4">
            <p className="text-sm">{error}</p>
          </div>
          <Button
            onClick={() => window.location.reload()}
            variant="outline"
            className="w-full"
            iconName="RefreshCw"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  // Show no active session state
  if (!session) {
    return (
      <div className="bg-surface rounded-xl shadow-sm border border-border overflow-hidden">
        <div className="p-4">
          <h3 className="font-semibold text-lg text-text-primary mb-1">Current Lesson</h3>
          <p className="text-text-secondary text-sm mb-3">
            No active lessons found
          </p>
          
          <Button
            onClick={() => navigate('/learning-content-library')}
            className="w-full"
            iconName="BookOpen"
          >
            Start New Lesson
          </Button>
        </div>
      </div>
    );
  }

  // Handle continue lesson click
  const handleContinueLesson = () => {
    if (session?.id) {
      // Validate UUID format before navigation
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (uuidRegex.test(session.id)) {
        navigate(`/lesson-chat/${session.id}`);
      } else {
        console.error('Invalid session ID format:', session.id);
        setError('Invalid session ID format');
      }
    } else {
      console.error('Cannot navigate to lesson: No session ID available');
      setError('Session ID not available');
    }
  };

  return (
    <div className="bg-surface rounded-xl shadow-sm border border-border overflow-hidden">
      <div className="p-4">
        <h3 className="font-semibold text-lg text-text-primary mb-1">Current Lesson</h3>
        <p className="text-text-secondary text-sm mb-3">
          Continue your conversation with the AI tutor
        </p>
        
        <div className="bg-primary/5 rounded-lg p-3 mb-4 border border-primary/10">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-medium text-text-primary">{session?.topic || 'English Conversation'}</h4>
              <p className="text-text-secondary text-sm">{session?.level || 'Intermediate'} Level</p>
            </div>
            <span className="bg-primary/10 text-primary text-xs font-medium px-2 py-1 rounded-full">
              In Progress
            </span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            onClick={handleContinueLesson}
            className="flex-1"
            iconName="MessageSquare"
          >
            Continue Lesson
          </Button>
          <Button
            variant="outline"
            iconName="Info"
            title="Lesson Information"
          />
        </div>
      </div>
    </div>
  );
};

export default CurrentLessonCard;