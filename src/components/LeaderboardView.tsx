import { useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, TrendingUp } from 'lucide-react';
import { SynchraPost, UserProfile, BadgeType } from '../store/useSynchra';
import { Avatar } from './Avatar';
import { BadgeChip } from './BadgeChip';

interface LeaderboardViewProps {
  posts: SynchraPost[];
  getAllProfiles: () => UserProfile[];
  getBadgesForUser: (address: string) => BadgeType[];
  onNavigateToProfile: (address: string) => void;
}

interface LeaderboardEntry {
  address: string;
  username: string;
  avatar: string | null;
  score: number;
  likes: number;
  reposts: number;
  comments: number;
  postCount: number;
  badges: BadgeType[];
}

const RANK_COLORS = ['#fbbf24', '#cbd5e1', '#d97706'];
const RANK_LABELS = ['1st', '2nd', '3rd'];

export function LeaderboardView({ posts, getAllProfiles, getBadgesForUser, onNavigateToProfile }: LeaderboardViewProps) {
  const [now] = useState(() => Date.now());
  const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;

  // Weekly top posts
  const weeklyPosts = [...posts]
    .filter(p => p.createdAt > oneWeekAgo)
    .sort((a, b) => (b.likes.length + b.reposts.length * 2 + b.comments.length) - (a.likes.length + a.reposts.length * 2 + a.comments.length))
    .slice(0, 10);

  // All-time top users
  const profiles = getAllProfiles();
  const userEntries: LeaderboardEntry[] = profiles.map(p => {
    const userPosts = posts.filter(post => post.authorAddress === p.address);
    const likes = userPosts.reduce((s, post) => s + post.likes.length, 0);
    const reposts = userPosts.reduce((s, post) => s + post.reposts.length, 0);
    const comments = userPosts.reduce((s, post) => s + post.comments.length, 0);
    return {
      address: p.address,
      username: p.username,
      avatar: p.avatar,
      score: likes + reposts * 2 + comments,
      likes, reposts, comments,
      postCount: userPosts.length,
      badges: getBadgesForUser(p.address),
    };
  }).sort((a, b) => b.score - a.score).slice(0, 10);

  return (
    <div className="max-w-2xl mx-auto px-4 pt-6 pb-28">
      {/* Weekly Posts */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp size={18} style={{ color: 'var(--accent)' }} />
          <h2 className="display font-600 text-lg" style={{ color: 'var(--ink)' }}>Weekly Top Coincidences</h2>
        </div>
        <div className="space-y-3">
          {weeklyPosts.length === 0 && (
            <div className="glass rounded-2xl p-8 text-center">
              <p className="text-sm" style={{ color: 'var(--subtle)' }}>No posts this week yet.</p>
            </div>
          )}
          {weeklyPosts.map((post, i) => {
            const score = post.likes.length + post.reposts.length * 2 + post.comments.length;
            const rankColor = RANK_COLORS[i] ?? 'var(--subtle)';
            const rankLabel = RANK_LABELS[i] ?? `#${i + 1}`;
            return (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className="glass rounded-2xl px-5 py-4 flex items-center gap-4"
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                  style={{ background: `${rankColor}18`, color: rankColor, border: `1px solid ${rankColor}40` }}
                >
                  {i < 3 ? <Trophy size={14} /> : <span>{rankLabel}</span>}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-semibold truncate" style={{ color: 'var(--ink)' }}>
                      {post.eventA.title}
                    </span>
                    <span className="text-xs flex-shrink-0" style={{ color: 'var(--accent)', opacity: 0.7 }}>↔</span>
                    <span className="text-sm font-semibold truncate" style={{ color: 'var(--ink)' }}>
                      {post.eventB.title}
                    </span>
                  </div>
                  <span className="text-xs" style={{ color: 'var(--subtle)' }}>@{post.authorUsername}</span>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="font-bold tabular-nums text-sm" style={{ color: rankColor }}>{score}</div>
                  <div className="text-xs" style={{ color: 'var(--subtle)' }}>score</div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Top Users */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Trophy size={18} style={{ color: '#fbbf24' }} />
          <h2 className="display font-600 text-lg" style={{ color: 'var(--ink)' }}>All-Time Top Users</h2>
        </div>
        <div className="space-y-3">
          {userEntries.length === 0 && (
            <div className="glass rounded-2xl p-8 text-center">
              <p className="text-sm" style={{ color: 'var(--subtle)' }}>No users with posts yet.</p>
            </div>
          )}
          {userEntries.map((entry, i) => {
            const rankColor = RANK_COLORS[i] ?? 'var(--subtle)';
            return (
              <motion.button
                key={entry.address}
                onClick={() => onNavigateToProfile(entry.address)}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className="w-full glass rounded-2xl px-5 py-4 flex items-center gap-4 text-left transition-all hover:bg-white/5"
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                  style={{ background: `${rankColor}18`, color: rankColor, border: `1px solid ${rankColor}40` }}
                >
                  {i < 3 ? <Trophy size={13} /> : <span>#{i + 1}</span>}
                </div>
                <Avatar src={entry.avatar} username={entry.username} size={40} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm" style={{ color: 'var(--ink)' }}>@{entry.username}</span>
                    {entry.badges.slice(0, 2).map(b => <BadgeChip key={b} type={b} size="sm" />)}
                  </div>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-xs tabular-nums" style={{ color: 'var(--subtle)' }}>{entry.postCount} logs</span>
                    <span className="text-xs tabular-nums" style={{ color: 'var(--subtle)' }}>{entry.likes} likes</span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="font-bold tabular-nums text-sm" style={{ color: rankColor }}>{entry.score.toLocaleString()}</div>
                  <div className="text-xs" style={{ color: 'var(--subtle)' }}>score</div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
