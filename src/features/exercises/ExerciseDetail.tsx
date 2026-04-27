import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router';

import ChevronDownIcon from '@/components/icons/ChevronDownIcon';
import ChevronLeftIcon from '@/components/icons/ChevronLeftIcon';
import PlayIcon from '@/components/icons/PlayIcon';
import ExerciseAnimation from '@/features/exercises/ExerciseAnimation';
import { getExercise } from '@/features/exercises/data';
import { DIFFICULTY_COLOR } from '@/features/exercises/types';
import type { Exercise } from '@/features/exercises/types';

// ─── angle rules visualization ────────────────────────────────────────────────

const LANDMARK_NAMES: Record<number, string> = {
  11: 'L Shoulder',
  12: 'R Shoulder',
  13: 'L Elbow',
  14: 'R Elbow',
  15: 'L Wrist',
  16: 'R Wrist',
  23: 'L Hip',
  24: 'R Hip',
  25: 'L Knee',
  26: 'R Knee',
  27: 'L Ankle',
  28: 'R Ankle',
};

function AngleRulesPanel({ exercise }: { exercise: Exercise }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mb-5">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center justify-between w-full text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2"
      >
        <span>AI Angle Rules ({exercise.rules.length})</span>
        <ChevronDownIcon size={14} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="flex flex-col gap-2">
          {exercise.rules.map(rule => {
            const a = LANDMARK_NAMES[rule.landmarks.a] ?? `#${rule.landmarks.a}`;
            const v = LANDMARK_NAMES[rule.landmarks.vertex] ?? `#${rule.landmarks.vertex}`;
            const b = LANDMARK_NAMES[rule.landmarks.b] ?? `#${rule.landmarks.b}`;
            return (
              <div key={rule.id} className="p-3 bg-card border border-border rounded-xl">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-mono text-muted-foreground">{rule.id}</span>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                        rule.severity === 'error'
                          ? 'bg-red-500/15 text-red-500'
                          : 'bg-yellow-500/15 text-yellow-500'
                      }`}
                    >
                      {rule.severity}
                    </span>
                    <span className="text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded">
                      {rule.phase}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-foreground mb-1">
                  <span className="text-emerald-500">{a}</span>
                  {' — '}
                  <span className="text-blue-400 font-semibold">{v}</span>
                  {' — '}
                  <span className="text-emerald-500">{b}</span>
                </p>
                <p className="text-xs text-muted-foreground">
                  Valid range:{' '}
                  <span className="text-foreground font-medium">
                    {rule.minAngle}° – {rule.maxAngle}°
                  </span>
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── main component ───────────────────────────────────────────────────────────

export default function ExerciseDetail() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const exercise = id ? getExercise(id) : null;

  if (!exercise) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background text-muted-foreground">
        <p className="text-5xl mb-4">🤷</p>
        <button onClick={() => navigate('/app/catalog')} className="text-emerald-500 font-medium">
          {t('catalog.title')}
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* header */}
      <div className="relative px-4 pt-12 pb-4 bg-card border-b border-border">
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 p-2 rounded-full bg-background/80 backdrop-blur text-foreground"
        >
          <ChevronLeftIcon />
        </button>

        <div className="flex items-start justify-between gap-2 max-w-lg mx-auto">
          <div className="flex items-center gap-3">
            <span className="text-4xl">{exercise.thumbnailEmoji}</span>
            <div>
              <h1 className="text-xl font-bold">{t(exercise.nameKey)}</h1>
              <span className="text-xs text-muted-foreground capitalize">
                {t(`catalog.categories.${exercise.category}`)}
              </span>
            </div>
          </div>
          <span
            className={`shrink-0 text-xs px-2.5 py-1 rounded-full font-medium mt-1 ${DIFFICULTY_COLOR[exercise.difficulty]}`}
          >
            {t(`catalog.difficulty.${exercise.difficulty}`)}
          </span>
        </div>
      </div>

      <div className="px-4 py-5 max-w-lg mx-auto">
        {/* animated demo */}
        <div className="mb-5">
          <ExerciseAnimation exerciseId={exercise.id} />
        </div>

        <p className="text-muted-foreground text-sm mb-5">{t(exercise.descriptionKey)}</p>

        {/* step-by-step instructions */}
        {(() => {
          const baseKey = exercise.nameKey.replace('.name', '');
          const steps = t(`${baseKey}.steps`, { returnObjects: true });
          if (!Array.isArray(steps) || steps.length === 0) return null;
          return (
            <Section title={t('catalog.detail.steps')}>
              <ol className="flex flex-col gap-2.5">
                {(steps as string[]).map((step, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-foreground">
                    <span className="shrink-0 w-6 h-6 rounded-full bg-emerald-500/15 text-emerald-500 flex items-center justify-center text-xs font-bold mt-0.5">
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            </Section>
          );
        })()}

        {/* stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <StatChip value={exercise.sets} label={t('catalog.detail.sets')} />
          <StatChip
            value={exercise.reps === 1 ? 'Hold' : exercise.reps}
            label={t('catalog.detail.reps')}
          />
          <StatChip value={`${exercise.estimatedDuration}${t('common.min')}`} label="Duration" />
        </div>

        {/* muscles */}
        <Section title={t('catalog.detail.primaryMuscles')}>
          <div className="flex flex-wrap gap-2">
            {exercise.primaryMuscles.map(m => (
              <span
                key={m}
                className="px-3 py-1 bg-emerald-500/15 text-emerald-500 rounded-full text-sm font-medium"
              >
                {t(`catalog.muscles.${m}`)}
              </span>
            ))}
          </div>
        </Section>

        {exercise.secondaryMuscles.length > 0 && (
          <Section title={t('catalog.detail.secondaryMuscles')}>
            <div className="flex flex-wrap gap-2">
              {exercise.secondaryMuscles.map(m => (
                <span
                  key={m}
                  className="px-3 py-1 bg-muted text-muted-foreground rounded-full text-sm"
                >
                  {t(`catalog.muscles.${m}`)}
                </span>
              ))}
            </div>
          </Section>
        )}

        {/* errors */}
        {exercise.commonErrorKeys.length > 0 && (
          <Section title={t('catalog.detail.commonErrors')}>
            <ul className="flex flex-col gap-2">
              {exercise.commonErrorKeys.map(key => (
                <li key={key} className="flex items-start gap-2.5 text-sm text-foreground">
                  <span className="text-red-500 mt-0.5 shrink-0">✕</span>
                  {t(key)}
                </li>
              ))}
            </ul>
          </Section>
        )}

        {/* modifications */}
        {exercise.modificationKeys.length > 0 && (
          <Section title={t('catalog.detail.modifications')}>
            <ul className="flex flex-col gap-2">
              {exercise.modificationKeys.map((key, i) => (
                <li key={key} className="flex items-start gap-2.5 text-sm text-foreground">
                  <span
                    className={`mt-0.5 shrink-0 ${i === 0 ? 'text-emerald-500' : 'text-yellow-500'}`}
                  >
                    {i === 0 ? '↓ Easier' : '↑ Harder'}
                  </span>
                  {t(key)}
                </li>
              ))}
            </ul>
          </Section>
        )}

        {/* angle rules (collapsible) */}
        <AngleRulesPanel exercise={exercise} />

        <div className="h-28" />
      </div>

      {/* sticky CTA */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/90 backdrop-blur border-t border-border">
        <button
          onClick={() => navigate(`/app/workout/${exercise.id}`)}
          className="w-full max-w-lg mx-auto flex items-center justify-center gap-2 py-4 bg-emerald-500 text-white font-bold text-lg rounded-2xl hover:bg-emerald-600 transition-colors"
        >
          <PlayIcon className="text-white" />
          {t('catalog.detail.startWorkout')}
        </button>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2.5">
        {title}
      </h2>
      {children}
    </div>
  );
}

function StatChip({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="flex flex-col items-center p-3 bg-card border border-border rounded-xl gap-1">
      <span className="text-lg font-bold text-foreground">{value}</span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}
