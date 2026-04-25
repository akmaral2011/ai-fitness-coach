import { useCallback, useEffect, useRef, useState } from 'react';

import type {
  NormalizedLandmark,
  PoseLandmarker,
  PoseLandmarkerResult,
} from '@mediapipe/tasks-vision';

const MODEL_URL =
  'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task';

type PoseLandmarkerState = {
  landmarks: NormalizedLandmark[] | null;
  isReady: boolean;
  error: string | null;
};

type UsePoseLandmarkerReturn = PoseLandmarkerState & {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  startCamera: () => Promise<void>;
  stopCamera: () => void;
};

export function usePoseLandmarker(enabled: boolean): UsePoseLandmarkerReturn {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const landmarkerRef = useRef<PoseLandmarker | null>(null);
  const rafRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const lastTimeRef = useRef<number>(-1);

  const [state, setState] = useState<PoseLandmarkerState>({
    landmarks: null,
    isReady: false,
    error: null,
  });

  const landmarksRef = useRef<NormalizedLandmark[] | null>(null);

  const setLandmarks = useCallback((lms: NormalizedLandmark[] | null) => {
    landmarksRef.current = lms;
    setState(prev => ({ ...prev, landmarks: lms }));
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        const { FilesetResolver, PoseLandmarker: PL } = await import('@mediapipe/tasks-vision');
        if (cancelled) return;

        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
        );
        if (cancelled) return;

        const landmarker = await PL.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: MODEL_URL,
            delegate: 'GPU',
          },
          runningMode: 'VIDEO',
          numPoses: 1,
          minPoseDetectionConfidence: 0.5,
          minPosePresenceConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });

        if (cancelled) {
          landmarker.close();
          return;
        }

        landmarkerRef.current = landmarker;
        setState(prev => ({ ...prev, isReady: true }));
      } catch {
        if (!cancelled) {
          setState(prev => ({ ...prev, error: 'Failed to load AI model' }));
        }
      }
    }

    init();
    return () => {
      cancelled = true;
    };
  }, []);

  const runDetectionLoop = useCallback(() => {
    const video = videoRef.current;
    const landmarker = landmarkerRef.current;
    if (!video || !landmarker || video.readyState < 2) {
      rafRef.current = requestAnimationFrame(runDetectionLoop);
      return;
    }

    const now = performance.now();
    if (now === lastTimeRef.current) {
      rafRef.current = requestAnimationFrame(runDetectionLoop);
      return;
    }
    lastTimeRef.current = now;

    let result: PoseLandmarkerResult;
    try {
      result = landmarker.detectForVideo(video, now);
    } catch {
      rafRef.current = requestAnimationFrame(runDetectionLoop);
      return;
    }

    const pose = result.landmarks[0] ?? null;
    setLandmarks(pose);

    rafRef.current = requestAnimationFrame(runDetectionLoop);
  }, [setLandmarks]);

  const startCamera = useCallback(async () => {
    setState(prev => ({ ...prev, error: null }));
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      });
      streamRef.current = stream;
      const video = videoRef.current;
      if (video) {
        video.srcObject = stream;
        await video.play();
      }
      rafRef.current = requestAnimationFrame(runDetectionLoop);
    } catch {
      setState(prev => ({
        ...prev,
        error: 'camera_denied',
      }));
    }
  }, [runDetectionLoop]);

  const stopCamera = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    const video = videoRef.current;
    if (video) {
      video.srcObject = null;
    }
    setLandmarks(null);
  }, [setLandmarks]);

  useEffect(() => {
    if (!enabled) {
      stopCamera();
    }
  }, [enabled, stopCamera]);

  useEffect(() => {
    return () => {
      stopCamera();
      landmarkerRef.current?.close();
    };
  }, [stopCamera]);

  return {
    ...state,
    videoRef,
    canvasRef,
    startCamera,
    stopCamera,
  };
}
