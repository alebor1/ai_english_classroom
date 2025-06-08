import React, { useState } from 'react';
import Icon from 'components/AppIcon';

const RecentAchievements = () => {
  const [showAll, setShowAll] = useState(false);

  const achievements = [
    {
      id: 1,
      title: "Vocabulary Master",
      description: "Learned 100 new words this month",
      icon: "BookOpen",
      color: "bg-primary",
      date: "2 days ago",
      xp: 100,
      isNew: true
    },
    {
      id: 2,
      title: "Conversation Starter",
      description: "Completed 10 conversation sessions",
      icon: "MessageCircle",
      color: "bg-secondary",
      date: "1 week ago",
      xp: 75,
      isNew: false
    },
    {
      id: 3,
      title: "Grammar Guru",
      description: "Perfect score on advanced grammar test",
      icon: "Award",
      color: "bg-warning",
      date: "2 weeks ago",
      xp: 150,
      isNew: false
    },
    {
      id: 4,
      title: "Streak Keeper",
      description: "Maintained 7-day learning streak",
      icon: "Flame",
      color: "bg-accent",
      date: "3 weeks ago",
      xp: 50,
      isNew: false
    }
  ];

  const displayedAchievements = showAll ? achievements : achievements.slice(0, 2);

  const handleShare = (achievement) => {
    if (navigator.share) {
      navigator.share({
        title: `I earned "${achievement.title}" on AI English Classroom!`,
        text: achievement.description,
        url: window.location.href
      });
    } else {
      // Fallback for browsers that don't support Web Share API
      const text = `I earned "${achievement.title}" on AI English Classroom! ${achievement.description}`;
      navigator.clipboard.writeText(text);
    }
  };

  return (
    <div className="bg-surface rounded-lg border border-border p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-text-primary">Recent Achievements</h3>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-text-secondary">Total XP: 1,250</span>
          <div className="w-6 h-6 bg-warning-100 rounded-full flex items-center justify-center">
            <Icon name="Star" size={14} color="var(--color-warning)" />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {displayedAchievements.map((achievement) => (
          <div 
            key={achievement.id} 
            className={`relative p-4 rounded-lg border transition-all duration-300 hover:shadow-md ${
              achievement.isNew 
                ? 'border-primary bg-primary-50 animate-pulse-subtle' :'border-border bg-background hover:bg-primary-50'
            }`}
          >
            {achievement.isNew && (
              <div className="absolute -top-2 -right-2 bg-accent text-white text-xs px-2 py-1 rounded-full font-medium">
                New!
              </div>
            )}

            <div className="flex items-start space-x-4">
              <div className={`${achievement.color} w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0`}>
                <Icon name={achievement.icon} size={24} color="white" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium text-text-primary mb-1">
                      {achievement.title}
                    </h4>
                    <p className="text-sm text-text-secondary mb-2">
                      {achievement.description}
                    </p>
                    <div className="flex items-center space-x-4 text-xs text-text-secondary">
                      <span>{achievement.date}</span>
                      <div className="flex items-center space-x-1">
                        <Icon name="Zap" size={12} />
                        <span>+{achievement.xp} XP</span>
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleShare(achievement)}
                    className="p-2 hover:bg-white hover:bg-opacity-50 rounded-lg animation-smooth"
                    title="Share achievement"
                  >
                    <Icon name="Share2" size={16} className="text-text-secondary" />
                  </button>
                </div>
              </div>
            </div>

            {/* Celebration Animation for New Achievements */}
            {achievement.isNew && (
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-2 left-2 w-2 h-2 bg-warning rounded-full animate-ping"></div>
                <div className="absolute top-4 right-4 w-1 h-1 bg-primary rounded-full animate-ping animation-delay-200"></div>
                <div className="absolute bottom-3 left-6 w-1.5 h-1.5 bg-secondary rounded-full animate-ping animation-delay-400"></div>
              </div>
            )}
          </div>
        ))}
      </div>

      {achievements.length > 2 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="w-full mt-4 py-2 text-sm text-primary hover:text-primary-700 font-medium animation-smooth"
        >
          {showAll ? 'Show Less' : `View All ${achievements.length} Achievements`}
          <Icon 
            name={showAll ? "ChevronUp" : "ChevronDown"} 
            size={16} 
            className="inline ml-1"
          />
        </button>
      )}

      {/* Next Achievement Preview */}
      <div className="mt-6 p-4 bg-border-light rounded-lg">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-text-secondary bg-opacity-20 rounded-lg flex items-center justify-center">
            <Icon name="Target" size={20} className="text-text-secondary" />
          </div>
          <div className="flex-1">
            <h4 className="font-medium text-text-primary mb-1">Next Goal</h4>
            <p className="text-sm text-text-secondary">Complete 5 more lessons to unlock "Dedicated Learner"</p>
          </div>
          <div className="text-right">
            <div className="text-sm font-medium text-text-primary">3/5</div>
            <div className="text-xs text-text-secondary">Lessons</div>
          </div>
        </div>
        
        <div className="mt-3">
          <div className="w-full bg-border rounded-full h-2">
            <div className="bg-primary h-2 rounded-full transition-all duration-300" style={{ width: '60%' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecentAchievements;