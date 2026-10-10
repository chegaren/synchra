interface AvatarProps {
  src: string | null;
  username: string;
  size?: number;
  className?: string;
}

const AVATAR_COLORS = [
  ['#E4F2F2', '#0c1a1a'],
  ['#b0d4d4', '#0c1a1a'],
  ['#8ec5c5', '#0c1a1a'],
  ['#c8e6e6', '#0c1a1a'],
  ['#a6d0d0', '#0c1a1a'],
];

function colorFor(username: string) {
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = (hash * 31 + username.charCodeAt(i)) | 0;
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export function Avatar({ src, username, size = 40, className = '' }: AvatarProps) {
  const [bg, text] = colorFor(username);
  const initials = username.slice(0, 2).toUpperCase();

  if (src) {
    return (
      <img
        src={src}
        alt={username}
        className={`rounded-full object-cover flex-shrink-0 ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <div
      className={`rounded-full flex items-center justify-center flex-shrink-0 font-semibold select-none ${className}`}
      style={{
        width: size,
        height: size,
        background: bg,
        color: text,
        fontSize: size * 0.35,
        fontFamily: "'Space Grotesk', sans-serif",
      }}
    >
      {initials}
    </div>
  );
}
