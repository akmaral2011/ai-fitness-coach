export type Achievement = {
  id: string;
  titleKey: string;
  descKey: string;
  emoji: string;
  check: (sessions: number, streak: number, maxScore: number, totalReps: number) => boolean;
};

export const PROFILE_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_workout',
    titleKey: 'profile.achievementList.first_workout',
    descKey: 'profile.achievementList.first_workout_desc',
    emoji: '🎯',
    check: sessions => sessions >= 1,
  },
  {
    id: 'streak_3',
    titleKey: 'profile.achievementList.streak_3',
    descKey: 'profile.achievementList.streak_3_desc',
    emoji: '🔥',
    check: (_sessions, streak) => streak >= 3,
  },
  {
    id: 'streak_7',
    titleKey: 'profile.achievementList.streak_7',
    descKey: 'profile.achievementList.streak_7_desc',
    emoji: '⚡',
    check: (_sessions, streak) => streak >= 7,
  },
  {
    id: 'perfect_score',
    titleKey: 'profile.achievementList.perfect_score',
    descKey: 'profile.achievementList.perfect_score_desc',
    emoji: '💎',
    check: (_sessions, _streak, maxScore) => maxScore >= 100,
  },
  {
    id: 'hundred_reps',
    titleKey: 'profile.achievementList.hundred_reps',
    descKey: 'profile.achievementList.hundred_reps_desc',
    emoji: '💪',
    check: (_sessions, _streak, _score, totalReps) => totalReps >= 100,
  },
];
