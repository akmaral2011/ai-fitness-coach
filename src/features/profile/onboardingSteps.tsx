import {
  ACTIVITY_OPTIONS,
  GOAL_OPTIONS,
  INJURY_OPTIONS,
  LEVEL_OPTIONS,
} from '@/features/profile/onboardingOptions';
import type {
  ActivityLevel,
  FitnessGoal,
  FitnessLevel,
  Gender,
  InjuryType,
} from '@/features/profile/types';

export type TranslationFn = (key: string, opts?: Record<string, string | number>) => string;

export function StepGoal({
  t,
  selected,
  onSelect,
}: {
  t: TranslationFn;
  selected: FitnessGoal | null;
  onSelect: (goal: FitnessGoal) => void;
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

export function StepGender({
  t,
  selected,
  onSelect,
}: {
  t: TranslationFn;
  selected: Gender | null;
  onSelect: (gender: Gender) => void;
}) {
  const options: Array<{ value: Gender; emoji: string }> = [
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

export function StepMeasurements({
  t,
  height,
  weight,
  onHeight,
  onWeight,
}: {
  t: TranslationFn;
  height: string;
  weight: string;
  onHeight: (value: string) => void;
  onWeight: (value: string) => void;
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
            onChange={event => onHeight(event.target.value)}
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
            onChange={event => onWeight(event.target.value)}
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

export function StepAge({
  t,
  age,
  onAge,
}: {
  t: TranslationFn;
  age: string;
  onAge: (value: string) => void;
}) {
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
          onChange={event => onAge(event.target.value)}
          placeholder="25"
          min="10"
          max="100"
          className="px-4 py-3 rounded-xl bg-muted border border-border text-foreground text-lg outline-none focus:border-emerald-500 transition-colors"
        />
      </label>
    </div>
  );
}

export function StepActivity({
  t,
  selected,
  onSelect,
}: {
  t: TranslationFn;
  selected: ActivityLevel | null;
  onSelect: (activityLevel: ActivityLevel) => void;
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

export function StepLevel({
  t,
  selected,
  onSelect,
}: {
  t: TranslationFn;
  selected: FitnessLevel | null;
  onSelect: (fitnessLevel: FitnessLevel) => void;
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

export function StepInjuries({
  t,
  selected,
  onToggle,
}: {
  t: TranslationFn;
  selected: InjuryType[];
  onToggle: (injury: InjuryType) => void;
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
