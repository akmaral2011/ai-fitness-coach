import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import { CheckCircle, Play } from 'lucide-react';

import { LESSONS, categoryColor } from '@/features/learn/data';
import type { ArticleCategory } from '@/features/learn/data';
import { useLearnStore } from '@/features/learn/learnStore';

type Filter = 'all' | 'video' | ArticleCategory;

const CATEGORIES: { key: Filter; labelKey: string }[] = [
  { key: 'all', labelKey: 'learn.categories.all' },
  { key: 'video', labelKey: 'learn.categories.video' },
  { key: 'technique', labelKey: 'learn.categories.technique' },
  { key: 'training', labelKey: 'learn.categories.training' },
  { key: 'recovery', labelKey: 'learn.categories.recovery' },
  { key: 'beginner', labelKey: 'learn.categories.beginner' },
];

export default function Learn() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<Filter>('all');
  const { completedIds } = useLearnStore();

  const filtered =
    filter === 'all'
      ? LESSONS
      : filter === 'video'
        ? LESSONS.filter(l => l.type === 'video')
        : LESSONS.filter(l => l.category === (filter as ArticleCategory));

  const completedCount = completedIds.filter(id => LESSONS.some(l => l.id === id)).length;
  const total = LESSONS.length;

  return (
    <div className="px-4 py-6 max-w-lg mx-auto">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-foreground">{t('learn.title')}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t('learn.subtitle')}</p>
      </div>

      <div className="flex items-center gap-3 mb-5">
        <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 rounded-full transition-all duration-500"
            style={{ width: `${total > 0 ? (completedCount / total) * 100 : 0}%` }}
          />
        </div>
        <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0">
          {t('learn.progress', { done: completedCount, total })}
        </span>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 mb-5 no-scrollbar">
        {CATEGORIES.map(({ key, labelKey }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
              filter === key
                ? 'bg-emerald-500 text-white'
                : 'bg-muted text-muted-foreground hover:text-foreground'
            }`}
          >
            {t(labelKey)}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        {filtered.map(lesson => {
          const isComplete = completedIds.includes(lesson.id);
          return (
            <button
              key={lesson.id}
              onClick={() => navigate(`/app/learn/${lesson.id}`)}
              className="flex items-start gap-4 p-4 bg-card border border-border rounded-2xl text-left hover:border-emerald-500/30 transition-colors group"
            >
              <span className="text-3xl leading-none mt-0.5 shrink-0">{lesson.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span
                    className={`text-xs font-semibold capitalize px-2 py-0.5 rounded-full ${categoryColor(lesson.category)}`}
                  >
                    {t(`learn.categories.${lesson.category}`)}
                  </span>
                  {lesson.type === 'video' && (
                    <span className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-violet-500/15 text-violet-500">
                      <Play className="w-2.5 h-2.5" />
                      {t('learn.video')}
                    </span>
                  )}
                  <span className="text-xs text-muted-foreground">
                    {lesson.type === 'video'
                      ? `${lesson.durationMinutes} ${t('learn.videoMin')}`
                      : `${lesson.readMinutes} ${t('learn.readMin')}`}
                  </span>
                </div>
                <p className="text-sm font-semibold text-foreground mb-1 group-hover:text-emerald-500 transition-colors">
                  {t(lesson.titleKey)}
                </p>
                <p className="text-xs text-muted-foreground line-clamp-2">{t(lesson.summaryKey)}</p>
              </div>
              {isComplete && <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-1" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
