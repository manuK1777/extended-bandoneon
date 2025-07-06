'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { useRouter, useSearchParams } from 'next/navigation';

export default function RegisterForm() {
  const { register, resendVerificationEmail } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [registrationComplete, setRegistrationComplete] = useState(false);
  
  // Store the current path for redirection after verification
  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/';

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

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
    
    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    // Validate password strength
    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }
    
    setIsLoading(true);

    try {
      const result = await register(email, password);
      
      if (result.success) {
        // Store the current path in localStorage for redirection after verification
        if (typeof window !== 'undefined') {
          localStorage.setItem('verificationRedirectPath', currentPath);
        }
        
        setRegistrationComplete(true);
        toast.success('Registration successful! Please check your email to verify your account.');
      } else {
        setError(result.error || 'Registration failed');
        toast.error(result.error || 'Registration failed');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred during registration';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleResendVerification = async () => {
    try {
      setIsLoading(true);
      const result = await resendVerificationEmail();
      
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to resend verification email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // If registration is complete, show verification pending state
  if (registrationComplete) {
    return (
      <div className="space-y-6 text-center">
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                <strong>Verification Required</strong><br />
                We've sent a verification email to <span className="font-medium">{email}</span>.<br />
                Please check your inbox and click the verification link to complete your registration.
              </p>
            </div>
          </div>
        </div>
        
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Didn't receive the email?
        </p>
        
        <button
          type="button"
          onClick={handleResendVerification}
          disabled={isLoading}
          className="w-full flex justify-center py-2 px-4 border border-transparent 
                    rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 
                    hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 
                    focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed
                    transition-colors duration-200"
        >
          {isLoading ? 'Sending...' : 'Resend Verification Email'}
        </button>
      </div>
    );
  }
  
  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
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
            } rounded-md shadow-sm placeholder-gray-400 
                      focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 
                      dark:bg-gray-800 dark:border-gray-700 dark:text-white
                      sm:text-sm`}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {emailError && (
            <p className="mt-1 text-sm text-red-500">{emailError}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Password
        </label>
        <div className="mt-1 relative">
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            required
            className="appearance-none block w-full px-3 py-2 border border-gray-300 
                      rounded-md shadow-sm placeholder-gray-400 
                      focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 
                      dark:bg-gray-800 dark:border-gray-700 dark:text-white
                      sm:text-sm"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-600 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-colors"
            onClick={togglePasswordVisibility}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
          </button>
        </div>
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Confirm Password
        </label>
        <div className="mt-1 relative">
          <input
            id="confirmPassword"
            name="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            autoComplete="new-password"
            required
            className="appearance-none block w-full px-3 py-2 border border-gray-300 
                      rounded-md shadow-sm placeholder-gray-400 
                      focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 
                      dark:bg-gray-800 dark:border-gray-700 dark:text-white
                      sm:text-sm"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-600 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-colors"
            onClick={toggleConfirmPasswordVisibility}
            aria-label={showConfirmPassword ? "Hide password" : "Show password"}
          >
            {showConfirmPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
          </button>
        </div>
      </div>

      {error && (
        <div className="text-red-500 text-sm text-center">{error}</div>
      )}

      <div>
        <button
          type="submit"
          disabled={isLoading || !!emailError}
          className="w-full flex justify-center py-2 px-4 border border-transparent 
                    rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 
                    hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 
                    focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed
                    transition-colors duration-200"
        >
          {isLoading ? 'Creating account...' : 'Create account'}
        </button>
      </div>
    </form>
  );
}
