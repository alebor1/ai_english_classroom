import React, { useState } from 'react';
import Icon from 'components/AppIcon';

const DailyGoals = ({ user }) => {
  const [goals, setGoals] = useState([
    {
      id: 1,
      title: "Complete 2 lessons",
      description: "Finish your daily learning target",
      progress: 1,
      target: 2,
      icon: "BookOpen",
      color: "bg-primary",
      completed: false
    },
    {
      id: 2,
      title: "Practice 15 minutes",
      description: "Spend time on conversation practice",
      progress: 12,
      target: 15,
      icon: "Clock",
      color: "bg-secondary",
      completed: false
    },
    {
      id: 3,
      title: "Learn 5 new words",
      description: "Expand your vocabulary",
      progress: 5,
      target: 5,
      icon: "Brain",
      color: "bg-warning",
      completed: true
    },
    {
      id: 4,
      title: "Review flashcards",
      description: "Review yesterday\'s vocabulary",
      progress: 0,
      target: 1,
      icon: "RotateCcw",
      color: "bg-accent",
      completed: false
    }
  ]);

  const completedGoals = goals.filter(goal => goal.completed).length;
  const totalGoals = goals.length;
  const overallProgress = (completedGoals / totalGoals) * 100;

  const toggleGoalCompletion = (goalId) => {
    setGoals(prev => prev.map(goal => 
      goal.id === goalId 
        ? { ...goal, completed: !goal.completed, progress: goal.completed ? 0 : goal.target }
        : goal
    ));
  };

  return (
    <div className="bg-surface rounded-lg border border-border p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-text-primary">Daily Goals</h3>
        <div className="text-sm text-text-secondary">
          {completedGoals}/{totalGoals} completed
        </div>
      </div>

      {/* Overall Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-text-secondary">Today's Progress</span>
          <span className="font-medium text-text-primary">{Math.round(overallProgress)}%</span>
        </div>
        <div className="w-full bg-border rounded-full h-3">
          <div 
            className="bg-gradient-to-r from-primary to-secondary h-3 rounded-full transition-all duration-500"
            style={{ width: `${overallProgress}%` }}
          ></div>
        </div>
        {overallProgress === 100 && (
          <div className="mt-2 text-center">
            <span className="text-sm text-success font-medium">🎉 All goals completed!</span>
          </div>
        )}
      </div>

      {/* Individual Goals */}
      <div className="space-y-4">
        {goals.map((goal) => {
          const progressPercentage = (goal.progress / goal.target) * 100;
          
          return (
            <div 
              key={goal.id} 
              className={`p-4 rounded-lg border transition-all duration-300 ${
                goal.completed 
                  ? 'border-success bg-success-50' :'border-border bg-background hover:bg-primary-50'
              }`}
            >
              <div className="flex items-start space-x-3">
                <button
                  onClick={() => toggleGoalCompletion(goal.id)}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
                    goal.completed 
                      ? 'bg-success text-white' 
                      : `${goal.color} text-white hover:opacity-80`
                  }`}
                >
                  <Icon 
                    name={goal.completed ? "Check" : goal.icon} 
                    size={20} 
                  />
                </button>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-1">
                    <h4 className={`font-medium ${
                      goal.completed ? 'text-success line-through' : 'text-text-primary'
                    }`}>
                      {goal.title}
                    </h4>
                    <span className="text-sm text-text-secondary ml-2">
                      {goal.progress}/{goal.target}
                    </span>
                  </div>
                  
                  <p className="text-sm text-text-secondary mb-3">
                    {goal.description}
                  </p>
                  
                  {/* Progress Bar */}
                  <div className="w-full bg-border rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-500 ${
                        goal.completed ? 'bg-success' : goal.color.replace('bg-', 'bg-')
                      }`}
                      style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Motivational Message */}
      <div className="mt-6 p-4 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-lg">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center">
            <Icon name="Target" size={16} color="white" />
          </div>
          <div>
            <h4 className="font-medium text-text-primary">Keep Going!</h4>
            <p className="text-sm text-text-secondary">
              {completedGoals === totalGoals 
                ? "Amazing work today! You've completed all your goals." 
                : `You're ${totalGoals - completedGoals} goal${totalGoals - completedGoals > 1 ? 's' : ''} away from completing today's targets.`
              }
            </p>
          </div>
        </div>
      </div>

      {/* Streak Information */}
      <div className="mt-4 flex items-center justify-between text-sm">
        <div className="flex items-center space-x-2 text-text-secondary">
          <Icon name="Flame" size={14} />
          <span>Current streak: {user?.streak || 0} days</span>
        </div>
        <div className="flex items-center space-x-2 text-text-secondary">
          <Icon name="Calendar" size={14} />
          <span>This week: {user?.weeklyProgress || 0}/{user?.weeklyGoal || 5}</span>
        </div>
      </div>
    </div>
  );
};

export default DailyGoals;