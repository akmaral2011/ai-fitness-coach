import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import { ArrowLeft, Zap } from 'lucide-react';

export default function NotFound() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="bg-background text-foreground min-h-screen antialiased flex flex-col items-center justify-center px-6 relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-50"
        style={{
          backgroundImage:
            'radial-gradient(ellipse 70% 60% at 50% 40%, rgba(16,185,129,0.07) 0%, transparent 65%)',
        }}
      />

      <div
        className="absolute inset-0 opacity-30 dark:opacity-20"
        style={{
          backgroundImage:
            'linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      <div className="relative z-10 flex flex-col items-center text-center max-w-md">
        <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-8 shadow-xl shadow-emerald-500/10">
          <Zap className="w-7 h-7 text-emerald-400" />
        </div>

        <div className="text-8xl font-bold text-foreground leading-none mb-2 tracking-tight">
          4
          <span className="bg-linear-to-r from-emerald-500 to-cyan-500 bg-clip-text text-transparent">
            0
          </span>
          4
        </div>

        <h1 className="text-2xl font-semibold text-foreground mt-6 mb-3">{t('notFound.title')}</h1>
        <p className="text-muted-foreground leading-relaxed mb-10">{t('notFound.message')}</p>

        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-emerald-500/25 hover:-translate-y-0.5"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('common.home')}
        </button>
      </div>
    </div>
  );
}
