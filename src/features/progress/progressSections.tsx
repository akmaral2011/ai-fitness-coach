import { type ReactNode, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import BodyBackIcon from '@/components/icons/BodyBackIcon';
import BodyFrontIcon from '@/components/icons/BodyFrontIcon';
import CalendarIcon from '@/components/icons/CalendarIcon';
import FlameIcon from '@/components/icons/FlameIcon';
import TrendingUpIcon from '@/components/icons/TrendingUpIcon';
import TrophyIcon from '@/components/icons/TrophyIcon';
import { EXERCISES } from '@/features/exercises/data';
import {
  type BarData,
  type MuscleIntensities,
  type Period,
  calcMuscleIntensity,
  scoreColor,
} from '@/features/progress/progressHelpers';
import type { CompletedSession } from '@/features/workout/types';
import { formatDuration } from '@/lib/utils';

function SectionLabel({ children, mb = 'mb-3' }: { children: ReactNode; mb?: string }) {
  return (
    <p className={`text-xs font-semibold text-muted-foreground uppercase tracking-wider ${mb}`}>
      {children}
    </p>
  );
}

export function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: ReactNode;
  color: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center bg-card border border-border rounded-2xl p-4 gap-1">
      <span className={`text-2xl font-bold ${color}`}>{value}</span>
      <span className="text-xs text-muted-foreground text-center leading-tight">{label}</span>
    </div>
  );
}

export function StreakValue({ streak }: { streak: number }) {
  return (
    <span className="flex items-center gap-1">
      {streak}
      <FlameIcon size={18} />
    </span>
  );
}

export function PeriodSelector({
  period,
  onChange,
}: {
  period: Period;
  onChange: (period: Period) => void;
}) {
  const { t } = useTranslation();
  const options: Array<{ key: Period; label: string }> = [
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

export function ActivityCalendar({ sessions }: { sessions: CompletedSession[] }) {
  const { t } = useTranslation();

  const countMap = useMemo(() => {
    const map: Record<string, number> = {};
    sessions.forEach(session => {
      const key = new Date(session.date).toLocaleDateString('en-CA');
      map[key] = (map[key] ?? 0) + 1;
    });
    return map;
  }, [sessions]);

  const today = new Date();
  const todayKey = today.toLocaleDateString('en-CA');
  const dayOfWeek = (today.getDay() + 6) % 7;

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
          {['M', '', 'W', '', 'F', '', ''].map((label, index) => (
            <div key={index} className="h-3 w-3 flex items-center justify-end">
              <span className="text-[8px] text-muted-foreground leading-none">{label}</span>
            </div>
          ))}
        </div>
        {Array.from({ length: 14 }, (_, weekIndex) => (
          <div key={weekIndex} className="flex flex-col gap-1">
            {Array.from({ length: 7 }, (_, dayIndex) => {
              const daysAgo = (13 - weekIndex) * 7 + (dayOfWeek - dayIndex);
              if (daysAgo < 0) return <div key={dayIndex} className="h-3 w-3" />;

              const date = new Date(today);
              date.setDate(date.getDate() - daysAgo);
              const key = date.toLocaleDateString('en-CA');
              const count = countMap[key] ?? 0;
              const backgroundColor = cellBg(count);

              return (
                <div
                  key={dayIndex}
                  className={`h-3 w-3 rounded-sm ${!backgroundColor ? 'bg-muted/60' : ''} ${key === todayKey ? 'ring-1 ring-emerald-500' : ''}`}
                  style={backgroundColor ? { backgroundColor } : undefined}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

const legend: Array<{ labelKey: string; bg: string }> = [
  { labelKey: 'progress.muscles.none', bg: 'rgba(128,128,128,0.18)' },
  { labelKey: 'progress.muscles.low', bg: '#10b98140' },
  { labelKey: 'progress.muscles.med', bg: '#10b98175' },
  { labelKey: 'progress.muscles.high', bg: '#10b981' },
];

export function MuscleHeatmap({ sessions }: { sessions: CompletedSession[] }) {
  const { t } = useTranslation();
  const intensities = useMemo<MuscleIntensities>(() => calcMuscleIntensity(sessions), [sessions]);

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
            {legend.map(({ labelKey, bg }) => (
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

const CHART_W = 300;
const CHART_PAD_LR = { left: 28, right: 8 };

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
}: {
  title: string;
  data: BarData[];
  height?: number;
  padTop?: number;
  padBottom?: number;
  getValue: (data: BarData) => number;
  maxValue: number;
  getColor: (data: BarData) => string;
  getOpacity: (data: BarData) => number;
  showValueLabel: (data: BarData) => boolean;
  formatValue: (data: BarData) => string | number;
  gridPcts: number[];
  formatGridLabel: (percent: number) => string | number;
}) {
  const count = data.length;
  const innerWidth = CHART_W - CHART_PAD_LR.left - CHART_PAD_LR.right;
  const innerHeight = height - padTop - padBottom;
  const barWidth = Math.max(4, Math.floor(innerWidth / count) - (count > 7 ? 2 : 4));

  return (
    <div>
      <SectionLabel mb="mb-2">{title}</SectionLabel>
      <svg viewBox={`0 0 ${CHART_W} ${height}`} className="w-full">
        {gridPcts.map(percent => {
          const y = padTop + innerHeight * (1 - percent / 100);
          return (
            <g key={percent}>
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
                {formatGridLabel(percent)}
              </text>
            </g>
          );
        })}
        {data.map((item, index) => {
          const value = getValue(item);
          const x =
            CHART_PAD_LR.left + index * (innerWidth / count) + (innerWidth / count - barWidth) / 2;
          const barHeight = value > 0 ? innerHeight * (value / maxValue) : 2;
          const y = padTop + innerHeight - barHeight;
          const color = getColor(item);

          return (
            <g key={index}>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                rx="3"
                fill={color}
                opacity={getOpacity(item)}
              />
              {showValueLabel(item) && (
                <text
                  x={x + barWidth / 2}
                  y={y - 2}
                  textAnchor="middle"
                  fontSize="7.5"
                  fill={color}
                  fontWeight="600"
                >
                  {formatValue(item)}
                </text>
              )}
              {count <= 8 && (
                <text
                  x={x + barWidth / 2}
                  y={height - 3}
                  textAnchor="middle"
                  fontSize="7.5"
                  fill="currentColor"
                  opacity="0.45"
                >
                  {item.label}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export function ScoreBarChart({ data }: { data: BarData[] }) {
  const { t } = useTranslation();
  return (
    <BarChart
      title={t('progress.chart.weeklyScore')}
      data={data}
      height={120}
      padTop={10}
      padBottom={26}
      getValue={item => item.avgScore}
      maxValue={100}
      getColor={item => (item.count > 0 ? scoreColor(item.avgScore) : 'currentColor')}
      getOpacity={item => (item.count > 0 ? 1 : 0.08)}
      showValueLabel={item => item.count > 0 && item.avgScore > 0}
      formatValue={item => item.avgScore}
      gridPcts={[25, 50, 75, 100]}
      formatGridLabel={percent => percent}
    />
  );
}

export function VolumeBarChart({ data }: { data: BarData[] }) {
  const { t } = useTranslation();
  const maxReps = Math.max(...data.map(item => item.totalReps), 1);

  return (
    <BarChart
      title={t('progress.chart.weeklyVolume')}
      data={data}
      getValue={item => item.totalReps}
      maxValue={maxReps}
      getColor={() => '#10b981'}
      getOpacity={item => (item.totalReps > 0 ? 0.85 : 0.07)}
      showValueLabel={item => item.totalReps > 0}
      formatValue={item => item.totalReps}
      gridPcts={[25, 50, 75, 100]}
      formatGridLabel={percent => Math.round((maxReps * percent) / 100)}
    />
  );
}

export function ScoreTrend({ sessions }: { sessions: CompletedSession[] }) {
  const { t } = useTranslation();
  const recent = [...sessions].reverse().slice(0, 20);
  if (recent.length < 2) return null;

  const width = 300;
  const height = 72;
  const pad = { top: 10, bottom: 4, left: 4, right: 4 };
  const innerWidth = width - pad.left - pad.right;
  const innerHeight = height - pad.top - pad.bottom;

  const points = recent.map((session, index) => {
    const x = pad.left + (index / (recent.length - 1)) * innerWidth;
    const y = pad.top + innerHeight * (1 - session.averageScore / 100);
    return `${x},${y}`;
  });

  const first = points[0].split(',');
  const last = points[points.length - 1].split(',');
  const area = `M${first[0]},${height} L${points.join(' L')} L${last[0]},${height} Z`;
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
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full">
        <defs>
          <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[50, 80].map(percent => {
          const y = pad.top + innerHeight * (1 - percent / 100);
          return (
            <g key={percent}>
              <line
                x1={pad.left}
                y1={y}
                x2={width - pad.right}
                y2={y}
                stroke="currentColor"
                strokeOpacity="0.06"
                strokeWidth="1"
                strokeDasharray="3 3"
              />
              <text x={2} y={y - 2} fontSize="8" fill="currentColor" opacity="0.3">
                {percent}
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
          const [lastX, lastY] = (points[points.length - 1] ?? '0,0').split(',');
          return <circle cx={lastX} cy={lastY} r="3" fill={scoreColor(lastScore)} />;
        })()}
      </svg>
    </div>
  );
}

export function PersonalBests({
  exerciseIds,
  getExercisePersonalBest,
}: {
  exerciseIds: string[];
  getExercisePersonalBest: (exerciseId: string) => CompletedSession | null;
}) {
  const { t } = useTranslation();
  if (exerciseIds.length === 0) return null;

  return (
    <div className="mb-6">
      <div className="flex items-center gap-1.5 mb-3">
        <TrophyIcon size={14} className="text-muted-foreground" />
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          {t('progress.personalBests')}
        </h2>
      </div>
      <div className="flex flex-col gap-2">
        {exerciseIds.map(exerciseId => {
          const exercise = EXERCISES.find(item => item.id === exerciseId);
          const best = getExercisePersonalBest(exerciseId);
          if (!exercise || !best) return null;

          return (
            <div
              key={exerciseId}
              className="flex items-center gap-3 p-3 bg-card border border-border rounded-xl"
            >
              <span className="text-2xl">{exercise.thumbnailEmoji}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{t(exercise.nameKey)}</p>
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
  );
}

export function SessionHistory({ sessions }: { sessions: CompletedSession[] }) {
  const { t } = useTranslation();

  return (
    <div>
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
        {t('progress.history')}
      </h2>
      <div className="flex flex-col gap-2">
        {sessions.map(session => {
          const exercise = EXERCISES.find(item => item.id === session.exerciseId);
          const date = new Date(session.date).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
          });

          return (
            <div
              key={session.id}
              className="flex items-center gap-3 p-3 bg-card border border-border rounded-xl"
            >
              <span className="text-xl">{exercise?.thumbnailEmoji ?? '🏋️'}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {exercise ? t(exercise.nameKey) : session.exerciseId}
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
  );
}

export function EmptyProgressState() {
  const { t } = useTranslation();

  return (
    <div className="text-center py-16">
      <TrendingUpIcon size={48} className="mx-auto mb-3 text-muted-foreground/40" />
      <p className="text-muted-foreground">{t('progress.noSessions')}</p>
    </div>
  );
}
