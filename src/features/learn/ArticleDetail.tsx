import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router';

import ChevronLeftIcon from '@/components/icons/ChevronLeftIcon';
import { categoryColor, getArticle } from '@/features/learn/data';

export default function ArticleDetail() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const article = id ? getArticle(id) : undefined;

  if (!article) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <p className="text-muted-foreground">Article not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-10">
      <div className="sticky top-0 z-10 bg-background/90 backdrop-blur border-b border-border px-4 h-14 flex items-center gap-3">
        <button
          onClick={() => navigate('/app/learn')}
          className="p-2 -ml-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground"
          aria-label={t('learn.back')}
        >
          <ChevronLeftIcon />
        </button>
        <span className="font-semibold text-foreground truncate">{t('learn.title')}</span>
      </div>

      <div className="px-4 max-w-lg mx-auto">
        <div className="pt-7 pb-6">
          <div className="text-5xl mb-5 leading-none">{article.emoji}</div>
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <span
              className={`text-xs font-semibold capitalize px-2.5 py-1 rounded-full ${categoryColor(article.category)}`}
            >
              {t(`learn.categories.${article.category}`)}
            </span>
            <span className="text-xs text-muted-foreground">
              {article.readMinutes} {t('learn.readMin')}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-foreground leading-snug mb-5">
            {t(article.titleKey)}
          </h1>
          <p className="text-muted-foreground text-base leading-relaxed italic border-l-2 border-emerald-500/50 pl-4 mb-8">
            {t(article.summaryKey)}
          </p>
        </div>

        <div className="flex flex-col gap-6 pb-8">
          {article.bodyKeys.map((key, i) => (
            <p key={i} className="text-foreground/85 leading-relaxed text-base">
              {t(key)}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
