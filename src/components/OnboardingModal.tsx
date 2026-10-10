import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, AtSign, FileText, Loader2 } from 'lucide-react';
import { SynchraLogo } from './SynchraLogo';

interface OnboardingModalProps {
  address: string;
  isUsernameTaken: (u: string, exclude?: string) => boolean;
  onComplete: (username: string, avatar: string | null, bio: string) => void;
}

export function OnboardingModal({ address, isUsernameTaken, onComplete }: OnboardingModalProps) {
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ username?: string }>({});
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) return;
    const reader = new FileReader();
    reader.onload = ev => setAvatar(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const validate = () => {
    const errs: { username?: string } = {};
    if (!username.trim()) errs.username = 'Username is required.';
    else if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) errs.username = '3–20 chars: letters, numbers, underscores.';
    else if (isUsernameTaken(username)) errs.username = 'Username is taken.';
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true);
    await new Promise(r => setTimeout(r, 400));
    onComplete(username.trim(), avatar, bio.trim());
    setSaving(false);
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: 'rgba(12,15,20,0.88)', backdropFilter: 'blur(8px)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <motion.div
          className="glass-strong rounded-2xl w-full max-w-md p-8 relative"
          initial={{ scale: 0.92, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 280, damping: 28 }}
        >
          {/* Header */}
          <div className="flex flex-col items-center mb-7">
            <SynchraLogo width={140} color="#E4F2F2" className="mb-5 opacity-90" />
            {/* Accent divider */}
            <div className="divider-accent w-full mb-5" />
            <h1 className="display text-xl font-700 text-center" style={{ color: 'var(--ink)' }}>
              Set up your identity
            </h1>
            <p className="text-sm mt-1 text-center" style={{ color: 'var(--muted)' }}>
              Choose a handle and start sharing synchronicities.
            </p>
            <p className="mono text-xs mt-3 px-3 py-1.5 rounded-full" style={{ background: 'var(--surface)', color: 'var(--subtle)', border: '1px solid var(--border)' }}>
              {address.slice(0, 6)}…{address.slice(-4)}
            </p>
          </div>

          <form onSubmit={e => { void handleSubmit(e); }} className="space-y-5">
            {/* Avatar */}
            <div className="flex flex-col items-center">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="relative group rounded-full overflow-hidden flex items-center justify-center transition-all"
                style={{
                  width: 80, height: 80,
                  background: avatar ? 'transparent' : 'var(--surface-strong)',
                  border: '2px dashed var(--border-strong)',
                }}
              >
                {avatar
                  ? <img src={avatar} className="w-full h-full object-cover" alt="preview" />
                  : <Camera size={24} style={{ color: 'var(--muted)' }} />
                }
                <div
                  className="absolute inset-0 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ background: 'rgba(0,0,0,0.55)' }}
                >
                  <Camera size={18} className="text-white" />
                </div>
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
              <p className="text-xs mt-2" style={{ color: 'var(--subtle)' }}>Profile picture (optional, max 2MB)</p>
            </div>

            {/* Username */}
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--ink-2)' }}>Username</label>
              <div className="relative">
                <AtSign size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--subtle)' }} />
                <input
                  type="text"
                  value={username}
                  onChange={e => { setUsername(e.target.value); setErrors({}); }}
                  placeholder="your_handle"
                  maxLength={20}
                  className="w-full pl-9 pr-4 py-3 rounded-xl text-sm outline-none transition-all"
                  style={{
                    background: 'var(--surface)',
                    border: `1px solid ${errors.username ? 'var(--danger)' : 'var(--border)'}`,
                    color: 'var(--ink)',
                  }}
                  onFocus={e => { if (!errors.username) e.currentTarget.style.borderColor = 'var(--accent)'; }}
                  onBlur={e => { e.currentTarget.style.borderColor = errors.username ? 'var(--danger)' : 'var(--border)'; }}
                />
              </div>
              {errors.username && <p className="text-xs mt-1" style={{ color: 'var(--danger)' }}>{errors.username}</p>}
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--ink-2)' }}>
                Bio <span style={{ color: 'var(--subtle)' }}>(optional)</span>
              </label>
              <div className="relative">
                <FileText size={15} className="absolute left-3 top-3.5" style={{ color: 'var(--subtle)' }} />
                <textarea
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  placeholder="What draws you to synchronicities?"
                  maxLength={160}
                  rows={3}
                  className="w-full pl-9 pr-4 py-3 rounded-xl text-sm outline-none resize-none transition-all"
                  style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--ink)' }}
                  onFocus={e => { e.currentTarget.style.borderColor = 'var(--accent)'; }}
                  onBlur={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}
                />
              </div>
              <p className="text-xs text-right mt-0.5" style={{ color: 'var(--subtle)' }}>{bio.length}/160</p>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={saving}
              className="w-full py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-60"
              style={{
                background: saving ? 'var(--surface-strong)' : '#E4F2F2',
                color: saving ? 'var(--muted)' : '#0c1a1a',
              }}
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : null}
              {saving ? 'Creating profile…' : 'Enter Synchra'}
            </button>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
