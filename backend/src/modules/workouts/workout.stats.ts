export const XP_PER_LEVEL = 300;

export function dayKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function calculateCurrentStreak(dates: Date[]) {
  if (dates.length === 0) return 0;

  const uniqueDays = [...new Set(dates.map(dayKey))].sort((a, b) => b.localeCompare(a));
  const today = dayKey(new Date());
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterday = dayKey(yesterdayDate);

  if (uniqueDays[0] !== today && uniqueDays[0] !== yesterday) return 0;

  let streak = 1;
  for (let index = 1; index < uniqueDays.length; index += 1) {
    const previousDate = new Date(`${uniqueDays[index - 1]}T00:00:00.000Z`);
    previousDate.setDate(previousDate.getDate() - 1);
    const expected = dayKey(previousDate);
    if (uniqueDays[index] !== expected) break;
    streak += 1;
  }

  return streak;
}

export function sessionXP(session: { repCount: number; averageScore: number }) {
  return session.repCount * 2 + Math.round(session.averageScore / 5);
}

export function xpData(totalXP: number) {
  const xpInCurrentLevel = totalXP % XP_PER_LEVEL;

  return {
    totalXP,
    level: Math.floor(totalXP / XP_PER_LEVEL) + 1,
    xpInCurrentLevel,
    xpPerLevel: XP_PER_LEVEL,
    progressPercent: Math.round((xpInCurrentLevel / XP_PER_LEVEL) * 100),
  };
}
