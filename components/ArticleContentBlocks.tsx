'use client';

import dynamic from 'next/dynamic';

const SoundPlayer = dynamic(() => import('@/components/SoundPlayer'), { ssr: false });

interface ContentBlock {
  type: 'video' | 'sound';
  url: string;
  label?: string;
}

interface ArticleContentBlocksProps {
  blocks: ContentBlock[];
}

export default function ArticleContentBlocks({ blocks }: ArticleContentBlocksProps) {
  const videos = blocks.filter((b) => b.type === 'video');
  const sounds = blocks.filter((b) => b.type === 'sound');

  return (
    <div className="space-y-10 mt-8">
      {videos.length > 0 && (
        <div className="space-y-6">
          {videos.map((block, idx) => (
            <div key={idx}>
              {block.label && (
                <p className="text-sm text-fuchsia-200 mb-2">{block.label}</p>
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
          ))}
        </div>
      )}

      {sounds.length > 0 && (
        <div className="space-y-6">
          {sounds.map((block, idx) => (
            <div key={idx} className="bg-gradient-to-b from-white/5 to-white/10 backdrop-blur-sm p-4 rounded-lg">
              {block.label && (
                <p className="text-sm text-fuchsia-200 mb-3">{block.label}</p>
              )}
              <SoundPlayer fileUrl={block.url} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
