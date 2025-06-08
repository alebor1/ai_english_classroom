import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from 'components/AppIcon';
import { useSupabase } from 'context/SupabaseContext';

const EmailVerificationNotice = ({ email }) => {
  const { resendVerificationEmail } = useSupabase();
  const [isResending, setIsResending] = useState(false);
  const [resendStatus, setResendStatus] = useState(null);

  const handleResendEmail = async () => {
    if (!email || isResending) return;
    
    setIsResending(true);
    setResendStatus(null);
    
    try {
      await resendVerificationEmail(email);
      setResendStatus({
        type: 'success',
        message: 'Verification email has been resent successfully.'
      });
    } catch (error) {
      console.error('Error resending verification email:', error);
      setResendStatus({
        type: 'error',
        message: 'Failed to resend verification email. Please try again.'
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-surface border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2 hover-lift">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Icon name="GraduationCap" size={20} color="white" />
              </div>
              <span className="text-xl font-semibold text-text-primary">AI English Classroom</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-md mx-auto text-center">
          {/* Success Animation */}
          <div className="mb-8">
            <div className="w-20 h-20 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-scale-in">
              <Icon name="Mail" size={40} color="var(--color-success)" />
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-success-100 rounded-full animate-ping"></div>
              </div>
              <div className="relative w-16 h-16 bg-success rounded-full flex items-center justify-center mx-auto">
                <Icon name="Check" size={24} color="white" />
              </div>
            </div>
          </div>

          {/* Content */}
          <h1 className="text-2xl font-bold text-text-primary mb-4">
            Check Your Email
          </h1>
          
          <p className="text-text-secondary mb-6">
            We've sent a verification link to{' '}
            <span className="font-medium text-text-primary">{email}</span>
          </p>

          <div className="bg-primary-50 border border-primary-100 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-3">
              <Icon name="Info" size={20} color="var(--color-primary)" className="mt-0.5" />
              <div className="text-left">
                <h3 className="font-medium text-primary mb-1">Next Steps:</h3>
                <ol className="text-sm text-primary space-y-1">
                  <li>1. Check your email inbox</li>
                  <li>2. Click the verification link</li>
                  <li>3. Return here to sign in</li>
                </ol>
              </div>
            </div>
          </div>

          {/* Resend Status */}
          {resendStatus && (
            <div className={`p-3 rounded-lg mb-6 ${resendStatus.type === 'success' ? 'bg-success-50 border border-success-100 text-success' : 'bg-error-50 border border-error-100 text-error'}`}>
              <div className="flex items-center">
                <Icon 
                  name={resendStatus.type === 'success' ? 'Check' : 'AlertCircle'} 
                  size={16} 
                  className="mr-2" 
                />
                <span className="text-sm">{resendStatus.message}</span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            <button 
              className={`w-full ${isResending ? 'bg-primary-300' : 'bg-primary'} text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700 animation-smooth hover-lift flex items-center justify-center`}
              onClick={handleResendEmail}
              disabled={isResending}
            >
              {isResending ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                  Sending...
                </>
              ) : 'Resend Verification Email'}
            </button>
            
            <Link
              to="/user-login"
              className="w-full bg-surface text-primary border border-primary px-6 py-3 rounded-lg font-medium hover:bg-primary-50 animation-smooth hover-lift inline-block"
            >
              Continue to Sign In
            </Link>
          </div>

          {/* Help Text */}
          <div className="mt-8 text-sm text-text-secondary">
            <p className="mb-2">Didn't receive the email?</p>
            <div className="space-y-1">
              <p>• Check your spam/junk folder</p>
              <p>• Make sure {email} is correct</p>
              <p>• Contact support if you need help</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-surface border-t border-border">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="text-center text-sm text-text-secondary">
            © {new Date().getFullYear()} AI English Classroom. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default EmailVerificationNotice;