type IconProps = { size?: number; className?: string };

export default function ListIcon({ size = 20, className }: IconProps) {
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
      <rect x="3" y="5" width="6" height="6" rx="1" />
      <rect x="3" y="13" width="6" height="6" rx="1" />
      <path d="M13 6h8M13 14h8M13 10h5M13 18h5" />
    </svg>
  );
}
