import React, { useState } from 'react';
import Icon from 'components/AppIcon';

const RegistrationForm = ({ formData, updateFormData }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    return strength;
  };

  const handlePasswordChange = (value) => {
    updateFormData('password', value);
    setPasswordStrength(calculatePasswordStrength(value));
  };

  const getPasswordStrengthText = () => {
    switch (passwordStrength) {
      case 0:
      case 1:
        return 'Weak';
      case 2:
      case 3:
        return 'Medium';
      case 4:
      case 5:
        return 'Strong';
      default:
        return '';
    }
  };

  const getPasswordStrengthColor = () => {
    switch (passwordStrength) {
      case 0:
      case 1:
        return 'bg-error';
      case 2:
      case 3:
        return 'bg-warning';
      case 4:
      case 5:
        return 'bg-success';
      default:
        return 'bg-border';
    }
  };

  return (
    <div className="space-y-4">
      {/* Personal Information Section */}
      <div>
        <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center">
          <Icon name="User" size={20} className="mr-2" />
          Personal Information
        </h3>
        
        {/* Name Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              First Name *
            </label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => updateFormData('firstName', e.target.value)}
              className="w-full input-field"
              placeholder="Enter your first name"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              Last Name *
            </label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => updateFormData('lastName', e.target.value)}
              className="w-full input-field"
              placeholder="Enter your last name"
              required
            />
          </div>
        </div>

        {/* Email */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-text-primary mb-1">
            Email Address *
          </label>
          <div className="relative">
            <input
              type="email"
              value={formData.email}
              onChange={(e) => updateFormData('email', e.target.value)}
              className="w-full input-field pl-10"
              placeholder="Enter your email address"
              required
            />
            <Icon name="Mail" size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary" />
          </div>
        </div>

        {/* Phone */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-text-primary mb-1">
            Phone Number
          </label>
          <div className="relative">
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => updateFormData('phone', e.target.value)}
              className="w-full input-field pl-10"
              placeholder="Enter your phone number"
            />
            <Icon name="Phone" size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary" />
          </div>
        </div>
      </div>

      {/* Account Credentials Section */}
      <div>
        <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center">
          <Icon name="Lock" size={20} className="mr-2" />
          Account Credentials
        </h3>

        {/* Username */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-text-primary mb-1">
            Username *
          </label>
          <div className="relative">
            <input
              type="text"
              value={formData.username}
              onChange={(e) => updateFormData('username', e.target.value)}
              className="w-full input-field pl-10"
              placeholder="Choose a username"
              required
            />
            <Icon name="AtSign" size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary" />
          </div>
          <p className="text-xs text-text-secondary mt-1">
            Username must be unique and contain only letters, numbers, and underscores
          </p>
        </div>

        {/* Password */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-text-primary mb-1">
            Password *
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={(e) => handlePasswordChange(e.target.value)}
              className="w-full input-field pr-10"
              placeholder="Create a strong password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-secondary hover:text-primary"
            >
              <Icon name={showPassword ? "EyeOff" : "Eye"} size={16} />
            </button>
          </div>
          
          {/* Password Strength Indicator */}
          {formData.password && (
            <div className="mt-2">
              <div className="flex items-center space-x-2 mb-1">
                <div className="flex-1 bg-border rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                    style={{ width: `${(passwordStrength / 5) * 100}%` }}
                  ></div>
                </div>
                <span className={`text-xs font-medium ${
                  passwordStrength <= 1 ? 'text-error' : 
                  passwordStrength <= 3 ? 'text-warning' : 'text-success'
                }`}>
                  {getPasswordStrengthText()}
                </span>
              </div>
              <p className="text-xs text-text-secondary">
                Use 8+ characters with uppercase, lowercase, numbers, and symbols
              </p>
            </div>
          )}
        </div>

        {/* Confirm Password */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-text-primary mb-1">
            Confirm Password *
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              value={formData.confirmPassword}
              onChange={(e) => updateFormData('confirmPassword', e.target.value)}
              className={`w-full input-field pr-10 ${
                formData.confirmPassword && formData.password !== formData.confirmPassword
                  ? 'border-error focus:ring-error focus:border-error' :''
              }`}
              placeholder="Confirm your password"
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-secondary hover:text-primary"
            >
              <Icon name={showConfirmPassword ? "EyeOff" : "Eye"} size={16} />
            </button>
          </div>
          {formData.confirmPassword && formData.password !== formData.confirmPassword && (
            <p className="text-xs text-error mt-1 flex items-center">
              <Icon name="AlertCircle" size={12} className="mr-1" />
              Passwords do not match
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegistrationForm;