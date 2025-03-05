"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
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
  const [isMobile, setIsMobile] = useState(true);
  const images = media.filter(m => m.type === 'image');
  const videos = media.filter(m => m.type === 'video');

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768); // 768px is the 'md' breakpoint in Tailwind
    };

    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  const handleImageClick = (img: Media, idx: number) => {
    if (!isMobile) {
      setSelectedImage({
        url: img.url,
        alt: `Technique image ${idx + 1}`
      });
    }
  };

  return (
    <>
      <div className="space-y-8 mt-4">
        {/* Images */}
        <div className="flex flex-wrap gap-6 justify-center">
          {images.map((img, idx) => (
            <div 
              key={img.id} 
              className="relative w-[350px] h-[500px] cursor-pointer"
              onClick={() => handleImageClick(img, idx)}
            >
              <Image
                src={img.url}
                alt={`Technique image ${idx + 1}`}
                className="rounded-lg object-cover hover:opacity-75 transition-opacity"
                fill
                sizes="(max-width: 768px) 90vw, (max-width: 1200px) 50vw, 33vw"
                priority={idx === 0}
              />
            </div>
          ))}
        </div>

        {/* Videos */}
        <div className="flex flex-col lg:flex-row gap-4 justify-center items-center">
          {videos.map((video) => (
            <div key={video.id} className="w-[300px] lg:w-[400px] aspect-[16/9]" style={{ position: 'relative' }}>
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
      </div>

      <ImageModal
        isOpen={!!selectedImage && !isMobile}
        onClose={() => setSelectedImage(null)}
        imageUrl={selectedImage?.url || ''}
        alt={selectedImage?.alt || ''}
      />
    </>
  );
};
