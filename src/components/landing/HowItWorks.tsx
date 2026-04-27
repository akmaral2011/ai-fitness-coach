import { useTranslation } from 'react-i18next';

import { Camera, Cpu, Zap } from 'lucide-react';

import SectionBadge from '@/components/landing/SectionBadge';

const steps = [
  { num: 1, icon: Camera },
  { num: 2, icon: Cpu },
  { num: 3, icon: Zap },
] as const;

export default function HowItWorks() {
  const { t } = useTranslation();

  return (
    <section id="how-it-works" className="py-16 sm:py-24 bg-background relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            'radial-gradient(ellipse 80% 60% at 50% 100%, rgba(16,185,129,0.06) 0%, transparent 60%)',
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 sm:mb-16">
          <SectionBadge>{t('landing.howItWorks.badge')}</SectionBadge>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground leading-tight">
            {t('landing.howItWorks.title')}
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6 md:gap-8 relative">
          <div className="hidden md:block absolute top-12 left-[calc(16.67%+2rem)] right-[calc(16.67%+2rem)] h-px">
            <div className="w-full h-px bg-gradient-to-r from-emerald-500/40 via-emerald-500/20 to-emerald-500/40" />
          </div>

          {steps.map(({ num, icon: Icon }) => (
            <div
              key={num}
              className="relative flex md:flex-col items-center md:items-center gap-5 md:gap-0 text-left md:text-center"
            >
              <div className="relative mb-0 md:mb-6 shrink-0">
                <div className="w-16 h-16 md:w-24 md:h-24 rounded-2xl bg-card border border-border flex items-center justify-center shadow-xl">
                  <Icon className="w-7 h-7 md:w-10 md:h-10 text-emerald-500" />
                </div>
                <div className="absolute -top-2 -right-2 md:-top-3 md:-right-3 w-6 h-6 md:w-7 md:h-7 rounded-full bg-emerald-500 flex items-center justify-center text-white text-xs font-bold shadow-lg shadow-emerald-500/30">
                  {num}
                </div>
              </div>

              <div>
                <h3 className="text-base sm:text-xl font-bold text-foreground mb-1 md:mb-3">
                  {t(`landing.howItWorks.steps.${num}.title`)}
                </h3>
                <p className="text-muted-foreground leading-relaxed max-w-xs text-sm sm:text-base">
                  {t(`landing.howItWorks.steps.${num}.description`)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
