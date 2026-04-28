'use client';

import dynamic from 'next/dynamic';

const SoundPlayer = dynamic(() => import('@/components/SoundPlayer'), { ssr: false });

interface ContentBlock {
  type: 'video' | 'sound' | 'heading';
  url?: string;
  label?: string;
}

interface ArticleContentBlocksProps {
  blocks: ContentBlock[];
}

export default function ArticleContentBlocks({ blocks }: ArticleContentBlocksProps) {
  return (
    <div className="mt-8">
      {blocks.map((block, idx) => {
        if (block.type === 'heading') {
          return (
            <h3 key={idx} className="text-lg font-semibold text-gray-300 mt-20 mb-8 text-center">
              {block.label}
            </h3>
          );
        }
        if (block.type === 'video') {
          return (
            <div key={idx} className="mt-20 mb-4">
              {block.label && (
                <h4 className="text-lg font-semibold text-gray-300 text-center mb-8">{block.label}</h4>
              )}
              <div className="flex justify-center">
                <div className="w-[300px] lg:w-[400px] aspect-[16/9] relative">
                  <iframe
                    src={block.url}
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
                    allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media"
                    allowFullScreen
                    title={block.label ?? `Video ${idx + 1}`}
                    className="rounded-lg"
                  />
                </div>
              </div>
            </div>
          );
        }
        if (block.type === 'sound') {
          const isLastSound = blocks.slice(idx + 1).every((b) => b.type !== 'sound');
          return (
            <div key={idx} className="mb-6">
              <div className="bg-gradient-to-b from-white/5 to-white/10 backdrop-blur-sm p-4 rounded-lg">
                {block.label && (
                  <p className="text-base text-fuchsia-200 mb-4">{block.label}</p>
                )}
                <SoundPlayer fileUrl={block.url!} />
              </div>
              {isLastSound && (
                <p className="text-sm text-gray-400 mt-8">
                  Larger sound bank available at:{' '}
                  <a
                    href="https://www.extendedbandoneon.com/soundbank"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-fuchsia-200 hover:text-fuchsia-300 transition-colors duration-200"
                  >
                    extendedbandoneon.com/soundbank
                  </a>
                </p>
              )}
            </div>
          );
        }
        return null;
      })}
    </div>
  );
}
