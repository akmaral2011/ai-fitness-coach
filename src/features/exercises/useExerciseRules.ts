import { useEffect, useMemo, useState } from 'react';

import type { AngleRule, Exercise, LandmarkTriplet, RepPhase } from '@/features/exercises/types';
import { apiRequest } from '@/lib/api';

type ApiExerciseRule = {
  code: string;
  phase: RepPhase | 'any';
  landmarks: LandmarkTriplet;
  angleMin: number;
  angleMax: number;
  severity: 'warn' | 'error';
  feedback: string;
};

function isLandmarkTriplet(value: unknown): value is LandmarkTriplet {
  if (!value || typeof value !== 'object') return false;
  const triplet = value as Partial<LandmarkTriplet>;
  return (
    typeof triplet.a === 'number' &&
    typeof triplet.vertex === 'number' &&
    typeof triplet.b === 'number'
  );
}

function isApiExerciseRule(value: unknown): value is ApiExerciseRule {
  if (!value || typeof value !== 'object') return false;
  const rule = value as Partial<ApiExerciseRule>;
  return (
    typeof rule.code === 'string' &&
    (rule.phase === 'up' ||
      rule.phase === 'down' ||
      rule.phase === 'hold' ||
      rule.phase === 'any') &&
    isLandmarkTriplet(rule.landmarks) &&
    typeof rule.angleMin === 'number' &&
    typeof rule.angleMax === 'number' &&
    (rule.severity === 'warn' || rule.severity === 'error') &&
    typeof rule.feedback === 'string'
  );
}

function toAngleRule(apiRule: ApiExerciseRule, localRule: AngleRule | undefined): AngleRule {
  return {
    id: apiRule.code,
    landmarks: apiRule.landmarks,
    phase: apiRule.phase,
    minAngle: apiRule.angleMin,
    maxAngle: apiRule.angleMax,
    feedbackKey: localRule?.feedbackKey ?? 'workout.feedback.generic',
    feedback: apiRule.feedback,
    severity: apiRule.severity,
  };
}

export function useExerciseRules(baseExercise: Exercise | null) {
  const [remoteRules, setRemoteRules] = useState<AngleRule[] | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!baseExercise) {
      setRemoteRules(null);
      return;
    }

    let cancelled = false;
    const currentExercise = baseExercise;

    async function loadRules() {
      setLoading(true);
      try {
        const response = await apiRequest<{ rules: unknown[] }>(
          `/api/exercises/${currentExercise.slug}/rules`
        );
        if (cancelled) return;

        const mappedRules = response.rules
          .filter(isApiExerciseRule)
          .map((rule, index) => toAngleRule(rule, currentExercise.rules[index]));

        setRemoteRules(mappedRules.length > 0 ? mappedRules : null);
      } catch (error) {
        console.error('Failed to load exercise rules from backend', error);
        if (!cancelled) setRemoteRules(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadRules();

    return () => {
      cancelled = true;
    };
  }, [baseExercise]);

  const exercise = useMemo(() => {
    if (!baseExercise) return null;
    if (!remoteRules) return baseExercise;
    return { ...baseExercise, rules: remoteRules };
  }, [baseExercise, remoteRules]);

  return {
    exercise,
    loading,
    usingRemoteRules: remoteRules !== null,
  };
}
