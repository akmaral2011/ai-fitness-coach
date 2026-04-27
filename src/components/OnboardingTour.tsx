import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

const STEPS = [
  { emoji: '👋', titleKey: 'tour.step1.title', descKey: 'tour.step1.desc' },
  { emoji: '🏋️', titleKey: 'tour.step2.title', descKey: 'tour.step2.desc' },
  { emoji: '📈', titleKey: 'tour.step3.title', descKey: 'tour.step3.desc' },
  { emoji: '🎯', titleKey: 'tour.step4.title', descKey: 'tour.step4.desc' },
];

const TOUR_KEY = 'onboarding_tour_v1';

export function useTourDone() {
  return localStorage.getItem(TOUR_KEY) === 'done';
}

export default function OnboardingTour({ onDone }: { onDone: () => void }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  function finish() {
    localStorage.setItem(TOUR_KEY, 'done');
    onDone();
  }

  function next() {
    if (isLast) {
      finish();
      navigate('/app/catalog');
    } else {
      setStep(s => s + 1);
    }
  }

  return (
    <div className="fixed inset-0 z-200 flex items-end justify-center p-4 sm:items-center">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={finish}
        onKeyDown={finish}
        role="button"
        tabIndex={0}
        aria-label="Close tour"
      />

      <div className="relative z-10 w-full max-w-sm bg-card border border-border rounded-2xl shadow-2xl p-7 animate-in slide-in-from-bottom-6 fade-in duration-300">
        {/* close */}
        <button
          onClick={finish}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground text-xl leading-none"
          aria-label="Skip"
        >
          ✕
        </button>

        {/* step dots */}
        <div className="flex gap-1.5 mb-6">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1 rounded-full flex-1 transition-colors duration-300 ${
                i === step ? 'bg-emerald-500' : i < step ? 'bg-emerald-500/40' : 'bg-muted'
              }`}
            />
          ))}
        </div>

        {/* content */}
        <div className="text-center mb-7">
          <span className="text-5xl block mb-4">{current.emoji}</span>
          <h2 className="text-xl font-bold text-foreground mb-2">{t(current.titleKey)}</h2>
          <p className="text-muted-foreground text-sm leading-relaxed">{t(current.descKey)}</p>
        </div>

        {/* actions */}
        <div className="flex gap-3">
          {step > 0 && (
            <button
              onClick={() => setStep(s => s - 1)}
              className="flex-1 py-3 border border-border rounded-xl text-sm font-medium text-foreground hover:bg-muted transition-colors"
            >
              {t('tour.back')}
            </button>
          )}
          <button
            onClick={next}
            className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold rounded-xl text-sm transition-colors"
          >
            {isLast ? t('tour.start') : t('tour.next')}
          </button>
        </div>
      </div>
    </div>
  );
}
