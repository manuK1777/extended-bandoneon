'use client';

import dynamic from 'next/dynamic';

const SoundPlayer = dynamic(() => import('@/components/SoundPlayer'), { ssr: false });

interface ContentBlock {
  type: 'video' | 'sound' | 'heading' | 'table' | 'text' | 'link' | 'subheading';
  url?: string;
  label?: string;
  text?: string;
  centered?: boolean;
  spaceBefore?: boolean;
  small?: boolean;
  color?: string;
  headers?: string[];
  rows?: string[][];
}

interface ArticleContentBlocksProps {
  blocks: ContentBlock[];
}

export default function ArticleContentBlocks({ blocks }: ArticleContentBlocksProps) {
  const headingGap = 'mb-10';

  function renderItem(block: ContentBlock, idx: number, soundRendered: Set<number>, sectionItems: ContentBlock[]) {
    if (block.type === 'text') {
      return (
        <div key={idx} className={`space-y-1 max-w-4xl mx-auto ${sectionItems[idx - 1]?.type === 'subheading' ? '!mt-2' : ''}`}>
          {(block.text ?? block.label ?? '').split('\n').filter(p => p.trim()).map((p, i) => (
            <p key={i} className={`leading-relaxed ${block.centered ? 'text-sm text-gray-400' : 'text-gray-300'}`} style={block.small ? { fontSize: '0.85rem' } : block.centered ? undefined : { fontSize: '1rem' }}>{p}</p>
          ))}
        </div>
      );
    }

    if (block.type === 'subheading') {
      return (
        <div key={idx} className={`max-w-4xl mx-auto ${block.spaceBefore ? '!mt-20' : ''}`}>
          <h4 className={`text-base font-semibold ${block.color || 'text-gray-300'}`} style={block.small ? { fontSize: '0.95rem' } : undefined}>
            {block.label?.split('\n').map((line, i, arr) => (
              <span key={i}>{line}{i < arr.length - 1 && <br />}</span>
            ))}
          </h4>
        </div>
      );
    }

    if (block.type === 'link') {
      return (
        <p key={idx} className="text-sm text-gray-400 text-center">
          {block.label && <span>{block.label} </span>}
          <a
            href={block.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-fuchsia-200 hover:text-fuchsia-300 transition-colors duration-200"
          >
            {block.url}
          </a>
        </p>
      );
    }

    if (block.type === 'video') {
      return (
        <div key={idx} className="space-y-6">
          {block.label && (
            <h4 className="text-base font-semibold text-gray-300 text-center">{block.label}</h4>
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
      if (soundRendered.has(idx)) return null;
      const group: { block: ContentBlock; idx: number }[] = [];
      let i = idx;
      while (i < sectionItems.length && sectionItems[i].type === 'sound') {
        group.push({ block: sectionItems[i], idx: i });
        soundRendered.add(i);
        i++;
      }
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
        </div>
      );
    }

    if (block.type === 'table') {
      return (
        <div key={idx}>
          {block.label && (
            <h4 className={`text-lg font-semibold text-gray-300 text-center ${headingGap}`}>
              {block.label.split('\n').map((line, i) => (
                <span key={i}>{line}{i < block.label!.split('\n').length - 1 && <br />}</span>
              ))}
            </h4>
          )}
          <table className="mx-auto w-full max-w-2xl border-collapse text-sm text-gray-300 table-fixed">
            {block.headers && (
              <thead>
                <tr>
                  {block.headers.map((h, i) => (
                    <th key={i} className="border border-white/20 bg-white/10 px-3 py-3 text-left font-semibold text-fuchsia-200 whitespace-normal break-words">{h}</th>
                  ))}
                </tr>
              </thead>
            )}
            <tbody>
              {block.rows?.map((row, ri) => (
                <tr key={ri} className="even:bg-white/5">
                  {row.map((cell, ci) => (
                    <td key={ci} className="border border-white/20 px-3 py-3 leading-snug break-words">{cell}</td>
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

  const sections: { heading: ContentBlock | null; items: ContentBlock[] }[] = [];
  let current: { heading: ContentBlock | null; items: ContentBlock[] } = { heading: null, items: [] };

  for (const block of blocks) {
    if (block.type === 'heading') {
      if (current.heading !== null || current.items.length > 0) {
        sections.push(current);
      }
      current = { heading: block, items: [] };
    } else {
      current.items.push(block);
    }
  }
  sections.push(current);

  return (
    <div className="mt-16">
      {sections.map((section, si) => {
        const soundRendered = new Set<number>();
        const isFirstSection = si === 0;
        const prevSectionHasNoHeading = !isFirstSection && !sections[si - 1].heading;
        const sectionMargin = isFirstSection ? '' : prevSectionHasNoHeading && si === 1 ? 'mt-16' : 'mt-24';
        return (
          <div key={si} className={sectionMargin}>
            {section.heading && (
              <h3 className={`text-lg font-semibold text-gray-300 text-center ${headingGap}`}>
                {section.heading.label?.split('\n').map((line, i, arr) => (
                  <span key={i}>{line}{i < arr.length - 1 && <br />}</span>
                ))}
              </h3>
            )}
            <div className="space-y-10">
              {section.items.map((block, ii) => renderItem(block, ii, soundRendered, section.items))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
