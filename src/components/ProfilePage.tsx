import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Users, X } from 'lucide-react';
import { UserProfile, SynchraPost, BadgeType } from '../store/useSynchra';
import { Avatar } from './Avatar';
import { BadgeChip } from './BadgeChip';
import { PostCard } from './PostCard';

interface ProfilePageProps {
  profile: UserProfile;
  isOwn: boolean;
  currentAddress?: string;
  currentProfile?: UserProfile;
  isFollowing: boolean;
  posts: SynchraPost[];
  getBadgesForUser: (address: string) => BadgeType[];
  getProfileByAddress: (addr: string) => UserProfile | undefined;
  onFollow: () => void;
  onBack: () => void;
  onLike: (postId: string) => void;
  onRepost: (postId: string) => void;
  onComment: (postId: string, text: string) => void;
  onDelete: (postId: string) => void;
  onNavigateToProfile: (address: string) => void;
}

type FollowModal = 'followers' | 'following' | null;

export function ProfilePage({
  profile, isOwn, currentAddress, currentProfile, isFollowing,
  posts, getBadgesForUser, getProfileByAddress,
  onFollow, onBack, onLike, onRepost, onComment, onDelete, onNavigateToProfile,
}: ProfilePageProps) {
  const [followModal, setFollowModal] = useState<FollowModal>(null);

  const badges = getBadgesForUser(profile.address);
  const displayName = profile.username;

  return (
    <div className="min-h-dvh">
      {/* Back nav */}
      <div className="sticky top-0 z-20 px-4 py-3 flex items-center gap-3" style={{ background: 'rgba(7,13,26,0.85)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--border)' }}>
        <button onClick={onBack} className="p-2 rounded-xl transition-all hover:bg-white/5" style={{ color: 'var(--ink-2)' }}>
          <ArrowLeft size={20} />
        </button>
        <span className="display font-600" style={{ color: 'var(--ink)' }}>@{displayName}</span>
      </div>

      <div className="max-w-2xl mx-auto px-4 pt-6 pb-20">
        {/* Profile card */}
        <div className="glass rounded-2xl p-6 mb-6">
          <div className="flex items-start gap-4">
            <Avatar src={profile.avatar} username={displayName} size={72} />
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h1 className="display font-700 text-xl" style={{ color: 'var(--ink)' }}>@{displayName}</h1>
                  {profile.bio && (
                    <p className="text-sm mt-1 text-pretty" style={{ color: 'var(--muted)' }}>{profile.bio}</p>
                  )}
                </div>
                {!isOwn && currentAddress && (
                  <button
                    onClick={onFollow}
                    className="px-4 py-2 rounded-xl text-sm font-semibold flex-shrink-0 transition-all active:scale-95"
                    style={isFollowing ? {
                      background: 'var(--surface-strong)',
                      color: 'var(--ink-2)',
                      border: '1px solid var(--border-strong)',
                    } : {
                      background: '#E4F2F2',
                      color: '#0c1a1a',
                    }}
                  >
                    {isFollowing ? 'Following' : 'Follow'}
                  </button>
                )}
              </div>

              {/* Stats row */}
              <div className="flex items-center gap-5 mt-3">
                <button onClick={() => setFollowModal('followers')} className="flex flex-col items-start hover:opacity-80 transition-opacity">
                  <span className="font-bold tabular-nums text-sm" style={{ color: 'var(--ink)' }}>{profile.followers.length.toLocaleString()}</span>
                  <span className="text-xs" style={{ color: 'var(--subtle)' }}>Followers</span>
                </button>
                <button onClick={() => setFollowModal('following')} className="flex flex-col items-start hover:opacity-80 transition-opacity">
                  <span className="font-bold tabular-nums text-sm" style={{ color: 'var(--ink)' }}>{profile.following.length.toLocaleString()}</span>
                  <span className="text-xs" style={{ color: 'var(--subtle)' }}>Following</span>
                </button>
                <div className="flex flex-col items-start">
                  <span className="font-bold tabular-nums text-sm" style={{ color: 'var(--ink)' }}>{posts.length}</span>
                  <span className="text-xs" style={{ color: 'var(--subtle)' }}>Logs</span>
                </div>
              </div>
            </div>
          </div>

          {/* Badges */}
          {badges.length > 0 && (
            <div className="mt-4 pt-4 flex flex-wrap gap-2" style={{ borderTop: '1px solid var(--border)' }}>
              {badges.map(b => <BadgeChip key={b} type={b} size="md" />)}
            </div>
          )}
        </div>

        {/* Posts */}
        <div className="space-y-4">
          {posts.length === 0 && (
            <div className="glass rounded-2xl p-12 text-center">
              <p className="text-sm" style={{ color: 'var(--subtle)' }}>No synchronicity logs yet.</p>
            </div>
          )}
          {posts.map(post => (
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
      </div>

      {/* Follow modal */}
      <AnimatePresence>
        {followModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
            style={{ background: 'rgba(12,15,20,0.88)', backdropFilter: 'blur(8px)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={e => { if (e.target === e.currentTarget) setFollowModal(null); }}
          >
            <motion.div
              className="glass-strong w-full sm:max-w-sm rounded-t-3xl sm:rounded-2xl overflow-hidden"
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 30 }}
              style={{ maxHeight: '70dvh' }}
            >
              <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
                <div className="flex items-center gap-2">
                  <Users size={16} style={{ color: 'var(--accent)' }} />
                  <span className="font-semibold text-sm" style={{ color: 'var(--ink)' }}>
                    {followModal === 'followers' ? 'Followers' : 'Following'}
                  </span>
                </div>
                <button onClick={() => setFollowModal(null)} className="p-1.5 rounded-lg" style={{ color: 'var(--muted)' }}>
                  <X size={16} />
                </button>
              </div>
              <div className="overflow-y-auto" style={{ maxHeight: 'calc(70dvh - 60px)' }}>
                {(followModal === 'followers' ? profile.followers : profile.following).map(addr => {
                  const p = getProfileByAddress(addr);
                  const name = p?.username ?? `${addr.slice(0, 6)}...${addr.slice(-4)}`;
                  return (
                    <button
                      key={addr}
                      onClick={() => { setFollowModal(null); onNavigateToProfile(addr); }}
                      className="w-full flex items-center gap-3 px-5 py-3 transition-all hover:bg-white/5"
                    >
                      <Avatar src={p?.avatar ?? null} username={name} size={36} />
                      <span className="text-sm font-medium" style={{ color: 'var(--ink-2)' }}>@{name}</span>
                    </button>
                  );
                })}
                {(followModal === 'followers' ? profile.followers : profile.following).length === 0 && (
                  <p className="text-center text-sm py-8" style={{ color: 'var(--subtle)' }}>No one here yet.</p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
