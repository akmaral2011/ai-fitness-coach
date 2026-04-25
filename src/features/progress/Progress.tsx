import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import BodyBackIcon from '@/components/icons/BodyBackIcon';
import BodyFrontIcon from '@/components/icons/BodyFrontIcon';
import CalendarIcon from '@/components/icons/CalendarIcon';
import FlameIcon from '@/components/icons/FlameIcon';
import TrendingUpIcon from '@/components/icons/TrendingUpIcon';
import TrophyIcon from '@/components/icons/TrophyIcon';
import { EXERCISES } from '@/features/exercises/data';
import { useProgressStore } from '@/features/progress/progressStore';
import type { CompletedSession } from '@/features/workout/types';

// ─── types ────────────────────────────────────────────────────────────────────

type Period = '7d' | '30d' | 'all';
type BarData = { label: string; avgScore: number; totalReps: number; count: number };
type MuscleIntensities = Record<string, number>;

// ─── data helpers ─────────────────────────────────────────────────────────────

const MuscleMap: Record<string, string[]> = {
  chest: ['chest'],
  shoulders: ['shoulders_f', 'shoulders_b'],
  arms: ['biceps', 'triceps', 'forearms'],
  core: ['abs', 'lower_back'],
  legs: ['quads', 'hamstrings', 'calves'],
  glutes: ['glutes'],
  back: ['lats', 'traps', 'lower_back'],
  fullbody: [
    'chest',
    'shoulders_f',
    'shoulders_b',
    'biceps',
    'triceps',
    'abs',
    'quads',
    'glutes',
    'lats',
    'traps',
    'hamstrings',
  ],
};

function filterByPeriod(sessions: CompletedSession[], period: Period): CompletedSession[] {
  if (period === 'all') return sessions;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - (period === '7d' ? 7 : 30));
  return sessions.filter(s => new Date(s.date) >= cutoff);
}

function dailyBars(sessions: CompletedSession[], days: number): BarData[] {
  return Array.from({ length: days }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (days - 1 - i));
    const key = d.toLocaleDateString('en-CA');
    const day = sessions.filter(s => new Date(s.date).toLocaleDateString('en-CA') === key);
    return {
      label: d.toLocaleDateString('en-US', { weekday: 'short' }),
      avgScore: day.length
        ? Math.round(day.reduce((a, s) => a + s.averageScore, 0) / day.length)
        : 0,
      totalReps: day.reduce((a, s) => a + s.repCount, 0),
      count: day.length,
    };
  });
}

function weeklyBars(sessions: CompletedSession[], weeks: number): BarData[] {
  return Array.from({ length: weeks }, (_, i) => {
    const weekEnd = new Date();
    weekEnd.setDate(weekEnd.getDate() - i * 7);
    weekEnd.setHours(23, 59, 59, 999);
    const weekStart = new Date(weekEnd);
    weekStart.setDate(weekStart.getDate() - 6);
    weekStart.setHours(0, 0, 0, 0);
    const week = sessions.filter(s => {
      const d = new Date(s.date);
      return d >= weekStart && d <= weekEnd;
    });
    return {
      label: weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      avgScore: week.length
        ? Math.round(week.reduce((a, s) => a + s.averageScore, 0) / week.length)
        : 0,
      totalReps: week.reduce((a, s) => a + s.repCount, 0),
      count: week.length,
    };
  }).reverse();
}

function getChartBars(sessions: CompletedSession[], period: Period): BarData[] {
  if (period === '7d') return dailyBars(sessions, 7);
  if (period === '30d') return weeklyBars(sessions, 4);
  return weeklyBars(sessions, 12);
}

function calcMuscleIntensity(sessions: CompletedSession[]): MuscleIntensities {
  const raw: Record<string, number> = {};
  for (const session of sessions) {
    const exercise = EXERCISES.find(e => e.id === session.exerciseId);
    if (!exercise) continue;
    for (const group of exercise.primaryMuscles) {
      for (const id of MuscleMap[group] ?? []) raw[id] = (raw[id] ?? 0) + session.repCount;
    }
    for (const group of exercise.secondaryMuscles) {
      for (const id of MuscleMap[group] ?? []) raw[id] = (raw[id] ?? 0) + session.repCount * 0.4;
    }
  }
  const max = Math.max(...Object.values(raw), 1);
  return Object.fromEntries(Object.entries(raw).map(([id, v]) => [id, v / max]));
}

function formatDuration(seconds: number, t: (k: string) => string): string {
  const m = Math.floor(seconds / 60);
  return m > 0 ? `${m}${t('common.min')}` : `${seconds}${t('common.sec')}`;
}

function scoreColor(score: number): string {
  if (score >= 80) return '#10b981';
  if (score >= 60) return '#f59e0b';
  return '#ef4444';
}

// ─── shared UI ────────────────────────────────────────────────────────────────

function SectionLabel({ children, mb = 'mb-3' }: { children: ReactNode; mb?: string }) {
  return (
    <p className={`text-xs font-semibold text-muted-foreground uppercase tracking-wider ${mb}`}>
      {children}
    </p>
  );
}

function StatCard({ label, value, color }: { label: string; value: ReactNode; color: string }) {
  return (
    <div className="flex flex-col items-center justify-center bg-card border border-border rounded-2xl p-4 gap-1">
      <span className={`text-2xl font-bold ${color}`}>{value}</span>
      <span className="text-xs text-muted-foreground text-center leading-tight">{label}</span>
    </div>
  );
}

function PeriodSelector({ period, onChange }: { period: Period; onChange: (p: Period) => void }) {
  const { t } = useTranslation();
  const options: { key: Period; label: string }[] = [
    { key: '7d', label: t('progress.period.week') },
    { key: '30d', label: t('progress.period.month') },
    { key: 'all', label: t('progress.period.all') },
  ];
  return (
    <div className="flex bg-muted rounded-xl p-1 mb-5">
      {options.map(({ key, label }) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            period === key
              ? 'bg-card text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

// ─── ActivityCalendar ─────────────────────────────────────────────────────────

function ActivityCalendar({ sessions }: { sessions: CompletedSession[] }) {
  const { t } = useTranslation();

  const countMap = useMemo(() => {
    const map: Record<string, number> = {};
    sessions.forEach(s => {
      const key = new Date(s.date).toLocaleDateString('en-CA');
      map[key] = (map[key] ?? 0) + 1;
    });
    return map;
  }, [sessions]);

  const today = new Date();
  const todayKey = today.toLocaleDateString('en-CA');
  const dayOfWeek = (today.getDay() + 6) % 7; // 0=Mon

  function cellBg(count: number): string | undefined {
    if (count === 0) return undefined;
    if (count === 1) return '#10b98140';
    if (count === 2) return '#10b98170';
    return '#10b981';
  }

  return (
    <div>
      <div className="flex items-center gap-1.5 mb-3">
        <CalendarIcon size={13} className="text-muted-foreground" />
        <SectionLabel mb="mb-0">{t('progress.calendar.title')}</SectionLabel>
      </div>
      <div className="flex gap-1">
        <div className="flex flex-col gap-1 mr-0.5">
          {['M', '', 'W', '', 'F', '', ''].map((lbl, i) => (
            <div key={i} className="h-3 w-3 flex items-center justify-end">
              <span className="text-[8px] text-muted-foreground leading-none">{lbl}</span>
            </div>
          ))}
        </div>
        {Array.from({ length: 14 }, (_, w) => (
          <div key={w} className="flex flex-col gap-1">
            {Array.from({ length: 7 }, (_, d) => {
              const daysAgo = (13 - w) * 7 + (dayOfWeek - d);
              if (daysAgo < 0) return <div key={d} className="h-3 w-3" />;
              const date = new Date(today);
              date.setDate(date.getDate() - daysAgo);
              const key = date.toLocaleDateString('en-CA');
              const count = countMap[key] ?? 0;
              const bg = cellBg(count);
              return (
                <div
                  key={d}
                  className={`h-3 w-3 rounded-sm ${!bg ? 'bg-muted/60' : ''} ${key === todayKey ? 'ring-1 ring-emerald-500' : ''}`}
                  style={bg ? { backgroundColor: bg } : undefined}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── MuscleHeatmap ────────────────────────────────────────────────────────────

const Legend: { labelKey: string; bg: string }[] = [
  { labelKey: 'progress.muscles.none', bg: 'rgba(128,128,128,0.18)' },
  { labelKey: 'progress.muscles.low', bg: '#10b98140' },
  { labelKey: 'progress.muscles.med', bg: '#10b98175' },
  { labelKey: 'progress.muscles.high', bg: '#10b981' },
];

function MuscleHeatmap({ sessions }: { sessions: CompletedSession[] }) {
  const { t } = useTranslation();
  const intensities = useMemo(() => calcMuscleIntensity(sessions), [sessions]);

  return (
    <div>
      <SectionLabel>{t('progress.muscles.title')}</SectionLabel>
      {sessions.length === 0 ? (
        <p className="text-xs text-muted-foreground text-center py-4">
          {t('progress.muscles.empty')}
        </p>
      ) : (
        <>
          <div className="flex gap-3">
            <div className="flex-1 flex flex-col items-center">
              <span className="text-xs text-muted-foreground mb-1">
                {t('progress.muscles.front')}
              </span>
              <BodyFrontIcon intensities={intensities} />
            </div>
            <div className="flex-1 flex flex-col items-center">
              <span className="text-xs text-muted-foreground mb-1">
                {t('progress.muscles.back')}
              </span>
              <BodyBackIcon intensities={intensities} />
            </div>
          </div>
          <div className="flex items-center gap-3 justify-center mt-3">
            {Legend.map(({ labelKey, bg }) => (
              <div key={labelKey} className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: bg }} />
                <span className="text-xs text-muted-foreground">{t(labelKey)}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Charts ───────────────────────────────────────────────────────────────────

const CHART_W = 300;
const CHART_PAD_LR = { left: 28, right: 8 };

type BarChartProps = {
  title: string;
  data: BarData[];
  height?: number;
  padTop?: number;
  padBottom?: number;
  getValue: (d: BarData) => number;
  maxValue: number;
  getColor: (d: BarData) => string;
  getOpacity: (d: BarData) => number;
  showValueLabel: (d: BarData) => boolean;
  formatValue: (d: BarData) => string | number;
  gridPcts: number[];
  formatGridLabel: (pct: number) => string | number;
};

function BarChart({
  title,
  data,
  height = 100,
  padTop = 8,
  padBottom = 22,
  getValue,
  maxValue,
  getColor,
  getOpacity,
  showValueLabel,
  formatValue,
  gridPcts,
  formatGridLabel,
}: BarChartProps) {
  const n = data.length;
  const innerW = CHART_W - CHART_PAD_LR.left - CHART_PAD_LR.right;
  const innerH = height - padTop - padBottom;
  const barW = Math.max(4, Math.floor(innerW / n) - (n > 7 ? 2 : 4));

  return (
    <div>
      <SectionLabel mb="mb-2">{title}</SectionLabel>
      <svg viewBox={`0 0 ${CHART_W} ${height}`} className="w-full">
        {gridPcts.map(pct => {
          const y = padTop + innerH * (1 - pct / 100);
          return (
            <g key={pct}>
              <line
                x1={CHART_PAD_LR.left}
                y1={y}
                x2={CHART_W - CHART_PAD_LR.right}
                y2={y}
                stroke="currentColor"
                strokeOpacity="0.06"
                strokeWidth="1"
              />
              <text
                x={CHART_PAD_LR.left - 3}
                y={y + 4}
                textAnchor="end"
                fontSize="8"
                fill="currentColor"
                opacity="0.35"
              >
                {formatGridLabel(pct)}
              </text>
            </g>
          );
        })}
        {data.map((d, i) => {
          const value = getValue(d);
          const x = CHART_PAD_LR.left + i * (innerW / n) + (innerW / n - barW) / 2;
          const barH = value > 0 ? innerH * (value / maxValue) : 2;
          const y = padTop + innerH - barH;
          const color = getColor(d);
          return (
            <g key={i}>
              <rect
                x={x}
                y={y}
                width={barW}
                height={barH}
                rx="3"
                fill={color}
                opacity={getOpacity(d)}
              />
              {showValueLabel(d) && (
                <text
                  x={x + barW / 2}
                  y={y - 2}
                  textAnchor="middle"
                  fontSize="7.5"
                  fill={color}
                  fontWeight="600"
                >
                  {formatValue(d)}
                </text>
              )}
              {n <= 8 && (
                <text
                  x={x + barW / 2}
                  y={height - 3}
                  textAnchor="middle"
                  fontSize="7.5"
                  fill="currentColor"
                  opacity="0.45"
                >
                  {d.label}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function ScoreBarChart({ data }: { data: BarData[] }) {
  const { t } = useTranslation();
  return (
    <BarChart
      title={t('progress.chart.weeklyScore')}
      data={data}
      height={120}
      padTop={10}
      padBottom={26}
      getValue={d => d.avgScore}
      maxValue={100}
      getColor={d => (d.count > 0 ? scoreColor(d.avgScore) : 'currentColor')}
      getOpacity={d => (d.count > 0 ? 1 : 0.08)}
      showValueLabel={d => d.count > 0 && d.avgScore > 0}
      formatValue={d => d.avgScore}
      gridPcts={[25, 50, 75, 100]}
      formatGridLabel={pct => pct}
    />
  );
}

function VolumeBarChart({ data }: { data: BarData[] }) {
  const { t } = useTranslation();
  const maxReps = Math.max(...data.map(d => d.totalReps), 1);
  return (
    <BarChart
      title={t('progress.chart.weeklyVolume')}
      data={data}
      getValue={d => d.totalReps}
      maxValue={maxReps}
      getColor={() => '#10b981'}
      getOpacity={d => (d.totalReps > 0 ? 0.85 : 0.07)}
      showValueLabel={d => d.totalReps > 0}
      formatValue={d => d.totalReps}
      gridPcts={[25, 50, 75, 100]}
      formatGridLabel={pct => Math.round((maxReps * pct) / 100)}
    />
  );
}

function ScoreTrend({ sessions }: { sessions: CompletedSession[] }) {
  const { t } = useTranslation();
  const recent = [...sessions].reverse().slice(0, 20);
  if (recent.length < 2) return null;

  const W = 300,
    H = 72,
    PAD = { top: 10, bottom: 4, left: 4, right: 4 };
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;

  const points = recent.map((s, i) => {
    const x = PAD.left + (i / (recent.length - 1)) * innerW;
    const y = PAD.top + innerH * (1 - s.averageScore / 100);
    return `${x},${y}`;
  });
  const first = points[0].split(',');
  const last = points[points.length - 1].split(',');
  const area = `M${first[0]},${H} L${points.join(' L')} L${last[0]},${H} Z`;
  const lastScore = recent[recent.length - 1].averageScore;
  const trend = recent.length >= 5 ? lastScore - recent[0].averageScore : 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <SectionLabel mb="mb-0">{t('progress.chart.scoreTrend')}</SectionLabel>
        {trend !== 0 && (
          <span className={`text-xs font-bold ${trend > 0 ? 'text-emerald-500' : 'text-red-400'}`}>
            {trend > 0 ? '↑' : '↓'} {Math.abs(Math.round(trend))}pts
          </span>
        )}
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <defs>
          <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[50, 80].map(pct => {
          const y = PAD.top + innerH * (1 - pct / 100);
          return (
            <g key={pct}>
              <line
                x1={PAD.left}
                y1={y}
                x2={W - PAD.right}
                y2={y}
                stroke="currentColor"
                strokeOpacity="0.06"
                strokeWidth="1"
                strokeDasharray="3 3"
              />
              <text x={2} y={y - 2} fontSize="8" fill="currentColor" opacity="0.3">
                {pct}
              </text>
            </g>
          );
        })}
        <path d={area} fill="url(#trendGrad)" />
        <polyline
          points={points.join(' ')}
          fill="none"
          stroke="#10b981"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {(() => {
          const [lx, ly] = (points[points.length - 1] ?? '0,0').split(',');
          return <circle cx={lx} cy={ly} r="3" fill={scoreColor(lastScore)} />;
        })()}
      </svg>
    </div>
  );
}

// ─── main ─────────────────────────────────────────────────────────────────────

export default function Progress() {
  const { t } = useTranslation();
  const { sessions, getSummary, getExercisePersonalBest } = useProgressStore();
  const [period, setPeriod] = useState<Period>('7d');

  const filtered = useMemo(() => filterByPeriod(sessions, period), [sessions, period]);
  const bars = useMemo(() => getChartBars(filtered, period), [filtered, period]);
  const fullSummary = getSummary();

  const periodStats = useMemo(
    () => ({
      totalSessions: filtered.length,
      totalReps: filtered.reduce((a, s) => a + s.repCount, 0),
      averageScore: filtered.length
        ? Math.round(filtered.reduce((a, s) => a + s.averageScore, 0) / filtered.length)
        : 0,
    }),
    [filtered]
  );

  const hasData = sessions.length > 0;
  const hasPeriodData = filtered.length > 0;
  const exercisesWithSessions = EXERCISES.filter(ex => sessions.some(s => s.exerciseId === ex.id));

  return (
    <div className="px-4 py-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-foreground mb-5">{t('progress.title')}</h1>

      <PeriodSelector period={period} onChange={setPeriod} />

      <div className="grid grid-cols-2 gap-3 mb-6">
        <StatCard
          label={t('progress.summary.sessions')}
          value={periodStats.totalSessions}
          color="text-emerald-500"
        />
        <StatCard
          label={t('progress.summary.streak')}
          value={
            <span className="flex items-center gap-1">
              {fullSummary.currentStreak}
              <FlameIcon size={18} />
            </span>
          }
          color="text-orange-500"
        />
        <StatCard
          label={t('progress.summary.reps')}
          value={periodStats.totalReps}
          color="text-blue-500"
        />
        <StatCard
          label={t('progress.summary.avgScore')}
          value={`${periodStats.averageScore}%`}
          color={periodStats.averageScore >= 80 ? 'text-emerald-500' : 'text-yellow-500'}
        />
      </div>

      <div className="bg-card border border-border rounded-2xl p-4 mb-6">
        <ActivityCalendar sessions={sessions} />
      </div>

      {hasPeriodData && (
        <div className="bg-card border border-border rounded-2xl p-4 mb-6 flex flex-col gap-6">
          <ScoreTrend sessions={sessions} />
          <ScoreBarChart data={bars} />
          <VolumeBarChart data={bars} />
        </div>
      )}

      <div className="bg-card border border-border rounded-2xl p-4 mb-6">
        <MuscleHeatmap sessions={filtered} />
      </div>

      {exercisesWithSessions.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-1.5 mb-3">
            <TrophyIcon size={14} className="text-muted-foreground" />
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              {t('progress.personalBests')}
            </h2>
          </div>
          <div className="flex flex-col gap-2">
            {exercisesWithSessions.map(ex => {
              const best = getExercisePersonalBest(ex.id);
              if (!best) return null;
              return (
                <div
                  key={ex.id}
                  className="flex items-center gap-3 p-3 bg-card border border-border rounded-xl"
                >
                  <span className="text-2xl">{ex.thumbnailEmoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{t(ex.nameKey)}</p>
                    <p className="text-xs text-muted-foreground">
                      {best.repCount} {t('progress.session.reps')} ·{' '}
                      {formatDuration(best.durationSeconds, t)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-sm font-bold ${best.averageScore >= 80 ? 'text-emerald-500' : 'text-yellow-500'}`}
                    >
                      {best.averageScore}%
                    </p>
                    <p className="text-xs text-muted-foreground">{t('progress.session.score')}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {hasData ? (
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            {t('progress.history')}
          </h2>
          <div className="flex flex-col gap-2">
            {sessions.map(session => {
              const ex = EXERCISES.find(e => e.id === session.exerciseId);
              const date = new Date(session.date).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
              });
              return (
                <div
                  key={session.id}
                  className="flex items-center gap-3 p-3 bg-card border border-border rounded-xl"
                >
                  <span className="text-xl">{ex?.thumbnailEmoji ?? '🏋️'}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {ex ? t(ex.nameKey) : session.exerciseId}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {date} · {session.repCount} {t('progress.session.reps')} ·{' '}
                      {formatDuration(session.durationSeconds, t)}
                    </p>
                  </div>
                  <span
                    className={`text-sm font-bold ${session.averageScore >= 80 ? 'text-emerald-500' : 'text-yellow-500'}`}
                  >
                    {session.averageScore}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="text-center py-16">
          <TrendingUpIcon size={48} className="mx-auto mb-3 text-muted-foreground/40" />
          <p className="text-muted-foreground">{t('progress.noSessions')}</p>
        </div>
      )}
    </div>
  );
}
