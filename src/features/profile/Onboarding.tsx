import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import { useThemeSync } from '@/components/ThemeToggle';
import {
  type CameraChecks,
  type FrameAnalysis,
  StepCamera,
  analyzeFrame,
  checksFromHistory,
  isVideoBlack,
} from '@/features/profile/onboardingCamera';
import { TOTAL_STEPS } from '@/features/profile/onboardingOptions';
import {
  StepActivity,
  StepAge,
  StepGender,
  StepGoal,
  StepInjuries,
  StepLevel,
  StepMeasurements,
} from '@/features/profile/onboardingSteps';
import { useProfileStore } from '@/features/profile/profileStore';
import type {
  ActivityLevel,
  FitnessGoal,
  FitnessLevel,
  Gender,
  InjuryType,
} from '@/features/profile/types';

// ─── main component ───────────────────────────────────────────────────────────

export default function Onboarding() {
  useThemeSync();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { saveDraft, completeOnboarding, onboardingDraft } = useProfileStore();

  const [step, setStep] = useState(1);

  // form state
  const [goal, setGoal] = useState<FitnessGoal | null>(onboardingDraft.goal ?? null);
  const [gender, setGender] = useState<Gender | null>(onboardingDraft.gender ?? null);
  const [height, setHeight] = useState(onboardingDraft.heightCm?.toString() ?? '');
  const [weight, setWeight] = useState(onboardingDraft.weightKg?.toString() ?? '');
  const [age, setAge] = useState(onboardingDraft.ageYears?.toString() ?? '');
  const [activityLevel, setActivityLevel] = useState<ActivityLevel | null>(
    onboardingDraft.activityLevel ?? null
  );
  const [fitnessLevel, setFitnessLevel] = useState<FitnessLevel | null>(
    onboardingDraft.fitnessLevel ?? null
  );
  const [injuries, setInjuries] = useState<InjuryType[]>(onboardingDraft.injuries ?? []);

  // camera state (step 8)
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState(false);
  const [cameraLoading, setCameraLoading] = useState(false);
  const [checks, setChecks] = useState<CameraChecks>({
    lighting: 'checking',
    position: 'checking',
    distance: 'checking',
  });
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const checkIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const analysisHistoryRef = useRef<FrameAnalysis[]>([]);

  // stop camera when leaving step 8
  useEffect(() => {
    if (step !== 8) {
      stopCamera();
    }
    return () => {
      if (step === 8) stopCamera();
    };
  }, [step]);

  function stopCamera() {
    if (checkIntervalRef.current) {
      clearInterval(checkIntervalRef.current);
      checkIntervalRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    const video = videoRef.current;
    if (video) video.srcObject = null;
    setCameraReady(false);
    setCameraLoading(false);
  }

  async function startCamera() {
    setCameraLoading(true);
    setCameraError(false);
    analysisHistoryRef.current = [];
    setChecks({ lighting: 'checking', position: 'checking', distance: 'checking' });
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      });
      streamRef.current = stream;
      const video = videoRef.current;
      if (!video) return;
      video.srcObject = stream;
      await video.play();
      setCameraLoading(false);
      setCameraReady(true);

      // Analyze every 700 ms; keep a rolling window of 5 frames for smoothing
      checkIntervalRef.current = setInterval(() => {
        const v = videoRef.current;
        if (!v || v.readyState < 2) return;
        if (isVideoBlack(v)) return;

        const frame = analyzeFrame(v);
        if (!frame) return;

        analysisHistoryRef.current = [...analysisHistoryRef.current.slice(-4), frame];
        setChecks(checksFromHistory(analysisHistoryRef.current));
      }, 700);
    } catch {
      setCameraError(true);
      setCameraLoading(false);
    }
  }

  const allChecksPass =
    checks.lighting === 'ok' && checks.position === 'ok' && checks.distance === 'ok';

  // ─── navigation ─────────────────────────────────────────────────────────────

  function handleNext() {
    switch (step) {
      case 1:
        if (goal) {
          saveDraft({ goal });
          setStep(2);
        }
        break;
      case 2:
        if (gender) {
          saveDraft({ gender });
          setStep(3);
        }
        break;
      case 3:
        if (height && weight) {
          saveDraft({ heightCm: parseFloat(height), weightKg: parseFloat(weight) });
          setStep(4);
        }
        break;
      case 4:
        if (age) {
          saveDraft({ ageYears: parseInt(age) });
          setStep(5);
        }
        break;
      case 5:
        if (activityLevel) {
          saveDraft({ activityLevel });
          setStep(6);
        }
        break;
      case 6:
        if (fitnessLevel) {
          saveDraft({ fitnessLevel });
          setStep(7);
        }
        break;
      case 7:
        saveDraft({ injuries: injuries.length === 0 ? ['none'] : injuries });
        setStep(8);
        break;
      case 8:
        if (goal && gender && height && weight && age && activityLevel && fitnessLevel) {
          completeOnboarding({
            goal,
            gender,
            heightCm: parseFloat(height),
            weightKg: parseFloat(weight),
            ageYears: parseInt(age),
            activityLevel,
            fitnessLevel,
            injuries: injuries.length === 0 ? ['none'] : injuries,
          });
          stopCamera();
          navigate('/app/dashboard', { replace: true });
        }
        break;
    }
  }

  function handleBack() {
    if (step > 1) setStep(s => s - 1);
  }

  const canProceed =
    (step === 1 && goal !== null) ||
    (step === 2 && gender !== null) ||
    (step === 3 && height !== '' && weight !== '') ||
    (step === 4 && age !== '') ||
    (step === 5 && activityLevel !== null) ||
    (step === 6 && fitnessLevel !== null) ||
    step === 7 ||
    (step === 8 && cameraReady && allChecksPass);

  const isLastStep = step === 8;

  // ─── render ──────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <div className="flex-1 flex flex-col max-w-md mx-auto w-full px-6 py-8">
        {/* progress bar */}
        <div className="mb-8">
          <div className="flex gap-1 mb-3">
            {Array.from({ length: TOTAL_STEPS }, (_, i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                  i + 1 <= step ? 'bg-emerald-500' : 'bg-muted'
                }`}
              />
            ))}
          </div>
          <p className="text-sm text-muted-foreground">
            {t('onboarding.stepOf', { current: step, total: TOTAL_STEPS })}
          </p>
        </div>

        {/* steps */}
        {step === 1 && <StepGoal t={t} selected={goal} onSelect={setGoal} />}
        {step === 2 && <StepGender t={t} selected={gender} onSelect={setGender} />}
        {step === 3 && (
          <StepMeasurements
            t={t}
            height={height}
            weight={weight}
            onHeight={setHeight}
            onWeight={setWeight}
          />
        )}
        {step === 4 && <StepAge t={t} age={age} onAge={setAge} />}
        {step === 5 && <StepActivity t={t} selected={activityLevel} onSelect={setActivityLevel} />}
        {step === 6 && <StepLevel t={t} selected={fitnessLevel} onSelect={setFitnessLevel} />}
        {step === 7 && (
          <StepInjuries
            t={t}
            selected={injuries}
            onToggle={inj => {
              if (inj === 'none') {
                setInjuries(['none']);
              } else {
                setInjuries(prev => {
                  const without = prev.filter(x => x !== 'none');
                  return without.includes(inj) ? without.filter(x => x !== inj) : [...without, inj];
                });
              }
            }}
          />
        )}
        {step === 8 && (
          <StepCamera
            t={t}
            videoRef={videoRef}
            cameraReady={cameraReady}
            cameraLoading={cameraLoading}
            cameraError={cameraError}
            checks={checks}
            allChecksPass={allChecksPass}
            onStart={startCamera}
          />
        )}

        {/* nav buttons */}
        <div className="mt-auto pt-6 flex gap-3">
          {step > 1 && (
            <button
              onClick={handleBack}
              className="flex-1 py-3 rounded-xl border border-border text-foreground font-medium hover:bg-muted transition-colors"
            >
              {t('common.back')}
            </button>
          )}
          {!(step === 8 && !cameraReady) && (
            <button
              onClick={handleNext}
              disabled={!canProceed}
              className="flex-1 py-3 rounded-xl bg-emerald-500 text-white font-semibold hover:bg-emerald-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isLastStep ? t('onboarding.camera.confirm') : t('common.next')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
