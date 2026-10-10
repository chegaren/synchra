import { useState, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { motion, AnimatePresence } from 'framer-motion';

import { useSynchra, SynchraPost, Comment } from './store/useSynchra';
import { Navbar, NavView } from './components/Navbar';
import { GlobalFeed } from './components/GlobalFeed';
import { ProfilePage } from './components/ProfilePage';
import { LeaderboardView } from './components/LeaderboardView';
import { OnboardingModal } from './components/OnboardingModal';
import { NewPostModal } from './components/NewPostModal';
import { BrandSplash } from './components/BrandSplash';

export default function App() {
  const { address, isConnected } = useAccount();

  const {
    posts, getProfile, hasProfile, createProfile, isUsernameTaken,
    addPost, deletePost, likePost, repostPost, addComment, followUser,
    getSortedPosts, getBadgesForUser, getAllProfiles, profilesMap,
  } = useSynchra();

  // Show brand splash once per session
  const [showSplash, setShowSplash] = useState(() => {
    try { return !sessionStorage.getItem('synchra_entered'); } catch { return true; }
  });

  const [navView, setNavView] = useState<NavView>('feed');
  const [profileViewAddress, setProfileViewAddress] = useState<string | null>(null);
  const [showNewPost, setShowNewPost] = useState(false);

  const currentProfile = address ? getProfile(address) : undefined;
  const needsOnboarding = isConnected && address && !hasProfile(address);

  // Profile view (any user)
  const viewedProfile = profileViewAddress ? getProfile(profileViewAddress) : undefined;

  const handleViewProfile = useCallback((addr: string) => {
    setProfileViewAddress(addr);
    setNavView('profile');
  }, []);

  const handleNavChange = useCallback((view: NavView) => {
    if (view === 'profile') {
      // Own profile
      if (address) {
        setProfileViewAddress(address);
      }
    } else {
      setProfileViewAddress(null);
    }
    setNavView(view);
  }, [address]);

  const handleLike = useCallback((postId: string) => {
    if (address) likePost(postId, address);
  }, [address, likePost]);

  const handleRepost = useCallback((postId: string) => {
    if (address) repostPost(postId, address);
  }, [address, repostPost]);

  const handleComment = useCallback((postId: string, text: string) => {
    if (!address || !currentProfile) return;
    const comment: Comment = {
      id: `c-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      authorAddress: address,
      authorUsername: currentProfile.username,
      authorAvatar: currentProfile.avatar,
      text,
      createdAt: Date.now(),
    };
    addComment(postId, comment);
  }, [address, currentProfile, addComment]);

  const handleFollow = useCallback((targetAddress: string) => {
    if (address) followUser(address, targetAddress);
  }, [address, followUser]);

  const handleDelete = useCallback((postId: string) => {
    if (address) deletePost(postId, address);
  }, [address, deletePost]);

  const handlePostSuccess = useCallback((post: SynchraPost) => {
    addPost(post);
  }, [addPost]);

  const getProfileByAddress = useCallback((addr: string) => {
    return profilesMap.get(addr);
  }, [profilesMap]);

  // Profile page posts
  const profilePosts = profileViewAddress
    ? getSortedPosts('latest', profileViewAddress)
    : [];

  const isOwnProfile = profileViewAddress === address;
  const isFollowing = !!(address && profileViewAddress &&
    getProfile(address)?.following.includes(profileViewAddress));

  const handleEnter = useCallback(() => {
    try { sessionStorage.setItem('synchra_entered', '1'); } catch { /* noop */ }
    setShowSplash(false);
  }, []);

  return (
    <div className="min-h-dvh">
      <AnimatePresence>
        {showSplash && <BrandSplash onEnter={handleEnter} />}
      </AnimatePresence>
      <Navbar
        currentView={navView}
        currentProfile={currentProfile}
        currentAddress={address}
        onViewChange={handleNavChange}
      />

      <main className="pt-14">
        <AnimatePresence mode="wait">
          {navView === 'feed' && (
            <motion.div
              key="feed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <GlobalFeed
                posts={posts}
                currentAddress={address}
                currentProfile={currentProfile}
                getBadgesForUser={getBadgesForUser}
                getProfileByAddress={getProfileByAddress}
                getSortedPosts={sort => getSortedPosts(sort)}
                onNewPost={() => setShowNewPost(true)}
                onLike={handleLike}
                onRepost={handleRepost}
                onComment={handleComment}
                onDelete={handleDelete}
                onNavigateToProfile={handleViewProfile}
              />
            </motion.div>
          )}

          {navView === 'profile' && viewedProfile && (
            <motion.div
              key={`profile-${profileViewAddress}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <ProfilePage
                profile={viewedProfile}
                isOwn={isOwnProfile}
                currentAddress={address}
                currentProfile={currentProfile}
                isFollowing={isFollowing}
                posts={profilePosts}
                getBadgesForUser={getBadgesForUser}
                getProfileByAddress={getProfileByAddress}
                onFollow={() => profileViewAddress && handleFollow(profileViewAddress)}
                onBack={() => { setNavView('feed'); setProfileViewAddress(null); }}
                onLike={handleLike}
                onRepost={handleRepost}
                onComment={handleComment}
                onDelete={handleDelete}
                onNavigateToProfile={handleViewProfile}
              />
            </motion.div>
          )}

          {navView === 'profile' && !viewedProfile && (
            <motion.div
              key="profile-empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-2xl mx-auto px-4 pt-16 text-center"
            >
              <p className="text-sm" style={{ color: 'var(--subtle)' }}>
                {isConnected ? 'Connect your wallet to view your profile.' : 'No profile found.'}
              </p>
            </motion.div>
          )}

          {navView === 'leaderboard' && (
            <motion.div
              key="leaderboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <LeaderboardView
                posts={posts}
                getAllProfiles={getAllProfiles}
                getBadgesForUser={getBadgesForUser}
                onNavigateToProfile={handleViewProfile}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Onboarding */}
      {needsOnboarding && (
        <OnboardingModal
          address={address}
          isUsernameTaken={isUsernameTaken}
          onComplete={(username, avatar, bio) => {
            createProfile(address, username, avatar, bio);
          }}
        />
      )}

      {/* New post */}
      <AnimatePresence>
        {showNewPost && currentProfile && address && (
          <NewPostModal
            profile={currentProfile}
            onClose={() => setShowNewPost(false)}
            onSuccess={handlePostSuccess}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
