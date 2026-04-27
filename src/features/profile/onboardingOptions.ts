import type {
  ActivityLevel,
  FitnessGoal,
  FitnessLevel,
  InjuryType,
} from '@/features/profile/types';

export const TOTAL_STEPS = 8;

export type GoalOption = { value: FitnessGoal; emoji: string };
export type LevelOption = { value: FitnessLevel; descKey: string };
export type ActivityOption = { value: ActivityLevel; descKey: string };
export type InjuryOption = { value: InjuryType; emoji: string };

export const GOAL_OPTIONS: GoalOption[] = [
  { value: 'lose_weight', emoji: '🔥' },
  { value: 'build_muscle', emoji: '💪' },
  { value: 'improve_technique', emoji: '🎯' },
  { value: 'stay_active', emoji: '⚡' },
  { value: 'rehabilitation', emoji: '🌿' },
];

export const LEVEL_OPTIONS: LevelOption[] = [
  { value: 'beginner', descKey: 'onboarding.level.beginnerDesc' },
  { value: 'intermediate', descKey: 'onboarding.level.intermediateDesc' },
  { value: 'advanced', descKey: 'onboarding.level.advancedDesc' },
];

export const ACTIVITY_OPTIONS: ActivityOption[] = [
  { value: 'sedentary', descKey: 'onboarding.activityLevel.sedentaryDesc' },
  { value: 'light', descKey: 'onboarding.activityLevel.lightDesc' },
  { value: 'moderate', descKey: 'onboarding.activityLevel.moderateDesc' },
  { value: 'active', descKey: 'onboarding.activityLevel.activeDesc' },
  { value: 'very_active', descKey: 'onboarding.activityLevel.very_activeDesc' },
];

export const INJURY_OPTIONS: InjuryOption[] = [
  { value: 'none', emoji: '✅' },
  { value: 'lower_back', emoji: '🦴' },
  { value: 'knees', emoji: '🦵' },
  { value: 'shoulders', emoji: '💪' },
  { value: 'wrists', emoji: '✋' },
  { value: 'neck', emoji: '🫀' },
  { value: 'ankles', emoji: '🦶' },
  { value: 'hips', emoji: '🏃' },
];
