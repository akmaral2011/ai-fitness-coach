import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router';

import { Activity, AlertTriangle, Brain, CheckCircle2, Clock3, Dumbbell, Play } from 'lucide-react';

import ChevronDownIcon from '@/components/icons/ChevronDownIcon';
import ChevronLeftIcon from '@/components/icons/ChevronLeftIcon';
import ExerciseAnimation from '@/features/exercises/ExerciseAnimation';
import { getExercise } from '@/features/exercises/data';
import { DIFFICULTY_COLOR } from '@/features/exercises/types';
import type { Exercise } from '@/features/exercises/types';
import { useExerciseRules } from '@/features/exercises/useExerciseRules';

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

function AngleRulesPanel({
  exercise,
  usingRemoteRules,
}: {
  exercise: Exercise;
  usingRemoteRules: boolean;
}) {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();

  return (
    <div className="app-card mb-5 overflow-hidden rounded-xl">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center justify-between w-full p-4 text-left"
      >
        <span className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-500">
            <Brain size={20} />
          </span>
          <span>
            <span className="block text-sm font-bold text-foreground">
              {t('catalog.detail.aiRules')}
            </span>
            <span className="block text-xs text-muted-foreground">
              {exercise.rules.length} {t('catalog.detail.rules')} ·{' '}
              {usingRemoteRules ? t('catalog.detail.backendRules') : t('catalog.detail.localRules')}
            </span>
          </span>
        </span>
        <ChevronDownIcon
          size={16}
          className={`text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="flex flex-col gap-2 border-t border-border p-3">
          {exercise.rules.map(rule => {
            const a = LANDMARK_NAMES[rule.landmarks.a] ?? `#${rule.landmarks.a}`;
            const v = LANDMARK_NAMES[rule.landmarks.vertex] ?? `#${rule.landmarks.vertex}`;
            const b = LANDMARK_NAMES[rule.landmarks.b] ?? `#${rule.landmarks.b}`;
            return (
              <div key={rule.id} className="rounded-lg bg-muted/60 p-3">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <span className="text-xs font-mono text-muted-foreground">{rule.id}</span>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`rounded px-1.5 py-0.5 text-xs font-medium ${
                        rule.severity === 'error'
                          ? 'bg-red-500/15 text-red-500'
                          : 'bg-yellow-500/15 text-yellow-500'
                      }`}
                    >
                      {t(`catalog.detail.${rule.severity}`)}
                    </span>
                    <span className="rounded bg-background px-1.5 py-0.5 text-xs text-muted-foreground">
                      {rule.phase}
                    </span>
                  </div>
                </div>
                <div className="grid gap-2 text-xs">
                  <p className="text-foreground">
                    <span className="text-muted-foreground">{t('catalog.detail.landmarks')}: </span>
                    <span className="text-emerald-500">{a}</span>
                    {' - '}
                    <span className="font-semibold text-blue-400">{v}</span>
                    {' - '}
                    <span className="text-emerald-500">{b}</span>
                  </p>
                  <p className="text-foreground">
                    <span className="text-muted-foreground">
                      {t('catalog.detail.validRange')}:{' '}
                    </span>
                    <span className="font-medium">
                      {rule.minAngle}° - {rule.maxAngle}°
                    </span>
                  </p>
                  <p className="text-muted-foreground">{rule.feedback ?? t(rule.feedbackKey)}</p>
                </div>
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
  const localExercise = id ? (getExercise(id) ?? null) : null;
  const { exercise, usingRemoteRules } = useExerciseRules(localExercise);

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
    <div className="min-h-screen bg-background text-foreground app-page-flow">
      <div className="relative overflow-hidden border-b border-border bg-card bg-[linear-gradient(135deg,rgba(16,185,129,0.12),rgba(59,130,246,0.08)_48%,rgba(139,92,246,0.08))]">
        <button
          onClick={() => navigate(-1)}
          className="absolute left-4 top-4 z-10 rounded-full bg-background/80 p-2 text-foreground backdrop-blur"
        >
          <ChevronLeftIcon />
        </button>

        <div className="relative mx-auto max-w-lg px-4 pb-5 pt-16">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-background text-4xl shadow-sm">
                {exercise.thumbnailEmoji}
              </span>
              <div>
                <h1 className="text-2xl font-black text-foreground">{t(exercise.nameKey)}</h1>
                <span className="text-xs text-muted-foreground">
                  {t(`catalog.categories.${exercise.category}`)}
                </span>
              </div>
            </div>
            <span
              className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${DIFFICULTY_COLOR[exercise.difficulty]}`}
            >
              {t(`catalog.difficulty.${exercise.difficulty}`)}
            </span>
          </div>

          <p className="mb-4 text-sm leading-6 text-muted-foreground">
            {t(exercise.descriptionKey)}
          </p>

          <div className="grid grid-cols-3 gap-2">
            <Metric
              icon={<Dumbbell size={16} />}
              value={exercise.sets}
              label={t('catalog.detail.sets')}
            />
            <Metric
              icon={<Activity size={16} />}
              value={exercise.reps === 1 ? t('catalog.detail.hold') : exercise.reps}
              label={t('catalog.detail.reps')}
            />
            <Metric
              icon={<Clock3 size={16} />}
              value={`${exercise.estimatedDuration}${t('common.min')}`}
              label={t('catalog.detail.estimatedTime')}
            />
          </div>
        </div>
      </div>

      <div className="px-4 py-5 max-w-lg mx-auto">
        <div className="app-card mb-5 overflow-hidden rounded-xl">
          <ExerciseAnimation exerciseId={exercise.id} />
        </div>

        <div className="mb-5 grid grid-cols-2 gap-3">
          <InfoTile
            icon={<Brain size={18} />}
            title={t('catalog.detail.formCoach')}
            value={`${exercise.rules.length} ${t('catalog.detail.rules')}`}
          />
          <InfoTile
            icon={<CheckCircle2 size={18} />}
            title={t('catalog.detail.ruleSource')}
            value={
              usingRemoteRules ? t('catalog.detail.backendRules') : t('catalog.detail.localRules')
            }
          />
        </div>

        <Section title={t('catalog.detail.trainingPlan')}>
          <div className="grid gap-2">
            <PlanRow
              label={t('catalog.detail.category')}
              value={t(`catalog.categories.${exercise.category}`)}
            />
            <PlanRow
              label={t('catalog.detail.difficulty')}
              value={t(`catalog.difficulty.${exercise.difficulty}`)}
            />
            <PlanRow
              label={t('catalog.detail.volume')}
              value={`${exercise.sets} × ${
                exercise.reps === 1 ? t('catalog.detail.hold') : exercise.reps
              }`}
            />
          </div>
        </Section>

        <Section title={t('catalog.detail.primaryMuscles')}>
          <div className="flex flex-wrap gap-2">
            {exercise.primaryMuscles.map(m => (
              <span
                key={m}
                className="rounded-full bg-emerald-500/15 px-3 py-1 text-sm font-medium text-emerald-500"
              >
                {t(`catalog.muscles.${m}`)}
              </span>
            ))}
          </div>
        </Section>

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

        {exercise.secondaryMuscles.length > 0 && (
          <Section title={t('catalog.detail.secondaryMuscles')}>
            <div className="flex flex-wrap gap-2">
              {exercise.secondaryMuscles.map(m => (
                <span
                  key={m}
                  className="rounded-full bg-muted px-3 py-1 text-sm text-muted-foreground"
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
                <li
                  key={key}
                  className="flex items-start gap-2.5 rounded-lg bg-red-500/5 p-3 text-sm text-foreground"
                >
                  <AlertTriangle size={16} className="mt-0.5 shrink-0 text-red-500" />
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
                    className={`mt-0.5 shrink-0 font-semibold ${i === 0 ? 'text-emerald-500' : 'text-yellow-500'}`}
                  >
                    {i === 0 ? t('catalog.detail.easier') : t('catalog.detail.harder')}
                  </span>
                  {t(key)}
                </li>
              ))}
            </ul>
          </Section>
        )}

        {/* angle rules (collapsible) */}
        <AngleRulesPanel exercise={exercise} usingRemoteRules={usingRemoteRules} />

        <div className="h-28" />
      </div>

      {/* sticky CTA */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/90 backdrop-blur border-t border-border">
        <button
          onClick={() => navigate(`/app/workout/${exercise.id}`)}
          className="app-primary-action mx-auto flex w-full max-w-lg items-center justify-center gap-2 py-4 text-lg font-bold"
        >
          <Play size={20} fill="currentColor" />
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

function Metric({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string | number;
  label: string;
}) {
  return (
    <div className="app-metric-tile flex min-h-20 flex-col justify-between">
      <span className="text-emerald-500">{icon}</span>
      <span className="text-lg font-black text-foreground">{value}</span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}

function InfoTile({ icon, title, value }: { icon: React.ReactNode; title: string; value: string }) {
  return (
    <div className="app-card app-card-hover rounded-xl p-3">
      <div className="mb-2 flex items-center gap-2 text-emerald-500">
        {icon}
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </span>
      </div>
      <p className="text-sm font-bold text-foreground">{value}</p>
    </div>
  );
}

function PlanRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-muted/70 px-3 py-2 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold text-foreground">{value}</span>
    </div>
  );
}
