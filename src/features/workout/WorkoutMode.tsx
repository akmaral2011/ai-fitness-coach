import { type ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router';

import ChevronLeftIcon from '@/components/icons/ChevronLeftIcon';
import { getExercise } from '@/features/exercises/data';
import { useProgressStore } from '@/features/progress/progressStore';
import { drawSkeleton } from '@/features/workout/skeleton';
import { usePoseLandmarker } from '@/features/workout/usePoseLandmarker';
import { useSound } from '@/features/workout/useSound';
import { useWorkoutEngine } from '@/features/workout/useWorkoutEngine';
import { useWorkoutStore } from '@/features/workout/workoutStore';

// ─── types ────────────────────────────────────────────────────────────────────

type Stage =
  | 'intro'
  | 'loading'
  | 'error'
  | 'ready'
  | 'countdown'
  | 'active'
  | 'paused'
  | 'rest'
  | 'summary';

type SetResult = {
  repCount: number;
  averageScore: number;
  durationSeconds: number;
  holdSeconds?: number;
};

// ─── constants ────────────────────────────────────────────────────────────────

const REST_DURATION = 30;
const HOLD_DURATION = 30;

// ─── helpers ──────────────────────────────────────────────────────────────────

function getGrade(score: number) {
  if (score >= 90) return { label: 'A+', color: 'text-emerald-400' };
  if (score >= 80) return { label: 'A', color: 'text-emerald-400' };
  if (score >= 70) return { label: 'B', color: 'text-yellow-400' };
  if (score >= 60) return { label: 'C', color: 'text-orange-400' };
  return { label: 'D', color: 'text-red-400' };
}

function getMessage(score: number, t: (k: string) => string) {
  if (score >= 90) return t('workout.summary.message.excellent');
  if (score >= 70) return t('workout.summary.message.good');
  if (score >= 50) return t('workout.summary.message.ok');
  return t('workout.summary.message.needsWork');
}

function fmtTime(s: number) {
  const m = Math.floor(s / 60);
  const r = s % 60;
  return m > 0 ? `${m}m ${r}s` : `${s}s`;
}

// ─── Ring ─────────────────────────────────────────────────────────────────────

function Ring({
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
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - Math.min(1, Math.max(0, progress)));
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="absolute inset-0 -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.35s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">{children}</div>
    </div>
  );
}

// ─── PhaseBar ─────────────────────────────────────────────────────────────────

function PhaseBar({ phase, isStatic }: { phase: string; isStatic: boolean }) {
  if (isStatic) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-sky-500/20 border border-sky-500/30">
        <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
        <span className="text-sky-300 text-xs font-bold tracking-widest">HOLD</span>
      </div>
    );
  }
  const up = phase === 'up';
  return (
    <div
      className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${up ? 'bg-emerald-500/20 border-emerald-500/30' : 'bg-blue-500/20 border-blue-500/30'}`}
    >
      <span className="text-base leading-none">{up ? '↑' : '↓'}</span>
      <span
        className={`text-xs font-bold tracking-widest ${up ? 'text-emerald-300' : 'text-blue-300'}`}
      >
        {up ? 'UP' : 'DOWN'}
      </span>
    </div>
  );
}

// ─── CountdownOverlay ─────────────────────────────────────────────────────────

function CountdownOverlay({ value }: { value: number }) {
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

// ─── RestOverlay ──────────────────────────────────────────────────────────────

function RestOverlay({
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
  t: (k: string, o?: Record<string, string | number>) => string;
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

// ─── FeedbackPanel ────────────────────────────────────────────────────────────

function FeedbackPanel({
  items,
  t,
}: {
  items: { ruleId: string; feedbackKey: string; severity: string }[];
  t: (k: string) => string;
}) {
  if (items.length === 0) return null;
  return (
    <div className="absolute left-3 right-3 flex flex-col gap-2" style={{ bottom: '6.5rem' }}>
      {items.slice(-2).map(fb => (
        <div
          key={fb.ruleId}
          className={`flex items-start gap-3 px-4 py-3 rounded-2xl backdrop-blur-sm border ${
            fb.severity === 'error'
              ? 'bg-red-500/80 border-red-400/30 text-white'
              : 'bg-amber-500/80 border-amber-400/30 text-zinc-900'
          }`}
          style={{ animation: 'slideUp 0.18s ease-out' }}
        >
          <span className="text-lg leading-none mt-0.5">
            {fb.severity === 'error' ? '⚠️' : '💡'}
          </span>
          <span className="text-sm font-semibold leading-snug">{t(fb.feedbackKey)}</span>
        </div>
      ))}
    </div>
  );
}

// ─── GoodForm ─────────────────────────────────────────────────────────────────

function GoodFormBadge({ t }: { t: (k: string) => string }) {
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

// ─── WorkoutSummary ───────────────────────────────────────────────────────────

function WorkoutSummary({
  sets,
  exercise,
  t,
  onBack,
  onRetry,
}: {
  sets: SetResult[];
  exercise: { thumbnailEmoji: string; nameKey: string; sets: number };
  t: (k: string, o?: Record<string, string | number>) => string;
  onBack: () => void;
  onRetry: () => void;
}) {
  const totalReps = sets.reduce((a, s) => a + s.repCount, 0);
  const totalSecs = sets.reduce((a, s) => a + s.durationSeconds, 0);
  const avgScore = Math.round(
    sets.reduce((a, s) => a + s.averageScore, 0) / Math.max(1, sets.length)
  );
  const grade = getGrade(avgScore);
  const message = getMessage(avgScore, t);
  const scoreColor =
    avgScore >= 80 ? 'bg-emerald-500' : avgScore >= 60 ? 'bg-yellow-500' : 'bg-red-500';
  const scoreText =
    avgScore >= 80 ? 'text-emerald-500' : avgScore >= 60 ? 'text-yellow-500' : 'text-red-500';

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* hero */}
      <div className="pt-14 pb-8 px-6 text-center bg-linear-to-b from-emerald-500/10 to-transparent">
        <p className="text-6xl mb-3">{exercise.thumbnailEmoji}</p>
        <h1 className="text-2xl font-black">{t('workout.summary.title')}</h1>
        <p className="text-muted-foreground text-sm mt-1">{t(exercise.nameKey)}</p>
      </div>

      <div className="px-5 pb-10 flex-1 overflow-y-auto flex flex-col gap-4 max-w-lg mx-auto w-full">
        {/* grade card */}
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
                style={{ width: `${avgScore}%`, transition: 'width 1s ease-out' }}
              />
            </div>
            <p className={`text-sm font-bold mt-1.5 ${scoreText}`}>
              {avgScore}% {t('workout.summary.formScore')}
            </p>
          </div>
        </div>

        {/* stats row */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: totalReps, label: t('workout.summary.totalReps') },
            { value: sets.length, label: t('workout.summary.setsCompleted') },
            { value: fmtTime(totalSecs), label: t('workout.summary.duration') },
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

        {/* per-set breakdown */}
        {sets.length > 1 && (
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <p className="px-4 py-3 text-sm font-semibold text-foreground border-b border-border">
              {t('workout.summary.setBreakdown')}
            </p>
            {sets.map((s, i) => {
              const sc =
                s.averageScore >= 80
                  ? 'text-emerald-500'
                  : s.averageScore >= 60
                    ? 'text-yellow-500'
                    : 'text-red-500';
              return (
                <div
                  key={i}
                  className="flex items-center justify-between px-4 py-3 border-b border-border last:border-0"
                >
                  <span className="text-sm text-muted-foreground">
                    {t('workout.setOf', { current: i + 1, total: sets.length })}
                  </span>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-foreground">{s.repCount} reps</span>
                    <span className={`text-sm font-bold ${sc}`}>{s.averageScore}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* actions */}
        <div className="flex flex-col gap-3 mt-1">
          <button
            onClick={onBack}
            className="w-full py-4 bg-emerald-500 text-white font-bold text-base rounded-2xl hover:bg-emerald-600 active:scale-[0.98] transition-all"
          >
            {t('workout.summary.save')}
          </button>
          <button
            onClick={onRetry}
            className="w-full py-4 border border-border text-foreground rounded-2xl font-semibold hover:bg-muted active:scale-[0.98] transition-all"
          >
            {t('workout.summary.tryAgain')}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── WorkoutMode ──────────────────────────────────────────────────────────────

export default function WorkoutMode() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const exercise = id ? getExercise(id) : null;

  // store
  const {
    repCount,
    targetReps,
    techniqueScore,
    feedback,
    isRunning,
    phase,
    initializeWorkout,
    startWorkout,
    pauseWorkout,
    finishWorkout,
    resetForNewSet,
    resetWorkout,
    buildCompletedSession,
  } = useWorkoutStore();
  const { addSession } = useProgressStore();
  const { processFrame } = useWorkoutEngine(exercise ?? null);

  // local state
  const [stage, setStage] = useState<Stage>('intro');
  const [cameraStarted, setCameraStarted] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [currentSet, setCurrentSet] = useState(0); // 0-based
  const [restSecs, setRestSecs] = useState(REST_DURATION);
  const [setResults, setSetResults] = useState<SetResult[]>([]);
  const [holdSecs, setHoldSecs] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const sound = useSound(soundEnabled);

  // stable refs to avoid stale closures in effects
  const stageRef = useRef<Stage>('intro');
  const currentSetRef = useRef(0);
  const setResultsRef = useRef<SetResult[]>([]);
  const prevRepCount = useRef(0);
  const lastErrorSound = useRef(0);
  const setCompletingRef = useRef(false);

  useEffect(() => {
    stageRef.current = stage;
  }, [stage]);
  useEffect(() => {
    currentSetRef.current = currentSet;
  }, [currentSet]);
  useEffect(() => {
    setResultsRef.current = setResults;
  }, [setResults]);

  const totalSets = exercise?.sets ?? 1;
  const isStatic = exercise ? exercise.rules.some(r => r.phase === 'hold') : false;

  // camera
  const {
    landmarks,
    isReady,
    error: cameraError,
    videoRef,
    canvasRef,
    startCamera,
    stopCamera,
  } = usePoseLandmarker(cameraStarted);

  // ── init / cleanup ──
  useEffect(() => {
    if (!exercise) return;
    initializeWorkout(exercise.id, exercise.reps);
    return () => {
      stopCamera();
      resetWorkout();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exercise?.id]);

  // ── camera ready → stage ──
  useEffect(() => {
    if (!cameraStarted) return;
    if (cameraError) {
      setStage('error');
      return;
    }
    if (isReady && landmarks && stageRef.current === 'loading') setStage('ready');
  }, [isReady, landmarks, cameraError, cameraStarted]);

  // ── frame processing ──
  useEffect(() => {
    if (landmarks && isRunning && stage === 'active') processFrame(landmarks);
  }, [landmarks, isRunning, stage, processFrame]);

  // ── skeleton drawing ──
  useEffect(() => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video || !landmarks) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    drawSkeleton(ctx, landmarks, canvas.width, canvas.height);
  }, [landmarks, canvasRef, videoRef]);

  // ── countdown ──
  useEffect(() => {
    if (stage !== 'countdown') return;
    let n = 3;
    setCountdown(3);
    sound.tick();
    const id = setInterval(() => {
      n -= 1;
      if (n > 0) {
        setCountdown(n);
        sound.tick();
      } else {
        clearInterval(id);
        setCountdown(0);
        sound.go();
        setTimeout(() => {
          startWorkout();
          setStage('active');
        }, 400);
      }
    }, 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage]);

  // ── hold timer (static exercises) ──
  useEffect(() => {
    if (stage !== 'active' || !isStatic) return;
    setHoldSecs(0);
    setCompletingRef.current = false;
    const id = setInterval(() => {
      setHoldSecs(s => {
        const next = s + 1;
        if (next >= HOLD_DURATION && !setCompletingRef.current) {
          clearInterval(id);
          handleSetComplete();
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage, isStatic]);

  // ── rep complete (dynamic exercises) ──
  useEffect(() => {
    if (stage !== 'active' || isStatic) return;
    if (repCount > prevRepCount.current) {
      sound.rep();
      prevRepCount.current = repCount;
      if (targetReps > 0 && repCount >= targetReps && !setCompletingRef.current) {
        handleSetComplete();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [repCount, stage, isStatic, targetReps]);

  // ── error sound (throttled 2 s) ──
  useEffect(() => {
    if (stage !== 'active') return;
    if (feedback.some(f => f.severity === 'error') && Date.now() - lastErrorSound.current > 2000) {
      sound.error();
      lastErrorSound.current = Date.now();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [feedback, stage]);

  // ── rest timer ──
  useEffect(() => {
    if (stage !== 'rest') return;
    setRestSecs(REST_DURATION);
    let s = REST_DURATION;
    const id = setInterval(() => {
      s -= 1;
      setRestSecs(s);
      if (s <= 0) {
        clearInterval(id);
        startNextSet();
      }
    }, 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage]);

  // ── handlers ──

  const handleSetComplete = useCallback(() => {
    if (setCompletingRef.current) return;
    setCompletingRef.current = true;

    finishWorkout();
    const session = buildCompletedSession();
    const result: SetResult = {
      repCount: session?.repCount ?? repCount,
      averageScore: session?.averageScore ?? techniqueScore,
      durationSeconds: session?.durationSeconds ?? 0,
      holdSeconds: isStatic ? holdSecs : undefined,
    };
    sound.setDone();

    const allSets = [...setResultsRef.current, result];
    setSetResults(allSets);

    const nextSet = currentSetRef.current + 1;
    if (nextSet >= totalSets) {
      // save aggregate session
      if (session) {
        addSession({
          ...session,
          repCount: allSets.reduce((a, s) => a + s.repCount, 0),
          averageScore: Math.round(
            allSets.reduce((a, s) => a + s.averageScore, 0) / allSets.length
          ),
          durationSeconds: allSets.reduce((a, s) => a + s.durationSeconds, 0),
        });
      }
      stopCamera();
      setStage('summary');
    } else {
      setCurrentSet(nextSet);
      setStage('rest');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    finishWorkout,
    buildCompletedSession,
    repCount,
    techniqueScore,
    isStatic,
    holdSecs,
    totalSets,
  ]);

  function startNextSet() {
    sound.restEnd();
    resetForNewSet();
    setHoldSecs(0);
    prevRepCount.current = 0;
    setCompletingRef.current = false;
    setStage('countdown');
  }

  function handleFinishEarly() {
    if (setCompletingRef.current) return;
    setCompletingRef.current = true;
    finishWorkout();
    const session = buildCompletedSession();
    const result: SetResult = {
      repCount: session?.repCount ?? repCount,
      averageScore: session?.averageScore ?? techniqueScore,
      durationSeconds: session?.durationSeconds ?? 0,
    };
    const allSets = [...setResultsRef.current, result];
    if (session && allSets.length > 0) {
      addSession({
        ...session,
        repCount: allSets.reduce((a, s) => a + s.repCount, 0),
        averageScore: Math.round(allSets.reduce((a, s) => a + s.averageScore, 0) / allSets.length),
        durationSeconds: allSets.reduce((a, s) => a + s.durationSeconds, 0),
      });
    }
    setSetResults(allSets);
    stopCamera();
    setStage('summary');
  }

  function handleRetry() {
    setStage('intro');
    setCameraStarted(false);
    setCurrentSet(0);
    setSetResults([]);
    setHoldSecs(0);
    prevRepCount.current = 0;
    setCompletingRef.current = false;
    resetWorkout();
    if (exercise) initializeWorkout(exercise.id, exercise.reps);
  }

  // ── guards ──
  if (!exercise) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <p className="text-muted-foreground">{t('catalog.noResults')}</p>
      </div>
    );
  }

  if (stage === 'summary') {
    return (
      <WorkoutSummary
        sets={setResults}
        exercise={exercise}
        t={t}
        onBack={() => navigate('/app/catalog')}
        onRetry={handleRetry}
      />
    );
  }

  // ── camera UI ──
  const showFeedback = stage === 'active' && feedback.length > 0;
  const showGoodForm = stage === 'active' && isRunning && feedback.length === 0;
  const scoreColor =
    techniqueScore >= 80 ? 'bg-emerald-500' : techniqueScore >= 60 ? 'bg-yellow-500' : 'bg-red-500';
  const ringColor = feedback.some(f => f.severity === 'error') ? '#ef4444' : '#10b981';

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col">
      <style>{`
        @keyframes countPop {
          0%   { transform: scale(1.5); opacity: 0.4; }
          100% { transform: scale(1);   opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(10px); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
      `}</style>

      <div className="relative flex-1">
        {/* camera */}
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover"
          playsInline
          muted
        />
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full object-cover" />

        {/* ── top bar ── */}
        <div className="absolute top-0 left-0 right-0 px-4 pt-4 pb-12 bg-linear-to-b from-black/70 to-transparent z-10 flex items-center justify-between">
          <button
            onClick={() => {
              stopCamera();
              navigate(-1);
            }}
            className="p-2 rounded-full bg-black/40 backdrop-blur-sm hover:bg-black/60 transition-colors"
          >
            <ChevronLeftIcon size={20} />
          </button>

          {(stage === 'active' || stage === 'paused') && (
            <div className="flex items-center gap-2">
              <div className="bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm font-bold">
                {t('workout.setOf', { current: currentSet + 1, total: totalSets })}
              </div>
              <div className={`px-3 py-1.5 rounded-full text-sm font-black ${scoreColor}`}>
                {techniqueScore}%
              </div>
            </div>
          )}

          <button
            onClick={() => setSoundEnabled(e => !e)}
            className="p-2 rounded-full bg-black/40 backdrop-blur-sm hover:bg-black/60 transition-colors text-lg leading-none"
          >
            {soundEnabled ? '🔊' : '🔇'}
          </button>
        </div>

        {/* ── intro ── */}
        {stage === 'intro' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-7 bg-zinc-950">
            <p className="text-7xl">{exercise.thumbnailEmoji}</p>
            <div className="text-center">
              <h2 className="text-2xl font-black mb-1">{t(exercise.nameKey)}</h2>
              <p className="text-zinc-400 text-base">
                {totalSets} {t('workout.sets')} × {exercise.reps} {t('catalog.detail.reps')}
              </p>
              {isStatic && (
                <p className="text-zinc-500 text-sm mt-1.5">
                  {t('workout.holdExercise', { s: HOLD_DURATION })}
                </p>
              )}
            </div>
            <button
              onClick={async () => {
                setCameraStarted(true);
                setStage('loading');
                await startCamera();
              }}
              className="px-10 py-4 bg-emerald-500 text-white font-black text-lg rounded-2xl hover:bg-emerald-600 active:scale-95 transition-all shadow-lg shadow-emerald-500/30"
            >
              {t('workout.enableCamera')}
            </button>
          </div>
        )}

        {/* ── loading ── */}
        {stage === 'loading' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-zinc-950/90 z-10">
            <div className="w-12 h-12 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-zinc-300">{t('workout.calibrating')}</p>
            <p className="text-zinc-500 text-sm">{t('workout.positionYourself')}</p>
          </div>
        )}

        {/* ── camera error ── */}
        {stage === 'error' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 bg-zinc-950 z-10">
            <p className="text-5xl">📷</p>
            <p className="text-red-400 text-center px-6 font-medium">
              {t('workout.permissionDenied')}
            </p>
            <button
              onClick={async () => {
                setCameraStarted(true);
                setStage('loading');
                await startCamera();
              }}
              className="px-6 py-3 bg-emerald-500 text-white rounded-xl font-semibold"
            >
              {t('workout.grantCamera')}
            </button>
          </div>
        )}

        {/* ── ready ── */}
        {stage === 'ready' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 z-10">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/20 border border-emerald-500/40 backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-emerald-300 text-sm font-semibold">
                {t('workout.poseDetected')}
              </span>
            </div>
            <p className="text-zinc-400 text-sm">{t('workout.getInPosition')}</p>
            <button
              onClick={() => setStage('countdown')}
              className="px-14 py-4 bg-emerald-500 text-white font-black text-xl rounded-2xl hover:bg-emerald-600 active:scale-95 transition-all shadow-xl shadow-emerald-500/30"
            >
              {t('common.start')}
            </button>
          </div>
        )}

        {/* ── countdown ── */}
        {stage === 'countdown' && <CountdownOverlay value={countdown} />}

        {/* ── rest ── */}
        {stage === 'rest' && (
          <RestOverlay
            seconds={restSecs}
            total={REST_DURATION}
            nextSet={currentSet + 1}
            totalSets={totalSets}
            onSkip={startNextSet}
            t={t}
          />
        )}

        {/* ── active / paused HUD ── */}
        {(stage === 'active' || stage === 'paused') && (
          <>
            {/* centre ring */}
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 pointer-events-none">
              {isStatic ? (
                <Ring progress={holdSecs / HOLD_DURATION} size={160} stroke={10} color={ringColor}>
                  <div className="text-center">
                    <p className="text-5xl font-black text-white">{holdSecs}</p>
                    <p className="text-xs text-zinc-400 mt-0.5">/ {HOLD_DURATION}s</p>
                  </div>
                </Ring>
              ) : (
                <Ring
                  progress={targetReps > 0 ? repCount / targetReps : 0}
                  size={160}
                  stroke={10}
                  color="#10b981"
                >
                  <div className="text-center">
                    <p className="text-6xl font-black text-white">{repCount}</p>
                    <p className="text-xs text-zinc-400 mt-0.5">/ {targetReps}</p>
                  </div>
                </Ring>
              )}

              {stage === 'active' && <PhaseBar phase={phase} isStatic={isStatic} />}
            </div>

            {/* feedback / good-form */}
            {showFeedback && <FeedbackPanel items={feedback} t={t} />}
            {showGoodForm && <GoodFormBadge t={t} />}

            {/* bottom controls */}
            <div className="absolute bottom-5 left-4 right-4 flex gap-3">
              {stage === 'active' ? (
                <>
                  <button
                    onClick={() => {
                      pauseWorkout();
                      setStage('paused');
                    }}
                    className="flex-1 py-4 bg-black/50 backdrop-blur-sm text-white rounded-2xl font-semibold border border-white/20 hover:bg-white/10 active:scale-[0.97] transition-all"
                  >
                    {t('common.pause')}
                  </button>
                  <button
                    onClick={handleFinishEarly}
                    className="flex-1 py-4 bg-emerald-500 text-white rounded-2xl font-bold hover:bg-emerald-600 active:scale-[0.97] transition-all"
                  >
                    {t('common.finish')}
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      startWorkout();
                      setStage('active');
                    }}
                    className="flex-1 py-4 bg-emerald-500 text-white rounded-2xl font-bold hover:bg-emerald-600 active:scale-[0.97] transition-all"
                  >
                    {t('common.resume')}
                  </button>
                  <button
                    onClick={handleFinishEarly}
                    className="py-4 px-5 bg-black/50 backdrop-blur-sm text-white rounded-2xl font-semibold border border-white/20 hover:bg-white/10 active:scale-[0.97] transition-all"
                  >
                    {t('common.finish')}
                  </button>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
