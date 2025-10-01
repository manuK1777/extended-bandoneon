'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

export default function UserMenu() {
  const { user, logout, isAdmin } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (!user) return null;

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 text-gray-700 hover:text-indigo-600 dark:text-gray-300 dark:hover:text-indigo-400 transition-colors duration-200"
      >
        <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white">
          {user.email.charAt(0).toUpperCase()}
        </div>
        <span className="hidden md:inline text-sm">{user.email.split('@')[0]}</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full mt-2 right-0 w-46 bg-white dark:bg-gray-800 rounded-md shadow-lg z-50"
          >
            <div className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">
              Signed in as<br />
              <span className="font-medium truncate block">{user.email}</span>
            </div>

            {isAdmin && (
              <Link 
                href="/admin/dashboard" 
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                onClick={() => setIsOpen(false)}
                target="_blank"
                rel="noopener noreferrer"
              >
                Admin Dashboard
              </Link>
            )}

            <button
              onClick={async () => {
                const confirmed = window.confirm('Are you sure you want to delete your account? This action cannot be undone.');
                if (!confirmed) return;
                try {
                  const res = await fetch('/api/auth/delete-account', { method: 'DELETE' });
                  const data = await res.json();
                  if (!res.ok) {
                    throw new Error(data.error || 'Failed to delete account');
                  }
                  // Log out locally and close menu
                  await logout();
                  setIsOpen(false);
                } catch (err) {
                  console.error('Delete account error:', err);
                  // Non-blocking: keep menu open to allow retry or cancel
                }
              }}
              className="block w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-900/30"
            >
              Delete account
            </button>

            <button
              onClick={() => {
                logout();
                setIsOpen(false);
              }}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Sign out
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
