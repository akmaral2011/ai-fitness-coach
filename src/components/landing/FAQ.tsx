import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ChevronDown } from 'lucide-react';

import { cn } from '@/lib/utils';

const faqKeys = [1, 2, 3, 4, 5] as const;

export default function FAQ() {
  const { t } = useTranslation();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-24 bg-muted/30 relative">
      <div className="max-w-3xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm font-medium mb-4">
            {t('landing.faq.badge')}
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-foreground leading-tight">
            {t('landing.faq.title')}
          </h2>
        </div>

        <div className="flex flex-col gap-3">
          {faqKeys.map(key => {
            const isOpen = openIndex === key;
            return (
              <div
                key={key}
                className={cn(
                  'rounded-xl border transition-colors duration-200',
                  isOpen
                    ? 'bg-card border-border'
                    : 'bg-card/50 border-border/60 hover:border-border'
                )}
              >
                <button
                  className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left"
                  onClick={() => setOpenIndex(isOpen ? null : key)}
                  aria-expanded={isOpen}
                >
                  <span className="text-foreground font-semibold text-base leading-snug">
                    {t(`landing.faq.items.${key}.q`)}
                  </span>
                  <ChevronDown
                    className={cn(
                      'w-5 h-5 text-muted-foreground shrink-0 transition-transform duration-200',
                      isOpen && 'rotate-180 text-emerald-500'
                    )}
                  />
                </button>

                {isOpen && (
                  <div className="px-6 pb-5">
                    <p className="text-muted-foreground leading-relaxed">
                      {t(`landing.faq.items.${key}.a`)}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
