import { getBadgeMeta, BadgeType } from '../store/useSynchra';
import { Star, Repeat2, Heart, Users, Trophy } from 'lucide-react';

interface BadgeChipProps {
  type: BadgeType;
  size?: 'sm' | 'md';
}

function BadgeIcon({ type }: { type: BadgeType }) {
  if (type.startsWith('likes'))     return <Heart    size={10} />;
  if (type.startsWith('reposts'))   return <Repeat2  size={10} />;
  if (type.startsWith('comments'))  return <Star     size={10} />;
  if (type.startsWith('followers')) return <Users    size={10} />;
  return <Trophy size={10} />;
}

export function BadgeChip({ type, size = 'sm' }: BadgeChipProps) {
  const meta = getBadgeMeta(type);
  const isWeekly = type.startsWith('weekly');

  return (
    <div
      title={meta.description}
      className={`inline-flex items-center gap-1 rounded-full font-medium tabular-nums ${
        size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-3 py-1 text-xs'
      }`}
      style={{
        background: `${meta.color}14`,
        border:     `1px solid ${meta.color}38`,
        color:       meta.color,
        boxShadow:   isWeekly ? `0 0 8px ${meta.color}28` : undefined,
      }}
    >
      <BadgeIcon type={type} />
      {meta.label}
    </div>
  );
}
