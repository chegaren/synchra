import { Home, User, Trophy } from 'lucide-react';
import { SynchraLogo } from './SynchraLogo';
import { ConnectKitButton } from 'connectkit';
import { Avatar } from './Avatar';
import { UserProfile } from '../store/useSynchra';

export type NavView = 'feed' | 'profile' | 'leaderboard';

interface NavbarProps {
  currentView: NavView;
  currentProfile?: UserProfile;
  currentAddress?: string;
  onViewChange: (view: NavView) => void;
}

export function Navbar({ currentView, currentProfile, currentAddress, onViewChange }: NavbarProps) {
  return (
    <header
      className="fixed top-0 left-0 right-0 z-40"
      style={{
        background: 'rgba(17,20,24,0.88)',
        backdropFilter: 'blur(14px)',
        borderBottom: '1px solid var(--border)',
      }}
    >
      <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">

        {/* Logo wordmark */}
        <button
          onClick={() => onViewChange('feed')}
          className="flex items-center group"
          aria-label="Synchra home"
        >
          <SynchraLogo
            width={116}
            color="#E4F2F2"
            className="hidden sm:block opacity-80 group-hover:opacity-100 transition-opacity duration-150"
          />
          <SynchraLogo
            width={78}
            color="#E4F2F2"
            className="sm:hidden opacity-80 group-hover:opacity-100 transition-opacity duration-150"
          />
        </button>

        {/* Desktop nav */}
        <nav className="hidden sm:flex items-center gap-1">
          {([
            { view: 'feed'        as NavView, icon: <Home   size={15} />, label: 'Feed'        },
            { view: 'leaderboard' as NavView, icon: <Trophy size={15} />, label: 'Leaderboard' },
          ] as const).map(item => (
            <button
              key={item.view}
              onClick={() => onViewChange(item.view)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all"
              style={currentView === item.view ? {
                color: 'var(--accent)',
                background: 'var(--accent-glow)',
                border: '1px solid rgba(228,242,242,0.18)',
              } : {
                color: 'var(--muted)',
                border: '1px solid transparent',
              }}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        {/* Right: profile chip or connect */}
        <div className="flex items-center gap-2">
          {currentAddress && currentProfile ? (
            <button
              onClick={() => onViewChange('profile')}
              className="flex items-center gap-2 px-2 py-1.5 rounded-xl transition-all"
              style={{ border: '1px solid transparent' }}
              onMouseEnter={e => { (e.currentTarget).style.borderColor = 'var(--border)'; }}
              onMouseLeave={e => { (e.currentTarget).style.borderColor = 'transparent'; }}
            >
              <Avatar src={currentProfile.avatar} username={currentProfile.username} size={28} />
              <span className="text-sm font-medium hidden sm:block" style={{ color: 'var(--ink-2)' }}>
                @{currentProfile.username}
              </span>
            </button>
          ) : (
            <ConnectKitButton
              customTheme={{
                '--ck-font-family':                 "'DM Sans', sans-serif",
                '--ck-primary-button-background':   '#E4F2F2',
                '--ck-primary-button-color':        '#0c1a1a',
                '--ck-primary-button-hover-background': '#f2fafa',
                '--ck-body-background':             '#1a1f28',
                '--ck-body-color':                  '#edf4f4',
                '--ck-border-radius':               '12px',
                '--ck-overlay-background':          'rgba(12,15,20,0.88)',
              }}
            />
          )}
        </div>
      </div>

      {/* Mobile bottom nav */}
      <div
        className="sm:hidden fixed bottom-0 left-0 right-0 flex items-center justify-around px-4 py-2"
        style={{
          background: 'rgba(17,20,24,0.94)',
          backdropFilter: 'blur(14px)',
          borderTop: '1px solid var(--border)',
        }}
      >
        {([
          { view: 'feed'        as NavView, icon: <Home size={20} />, label: 'Feed' },
          { view: 'leaderboard' as NavView, icon: <Trophy size={20} />, label: 'Boards' },
          {
            view: 'profile' as NavView,
            icon: currentProfile
              ? <Avatar src={currentProfile.avatar} username={currentProfile.username} size={24} />
              : <User size={20} />,
            label: 'Profile',
          },
        ] as const).map(item => (
          <button
            key={item.view}
            onClick={() => onViewChange(item.view)}
            className="flex flex-col items-center gap-0.5 py-1 px-4 rounded-xl min-w-[56px] transition-colors"
            style={{ color: currentView === item.view ? 'var(--accent)' : 'var(--subtle)' }}
          >
            {item.icon}
            <span className="text-[10px] font-medium">{item.label}</span>
          </button>
        ))}
      </div>
    </header>
  );
}
