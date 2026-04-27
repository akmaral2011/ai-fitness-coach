import { useState } from 'react';

function getLetter(name: string): string {
  return name.trim()[0]?.toUpperCase() ?? '?';
}

type Props = {
  picture?: string;
  name?: string;
  className?: string;
  textClassName?: string;
};

export default function UserAvatar({
  picture,
  name,
  className = 'w-8 h-8',
  textClassName = 'text-sm',
}: Props) {
  const [imgError, setImgError] = useState(false);

  if (picture && !imgError) {
    return (
      <img
        src={picture}
        alt={name ?? ''}
        className={`${className} rounded-full object-cover`}
        onError={() => setImgError(true)}
      />
    );
  }

  return (
    <div className={`${className} rounded-full bg-emerald-500 flex items-center justify-center`}>
      <span className={`${textClassName} font-bold text-white`}>
        {name ? getLetter(name) : '?'}
      </span>
    </div>
  );
}
