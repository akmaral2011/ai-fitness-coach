export type FitnessGoal =
  | 'lose_weight'
  | 'build_muscle'
  | 'improve_technique'
  | 'stay_active'
  | 'rehabilitation';
export type FitnessLevel = 'beginner' | 'intermediate' | 'advanced';
export type Gender = 'male' | 'female' | 'other';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
export type InjuryType =
  | 'lower_back'
  | 'knees'
  | 'shoulders'
  | 'wrists'
  | 'neck'
  | 'ankles'
  | 'hips'
  | 'none';

export type FitnessProfile = {
  heightCm: number;
  weightKg: number;
  ageYears: number;
  gender: Gender;
  activityLevel: ActivityLevel;
  injuries: InjuryType[];
  goal: FitnessGoal;
  fitnessLevel: FitnessLevel;
  completedAt: string;
};
