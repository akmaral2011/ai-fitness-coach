import type { i18n as I18n, TFunction } from 'i18next';
import { describe, expect, it } from 'vitest';

import {
  getLessonBody,
  getLessonSummary,
  getLessonTakeaways,
  getLessonTitle,
} from '@/features/learn/lessonText';
import type { DisplayLesson } from '@/features/learn/useLessons';

function createI18n(language: string, existingKeys: string[] = []) {
  return {
    language,
    resolvedLanguage: language,
    exists: (key: string) => existingKeys.includes(key),
  } as I18n;
}

const t = ((key: string) => `translated:${key}`) as TFunction;

const lesson: DisplayLesson = {
  id: 'squat-video',
  type: 'video',
  emoji: '🦵',
  category: 'technique',
  titleKey: 'learn.lessons.squatVideo.title',
  summaryKey: 'learn.lessons.squatVideo.summary',
  bodyKeys: ['learn.lessons.squatVideo.p1', 'learn.lessons.squatVideo.p2'],
  keyTakeawayKeys: ['learn.lessons.squatVideo.t1', 'learn.lessons.squatVideo.t2'],
  remoteTitle: 'Remote English title',
  remoteSummary: 'Remote English summary',
  remoteBody: ['Remote English body'],
  remoteKeyTakeaways: ['Remote English takeaway'],
};

describe('lessonText', () => {
  it('uses remote backend text for English lessons', () => {
    const i18n = createI18n('en', [lesson.titleKey, lesson.summaryKey]);

    expect(getLessonTitle(lesson, t, i18n)).toBe('Remote English title');
    expect(getLessonSummary(lesson, t, i18n)).toBe('Remote English summary');
    expect(getLessonBody(lesson, t, i18n)).toEqual(['Remote English body']);
    expect(getLessonTakeaways(lesson, t, i18n)).toEqual(['Remote English takeaway']);
  });

  it('uses translated app text for Russian and Kyrgyz lessons', () => {
    const i18n = createI18n('ky', [lesson.titleKey, lesson.summaryKey]);

    expect(getLessonTitle(lesson, t, i18n)).toBe(`translated:${lesson.titleKey}`);
    expect(getLessonSummary(lesson, t, i18n)).toBe(`translated:${lesson.summaryKey}`);
    expect(getLessonBody(lesson, t, i18n)).toEqual([
      `translated:${lesson.bodyKeys[0]}`,
      `translated:${lesson.bodyKeys[1]}`,
    ]);
    expect(getLessonTakeaways(lesson, t, i18n)).toEqual([
      `translated:${lesson.keyTakeawayKeys?.[0]}`,
      `translated:${lesson.keyTakeawayKeys?.[1]}`,
    ]);
  });
});
