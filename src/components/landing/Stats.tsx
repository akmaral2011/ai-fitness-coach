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
    <section className="bg-muted/30 border-y border-border/60 py-12">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {items.map(({ icon: Icon, value, label, color }) => (
            <div key={label} className="flex flex-col items-center text-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center">
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
