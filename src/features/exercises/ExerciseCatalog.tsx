import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import SearchIcon from '@/components/icons/SearchIcon';
import { EXERCISES } from '@/features/exercises/data';
import { DIFFICULTY_COLOR } from '@/features/exercises/types';
import type { Category, Difficulty } from '@/features/exercises/types';

type Filter = { category: Category | 'all'; difficulty: Difficulty | 'all' };

const CATEGORIES: Array<Category | 'all'> = ['all', 'strength', 'cardio', 'hiit', 'mobility'];
const DIFFICULTIES: Array<Difficulty | 'all'> = ['all', 'beginner', 'intermediate', 'advanced'];

export default function ExerciseCatalog() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Filter>({ category: 'all', difficulty: 'all' });

  const filtered = useMemo(() => {
    return EXERCISES.filter(ex => {
      const name = t(ex.nameKey).toLowerCase();
      const matchSearch = name.includes(search.toLowerCase());
      const matchCategory = filter.category === 'all' || ex.category === filter.category;
      const matchDifficulty = filter.difficulty === 'all' || ex.difficulty === filter.difficulty;
      return matchSearch && matchCategory && matchDifficulty;
    });
  }, [search, filter, t]);

  return (
    <div className="px-4 py-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-foreground mb-4">{t('catalog.title')}</h1>

      <div className="relative mb-4">
        <SearchIcon
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder={t('catalog.searchPlaceholder')}
          className="w-full pl-10 pr-4 py-2.5 bg-muted border border-border rounded-xl text-foreground placeholder:text-muted-foreground outline-none focus:border-emerald-500 transition-colors"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 mb-3 scrollbar-hide">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setFilter(f => ({ ...f, category: cat }))}
            className={`shrink-0 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filter.category === cat
                ? 'bg-emerald-500 text-white'
                : 'bg-muted text-muted-foreground hover:text-foreground'
            }`}
          >
            {cat === 'all' ? t('catalog.all') : t(`catalog.CATEGORIES.${cat}`)}
          </button>
        ))}
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 mb-5 scrollbar-hide">
        {DIFFICULTIES.map(diff => (
          <button
            key={diff}
            onClick={() => setFilter(f => ({ ...f, difficulty: diff }))}
            className={`shrink-0 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filter.difficulty === diff
                ? 'bg-emerald-500 text-white'
                : 'bg-muted text-muted-foreground hover:text-foreground'
            }`}
          >
            {diff === 'all' ? t('catalog.all') : t(`catalog.difficulty.${diff}`)}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">{t('catalog.noResults')}</div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {filtered.map(ex => (
            <button
              key={ex.id}
              onClick={() => navigate(`/app/exercise/${ex.id}`)}
              className="flex flex-col items-start gap-2 p-4 bg-card border border-border rounded-2xl hover:border-emerald-500/60 transition-colors text-left"
            >
              <div className="flex items-start justify-between w-full">
                <span className="text-3xl">{ex.thumbnailEmoji}</span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium ${DIFFICULTY_COLOR[ex.difficulty]}`}
                >
                  {t(`catalog.difficulty.${ex.difficulty}`)}
                </span>
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{t(ex.nameKey)}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {ex.sets} × {ex.reps} {t('catalog.detail.reps')} · {ex.estimatedDuration}
                  {t('common.min')}
                </p>
              </div>
              <div className="flex flex-wrap gap-1 mt-auto">
                {ex.primaryMuscles.slice(0, 2).map(m => (
                  <span
                    key={m}
                    className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full"
                  >
                    {t(`catalog.muscles.${m}`)}
                  </span>
                ))}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
