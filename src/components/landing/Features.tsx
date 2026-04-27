import { useTranslation } from 'react-i18next';

import { Activity, BookOpen, Dumbbell, Trophy } from 'lucide-react';

import SectionBadge from '@/components/landing/SectionBadge';

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
    <section id="features" className="py-16 sm:py-24 bg-muted/30 relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(16,185,129,0.05) 0%, transparent 60%)',
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 sm:mb-16">
          <SectionBadge>{t('landing.features.badge')}</SectionBadge>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground leading-tight">
            {t('landing.features.title')}
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
          {features.map(({ key, icon: Icon, accent }) => {
            const colors = accentMap[accent];
            return (
              <div
                key={key}
                className={`group p-5 sm:p-8 rounded-2xl bg-card border ${colors.cardBorder} hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}
              >
                <div
                  className={`w-11 h-11 rounded-xl ${colors.iconBg} border flex items-center justify-center mb-4 sm:mb-6`}
                >
                  <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${colors.icon}`} />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-foreground mb-2 sm:mb-3">
                  {t(`landing.features.${key}.title`)}
                </h3>
                <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">
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
