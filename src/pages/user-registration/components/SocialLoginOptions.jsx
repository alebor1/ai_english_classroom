import React, { useState } from 'react';
import Icon from 'components/AppIcon';
import { useSupabase } from 'context/SupabaseContext';

const SocialLoginOptions = () => {
  const { signInWithProvider } = useSupabase();
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  
  const socialProviders = [
    {
      name: 'google',
      displayName: 'Google',
      icon: 'Chrome',
      color: 'bg-red-500 hover:bg-red-600',
      textColor: 'text-white'
    },
    {
      name: 'facebook',
      displayName: 'Facebook',
      icon: 'Facebook',
      color: 'bg-blue-600 hover:bg-blue-700',
      textColor: 'text-white'
    }
  ];

  const handleSocialLogin = async (provider) => {
    try {
      setIsLoading(true);
      setError(null);
      await signInWithProvider(provider);
      // The redirect is handled by Supabase Auth
    } catch (err) {
      console.error(`${provider} login error:`, err);
      setError(`Failed to sign in with ${provider}. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {/* Divider */}
      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-background text-text-secondary">Or continue with</span>
        </div>
      </div>

      {/* Error display */}
      {error && (
        <div className="bg-error-50 border border-error-100 rounded-md p-3 mb-4">
          <div className="flex items-center">
            <Icon name="AlertCircle" size={16} color="var(--color-error)" className="mr-2" />
            <span className="text-error text-sm">{error}</span>
          </div>
        </div>
      )}

      {/* Social Login Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {socialProviders.map((provider) => (
          <button
            key={provider.name}
            onClick={() => handleSocialLogin(provider.name)}
            disabled={isLoading}
            className={`flex items-center justify-center space-x-2 px-4 py-3 rounded-lg font-medium transition-all duration-200 hover-lift ${provider.color} ${provider.textColor} disabled:opacity-50`}
          >
            {isLoading ? (
              <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
            ) : (
              <Icon name={provider.icon} size={18} />
            )}
            <span>{provider.displayName}</span>
          </button>
        ))}
      </div>

      {/* Privacy Notice */}
      <div className="mt-4 text-center">
        <p className="text-xs text-text-secondary">
          By signing up with social login, you agree to our data handling practices
        </p>
      </div>
    </div>
  );
};

export default SocialLoginOptions;