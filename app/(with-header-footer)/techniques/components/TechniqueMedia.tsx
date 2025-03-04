"use client";

import { useState } from 'react';
import { ImageModal } from '@/components/modals/ImageModal';

interface Media {
  id: number;
  technique_id: number;
  type: 'image' | 'video';
  url: string;
}

interface TechniqueMediaProps {
  media: Media[];
}

export const TechniqueMedia = ({ media }: TechniqueMediaProps) => {
  const [selectedImage, setSelectedImage] = useState<{ url: string; alt: string } | null>(null);
  const images = media.filter(m => m.type === 'image');
  const videos = media.filter(m => m.type === 'video');

  return (
    <>
      <div className="space-y-4">
        {/* Images */}
        {images.map((img, idx) => (
          <div 
            key={img.id} 
            className="relative max-w-[400px] mx-auto cursor-pointer"
            onClick={() => setSelectedImage({
              url: img.url,
              alt: `Technique image ${idx + 1}`
            })}
          >
            <img
              src={img.url}
              alt={`Technique image ${idx + 1}`}
              className="rounded-lg w-full h-auto hover:opacity-90 transition-opacity"
              loading="lazy"
            />
          </div>
        ))}

        {/* Videos */}
        {videos.map((video) => (
          <div key={video.id} style={{ padding: '56.25% 0 0 0', position: 'relative' }}>
            <iframe
              src={video.url}
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
              allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media"
              allowFullScreen
              title="Technique Video"
              className="rounded-lg"
            />
          </div>
        ))}
      </div>

      <ImageModal
        isOpen={!!selectedImage}
        onClose={() => setSelectedImage(null)}
        imageUrl={selectedImage?.url || ''}
        alt={selectedImage?.alt || ''}
      />
    </>
  );
};
