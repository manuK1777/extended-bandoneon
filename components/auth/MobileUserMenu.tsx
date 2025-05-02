'use client';

import { useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

export default function MobileUserMenu() {
  const { user, logout, isAdmin } = useAuth();
  const menuRef = useRef<HTMLDivElement>(null);

  if (!user) return null;

  return (
    <div className="relative px-1" ref={menuRef}>
      <div className='ml-2'>
      <div className="py-2 text-sm text-gray-300 border-b border-gray-700 mb-2">
        Signed in as<br />
        <span className="font-medium truncate block">{user.email}</span>
      </div>

      {isAdmin && (
        <Link 
          href="/admin/dashboard" 
          className="block py-2 text-sm text-fuchsia-200 hover:text-red-500 transition-colors duration-200"
        >
          Admin Dashboard
        </Link>
      )}

      <button
        onClick={() => logout()}
        className="block w-full text-left py-2 text-sm text-fuchsia-200 hover:text-red-500 transition-colors duration-200"
      >
        Sign out
      </button>
      </div>
    </div>
  );
}
