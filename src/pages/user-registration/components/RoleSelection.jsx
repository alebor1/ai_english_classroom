import React from 'react';
import Icon from 'components/AppIcon';

const RoleSelection = ({ selectedRole, onRoleSelect }) => {
  const roles = [
    {
      id: 'student',
      title: 'Student',
      description: 'Learn English with AI-powered personalized lessons',
      features: [
        'Personalized learning paths',
        'AI conversation practice',
        'Progress tracking',
        'Interactive exercises'
      ],
      icon: 'BookOpen',
      color: 'primary'
    },
    {
      id: 'teacher',
      title: 'Teacher',
      description: 'Manage students and create engaging content',
      features: [
        'Student progress monitoring',
        'Assignment creation',
        'AI teaching assistant',
        'Classroom management'
      ],
      icon: 'Users',
      color: 'secondary'
    }
  ];

  return (
    <div>
      <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center">
        <Icon name="UserCheck" size={20} className="mr-2" />
        Choose Your Role
      </h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {roles.map((role) => (
          <div
            key={role.id}
            onClick={() => onRoleSelect(role.id)}
            className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 hover-lift ${
              selectedRole === role.id
                ? `border-${role.color} bg-${role.color}-50`
                : 'border-border bg-surface hover:border-border-light'
            }`}
          >
            {/* Selection Indicator */}
            <div className={`absolute top-3 right-3 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
              selectedRole === role.id
                ? `border-${role.color} bg-${role.color}`
                : 'border-border'
            }`}>
              {selectedRole === role.id && (
                <Icon name="Check" size={12} color="white" />
              )}
            </div>

            {/* Role Icon */}
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-3 ${
              selectedRole === role.id
                ? `bg-${role.color} text-white`
                : `bg-${role.color}-100 text-${role.color}`
            }`}>
              <Icon name={role.icon} size={24} />
            </div>

            {/* Role Info */}
            <h4 className={`text-lg font-semibold mb-2 ${
              selectedRole === role.id ? `text-${role.color}` : 'text-text-primary'
            }`}>
              {role.title}
            </h4>
            
            <p className="text-sm text-text-secondary mb-3">
              {role.description}
            </p>

            {/* Features List */}
            <ul className="space-y-1">
              {role.features.map((feature, index) => (
                <li key={index} className="flex items-center text-xs text-text-secondary">
                  <Icon name="Check" size={12} className={`mr-2 text-${role.color}`} />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {selectedRole && (
        <div className="mt-4 p-3 bg-success-50 border border-success-100 rounded-lg">
          <div className="flex items-center text-sm text-success">
            <Icon name="CheckCircle" size={16} className="mr-2" />
            <span>
              Great choice! You've selected the {roles.find(r => r.id === selectedRole)?.title} role.
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoleSelection;