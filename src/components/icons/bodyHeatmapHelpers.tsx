export type MuscleIntensities = Record<string, number>;

export function mProp(id: string, intensities: MuscleIntensities) {
  const v = intensities[id] ?? 0;
  if (v <= 0) return { fill: 'currentColor', fillOpacity: 0.12 };
  return { fill: '#10b981', fillOpacity: 0.3 + v * 0.65 };
}

export const BodyOutline = (
  <>
    <circle cx="50" cy="10" r="8" fill="currentColor" fillOpacity="0.07" />
    <rect x="33" y="21" width="34" height="48" rx="9" fill="currentColor" fillOpacity="0.07" />
    <rect x="14" y="22" width="18" height="44" rx="7" fill="currentColor" fillOpacity="0.07" />
    <rect x="68" y="22" width="18" height="44" rx="7" fill="currentColor" fillOpacity="0.07" />
    <rect x="31" y="67" width="38" height="12" rx="6" fill="currentColor" fillOpacity="0.07" />
    <rect x="31" y="77" width="17" height="51" rx="7" fill="currentColor" fillOpacity="0.07" />
    <rect x="52" y="77" width="17" height="51" rx="7" fill="currentColor" fillOpacity="0.07" />
  </>
);
