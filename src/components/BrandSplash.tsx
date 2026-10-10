import { motion } from 'framer-motion';
import { SynchraLogo } from './SynchraLogo';

interface BrandSplashProps {
  onEnter: () => void;
}

export function BrandSplash({ onEnter }: BrandSplashProps) {
  return (
    <motion.div
      className="fixed inset-0 z-[999] flex flex-col items-center justify-center"
      style={{
        /* Deep neutral charcoal — allows #E4F2F2 to read clearly */
        background: '#0c0f14',
        /* Layered radial gradients: cold top-left, faint warm bottom-right */
        backgroundImage: [
          'radial-gradient(ellipse 70% 55% at 50% -10%, rgba(228,242,242,0.055) 0%, transparent 70%)',
          'radial-gradient(ellipse 55% 40% at 50% 115%, rgba(180,220,220,0.04) 0%, transparent 70%)',
          'radial-gradient(ellipse 40% 35% at 8%  50%,  rgba(228,242,242,0.025) 0%, transparent 70%)',
          'radial-gradient(ellipse 40% 35% at 92% 50%,  rgba(228,242,242,0.025) 0%, transparent 70%)',
        ].join(', '),
      }}
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.55, ease: 'easeInOut' } }}
    >
      {/* Grain texture — fine SVG noise at very low opacity */}
      <svg
        className="pointer-events-none absolute inset-0 w-full h-full opacity-[0.028]"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.72" numOctaves="4" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#grain)" />
      </svg>

      {/* Top vignette */}
      <div
        className="pointer-events-none absolute top-0 left-0 right-0 h-40"
        style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.45) 0%, transparent 100%)' }}
      />
      {/* Bottom vignette */}
      <div
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-40"
        style={{ background: 'linear-gradient(0deg, rgba(0,0,0,0.45) 0%, transparent 100%)' }}
      />

      {/* ── Centre composition ── */}
      <div className="relative flex flex-col items-center gap-10 px-8">

        {/* Logo — large, centred, solid #E4F2F2 */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
        >
          <SynchraLogo
            width={280}
            color="#E4F2F2"
            className="drop-shadow-[0_0_28px_rgba(228,242,242,0.18)]"
          />
        </motion.div>

        {/* Accent rule */}
        <motion.div
          className="w-16 h-px"
          style={{ background: 'rgba(228,242,242,0.35)' }}
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut', delay: 0.55 }}
        />

        {/* Tagline */}
        <motion.p
          className="text-xs tracking-[0.22em] uppercase text-center"
          style={{ color: 'rgba(228,242,242,0.45)', fontFamily: "'DM Sans', sans-serif", maxWidth: 260 }}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut', delay: 0.72 }}
        >
          Where coincidence meets the chain
        </motion.p>

        {/* Enter button */}
        <motion.button
          onClick={onEnter}
          className="btn-primary mt-2 px-8 py-3 rounded-xl text-sm font-semibold tracking-wide"
          style={{
            background: '#E4F2F2',
            color: '#0c1a1a',
            boxShadow: '0 0 32px rgba(228,242,242,0.14)',
          }}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: 'easeOut', delay: 0.95 }}
          whileHover={{ background: '#f2fafa', boxShadow: '0 0 40px rgba(228,242,242,0.22)' }}
          whileTap={{ scale: 0.97, background: '#c8e6e6' }}
        >
          Enter
        </motion.button>
      </div>
    </motion.div>
  );
}
