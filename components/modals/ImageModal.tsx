"use client";

import Image from 'next/image';

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  alt: string;
}

export const ImageModal = ({ isOpen, onClose, imageUrl, alt }: ImageModalProps) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/80 z-50 overflow-auto"
      onClick={onClose}
    >
      <div 
        className="min-h-screen w-full flex items-center justify-center p-4"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking the image
      >
        <button
          onClick={onClose}
          className="fixed top-4 right-[2rem] bg-white/5 backdrop-blur-sm text-white hover:text-fuchsia-200 transition-colors"
        >
          Close
        </button>
        <Image
          src={imageUrl}
          alt={alt}
          width={1200}
          height={800}
          className="max-w-[90vw] md:max-w-[55vw] w-auto h-auto object-contain rounded-lg"
          priority
        />
      </div>
    </div>
  );
};
