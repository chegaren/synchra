export function SynchraIcon({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="15" stroke="url(#sg)" strokeWidth="1.5" />
      <circle cx="10" cy="16" r="5" stroke="#7eb3ff" strokeWidth="1.5" opacity="0.7" />
      <circle cx="22" cy="16" r="5" stroke="#b48aff" strokeWidth="1.5" opacity="0.7" />
      <ellipse cx="16" cy="16" rx="2" ry="5" fill="url(#sg2)" opacity="0.9" />
      <defs>
        <linearGradient id="sg" x1="1" y1="1" x2="31" y2="31" gradientUnits="userSpaceOnUse">
          <stop stopColor="#7eb3ff" />
          <stop offset="1" stopColor="#b48aff" />
        </linearGradient>
        <linearGradient id="sg2" x1="16" y1="11" x2="16" y2="21" gradientUnits="userSpaceOnUse">
          <stop stopColor="#7eb3ff" />
          <stop offset="1" stopColor="#b48aff" />
        </linearGradient>
      </defs>
    </svg>
  );
}
