import { describe, expect, it } from 'vitest';

import { EXERCISES } from '@/features/exercises/data';
import { LESSONS } from '@/features/learn/data';
import { PROFILE_ACHIEVEMENTS } from '@/features/profile/profileAchievements';
import { PROGRAMS } from '@/features/programs/data';
import en from '@/i18n/locales/en.json';
import ky from '@/i18n/locales/ky.json';
import ru from '@/i18n/locales/ru.json';

type LocaleTree = Record<string, unknown>;

function flattenKeys(value: unknown, prefix = ''): string[] {
  if (Array.isArray(value)) {
    return value.flatMap((item, index) => flattenKeys(item, `${prefix}.${index}`));
  }

  if (value && typeof value === 'object') {
    return Object.entries(value as LocaleTree).flatMap(([key, child]) =>
      flattenKeys(child, prefix ? `${prefix}.${key}` : key)
    );
  }

  return prefix ? [prefix] : [];
}

function hasKey(locale: LocaleTree, key: string): boolean {
  return (
    key.split('.').reduce<unknown>((current, part) => {
      if (current && typeof current === 'object' && part in current) {
        return (current as LocaleTree)[part];
      }
      return undefined;
    }, locale) !== undefined
  );
}

function collectContentKeys(): string[] {
  const keys = new Set<string>();

  for (const exercise of EXERCISES) {
    keys.add(exercise.nameKey);
    keys.add(exercise.descriptionKey);
    exercise.commonErrorKeys.forEach(key => keys.add(key));
    exercise.modificationKeys.forEach(key => keys.add(key));
    exercise.rules.forEach(rule => keys.add(rule.feedbackKey));
  }

  for (const lesson of LESSONS) {
    keys.add(lesson.titleKey);
    keys.add(lesson.summaryKey);
    lesson.bodyKeys.forEach(key => keys.add(key));
    lesson.keyTakeawayKeys?.forEach(key => keys.add(key));
  }

  for (const program of PROGRAMS) {
    keys.add(program.nameKey);
    keys.add(program.descriptionKey);
  }

  for (const achievement of PROFILE_ACHIEVEMENTS) {
    keys.add(achievement.titleKey);
  }

  return [...keys].sort();
}

describe('i18n quality gate', () => {
  const locales = { en, ru, ky } satisfies Record<string, LocaleTree>;

  it('keeps translation keys identical across all supported languages', () => {
    const baseline = flattenKeys(en).sort();

    for (const [language, locale] of Object.entries(locales)) {
      const keys = flattenKeys(locale).sort();
      const missing = baseline.filter(key => !keys.includes(key));
      const extra = keys.filter(key => !baseline.includes(key));

      expect(
        { language, missing, extra },
        `${language} locale has missing or extra translation keys`
      ).toEqual({ language, missing: [], extra: [] });
    }
  });

  it('has translations for every exercise, lesson, program, achievement, and feedback key', () => {
    const contentKeys = collectContentKeys();

    for (const [language, locale] of Object.entries(locales)) {
      const missing = contentKeys.filter(key => !hasKey(locale, key));

      expect(
        { language, missing },
        `${language} locale is missing content keys: ${missing.join(', ')}`
      ).toEqual({ language, missing: [] });
    }
  });
});
