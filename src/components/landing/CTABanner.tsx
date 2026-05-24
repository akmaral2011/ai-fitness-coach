import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import { Zap } from 'lucide-react';

import { useAuthStore } from '@/features/auth/authStore';

export default function CTABanner() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, openAuthModal } = useAuthStore();

  return (
    <section className="relative overflow-hidden bg-background py-20 sm:py-24">
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(16,185,129,0.10),transparent_45%,rgba(59,130,246,0.08))]" />
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
          onClick={() => (user ? navigate('/app/dashboard') : openAuthModal())}
          className="app-primary-action inline-flex items-center gap-2 px-10 py-4 text-lg font-bold"
        >
          {t('landing.cta.button')}
          <Zap className="w-5 h-5" />
        </button>

        <p className="text-muted-foreground text-sm mt-4">{t('landing.cta.noCreditCard')}</p>
      </div>
    </section>
  );
}
