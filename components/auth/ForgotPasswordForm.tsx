'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

interface ForgotPasswordFormProps {
  onBack: () => void;
}

export default function ForgotPasswordForm({ onBack }: ForgotPasswordFormProps) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Email validation function
  const validateEmail = (email: string): boolean => {
    // RFC 5322 compliant email regex
    const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return emailRegex.test(email);
  };

  // Validate email on change
  useEffect(() => {
    if (email && !validateEmail(email)) {
      setEmailError('Please enter a valid email address');
    } else {
      setEmailError('');
    }
  }, [email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Validate email format
    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }
    
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsSubmitted(true);
        toast.success('Password reset instructions sent to your email');
      } else {
        setError(data.error || 'Failed to send password reset email');
        toast.error(data.error || 'Failed to send password reset email');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // If email was submitted successfully, show confirmation
  if (isSubmitted) {
    return (
      <div className="space-y-6 text-center">
        <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.236 4.53L8.53 10.53a.75.75 0 00-1.06 1.061l2.03 2.03a.75.75 0 001.137-.089l3.857-5.401z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700">
                <strong>Check your email</strong><br />
                We&apos;ve sent password reset instructions to <span className="font-medium">{email}</span>.<br />
                Please check your inbox and follow the link to reset your password.
              </p>
            </div>
          </div>
        </div>
        
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Didn&apos;t receive the email? Check your spam folder or try again in a few minutes.
        </p>
        
        <button
          type="button"
          onClick={onBack}
          className="w-full flex justify-center py-2 px-4 border border-gray-300 
                    rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white 
                    hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 
                    focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-600 
                    dark:text-gray-300 dark:hover:bg-gray-700 transition-colors duration-200"
        >
          Back to Login
        </button>
      </div>
    );
  }
  
  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Forgot your password?
        </h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Enter your email address and we&apos;ll send you a link to reset your password.
        </p>
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Email address
        </label>
        <div className="mt-1">
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className={`appearance-none block w-full px-3 py-2 border ${
              emailError ? 'border-red-500' : 'border-gray-300'
            } rounded-md shadow-sm placeholder-gray-400 text-gray-900 
                      focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 
                      dark:bg-gray-800 dark:border-gray-700 dark:text-white
                      sm:text-sm`}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address"
          />
          {emailError && (
            <p className="mt-1 text-sm text-red-500">{emailError}</p>
          )}
        </div>
      </div>

      {error && (
        <div className="text-red-500 text-sm text-center">{error}</div>
      )}

      <div className="space-y-3">
        <button
          type="submit"
          disabled={isLoading || !!emailError || !email}
          className="w-full flex justify-center py-2 px-4 border border-transparent 
                    rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 
                    hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 
                    focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed
                    transition-colors duration-200"
        >
          {isLoading ? 'Sending...' : 'Send Reset Link'}
        </button>

        <button
          type="button"
          onClick={onBack}
          className="w-full flex justify-center py-2 px-4 border border-gray-300 
                    rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white 
                    hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 
                    focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-600 
                    dark:text-gray-300 dark:hover:bg-gray-700 transition-colors duration-200"
        >
          Back to Login
        </button>
      </div>
    </form>
  );
}
