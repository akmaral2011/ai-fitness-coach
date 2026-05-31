import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import SearchIcon from '@/components/icons/SearchIcon';
import { DIFFICULTY_COLOR } from '@/features/exercises/types';
import type { Category, Difficulty } from '@/features/exercises/types';
import { useExercises } from '@/features/exercises/useExercises';

type Filter = { category: Category | 'all'; difficulty: Difficulty | 'all' };

const CATEGORIES: Array<Category | 'all'> = ['all', 'strength', 'cardio', 'hiit', 'mobility'];
const DIFFICULTIES: Array<Difficulty | 'all'> = ['all', 'beginner', 'intermediate', 'advanced'];

export default function ExerciseCatalog() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Filter>({ category: 'all', difficulty: 'all' });
  const { exercises, loading } = useExercises();

  const filtered = useMemo(() => {
    return exercises.filter(ex => {
      const name = t(ex.nameKey).toLowerCase();
      const matchSearch = name.includes(search.toLowerCase());
      const matchCategory = filter.category === 'all' || ex.category === filter.category;
      const matchDifficulty = filter.difficulty === 'all' || ex.difficulty === filter.difficulty;
      return matchSearch && matchCategory && matchDifficulty;
    });
  }, [exercises, search, filter, t]);

  return (
    <div className="app-page app-page-flow">
      <h1 className="app-page-title mb-4">{t('catalog.title')}</h1>

      <div className="relative mb-4">
        <SearchIcon
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder={t('catalog.searchPlaceholder')}
          className="w-full rounded-xl border border-border bg-card py-2.5 pl-10 pr-4 text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-emerald-500"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 mb-3 scrollbar-hide">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setFilter(f => ({ ...f, category: cat }))}
            className={`app-control-label shrink-0 px-3 py-1.5 rounded-lg transition-colors ${
              filter.category === cat
                ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/20'
                : 'bg-muted text-muted-foreground hover:text-foreground'
            }`}
          >
            {cat === 'all' ? t('catalog.all') : t(`catalog.categories.${cat}`)}
          </button>
        ))}
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 mb-5 scrollbar-hide">
        {DIFFICULTIES.map(diff => (
          <button
            key={diff}
            onClick={() => setFilter(f => ({ ...f, difficulty: diff }))}
            className={`app-control-label shrink-0 px-3 py-1.5 rounded-lg transition-colors ${
              filter.difficulty === diff
                ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/20'
                : 'bg-muted text-muted-foreground hover:text-foreground'
            }`}
          >
            {diff === 'all' ? t('catalog.all') : t(`catalog.difficulty.${diff}`)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">
          {t('common.loading', 'Loading...')}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">{t('catalog.noResults')}</div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {filtered.map(ex => (
            <button
              key={ex.id}
              onClick={() => navigate(`/app/exercise/${ex.id}`)}
              className="app-card app-card-hover flex min-h-40 flex-col items-start gap-2 p-4 text-left"
            >
              <div className="flex items-start justify-between w-full">
                <span className="text-3xl">{ex.thumbnailEmoji}</span>
                <span
                  className={`app-chip-label px-2 py-0.5 rounded-full ${DIFFICULTY_COLOR[ex.difficulty]}`}
                >
                  {t(`catalog.difficulty.${ex.difficulty}`)}
                </span>
              </div>
              <div>
                <p className="app-card-title line-clamp-2">{t(ex.nameKey)}</p>
                <p className="app-card-meta mt-0.5">
                  {ex.sets} × {ex.reps} {t('catalog.detail.reps')} · {ex.estimatedDuration}
                  {t('common.min')}
                </p>
              </div>
              <div className="flex flex-wrap gap-1 mt-auto">
                {ex.primaryMuscles.slice(0, 2).map(m => (
                  <span key={m} className="app-card-meta rounded-full bg-muted px-2 py-0.5">
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
