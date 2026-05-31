import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router';

import { ArrowRight, CheckCircle, Play } from 'lucide-react';

import ChevronLeftIcon from '@/components/icons/ChevronLeftIcon';
import { useAuthStore } from '@/features/auth/authStore';
import { EXERCISES } from '@/features/exercises/data';
import { categoryColor } from '@/features/learn/data';
import { useLearnStore } from '@/features/learn/learnStore';
import { useLessons } from '@/features/learn/useLessons';
import { apiRequest } from '@/lib/api';

export default function ArticleDetail() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { completedIds, markComplete } = useLearnStore();
  const token = useAuthStore(s => s.token);
  const { lessons } = useLessons();

  const lesson = id ? lessons.find(item => item.id === id) : undefined;

  if (!lesson) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <p className="text-muted-foreground">{t('learn.notFound')}</p>
      </div>
    );
  }

  const isComplete = completedIds.includes(lesson.id);
  const linkedExercise = lesson.linkedExerciseId
    ? EXERCISES.find(e => e.id === lesson.linkedExerciseId)
    : undefined;

  return (
    <div className="min-h-screen bg-background text-foreground pb-10 app-page-flow">
      <div className="sticky top-0 z-10 bg-background/90 backdrop-blur border-b border-border px-4 h-14 flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground"
          aria-label={t('learn.back')}
        >
          <ChevronLeftIcon />
        </button>
        <span className="app-card-title truncate flex-1">{t('learn.title')}</span>
        {isComplete && (
          <div className="app-chip-label flex items-center gap-1 text-emerald-500">
            <CheckCircle className="w-3.5 h-3.5" />
            {t('learn.completed')}
          </div>
        )}
      </div>

      <div className="px-4 max-w-lg mx-auto">
        {lesson.type === 'video' && (
          <div className="mt-5 mb-6">
            {lesson.videoId ? (
              <iframe
                src={`https://www.youtube.com/embed/${lesson.videoId}`}
                className="w-full aspect-video rounded-xl border border-border"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title={lesson.remoteTitle ?? t(lesson.titleKey)}
              />
            ) : (
              <div className="w-full aspect-video rounded-xl bg-muted border border-border flex flex-col items-center justify-center gap-3">
                <div className="w-14 h-14 rounded-full bg-foreground/5 flex items-center justify-center">
                  <Play className="w-6 h-6 text-muted-foreground ml-1" />
                </div>
                <p className="app-body-text">{t('learn.videoComingSoon')}</p>
              </div>
            )}
          </div>
        )}

        <div className={lesson.type === 'video' ? 'pb-6' : 'pt-7 pb-6'}>
          {lesson.type === 'article' && (
            <div className="text-5xl mb-5 leading-none">{lesson.emoji}</div>
          )}
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <span
              className={`app-chip-label capitalize px-2.5 py-1 rounded-full ${categoryColor(lesson.category)}`}
            >
              {t(`learn.categories.${lesson.category}`)}
            </span>
            {lesson.type === 'video' && (
              <span className="app-chip-label flex items-center gap-1 px-2 py-0.5 rounded-full bg-violet-500/15 text-violet-500">
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
          <h1 className="app-detail-title mb-5">{lesson.remoteTitle ?? t(lesson.titleKey)}</h1>
          <p className="app-body-text border-l-2 border-emerald-500/50 pl-4 mb-8 italic">
            {lesson.remoteSummary ?? t(lesson.summaryKey)}
          </p>
        </div>

        {((lesson.remoteKeyTakeaways?.length ?? 0) > 0 ||
          (lesson.keyTakeawayKeys?.length ?? 0) > 0) && (
          <div className="mb-8 p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl">
            <h2 className="app-section-title mb-3 text-emerald-500">{t('learn.keyTakeaways')}</h2>
            <ul className="flex flex-col gap-2.5">
              {(lesson.remoteKeyTakeaways ?? lesson.keyTakeawayKeys ?? []).map((item, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2.5 app-card-title font-medium text-foreground/85"
                >
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-500 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  {lesson.remoteKeyTakeaways ? item : t(item)}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex flex-col gap-6 pb-8">
          {(lesson.remoteBody ?? lesson.bodyKeys).map((item, i) => (
            <p key={i} className="app-body-text text-foreground/85">
              {lesson.remoteBody ? item : t(item)}
            </p>
          ))}
        </div>

        {linkedExercise && (
          <div className="mb-8">
            <p className="app-card-title mb-3">{t('learn.relatedExercise')}</p>
            <button
              onClick={() => navigate(`/app/exercise/${linkedExercise.id}`)}
              className="app-card app-card-hover group flex w-full items-center gap-4 p-4 text-left"
            >
              <span className="text-3xl leading-none shrink-0">
                {linkedExercise.thumbnailEmoji}
              </span>
              <div className="flex-1 min-w-0">
                <p className="app-card-title transition-colors group-hover:text-emerald-500">
                  {t(linkedExercise.nameKey)}
                </p>
                <p className="app-card-meta mt-0.5 line-clamp-1">
                  {t(linkedExercise.descriptionKey)}
                </p>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
            </button>
          </div>
        )}

        <div className="pb-8">
          <button
            onClick={() => {
              markComplete(lesson.id);
              if (token) {
                void apiRequest(`/api/lessons/${lesson.id}/complete`, {
                  method: 'POST',
                  token,
                }).catch(error => {
                  console.error('Failed to mark lesson complete', error);
                });
              }
            }}
            disabled={isComplete}
            className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl app-control-label transition-colors ${
              isComplete
                ? 'bg-emerald-500/15 text-emerald-500 cursor-default'
                : 'app-primary-action'
            }`}
          >
            <CheckCircle className="w-4 h-4" />
            {isComplete ? t('learn.completed') : t('learn.markComplete')}
          </button>
        </div>
      </div>
    </div>
  );
}
