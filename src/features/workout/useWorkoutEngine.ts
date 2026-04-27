import { useCallback, useEffect, useRef } from 'react';

import type { NormalizedLandmark } from '@mediapipe/tasks-vision';

import type { Exercise } from '@/features/exercises/types';
import type { RepPhase } from '@/features/exercises/types';
import { calculateAngle, calculateRepScore } from '@/features/workout/angles';
import { useWorkoutStore } from '@/features/workout/workoutStore';

type UseWorkoutEngineReturn = {
  processFrame: (landmarks: NormalizedLandmark[]) => void;
};

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

      {
        const { down: downThresh, up: upThresh } = exercise.repPhaseThreshold;
        const { a: repAIndex, vertex: repVertexIndex, b: repBIndex } = exercise.repAngleLandmarks;
        const a = landmarks[repAIndex];
        const vertex = landmarks[repVertexIndex];
        const b = landmarks[repBIndex];

        if (!a || !vertex || !b) return;

        const repAngle = calculateAngle(a, vertex, b);

        if (currentPhase === 'down' && repAngle > upThresh) {
          setPhase('up');
        } else if (currentPhase === 'up' && repAngle < downThresh) {
          setPhase('down');
          incrementRep();
        }
      }

      const violatedErrors: string[] = [];
      const violatedWarns: string[] = [];

      for (const rule of exercise.rules) {
        if (rule.phase !== 'any' && rule.phase !== currentPhase) {
          clearFeedback(rule.id);
          continue;
        }

        const lmA = landmarks[rule.landmarks.a];
        const lmV = landmarks[rule.landmarks.vertex];
        const lmB = landmarks[rule.landmarks.b];

        if (!lmA || !lmV || !lmB) continue;

        const angle = calculateAngle(lmA, lmV, lmB);
        const violated = angle < rule.minAngle || angle > rule.maxAngle;

        if (violated) {
          addFeedback({
            ruleId: rule.id,
            feedbackKey: rule.feedbackKey,
            severity: rule.severity,
          });
          if (rule.severity === 'error') violatedErrors.push(rule.id);
          else violatedWarns.push(rule.id);
        } else {
          clearFeedback(rule.id);
        }
      }

      const score = calculateRepScore(violatedErrors.length, violatedWarns.length);
      pushScore(score);
    },
    [exercise, targetReps, setPhase, incrementRep, pushScore, addFeedback, clearFeedback]
  );

  return { processFrame };
}
