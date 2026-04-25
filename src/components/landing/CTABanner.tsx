import { useTranslation } from 'react-i18next';

import { Zap } from 'lucide-react';

import { useAuthStore } from '@/features/auth/authStore';

export default function CTABanner() {
  const { t } = useTranslation();
  const { user, openAuthModal } = useAuthStore();

  return (
    <section className="py-24 bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-transparent to-emerald-500/5" />
      <div
        className="absolute inset-0 opacity-50"
        style={{
          backgroundImage:
            'radial-gradient(ellipse 80% 80% at 50% 50%, rgba(16,185,129,0.08) 0%, transparent 65%)',
        }}
      />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />
      <div className="relative max-w-4xl mx-auto px-6 lg:px-8 text-center">
        <h2 className="text-4xl lg:text-6xl font-bold text-foreground leading-tight mb-6">
          {t('landing.cta.title')}
        </h2>
        <p className="text-xl text-muted-foreground leading-relaxed mb-10 max-w-2xl mx-auto">
          {t('landing.cta.subtitle')}
        </p>

        <button
          onClick={user ? undefined : openAuthModal}
          className="inline-flex items-center gap-2 px-10 py-4 bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-2xl transition-all duration-200 text-lg shadow-2xl shadow-emerald-500/30 hover:shadow-emerald-400/40 hover:-translate-y-1"
        >
          {t('landing.cta.button')}
          <Zap className="w-5 h-5" />
        </button>

        <p className="text-muted-foreground text-sm mt-4">{t('landing.cta.noCreditCard')}</p>
      </div>
    </section>
  );
}
