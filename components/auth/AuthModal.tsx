'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

export default function AuthModal() {
  const { authModalOpen, authModalType, closeAuthModal, openLoginModal, openRegisterModal } = useAuth();
  
  if (!authModalOpen) return null;
  
  return (
    <AnimatePresence>
      {authModalOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeAuthModal}
          />
          
          {/* Modal */}
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-md p-6"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                onClick={closeAuthModal}
                aria-label="Close"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              
              {/* Content */}
              <div className="pt-2">
                {authModalType === 'login' ? (
                  <>
                    <h2 className="text-center text-3xl font-extrabold text-gray-900 dark:text-white mb-6">
                      Sign In
                    </h2>
                    <LoginForm />
                    <div className="mt-4 text-center text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Don&apos;t have an account? </span>
                      <button 
                        className="text-indigo-600 hover:text-indigo-500 font-medium"
                        onClick={openRegisterModal}
                      >
                        Sign up
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <h2 className="text-center text-3xl font-extrabold text-gray-900 dark:text-white mb-6">
                      Create Account
                    </h2>
                    <RegisterForm />
                    <div className="mt-4 text-center text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Already have an account? </span>
                      <button 
                        className="text-indigo-600 hover:text-indigo-500 font-medium"
                        onClick={openLoginModal}
                      >
                        Sign in
                      </button>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
