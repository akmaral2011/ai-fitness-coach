import type { RefObject } from 'react';

export type CheckStatus = 'ok' | 'dark' | 'bad' | 'close' | 'far' | 'checking';

export type CameraChecks = {
  lighting: 'ok' | 'dark' | 'checking';
  position: 'ok' | 'bad' | 'checking';
  distance: 'ok' | 'close' | 'far' | 'checking';
};

export type FrameAnalysis = {
  brightness: number;
  occupancy: number;
  bodySpan: number;
};

export type TranslationFn = (key: string, opts?: Record<string, string | number>) => string;

export type StepCameraProps = {
  t: TranslationFn;
  videoRef: RefObject<HTMLVideoElement | null>;
  cameraReady: boolean;
  cameraLoading: boolean;
  cameraError: boolean;
  checks: CameraChecks;
  allChecksPass: boolean;
  onStart: () => void;
};

export function analyzeFrame(video: HTMLVideoElement): FrameAnalysis | null {
  try {
    const width = 64;
    const height = 48;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.drawImage(video, 0, 0, width, height);
    const { data } = ctx.getImageData(0, 0, width, height);

    const luma = new Float32Array(width * height);
    let totalLuma = 0;
    for (let index = 0; index < width * height; index += 1) {
      const pixel = index * 4;
      luma[index] = data[pixel] * 0.299 + data[pixel + 1] * 0.587 + data[pixel + 2] * 0.114;
      totalLuma += luma[index];
    }
    const meanLuma = totalLuma / (width * height);

    const threshold = 22;
    const centerXStart = Math.floor(width * 0.12);
    const centerXEnd = Math.floor(width * 0.88);
    const centerYStart = Math.floor(height * 0.05);
    const centerYEnd = Math.floor(height * 0.95);
    let activeCenter = 0;
    const centerArea = (centerXEnd - centerXStart) * (centerYEnd - centerYStart);

    const rowActive = new Uint8Array(height);
    for (let y = 0; y < height; y += 1) {
      let rowCount = 0;
      for (let x = 0; x < width; x += 1) {
        if (Math.abs(luma[y * width + x] - meanLuma) > threshold) {
          rowCount += 1;
          if (x >= centerXStart && x < centerXEnd && y >= centerYStart && y < centerYEnd) {
            activeCenter += 1;
          }
        }
      }
      rowActive[y] = rowCount > width * 0.12 ? 1 : 0;
    }

    return {
      brightness: meanLuma,
      occupancy: activeCenter / centerArea,
      bodySpan: rowActive.reduce((acc, value) => acc + value, 0) / height,
    };
  } catch {
    return null;
  }
}

export function isVideoBlack(video: HTMLVideoElement): boolean {
  try {
    const width = 20;
    const height = 15;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return true;
    ctx.drawImage(video, 0, 0, width, height);
    const { data } = ctx.getImageData(0, 0, width, height);
    let sum = 0;
    for (let index = 0; index < data.length; index += 4) {
      sum += data[index] + data[index + 1] + data[index + 2];
    }
    return sum / (width * height * 3) < 5;
  } catch {
    return true;
  }
}

export function checksFromHistory(history: FrameAnalysis[]): CameraChecks {
  if (history.length === 0) {
    return { lighting: 'checking', position: 'checking', distance: 'checking' };
  }

  const avg = history.reduce(
    (acc, frame) => ({
      brightness: acc.brightness + frame.brightness,
      occupancy: acc.occupancy + frame.occupancy,
      bodySpan: acc.bodySpan + frame.bodySpan,
    }),
    { brightness: 0, occupancy: 0, bodySpan: 0 }
  );
  const count = history.length;
  const brightness = avg.brightness / count;
  const occupancy = avg.occupancy / count;
  const bodySpan = avg.bodySpan / count;

  const lighting: CameraChecks['lighting'] = brightness < 42 ? 'dark' : 'ok';
  const distance: CameraChecks['distance'] =
    occupancy > 0.78 ? 'close' : occupancy < 0.14 ? 'far' : 'ok';
  const position: CameraChecks['position'] = occupancy > 0.1 && bodySpan > 0.5 ? 'ok' : 'bad';

  return { lighting, position, distance };
}

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
          className={`text-xs ${
            isOk ? 'text-emerald-500' : isPending ? 'text-muted-foreground' : 'text-red-400'
          }`}
        >
          {displayText}
        </p>
      </div>
    </div>
  );
}

function getGuidanceText(checks: CameraChecks, t: TranslationFn): { text: string; ok: boolean } {
  if (checks.lighting === 'dark') {
    return { text: t('onboarding.camera.checks.lightingDark'), ok: false };
  }
  if (checks.distance === 'close') {
    return { text: t('onboarding.camera.checks.distanceClose'), ok: false };
  }
  if (checks.distance === 'far') {
    return { text: t('onboarding.camera.checks.distanceFar'), ok: false };
  }
  if (checks.position === 'bad') {
    return { text: t('onboarding.camera.checks.positionBad'), ok: false };
  }
  if (
    checks.lighting === 'checking' ||
    checks.position === 'checking' ||
    checks.distance === 'checking'
  ) {
    return { text: t('onboarding.camera.guide'), ok: false };
  }
  return { text: `✓ ${t('onboarding.camera.ready')}`, ok: true };
}

export function StepCamera({
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

      <div className="relative w-full aspect-4/3 bg-zinc-900 rounded-2xl overflow-hidden mb-4">
        <video
          ref={videoRef}
          className="w-full h-full object-cover scale-x-[-1]"
          playsInline
          muted
        />

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

        {cameraLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-zinc-900">
            <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-zinc-400 text-sm">{t('onboarding.camera.loading')}</p>
          </div>
        )}

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
