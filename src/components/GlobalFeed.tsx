import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, TrendingUp, Clock, Heart } from 'lucide-react';
import { SynchraPost, UserProfile, FeedSort, BadgeType } from '../store/useSynchra';
import { PostCard } from './PostCard';
import { ConnectKitButton } from 'connectkit';
import { SynchraLogo } from './SynchraLogo';

interface GlobalFeedProps {
  posts: SynchraPost[];
  currentAddress?: string;
  currentProfile?: UserProfile;
  getBadgesForUser: (address: string) => BadgeType[];
  getProfileByAddress: (address: string) => UserProfile | undefined;
  getSortedPosts: (sort: FeedSort) => SynchraPost[];
  onNewPost: () => void;
  onLike: (postId: string) => void;
  onRepost: (postId: string) => void;
  onComment: (postId: string, text: string) => void;
  onDelete: (postId: string) => void;
  onNavigateToProfile: (address: string) => void;
}

const SORT_OPTIONS: { value: FeedSort; label: string; icon: React.ReactNode }[] = [
  { value: 'latest',    label: 'Latest',    icon: <Clock      size={13} /> },
  { value: 'trending',  label: 'Trending',  icon: <TrendingUp size={13} /> },
  { value: 'most_liked',label: 'Most Liked',icon: <Heart      size={13} /> },
];

export function GlobalFeed({
  currentAddress, currentProfile, getBadgesForUser, getProfileByAddress,
  getSortedPosts, onNewPost, onLike, onRepost, onComment, onDelete, onNavigateToProfile,
}: GlobalFeedProps) {
  const [sort, setSort] = useState<FeedSort>('latest');
  const sortedPosts = getSortedPosts(sort);

  return (
    <div className="max-w-2xl mx-auto px-4 pt-6 pb-28">

      {/* Hero — shown when not connected */}
      {!currentAddress && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-8 mb-6 text-center"
          style={{ border: '1px solid var(--border-strong)' }}
        >
          <div className="flex justify-center mb-5">
            <SynchraLogo width={160} color="#E4F2F2" className="opacity-90" />
          </div>
          <h2 className="display font-700 text-xl mb-2" style={{ color: 'var(--ink)', letterSpacing: '-0.03em' }}>
            Where coincidence meets the chain.
          </h2>
          <p className="text-sm mb-6 text-pretty max-w-sm mx-auto" style={{ color: 'var(--muted)' }}>
            Connect your wallet to log synchronicities, follow collectors of the uncanny, and earn badges.
          </p>
          {/* Accent divider */}
          <div className="divider-accent mb-6" />
          <div className="flex justify-center">
            <ConnectKitButton
              label="Connect Wallet"
              customTheme={{
                '--ck-font-family':                  "'DM Sans', sans-serif",
                '--ck-primary-button-background':    '#E4F2F2',
                '--ck-primary-button-color':         '#0c1a1a',
                '--ck-primary-button-hover-background': '#f2fafa',
                '--ck-body-background':              '#1a1f28',
                '--ck-body-color':                   '#edf4f4',
                '--ck-border-radius':                '12px',
                '--ck-overlay-background':           'rgba(12,15,20,0.88)',
              }}
            />
          </div>
        </motion.div>
      )}

      {/* Sort tabs */}
      <div className="flex items-center gap-1 mb-5">
        {SORT_OPTIONS.map(opt => (
          <button
            key={opt.value}
            onClick={() => setSort(opt.value)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium transition-all"
            style={sort === opt.value ? {
              background: 'var(--accent-glow)',
              color: 'var(--accent)',
              border: '1px solid var(--border-strong)',
            } : {
              color: 'var(--muted)',
              border: '1px solid transparent',
            }}
          >
            {opt.icon}
            {opt.label}
          </button>
        ))}
      </div>

      {/* Post list */}
      <div className="space-y-4">
        {sortedPosts.length === 0 && (
          <div className="glass rounded-2xl p-12 text-center">
            <p className="text-sm" style={{ color: 'var(--subtle)' }}>
              No synchronicities yet. Be the first to log one.
            </p>
          </div>
        )}
        {sortedPosts.map(post => (
          <PostCard
            key={post.id}
            post={post}
            currentAddress={currentAddress}
            currentProfile={currentProfile}
            authorProfile={getProfileByAddress(post.authorAddress)}
            authorBadges={getBadgesForUser(post.authorAddress)}
            onLike={onLike}
            onRepost={onRepost}
            onComment={onComment}
            onDelete={onDelete}
            onAuthorClick={onNavigateToProfile}
          />
        ))}
      </div>

      {/* FAB */}
      {currentAddress && currentProfile && (
        <motion.button
          whileTap={{ scale: 0.93 }}
          onClick={onNewPost}
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full flex items-center justify-center z-30 transition-all"
          style={{
            background: '#E4F2F2',
            boxShadow: '0 8px 24px rgba(228,242,242,0.22)',
          }}
          title="Log a synchronicity"
          whileHover={{ boxShadow: '0 10px 32px rgba(228,242,242,0.32)', background: '#f2fafa' }}
        >
          <Plus size={24} color="#0c1a1a" strokeWidth={2.5} />
        </motion.button>
      )}
    </div>
  );
}
