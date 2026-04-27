import type { ReactNode } from 'react';

type Variant = 'emerald' | 'red';

const VARIANT: Record<Variant, string> = {
  emerald: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400',
  red: 'bg-red-500/10 border-red-500/20 text-red-500',
};

type Props = {
  children: ReactNode;
  variant?: Variant;
  className?: string;
};

export default function SectionBadge({ children, variant = 'emerald', className = 'mb-4' }: Props) {
  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium ${VARIANT[variant]} ${className}`}
    >
      {children}
    </div>
  );
}
