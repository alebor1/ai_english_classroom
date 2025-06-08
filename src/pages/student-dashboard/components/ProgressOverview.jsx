import React from 'react';
import Icon from 'components/AppIcon';
import { Link } from 'react-router-dom';

const ProgressOverview = ({ user }) => {
  const skillsData = [
    { name: "Speaking", level: 75, color: "bg-primary" },
    { name: "Listening", level: 82, color: "bg-secondary" },
    { name: "Reading", level: 68, color: "bg-warning" },
    { name: "Writing", level: 71, color: "bg-accent" }
  ];

  const weeklyData = [
    { day: "Mon", hours: 1.5 },
    { day: "Tue", hours: 2.0 },
    { day: "Wed", hours: 0.5 },
    { day: "Thu", hours: 1.8 },
    { day: "Fri", hours: 2.2 },
    { day: "Sat", hours: 1.0 },
    { day: "Sun", hours: 0.8 }
  ];

  const maxHours = Math.max(...weeklyData.map(d => d.hours));

  return (
    <div className="bg-surface rounded-lg border border-border p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-text-primary">Progress Overview</h3>
        <Link to="/user-profile-management" className="text-primary hover:text-primary-700 animation-smooth">
          <Icon name="ExternalLink" size={16} />
        </Link>
      </div>

      {/* Overall Progress Circle */}
      <div className="flex items-center justify-center mb-8">
        <div className="relative w-32 h-32">
          <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
            <circle
              cx="60"
              cy="60"
              r="50"
              stroke="var(--color-border)"
              strokeWidth="8"
              fill="none"
            />
            <circle
              cx="60"
              cy="60"
              r="50"
              stroke="var(--color-primary)"
              strokeWidth="8"
              fill="none"
              strokeDasharray={`${(user?.completedLessons / user?.totalLessons) * 314} 314`}
              strokeLinecap="round"
              className="transition-all duration-500"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-bold text-text-primary">
                {Math.round((user?.completedLessons / user?.totalLessons) * 100)}%
              </div>
              <div className="text-xs text-text-secondary">Complete</div>
            </div>
          </div>
        </div>
      </div>

      {/* Skills Breakdown */}
      <div className="mb-8">
        <h4 className="text-sm font-medium text-text-primary mb-4">Skills Breakdown</h4>
        <div className="space-y-3">
          {skillsData.map((skill, index) => (
            <div key={index}>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-text-secondary">{skill.name}</span>
                <span className="font-medium text-text-primary">{skill.level}%</span>
              </div>
              <div className="w-full bg-border rounded-full h-2">
                <div 
                  className={`${skill.color} h-2 rounded-full transition-all duration-500`}
                  style={{ width: `${skill.level}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Weekly Activity */}
      <div>
        <h4 className="text-sm font-medium text-text-primary mb-4">This Week's Activity</h4>
        <div className="flex items-end justify-between space-x-2 h-20">
          {weeklyData.map((day, index) => (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div 
                className="w-full bg-primary rounded-t-sm transition-all duration-300 hover:bg-primary-700"
                style={{ 
                  height: `${(day.hours / maxHours) * 60}px`,
                  minHeight: day.hours > 0 ? '8px' : '2px'
                }}
                title={`${day.hours}h on ${day.day}`}
              ></div>
              <span className="text-xs text-text-secondary mt-2">{day.day}</span>
            </div>
          ))}
        </div>
        <div className="text-center mt-4">
          <span className="text-sm text-text-secondary">
            Total: <span className="font-medium text-text-primary">9.8 hours</span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProgressOverview;