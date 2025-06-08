import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Icon from 'components/AppIcon';
import RegistrationForm from './components/RegistrationForm';
import RoleSelection from './components/RoleSelection';
import EmailVerificationNotice from './components/EmailVerificationNotice';
import SocialLoginOptions from './components/SocialLoginOptions';
import { useSupabase } from 'context/SupabaseContext';

const UserRegistration = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    username: '',
    password: '',
    confirmPassword: '',
    role: '',
    agreeToTerms: false,
    subscribeNewsletter: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { signUp } = useSupabase();

  // Auto-save form data to localStorage
  useEffect(() => {
    const savedData = localStorage.getItem('registrationFormData');
    if (savedData) {
      setFormData(JSON.parse(savedData));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('registrationFormData', JSON.stringify(formData));
  }, [formData]);

  const updateFormData = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user updates a field
    if (error) {
      setError(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Register the user with Supabase
      const { data, error } = await signUp(
        formData.email,
        formData.password,
        {
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            username: formData.username,
            phone: formData.phone,
            role: formData.role,
            subscribed_to_newsletter: formData.subscribeNewsletter
          },
          emailRedirectTo: `${window.location.origin}/user-login`
        }
      );
      
      if (error) throw error;
      
      // Registration successful, show email verification notice
      setShowEmailVerification(true);
      localStorage.removeItem('registrationFormData');
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.message || 'An error occurred during registration');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = () => {
    return formData.firstName && 
           formData.lastName && 
           formData.email && 
           formData.username && 
           formData.password && 
           formData.confirmPassword && 
           formData.role && 
           formData.agreeToTerms &&
           formData.password === formData.confirmPassword;
  };

  if (showEmailVerification) {
    return <EmailVerificationNotice email={formData.email} />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-surface border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2 hover-lift">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Icon name="GraduationCap" size={20} color="white" />
              </div>
              <span className="text-xl font-semibold text-text-primary">AI English Classroom</span>
            </Link>

            {/* Language & Help */}
            <div className="flex items-center space-x-4">
              <button className="flex items-center space-x-1 text-text-secondary hover:text-primary animation-smooth focus-ring px-2 py-1 rounded-md">
                <Icon name="Globe" size={16} />
                <span className="text-sm hidden sm:inline">EN</span>
                <Icon name="ChevronDown" size={14} />
              </button>
              
              <button className="flex items-center space-x-1 text-text-secondary hover:text-primary animation-smooth focus-ring px-2 py-1 rounded-md">
                <Icon name="HelpCircle" size={16} />
                <span className="hidden sm:inline text-sm">Help</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Progress Indicator */}
      <div className="bg-surface border-b border-border">
        <div className="max-w-md mx-auto px-4">
          <div className="flex items-center justify-center py-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-medium">
                  1
                </div>
                <span className="ml-2 text-sm font-medium text-primary">Create Account</span>
              </div>
              <div className="w-8 h-0.5 bg-border"></div>
              <div className="flex items-center">
                <div className="w-8 h-8 bg-border text-text-secondary rounded-full flex items-center justify-center text-sm font-medium">
                  2
                </div>
                <span className="ml-2 text-sm font-medium text-text-secondary">Sign In</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="bg-surface">
        <div className="max-w-md mx-auto px-4 py-3">
          <div className="flex justify-center space-x-6 text-sm">
            <span className="text-text-secondary">Already have an account?</span>
            <Link 
              to="/user-login" 
              className="text-primary hover:text-primary-700 font-medium animation-smooth"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 px-4 py-8">
        <div className="max-w-md mx-auto">
          {/* Welcome Section */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon name="UserPlus" size={32} color="var(--color-primary)" />
            </div>
            <h1 className="text-2xl font-bold text-text-primary mb-2">
              Join AI English Classroom
            </h1>
            <p className="text-text-secondary">
              Start your personalized English learning journey with AI-powered lessons
            </p>
          </div>

          {/* Error display */}
          {error && (
            <div className="bg-error-50 border border-error-100 rounded-md p-4 mb-6">
              <div className="flex items-center">
                <Icon name="AlertCircle" size={20} color="var(--color-error)" className="mr-2" />
                <span className="text-error text-sm">{error}</span>
              </div>
            </div>
          )}

          {/* Registration Form */}
          <div className="bg-surface rounded-lg shadow-md border border-border p-6 mb-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <RegistrationForm 
                formData={formData}
                updateFormData={updateFormData}
              />
              
              <RoleSelection 
                selectedRole={formData.role}
                onRoleSelect={(role) => updateFormData('role', role)}
              />

              {/* Terms and Newsletter */}
              <div className="space-y-3">
                <label className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    checked={formData.agreeToTerms}
                    onChange={(e) => updateFormData('agreeToTerms', e.target.checked)}
                    className="mt-1 w-4 h-4 text-primary border-border rounded focus:ring-primary-500"
                    required
                  />
                  <span className="text-sm text-text-secondary">
                    I agree to the{' '}
                    <Link to="/terms" className="text-primary hover:text-primary-700">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link to="/privacy" className="text-primary hover:text-primary-700">
                      Privacy Policy
                    </Link>
                  </span>
                </label>

                <label className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    checked={formData.subscribeNewsletter}
                    onChange={(e) => updateFormData('subscribeNewsletter', e.target.checked)}
                    className="mt-1 w-4 h-4 text-primary border-border rounded focus:ring-primary-500"
                  />
                  <span className="text-sm text-text-secondary">
                    Subscribe to our newsletter for learning tips and updates
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!isFormValid() || isSubmitting}
                className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-all duration-200 ${
                  isFormValid() && !isSubmitting
                    ? 'bg-primary hover:bg-primary-700 hover-lift'
                    : 'bg-border cursor-not-allowed'
                }`}
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Creating your account...</span>
                  </div>
                ) : (
                  'Create Account'
                )}
              </button>
            </form>
          </div>

          {/* Social Login */}
          <SocialLoginOptions />

          {/* Security Notice */}
          <div className="text-center mt-6">
            <div className="flex items-center justify-center space-x-2 text-xs text-text-secondary">
              <Icon name="Shield" size={14} />
              <span>Your data is protected with enterprise-grade security</span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-surface border-t border-border mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-6 text-sm text-text-secondary">
              <Link to="/privacy" className="hover:text-primary animation-smooth">
                Privacy Policy
              </Link>
              <Link to="/terms" className="hover:text-primary animation-smooth">
                Terms of Service
              </Link>
              <Link to="/support" className="hover:text-primary animation-smooth">
                Support
              </Link>
            </div>
            <div className="text-sm text-text-secondary">
              © {new Date().getFullYear()} AI English Classroom. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default UserRegistration;