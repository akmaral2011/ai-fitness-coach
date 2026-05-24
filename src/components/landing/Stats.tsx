import { useTranslation } from 'react-i18next';

import { Activity, Dumbbell, Globe, Zap } from 'lucide-react';

export default function Stats() {
  const { t } = useTranslation();

  const items = [
    {
      icon: Dumbbell,
      value: t('landing.stats.exercisesValue'),
      label: t('landing.stats.exercises'),
      color: 'text-emerald-500',
    },
    {
      icon: Activity,
      value: t('landing.stats.bodyPointsValue'),
      label: t('landing.stats.bodyPoints'),
      color: 'text-cyan-500',
    },
    {
      icon: Zap,
      value: t('landing.stats.feedbackValue'),
      label: t('landing.stats.feedback'),
      color: 'text-amber-500',
    },
    {
      icon: Globe,
      value: t('landing.stats.languagesValue'),
      label: t('landing.stats.languages'),
      color: 'text-violet-500',
    },
  ];

  return (
    <section className="border-y border-border/60 bg-muted/20 py-10 sm:py-12">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {items.map(({ icon: Icon, value, label, color }) => (
            <div
              key={label}
              className="app-card app-card-hover flex flex-col items-center gap-3 p-5 text-center"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-background/80">
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <div>
                <div className={`text-3xl font-bold ${color} leading-none mb-1`}>{value}</div>
                <div className="text-muted-foreground text-sm leading-snug">{label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
