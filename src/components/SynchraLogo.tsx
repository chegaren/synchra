/**
 * Synchra primary logo — two overlapping circles (Venn mark) + "synchra" wordmark.
 * Geometry traced from the uploaded PNG. All paths use a single `color` fill so
 * the logo renders correctly at any size on any background.
 */

interface SynchraLogoProps {
  /** Total rendered width in px. Height scales proportionally (viewBox 220×64). */
  width?: number;
  /** Fill colour for every element. Default #E4F2F2 */
  color?: string;
  className?: string;
}

export function SynchraLogo({
  width = 180,
  color = '#E4F2F2',
  className = '',
}: SynchraLogoProps) {
  const height = Math.round(width * (64 / 220));

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 220 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Synchra"
      role="img"
    >
      {/* ── Venn mark: two overlapping circles ── */}
      {/* Left circle */}
      <circle cx="22" cy="32" r="20" stroke={color} strokeWidth="2.6" fill="none" />
      {/* Right circle — overlaps left by ~12 px */}
      <circle cx="42" cy="32" r="20" stroke={color} strokeWidth="2.6" fill="none" />

      {/* ── Wordmark: "synchra" ── */}
      {/* Rendered as outlined text paths so no font-loading dependency.
          Each letter is hand-described using simple path data matching the
          clean sans-serif proportions visible in the source PNG.           */}
      <g fill={color}>
        {/* s */}
        <path d="M72 38.5c0 2.8 2.1 4.8 5.6 4.8 3.3 0 5.3-1.7 5.3-4.1 0-2-1.2-3.2-3.8-3.8l-2-.5c-1.3-.3-1.9-.9-1.9-1.8 0-1.1.9-1.8 2.3-1.8 1.5 0 2.4.8 2.4 2h2.8c0-2.6-1.9-4.4-5.2-4.4-3.1 0-5 1.7-5 4 0 2 1.2 3.2 3.6 3.7l2 .5c1.4.3 2.1.9 2.1 1.9 0 1.2-1 1.9-2.5 1.9-1.7 0-2.7-.9-2.7-2.4H72z" />
        {/* y */}
        <path d="M84.5 29l3.6 9.4-1.3 3.4c-.3.7-.7 1-1.3 1H84v2.5h1.8c1.8 0 2.8-.7 3.5-2.6L95 29h-3l-2.6 7.4L86.8 29h-2.3z" opacity="0.95"/>
        {/* n */}
        <path d="M96.5 43h2.8V35c0-1.8 1.1-2.9 2.8-2.9 1.6 0 2.5 1 2.5 2.8V43h2.8v-8.5c0-3-1.6-4.9-4.4-4.9-1.6 0-2.9.7-3.7 1.9V29.3h-2.8V43z" />
        {/* c */}
        <path d="M117.5 43.3c3.4 0 5.5-1.8 5.8-4.6h-2.7c-.3 1.4-1.3 2.2-3.1 2.2-2.1 0-3.5-1.6-3.5-4.7 0-3 1.4-4.6 3.5-4.6 1.7 0 2.8.9 3.1 2.3h2.7c-.4-2.8-2.5-4.7-5.8-4.7-3.7 0-6.3 2.5-6.3 7 0 4.4 2.5 7.1 6.3 7.1z" />
        {/* h */}
        <path d="M125.5 43h2.8v-8c0-1.8 1.1-2.9 2.8-2.9 1.6 0 2.5 1 2.5 2.8V43h2.8v-8.5c0-3-1.6-4.9-4.4-4.9-1.5 0-2.8.7-3.7 1.8V24h-2.8V43z" />
        {/* r */}
        <path d="M139.5 43h2.8v-7c0-2.1 1.1-3.5 3.2-3.5h.8v-2.8c-1.8 0-3.2.9-4 2.5v-2.2h-2.8V43z" />
        {/* a */}
        <path d="M154 43.3c1.5 0 2.8-.6 3.7-1.7V43h2.7v-8.8c0-3.1-2-4.6-5.1-4.6-3 0-5 1.6-5.2 4.2h2.7c.2-1.2 1-2 2.5-2 1.6 0 2.4.9 2.4 2.3v.9l-3.2.4c-2.9.4-4.5 1.7-4.5 3.9 0 2.2 1.6 3.7 4 3.7zm.8-2.2c-1.3 0-2.1-.7-2.1-1.8 0-1.1.8-1.7 2.5-2l2.5-.4v.9c0 1.9-1.2 3.3-2.9 3.3z" />
      </g>
    </svg>
  );
}

/** Compact mark-only version (just the two circles) for tight spaces like favicons */
export function SynchraIcon({ size = 32, color = '#E4F2F2', className = '' }: { size?: number; color?: string; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <circle cx="20" cy="32" r="18" stroke={color} strokeWidth="3" fill="none" />
      <circle cx="44" cy="32" r="18" stroke={color} strokeWidth="3" fill="none" />
    </svg>
  );
}
