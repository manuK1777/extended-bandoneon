'use client';

import { useEffect, useRef } from 'react';
import WaveSurfer from 'wavesurfer.js';

interface SoundPlayerProps {
  fileUrl: string;
  onReady?: () => void;
}

export default function SoundPlayer({ fileUrl, onReady }: SoundPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const isDestroyingRef = useRef(false);

  useEffect(() => {
    if (!containerRef.current) return;

    const createWaveSurfer = () => {
      if (!containerRef.current || wavesurferRef.current) return;

      wavesurferRef.current = WaveSurfer.create({
        container: containerRef.current,
        waveColor: '#4a5568',
        progressColor: '#2b6cb0',
        cursorColor: '#2b6cb0',
        barWidth: 2,
        barRadius: 3,
        cursorWidth: 1,
        height: 80,
        barGap: 3,
        backend: 'MediaElement',
        mediaControls: true,
        autoScroll: true,
        interact: true,
        fillParent: true
      });

      wavesurferRef.current.on('ready', () => {
        if (!isDestroyingRef.current) {
          onReady?.();
        }
      });

      wavesurferRef.current.load(fileUrl);
    };

    observerRef.current = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        createWaveSurfer();
      }
    });

    observerRef.current.observe(containerRef.current);

    return () => {
      isDestroyingRef.current = true;
      
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }

      if (wavesurferRef.current) {
        const ws = wavesurferRef.current;
        // Remove all event listeners before destroying
        ws.unAll();
        ws.destroy();
        wavesurferRef.current = null;
      }
    };
  }, [fileUrl, onReady]);

  return (
    <div ref={containerRef} className="w-full bg-gray-100 rounded-lg p-4" />
  );
}
