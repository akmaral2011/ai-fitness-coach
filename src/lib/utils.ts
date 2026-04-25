import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDuration(seconds: number, t: (k: string) => string): string {
  const m = Math.floor(seconds / 60);
  return m > 0 ? `${m}${t('common.min')}` : `${seconds}${t('common.sec')}`;
}
