// /home/ubuntu/app/ai_english_classroom/src/pages/past-lesson-list/components/LessonCard.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from 'components/AppIcon';

const LessonCard = ({ lesson }) => {
  const navigate = useNavigate();

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const handleClick = () => {
    if (lesson?.id) {
      // Use the actual UUID value instead of the parameter placeholder
      navigate(`/lesson-chat/${lesson.id}`);
    } else {
      console.error('Cannot navigate to lesson: No lesson ID available');
    }
  };

  return (
    <div 
      className="bg-surface rounded-lg shadow-sm border border-border p-4 hover:shadow-md transition-all cursor-pointer"
      onClick={handleClick}
    >
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-medium text-text-primary">{lesson?.topic || 'English Conversation'}</h3>
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${lesson?.status === 'completed' ? 'bg-success/10 text-success' : 'bg-primary/10 text-primary'}`}>
          {lesson?.status === 'completed' ? 'Completed' : 'In Progress'}
        </span>
      </div>
      
      <p className="text-text-secondary text-sm mb-3">{lesson?.level || 'Intermediate'} Level</p>
      
      <div className="flex justify-between items-center text-xs text-text-secondary">
        <div className="flex items-center">
          <Icon name="Calendar" size={14} className="mr-1" />
          {formatDate(lesson?.created_at)}
        </div>
        
        <div className="flex items-center">
          <Icon name="MessageSquare" size={14} className="mr-1" />
          {lesson?.message_count || 0} messages
        </div>
      </div>
    </div>
  );
};

export default LessonCard;