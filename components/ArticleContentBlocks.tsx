'use client';

import dynamic from 'next/dynamic';

const SoundPlayer = dynamic(() => import('@/components/SoundPlayer'), { ssr: false });

interface ContentBlock {
  type: 'video' | 'sound' | 'heading' | 'table';
  url?: string;
  label?: string;
  headers?: string[];
  rows?: string[][];
}

interface ArticleContentBlocksProps {
  blocks: ContentBlock[];
}

export default function ArticleContentBlocks({ blocks }: ArticleContentBlocksProps) {
  const rendered = new Set<number>();
  const headingGap = 'mb-10';

  function renderContent(block: ContentBlock, idx: number, rendered: Set<number>) {
    if (block.type === 'video') {
      return (
        <div key={idx}>
          {block.label && (
            <h4 className={`text-lg font-semibold text-gray-300 text-center ${headingGap}`}>{block.label}</h4>
          )}
          <div className="flex justify-center">
            <div className="w-[300px] md:w-[500px] aspect-[16/9] relative">
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
      const group: { block: ContentBlock; idx: number }[] = [];
      let i = idx;
      while (i < blocks.length && blocks[i].type === 'sound') {
        group.push({ block: blocks[i], idx: i });
        rendered.add(i);
        i++;
      }
      const isLastSoundGroup = blocks.slice(i).every((b) => b.type !== 'sound');
      return (
        <div key={idx}>
          <div className="flex flex-wrap justify-center gap-8">
            {group.map(({ block: b, idx: i }) => (
              <div key={i} className="bg-gradient-to-b from-white/5 to-white/10 backdrop-blur-sm p-4 rounded-lg w-[300px] lg:w-[400px]">
                {b.label && (
                  <p className="text-base text-fuchsia-200 mb-4">{b.label}</p>
                )}
                <SoundPlayer fileUrl={b.url!} />
              </div>
            ))}
          </div>
          {isLastSoundGroup && (
            <p className="text-sm text-gray-400 mt-8 text-center">
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

    if (block.type === 'table') {
      return (
        <div key={idx} className="overflow-x-auto">
          {block.label && (
            <h4 className={`text-lg font-semibold text-gray-300 text-center ${headingGap}`}>
              {block.label.split('\n').map((line, i) => (
                <span key={i}>{line}{i < block.label!.split('\n').length - 1 && <br />}</span>
              ))}
            </h4>
          )}
          <table className="mx-auto w-full max-w-2xl border-collapse text-sm text-gray-300">
            {block.headers && (
              <thead>
                <tr>
                  {block.headers.map((h, i) => (
                    <th key={i} className="border border-white/20 bg-white/10 px-4 py-3 text-left font-semibold text-fuchsia-200">{h}</th>
                  ))}
                </tr>
              </thead>
            )}
            <tbody>
              {block.rows?.map((row, ri) => (
                <tr key={ri} className="even:bg-white/5">
                  {row.map((cell, ci) => (
                    <td key={ci} className="border border-white/20 px-4 py-3 leading-snug">{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    return null;
  }

  return (
    <div className="mt-24 space-y-24">
      {blocks.map((block, idx) => {
        if (rendered.has(idx)) return null;

        if (block.type === 'heading') {
          const next = blocks[idx + 1];
          if (next && next.type !== 'heading') {
            rendered.add(idx + 1);
            return (
              <div key={idx}>
                <h3 className={`text-lg font-semibold text-gray-300 ${headingGap} text-center`}>{block.label}</h3>
                {renderContent(next, idx + 1, rendered)}
              </div>
            );
          }
          return (
            <h3 key={idx} className="text-lg font-semibold text-gray-300 text-center">{block.label}</h3>
          );
        }

        return renderContent(block, idx, rendered);
      })}
    </div>
  );
}
