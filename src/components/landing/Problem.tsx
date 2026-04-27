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
    <section className="py-24 bg-background relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            'radial-gradient(ellipse 60% 50% at 80% 50%, rgba(239,68,68,0.06) 0%, transparent 70%)',
        }}
      />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="order-2 lg:order-1">
            <SectionBadge variant="red" className="mb-6">
              <AlertCircle className="w-3.5 h-3.5" />
              {t('landing.problem.badge')}
            </SectionBadge>

            <h2 className="text-4xl lg:text-5xl font-bold text-foreground leading-tight mb-4">
              {t('landing.problem.title')}
            </h2>
            <p className="text-muted-foreground text-sm mb-8 italic">
              {t('landing.problem.source')}
            </p>

            <p className="text-muted-foreground text-lg leading-relaxed mb-10">
              {t('landing.problem.description')}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {points.map(({ icon: Icon, key }) => (
                <div
                  key={key}
                  className="flex items-start gap-3 p-4 rounded-xl bg-card border border-border hover:border-border/80 transition-colors"
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
            <div className="relative w-72 h-72">
              <div
                className="absolute inset-0 rounded-full bg-red-500/5 border border-red-500/10"
                style={{ animation: 'ping 3s cubic-bezier(0,0,0.2,1) infinite' }}
              />
              <div className="absolute inset-4 rounded-full bg-red-500/8 border border-red-500/15" />
              <div className="absolute inset-8 rounded-full bg-red-500/10 border border-red-500/20" />
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-8xl font-bold text-foreground leading-none">73%</span>
                <span className="text-red-500 text-lg font-medium mt-2">wrong form</span>
                <span className="text-muted-foreground text-sm mt-1">during self-training</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
