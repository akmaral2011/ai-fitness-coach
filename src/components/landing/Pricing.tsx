import { useTranslation } from 'react-i18next';

import { Check } from 'lucide-react';

import SectionBadge from '@/components/landing/SectionBadge';
import { useAuthStore } from '@/features/auth/authStore';

const tiers = ['free', 'premium', 'team'] as const;

export default function Pricing() {
  const { t } = useTranslation();
  const { user, openAuthModal } = useAuthStore();

  const handleCTA = (tier: (typeof tiers)[number]) => (e: React.MouseEvent) => {
    e.preventDefault();
    if (tier === 'team') return; // let contact form handle separately
    if (!user) openAuthModal();
  };

  return (
    <section id="pricing" className="py-16 sm:py-24 bg-muted/30 relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(16,185,129,0.06) 0%, transparent 60%)',
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 sm:mb-16">
          <SectionBadge>{t('landing.pricing.badge')}</SectionBadge>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground leading-tight">
            {t('landing.pricing.title')}
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-4 sm:gap-6 items-stretch">
          {tiers.map(tier => {
            const isPremium = tier === 'premium';
            const features = t(`landing.pricing.${tier}.features`, {
              returnObjects: true,
            }) as string[];

            return (
              <div
                key={tier}
                className={`relative flex flex-col rounded-2xl p-5 sm:p-8 ${
                  isPremium
                    ? 'bg-card border-2 border-emerald-500/60 shadow-2xl shadow-emerald-500/10'
                    : 'bg-card border border-border'
                }`}
              >
                {isPremium && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="px-4 py-1 rounded-full bg-emerald-500 text-white text-xs font-bold uppercase tracking-wide shadow-lg shadow-emerald-500/30">
                      {t(`landing.pricing.${tier}.badge`)}
                    </span>
                  </div>
                )}

                <div className="mb-4 sm:mb-6">
                  <h3 className="text-lg font-bold text-foreground mb-1">
                    {t(`landing.pricing.${tier}.name`)}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {t(`landing.pricing.${tier}.description`)}
                  </p>
                </div>

                <div className="mb-5 sm:mb-8">
                  <div className="flex items-end gap-1">
                    <span
                      className={`text-4xl sm:text-5xl font-bold ${isPremium ? 'text-emerald-500' : 'text-foreground'}`}
                    >
                      {t(`landing.pricing.${tier}.price`)}
                    </span>
                    <span className="text-muted-foreground text-sm mb-2 leading-tight">
                      {t(`landing.pricing.${tier}.period`)}
                    </span>
                  </div>
                </div>

                <ul className="flex flex-col gap-2 sm:gap-3 mb-5 sm:mb-8 flex-1">
                  {features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                          isPremium
                            ? 'bg-emerald-500/15 border border-emerald-500/30'
                            : 'bg-muted border border-border'
                        }`}
                      >
                        <Check
                          className={`w-3 h-3 ${isPremium ? 'text-emerald-500' : 'text-muted-foreground'}`}
                        />
                      </div>
                      <span className="text-foreground/80 text-sm leading-relaxed">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={handleCTA(tier)}
                  className={`w-full text-center py-3 px-6 rounded-xl font-semibold text-sm transition-all duration-200 ${
                    isPremium
                      ? 'bg-emerald-500 hover:bg-emerald-400 text-white shadow-lg shadow-emerald-500/25 hover:-translate-y-0.5'
                      : 'bg-muted hover:bg-muted/80 text-foreground border border-border'
                  }`}
                >
                  {t(`landing.pricing.${tier}.cta`)}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
