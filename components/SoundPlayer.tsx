'use client';

import { useEffect, useRef, useState } from 'react';
import WaveSurfer from 'wavesurfer.js';

interface SoundPlayerProps {
  fileUrl: string;
  onReady?: () => void;
}

export default function SoundPlayer({ fileUrl, onReady }: SoundPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState('0:00');
  const [duration, setDuration] = useState('0:00');
  const [error, setError] = useState<string | null>(null);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (!containerRef.current || wavesurferRef.current) return;

    try {
      wavesurferRef.current = WaveSurfer.create({
        container: containerRef.current,
        waveColor: '#fde047',
        progressColor: '#ef4444',
        cursorColor: '#ef4444',
        barWidth: 2,
        barRadius: 3,
        cursorWidth: 1,
        height: 60,
        barGap: 3,
        backend: 'MediaElement' as const,
        mediaControls: false,
        autoScroll: true,
        interact: true,
        fillParent: true
      });

      wavesurferRef.current.on('ready', () => {
        setDuration(formatTime(wavesurferRef.current?.getDuration() || 0));
        setError(null);
        onReady?.();
      });

      wavesurferRef.current.on('error', (err) => {
        console.error('WaveSurfer error:', err);
        setError('Failed to load audio');
      });

      wavesurferRef.current.on('timeupdate', (currentTime) => {
        setCurrentTime(formatTime(currentTime));
      });

      wavesurferRef.current.on('play', () => setIsPlaying(true));
      wavesurferRef.current.on('pause', () => setIsPlaying(false));

      wavesurferRef.current.load(fileUrl);
    } catch (err) {
      console.error('Error initializing WaveSurfer:', err);
      setError('Failed to initialize audio player');
    }
  }, [fileUrl, onReady]);

  const togglePlayPause = () => {
    if (wavesurferRef.current) {
      wavesurferRef.current.playPause();
    }
  };

  return (
    <div className="w-full space-y-2">
      {error ? (
        <div className="text-red-500 text-sm mb-2">{error}</div>
      ) : (
        <div>
          <div ref={containerRef} className="w-full rounded-lg" />
          <div className="flex items-center justify-between text-sm text-fuchsia-500">
            <button
              onClick={togglePlayPause}
              className="flex items-center space-x-2 hover:text-yellow-200 transition-colors"
            >
              <span className="sr-only">{isPlaying ? 'Pause' : 'Play'}</span>
              {isPlaying ? (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                  <path fillRule="evenodd" d="M6.75 5.25a.75.75 0 01.75-.75H9a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H7.5a.75.75 0 01-.75-.75V5.25zm7 0a.75.75 0 01.75-.75h1.5a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75h-1.5a.75.75 0 01-.75-.75V5.25z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                  <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
                </svg>
              )}
            </button>
            <div className="flex space-x-2 font-mono">
              <span>{currentTime}</span>
              <span>/</span>
              <span>{duration}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
