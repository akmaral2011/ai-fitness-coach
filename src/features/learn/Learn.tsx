import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import { ARTICLES, categoryColor } from '@/features/learn/data';
import type { ArticleCategory } from '@/features/learn/data';

type Filter = 'all' | ArticleCategory;

const CATEGORIES: { key: Filter; labelKey: string }[] = [
  { key: 'all', labelKey: 'learn.categories.all' },
  { key: 'technique', labelKey: 'learn.categories.technique' },
  { key: 'training', labelKey: 'learn.categories.training' },
  { key: 'recovery', labelKey: 'learn.categories.recovery' },
  { key: 'beginner', labelKey: 'learn.categories.beginner' },
];

export default function Learn() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<Filter>('all');

  const filtered = filter === 'all' ? ARTICLES : ARTICLES.filter(a => a.category === filter);

  return (
    <div className="px-4 py-6 max-w-lg mx-auto">
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-foreground">{t('learn.title')}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t('learn.subtitle')}</p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 mb-5 no-scrollbar">
        {CATEGORIES.map(({ key, labelKey }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
              filter === key
                ? 'bg-emerald-500 text-white'
                : 'bg-muted text-muted-foreground hover:text-foreground'
            }`}
          >
            {t(labelKey)}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        {filtered.map(article => (
          <button
            key={article.id}
            onClick={() => navigate(`/app/learn/${article.id}`)}
            className="flex items-start gap-4 p-4 bg-card border border-border rounded-2xl text-left hover:border-emerald-500/30 transition-colors group"
          >
            <span className="text-3xl leading-none mt-0.5 shrink-0">{article.emoji}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span
                  className={`text-xs font-semibold capitalize px-2 py-0.5 rounded-full ${categoryColor(article.category)}`}
                >
                  {t(`learn.categories.${article.category}`)}
                </span>
                <span className="text-xs text-muted-foreground">
                  {article.readMinutes} {t('learn.readMin')}
                </span>
              </div>
              <p className="text-sm font-semibold text-foreground mb-1 group-hover:text-emerald-500 transition-colors">
                {t(article.titleKey)}
              </p>
              <p className="text-xs text-muted-foreground line-clamp-2">{t(article.summaryKey)}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
