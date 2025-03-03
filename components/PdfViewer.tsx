'use client';

import { useState } from 'react';

interface PdfViewerProps {
  pdfUrl: string;
}

export default function PdfViewer({ pdfUrl }: PdfViewerProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mt-8 space-y-4">
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center px-6 py-3 bg-fuchsia-200 text-gray-900 rounded-lg hover:bg-fuchsia-300 transition-colors duration-200 mr-4"
      >
        <span className="mr-2">👁️</span>
        View PDF
      </button>
      <a 
        href={pdfUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center px-6 py-3 bg-fuchsia-200 text-gray-900 rounded-lg hover:bg-fuchsia-300 transition-colors duration-200"
      >
        <span className="mr-2">📄</span>
        Download PDF
      </a>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-lg p-4 w-full max-w-4xl h-[90vh] relative">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-2 right-2 text-gray-400 hover:text-white z-10"
            >
              ✕
            </button>
            <iframe
              src={pdfUrl}
              className="w-full h-full rounded"
              title="PDF Viewer"
            />
          </div>
        </div>
      )}
    </div>
  );
}
