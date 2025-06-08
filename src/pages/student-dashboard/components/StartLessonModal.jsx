// src/pages/student-dashboard/components/StartLessonModal.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from 'components/ui/Button';
import Icon from 'components/AppIcon';
import { useSupabase } from 'context/SupabaseContext';

const StartLessonModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { createLessonSession, user } = useSupabase();
  const [topic, setTopic] = useState('');
  const [level, setLevel] = useState('intermediate');
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Pre-select difficulty based on user's stored level (if available)
  useEffect(() => {
    if (user?.user_metadata?.level) {
      setLevel(user.user_metadata.level);
    }
  }, [user]);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setTopic('');
      setLevel(user?.user_metadata?.level || 'intermediate');
      setErrors({});
      setIsLoading(false);
    }
  }, [isOpen, user]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!topic.trim() || topic.trim().length < 3) {
      newErrors.topic = 'Topic must be at least 3 characters long';
    }
    
    if (!level) {
      newErrors.level = 'Please select a difficulty level';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      const sessionData = await createLessonSession(topic.trim(), level);
      
      if (sessionData?.id) {
        // Close modal
        onClose();
        
        // Navigate to lesson chat with state
        navigate(`/lesson-chat/${sessionData.id}`, {
          state: { topic: topic.trim() }
        });
      }
    } catch (error) {
      console.error('Error creating lesson session:', error);
      setErrors({ submit: 'Failed to start lesson. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const difficultyOptions = [
    {
      value: 'beginner',
      label: 'Beginner',
      description: 'Basic vocabulary and simple sentences',
      icon: 'Star'
    },
    {
      value: 'intermediate',
      label: 'Intermediate',
      description: 'Complex conversations and grammar',
      icon: 'TrendingUp'
    },
    {
      value: 'advanced',
      label: 'Advanced',
      description: 'Fluent discussions and nuanced topics',
      icon: 'Award'
    }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-surface rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-text-primary">Start New Lesson</h2>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary transition-colors"
            disabled={isLoading}
          >
            <Icon name="X" size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Topic Input */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              What would you like to practice today?
            </label>
            <textarea
              value={topic}
              onChange={(e) => {
                setTopic(e.target.value);
                if (errors.topic) {
                  setErrors(prev => ({ ...prev, topic: null }));
                }
              }}
              placeholder="e.g., Ordering food at a restaurant, Job interviews, Travel conversations..."
              className={`w-full p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 transition-colors ${
                errors.topic 
                  ? 'border-error focus:ring-error/50 focus:border-error' :'border-border focus:ring-primary/50 focus:border-primary'
              } bg-background text-text-primary placeholder-text-secondary`}
              rows={3}
              disabled={isLoading}
            />
            {errors.topic && (
              <p className="mt-1 text-sm text-error flex items-center">
                <Icon name="AlertCircle" size={16} className="mr-1" />
                {errors.topic}
              </p>
            )}
          </div>

          {/* Difficulty Selection */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-3">
              Select your level
            </label>
            <div className="space-y-3">
              {difficultyOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    setLevel(option.value);
                    if (errors.level) {
                      setErrors(prev => ({ ...prev, level: null }));
                    }
                  }}
                  disabled={isLoading}
                  className={`w-full p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                    level === option.value
                      ? 'border-primary bg-primary/5' :'border-border hover:border-primary/50 bg-background'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      level === option.value ? 'bg-primary text-white' : 'bg-border text-text-secondary'
                    }`}>
                      <Icon name={option.icon} size={20} />
                    </div>
                    <div className="flex-1">
                      <h4 className={`font-medium ${
                        level === option.value ? 'text-primary' : 'text-text-primary'
                      }`}>
                        {option.label}
                      </h4>
                      <p className="text-sm text-text-secondary">
                        {option.description}
                      </p>
                    </div>
                    {level === option.value && (
                      <Icon name="Check" size={20} className="text-primary" />
                    )}
                  </div>
                </button>
              ))}
            </div>
            {errors.level && (
              <p className="mt-2 text-sm text-error flex items-center">
                <Icon name="AlertCircle" size={16} className="mr-1" />
                {errors.level}
              </p>
            )}
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <div className="p-3 bg-error/10 border border-error/30 rounded-lg">
              <p className="text-sm text-error flex items-center">
                <Icon name="AlertCircle" size={16} className="mr-2" />
                {errors.submit}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex space-x-3 p-6 border-t border-border">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleContinue}
            disabled={!topic.trim() || topic.trim().length < 3 || !level || isLoading}
            loading={isLoading}
            className="flex-1"
            iconName={isLoading ? null : "ArrowRight"}
          >
            {isLoading ? 'Starting...' : 'Continue'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default StartLessonModal;