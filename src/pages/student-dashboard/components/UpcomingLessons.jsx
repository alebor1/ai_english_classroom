import React from 'react';
import { Link } from 'react-router-dom';
import Icon from 'components/AppIcon';
import Image from 'components/AppImage';

const UpcomingLessons = () => {
  const upcomingLessons = [
    {
      id: 1,
      title: "Business Email Writing",
      description: "Learn professional email communication",
      thumbnail: "https://images.pexels.com/photos/590016/pexels-photo-590016.jpeg?w=300&h=200&fit=crop",
      difficulty: "Advanced",
      duration: "25 min",
      type: "Writing",
      isRecommended: true,
      scheduledFor: "Tomorrow, 2:00 PM"
    },
    {
      id: 2,
      title: "Idioms and Expressions",
      description: "Common English idioms in daily conversation",
      thumbnail: "https://images.pixabay.com/photo/2016/11/29/06/15/book-1867171_1280.jpg?w=300&h=200&fit=crop",
      difficulty: "Intermediate",
      duration: "20 min",
      type: "Vocabulary",
      isRecommended: false,
      scheduledFor: "Wednesday, 10:00 AM"
    },
    {
      id: 3,
      title: "Presentation Skills",
      description: "Deliver confident presentations in English",
      thumbnail: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=200&fit=crop",
      difficulty: "Advanced",
      duration: "30 min",
      type: "Speaking",
      isRecommended: true,
      scheduledFor: "Friday, 4:00 PM"
    }
  ];

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Beginner':
        return 'bg-success text-white';
      case 'Intermediate':
        return 'bg-warning text-white';
      case 'Advanced':
        return 'bg-accent text-white';
      default:
        return 'bg-border text-text-secondary';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'Speaking':
        return 'Mic';
      case 'Writing':
        return 'PenTool';
      case 'Vocabulary':
        return 'BookOpen';
      case 'Listening':
        return 'Headphones';
      default:
        return 'BookOpen';
    }
  };

  return (
    <div className="bg-surface rounded-lg border border-border p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-text-primary">Upcoming Lessons</h3>
        <Link 
          to="/learning-content-library" 
          className="text-sm text-primary hover:text-primary-700 animation-smooth"
        >
          View Schedule
        </Link>
      </div>

      <div className="space-y-4">
        {upcomingLessons.map((lesson) => (
          <div 
            key={lesson.id} 
            className={`relative p-4 rounded-lg border transition-all duration-300 hover:shadow-md hover-lift ${
              lesson.isRecommended 
                ? 'border-primary bg-primary-50' :'border-border bg-background hover:bg-primary-50'
            }`}
          >
            {lesson.isRecommended && (
              <div className="absolute -top-2 -right-2 bg-primary text-white text-xs px-2 py-1 rounded-full font-medium">
                Recommended
              </div>
            )}

            <div className="flex space-x-4">
              {/* Thumbnail */}
              <div className="w-20 h-16 bg-border rounded-lg overflow-hidden flex-shrink-0">
                <Image 
                  src={lesson.thumbnail}
                  alt={lesson.title}
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-text-primary truncate pr-2">
                    {lesson.title}
                  </h4>
                  <div className="flex items-center space-x-1 flex-shrink-0">
                    <Icon name={getTypeIcon(lesson.type)} size={14} className="text-text-secondary" />
                    <span className="text-xs text-text-secondary">{lesson.type}</span>
                  </div>
                </div>
                
                <p className="text-sm text-text-secondary mb-3 line-clamp-2">
                  {lesson.description}
                </p>
                
                {/* Lesson Meta */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${getDifficultyColor(lesson.difficulty)}`}>
                      {lesson.difficulty}
                    </span>
                    <div className="flex items-center space-x-1 text-xs text-text-secondary">
                      <Icon name="Clock" size={12} />
                      <span>{lesson.duration}</span>
                    </div>
                  </div>
                  
                  <Link
                    to="/learning-content-library"
                    className="text-xs text-primary hover:text-primary-700 font-medium animation-smooth"
                  >
                    Start Lesson
                  </Link>
                </div>
                
                {/* Scheduled Time */}
                <div className="mt-2 flex items-center space-x-1 text-xs text-text-secondary">
                  <Icon name="Calendar" size={12} />
                  <span>{lesson.scheduledFor}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Schedule New Lesson */}
      <div className="mt-6 p-4 border-2 border-dashed border-border rounded-lg text-center hover:border-primary hover:bg-primary-50 animation-smooth">
        <Link 
          to="/learning-content-library"
          className="flex flex-col items-center space-y-2 text-text-secondary hover:text-primary animation-smooth"
        >
          <div className="w-10 h-10 bg-border rounded-lg flex items-center justify-center">
            <Icon name="Plus" size={20} />
          </div>
          <div>
            <div className="font-medium">Schedule New Lesson</div>
            <div className="text-xs">Browse available courses</div>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default UpcomingLessons;