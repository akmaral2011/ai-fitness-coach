type IconProps = { size?: number; className?: string };

export default function DumbbellIcon({ size = 20, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M6 5v14" />
      <path d="M18 5v14" />
      <path d="M2 9h4" />
      <path d="M2 15h4" />
      <path d="M18 9h4" />
      <path d="M18 15h4" />
      <path d="M6 9h12" />
      <path d="M6 15h12" />
    </svg>
  );
}
