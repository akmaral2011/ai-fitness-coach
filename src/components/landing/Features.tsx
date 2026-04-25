import { useTranslation } from 'react-i18next';

import { Activity, BookOpen, Dumbbell, Trophy } from 'lucide-react';

const features = [
  { key: 'ai', icon: Activity, accent: 'emerald' },
  { key: 'library', icon: Dumbbell, accent: 'cyan' },
  { key: 'programs', icon: BookOpen, accent: 'violet' },
  { key: 'gamification', icon: Trophy, accent: 'amber' },
] as const;

const accentMap = {
  emerald: {
    iconBg: 'bg-emerald-500/10 border-emerald-500/20',
    icon: 'text-emerald-500',
    cardBorder: 'border-emerald-500/30 hover:shadow-emerald-500/8',
  },
  cyan: {
    iconBg: 'bg-cyan-500/10 border-cyan-500/20',
    icon: 'text-cyan-500',
    cardBorder: 'border-cyan-500/20 hover:shadow-cyan-500/8',
  },
  violet: {
    iconBg: 'bg-violet-500/10 border-violet-500/20',
    icon: 'text-violet-500',
    cardBorder: 'border-violet-500/20 hover:shadow-violet-500/8',
  },
  amber: {
    iconBg: 'bg-amber-500/10 border-amber-500/20',
    icon: 'text-amber-500',
    cardBorder: 'border-amber-500/20 hover:shadow-amber-500/8',
  },
};

export default function Features() {
  const { t } = useTranslation();

  return (
    <section id="features" className="py-24 bg-muted/30 relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(16,185,129,0.05) 0%, transparent 60%)',
        }}
      />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm font-medium mb-4">
            {t('landing.features.badge')}
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-foreground leading-tight">
            {t('landing.features.title')}
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          {features.map(({ key, icon: Icon, accent }) => {
            const colors = accentMap[accent];
            return (
              <div
                key={key}
                className={`group p-8 rounded-2xl bg-card border ${colors.cardBorder} hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}
              >
                <div
                  className={`w-12 h-12 rounded-xl ${colors.iconBg} border flex items-center justify-center mb-6`}
                >
                  <Icon className={`w-6 h-6 ${colors.icon}`} />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">
                  {t(`landing.features.${key}.title`)}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {t(`landing.features.${key}.description`)}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
