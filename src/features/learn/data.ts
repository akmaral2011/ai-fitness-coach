export type ArticleCategory = 'technique' | 'training' | 'recovery' | 'beginner';

export type Article = {
  id: string;
  emoji: string;
  category: ArticleCategory;
  readMinutes: number;
  titleKey: string;
  summaryKey: string;
  bodyKeys: string[]; // each key → one paragraph
};

export const ARTICLES: Article[] = [
  {
    id: 'form-over-reps',
    emoji: '🎯',
    category: 'technique',
    readMinutes: 3,
    titleKey: 'learn.articles.formOverReps.title',
    summaryKey: 'learn.articles.formOverReps.summary',
    bodyKeys: [
      'learn.articles.formOverReps.p1',
      'learn.articles.formOverReps.p2',
      'learn.articles.formOverReps.p3',
    ],
  },
  {
    id: 'squat-form',
    emoji: '🦵',
    category: 'technique',
    readMinutes: 4,
    titleKey: 'learn.articles.squatForm.title',
    summaryKey: 'learn.articles.squatForm.summary',
    bodyKeys: [
      'learn.articles.squatForm.p1',
      'learn.articles.squatForm.p2',
      'learn.articles.squatForm.p3',
      'learn.articles.squatForm.p4',
    ],
  },
  {
    id: 'pushup-progression',
    emoji: '💪',
    category: 'technique',
    readMinutes: 3,
    titleKey: 'learn.articles.pushupProgression.title',
    summaryKey: 'learn.articles.pushupProgression.summary',
    bodyKeys: [
      'learn.articles.pushupProgression.p1',
      'learn.articles.pushupProgression.p2',
      'learn.articles.pushupProgression.p3',
    ],
  },
  {
    id: 'hip-hinge',
    emoji: '🔱',
    category: 'technique',
    readMinutes: 3,
    titleKey: 'learn.articles.hipHinge.title',
    summaryKey: 'learn.articles.hipHinge.summary',
    bodyKeys: [
      'learn.articles.hipHinge.p1',
      'learn.articles.hipHinge.p2',
      'learn.articles.hipHinge.p3',
    ],
  },
  {
    id: 'progressive-overload',
    emoji: '📈',
    category: 'training',
    readMinutes: 4,
    titleKey: 'learn.articles.progressiveOverload.title',
    summaryKey: 'learn.articles.progressiveOverload.summary',
    bodyKeys: [
      'learn.articles.progressiveOverload.p1',
      'learn.articles.progressiveOverload.p2',
      'learn.articles.progressiveOverload.p3',
    ],
  },
  {
    id: 'sets-and-reps',
    emoji: '🔢',
    category: 'training',
    readMinutes: 3,
    titleKey: 'learn.articles.setsAndReps.title',
    summaryKey: 'learn.articles.setsAndReps.summary',
    bodyKeys: [
      'learn.articles.setsAndReps.p1',
      'learn.articles.setsAndReps.p2',
      'learn.articles.setsAndReps.p3',
    ],
  },
  {
    id: 'warmup-cooldown',
    emoji: '🌡️',
    category: 'training',
    readMinutes: 3,
    titleKey: 'learn.articles.warmupCooldown.title',
    summaryKey: 'learn.articles.warmupCooldown.summary',
    bodyKeys: [
      'learn.articles.warmupCooldown.p1',
      'learn.articles.warmupCooldown.p2',
      'learn.articles.warmupCooldown.p3',
    ],
  },
  {
    id: 'rest-days',
    emoji: '😴',
    category: 'recovery',
    readMinutes: 3,
    titleKey: 'learn.articles.restDays.title',
    summaryKey: 'learn.articles.restDays.summary',
    bodyKeys: [
      'learn.articles.restDays.p1',
      'learn.articles.restDays.p2',
      'learn.articles.restDays.p3',
    ],
  },
  {
    id: 'managing-doms',
    emoji: '🩹',
    category: 'recovery',
    readMinutes: 3,
    titleKey: 'learn.articles.managingDoms.title',
    summaryKey: 'learn.articles.managingDoms.summary',
    bodyKeys: [
      'learn.articles.managingDoms.p1',
      'learn.articles.managingDoms.p2',
      'learn.articles.managingDoms.p3',
    ],
  },
  {
    id: 'sleep-muscle',
    emoji: '🌙',
    category: 'recovery',
    readMinutes: 3,
    titleKey: 'learn.articles.sleepMuscle.title',
    summaryKey: 'learn.articles.sleepMuscle.summary',
    bodyKeys: [
      'learn.articles.sleepMuscle.p1',
      'learn.articles.sleepMuscle.p2',
      'learn.articles.sleepMuscle.p3',
    ],
  },
  {
    id: 'starting-fitness',
    emoji: '🚀',
    category: 'beginner',
    readMinutes: 4,
    titleKey: 'learn.articles.startingFitness.title',
    summaryKey: 'learn.articles.startingFitness.summary',
    bodyKeys: [
      'learn.articles.startingFitness.p1',
      'learn.articles.startingFitness.p2',
      'learn.articles.startingFitness.p3',
      'learn.articles.startingFitness.p4',
    ],
  },
  {
    id: 'building-habit',
    emoji: '🔄',
    category: 'beginner',
    readMinutes: 3,
    titleKey: 'learn.articles.buildingHabit.title',
    summaryKey: 'learn.articles.buildingHabit.summary',
    bodyKeys: [
      'learn.articles.buildingHabit.p1',
      'learn.articles.buildingHabit.p2',
      'learn.articles.buildingHabit.p3',
    ],
  },
];

export function getArticle(id: string): Article | undefined {
  return ARTICLES.find(a => a.id === id);
}

export function categoryColor(category: ArticleCategory): string {
  switch (category) {
    case 'technique':
      return 'bg-blue-500/15 text-blue-500';
    case 'training':
      return 'bg-violet-500/15 text-violet-500';
    case 'recovery':
      return 'bg-emerald-500/15 text-emerald-500';
    case 'beginner':
      return 'bg-amber-500/15 text-amber-500';
  }
}
