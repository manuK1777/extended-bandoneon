'use client';

import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

export default function AdminNavItem() {
  const { isAdmin } = useAuth();
  
  if (!isAdmin) return null;
  
  return (
    <li className="hover:bg-yellow-200">
      <Link 
        href="/admin/dashboard" 
        className="text-base text-fuchsia-200 font-body transition-colors duration-200 py-2 px-1 hover:text-red-500"
      >
        Admin Dashboard
      </Link>
    </li>
  );
}
