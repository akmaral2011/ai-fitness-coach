import { useEffect, useMemo, useState } from 'react';

import { type ArticleCategory, LESSONS, type Lesson, type LessonType } from '@/features/learn/data';
import { apiRequest } from '@/lib/api';

type ApiLesson = {
  id: string;
  type: LessonType;
  emoji: string;
  category: ArticleCategory;
  readMinutes?: number | null;
  durationMinutes?: number | null;
  title: string;
  summary: string;
  body: string[];
  keyTakeaways?: string[];
  videoId?: string | null;
  linkedExerciseId?: string | null;
};

export type DisplayLesson = Lesson & {
  remoteTitle?: string;
  remoteSummary?: string;
  remoteBody?: string[];
  remoteKeyTakeaways?: string[];
};

function mergeLesson(apiLesson: ApiLesson): DisplayLesson {
  const local = LESSONS.find(item => item.id === apiLesson.id);
  return {
    ...(local ?? {
      id: apiLesson.id,
      type: apiLesson.type,
      emoji: apiLesson.emoji,
      category: apiLesson.category,
      titleKey: '',
      summaryKey: '',
      bodyKeys: [],
    }),
    type: apiLesson.type,
    emoji: apiLesson.emoji,
    category: apiLesson.category,
    readMinutes: apiLesson.readMinutes ?? undefined,
    durationMinutes: apiLesson.durationMinutes ?? undefined,
    videoId: apiLesson.videoId ?? undefined,
    linkedExerciseId: apiLesson.linkedExerciseId ?? undefined,
    remoteTitle: apiLesson.title,
    remoteSummary: apiLesson.summary,
    remoteBody: apiLesson.body,
    remoteKeyTakeaways: apiLesson.keyTakeaways,
  };
}

export function useLessons() {
  const [remoteLessons, setRemoteLessons] = useState<DisplayLesson[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadLessons() {
      try {
        const response = await apiRequest<{ lessons: ApiLesson[] }>('/api/lessons');
        if (!cancelled) setRemoteLessons(response.lessons.map(mergeLesson));
      } catch (error) {
        console.error('Failed to load lessons from backend', error);
        if (!cancelled) setRemoteLessons(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadLessons();

    return () => {
      cancelled = true;
    };
  }, []);

  const lessons = useMemo<DisplayLesson[]>(() => remoteLessons ?? LESSONS, [remoteLessons]);

  return { lessons, loading, usingRemoteData: remoteLessons !== null };
}
