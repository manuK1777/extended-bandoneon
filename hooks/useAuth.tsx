'use client';

// This file is a compatibility shim to avoid duplicate AuthContext logic.
// Always import from '@/contexts/AuthContext' throughout the app.
// Kept to prevent accidental breakage if any legacy code imports '@/hooks/useAuth'.

export {
  AuthProvider,
  useAuth
} from '@/contexts/AuthContext';
