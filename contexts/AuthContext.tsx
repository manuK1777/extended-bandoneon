'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRef } from 'react';

type UserRole = 'admin' | 'user';

interface User {
  id: string;
  email: string;
  role: UserRole;
  email_verified?: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string) => Promise<{ success: boolean; error?: string; message?: string }>;
  logout: () => Promise<void>;
  openLoginModal: () => void;
  openRegisterModal: () => void;
  openForgotPasswordModal: () => void;
  closeAuthModal: () => void;
  authModalOpen: boolean;
  authModalType: 'login' | 'register' | 'forgot-password' | null;
  resendVerificationEmail: () => Promise<{ success: boolean; message: string }>;
  forgotPassword: (email: string) => Promise<{ success: boolean; message: string }>;
  refreshUserData: () => Promise<void>;
  isEmailVerified: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  // Guard to prevent concurrent login attempts
  const loginInFlightRef = useRef(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalType, setAuthModalType] = useState<'login' | 'register' | 'forgot-password' | null>(null);

  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'admin';
  // Convert email_verified to boolean (handles both boolean true and numeric 1)
  const isEmailVerified = Boolean(user?.email_verified);

  // Function to refresh user data - using useCallback to prevent recreation on each render
  const refreshUserData = React.useCallback(async () => {
    try {
      const response = await fetch('/api/auth/me');
      const data = await response.json();
      
      if (data.authenticated && data.user) {
        // Ensure email_verified is properly converted to a boolean
        const processedUser = {
          ...data.user,
          email_verified: Boolean(data.user.email_verified)
        };
        setUser(processedUser);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Error refreshing user data:', error);
    }
  }, []);

  // Check if user is already logged in
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/auth/me');
        const data = await response.json();
        
        // The API always returns 200 with authenticated flag
        if (data.authenticated && data.user) {
          // Ensure email_verified is properly converted to a boolean
          const processedUser = {
            ...data.user,
            email_verified: Boolean(data.user.email_verified)
          };
          setUser(processedUser);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
    
    // Listen for email verification events from other tabs/windows
    let broadcastChannel: BroadcastChannel | null = null;
    
    try {
      broadcastChannel = new BroadcastChannel('auth_updates');
      broadcastChannel.onmessage = (event) => {
        if (event.data && event.data.type === 'EMAIL_VERIFIED') {
          // Refresh user data when email is verified in another tab
          refreshUserData();
        }
      };
    } catch (e) {
      // BroadcastChannel might not be supported in all browsers
      console.log('BroadcastChannel not supported, falling back to localStorage');
    }
    
    // Also listen for localStorage changes as a fallback
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'email_verified' && e.newValue === 'true') {
        refreshUserData();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Check localStorage on mount in case verification happened before this component mounted
    if (localStorage.getItem('email_verified') === 'true') {
      refreshUserData();
      localStorage.removeItem('email_verified'); // Clear it after processing
    }
    
    return () => {
      // Clean up listeners
      if (broadcastChannel) {
        broadcastChannel.close();
      }
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []); // Empty dependency array to run only once on mount

  const login = async (email: string, password: string) => {
    // Prevent concurrent login attempts which can cause conflicting messages
    if (loginInFlightRef.current) {
      return { success: false, error: 'Login already in progress' };
    }

    loginInFlightRef.current = true;
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || 'Login failed' };
      }

      // Ensure email_verified is properly converted to a boolean like in other functions
      const processedUser = {
        ...data.user,
        email_verified: Boolean(data.user.email_verified)
      };
      
      setUser(processedUser);
      closeAuthModal();
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'An error occurred during login'
      };
    } finally {
      loginInFlightRef.current = false;
    }
  };

  const register = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || 'Registration failed' };
      }

      // Ensure email_verified is properly converted to a boolean like in other functions
      const processedUser = {
        ...data.user,
        email_verified: Boolean(data.user.email_verified)
      };
      
      setUser(processedUser);
      closeAuthModal();
      return { 
        success: true, 
        message: data.message || 'Registration successful. Please check your email to verify your account.'
      };
    } catch (error) {
      console.error('Registration error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'An error occurred during registration'
      };
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const openLoginModal = () => {
    setAuthModalType('login');
    setAuthModalOpen(true);
  };

  const openRegisterModal = () => {
    setAuthModalType('register');
    setAuthModalOpen(true);
  };

  const openForgotPasswordModal = () => {
    setAuthModalType('forgot-password');
    setAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setAuthModalOpen(false);
    setAuthModalType(null);
  };


  // Function to resend verification email
  const resendVerificationEmail = async () => {
    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      
      const data = await response.json();
      
      return { 
        success: response.ok, 
        message: response.ok 
          ? data.message || 'Verification email sent!' 
          : data.error || 'Failed to send verification email'
      };
    } catch (error) {
      console.error('Error resending verification email:', error);
      return { 
        success: false, 
        message: 'An unexpected error occurred while sending the verification email'
      };
    }
  };

  // Function to request password reset
  const forgotPassword = async (email: string) => {
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      
      const data = await response.json();
      
      return { 
        success: response.ok, 
        message: response.ok 
          ? data.message || 'Password reset email sent!' 
          : data.error || 'Failed to send password reset email'
      };
    } catch (error) {
      console.error('Error requesting password reset:', error);
      return { 
        success: false, 
        message: 'An unexpected error occurred while requesting password reset'
      };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        isAdmin,
        login,
        register,
        logout,
        openLoginModal,
        openRegisterModal,
        openForgotPasswordModal,
        closeAuthModal,
        authModalOpen,
        authModalType,
        resendVerificationEmail,
        forgotPassword,
        refreshUserData,
        isEmailVerified
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
