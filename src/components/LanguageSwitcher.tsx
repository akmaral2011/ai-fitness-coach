import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Globe } from 'lucide-react';

const LANGUAGES = [
  { code: 'en', label: 'EN' },
  { code: 'ru', label: 'RU' },
  { code: 'ky', label: 'KY' },
];

const LANGUAGE_LABELS: Record<string, string> = {
  en: 'English',
  ru: 'Русский',
  ky: 'Кыргызча',
};

type Props = {
  inline?: boolean;
};

export default function LanguageSwitcher({ inline = false }: Props) {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (inline) {
    return (
      <div className="flex items-center gap-1">
        <Globe className="w-4 h-4 text-muted-foreground mr-1" />
        {LANGUAGES.map(({ code, label }) => (
          <button
            key={code}
            onClick={() => i18n.changeLanguage(code)}
            className={`px-2.5 py-1 rounded-lg text-sm font-medium transition-colors ${
              i18n.language === code
                ? 'bg-emerald-500/15 text-emerald-500 font-semibold'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    );
  }

  const current = LANGUAGES.find(l => l.code === i18n.language) ?? LANGUAGES[0];

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        aria-label="Change language"
      >
        <Globe className="w-4 h-4" />
        <span>{current.code.toUpperCase()}</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1.5 w-36 bg-card border border-border rounded-xl shadow-xl overflow-hidden z-50">
          {LANGUAGES.map(({ code }) => (
            <button
              key={code}
              onClick={() => {
                i18n.changeLanguage(code);
                setOpen(false);
              }}
              className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                i18n.language === code
                  ? 'text-emerald-500 font-semibold bg-emerald-500/10'
                  : 'text-foreground hover:bg-muted'
              }`}
            >
              {LANGUAGE_LABELS[code]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
