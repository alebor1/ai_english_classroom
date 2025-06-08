// src/pages/student-dashboard/components/QuickActions.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from 'components/AppIcon';
import Button from 'components/ui/Button';
import StartLessonModal from './StartLessonModal';

const QuickActions = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const quickActions = [
    {
      id: 1,
      title: "Vocabulary Practice",
      description: "Learn new words with flashcards",
      icon: "BookOpen",
      color: "bg-primary",
      bgColor: "bg-primary-50",
      textColor: "text-primary",
      path: "/learning-content-library",
      badge: "5 new"
    },
    {
      id: 2,
      title: "Grammar Exercises",
      description: "Master English grammar rules",
      icon: "PenTool",
      color: "bg-secondary",
      bgColor: "bg-secondary-50",
      textColor: "text-secondary",
      path: "/learning-content-library",
      badge: null
    },
    {
      id: 3,
      title: "Conversation Practice",
      description: "Chat with AI tutors",
      icon: "MessageCircle",
      color: "bg-warning",
      bgColor: "bg-warning-50",
      textColor: "text-warning",
      path: "/learning-content-library",
      badge: "Live"
    },
    {
      id: 4,
      title: "Pronunciation",
      description: "Improve your speaking skills",
      icon: "Mic",
      color: "bg-accent",
      bgColor: "bg-accent-50",
      textColor: "text-accent",
      path: "/learning-content-library",
      badge: null
    }
  ];

  return (
    <>
      <div className="bg-surface rounded-lg border border-border p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-text-primary">Quick Practice</h3>
          <Link 
            to="/learning-content-library" 
            className="text-sm text-primary hover:text-primary-700 animation-smooth"
          >
            View All
          </Link>
        </div>

        {/* New Lesson Button */}
        <div className="mb-6">
          <Button
            onClick={() => setIsModalOpen(true)}
            className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white font-medium py-3 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
            iconName="Plus"
          >
            Start New Lesson
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {quickActions.map((action) => (
            <Link
              key={action.id}
              to={action.path}
              className={`${action.bgColor} rounded-lg p-4 hover:shadow-md animation-smooth hover-lift group relative overflow-hidden`}
            >
              {/* Badge */}
              {action.badge && (
                <div className="absolute top-2 right-2 bg-white px-2 py-1 rounded-full text-xs font-medium text-text-primary shadow-sm">
                  {action.badge}
                </div>
              )}

              <div className="flex items-start space-x-3">
                <div className={`${action.color} w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0`}>
                  <Icon name={action.icon} size={20} color="white" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 className={`font-medium ${action.textColor} mb-1 group-hover:text-opacity-80`}>
                    {action.title}
                  </h4>
                  <p className="text-sm text-text-secondary group-hover:text-opacity-80">
                    {action.description}
                  </p>
                </div>

                <Icon 
                  name="ArrowRight" 
                  size={16} 
                  className={`${action.textColor} opacity-0 group-hover:opacity-100 transition-opacity duration-200`}
                />
              </div>

              {/* Hover Effect */}
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-5 transition-opacity duration-200"></div>
            </Link>
          ))}
        </div>

        {/* Daily Challenge */}
        <div className="mt-6 p-4 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-lg border border-primary-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-primary to-secondary rounded-lg flex items-center justify-center">
              <Icon name="Trophy" size={20} color="white" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-text-primary mb-1">Daily Challenge</h4>
              <p className="text-sm text-text-secondary">Complete 3 vocabulary exercises to earn 50 XP</p>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-primary">2/3</div>
              <div className="text-xs text-text-secondary">Complete</div>
            </div>
          </div>
          
          <div className="mt-3">
            <div className="w-full bg-white rounded-full h-2">
              <div className="bg-gradient-to-r from-primary to-secondary h-2 rounded-full transition-all duration-300" style={{ width: '66%' }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Start Lesson Modal */}
      <StartLessonModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};

export default QuickActions;