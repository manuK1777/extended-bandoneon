'use client';

import { createContext, useContext, useRef, useCallback } from 'react';
import WaveSurfer from 'wavesurfer.js';

type WaveSurferInstance = {
  instance: WaveSurfer | null;
  state: 'creating' | 'ready' | 'destroying' | 'idle';
  refCount: number;
  promise?: Promise<WaveSurfer | null>;
};

interface WaveSurferContextType {
  createInstance: (containerId: string, container: HTMLElement, options: any) => Promise<WaveSurfer | null>;
  releaseInstance: (containerId: string) => void;
}

const WaveSurferContext = createContext<WaveSurferContextType | null>(null);

export function WaveSurferProvider({ children }: { children: React.ReactNode }) {
  const instancesRef = useRef<Map<string, WaveSurferInstance>>(new Map());
  const timeoutsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  const cleanupInstance = useCallback((containerId: string) => {
    console.log(`[WaveSurfer] Cleaning up instance ${containerId}`);
    const instance = instancesRef.current.get(containerId);
    if (!instance) {
      console.log(`[WaveSurfer] No instance found for ${containerId}`);
      return;
    }

    instance.refCount--;
    console.log(`[WaveSurfer] Decreased refCount to ${instance.refCount} for ${containerId}`);

    if (instance.refCount <= 0) {
      // Clear any existing timeout
      const existingTimeout = timeoutsRef.current.get(containerId);
      if (existingTimeout) {
        clearTimeout(existingTimeout);
      }

      // Set a new timeout for cleanup
      const timeout = setTimeout(() => {
        const instance = instancesRef.current.get(containerId);
        if (instance && instance.refCount <= 0) {
          console.log(`[WaveSurfer] Destroying instance ${containerId}`);
          if (instance.instance) {
            instance.state = 'destroying';
            try {
              instance.instance.unAll();
              instance.instance.destroy();
            } catch (error) {
              console.error('[WaveSurfer] Error destroying instance:', error);
            }
          }
          instancesRef.current.delete(containerId);
        }
        timeoutsRef.current.delete(containerId);
      }, 500); // Half second delay before cleanup

      timeoutsRef.current.set(containerId, timeout);
    }
  }, []);

  const createInstance = useCallback(async (
    containerId: string,
    container: HTMLElement,
    options: any
  ): Promise<WaveSurfer | null> => {
    console.log(`[WaveSurfer] Creating instance for ${containerId}`, options);
    let instance = instancesRef.current.get(containerId);

    // If there's an existing creation in progress, wait for it
    if (instance?.state === 'creating' && instance.promise) {
      console.log(`[WaveSurfer] Instance ${containerId} is being created, waiting...`);
      return instance.promise;
    }

    // If there's a ready instance, reuse it
    if (instance?.state === 'ready' && instance.instance) {
      console.log(`[WaveSurfer] Reusing existing instance ${containerId}`);
      instance.refCount++;
      return instance.instance;
    }

    // Clear any pending cleanup
    const existingTimeout = timeoutsRef.current.get(containerId);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
      timeoutsRef.current.delete(containerId);
    }

    // Create new instance
    const newInstance: WaveSurferInstance = {
      instance: null,
      state: 'creating',
      refCount: 1,
    };

    // Create a promise for the instance creation
    const creationPromise = (async () => {
      try {
        console.log(`[WaveSurfer] Creating new WaveSurfer instance for ${containerId}`);
        const wavesurfer = WaveSurfer.create({
          ...options,
          container,
          backend: 'MediaElement',
          mediaControls: true,
          normalize: true,
          minPxPerSec: 50,
          hideScrollbar: true,
        });

        // Set up error handler first
        wavesurfer.on('error', (err) => {
          console.error(`[WaveSurfer] Error in instance ${containerId}:`, err);
        });

        // Wait for the instance to be ready
        await new Promise((resolve, reject) => {
          let isResolved = false;

          const handleReady = () => {
            if (!isResolved) {
              isResolved = true;
              wavesurfer.un('ready', handleReady);
              wavesurfer.un('error', handleError);
              console.log(`[WaveSurfer] Instance ${containerId} is ready`);
              resolve(null);
            }
          };

          const handleError = (err: Error) => {
            if (!isResolved) {
              isResolved = true;
              wavesurfer.un('ready', handleReady);
              wavesurfer.un('error', handleError);
              console.error(`[WaveSurfer] Instance ${containerId} error:`, err);
              reject(err);
            }
          };

          wavesurfer.on('ready', handleReady);
          wavesurfer.on('error', handleError);
        });

        // Update the instance state
        const currentInstance = instancesRef.current.get(containerId);
        if (currentInstance && currentInstance.state === 'creating') {
          currentInstance.instance = wavesurfer;
          currentInstance.state = 'ready';
          return wavesurfer;
        } else {
          // Instance was cleaned up while we were creating it
          wavesurfer.destroy();
          return null;
        }
      } catch (error) {
        console.error('[WaveSurfer] Error creating instance:', error);
        instancesRef.current.delete(containerId);
        return null;
      }
    })();

    // Store the instance with its creation promise
    newInstance.promise = creationPromise;
    instancesRef.current.set(containerId, newInstance);

    return creationPromise;
  }, []);

  return (
    <WaveSurferContext.Provider value={{ createInstance, releaseInstance: cleanupInstance }}>
      {children}
    </WaveSurferContext.Provider>
  );
}

export function useWaveSurfer() {
  const context = useContext(WaveSurferContext);
  if (!context) {
    throw new Error('useWaveSurfer must be used within a WaveSurferProvider');
  }
  return context;
}
