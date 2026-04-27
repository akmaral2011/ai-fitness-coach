import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router';

import ChevronLeftIcon from '@/components/icons/ChevronLeftIcon';
import { getExercise } from '@/features/exercises/data';
import { recordWorkoutDone } from '@/features/notifications/useWorkoutReminder';
import { useProgressStore } from '@/features/progress/progressStore';
import { drawSkeleton } from '@/features/workout/skeleton';
import { usePoseLandmarker } from '@/features/workout/usePoseLandmarker';
import { useSound } from '@/features/workout/useSound';
import { useWorkoutEngine } from '@/features/workout/useWorkoutEngine';
import {
  HOLD_DURATION,
  REST_DURATION,
  type SetResult,
  type Stage,
} from '@/features/workout/workoutModeHelpers';
import {
  CameraErrorScreen,
  CountdownOverlay,
  FeedbackPanel,
  GoodFormBadge,
  IntroScreen,
  LoadingScreen,
  PhaseBar,
  ReadyScreen,
  RestOverlay,
  Ring,
  WorkoutSummary,
} from '@/features/workout/workoutModeSections';
import { useWorkoutStore } from '@/features/workout/workoutStore';

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
        recordWorkoutDone();
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
      recordWorkoutDone();
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
          <IntroScreen
            exercise={exercise}
            totalSets={totalSets}
            isStatic={isStatic}
            holdDuration={HOLD_DURATION}
            t={t}
            onStart={async () => {
              setCameraStarted(true);
              setStage('loading');
              await startCamera();
            }}
          />
        )}

        {/* ── loading ── */}
        {stage === 'loading' && <LoadingScreen t={t} />}

        {/* ── camera error ── */}
        {stage === 'error' && (
          <CameraErrorScreen
            t={t}
            onRetry={async () => {
              setCameraStarted(true);
              setStage('loading');
              await startCamera();
            }}
          />
        )}

        {/* ── ready ── */}
        {stage === 'ready' && <ReadyScreen t={t} onStart={() => setStage('countdown')} />}

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
