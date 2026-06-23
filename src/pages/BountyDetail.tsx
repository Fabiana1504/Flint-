import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, AlertCircle, CheckCircle2, Loader2, ExternalLink } from 'lucide-react'
import { CategoryPill } from '@/components/bounty/CategoryPill'
import { StatusBadge } from '@/components/bounty/StatusBadge'
import { SkeletonCard } from '@/components/common/SkeletonCard'
import { useBounty } from '@/hooks/useBounties'
import { useWallet } from '@/context/WalletContext'
import { claimBounty, approveBounty, markBountyPaid } from '@/lib/supabase'
import { sendPayment } from '@/lib/nimiq'
import { formatReward, timeAgo, shortenAddress } from '@/lib/utils'
import type { BountyCategory } from '@/types'

const CAT_ACCENT: Record<BountyCategory, string> = {
  Testing: '#A855F7', Design: '#EC4899', Writing: '#3B82F6', Survey: '#14B8A6', Dev: '#F97316',
}

export function BountyDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { wallet, connect, connecting } = useWallet()
  const { bounty, loading, setBounty } = useBounty(id!)
  const [claiming, setClaiming]   = useState(false)
  const [approving, setApproving] = useState(false)
  const [payError, setPayError]   = useState<string | null>(null)

  async function handleClaim() {
    if (!wallet || !bounty) return
    setClaiming(true)
    try { setBounty(await claimBounty(bounty.id, wallet.address)) }
    finally { setClaiming(false) }
  }

  async function handleApprove() {
    if (!bounty || !wallet || !bounty.workerWallet) return
    setApproving(true); setPayError(null)
    try {
      let txHash: string

      if (bounty.status === 'submitted') {
        // Send NIM first, then lock status to 'approved' in the DB.
        // We update local state to 'approved' immediately so that if
        // markBountyPaid fails below, the next tap skips sendPayment
        // and doesn't charge the wallet again.
        const result = await sendPayment({
          recipient: bounty.workerWallet,
          amount: bounty.rewardAmount,
          currency: bounty.rewardCurrency,
          bountyId: bounty.id,
        })
        txHash = result.txHash
        const approvedBounty = await approveBounty(bounty.id)
        setBounty(approvedBounty) // guard: any retry from here won't re-send NIM
      } else {
        // Recovery: payment was already sent but markBountyPaid failed.
        // Don't re-send NIM — just complete the DB record.
        txHash = `recovery-${bounty.id.slice(0, 8)}`
      }

      setBounty(await markBountyPaid(bounty.id, txHash))
    } catch (err) {
      // Extract message from Error objects AND Supabase PostgrestError objects
      const msg =
        err instanceof Error
          ? err.message
          : typeof err === 'object' && err !== null && 'message' in err
            ? String((err as { message: unknown }).message)
            : 'Could not complete payment. Please try again.'
      setPayError(msg)
    } finally { setApproving(false) }
  }

  if (loading) return (
    <div className="px-4 pt-6 space-y-4 bg-background min-h-screen">
      <div className="h-8 w-40 shimmer rounded-xl" />
      <SkeletonCard /><SkeletonCard />
    </div>
  )

  if (!bounty) return (
    <div className="flex flex-col items-center justify-center min-h-screen px-5 text-center bg-background">
      <div className="w-16 h-16 rounded-3xl bg-white flex items-center justify-center mb-4" style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
        <AlertCircle size={28} className="text-gray-400" />
      </div>
      <h2 className="font-display font-bold text-text-primary text-xl mb-1">Bounty not found</h2>
      <p className="text-text-secondary text-sm mb-6">The link may be wrong or the bounty was removed.</p>
      <button onClick={() => navigate('/browse')} className="h-12 px-6 rounded-2xl font-bold text-nimiq-dark text-sm press"
        style={{ background: 'linear-gradient(135deg,#F5A623,#F7C04A)', boxShadow: '0 4px 16px rgba(245,166,35,0.4)' }}>
        Browse bounties
      </button>
    </div>
  )

  const isCreator  = wallet?.address === bounty.creatorWallet
  const isWorker   = wallet?.address === bounty.workerWallet
  const canClaim   = bounty.status === 'open'      && wallet && !isCreator
  const canSubmit  = bounty.status === 'claimed'   && isWorker
  // 'approved' means payment was sent but DB update to 'paid' failed — show retry button
  const canApprove = (bounty.status === 'submitted' || bounty.status === 'approved') && isCreator
  const isPaid     = bounty.status === 'paid'
  const accent     = CAT_ACCENT[bounty.category]

  return (
    <div className="flex flex-col min-h-screen bg-background">

      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/95 border-b border-gray-100 px-4 h-14 flex items-center gap-2">
        <button onClick={() => navigate(-1)} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors press">
          <ArrowLeft size={20} className="text-text-primary" />
        </button>
        <span className="font-display font-bold text-text-primary text-[0.95rem]">Bounty</span>
      </div>

      <div className="px-4 pt-4 pb-6 flex flex-col gap-4">

        {/* Hero card */}
        <div className="bg-white rounded-3xl overflow-hidden" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
          <div className="h-1.5" style={{ background: accent }} />
          <div className="p-5">
            <div className="flex flex-wrap gap-2 mb-3">
              <CategoryPill category={bounty.category} size="md" />
              <StatusBadge status={bounty.status} />
            </div>
            <h1 className="font-display font-extrabold text-text-primary text-2xl leading-tight mb-4" style={{ letterSpacing: '-0.02em' }}>
              {bounty.title}
            </h1>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-[11px] text-text-muted font-semibold uppercase tracking-widest mb-1">Reward</p>
                <span className="font-display font-extrabold text-3xl" style={{ color: accent }}>
                  {formatReward(bounty.rewardAmount, bounty.rewardCurrency)}
                </span>
              </div>
              <span className="text-xs text-text-muted bg-gray-50 px-3 py-1.5 rounded-full font-medium">
                {timeAgo(bounty.createdAt)}
              </span>
            </div>
          </div>
        </div>

        {/* Paid banner */}
        {isPaid && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-green-100 flex items-center justify-center shrink-0">
              <CheckCircle2 size={20} className="text-green-600" />
            </div>
            <div>
              <p className="font-bold text-green-800 text-sm">Payment sent!</p>
              <p className="text-green-700 text-xs mt-0.5">{formatReward(bounty.rewardAmount, bounty.rewardCurrency)} sent to the worker.</p>
            </div>
          </div>
        )}

        {/* Description */}
        <Card title="Description">
          <p className="text-text-secondary text-sm leading-relaxed whitespace-pre-wrap">{bounty.description}</p>
        </Card>

        {/* Evidence required */}
        <div className="rounded-2xl p-4 border-2 bg-nimiq-yellow-light" style={{ borderColor: 'rgba(245,166,35,0.3)' }}>
          <p className="text-[11px] font-bold text-nimiq-yellow uppercase tracking-widest mb-2">Evidence required</p>
          <p className="text-text-primary text-sm leading-relaxed">{bounty.evidenceRequired}</p>
        </div>

        {/* Details */}
        <Card title="Details">
          <div className="space-y-3">
            <MetaRow label="Posted by"  value={shortenAddress(bounty.creatorWallet)} />
            {bounty.workerWallet && <MetaRow label="Claimed by" value={shortenAddress(bounty.workerWallet)} />}
            <MetaRow label="Posted"     value={timeAgo(bounty.createdAt)} />
          </div>
        </Card>

        {/* Submitted work */}
        {bounty.submittedEvidence && (
          <Card title="Submitted work">
            <p className="text-text-secondary text-sm leading-relaxed whitespace-pre-wrap mb-3">{bounty.submittedEvidence}</p>
            {bounty.submittedLink && (
              <a href={bounty.submittedLink} target="_blank" rel="noreferrer noopener"
                className="inline-flex items-center gap-1.5 font-bold text-sm"
                style={{ color: accent }}>
                View link <ExternalLink size={13} />
              </a>
            )}
          </Card>
        )}

        {/* Error */}
        {payError && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
            <AlertCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
            <p className="text-red-700 text-sm">{payError}</p>
          </div>
        )}

        {/* CTA */}
        <div className="pt-1">
          {!wallet ? (
            <CTA label={connecting ? 'Connecting…' : 'Connect wallet to claim'} onClick={connect} disabled={connecting} />
          ) : canClaim ? (
            <CTA label={claiming ? 'Claiming…' : 'Claim this bounty'} onClick={handleClaim} disabled={claiming} loading={claiming} />
          ) : canSubmit ? (
            <CTA label="Submit your work" onClick={() => navigate(`/bounty/${bounty.id}/submit`)} />
          ) : canApprove ? (
            <>
              {bounty.status === 'approved' && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 mb-3 flex items-start gap-2.5">
                  <AlertCircle size={16} className="text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-amber-800 text-xs font-medium leading-relaxed">
                    Payment was sent but the record wasn't saved. Tap below to complete the approval without sending NIM again.
                  </p>
                </div>
              )}
              <CTA
                label={
                  approving
                    ? 'Completing…'
                    : bounty.status === 'approved'
                      ? 'Complete approval (NIM already sent)'
                      : `Approve & send ${formatReward(bounty.rewardAmount, bounty.rewardCurrency)}`
                }
                onClick={handleApprove}
                disabled={approving}
                loading={approving}
              />
            </>
          ) : null}
        </div>
      </div>
    </div>
  )
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl p-4" style={{ boxShadow: '0 1px 6px rgba(0,0,0,0.05)' }}>
      <p className="text-[11px] font-bold text-text-muted uppercase tracking-widest mb-3">{title}</p>
      {children}
    </div>
  )
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-text-secondary">{label}</span>
      <span className="text-sm font-semibold text-text-primary">{value}</span>
    </div>
  )
}

function CTA({ label, onClick, disabled, loading }: { label: string; onClick: () => void; disabled?: boolean; loading?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full h-14 rounded-2xl font-display font-bold text-nimiq-dark text-base disabled:opacity-60 flex items-center justify-center gap-2 press"
      style={{ background: 'linear-gradient(135deg, #F5A623, #F7C04A)', boxShadow: '0 4px 20px rgba(245,166,35,0.4)' }}
    >
      {loading && <Loader2 size={18} className="animate-spin" />}
      {label}
    </button>
  )
}
