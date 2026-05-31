import { useCallback, useEffect, useRef } from 'react';

import type { NormalizedLandmark } from '@mediapipe/tasks-vision';

import type { Exercise } from '@/features/exercises/types';
import type { RepPhase } from '@/features/exercises/types';
import { calculateAngle, calculateRulePenalty, smoothAngle } from '@/features/workout/angles';
import { useWorkoutStore } from '@/features/workout/workoutStore';

// Minimum ms to stay in a phase before switching — prevents jitter-triggered reps
const MIN_PHASE_MS = 400;
const MIN_TRACKING_CONFIDENCE = 0.45;

type UseWorkoutEngineReturn = {
  processFrame: (landmarks: NormalizedLandmark[]) => void;
};

function trackingConfidence(landmark: NormalizedLandmark | undefined): number {
  if (!landmark) return 0;
  return landmark.visibility ?? 1;
}

function hasReliableLandmarks(...landmarks: Array<NormalizedLandmark | undefined>) {
  return landmarks.every(landmark => trackingConfidence(landmark) >= MIN_TRACKING_CONFIDENCE);
}

export function useWorkoutEngine(exercise: Exercise | null): UseWorkoutEngineReturn {
  const {
    phase,
    isRunning,
    repCount,
    targetReps,
    setPhase,
    incrementRep,
    pushScore,
    addFeedback,
    clearFeedback,
  } = useWorkoutStore();

  const phaseRef = useRef<RepPhase>(phase);
  const isRunningRef = useRef(isRunning);
  const repCountRef = useRef(repCount);
  const angleHistoryRef = useRef<number[]>([]);
  const lastPhaseSwitchRef = useRef<number>(0);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);
  useEffect(() => {
    isRunningRef.current = isRunning;
  }, [isRunning]);
  useEffect(() => {
    repCountRef.current = repCount;
  }, [repCount]);

  const processFrame = useCallback(
    (landmarks: NormalizedLandmark[]) => {
      if (!exercise || !isRunningRef.current) return;
      if (repCountRef.current >= targetReps && targetReps > 0) return;

      const currentPhase = phaseRef.current;
      const { down: downThresh, up: upThresh } = exercise.repPhaseThreshold;
      const { a: repAIndex, vertex: repVertexIndex, b: repBIndex } = exercise.repAngleLandmarks;

      const a = landmarks[repAIndex];
      const vertex = landmarks[repVertexIndex];
      const b = landmarks[repBIndex];

      if (!hasReliableLandmarks(a, vertex, b)) {
        pushScore(45);
        return;
      }

      // Smooth raw angle to reduce jitter
      const rawAngle = calculateAngle(a, vertex, b);
      const smoothed = smoothAngle(angleHistoryRef.current, rawAngle);
      angleHistoryRef.current = [...angleHistoryRef.current.slice(-5), smoothed];
      const repAngle = smoothed;

      const now = performance.now();
      const canSwitch = now - lastPhaseSwitchRef.current > MIN_PHASE_MS;

      if (canSwitch) {
        if (currentPhase === 'up' && repAngle < downThresh) {
          setPhase('down');
          lastPhaseSwitchRef.current = now;
        } else if (currentPhase === 'down' && repAngle > upThresh) {
          setPhase('up');
          lastPhaseSwitchRef.current = now;
          incrementRep();
        }
      }

      // Form checks
      const violatedErrors: string[] = [];
      const violatedWarns: string[] = [];
      let frameScore = 100;
      let checkedRules = 0;
      let missingRuleLandmarks = 0;

      for (const rule of exercise.rules) {
        if (rule.phase !== 'any' && rule.phase !== currentPhase) {
          clearFeedback(rule.id);
          continue;
        }

        const lmA = landmarks[rule.landmarks.a];
        const lmV = landmarks[rule.landmarks.vertex];
        const lmB = landmarks[rule.landmarks.b];

        if (!hasReliableLandmarks(lmA, lmV, lmB)) {
          missingRuleLandmarks += 1;
          continue;
        }

        checkedRules += 1;
        const angle = calculateAngle(lmA, lmV, lmB);
        const penalty = calculateRulePenalty({
          angle,
          minAngle: rule.minAngle,
          maxAngle: rule.maxAngle,
          severity: rule.severity,
        });
        const violated = penalty > 0;

        if (violated) {
          frameScore -= penalty;
          addFeedback({
            ruleId: rule.id,
            feedbackKey: rule.feedbackKey,
            message: rule.feedback,
            severity: rule.severity,
          });
          if (rule.severity === 'error') violatedErrors.push(rule.id);
          else violatedWarns.push(rule.id);
        } else {
          clearFeedback(rule.id);
        }
      }

      if (checkedRules === 0 && missingRuleLandmarks > 0) {
        frameScore = Math.min(frameScore, 55);
      } else if (missingRuleLandmarks > 0) {
        frameScore -= missingRuleLandmarks * 10;
      }

      pushScore(frameScore);
    },
    [exercise, targetReps, setPhase, incrementRep, pushScore, addFeedback, clearFeedback]
  );

  return { processFrame };
}
