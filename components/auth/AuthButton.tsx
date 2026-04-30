'use client';

import { useAuth } from '@/contexts/AuthContext';

export default function AuthButton() {
  const { isAuthenticated, openLoginModal, openRegisterModal } = useAuth();

  if (isAuthenticated) return null;

  return (
    <div className="flex space-x-2">
      <button
        onClick={openLoginModal}
        className="text-sm font-medium text-gray-700 hover:text-indigo-600 dark:text-gray-300 dark:hover:text-indigo-400 transition-colors duration-200"
      >
        Login
      </button>
      <span className="text-gray-500">/</span>
      <button
        onClick={openRegisterModal}
        className="text-sm font-medium text-gray-700 hover:text-indigo-600 dark:text-gray-300 dark:hover:text-indigo-400 transition-colors duration-200"
      >
        Register
      </button>
    </div>
  );
}
