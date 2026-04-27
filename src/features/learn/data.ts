export type ArticleCategory = 'technique' | 'training' | 'recovery' | 'beginner';
export type LessonType = 'article' | 'video';

export type Lesson = {
  id: string;
  type: LessonType;
  emoji: string;
  category: ArticleCategory;
  readMinutes?: number;
  durationMinutes?: number;
  titleKey: string;
  summaryKey: string;
  bodyKeys: string[];
  keyTakeawayKeys?: string[];
  videoId?: string;
  linkedExerciseId?: string;
};

export type Article = Lesson;

export const LESSONS: Lesson[] = [
  // ── VIDEO LESSONS ─────────────────────────────────────────────────
  {
    id: 'squat-video',
    type: 'video',
    emoji: '🦵',
    category: 'technique',
    durationMinutes: 8,
    titleKey: 'learn.lessons.squatVideo.title',
    summaryKey: 'learn.lessons.squatVideo.summary',
    bodyKeys: ['learn.lessons.squatVideo.p1', 'learn.lessons.squatVideo.p2'],
    keyTakeawayKeys: [
      'learn.lessons.squatVideo.t1',
      'learn.lessons.squatVideo.t2',
      'learn.lessons.squatVideo.t3',
      'learn.lessons.squatVideo.t4',
    ],
    linkedExerciseId: 'squat',
  },
  {
    id: 'pushup-video',
    type: 'video',
    emoji: '💪',
    category: 'technique',
    durationMinutes: 6,
    titleKey: 'learn.lessons.pushupVideo.title',
    summaryKey: 'learn.lessons.pushupVideo.summary',
    bodyKeys: ['learn.lessons.pushupVideo.p1', 'learn.lessons.pushupVideo.p2'],
    keyTakeawayKeys: [
      'learn.lessons.pushupVideo.t1',
      'learn.lessons.pushupVideo.t2',
      'learn.lessons.pushupVideo.t3',
      'learn.lessons.pushupVideo.t4',
    ],
    linkedExerciseId: 'pushup',
  },
  {
    id: 'plank-video',
    type: 'video',
    emoji: '🧘',
    category: 'technique',
    durationMinutes: 5,
    titleKey: 'learn.lessons.plankVideo.title',
    summaryKey: 'learn.lessons.plankVideo.summary',
    bodyKeys: ['learn.lessons.plankVideo.p1', 'learn.lessons.plankVideo.p2'],
    keyTakeawayKeys: [
      'learn.lessons.plankVideo.t1',
      'learn.lessons.plankVideo.t2',
      'learn.lessons.plankVideo.t3',
      'learn.lessons.plankVideo.t4',
    ],
    linkedExerciseId: 'plank',
  },
  {
    id: 'lunge-video',
    type: 'video',
    emoji: '🏃',
    category: 'technique',
    durationMinutes: 7,
    titleKey: 'learn.lessons.lungeVideo.title',
    summaryKey: 'learn.lessons.lungeVideo.summary',
    bodyKeys: ['learn.lessons.lungeVideo.p1', 'learn.lessons.lungeVideo.p2'],
    keyTakeawayKeys: [
      'learn.lessons.lungeVideo.t1',
      'learn.lessons.lungeVideo.t2',
      'learn.lessons.lungeVideo.t3',
      'learn.lessons.lungeVideo.t4',
    ],
    linkedExerciseId: 'lunge',
  },
  {
    id: 'progressive-overload-video',
    type: 'video',
    emoji: '📈',
    category: 'training',
    durationMinutes: 10,
    titleKey: 'learn.lessons.progressiveOverloadVideo.title',
    summaryKey: 'learn.lessons.progressiveOverloadVideo.summary',
    bodyKeys: [
      'learn.lessons.progressiveOverloadVideo.p1',
      'learn.lessons.progressiveOverloadVideo.p2',
    ],
    keyTakeawayKeys: [
      'learn.lessons.progressiveOverloadVideo.t1',
      'learn.lessons.progressiveOverloadVideo.t2',
      'learn.lessons.progressiveOverloadVideo.t3',
      'learn.lessons.progressiveOverloadVideo.t4',
    ],
  },
  // ── ARTICLES ──────────────────────────────────────────────────────
  {
    id: 'form-over-reps',
    type: 'article',
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
    type: 'article',
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
    linkedExerciseId: 'squat',
  },
  {
    id: 'pushup-progression',
    type: 'article',
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
    linkedExerciseId: 'pushup',
  },
  {
    id: 'hip-hinge',
    type: 'article',
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
    type: 'article',
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
    type: 'article',
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
    type: 'article',
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
    type: 'article',
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
    type: 'article',
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
    type: 'article',
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
    type: 'article',
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
    type: 'article',
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

export const ARTICLES = LESSONS.filter(l => l.type === 'article');

export function getLesson(id: string): Lesson | undefined {
  return LESSONS.find(l => l.id === id);
}

export function getArticle(id: string): Lesson | undefined {
  return LESSONS.find(l => l.id === id);
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
