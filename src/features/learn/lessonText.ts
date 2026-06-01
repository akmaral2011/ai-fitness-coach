import type { i18n as I18n, TFunction } from 'i18next';

import type { DisplayLesson } from '@/features/learn/useLessons';

function isEnglish(i18n: I18n) {
  return (i18n.resolvedLanguage || i18n.language || '').startsWith('en');
}

function hasTranslation(i18n: I18n, key: string | undefined) {
  return Boolean(key && i18n.exists(key));
}

export function getLessonTitle(lesson: DisplayLesson, t: TFunction, i18n: I18n) {
  if (!isEnglish(i18n) && hasTranslation(i18n, lesson.titleKey)) return t(lesson.titleKey);
  return lesson.remoteTitle ?? t(lesson.titleKey);
}

export function getLessonSummary(lesson: DisplayLesson, t: TFunction, i18n: I18n) {
  if (!isEnglish(i18n) && hasTranslation(i18n, lesson.summaryKey)) return t(lesson.summaryKey);
  return lesson.remoteSummary ?? t(lesson.summaryKey);
}

export function getLessonBody(lesson: DisplayLesson, t: TFunction, i18n: I18n) {
  if (!isEnglish(i18n) && lesson.bodyKeys.length > 0) {
    return lesson.bodyKeys.map(key => t(key));
  }

  return lesson.remoteBody ?? lesson.bodyKeys.map(key => t(key));
}

export function getLessonTakeaways(lesson: DisplayLesson, t: TFunction, i18n: I18n) {
  if (!isEnglish(i18n) && (lesson.keyTakeawayKeys?.length ?? 0) > 0) {
    return lesson.keyTakeawayKeys?.map(key => t(key)) ?? [];
  }

  return lesson.remoteKeyTakeaways ?? lesson.keyTakeawayKeys?.map(key => t(key)) ?? [];
}
