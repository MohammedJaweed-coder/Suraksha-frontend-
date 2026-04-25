import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';
import type { CameraMode } from '../types';

interface UseCameraOptions {
  mode: CameraMode;
}

interface UseCameraReturn {
  stream: MediaStream | null;
  capturedBlob: Blob | null;
  capture: () => Promise<Blob | null>;
  clearCapture: () => void;
  stopStream: () => void;
  error: string | null;
  videoRef: RefObject<HTMLVideoElement>;
}

export function useCamera({ mode }: UseCameraOptions): UseCameraReturn {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedBlob, setCapturedBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    let isMounted = true;
    let currentStream: MediaStream | null = null;

    async function startStream(): Promise<void> {
      try {
        const constraints: MediaStreamConstraints = {
          audio: mode === 'audio' || mode === 'video',
          video: mode === 'photo' || mode === 'video'
        };
        const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
        if (!isMounted) {
          mediaStream.getTracks().forEach((track) => track.stop());
          return;
        }

        currentStream = mediaStream;
        setStream(mediaStream);
        setError(null);

        if (videoRef.current && constraints.video) {
          videoRef.current.srcObject = mediaStream;
          void videoRef.current.play().catch(() => undefined);
        }
      } catch {
        setError(
          mode === 'audio'
            ? 'Microphone access denied. Please allow microphone permission.'
            : 'Camera access denied. Please allow camera permission.'
        );
      }
    }

    void startStream();

    return () => {
      isMounted = false;
      currentStream?.getTracks().forEach((track) => track.stop());
    };
  }, [mode]);

  const stopStream = useCallback(() => {
    stream?.getTracks().forEach((track) => track.stop());
    setStream(null);
  }, [stream]);

  const clearCapture = useCallback(() => {
    setCapturedBlob(null);
  }, []);

  const capture = useCallback(async (): Promise<Blob | null> => {
    if (!stream) {
      setError('Could not capture media from this device.');
      return null;
    }

    if (mode === 'photo') {
      const videoElement = videoRef.current;
      if (!videoElement) {
        return null;
      }

      const canvas = document.createElement('canvas');
      canvas.width = videoElement.videoWidth || 1280;
      canvas.height = videoElement.videoHeight || 720;
      const context = canvas.getContext('2d');
      context?.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.92));
      setCapturedBlob(blob);
      return blob;
    }

    return new Promise((resolve, reject) => {
      const chunks: BlobPart[] = [];
      const recorder = new MediaRecorder(stream, {
        mimeType: mode === 'audio' ? 'audio/webm' : 'video/webm'
      });

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      recorder.onerror = () => reject(new Error('Could not capture media from this device.'));
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: mode === 'audio' ? 'audio/webm' : 'video/webm' });
        setCapturedBlob(blob);
        resolve(blob);
      };

      recorder.start();
      window.setTimeout(() => recorder.stop(), mode === 'audio' ? 10000 : 5000);
    });
  }, [mode, stream]);

  return {
    stream,
    capturedBlob,
    capture,
    clearCapture,
    stopStream,
    error,
    videoRef
  };
}
