import { useState, useCallback, useEffect } from 'react';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface EventData {
  title: string;
  description: string;
}

export interface SynchraPost {
  id: string;
  authorAddress: string;
  authorUsername: string;
  authorAvatar: string | null;
  dateOfOccurrence: string; // ISO date string
  eventA: EventData;
  eventB: EventData;
  createdAt: number; // ms timestamp
  likes: string[];   // array of wallet addresses
  reposts: string[]; // array of wallet addresses
  comments: Comment[];
  txHash?: string;
}

export interface Comment {
  id: string;
  authorAddress: string;
  authorUsername: string;
  authorAvatar: string | null;
  text: string;
  createdAt: number;
}

export interface UserProfile {
  address: string;
  username: string;
  avatar: string | null;
  bio: string;
  followers: string[];    // addresses
  following: string[];    // addresses
  joinedAt: number;
  badges: Badge[];
}

export type BadgeType =
  | 'likes_100' | 'likes_1000'
  | 'reposts_100' | 'reposts_1000'
  | 'comments_100' | 'comments_1000'
  | 'followers_100' | 'followers_1000'
  | 'weekly_gold' | 'weekly_silver' | 'weekly_bronze';

export interface Badge {
  type: BadgeType;
  earnedAt: number;
}

export type FeedSort = 'latest' | 'trending' | 'most_liked';

// ─── Admin ────────────────────────────────────────────────────────────────────

/** Lowercase for case-insensitive comparison. */
export const ADMIN_ADDRESS = '0x37bd329e76761d7a1e98c6f639a6a3c6d8e9c73b';

export function isAdmin(address: string | undefined): boolean {
  return !!address && address.toLowerCase() === ADMIN_ADDRESS;
}

export function canDeletePost(callerAddress: string | undefined, postAuthorAddress: string): boolean {
  if (!callerAddress) return false;
  if (isAdmin(callerAddress)) return true;
  return callerAddress.toLowerCase() === postAuthorAddress.toLowerCase();
}

// ─── Storage helpers ─────────────────────────────────────────────────────────

// Bump this version string whenever a breaking schema or seed-data change is
// made. On first load after a bump the old data is cleared automatically.
const STORAGE_VERSION = 'v2';
const STORAGE_KEYS = {
  version: 'synchra_version',
  posts: 'synchra_posts',
  profiles: 'synchra_profiles',
};

function migrateStorage(): void {
  try {
    if (localStorage.getItem(STORAGE_KEYS.version) !== STORAGE_VERSION) {
      localStorage.removeItem(STORAGE_KEYS.posts);
      localStorage.removeItem(STORAGE_KEYS.profiles);
      localStorage.setItem(STORAGE_KEYS.version, STORAGE_VERSION);
    }
  } catch {
    // storage unavailable — nothing to migrate
  }
}

migrateStorage();

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage full — ignore
  }
}

// ─── Badge computation ───────────────────────────────────────────────────────

export function BADGE_META(): Record<BadgeType, { label: string; color: string; description: string }> {
  return {
    likes_100:        { label: '100 Likes',      color: '#E4F2F2', description: 'Received 100 total likes' },
    likes_1000:       { label: '1K Likes',       color: '#c8e6e6', description: 'Received 1,000 total likes' },
    reposts_100:      { label: '100 Reposts',    color: '#E4F2F2', description: 'Received 100 total reposts' },
    reposts_1000:     { label: '1K Reposts',     color: '#c8e6e6', description: 'Received 1,000 total reposts' },
    comments_100:     { label: '100 Comments',   color: '#E4F2F2', description: 'Received 100 total comments' },
    comments_1000:    { label: '1K Comments',    color: '#c8e6e6', description: 'Received 1,000 total comments' },
    followers_100:    { label: '100 Followers',  color: '#E4F2F2', description: 'Reached 100 followers' },
    followers_1000:   { label: '1K Followers',   color: '#c8e6e6', description: 'Reached 1,000 followers' },
    weekly_gold:      { label: 'Weekly #1',      color: '#fbbf24', description: 'Top post of the week' },
    weekly_silver:    { label: 'Weekly #2',      color: '#cbd5e1', description: '2nd place post of the week' },
    weekly_bronze:    { label: 'Weekly #3',      color: '#d97706', description: '3rd place post of the week' },
  };
}

export function getBadgeMeta(type: BadgeType) {
  return BADGE_META()[type];
}

function computeBadges(address: string, posts: SynchraPost[], profiles: Map<string, UserProfile>): BadgeType[] {
  const userPosts = posts.filter(p => p.authorAddress === address);
  const totalLikes = userPosts.reduce((s, p) => s + p.likes.length, 0);
  const totalReposts = userPosts.reduce((s, p) => s + p.reposts.length, 0);
  const totalComments = userPosts.reduce((s, p) => s + p.comments.length, 0);
  const followerCount = profiles.get(address)?.followers.length ?? 0;

  const earned: BadgeType[] = [];
  if (totalLikes >= 100) earned.push('likes_100');
  if (totalLikes >= 1000) earned.push('likes_1000');
  if (totalReposts >= 100) earned.push('reposts_100');
  if (totalReposts >= 1000) earned.push('reposts_1000');
  if (totalComments >= 100) earned.push('comments_100');
  if (totalComments >= 1000) earned.push('comments_1000');
  if (followerCount >= 100) earned.push('followers_100');
  if (followerCount >= 1000) earned.push('followers_1000');
  return earned;
}

function computeWeeklyLeaderboard(posts: SynchraPost[]): Map<string, BadgeType[]> {
  const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const weeklyPosts = posts.filter(p => p.createdAt > oneWeekAgo);
  const sorted = [...weeklyPosts].sort((a, b) =>
    (b.likes.length + b.reposts.length * 2 + b.comments.length) -
    (a.likes.length + a.reposts.length * 2 + a.comments.length)
  );
  const result = new Map<string, BadgeType[]>();
  const ranks: BadgeType[] = ['weekly_gold', 'weekly_silver', 'weekly_bronze'];
  sorted.slice(0, 3).forEach((post, i) => {
    const existing = result.get(post.authorAddress) ?? [];
    result.set(post.authorAddress, [...existing, ranks[i]]);
  });
  return result;
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useSynchra() {
  const [posts, setPosts] = useState<SynchraPost[]>(() =>
    loadFromStorage<SynchraPost[]>(STORAGE_KEYS.posts, [])
  );
  const [profilesMap, setProfilesMap] = useState<Map<string, UserProfile>>(() => {
    const arr = loadFromStorage<UserProfile[]>(STORAGE_KEYS.profiles, []);
    return new Map(arr.map(p => [p.address, p]));
  });

  // Persist on changes
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.posts, posts);
  }, [posts]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.profiles, Array.from(profilesMap.values()));
  }, [profilesMap]);

  const getProfile = useCallback((address: string): UserProfile | undefined => {
    return profilesMap.get(address);
  }, [profilesMap]);

  const hasProfile = useCallback((address: string): boolean => {
    return profilesMap.has(address);
  }, [profilesMap]);

  const createProfile = useCallback((address: string, username: string, avatar: string | null, bio: string) => {
    setProfilesMap(prev => {
      const next = new Map(prev);
      next.set(address, {
        address,
        username,
        avatar,
        bio,
        followers: [],
        following: [],
        joinedAt: Date.now(),
        badges: [],
      });
      return next;
    });
  }, []);

  const updateProfile = useCallback((address: string, updates: Partial<Pick<UserProfile, 'username' | 'avatar' | 'bio'>>) => {
    setProfilesMap(prev => {
      const existing = prev.get(address);
      if (!existing) return prev;
      const next = new Map(prev);
      next.set(address, { ...existing, ...updates });
      return next;
    });
  }, []);

  const isUsernameTaken = useCallback((username: string, excludeAddress?: string): boolean => {
    for (const [addr, profile] of profilesMap.entries()) {
      if (addr === excludeAddress) continue;
      if (profile.username.toLowerCase() === username.toLowerCase()) return true;
    }
    return false;
  }, [profilesMap]);

  const addPost = useCallback((post: SynchraPost) => {
    setPosts(prev => [post, ...prev]);
  }, []);

  const likePost = useCallback((postId: string, address: string) => {
    setPosts(prev => prev.map(p => {
      if (p.id !== postId) return p;
      const liked = p.likes.includes(address);
      return {
        ...p,
        likes: liked ? p.likes.filter(a => a !== address) : [...p.likes, address],
      };
    }));
  }, []);

  const repostPost = useCallback((postId: string, address: string) => {
    setPosts(prev => prev.map(p => {
      if (p.id !== postId) return p;
      const reposted = p.reposts.includes(address);
      return {
        ...p,
        reposts: reposted ? p.reposts.filter(a => a !== address) : [...p.reposts, address],
      };
    }));
  }, []);

  const deletePost = useCallback((postId: string, callerAddress: string) => {
    setPosts(prev => {
      const post = prev.find(p => p.id === postId);
      if (!post) return prev;
      if (!canDeletePost(callerAddress, post.authorAddress)) return prev;
      return prev.filter(p => p.id !== postId);
    });
  }, []);

  const addComment = useCallback((postId: string, comment: Comment) => {
    setPosts(prev => prev.map(p => {
      if (p.id !== postId) return p;
      return { ...p, comments: [...p.comments, comment] };
    }));
  }, []);

  const followUser = useCallback((followerAddress: string, targetAddress: string) => {
    setProfilesMap(prev => {
      const next = new Map(prev);
      const follower = next.get(followerAddress);
      const target = next.get(targetAddress);
      if (!follower || !target) return prev;
      const alreadyFollowing = follower.following.includes(targetAddress);
      next.set(followerAddress, {
        ...follower,
        following: alreadyFollowing
          ? follower.following.filter(a => a !== targetAddress)
          : [...follower.following, targetAddress],
      });
      next.set(targetAddress, {
        ...target,
        followers: alreadyFollowing
          ? target.followers.filter(a => a !== followerAddress)
          : [...target.followers, followerAddress],
      });
      return next;
    });
  }, []);

  const getSortedPosts = useCallback((sort: FeedSort, filterAddress?: string): SynchraPost[] => {
    let filtered = filterAddress
      ? posts.filter(p => p.authorAddress === filterAddress)
      : posts;

    switch (sort) {
      case 'latest':
        return [...filtered].sort((a, b) => b.createdAt - a.createdAt);
      case 'trending': {
        return [...filtered].sort((a, b) => {
          const scoreA = a.likes.length + a.reposts.length * 2 + a.comments.length;
          const scoreB = b.likes.length + b.reposts.length * 2 + b.comments.length;
          return scoreB - scoreA;
        });
      }
      case 'most_liked':
        return [...filtered].sort((a, b) => b.likes.length - a.likes.length);
    }
  }, [posts]);

  const getBadgesForUser = useCallback((address: string): BadgeType[] => {
    const milestone = computeBadges(address, posts, profilesMap);
    const weekly = computeWeeklyLeaderboard(posts);
    const weeklyBadges = weekly.get(address) ?? [];
    const all = [...new Set([...milestone, ...weeklyBadges])];
    return all;
  }, [posts, profilesMap]);

  const getAllProfiles = useCallback((): UserProfile[] => {
    return Array.from(profilesMap.values());
  }, [profilesMap]);

  return {
    posts,
    getProfile,
    hasProfile,
    createProfile,
    updateProfile,
    isUsernameTaken,
    addPost,
    deletePost,
    likePost,
    repostPost,
    addComment,
    followUser,
    getSortedPosts,
    getBadgesForUser,
    getAllProfiles,
    profilesMap,
  };
}


