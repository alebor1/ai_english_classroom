import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import Icon from 'components/AppIcon';
import { useSupabase } from 'context/SupabaseContext';

const EmailVerification = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { supabase } = useSupabase();
  
  const [verificationStatus, setVerificationStatus] = useState('loading');
  const [message, setMessage] = useState('Verifying your email address...');
  const [email, setEmail] = useState('');
  const [errorType, setErrorType] = useState(null);
  
  useEffect(() => {
    const token = searchParams.get('token');
    const type = searchParams.get('type');
    const email = searchParams.get('email');
    
    if (email) {
      setEmail(email);
    }
    
    if (!token) {
      setVerificationStatus('error');
      setErrorType('missing-token');
      setMessage('Verification link is invalid. The token is missing.');
      return;
    }
    
    // Verify the token
    const verifyEmail = async () => {
      try {
        // Call Supabase auth API to verify the token
        const { error } = await supabase.auth.verifyOtp({
          token_hash: token,
          type: type || 'signup'
        });
        
        if (error) {
          console.error('Verification error:', error);
          setVerificationStatus('error');
          
          if (error.message.includes('expired')) {
            setErrorType('token-expired');
            setMessage('The verification link has expired. Please request a new verification email.');
          } else {
            setErrorType('invalid-token');
            setMessage('The verification link is invalid or has been already used.');
          }
          return;
        }
        
        // Successful verification
        setVerificationStatus('success');
        setMessage('Your email has been successfully verified!');
        
        // Auto redirect after 3 seconds
        setTimeout(() => {
          navigate('/user-login', { 
            state: { message: 'Email verified successfully. You can now sign in.' } 
          });
        }, 3000);
      } catch (err) {
        console.error('Verification error:', err);
        setVerificationStatus('error');
        setErrorType('server-error');
        setMessage('An error occurred while verifying your email. Please try again later.');
      }
    };
    
    verifyEmail();
  }, [searchParams, navigate, supabase.auth]);
  
  const handleResendVerification = async () => {
    if (!email) {
      setErrorType('missing-email');
      setMessage('Please enter your email address to resend the verification link.');
      return;
    }
    
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email
      });
      
      if (error) {
        throw error;
      }
      
      setVerificationStatus('resent');
      setMessage(`Verification email resent to ${email}. Please check your inbox.`);
    } catch (err) {
      console.error('Error resending verification:', err);
      setErrorType('resend-failed');
      setMessage('Failed to resend verification email. Please try again later.');
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
        <div className="max-w-md w-full mx-auto text-center">
          {/* Loading State */}
          {verificationStatus === 'loading' && (
            <div className="mb-8">
              <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
              </div>
              <h1 className="text-2xl font-bold text-text-primary mb-4">
                Verifying Your Email
              </h1>
              <p className="text-text-secondary mb-6">
                Please wait while we verify your email address...
              </p>
              <div className="bg-primary-50 border border-primary-100 rounded-lg p-4">
                <p className="text-sm text-primary">
                  We're confirming your account registration. This should only take a moment.
                </p>
              </div>
            </div>
          )}

          {/* Success State */}
          {verificationStatus === 'success' && (
            <div className="mb-8">
              <div className="mb-6 relative">
                <div className="animate-bounce-slow absolute inset-0 flex items-center justify-center">
                  <div className="w-24 h-24 border-4 border-success-100 rounded-full opacity-50"></div>
                </div>
                <div className="relative w-20 h-20 bg-success rounded-full flex items-center justify-center mx-auto">
                  <Icon name="Check" size={40} color="white" />
                </div>
              </div>
              
              <h1 className="text-2xl font-bold text-success mb-4">
                Email Verified Successfully!
              </h1>
              
              <p className="text-text-secondary mb-6">
                Your email has been verified and your account is now active.
                You will be redirected to the login page shortly.
              </p>

              <Link
                to="/user-login"
                className="w-full bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700 animation-smooth hover-lift inline-block"
              >
                Continue to Sign In
              </Link>
              
              <div className="mt-6 p-3 bg-success-50 border border-success-100 rounded-lg">
                <div className="flex items-center justify-center text-sm text-success">
                  <Icon name="Clock" size={16} className="mr-2" />
                  <span>Redirecting to sign in page in a few seconds...</span>
                </div>
              </div>
            </div>
          )}

          {/* Error State */}
          {verificationStatus === 'error' && (
            <div className="mb-8">
              <div className="w-20 h-20 bg-error-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Icon name="AlertTriangle" size={40} color="var(--color-error)" />
              </div>
              
              <h1 className="text-2xl font-bold text-error mb-4">
                Verification Failed
              </h1>
              
              <p className="text-text-secondary mb-6">
                {message}
              </p>

              <div className="space-y-3">
                {/* Error-specific options */}
                {errorType === 'token-expired' && (
                  <>
                    <div className="mb-4">
                      <label htmlFor="email" className="sr-only">Email Address</label>
                      <div className="relative">
                        <input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full input-field pl-10"
                          placeholder="Enter your email address"
                        />
                        <Icon 
                          name="Mail" 
                          size={18} 
                          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary" 
                        />
                      </div>
                    </div>
                    <button 
                      onClick={handleResendVerification}
                      className="w-full bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700 animation-smooth hover-lift"
                    >
                      Resend Verification Email
                    </button>
                  </>
                )}

                {errorType === 'server-error' && (
                  <button 
                    onClick={() => window.location.reload()}
                    className="w-full bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700 animation-smooth hover-lift"
                  >
                    Try Again
                  </button>
                )}

                <Link
                  to="/user-registration"
                  className="w-full bg-surface text-primary border border-primary px-6 py-3 rounded-lg font-medium hover:bg-primary-50 animation-smooth hover-lift inline-block"
                >
                  Back to Registration
                </Link>
                
                <Link
                  to="/user-login"
                  className="w-full bg-surface text-text-secondary border border-border px-6 py-3 rounded-lg font-medium hover:bg-gray-50 animation-smooth hover-lift inline-block"
                >
                  Go to Sign In
                </Link>
              </div>
              
              <div className="mt-6 p-4 bg-warning-50 border border-warning-100 rounded-lg text-left">
                <h3 className="font-medium text-warning-700 mb-2 flex items-center">
                  <Icon name="HelpCircle" size={16} className="mr-2" />
                  Need Help?
                </h3>
                <ul className="text-sm text-warning-600 space-y-1">
                  <li>• Check if you clicked the link directly from your email</li>
                  <li>• Make sure you're using the most recent verification email</li>
                  <li>• Try registering again with the same email</li>
                  <li>• Contact support if you continue to have issues</li>
                </ul>
              </div>
            </div>
          )}

          {/* Resent Confirmation */}
          {verificationStatus === 'resent' && (
            <div className="mb-8">
              <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Icon name="Mail" size={40} color="var(--color-primary)" />
              </div>
              
              <h1 className="text-2xl font-bold text-text-primary mb-4">
                Verification Email Sent
              </h1>
              
              <p className="text-text-secondary mb-6">
                We've sent a new verification link to <span className="font-medium text-text-primary">{email}</span>
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

              <Link
                to="/user-login"
                className="w-full bg-surface text-primary border border-primary px-6 py-3 rounded-lg font-medium hover:bg-primary-50 animation-smooth hover-lift inline-block"
              >
                Back to Sign In
              </Link>
              
              <div className="mt-8 text-sm text-text-secondary">
                <p className="mb-2">Didn't receive the email?</p>
                <div className="space-y-1">
                  <p>• Check your spam/junk folder</p>
                  <p>• Make sure {email} is correct</p>
                  <p>• Contact support if you need help</p>
                </div>
              </div>
            </div>
          )}
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

export default EmailVerification;