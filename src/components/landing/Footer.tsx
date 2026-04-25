import { useTranslation } from 'react-i18next';

import { Shield, Zap } from 'lucide-react';

export default function Footer() {
  const { t } = useTranslation();

  const productLinks = ['features', 'pricing', 'howItWorks', 'exercises'] as const;
  const companyLinks = ['about', 'blog', 'careers', 'contact'] as const;

  return (
    <footer className="bg-muted/20 border-t border-border/60">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-12">
          <div className="sm:col-span-2 lg:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/25">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-foreground text-lg tracking-tight">
                AI Fitness Coach
              </span>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-xs mb-6">
              {t('landing.footer.tagline')}
            </p>
            <div className="flex items-center gap-2 text-muted-foreground text-xs">
              <Shield className="w-3.5 h-3.5 text-emerald-500" />
              {t('landing.footer.privacyNote')}
            </div>
          </div>

          <div>
            <h4 className="text-foreground font-semibold text-sm mb-4 uppercase tracking-wide">
              {t('landing.footer.product')}
            </h4>
            <ul className="flex flex-col gap-3">
              {productLinks.map(key => (
                <li key={key}>
                  <a
                    href={`#${key}`}
                    className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                  >
                    {t(`landing.footer.links.${key}`)}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-foreground font-semibold text-sm mb-4 uppercase tracking-wide">
              {t('landing.footer.company')}
            </h4>
            <ul className="flex flex-col gap-3">
              {companyLinks.map(key => (
                <li key={key}>
                  <a
                    href={`#${key}`}
                    className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                  >
                    {t(`landing.footer.links.${key}`)}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-muted-foreground text-sm">{t('landing.footer.copyright')}</p>
          <div className="flex items-center gap-6">
            <a
              href="#privacy"
              className="text-muted-foreground hover:text-foreground text-sm transition-colors"
            >
              {t('landing.footer.legal.privacy')}
            </a>
            <a
              href="#terms"
              className="text-muted-foreground hover:text-foreground text-sm transition-colors"
            >
              {t('landing.footer.legal.terms')}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
