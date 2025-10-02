"use client";

import { useRef, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import ConfirmModal from "@/components/modals/ConfirmModal";
import { toast } from "react-hot-toast";

export default function MobileUserMenu() {
  const { user, logout, isAdmin } = useAuth();
  const menuRef = useRef<HTMLDivElement>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!user) return null;

  return (
    <div className="relative px-1" ref={menuRef}>
      <div className="ml-2">
        <div className="py-2 text-sm text-gray-300 border-b border-gray-700 mb-2">
          Signed in as
          <br />
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
          className="block w-full text-left pt-2 text-sm text-fuchsia-200 hover:text-red-500 transition-colors duration-200"
        >
          Sign out
        </button>
        <button
          onClick={() => setConfirmOpen(true)}
          className="block w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-900/30"
        >
          Delete account
        </button>
        {/* Delete Account Confirmation Modal */}
        <ConfirmModal
          isOpen={confirmOpen}
          title="Delete account"
          description="Are you sure you want to delete your account? This action cannot be undone."
          confirmText="Delete account"
          cancelText="Cancel"
          confirmVariant="danger"
          isProcessing={isDeleting}
          onCancel={() => setConfirmOpen(false)}
          onConfirm={async () => {
            if (isDeleting) return;
            setIsDeleting(true);
            try {
              const res = await fetch('/api/auth/delete-account', { method: 'DELETE' });
              const data = await res.json();
              if (!res.ok) {
                throw new Error(data.error || 'Failed to delete account');
              }
              toast.success('Account deleted');
              await logout();
            } catch (err) {
              console.error('Delete account error:', err);
              toast.error('Failed to delete account');
            } finally {
              setIsDeleting(false);
              setConfirmOpen(false);
            }
          }}
        />
      </div>
    </div>
  );
}
