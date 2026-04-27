import { type ReactNode, useEffect } from 'react';

import confetti from 'canvas-confetti';

import {
  type SetResult,
  fmtTime,
  getGrade,
  getMessage,
} from '@/features/workout/workoutModeHelpers';

type TranslationFn = (key: string, opts?: Record<string, string | number>) => string;

type ExerciseSummary = {
  thumbnailEmoji: string;
  nameKey: string;
  sets: number;
};

export function IntroScreen({
  exercise,
  totalSets,
  isStatic,
  holdDuration,
  t,
  onStart,
}: {
  exercise: { thumbnailEmoji: string; nameKey: string; reps: number };
  totalSets: number;
  isStatic: boolean;
  holdDuration: number;
  t: TranslationFn;
  onStart: () => void;
}) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-7 bg-zinc-950">
      <p className="text-7xl">{exercise.thumbnailEmoji}</p>
      <div className="text-center">
        <h2 className="text-2xl font-black mb-1">{t(exercise.nameKey)}</h2>
        <p className="text-zinc-400 text-base">
          {totalSets} {t('workout.sets')} × {exercise.reps} {t('catalog.detail.reps')}
        </p>
        {isStatic && (
          <p className="text-zinc-500 text-sm mt-1.5">
            {t('workout.holdExercise', { s: holdDuration })}
          </p>
        )}
      </div>
      <button
        onClick={onStart}
        className="px-10 py-4 bg-emerald-500 text-white font-black text-lg rounded-2xl hover:bg-emerald-600 active:scale-95 transition-all shadow-lg shadow-emerald-500/30"
      >
        {t('workout.enableCamera')}
      </button>
    </div>
  );
}

export function LoadingScreen({ t }: { t: TranslationFn }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-zinc-950/90 z-10">
      <div className="w-12 h-12 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-zinc-300">{t('workout.calibrating')}</p>
      <p className="text-zinc-500 text-sm">{t('workout.positionYourself')}</p>
    </div>
  );
}

export function CameraErrorScreen({ t, onRetry }: { t: TranslationFn; onRetry: () => void }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 bg-zinc-950 z-10">
      <p className="text-5xl">📷</p>
      <p className="text-red-400 text-center px-6 font-medium">{t('workout.permissionDenied')}</p>
      <button
        onClick={onRetry}
        className="px-6 py-3 bg-emerald-500 text-white rounded-xl font-semibold"
      >
        {t('workout.grantCamera')}
      </button>
    </div>
  );
}

export function ReadyScreen({ t, onStart }: { t: TranslationFn; onStart: () => void }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 z-10">
      <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/20 border border-emerald-500/40 backdrop-blur-sm">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-emerald-300 text-sm font-semibold">{t('workout.poseDetected')}</span>
      </div>
      <p className="text-zinc-400 text-sm">{t('workout.getInPosition')}</p>
      <button
        onClick={onStart}
        className="px-14 py-4 bg-emerald-500 text-white font-black text-xl rounded-2xl hover:bg-emerald-600 active:scale-95 transition-all shadow-xl shadow-emerald-500/30"
      >
        {t('common.start')}
      </button>
    </div>
  );
}

export function Ring({
  progress,
  size = 148,
  stroke = 10,
  color = '#10b981',
  children,
}: {
  progress: number;
  size?: number;
  stroke?: number;
  color?: string;
  children?: ReactNode;
}) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - Math.min(1, Math.max(0, progress)));

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="absolute inset-0 -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.35s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">{children}</div>
    </div>
  );
}

export function PhaseBar({ phase, isStatic }: { phase: string; isStatic: boolean }) {
  if (isStatic) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-sky-500/20 border border-sky-500/30">
        <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
        <span className="text-sky-300 text-xs font-bold tracking-widest">HOLD</span>
      </div>
    );
  }

  const isUp = phase === 'up';
  return (
    <div
      className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${isUp ? 'bg-emerald-500/20 border-emerald-500/30' : 'bg-blue-500/20 border-blue-500/30'}`}
    >
      <span className="text-base leading-none">{isUp ? '↑' : '↓'}</span>
      <span
        className={`text-xs font-bold tracking-widest ${isUp ? 'text-emerald-300' : 'text-blue-300'}`}
      >
        {isUp ? 'UP' : 'DOWN'}
      </span>
    </div>
  );
}

export function CountdownOverlay({ value }: { value: number }) {
  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      {value > 0 ? (
        <div
          key={value}
          className="text-9xl font-black text-white drop-shadow-2xl"
          style={{ animation: 'countPop 1s cubic-bezier(0.25,0.46,0.45,0.94) forwards' }}
        >
          {value}
        </div>
      ) : (
        <div
          className="text-6xl font-black text-emerald-400 tracking-widest"
          style={{ animation: 'countPop 0.4s ease-out forwards' }}
        >
          GO!
        </div>
      )}
    </div>
  );
}

export function RestOverlay({
  seconds,
  total,
  nextSet,
  totalSets,
  onSkip,
  t,
}: {
  seconds: number;
  total: number;
  nextSet: number;
  totalSets: number;
  onSkip: () => void;
  t: TranslationFn;
}) {
  return (
    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-zinc-950/96">
      <p className="text-zinc-400 text-xs uppercase tracking-widest mb-5">{t('workout.rest')}</p>
      <Ring progress={seconds / total} size={160} stroke={10} color="#10b981">
        <div className="text-center">
          <p className="text-5xl font-black text-white">{seconds}</p>
          <p className="text-xs text-zinc-500 mt-0.5">sec</p>
        </div>
      </Ring>
      <p className="mt-6 text-zinc-300 text-sm font-medium">
        {t('workout.setOf', { current: nextSet, total: totalSets })} {t('workout.comingUp')}
      </p>
      <button
        onClick={onSkip}
        className="mt-5 px-6 py-2.5 rounded-xl border border-white/20 text-white text-sm font-semibold hover:bg-white/10 active:scale-95 transition-all"
      >
        {t('workout.skipRest')}
      </button>
    </div>
  );
}

export function FeedbackPanel({
  items,
  t,
}: {
  items: { ruleId: string; feedbackKey: string; severity: string }[];
  t: (key: string) => string;
}) {
  if (items.length === 0) return null;

  return (
    <div className="absolute left-3 right-3 flex flex-col gap-2" style={{ bottom: '6.5rem' }}>
      {items.slice(-2).map(item => (
        <div
          key={item.ruleId}
          className={`flex items-start gap-3 px-4 py-3 rounded-2xl backdrop-blur-sm border ${
            item.severity === 'error'
              ? 'bg-red-500/80 border-red-400/30 text-white'
              : 'bg-amber-500/80 border-amber-400/30 text-zinc-900'
          }`}
          style={{ animation: 'slideUp 0.18s ease-out' }}
        >
          <span className="text-lg leading-none mt-0.5">
            {item.severity === 'error' ? '⚠️' : '💡'}
          </span>
          <span className="text-sm font-semibold leading-snug">{t(item.feedbackKey)}</span>
        </div>
      ))}
    </div>
  );
}

export function GoodFormBadge({ t }: { t: (key: string) => string }) {
  return (
    <div
      className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/20 border border-emerald-500/40 backdrop-blur-sm"
      style={{ bottom: '6.5rem', animation: 'slideUp 0.18s ease-out' }}
    >
      <span className="text-emerald-400 font-bold">✓</span>
      <span className="text-emerald-300 text-sm font-semibold">{t('workout.great')}</span>
    </div>
  );
}

export function WorkoutSummary({
  sets,
  exercise,
  t,
  onBack,
  onRetry,
}: {
  sets: SetResult[];
  exercise: ExerciseSummary;
  t: TranslationFn;
  onBack: () => void;
  onRetry: () => void;
}) {
  const totalReps = sets.reduce((sum, setResult) => sum + setResult.repCount, 0);
  const totalSeconds = sets.reduce((sum, setResult) => sum + setResult.durationSeconds, 0);
  const averageScore = Math.round(
    sets.reduce((sum, setResult) => sum + setResult.averageScore, 0) / Math.max(1, sets.length)
  );

  useEffect(() => {
    if (averageScore < 50) return;

    const particleCount = averageScore >= 80 ? 120 : 50;
    confetti({
      particleCount,
      spread: 80,
      origin: { y: 0.55 },
      colors: ['#10b981', '#34d399', '#6ee7b7', '#ffffff'],
    });

    if (averageScore >= 90) {
      setTimeout(() => {
        confetti({
          particleCount: 60,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#10b981', '#fbbf24'],
        });
      }, 300);

      setTimeout(() => {
        confetti({
          particleCount: 60,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#10b981', '#fbbf24'],
        });
      }, 450);
    }
  }, [averageScore]);

  const grade = getGrade(averageScore);
  const message = getMessage(averageScore, t);
  const scoreColor =
    averageScore >= 80 ? 'bg-emerald-500' : averageScore >= 60 ? 'bg-yellow-500' : 'bg-red-500';
  const scoreText =
    averageScore >= 80
      ? 'text-emerald-500'
      : averageScore >= 60
        ? 'text-yellow-500'
        : 'text-red-500';

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <div className="pt-14 pb-8 px-6 text-center bg-linear-to-b from-emerald-500/10 to-transparent">
        <p className="text-6xl mb-3">{exercise.thumbnailEmoji}</p>
        <h1 className="text-2xl font-black">{t('workout.summary.title')}</h1>
        <p className="text-muted-foreground text-sm mt-1">{t(exercise.nameKey)}</p>
      </div>

      <div className="px-5 pb-10 flex-1 overflow-y-auto flex flex-col gap-4 max-w-lg mx-auto w-full">
        <div className="flex items-center gap-5 bg-card border border-border rounded-2xl p-5">
          <div className="text-center shrink-0">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
              {t('workout.summary.grade')}
            </p>
            <p className={`text-6xl font-black leading-none ${grade.color}`}>{grade.label}</p>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-foreground font-medium leading-snug mb-3">{message}</p>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${scoreColor}`}
                style={{ width: `${averageScore}%`, transition: 'width 1s ease-out' }}
              />
            </div>
            <p className={`text-sm font-bold mt-1.5 ${scoreText}`}>
              {averageScore}% {t('workout.summary.formScore')}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[
            { value: totalReps, label: t('workout.summary.totalReps') },
            { value: sets.length, label: t('workout.summary.setsCompleted') },
            { value: fmtTime(totalSeconds), label: t('workout.summary.duration') },
          ].map(({ value, label }) => (
            <div
              key={label}
              className="flex flex-col items-center p-4 bg-card border border-border rounded-2xl gap-1"
            >
              <span className="text-2xl font-bold text-foreground">{value}</span>
              <span className="text-xs text-muted-foreground text-center leading-tight">
                {label}
              </span>
            </div>
          ))}
        </div>

        {sets.length > 1 && (
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <p className="px-4 py-3 text-sm font-semibold text-foreground border-b border-border">
              {t('workout.summary.setBreakdown')}
            </p>
            {sets.map((setResult, index) => {
              const breakdownColor =
                setResult.averageScore >= 80
                  ? 'text-emerald-500'
                  : setResult.averageScore >= 60
                    ? 'text-yellow-500'
                    : 'text-red-500';

              return (
                <div
                  key={index}
                  className="flex items-center justify-between px-4 py-3 border-b border-border last:border-0"
                >
                  <span className="text-sm text-muted-foreground">
                    {t('workout.setOf', { current: index + 1, total: sets.length })}
                  </span>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-foreground">{setResult.repCount} reps</span>
                    <span className={`text-sm font-bold ${breakdownColor}`}>
                      {setResult.averageScore}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="flex flex-col gap-3 mt-1">
          <button
            onClick={onBack}
            className="w-full py-4 bg-emerald-500 text-white font-bold text-base rounded-2xl hover:bg-emerald-600 active:scale-[0.98] transition-all"
          >
            {t('workout.summary.save')}
          </button>
          <div className="flex gap-3">
            <button
              onClick={onRetry}
              className="flex-1 py-4 border border-border text-foreground rounded-2xl font-semibold hover:bg-muted active:scale-[0.98] transition-all text-sm"
            >
              {t('workout.summary.tryAgain')}
            </button>
            {'share' in navigator && (
              <button
                onClick={() =>
                  navigator
                    .share({
                      title: 'AI Fitness Coach',
                      text: t('workout.summary.shareText', {
                        name: t(exercise.nameKey),
                        score: averageScore,
                        reps: totalReps,
                      }),
                    })
                    .catch(() => {})
                }
                className="px-5 py-4 border border-border text-foreground rounded-2xl hover:bg-muted active:scale-[0.98] transition-all text-lg"
                aria-label="Share"
              >
                🔗
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
