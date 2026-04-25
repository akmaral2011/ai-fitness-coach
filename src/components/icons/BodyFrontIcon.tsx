import { BodyOutline, mProp } from '@/components/icons/bodyHeatmapHelpers';
import type { MuscleIntensities } from '@/components/icons/bodyHeatmapHelpers';

export default function BodyFrontIcon({ intensities }: { intensities: MuscleIntensities }) {
  return (
    <svg viewBox="0 0 100 128" className="w-full h-auto">
      {BodyOutline}
      <ellipse cx="24" cy="27" rx="8" ry="6" {...mProp('shoulders_f', intensities)} />
      <ellipse cx="76" cy="27" rx="8" ry="6" {...mProp('shoulders_f', intensities)} />
      <rect x="36" y="25" width="28" height="13" rx="5" {...mProp('chest', intensities)} />
      <rect x="15" y="32" width="14" height="14" rx="5" {...mProp('biceps', intensities)} />
      <rect x="71" y="32" width="14" height="14" rx="5" {...mProp('biceps', intensities)} />
      <rect x="15" y="48" width="13" height="15" rx="4" {...mProp('forearms', intensities)} />
      <rect x="72" y="48" width="13" height="15" rx="4" {...mProp('forearms', intensities)} />
      <rect x="39" y="40" width="22" height="22" rx="5" {...mProp('abs', intensities)} />
      <rect x="33" y="80" width="13" height="23" rx="5" {...mProp('quads', intensities)} />
      <rect x="54" y="80" width="13" height="23" rx="5" {...mProp('quads', intensities)} />
      <rect x="33" y="106" width="12" height="18" rx="4" {...mProp('calves', intensities)} />
      <rect x="55" y="106" width="12" height="18" rx="4" {...mProp('calves', intensities)} />
    </svg>
  );
}
