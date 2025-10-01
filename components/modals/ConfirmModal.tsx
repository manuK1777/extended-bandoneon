"use client";

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface ConfirmModalProps {
  isOpen: boolean;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmVariant?: 'danger' | 'primary';
  isProcessing?: boolean;
}

export default function ConfirmModal({
  isOpen,
  title = 'Are you sure?',
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  confirmVariant = 'primary',
  isProcessing = false,
}: ConfirmModalProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!isOpen || !mounted) return null;

  const confirmBase =
    'inline-flex justify-center px-4 py-2 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  const confirmClass =
    confirmVariant === 'danger'
      ? `${confirmBase} text-white bg-red-600 hover:bg-red-700 focus:ring-red-500`
      : `${confirmBase} text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500`;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop click closes */}
      <div
        className="absolute inset-0"
        onClick={onCancel}
        aria-hidden
      />

      {/* Modal card */}
      <div className="relative z-10 w-full max-w-md rounded-lg bg-white dark:bg-gray-900 shadow-xl">
        <div className="px-6 py-5">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {title}
          </h3>
          {description && (
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{description}</p>
          )}
        </div>
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800 rounded-b-lg flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex justify-center px-4 py-2 text-sm font-medium rounded-md border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700"
            disabled={isProcessing}
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={confirmClass}
            disabled={isProcessing}
          >
            {isProcessing ? 'Processing...' : confirmText}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
