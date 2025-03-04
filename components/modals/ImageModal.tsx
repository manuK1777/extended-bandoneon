"use client";

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
      className="fixed inset-0 bg-black/50 z-50 overflow-auto"
      onClick={onClose}
    >
      <div 
        className="min-h-screen w-full flex items-center justify-center p-4"
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="fixed top-4 right-[2rem] bg-white/5 backdrop-blur-sm text-white hover:text-fuchsia-200 transition-colors"
        >
          Close
        </button>
        <img
          src={imageUrl}
          alt={alt}
          className="max-w-[90vw] md:max-w-[55vw] w-auto h-auto object-contain rounded-lg"
        />
      </div>
    </div>
  );
};
