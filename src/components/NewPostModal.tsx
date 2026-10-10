import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Loader2, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useSwitchChain } from 'wagmi';
import { erc20Abi } from 'viem';
import { getUsdc, buildTxExplorerUrl } from '@/onchain-facts';
import { parseAmount } from '@/onchain-money';
import { SynchraPost, UserProfile } from '../store/useSynchra';

const ARC_TESTNET_ID = 5042002;
const TREASURY = '0x37bd329e76761d7a1e98c6f639a6a3c6d8e9c73b' as const;
const TODAY = new Date().toISOString().slice(0, 10);

interface NewPostModalProps {
  profile: UserProfile;
  onClose: () => void;
  onSuccess: (post: SynchraPost) => void;
}

type TxStep = 'idle' | 'paying' | 'confirming' | 'success' | 'error';

function parseOnchainError(err: unknown): string {
  const msg = (err as { message?: string })?.message?.toLowerCase() ?? '';
  if (msg.includes('user rejected') || msg.includes('denied')) return 'Transaction cancelled.';
  if (msg.includes('insufficient')) return 'Insufficient USDC balance. Get test USDC from the sidebar.';
  if (msg.includes('reverted')) return 'Transaction reverted. Please try again.';
  return 'Something went wrong. Please try again.';
}

export function NewPostModal({ profile, onClose, onSuccess }: NewPostModalProps) {
  const { address, chainId } = useAccount();
  const { switchChain } = useSwitchChain();

  const [dateOfOccurrence, setDateOfOccurrence] = useState('');
  const [eventATitle, setEventATitle] = useState('');
  const [eventADesc, setEventADesc] = useState('');
  const [eventBTitle, setEventBTitle] = useState('');
  const [eventBDesc, setEventBDesc] = useState('');

  const [publishedForm, setPublishedForm] = useState<{
    dateOfOccurrence: string;
    eventATitle: string; eventADesc: string;
    eventBTitle: string; eventBDesc: string;
  } | null>(null);

  const [manualError, setManualError] = useState('');

  const { writeContract, data: txHash, isPending, error: writeError } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: txHash });

  const usdcFact = getUsdc(ARC_TESTNET_ID)!;

  const txStep: TxStep = (() => {
    if (manualError) return 'error';
    if (writeError) return 'error';
    if (isSuccess) return 'success';
    if (isConfirming) return 'confirming';
    if (isPending) return 'paying';
    return 'idle';
  })();

  const errorMsg = manualError || (writeError ? parseOnchainError(writeError) : '');

  useEffect(() => {
    if (isSuccess && txHash && publishedForm) {
      const post: SynchraPost = {
        id: `post-${txHash.slice(2, 10)}`,
        authorAddress: address!,
        authorUsername: profile.username,
        authorAvatar: profile.avatar,
        dateOfOccurrence: publishedForm.dateOfOccurrence,
        eventA: { title: publishedForm.eventATitle.trim(), description: publishedForm.eventADesc.trim() },
        eventB: { title: publishedForm.eventBTitle.trim(), description: publishedForm.eventBDesc.trim() },
        createdAt: Date.now(),
        likes: [],
        reposts: [],
        comments: [],
        txHash,
      };
      onSuccess(post);
      const t = window.setTimeout(onClose, 2200);
      return () => window.clearTimeout(t);
    }
    return undefined;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuccess, txHash]);

  const isValid = !!(dateOfOccurrence && eventATitle.trim() && eventADesc.trim() && eventBTitle.trim() && eventBDesc.trim());
  const isProcessing = txStep === 'paying' || txStep === 'confirming';

  const handlePublish = useCallback(() => {
    if (!address || !isValid) return;
    if (chainId !== ARC_TESTNET_ID) { switchChain({ chainId: ARC_TESTNET_ID }); return; }
    setManualError('');
    setPublishedForm({ dateOfOccurrence, eventATitle, eventADesc, eventBTitle, eventBDesc });
    try {
      const amount = parseAmount(ARC_TESTNET_ID, '0.01');
      writeContract({
        address: usdcFact.address as `0x${string}`,
        abi: erc20Abi,
        functionName: 'transfer',
        args: [TREASURY, amount.raw],
        chainId: ARC_TESTNET_ID,
      });
    } catch (e) {
      setManualError(parseOnchainError(e));
    }
  }, [address, isValid, chainId, switchChain, dateOfOccurrence, eventATitle, eventADesc, eventBTitle, eventBDesc, writeContract, usdcFact.address]);

  const handleRetry = useCallback(() => { setManualError(''); setPublishedForm(null); }, []);

  /* ── Shared input style ── */
  const inputStyle = { background: 'var(--surface-strong)', border: '1px solid var(--border)', color: 'var(--ink)' };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
        style={{ background: 'rgba(12,15,20,0.88)', backdropFilter: 'blur(8px)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={e => { if (e.target === e.currentTarget && !isProcessing) onClose(); }}
      >
        <motion.div
          className="glass-strong w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl overflow-hidden relative"
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 30 }}
          style={{ maxHeight: '92dvh', display: 'flex', flexDirection: 'column' }}
        >
          {/* Drag handle (mobile) */}
          <div className="flex justify-center pt-3 sm:hidden">
            <div className="w-10 h-1 rounded-full" style={{ background: 'var(--border-strong)' }} />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
            <h2 className="display font-600 text-lg" style={{ color: 'var(--ink)' }}>Log a Synchronicity</h2>
            {!isProcessing && (
              <button
                onClick={onClose}
                className="p-2 rounded-xl transition-all"
                style={{ color: 'var(--muted)' }}
                onMouseEnter={e => { (e.currentTarget).style.background = 'var(--accent-subtle)'; }}
                onMouseLeave={e => { (e.currentTarget).style.background = 'transparent'; }}
              >
                <X size={18} />
              </button>
            )}
          </div>

          {/* Tx overlay */}
          <AnimatePresence>
            {(txStep !== 'idle') && (
              <motion.div
                className="absolute inset-0 z-10 flex flex-col items-center justify-center p-8"
                style={{ background: 'rgba(12,15,20,0.96)', backdropFilter: 'blur(12px)' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {txStep === 'paying' && (
                  <div className="flex flex-col items-center gap-4 text-center">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: 'var(--accent-glow)', border: '2px solid var(--accent)' }}>
                      <Loader2 size={28} className="animate-spin" style={{ color: 'var(--accent)' }} />
                    </div>
                    <p className="display font-600 text-lg" style={{ color: 'var(--ink)' }}>Confirm in wallet</p>
                    <p className="text-sm" style={{ color: 'var(--muted)' }}>Approve sending 0.01 USDC platform fee</p>
                    <div className="px-4 py-2.5 rounded-xl text-sm font-medium tabular-nums" style={{ background: 'var(--surface-strong)', color: 'var(--ink-2)', border: '1px solid var(--border)' }}>
                      0.01 USDC → Platform fee
                    </div>
                  </div>
                )}
                {txStep === 'confirming' && (
                  <div className="flex flex-col items-center gap-4 text-center">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: 'rgba(110,231,183,0.1)', border: '2px solid var(--success)' }}>
                      <Loader2 size={28} className="animate-spin" style={{ color: 'var(--success)' }} />
                    </div>
                    <p className="display font-600 text-lg" style={{ color: 'var(--ink)' }}>Anchoring to Arc</p>
                    <p className="text-sm" style={{ color: 'var(--muted)' }}>Waiting for block confirmation…</p>
                  </div>
                )}
                {txStep === 'success' && (
                  <div className="flex flex-col items-center gap-4 text-center">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: 'rgba(110,231,183,0.1)', border: '2px solid var(--success)' }}>
                      <CheckCircle size={28} style={{ color: 'var(--success)' }} />
                    </div>
                    <p className="display font-600 text-lg" style={{ color: 'var(--ink)' }}>Synchronicity logged</p>
                    <p className="text-sm" style={{ color: 'var(--muted)' }}>Your coincidence is now onchain.</p>
                    {txHash && (
                      <a href={buildTxExplorerUrl(ARC_TESTNET_ID, txHash)} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--accent)' }}>
                        <ExternalLink size={12} /> View on Arc Explorer
                      </a>
                    )}
                  </div>
                )}
                {txStep === 'error' && (
                  <div className="flex flex-col items-center gap-4 text-center">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: 'rgba(248,113,113,0.1)', border: '2px solid var(--danger)' }}>
                      <AlertCircle size={28} style={{ color: 'var(--danger)' }} />
                    </div>
                    <p className="display font-600 text-lg" style={{ color: 'var(--ink)' }}>Could not publish</p>
                    <p className="text-sm" style={{ color: 'var(--muted)' }}>{errorMsg}</p>
                    <button onClick={handleRetry} className="px-5 py-2.5 rounded-xl text-sm font-semibold"
                      style={{ background: 'var(--surface-strong)', color: 'var(--ink-2)', border: '1px solid var(--border)' }}>
                      Try again
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
            {/* Date */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--subtle)' }}>
                Date of Occurrence
              </label>
              <div className="relative">
                <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--subtle)' }} />
                <input type="date" value={dateOfOccurrence} onChange={e => setDateOfOccurrence(e.target.value)} max={TODAY}
                  className="w-full pl-9 pr-4 py-3 rounded-xl text-sm outline-none"
                  style={{ ...inputStyle, colorScheme: 'dark' }} />
              </div>
            </div>

            {/* Event A */}
            <div className="rounded-xl p-4 space-y-3" style={{ background: 'var(--accent-subtle)', border: '1px solid var(--border-strong)' }}>
              <div className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--accent)' }}>Event A</div>
              <input type="text" value={eventATitle} onChange={e => setEventATitle(e.target.value)}
                placeholder="Title (e.g. The Lightning Strike)" maxLength={80}
                className="w-full px-3 py-2.5 rounded-lg text-sm outline-none" style={inputStyle} />
              <textarea value={eventADesc} onChange={e => setEventADesc(e.target.value)}
                placeholder="Describe what happened in detail…" maxLength={600} rows={3}
                className="w-full px-3 py-2.5 rounded-lg text-sm outline-none resize-none" style={inputStyle} />
            </div>

            {/* Connector */}
            <div className="flex items-center justify-center gap-3">
              <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
              <div className="text-base font-bold" style={{ color: 'var(--accent)', opacity: 0.7 }}>↔</div>
              <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
            </div>

            {/* Event B */}
            <div className="rounded-xl p-4 space-y-3" style={{ background: 'var(--accent-subtle)', border: '1px solid var(--border-strong)' }}>
              <div className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--accent)' }}>Event B</div>
              <input type="text" value={eventBTitle} onChange={e => setEventBTitle(e.target.value)}
                placeholder="Title (e.g. The Phone Call)" maxLength={80}
                className="w-full px-3 py-2.5 rounded-lg text-sm outline-none" style={inputStyle} />
              <textarea value={eventBDesc} onChange={e => setEventBDesc(e.target.value)}
                placeholder="Describe the synchronicity connection…" maxLength={600} rows={3}
                className="w-full px-3 py-2.5 rounded-lg text-sm outline-none resize-none" style={inputStyle} />
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 pb-6 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs" style={{ color: 'var(--subtle)' }}>Platform fee</span>
              <span className="text-xs font-semibold tabular-nums" style={{ color: 'var(--ink-2)' }}>0.01 USDC</span>
            </div>
            <button
              onClick={handlePublish}
              disabled={!isValid || isProcessing}
              className="w-full py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
              style={{ background: '#E4F2F2', color: '#0c1a1a' }}
            >
              {chainId !== ARC_TESTNET_ID ? 'Switch to Arc Testnet' : 'Publish · 0.01 USDC'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
