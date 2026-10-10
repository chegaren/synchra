import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Repeat2, MessageCircle, Share2, ExternalLink, Calendar, ChevronDown, ChevronUp, Twitter, Trash2 } from 'lucide-react';
import { SynchraPost, UserProfile, BadgeType, canDeletePost } from '../store/useSynchra';
import { Avatar } from './Avatar';
import { BadgeChip } from './BadgeChip';
import { buildTxExplorerUrl } from '@/onchain-facts';

const ARC_TESTNET_ID = 5042002;

interface PostCardProps {
  post: SynchraPost;
  currentAddress?: string;
  currentProfile?: UserProfile;
  authorProfile?: UserProfile;
  authorBadges: BadgeType[];
  onLike: (postId: string) => void;
  onRepost: (postId: string) => void;
  onComment: (postId: string, text: string) => void;
  onDelete: (postId: string) => void;
  onAuthorClick: (address: string) => void;
}

function formatRelativeTime(ms: number): string {
  const diff = Date.now() - ms;
  if (diff < 60_000) return 'just now';
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return `${Math.floor(diff / 86_400_000)}d ago`;
}

export function PostCard({
  post, currentAddress, currentProfile, authorProfile, authorBadges,
  onLike, onRepost, onComment, onDelete, onAuthorClick,
}: PostCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [showComments, setShowComments] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const liked = currentAddress ? post.likes.includes(currentAddress) : false;
  const reposted = currentAddress ? post.reposts.includes(currentAddress) : false;
  const canDelete = canDeletePost(currentAddress, post.authorAddress);

  const authorName = authorProfile?.username ?? (post.authorUsername || `${post.authorAddress.slice(0, 6)}...`);
  const authorAvatar = authorProfile?.avatar ?? post.authorAvatar;

  const explorerUrl = post.txHash && !post.txHash.startsWith('0xdemo')
    ? buildTxExplorerUrl(ARC_TESTNET_ID, post.txHash)
    : null;

  const xShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    `🔮 Synchronicity: ${post.eventA.title} ↔ ${post.eventB.title}\n\nvia @SynchraApp`
  )}`;

  const handleComment = () => {
    if (!commentText.trim() || !currentAddress || !currentProfile) return;
    onComment(post.id, commentText.trim());
    setCommentText('');
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl overflow-hidden"
      style={{ borderColor: 'var(--border)' }}
    >
      {/* Header */}
      <div className="px-5 pt-5 pb-3 flex items-start justify-between gap-3">
        <button
          onClick={() => onAuthorClick(post.authorAddress)}
          className="flex items-center gap-3 group min-w-0"
        >
          <Avatar src={authorAvatar} username={authorName} size={40} />
          <div className="min-w-0 text-left">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-sm group-hover:underline" style={{ color: 'var(--ink)' }}>
                @{authorName}
              </span>
              {authorBadges.slice(0, 2).map(b => (
                <BadgeChip key={b} type={b} size="sm" />
              ))}
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <Calendar size={11} style={{ color: 'var(--subtle)' }} />
              <span className="text-xs" style={{ color: 'var(--subtle)' }}>
                Occurred: {new Date(post.dateOfOccurrence).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
          </div>
        </button>
        <span className="text-xs flex-shrink-0 tabular-nums mt-1" style={{ color: 'var(--subtle)' }}>
          {formatRelativeTime(post.createdAt)}
        </span>
      </div>

      {/* Events */}
      <div className="px-5 pb-4">
        <button
          onClick={() => setExpanded(v => !v)}
          className="w-full text-left"
        >
          {/* Connection visual */}
          <div className="grid grid-cols-[1fr_auto_1fr] gap-2 items-start">
            {/* Event A */}
            <div className="rounded-xl p-3" style={{ background: 'rgba(126,179,255,0.08)', border: '1px solid rgba(126,179,255,0.15)' }}>
              <div className="text-xs font-semibold uppercase tracking-widest mb-1.5" style={{ color: '#7eb3ff' }}>Event A</div>
              <div className="font-semibold text-sm leading-snug" style={{ color: 'var(--ink)' }}>{post.eventA.title}</div>
              <AnimatePresence>
                {expanded && (
                  <motion.p
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="text-xs mt-2 overflow-hidden text-pretty"
                    style={{ color: 'var(--ink-2)' }}
                  >
                    {post.eventA.description}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Connector */}
            <div className="flex flex-col items-center justify-center pt-3 gap-0.5">
              <div className="w-px h-3 rounded-full" style={{ background: 'var(--border-strong)' }} />
              <div className="text-xs font-bold" style={{ color: 'var(--accent)', opacity: 0.7 }}>
                ↔
              </div>
              <div className="w-px h-3 rounded-full" style={{ background: 'var(--border-strong)' }} />
            </div>

            {/* Event B */}
            <div className="rounded-xl p-3" style={{ background: 'var(--accent-subtle)', border: '1px solid var(--border-strong)' }}>
              <div className="text-xs font-semibold uppercase tracking-widest mb-1.5" style={{ color: 'var(--accent)' }}>Event B</div>
              <div className="font-semibold text-sm leading-snug" style={{ color: 'var(--ink)' }}>{post.eventB.title}</div>
              <AnimatePresence>
                {expanded && (
                  <motion.p
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="text-xs mt-2 overflow-hidden text-pretty"
                    style={{ color: 'var(--ink-2)' }}
                  >
                    {post.eventB.description}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Expand toggle */}
          <div className="flex items-center justify-center mt-2 gap-1" style={{ color: 'var(--accent)', opacity: 0.75 }}>
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            <span className="text-xs">{expanded ? 'Less' : 'Read full synchronicity'}</span>
          </div>
        </button>
      </div>

      {/* Actions bar */}
      <div
        className="px-5 py-3 flex items-center gap-1 flex-wrap"
        style={{ borderTop: '1px solid var(--border)' }}
      >
        {/* Like */}
        <motion.button
          whileTap={{ scale: 0.88 }}
          onClick={() => currentAddress && onLike(post.id)}
          disabled={!currentAddress}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all disabled:opacity-40"
          style={{
            background: liked ? 'rgba(248,113,113,0.14)' : 'transparent',
            color: liked ? 'var(--danger)' : 'var(--muted)',
            border: liked ? '1px solid rgba(248,113,113,0.25)' : '1px solid transparent',
          }}
        >
          <Heart size={14} fill={liked ? 'currentColor' : 'none'} />
          <span className="tabular-nums">{post.likes.length}</span>
        </motion.button>

        {/* Repost */}
        <motion.button
          whileTap={{ scale: 0.88 }}
          onClick={() => currentAddress && onRepost(post.id)}
          disabled={!currentAddress}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all disabled:opacity-40"
          style={{
            background: reposted ? 'rgba(110,231,183,0.12)' : 'transparent',
            color: reposted ? 'var(--success)' : 'var(--muted)',
            border: reposted ? '1px solid rgba(110,231,183,0.25)' : '1px solid transparent',
          }}
        >
          <Repeat2 size={14} />
          <span className="tabular-nums">{post.reposts.length}</span>
        </motion.button>

        {/* Comment */}
        <motion.button
          whileTap={{ scale: 0.88 }}
          onClick={() => setShowComments(v => !v)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all"
          style={{
            background: showComments ? 'var(--accent-glow)' : 'transparent',
            color: showComments ? 'var(--accent)' : 'var(--muted)',
            border: showComments ? '1px solid var(--border-strong)' : '1px solid transparent',
          }}
        >
          <MessageCircle size={14} />
          <span className="tabular-nums">{post.comments.length}</span>
        </motion.button>

        <div className="flex-1" />

        {/* Delete (admin or own post) */}
        {canDelete && (
          confirmDelete ? (
            <div className="flex items-center gap-1">
              <span className="text-xs" style={{ color: 'var(--danger)' }}>Delete?</span>
              <button
                onClick={() => { onDelete(post.id); setConfirmDelete(false); }}
                className="px-2 py-1 rounded-lg text-xs font-semibold transition-all"
                style={{ background: 'rgba(232,109,122,0.18)', color: 'var(--danger)', border: '1px solid rgba(232,109,122,0.35)' }}
              >
                Yes
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="px-2 py-1 rounded-lg text-xs font-semibold transition-all"
                style={{ color: 'var(--muted)', border: '1px solid var(--border)' }}
              >
                No
              </button>
            </div>
          ) : (
            <motion.button
              whileTap={{ scale: 0.88 }}
              onClick={() => setConfirmDelete(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all"
              style={{ color: 'var(--subtle)', border: '1px solid transparent' }}
              title="Delete post"
            >
              <Trash2 size={13} />
            </motion.button>
          )
        )}

        {/* Share to X */}
        <a
          href={xShareUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all"
          style={{ color: 'var(--subtle)', border: '1px solid transparent' }}
          title="Share to X"
        >
          <Twitter size={13} />
        </a>

        {/* Share internally — visual only */}
        <button
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all"
          style={{ color: 'var(--subtle)', border: '1px solid transparent' }}
          title="Copy link"
          onClick={() => { void navigator.clipboard?.writeText(`${window.location.origin}#post/${post.id}`); }}
        >
          <Share2 size={13} />
        </button>

        {/* Explorer link */}
        {explorerUrl && (
          <a
            href={explorerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 px-2 py-2 rounded-xl text-xs transition-all"
            style={{ color: 'var(--subtle)' }}
            title="View transaction"
          >
            <ExternalLink size={12} />
          </a>
        )}
      </div>

      {/* Comments section */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
            style={{ borderTop: '1px solid var(--border)' }}
          >
            <div className="px-5 py-4 space-y-3">
              {post.comments.length === 0 && (
                <p className="text-xs text-center py-2" style={{ color: 'var(--subtle)' }}>No comments yet. Be first.</p>
              )}
              {post.comments.map(c => (
                <div key={c.id} className="flex items-start gap-2.5">
                  <Avatar src={c.authorAvatar} username={c.authorUsername} size={28} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold" style={{ color: 'var(--ink-2)' }}>@{c.authorUsername}</span>
                      <span className="text-xs" style={{ color: 'var(--subtle)' }}>{formatRelativeTime(c.createdAt)}</span>
                    </div>
                    <p className="text-xs mt-0.5 text-pretty" style={{ color: 'var(--ink-2)' }}>{c.text}</p>
                  </div>
                </div>
              ))}

              {currentAddress && currentProfile && (
                <div className="flex items-center gap-2 pt-1">
                  <Avatar src={currentProfile.avatar} username={currentProfile.username} size={28} />
                  <input
                    type="text"
                    value={commentText}
                    onChange={e => setCommentText(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleComment()}
                    placeholder="Add a comment…"
                    maxLength={280}
                    className="flex-1 px-3 py-2 rounded-xl text-xs outline-none"
                    style={{
                      background: 'var(--surface-strong)',
                      border: '1px solid var(--border)',
                      color: 'var(--ink)',
                    }}
                  />
                  <button
                    onClick={handleComment}
                    disabled={!commentText.trim()}
                    className="px-3 py-2 rounded-xl text-xs font-medium transition-all disabled:opacity-40"
                    style={{ background: '#E4F2F2', color: '#0c1a1a' }}
                  >
                    Post
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
