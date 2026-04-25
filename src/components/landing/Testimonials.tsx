import { useTranslation } from 'react-i18next';

import { Star } from 'lucide-react';

const avatarColors = ['bg-emerald-500', 'bg-cyan-500', 'bg-violet-500'] as const;

export default function Testimonials() {
  const { t } = useTranslation();

  const items = [1, 2, 3] as const;

  return (
    <section className="py-24 bg-background relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            'radial-gradient(ellipse 80% 50% at 50% 50%, rgba(16,185,129,0.04) 0%, transparent 70%)',
        }}
      />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm font-medium mb-4">
            {t('landing.testimonials.badge')}
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-foreground leading-tight">
            {t('landing.testimonials.title')}
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {items.map((i, idx) => {
            const name = t(`landing.testimonials.items.${i}.name`);
            const initial = name.charAt(0);

            return (
              <div
                key={i}
                className="p-8 rounded-2xl bg-card border border-border hover:border-border/80 transition-colors flex flex-col gap-6"
              >
                <div className="flex gap-1">
                  {Array.from({ length: 5 }).map((_, s) => (
                    <Star key={s} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>

                <p className="text-foreground/80 leading-relaxed flex-1 italic">
                  &ldquo;{t(`landing.testimonials.items.${i}.text`)}&rdquo;
                </p>

                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full ${avatarColors[idx]} flex items-center justify-center text-white font-bold text-sm shrink-0`}
                  >
                    {initial}
                  </div>
                  <div>
                    <div className="text-foreground font-semibold text-sm">
                      {t(`landing.testimonials.items.${i}.name`)}
                    </div>
                    <div className="text-muted-foreground text-xs">
                      {t(`landing.testimonials.items.${i}.role`)}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
