import { BodyOutline, mProp } from '@/components/icons/bodyHeatmapHelpers';
import type { MuscleIntensities } from '@/components/icons/bodyHeatmapHelpers';

export default function BodyBackIcon({ intensities }: { intensities: MuscleIntensities }) {
  return (
    <svg viewBox="0 0 100 128" className="w-full h-auto">
      {BodyOutline}
      <rect x="36" y="22" width="28" height="12" rx="5" {...mProp('traps', intensities)} />
      <ellipse cx="24" cy="27" rx="8" ry="6" {...mProp('shoulders_b', intensities)} />
      <ellipse cx="76" cy="27" rx="8" ry="6" {...mProp('shoulders_b', intensities)} />
      <rect x="33" y="36" width="10" height="24" rx="4" {...mProp('lats', intensities)} />
      <rect x="57" y="36" width="10" height="24" rx="4" {...mProp('lats', intensities)} />
      <rect x="15" y="30" width="14" height="16" rx="5" {...mProp('triceps', intensities)} />
      <rect x="71" y="30" width="14" height="16" rx="5" {...mProp('triceps', intensities)} />
      <rect x="15" y="48" width="13" height="14" rx="4" {...mProp('forearms', intensities)} />
      <rect x="72" y="48" width="13" height="14" rx="4" {...mProp('forearms', intensities)} />
      <rect x="39" y="52" width="22" height="14" rx="5" {...mProp('lower_back', intensities)} />
      <ellipse cx="41" cy="75" rx="11" ry="9" {...mProp('glutes', intensities)} />
      <ellipse cx="59" cy="75" rx="11" ry="9" {...mProp('glutes', intensities)} />
      <rect x="33" y="84" width="13" height="21" rx="5" {...mProp('hamstrings', intensities)} />
      <rect x="54" y="84" width="13" height="21" rx="5" {...mProp('hamstrings', intensities)} />
      <rect x="33" y="107" width="12" height="17" rx="4" {...mProp('calves', intensities)} />
      <rect x="55" y="107" width="12" height="17" rx="4" {...mProp('calves', intensities)} />
    </svg>
  );
}
