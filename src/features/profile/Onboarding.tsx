import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import { useThemeSync } from '@/components/ThemeToggle';
import { useProfileStore } from '@/features/profile/profileStore';
import type {
  ActivityLevel,
  FitnessGoal,
  FitnessLevel,
  Gender,
  InjuryType,
} from '@/features/profile/types';

// ─── constants ───────────────────────────────────────────────────────────────

const TOTAL_STEPS = 8;

type GoalOption = { value: FitnessGoal; emoji: string };
type LevelOption = { value: FitnessLevel; descKey: string };
type ActivityOption = { value: ActivityLevel; descKey: string };
type InjuryOption = { value: InjuryType; emoji: string };

const GOAL_OPTIONS: GoalOption[] = [
  { value: 'lose_weight', emoji: '🔥' },
  { value: 'build_muscle', emoji: '💪' },
  { value: 'improve_technique', emoji: '🎯' },
  { value: 'stay_active', emoji: '⚡' },
  { value: 'rehabilitation', emoji: '🌿' },
];

const LEVEL_OPTIONS: LevelOption[] = [
  { value: 'beginner', descKey: 'onboarding.level.beginnerDesc' },
  { value: 'intermediate', descKey: 'onboarding.level.intermediateDesc' },
  { value: 'advanced', descKey: 'onboarding.level.advancedDesc' },
];

const ACTIVITY_OPTIONS: ActivityOption[] = [
  { value: 'sedentary', descKey: 'onboarding.activityLevel.sedentaryDesc' },
  { value: 'light', descKey: 'onboarding.activityLevel.lightDesc' },
  { value: 'moderate', descKey: 'onboarding.activityLevel.moderateDesc' },
  { value: 'active', descKey: 'onboarding.activityLevel.activeDesc' },
  { value: 'very_active', descKey: 'onboarding.activityLevel.very_activeDesc' },
];

const INJURY_OPTIONS: InjuryOption[] = [
  { value: 'none', emoji: '✅' },
  { value: 'lower_back', emoji: '🦴' },
  { value: 'knees', emoji: '🦵' },
  { value: 'shoulders', emoji: '💪' },
  { value: 'wrists', emoji: '✋' },
  { value: 'neck', emoji: '🫀' },
  { value: 'ankles', emoji: '🦶' },
  { value: 'hips', emoji: '🏃' },
];

// ─── camera helpers ───────────────────────────────────────────────────────────

type CheckStatus = 'ok' | 'dark' | 'bad' | 'close' | 'far' | 'checking';

type CameraChecks = {
  lighting: 'ok' | 'dark' | 'checking';
  position: 'ok' | 'bad' | 'checking';
  distance: 'ok' | 'close' | 'far' | 'checking';
};

type FrameAnalysis = {
  brightness: number; // 0-255 mean luma
  occupancy: number; // 0-1, fraction of "active" pixels in center zone
  bodySpan: number; // 0-1, fraction of frame rows with significant activity
};

// Downscale to 64×48, compute luma stats.
// "Active" pixels = those that differ from the frame mean — this approximates
// foreground without needing an explicit background frame.
function analyzeFrame(video: HTMLVideoElement): FrameAnalysis | null {
  try {
    const W = 64,
      H = 48;
    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.drawImage(video, 0, 0, W, H);
    const { data } = ctx.getImageData(0, 0, W, H);

    // Compute per-pixel luma and the overall mean
    const luma = new Float32Array(W * H);
    let totalLuma = 0;
    for (let i = 0; i < W * H; i++) {
      const p = i * 4;
      luma[i] = data[p] * 0.299 + data[p + 1] * 0.587 + data[p + 2] * 0.114;
      totalLuma += luma[i];
    }
    const meanLuma = totalLuma / (W * H);

    // Pixels that differ from the mean by >threshold are considered "active"
    // (likely foreground — the person or their shadow/clothing)
    const THRESHOLD = 22;
    const cx0 = Math.floor(W * 0.12),
      cx1 = Math.floor(W * 0.88);
    const cy0 = Math.floor(H * 0.05),
      cy1 = Math.floor(H * 0.95);
    let activeCenter = 0;
    const centerArea = (cx1 - cx0) * (cy1 - cy0);

    // Track per-row activity for bodySpan calculation
    const rowActive = new Uint8Array(H);
    for (let y = 0; y < H; y++) {
      let rowCount = 0;
      for (let x = 0; x < W; x++) {
        if (Math.abs(luma[y * W + x] - meanLuma) > THRESHOLD) {
          rowCount++;
          if (x >= cx0 && x < cx1 && y >= cy0 && y < cy1) activeCenter++;
        }
      }
      rowActive[y] = rowCount > W * 0.12 ? 1 : 0;
    }

    const occupancy = activeCenter / centerArea;
    const bodySpan = rowActive.reduce((a, b) => a + b, 0) / H;

    return { brightness: meanLuma, occupancy, bodySpan };
  } catch {
    return null;
  }
}

// Returns true if the video frame is still all-black (not yet rendered)
function isVideoBlack(video: HTMLVideoElement): boolean {
  try {
    const W = 20,
      H = 15;
    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');
    if (!ctx) return true;
    ctx.drawImage(video, 0, 0, W, H);
    const { data } = ctx.getImageData(0, 0, W, H);
    let sum = 0;
    for (let i = 0; i < data.length; i += 4) sum += data[i] + data[i + 1] + data[i + 2];
    return sum / (W * H * 3) < 5;
  } catch {
    return true;
  }
}

// Convert a rolling history of analyses to smoothed CameraChecks.
// Using averaged values with intentionally lenient thresholds so minor
// background clutter doesn't cause false negatives.
function checksFromHistory(history: FrameAnalysis[]): CameraChecks {
  if (history.length === 0)
    return { lighting: 'checking', position: 'checking', distance: 'checking' };

  const avg = history.reduce(
    (acc, f) => ({
      brightness: acc.brightness + f.brightness,
      occupancy: acc.occupancy + f.occupancy,
      bodySpan: acc.bodySpan + f.bodySpan,
    }),
    { brightness: 0, occupancy: 0, bodySpan: 0 }
  );
  const n = history.length;
  const brightness = avg.brightness / n;
  const occupancy = avg.occupancy / n;
  const bodySpan = avg.bodySpan / n;

  const lighting: CameraChecks['lighting'] = brightness < 42 ? 'dark' : 'ok';

  // Distance: right zone is ~20-75% occupancy
  // Too close → person fills almost the whole frame
  // Too far → very few active pixels
  const distance: CameraChecks['distance'] =
    occupancy > 0.78 ? 'close' : occupancy < 0.14 ? 'far' : 'ok';

  // Position: full body visible → activity spans at least 55% of frame height
  // AND enough content is present (not an empty or near-empty scene)
  const position: CameraChecks['position'] = occupancy > 0.1 && bodySpan > 0.5 ? 'ok' : 'bad';

  return { lighting, position, distance };
}

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

// ─── step components ──────────────────────────────────────────────────────────

type TFn = (key: string, opts?: Record<string, string | number>) => string;

function StepGoal({
  t,
  selected,
  onSelect,
}: {
  t: TFn;
  selected: FitnessGoal | null;
  onSelect: (g: FitnessGoal) => void;
}) {
  return (
    <div className="flex-1 flex flex-col">
      <h1 className="text-2xl font-bold mb-1">{t('onboarding.goal.title')}</h1>
      <p className="text-muted-foreground text-sm mb-6">{t('onboarding.goal.subtitle')}</p>
      <div className="flex flex-col gap-3">
        {GOAL_OPTIONS.map(({ value, emoji }) => (
          <button
            key={value}
            onClick={() => onSelect(value)}
            className={`flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all ${
              selected === value
                ? 'border-emerald-500 bg-emerald-500/10'
                : 'border-border hover:border-emerald-500/40'
            }`}
          >
            <span className="text-2xl">{emoji}</span>
            <span className="font-medium text-foreground">{t(`onboarding.goal.${value}`)}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function StepGender({
  t,
  selected,
  onSelect,
}: {
  t: TFn;
  selected: Gender | null;
  onSelect: (g: Gender) => void;
}) {
  const options: { value: Gender; emoji: string }[] = [
    { value: 'male', emoji: '♂️' },
    { value: 'female', emoji: '♀️' },
    { value: 'other', emoji: '⚪' },
  ];
  return (
    <div className="flex-1 flex flex-col">
      <h1 className="text-2xl font-bold mb-1">{t('onboarding.gender.title')}</h1>
      <p className="text-muted-foreground text-sm mb-6">{t('onboarding.gender.subtitle')}</p>
      <div className="flex flex-col gap-3">
        {options.map(({ value, emoji }) => (
          <button
            key={value}
            onClick={() => onSelect(value)}
            className={`flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all ${
              selected === value
                ? 'border-emerald-500 bg-emerald-500/10'
                : 'border-border hover:border-emerald-500/40'
            }`}
          >
            <span className="text-2xl">{emoji}</span>
            <span className="font-medium text-foreground">{t(`onboarding.gender.${value}`)}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function StepMeasurements({
  t,
  height,
  weight,
  onHeight,
  onWeight,
}: {
  t: TFn;
  height: string;
  weight: string;
  onHeight: (v: string) => void;
  onWeight: (v: string) => void;
}) {
  return (
    <div className="flex-1 flex flex-col">
      <h1 className="text-2xl font-bold mb-1">{t('onboarding.measurements.title')}</h1>
      <p className="text-muted-foreground text-sm mb-6">{t('onboarding.measurements.subtitle')}</p>
      <div className="flex flex-col gap-4">
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-muted-foreground">
            {t('onboarding.measurements.height')} ({t('onboarding.measurements.heightUnit')})
          </span>
          <input
            type="number"
            inputMode="decimal"
            value={height}
            onChange={e => onHeight(e.target.value)}
            placeholder="175"
            min="100"
            max="250"
            className="px-4 py-3 rounded-xl bg-muted border border-border text-foreground text-lg outline-none focus:border-emerald-500 transition-colors"
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-muted-foreground">
            {t('onboarding.measurements.weight')} ({t('onboarding.measurements.weightUnit')})
          </span>
          <input
            type="number"
            inputMode="decimal"
            value={weight}
            onChange={e => onWeight(e.target.value)}
            placeholder="70"
            min="30"
            max="300"
            className="px-4 py-3 rounded-xl bg-muted border border-border text-foreground text-lg outline-none focus:border-emerald-500 transition-colors"
          />
        </label>
      </div>
    </div>
  );
}

function StepAge({ t, age, onAge }: { t: TFn; age: string; onAge: (v: string) => void }) {
  return (
    <div className="flex-1 flex flex-col">
      <h1 className="text-2xl font-bold mb-1">{t('onboarding.age.title')}</h1>
      <p className="text-muted-foreground text-sm mb-6">{t('onboarding.age.subtitle')}</p>
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-muted-foreground">
          {t('onboarding.age.label')} ({t('onboarding.age.unit')})
        </span>
        <input
          type="number"
          inputMode="numeric"
          value={age}
          onChange={e => onAge(e.target.value)}
          placeholder="25"
          min="10"
          max="100"
          className="px-4 py-3 rounded-xl bg-muted border border-border text-foreground text-lg outline-none focus:border-emerald-500 transition-colors"
        />
      </label>
    </div>
  );
}

function StepActivity({
  t,
  selected,
  onSelect,
}: {
  t: TFn;
  selected: ActivityLevel | null;
  onSelect: (a: ActivityLevel) => void;
}) {
  return (
    <div className="flex-1 flex flex-col">
      <h1 className="text-2xl font-bold mb-1">{t('onboarding.activityLevel.title')}</h1>
      <p className="text-muted-foreground text-sm mb-6">{t('onboarding.activityLevel.subtitle')}</p>
      <div className="flex flex-col gap-3">
        {ACTIVITY_OPTIONS.map(({ value, descKey }) => (
          <button
            key={value}
            onClick={() => onSelect(value)}
            className={`flex flex-col gap-0.5 p-4 rounded-xl border-2 text-left transition-all ${
              selected === value
                ? 'border-emerald-500 bg-emerald-500/10'
                : 'border-border hover:border-emerald-500/40'
            }`}
          >
            <span className="font-semibold text-foreground">
              {t(`onboarding.activityLevel.${value}`)}
            </span>
            <span className="text-sm text-muted-foreground">{t(descKey)}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function StepLevel({
  t,
  selected,
  onSelect,
}: {
  t: TFn;
  selected: FitnessLevel | null;
  onSelect: (l: FitnessLevel) => void;
}) {
  return (
    <div className="flex-1 flex flex-col">
      <h1 className="text-2xl font-bold mb-1">{t('onboarding.level.title')}</h1>
      <p className="text-muted-foreground text-sm mb-6">{t('onboarding.level.subtitle')}</p>
      <div className="flex flex-col gap-3">
        {LEVEL_OPTIONS.map(({ value, descKey }) => (
          <button
            key={value}
            onClick={() => onSelect(value)}
            className={`flex flex-col gap-0.5 p-4 rounded-xl border-2 text-left transition-all ${
              selected === value
                ? 'border-emerald-500 bg-emerald-500/10'
                : 'border-border hover:border-emerald-500/40'
            }`}
          >
            <span className="font-semibold text-foreground">{t(`onboarding.level.${value}`)}</span>
            <span className="text-sm text-muted-foreground">{t(descKey)}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function StepInjuries({
  t,
  selected,
  onToggle,
}: {
  t: TFn;
  selected: InjuryType[];
  onToggle: (inj: InjuryType) => void;
}) {
  return (
    <div className="flex-1 flex flex-col">
      <h1 className="text-2xl font-bold mb-1">{t('onboarding.injuries.title')}</h1>
      <p className="text-muted-foreground text-sm mb-6">{t('onboarding.injuries.subtitle')}</p>
      <div className="grid grid-cols-2 gap-3">
        {INJURY_OPTIONS.map(({ value, emoji }) => {
          const isSelected = selected.includes(value);
          return (
            <button
              key={value}
              onClick={() => onToggle(value)}
              className={`flex items-center gap-3 p-3.5 rounded-xl border-2 text-left transition-all ${
                isSelected
                  ? 'border-emerald-500 bg-emerald-500/10'
                  : 'border-border hover:border-emerald-500/40'
              }`}
            >
              <span className="text-xl">{emoji}</span>
              <span className="text-sm font-medium text-foreground">
                {t(`onboarding.injuries.${value}`)}
              </span>
              {isSelected && <span className="ml-auto text-emerald-500 text-xs">✓</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── camera calibration step ──────────────────────────────────────────────────

function CheckRow({
  label,
  status,
  okText,
  badText,
  closeText,
  farText,
}: {
  label: string;
  status: CheckStatus;
  okText: string;
  badText?: string;
  closeText?: string;
  farText?: string;
}) {
  const isOk = status === 'ok';
  const isPending = status === 'checking';
  const displayText = isPending
    ? '...'
    : isOk
      ? okText
      : status === 'close'
        ? (closeText ?? badText ?? '')
        : status === 'far'
          ? (farText ?? badText ?? '')
          : (badText ?? '');
  return (
    <div className="flex items-center gap-3 py-2.5">
      <div
        className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
          isPending ? 'bg-muted' : isOk ? 'bg-emerald-500' : 'bg-red-500'
        }`}
      >
        {isPending ? (
          <div className="w-3 h-3 border-2 border-muted-foreground/40 border-t-foreground rounded-full animate-spin" />
        ) : isOk ? (
          <span className="text-white text-xs font-bold">✓</span>
        ) : (
          <span className="text-white text-xs font-bold">✕</span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p
          className={`text-xs ${isOk ? 'text-emerald-500' : isPending ? 'text-muted-foreground' : 'text-red-400'}`}
        >
          {displayText}
        </p>
      </div>
    </div>
  );
}

type StepCameraProps = {
  t: TFn;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  cameraReady: boolean;
  cameraLoading: boolean;
  cameraError: boolean;
  checks: CameraChecks;
  allChecksPass: boolean;
  onStart: () => void;
};

function getGuidanceText(checks: CameraChecks, t: TFn): { text: string; ok: boolean } {
  if (checks.lighting === 'dark')
    return { text: t('onboarding.camera.checks.lightingDark'), ok: false };
  if (checks.distance === 'close')
    return { text: t('onboarding.camera.checks.distanceClose'), ok: false };
  if (checks.distance === 'far')
    return { text: t('onboarding.camera.checks.distanceFar'), ok: false };
  if (checks.position === 'bad')
    return { text: t('onboarding.camera.checks.positionBad'), ok: false };
  if (
    checks.lighting === 'checking' ||
    checks.position === 'checking' ||
    checks.distance === 'checking'
  ) {
    return { text: t('onboarding.camera.guide'), ok: false };
  }
  return { text: `✓ ${t('onboarding.camera.ready')}`, ok: true };
}

function StepCamera({
  t,
  videoRef,
  cameraReady,
  cameraLoading,
  cameraError,
  checks,
  allChecksPass,
  onStart,
}: StepCameraProps) {
  const guidance = cameraReady ? getGuidanceText(checks, t) : null;
  // Silhouette color tracks overall readiness
  const silhouetteColor = allChecksPass
    ? '#10b981'
    : checks.distance === 'close'
      ? '#ef4444'
      : 'white';
  const silhouetteOpacity = allChecksPass ? 0.6 : 0.28;

  return (
    <div className="flex-1 flex flex-col">
      <h1 className="text-2xl font-bold mb-1">{t('onboarding.camera.title')}</h1>
      <p className="text-muted-foreground text-sm mb-4">{t('onboarding.camera.subtitle')}</p>

      {/* camera preview */}
      <div className="relative w-full aspect-4/3 bg-zinc-900 rounded-2xl overflow-hidden mb-4">
        <video
          ref={videoRef}
          className="w-full h-full object-cover scale-x-[-1]"
          playsInline
          muted
        />

        {/* silhouette guide — colour changes based on state */}
        {cameraReady && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <svg
              viewBox="0 0 200 300"
              className="h-[80%]"
              fill="none"
              style={{ opacity: silhouetteOpacity }}
            >
              <ellipse
                cx="100"
                cy="40"
                rx="22"
                ry="26"
                stroke={silhouetteColor}
                strokeWidth="2"
                strokeDasharray="6 3"
              />
              <path
                d="M78 66 C60 80 55 120 60 150 L140 150 C145 120 140 80 122 66 Z"
                stroke={silhouetteColor}
                strokeWidth="2"
                strokeDasharray="6 3"
              />
              <path
                d="M78 80 L50 140 L58 145 L84 90"
                stroke={silhouetteColor}
                strokeWidth="2"
                strokeDasharray="6 3"
              />
              <path
                d="M122 80 L150 140 L142 145 L116 90"
                stroke={silhouetteColor}
                strokeWidth="2"
                strokeDasharray="6 3"
              />
              <path
                d="M80 150 L72 240 L88 240 L96 170"
                stroke={silhouetteColor}
                strokeWidth="2"
                strokeDasharray="6 3"
              />
              <path
                d="M120 150 L128 240 L112 240 L104 170"
                stroke={silhouetteColor}
                strokeWidth="2"
                strokeDasharray="6 3"
              />
            </svg>
          </div>
        )}

        {/* dynamic guidance banner */}
        {guidance && (
          <div className="absolute bottom-3 left-3 right-3 text-center">
            <span
              className={`inline-block text-xs font-semibold px-3 py-1.5 rounded-full backdrop-blur-sm ${
                guidance.ok ? 'bg-emerald-500/80 text-white' : 'bg-black/60 text-white/90'
              }`}
            >
              {guidance.text}
            </span>
          </div>
        )}

        {/* loading */}
        {cameraLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-zinc-900">
            <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-zinc-400 text-sm">{t('onboarding.camera.loading')}</p>
          </div>
        )}

        {/* permission error */}
        {cameraError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-zinc-900 p-4 text-center">
            <span className="text-3xl">📷</span>
            <p className="text-red-400 text-sm">{t('onboarding.camera.permissionDenied')}</p>
            <button
              onClick={onStart}
              className="px-5 py-2 bg-emerald-500 text-white rounded-xl text-sm font-semibold"
            >
              {t('onboarding.camera.grant')}
            </button>
          </div>
        )}

        {/* start prompt */}
        {!cameraReady && !cameraLoading && !cameraError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-zinc-900">
            <span className="text-5xl">📷</span>
            <p className="text-zinc-400 text-sm text-center px-6">
              {t('onboarding.camera.subtitle')}
            </p>
            <button
              onClick={onStart}
              className="px-6 py-3 bg-emerald-500 text-white rounded-xl font-semibold hover:bg-emerald-600 transition-colors"
            >
              {t('onboarding.camera.grant')}
            </button>
          </div>
        )}
      </div>

      {/* 3-check list */}
      {cameraReady && (
        <div className="bg-card border border-border rounded-2xl px-4 py-1 divide-y divide-border">
          <CheckRow
            label={t('onboarding.camera.checks.lighting')}
            status={checks.lighting}
            okText={t('onboarding.camera.checks.lightingOk')}
            badText={t('onboarding.camera.checks.lightingDark')}
          />
          <CheckRow
            label={t('onboarding.camera.checks.distance')}
            status={checks.distance}
            okText={t('onboarding.camera.checks.distanceOk')}
            closeText={t('onboarding.camera.checks.distanceClose')}
            farText={t('onboarding.camera.checks.distanceFar')}
          />
          <CheckRow
            label={t('onboarding.camera.checks.position')}
            status={checks.position}
            okText={t('onboarding.camera.checks.positionOk')}
            badText={t('onboarding.camera.checks.positionBad')}
          />
        </div>
      )}

      {cameraReady && !allChecksPass && (
        <p className="text-xs text-center text-muted-foreground mt-3">
          {t('onboarding.camera.notReady')}
        </p>
      )}
    </div>
  );
}
