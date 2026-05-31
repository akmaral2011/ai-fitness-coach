import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import { BookOpen, CheckCircle, Play, Sparkles, Video } from 'lucide-react';

import { categoryColor } from '@/features/learn/data';
import type { ArticleCategory } from '@/features/learn/data';
import { useLearnStore } from '@/features/learn/learnStore';
import { useLessons } from '@/features/learn/useLessons';

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
  const { lessons, loading, usingRemoteData } = useLessons();

  const filtered =
    filter === 'all'
      ? lessons
      : filter === 'video'
        ? lessons.filter(l => l.type === 'video')
        : lessons.filter(l => l.category === (filter as ArticleCategory));

  const completedCount = completedIds.filter(id => lessons.some(l => l.id === id)).length;
  const total = lessons.length;
  const stats = useMemo(
    () => ({
      videos: lessons.filter(lesson => lesson.type === 'video').length,
      articles: lessons.filter(lesson => lesson.type === 'article').length,
      remaining: Math.max(total - completedCount, 0),
    }),
    [completedCount, lessons, total]
  );
  const recommendedLesson = lessons.find(lesson => !completedIds.includes(lesson.id)) ?? lessons[0];

  return (
    <div className="app-page app-page-flow">
      <div className="app-hero-panel mb-5">
        <div className="relative p-4">
          <div className="relative">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <p className="app-hero-eyebrow">{t('learn.hub')}</p>
                <h1 className="app-page-title">{t('learn.title')}</h1>
                <p className="app-hero-body mt-1">{t('learn.subtitle')}</p>
              </div>
              <span
                className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
                  usingRemoteData
                    ? 'bg-emerald-500/15 text-emerald-500'
                    : 'bg-yellow-500/15 text-yellow-500'
                }`}
              >
                {usingRemoteData ? t('learn.backendLibrary') : t('learn.localLibrary')}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <LearningStat
                icon={<Video size={17} />}
                value={stats.videos}
                label={t('learn.stats.videos')}
              />
              <LearningStat
                icon={<BookOpen size={17} />}
                value={stats.articles}
                label={t('learn.stats.articles')}
              />
              <LearningStat
                icon={<CheckCircle size={17} />}
                value={completedCount}
                label={t('learn.stats.done')}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-5">
        <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className="app-progress-fill"
            style={{ width: `${total > 0 ? (completedCount / total) * 100 : 0}%` }}
          />
        </div>
        <span className="app-card-meta whitespace-nowrap shrink-0">
          {t('learn.progress', { done: completedCount, total })}
        </span>
      </div>

      {recommendedLesson && (
        <button
          onClick={() => navigate(`/app/learn/${recommendedLesson.id}`)}
          className="app-card app-card-hover mb-5 w-full bg-emerald-500/5 p-4 text-left"
        >
          <div className="mb-2 flex items-center gap-2 text-emerald-500">
            <Sparkles className="h-4 w-4" />
            <span className="text-xs font-bold uppercase tracking-wider">
              {t('learn.recommended')}
            </span>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-3xl leading-none">{recommendedLesson.emoji}</span>
            <span className="min-w-0 flex-1">
              <span className="app-card-title block">
                {recommendedLesson.remoteTitle ?? t(recommendedLesson.titleKey)}
              </span>
              <span className="app-card-meta mt-1 block line-clamp-2">
                {recommendedLesson.remoteSummary ?? t(recommendedLesson.summaryKey)}
              </span>
            </span>
            <span className="shrink-0 rounded-full bg-background px-2 py-1 text-xs font-semibold text-muted-foreground">
              {stats.remaining}
            </span>
          </div>
        </button>
      )}

      <div className="flex gap-2 overflow-x-auto pb-2 mb-5 no-scrollbar">
        {CATEGORIES.map(({ key, labelKey }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
              filter === key
                ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/20'
                : 'bg-muted text-muted-foreground hover:text-foreground'
            }`}
          >
            {t(labelKey)}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        {loading && (
          <div className="text-center py-8 text-muted-foreground">
            {t('common.loading', 'Loading...')}
          </div>
        )}
        {filtered.map(lesson => {
          const isComplete = completedIds.includes(lesson.id);
          return (
            <button
              key={lesson.id}
              onClick={() => navigate(`/app/learn/${lesson.id}`)}
              className="app-card app-card-hover group flex items-start gap-4 p-4 text-left"
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
                  <span className="app-card-meta">
                    {lesson.type === 'video'
                      ? `${lesson.durationMinutes} ${t('learn.videoMin')}`
                      : `${lesson.readMinutes} ${t('learn.readMin')}`}
                  </span>
                </div>
                <p className="app-card-title mb-1 transition-colors group-hover:text-emerald-500">
                  {lesson.remoteTitle ?? t(lesson.titleKey)}
                </p>
                <p className="app-card-meta line-clamp-2">
                  {lesson.remoteSummary ?? t(lesson.summaryKey)}
                </p>
              </div>
              {isComplete && <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-1" />}
            </button>
          );
        })}
        {!loading && filtered.length === 0 && (
          <div className="app-card app-card-meta py-10 text-center text-sm">
            {t('learn.noLessons')}
          </div>
        )}
      </div>
    </div>
  );
}

function LearningStat({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string | number;
  label: string;
}) {
  return (
    <div className="app-metric-tile">
      <div className="mb-2 text-emerald-500">{icon}</div>
      <p className="app-metric-value">{value}</p>
      <p className="app-metric-label">{label}</p>
    </div>
  );
}
