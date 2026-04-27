import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import { Play, Zap } from 'lucide-react';

import SectionBadge from '@/components/landing/SectionBadge';
import { useAuthStore } from '@/features/auth/authStore';

function SkeletonMockup() {
  return (
    <div className="relative w-64 sm:w-72 mx-auto">
      <div className="dark relative rounded-[2.5rem] bg-zinc-900 border-2 border-zinc-700 shadow-2xl shadow-black/60 overflow-hidden aspect-[9/19]">
        <svg
          viewBox="0 0 288 580"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="absolute inset-0 w-full h-full"
        >
          <rect width="288" height="580" fill="#0d0d14" />
          {[48, 96, 144, 192, 240].map(x => (
            <line key={`vg${x}`} x1={x} y1="0" x2={x} y2="580" stroke="#1a1a28" strokeWidth="1" />
          ))}
          {[72, 144, 216, 288, 360, 432, 504].map(y => (
            <line key={`hg${y}`} x1="0" y1={y} x2="288" y2={y} stroke="#1a1a28" strokeWidth="1" />
          ))}
          <circle cx="144" cy="88" r="28" stroke="#22c55e" strokeWidth="2.5" fill="none" />
          <line x1="144" y1="116" x2="144" y2="152" stroke="#22c55e" strokeWidth="2.5" />
          <line x1="144" y1="148" x2="96" y2="162" stroke="#22c55e" strokeWidth="2.5" />
          <line x1="144" y1="148" x2="192" y2="162" stroke="#22c55e" strokeWidth="2.5" />
          <line x1="96" y1="162" x2="68" y2="218" stroke="#22c55e" strokeWidth="2.5" />
          <line x1="192" y1="162" x2="220" y2="218" stroke="#22c55e" strokeWidth="2.5" />
          <line x1="68" y1="218" x2="56" y2="274" stroke="#22c55e" strokeWidth="2.5" />
          <line x1="220" y1="218" x2="232" y2="274" stroke="#22c55e" strokeWidth="2.5" />
          <line x1="144" y1="148" x2="144" y2="270" stroke="#22c55e" strokeWidth="2.5" />
          <line x1="110" y1="270" x2="178" y2="270" stroke="#22c55e" strokeWidth="2.5" />
          <line x1="110" y1="270" x2="88" y2="368" stroke="#f59e0b" strokeWidth="2.5" />
          <line x1="178" y1="270" x2="200" y2="368" stroke="#f59e0b" strokeWidth="2.5" />
          <line x1="88" y1="368" x2="92" y2="472" stroke="#ef4444" strokeWidth="2.5" />
          <line x1="200" y1="368" x2="196" y2="472" stroke="#ef4444" strokeWidth="2.5" />
          <circle cx="144" cy="148" r="6" fill="#22c55e" />
          <circle cx="96" cy="162" r="6" fill="#22c55e" />
          <circle cx="192" cy="162" r="6" fill="#22c55e" />
          <circle cx="68" cy="218" r="6" fill="#22c55e" />
          <circle cx="220" cy="218" r="6" fill="#22c55e" />
          <circle cx="56" cy="274" r="6" fill="#22c55e" />
          <circle cx="232" cy="274" r="6" fill="#22c55e" />
          <circle cx="144" cy="270" r="6" fill="#22c55e" />
          <circle cx="110" cy="270" r="6" fill="#22c55e" />
          <circle cx="178" cy="270" r="6" fill="#22c55e" />
          <circle cx="88" cy="368" r="8" fill="#f59e0b" />
          <circle cx="200" cy="368" r="8" fill="#f59e0b" />
          <circle cx="92" cy="472" r="9" fill="#ef4444" />
          <circle cx="196" cy="472" r="9" fill="#ef4444" />
          <circle cx="92" cy="472" r="18" stroke="#ef4444" strokeWidth="1.5" strokeOpacity="0.35">
            <animate attributeName="r" values="9;22;9" dur="2s" repeatCount="indefinite" />
            <animate
              attributeName="stroke-opacity"
              values="0.35;0;0.35"
              dur="2s"
              repeatCount="indefinite"
            />
          </circle>
          <circle cx="196" cy="472" r="18" stroke="#ef4444" strokeWidth="1.5" strokeOpacity="0.35">
            <animate
              attributeName="r"
              values="9;22;9"
              dur="2s"
              repeatCount="indefinite"
              begin="0.3s"
            />
            <animate
              attributeName="stroke-opacity"
              values="0.35;0;0.35"
              dur="2s"
              repeatCount="indefinite"
              begin="0.3s"
            />
          </circle>
        </svg>

        <div className="absolute top-4 left-4 z-20">
          <div className="bg-zinc-800/90 backdrop-blur-sm rounded-xl px-3 py-2 border border-zinc-700">
            <div className="text-zinc-400 text-[10px] uppercase tracking-wide font-medium">
              Technique
            </div>
            <div className="text-emerald-400 text-xl font-bold leading-tight">94/100</div>
          </div>
        </div>

        <div className="absolute top-4 right-4 z-20">
          <div className="bg-zinc-800/90 backdrop-blur-sm rounded-xl px-3 py-2 border border-zinc-700">
            <div className="text-zinc-400 text-[10px] uppercase tracking-wide font-medium">
              Reps
            </div>
            <div className="text-white text-xl font-bold leading-tight">8 / 12</div>
          </div>
        </div>

        <div className="absolute bottom-6 left-4 right-4 z-20">
          <div className="bg-red-950/80 backdrop-blur-sm border border-red-500/40 rounded-xl px-4 py-3 flex items-start gap-3">
            <span className="mt-1 w-2 h-2 rounded-full bg-red-400 shrink-0 animate-pulse" />
            <div>
              <div className="text-red-400 text-[10px] font-semibold uppercase tracking-wide mb-0.5">
                Correction
              </div>
              <div className="text-white text-sm font-medium">Keep knees behind toes</div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute -left-8 top-1/3 hidden lg:block">
        <div className="bg-card border border-border rounded-xl px-4 py-3 shadow-xl">
          <div className="text-muted-foreground text-xs mb-0.5">Accuracy</div>
          <div className="text-foreground font-bold text-lg">±3°</div>
          <div className="text-muted-foreground text-xs">joint angles</div>
        </div>
      </div>

      <div className="absolute -right-8 top-1/2 hidden lg:block">
        <div className="bg-card border border-border rounded-xl px-4 py-3 shadow-xl">
          <div className="text-muted-foreground text-xs mb-0.5">Latency</div>
          <div className="text-emerald-500 font-bold text-lg">&lt;150ms</div>
          <div className="text-muted-foreground text-xs">feedback</div>
        </div>
      </div>
    </div>
  );
}

export default function Hero() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, openAuthModal } = useAuthStore();

  return (
    <section className="relative min-h-screen flex items-center pt-16 pb-16 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-muted/20" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            'radial-gradient(ellipse 80% 60% at 50% -20%, rgba(16,185,129,0.08) 0%, transparent 70%)',
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 w-full">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <SectionBadge className="mb-8">
              <Zap className="w-3.5 h-3.5" />
              {t('landing.hero.badge')}
            </SectionBadge>

            <h1 className="text-5xl lg:text-6xl xl:text-7xl font-bold text-foreground leading-[1.08] tracking-tight mb-6">
              {t('landing.hero.title')}{' '}
              <span className="bg-gradient-to-r from-emerald-500 to-cyan-500 bg-clip-text text-transparent">
                {t('landing.hero.titleHighlight')}
              </span>
            </h1>

            <p className="text-xl text-muted-foreground leading-relaxed mb-10 max-w-lg">
              {t('landing.hero.subtitle')}
            </p>

            <div className="flex flex-wrap gap-4 mb-6">
              <button
                onClick={() => (user ? navigate('/app/dashboard') : openAuthModal())}
                className="inline-flex items-center gap-2 px-7 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold rounded-xl transition-all duration-200 text-base shadow-xl shadow-emerald-500/25 hover:shadow-emerald-400/30 hover:-translate-y-0.5"
              >
                {t('landing.hero.ctaPrimary')}
                <Zap className="w-4 h-4" />
              </button>
              <a
                href="#how-it-works"
                className="inline-flex items-center gap-2 px-7 py-3.5 bg-foreground/5 hover:bg-foreground/10 border border-foreground/10 hover:border-foreground/20 text-foreground font-medium rounded-xl transition-all duration-200 text-base"
              >
                <Play className="w-4 h-4" />
                {t('landing.hero.ctaSecondary')}
              </a>
            </div>

            <p className="text-muted-foreground text-sm">{t('landing.hero.noCreditCard')}</p>
          </div>

          <div className="flex justify-center lg:justify-end">
            <SkeletonMockup />
          </div>
        </div>
      </div>
    </section>
  );
}
