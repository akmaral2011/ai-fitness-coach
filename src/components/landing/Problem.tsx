import { useTranslation } from 'react-i18next';

import { AlertCircle, DollarSign, EyeOff, TrendingDown } from 'lucide-react';

import SectionBadge from '@/components/landing/SectionBadge';

export default function Problem() {
  const { t } = useTranslation();

  const points = [
    { icon: AlertCircle, key: 'injuries' },
    { icon: TrendingDown, key: 'plateau' },
    { icon: DollarSign, key: 'cost' },
    { icon: EyeOff, key: 'noFeedback' },
  ] as const;

  return (
    <section className="relative overflow-hidden bg-background py-16 sm:py-24">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          <div className="order-2 lg:order-1">
            <SectionBadge variant="red" className="mb-5 sm:mb-6">
              <AlertCircle className="w-3.5 h-3.5" />
              {t('landing.problem.badge')}
            </SectionBadge>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground leading-tight mb-3 sm:mb-4">
              {t('landing.problem.title')}
            </h2>
            <p className="text-muted-foreground text-sm mb-5 sm:mb-8 italic">
              {t('landing.problem.source')}
            </p>

            <p className="text-muted-foreground text-base sm:text-lg leading-relaxed mb-7 sm:mb-10">
              {t('landing.problem.description')}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {points.map(({ icon: Icon, key }) => (
                <div
                  key={key}
                  className="app-card app-card-hover flex items-start gap-3 rounded-xl p-3 sm:p-4"
                >
                  <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0 mt-0.5">
                    <Icon className="w-4 h-4 text-red-500" />
                  </div>
                  <span className="text-foreground/80 text-sm leading-relaxed">
                    {t(`landing.problem.points.${key}`)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="order-1 lg:order-2 flex justify-center lg:justify-end">
            <div className="app-card relative h-48 w-48 overflow-hidden rounded-[2rem] sm:h-64 sm:w-64 lg:h-72 lg:w-72">
              <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(239,68,68,0.12),rgba(16,185,129,0.06))]" />
              <div className="absolute inset-6 rounded-[1.5rem] border border-red-500/15" />
              <div className="absolute inset-12 rounded-[1rem] border border-red-500/20" />
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-6xl sm:text-7xl lg:text-8xl font-bold text-foreground leading-none">
                  73%
                </span>
                <span className="text-red-500 text-sm sm:text-lg font-medium mt-2">wrong form</span>
                <span className="text-muted-foreground text-xs sm:text-sm mt-1">
                  during self-training
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
