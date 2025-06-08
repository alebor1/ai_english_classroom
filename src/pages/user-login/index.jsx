import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Icon from 'components/AppIcon';
import Header from 'components/ui/Header';
import { useSupabase } from 'context/SupabaseContext';

const UserLogin = () => {
  const location = useLocation();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const navigate = useNavigate();
  const { signIn, signInWithProvider } = useSupabase();

  // Initialize with redirected message if any
  useEffect(() => {
    if (location.state?.message) {
      setErrors({ notice: location.state.message });
    }
  }, [location.state]);

  // Test account credentials
  const testAccount = {
    email: 'test@edulearn.com',
    password: 'Test123!'
  };

  useEffect(() => {
    // Auto-focus on email field
    const emailInput = document.getElementById('email');
    if (emailInput) {
      emailInput.focus();
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear errors when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(prev => ({ ...prev, ...newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isRateLimited) {
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const { session, user } = await signIn(formData.email, formData.password);
      
      if (!session) {
        throw new Error('Sign in failed');
      }
      
      // Redirect based on role (default to student dashboard)
      const userRole = user?.user_metadata?.role || 'student';
      const redirectPath = userRole === 'teacher' ? '/teacher-dashboard' : '/student-dashboard';
      navigate(redirectPath);
    } catch (error) {
      console.error('Login error:', error);
      
      // Handle rate limiting
      const newAttempts = loginAttempts + 1;
      setLoginAttempts(newAttempts);
      
      if (newAttempts >= 5) {
        setIsRateLimited(true);
        setErrors({ general: 'Too many failed attempts. Please try again in 5 minutes.' });
        setTimeout(() => {
          setIsRateLimited(false);
          setLoginAttempts(0);
        }, 300000); // 5 minutes
      } else {
        setErrors({ 
          general: `Invalid email or password. ${5 - newAttempts} attempts remaining.` 
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider) => {
    try {
      setIsLoading(true);
      await signInWithProvider(provider.toLowerCase());
      // The redirect is handled by Supabase Auth
    } catch (error) {
      console.error(`${provider} login error:`, error);
      setErrors({ general: `Failed to sign in with ${provider}.` });
      setIsLoading(false);
    }
  };

  const handleUseTestAccount = () => {
    setFormData({
      email: testAccount.email,
      password: testAccount.password,
      rememberMe: false
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Breadcrumb */}
      <div className="pt-16 bg-surface border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center space-x-2 text-sm">
            <Link to="/" className="text-text-secondary hover:text-primary animation-smooth">
              Home
            </Link>
            <Icon name="ChevronRight" size={16} className="text-text-secondary" />
            <span className="text-primary font-medium">Sign In</span>
          </nav>
        </div>
      </div>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon name="LogIn" size={32} color="var(--color-primary)" />
            </div>
            <h1 className="text-3xl font-bold text-text-primary mb-2">Welcome Back</h1>
            <p className="text-text-secondary">
              Sign in to continue your learning journey
            </p>
          </div>

          {/* Main Form Card */}
          <div className="bg-surface rounded-lg shadow-md border border-border p-6 mb-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* General Error */}
              {errors.general && (
                <div className="bg-error-50 border border-error-100 rounded-md p-4">
                  <div className="flex items-center">
                    <Icon name="AlertCircle" size={20} color="var(--color-error)" className="mr-2" />
                    <span className="text-error text-sm">{errors.general}</span>
                  </div>
                </div>
              )}
              
              {/* Notice */}
              {errors.notice && (
                <div className="bg-primary-50 border border-primary-100 rounded-md p-4">
                  <div className="flex items-center">
                    <Icon name="Info" size={20} color="var(--color-primary)" className="mr-2" />
                    <span className="text-primary text-sm">{errors.notice}</span>
                  </div>
                </div>
              )}

              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-text-primary mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full input-field pl-10 ${errors.email ? 'border-error focus:ring-error' : ''}`}
                    placeholder="Enter your email"
                    disabled={isLoading || isRateLimited}
                  />
                  <Icon 
                    name="Mail" 
                    size={18} 
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary" 
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-error">{errors.email}</p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-text-primary mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`w-full input-field pl-10 pr-10 ${errors.password ? 'border-error focus:ring-error' : ''}`}
                    placeholder="Enter your password"
                    disabled={isLoading || isRateLimited}
                  />
                  <Icon 
                    name="Lock" 
                    size={18} 
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary" 
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-secondary hover:text-primary focus-ring rounded"
                    disabled={isLoading || isRateLimited}
                  >
                    <Icon name={showPassword ? 'EyeOff' : 'Eye'} size={18} />
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-error">{errors.password}</p>
                )}
              </div>

              {/* Remember Me */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="rememberMe"
                    name="rememberMe"
                    type="checkbox"
                    checked={formData.rememberMe}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-primary focus:ring-primary border-border rounded"
                    disabled={isLoading || isRateLimited}
                  />
                  <label htmlFor="rememberMe" className="ml-2 block text-sm text-text-secondary">
                    Remember me for 30 days
                  </label>
                </div>
                <Link 
                  to="/forgot-password" 
                  className="text-sm text-primary hover:text-primary-700 animation-smooth"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading || isRateLimited}
                className="w-full btn-primary py-3 rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Signing In...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>
          </div>

          {/* Social Login */}
          <div className="mb-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-background text-text-secondary">Or continue with</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                onClick={() => handleSocialLogin('google')}
                disabled={isLoading || isRateLimited}
                className="w-full inline-flex justify-center py-3 px-4 border border-border rounded-md shadow-sm bg-surface text-sm font-medium text-text-secondary hover:bg-primary-50 animation-smooth hover-lift disabled:opacity-50"
              >
                <Icon name="Chrome" size={20} className="mr-2" />
                Google
              </button>
              <button
                onClick={() => handleSocialLogin('facebook')}
                disabled={isLoading || isRateLimited}
                className="w-full inline-flex justify-center py-3 px-4 border border-border rounded-md shadow-sm bg-surface text-sm font-medium text-text-secondary hover:bg-primary-50 animation-smooth hover-lift disabled:opacity-50"
              >
                <Icon name="Facebook" size={20} className="mr-2" />
                Facebook
              </button>
            </div>
          </div>

          {/* Sign Up Link */}
          <div className="text-center">
            <p className="text-sm text-text-secondary">
              Don't have an account?{' '}
              <Link 
                to="/user-registration" 
                className="font-medium text-primary hover:text-primary-700 animation-smooth"
              >
                Create new account
              </Link>
            </p>
          </div>

          {/* Test Account Button */}
          <div className="mt-8 bg-primary-50 border border-primary-100 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-primary mb-3 flex items-center">
              <Icon name="Info" size={16} className="mr-2" />
              Test Account
            </h4>
            <div className="flex justify-between items-center">
              <div className="text-xs">
                <div>
                  <span className="font-medium text-text-primary">Email:</span>
                  <span className="ml-2 text-text-secondary">{testAccount.email}</span>
                </div>
                <div>
                  <span className="font-medium text-text-primary">Password:</span>
                  <span className="ml-2 text-text-secondary">{testAccount.password}</span>
                </div>
              </div>
              <button
                onClick={handleUseTestAccount}
                className="text-xs bg-primary text-white px-3 py-1 rounded hover:bg-primary-700 transition-colors"
              >
                Use Test Account
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-surface border-t border-border">
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

export default UserLogin;