import { useTranslation } from 'react-i18next';

import { ArrowUp, Shield, Zap } from 'lucide-react';

export default function Footer() {
  const { t } = useTranslation();

  const productLinks = [
    { key: 'features', href: '#features' },
    { key: 'howItWorks', href: '#how-it-works' },
    { key: 'exercises', href: '#features' },
  ] as const;
  const companyLinks = ['about', 'blog', 'careers', 'contact'] as const;

  return (
    <footer className="border-t border-border/60 bg-muted/20">
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8 lg:py-16">
        <div className="app-card overflow-hidden">
          <div className="grid gap-10 p-6 sm:p-8 lg:grid-cols-[1.3fr_0.7fr_0.7fr] lg:gap-12">
            <div>
              <div className="mb-4 flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500 shadow-lg shadow-emerald-500/25">
                  <Zap className="h-4.5 w-4.5 text-white" />
                </div>
                <span className="text-lg font-black tracking-tight text-foreground">
                  AI Fitness Coach
                </span>
              </div>
              <p className="mb-5 max-w-md text-sm leading-6 text-muted-foreground">
                {t('landing.footer.tagline')}
              </p>
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <Shield className="h-3.5 w-3.5" />
                {t('landing.footer.privacyNote')}
              </div>
            </div>

            <FooterLinks title={t('landing.footer.product')}>
              {productLinks.map(({ key, href }) => (
                <FooterLink key={key} href={href}>
                  {t(`landing.footer.links.${key}`)}
                </FooterLink>
              ))}
            </FooterLinks>

            <FooterLinks title={t('landing.footer.company')}>
              {companyLinks.map(key => (
                <FooterLink key={key} href={`#${key}`}>
                  {t(`landing.footer.links.${key}`)}
                </FooterLink>
              ))}
            </FooterLinks>
          </div>

          <div className="flex flex-col gap-4 border-t border-border px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
            <p className="text-sm text-muted-foreground">{t('landing.footer.copyright')}</p>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
              <FooterLink href="#privacy">{t('landing.footer.legal.privacy')}</FooterLink>
              <FooterLink href="#terms">{t('landing.footer.legal.terms')}</FooterLink>
              <a
                href="#hero"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-500 transition-colors hover:text-emerald-400"
              >
                <ArrowUp className="h-3.5 w-3.5" />
                Top
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterLinks({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="mb-4 text-xs font-bold uppercase tracking-wider text-foreground">{title}</h4>
      <ul className="flex flex-col gap-2.5">{children}</ul>
    </div>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li className="list-none">
      <a
        href={href}
        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        {children}
      </a>
    </li>
  );
}
