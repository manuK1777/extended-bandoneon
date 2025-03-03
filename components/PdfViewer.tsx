'use client';

import { useState } from 'react';
import { Download, Eye } from 'lucide-react';

interface PdfViewerProps {
  pdfUrl: string;
}

export default function PdfViewer({ pdfUrl }: PdfViewerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleOverlayClick = (e: React.MouseEvent) => {
    // Only close if clicking the overlay itself, not its children
    if (e.target === e.currentTarget) {
      setIsOpen(false);
    }
  };

  return (
    <div className="mt-8 flex justify-center md:justify-end space-x-4">
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center px-2 py-3 bg-white/5 text-red-200 hover:bg-white/10 rounded-lg hover:text-fuchsia-500  transition-colors duration-200"
      >
        <Eye size={18} className="mr-2" />
        View PDF
      </button>
      <a 
        href={pdfUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center px-2 py-3 bg-white/5 text-red-200 hover:bg-white/10 rounded-lg hover:text-fuchsia-500  transition-colors duration-200"
      >
        <Download size={18} className="mr-2" />
        Download PDF
      </a>

      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={handleOverlayClick}
        >
          <div className="bg-gray-900 rounded-lg p-4 w-full max-w-4xl h-[90vh] relative">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-2 right-2 text-yellow-200 mr-1 hover:text-white z-10 text-2xl p-2"
            >
              ✕
            </button>
            <iframe
              src={pdfUrl}
              className="w-full h-full rounded border-0"
              title="PDF Viewer"
            />
          </div>
        </div>
      )}
    </div>
  );
}
