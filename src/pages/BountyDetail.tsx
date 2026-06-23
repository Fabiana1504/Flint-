import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, AlertCircle, CheckCircle2, Loader2, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CategoryPill } from '@/components/bounty/CategoryPill'
import { StatusBadge } from '@/components/bounty/StatusBadge'
import { SkeletonCard } from '@/components/common/SkeletonCard'
import { useBounty } from '@/hooks/useBounties'
import { useWallet } from '@/context/WalletContext'
import { claimBounty, approveBounty, markBountyPaid } from '@/lib/supabase'
import { sendPayment } from '@/lib/nimiq'
import { formatReward, timeAgo, shortenAddress, sanitizeUrl } from '@/lib/utils'

export function BountyDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { wallet, connect, connecting } = useWallet()
  const { bounty, loading, setBounty } = useBounty(id!)
  const [claiming, setClaiming] = useState(false)
  const [approving, setApproving] = useState(false)
  const [payError, setPayError] = useState<string | null>(null)

  async function handleClaim() {
    if (!wallet || !bounty) return
    setClaiming(true)
    try {
      const updated = await claimBounty(bounty.id, wallet.address)
      setBounty(updated)
    } finally {
      setClaiming(false)
    }
  }

  async function handleApprove() {
    if (!bounty || !wallet || !bounty.workerWallet) return
    setApproving(true)
    setPayError(null)
    try {
      const { txHash } = await sendPayment({
        recipient: bounty.workerWallet,
        amount: bounty.rewardAmount,
        currency: bounty.rewardCurrency,
        bountyId: bounty.id,
      })
      await approveBounty(bounty.id)
      const paid = await markBountyPaid(bounty.id, txHash)
      setBounty(paid)
    } catch (err) {
      setPayError(err instanceof Error ? err.message : 'Payment failed. Try again.')
    } finally {
      setApproving(false)
    }
  }

  if (loading) return (
    <div className="px-5 pt-6 space-y-4">
      <div className="h-10 w-32 shimmer rounded-xl" />
      <SkeletonCard />
      <SkeletonCard />
    </div>
  )

  if (!bounty) return (
    <div className="flex flex-col items-center justify-center min-h-screen px-5 text-center">
      <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mb-4">
        <AlertCircle size={28} className="text-gray-400" />
      </div>
      <h2 className="font-display font-bold text-text-primary text-xl mb-1">Bounty not found</h2>
      <p className="text-text-secondary text-sm mb-6">It may have been removed or the link is wrong.</p>
      <Button onClick={() => navigate('/browse')}>Browse bounties</Button>
    </div>
  )

  const isCreator = wallet?.address === bounty.creatorWallet
  const isWorker = wallet?.address === bounty.workerWallet
  const canClaim = bounty.status === 'open' && wallet && !isCreator
  const canSubmit = bounty.status === 'claimed' && isWorker
  const canApprove = bounty.status === 'submitted' && isCreator
  const isPaid = bounty.status === 'paid'

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Sticky header */}
      <div className="sticky top-0 bg-white/95 border-b border-gray-100 z-10 px-4 h-14 flex items-center gap-2">
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors press"
        >
          <ArrowLeft size={20} className="text-text-primary" />
        </button>
        <span className="font-display font-semibold text-text-primary text-[0.95rem]">Bounty</span>
      </div>

      <div className="px-4 pt-4 pb-6 flex flex-col gap-4">
        {/* Hero card */}
        <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden" style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>
          {/* Yellow accent bar */}
          <div className="h-1.5 bg-nimiq-yellow w-full" />
          <div className="p-5">
            <div className="flex items-start gap-2 mb-3 flex-wrap">
              <CategoryPill category={bounty.category} size="md" />
              <StatusBadge status={bounty.status} />
            </div>
            <h1 className="font-display font-bold text-text-primary text-[1.4rem] leading-tight mb-3">
              {bounty.title}
            </h1>
            <div className="flex items-center justify-between">
              <span className="font-display font-bold text-nimiq-yellow text-2xl">
                {formatReward(bounty.rewardAmount, bounty.rewardCurrency)}
              </span>
              <span className="text-xs text-text-secondary font-label bg-gray-50 px-3 py-1.5 rounded-full">
                {timeAgo(bounty.createdAt)}
              </span>
            </div>
          </div>
        </div>

        {/* Paid banner */}
        {isPaid && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center shrink-0">
              <CheckCircle2 size={18} className="text-green-600" />
            </div>
            <div>
              <p className="font-display font-semibold text-green-800 text-sm">Payment sent!</p>
              <p className="text-green-700 text-xs mt-0.5">{formatReward(bounty.rewardAmount, bounty.rewardCurrency)} sent to the worker.</p>
            </div>
          </div>
        )}

        {/* Description */}
        <Section title="Description">
          <p className="text-text-secondary text-sm leading-relaxed whitespace-pre-wrap">{bounty.description}</p>
        </Section>

        {/* Evidence required */}
        <div className="rounded-2xl p-4 border border-nimiq-yellow/30 bg-nimiq-yellow-light">
          <p className="text-[11px] font-label font-bold text-nimiq-yellow uppercase tracking-widest mb-1.5">Evidence required</p>
          <p className="text-text-primary text-sm leading-relaxed">{bounty.evidenceRequired}</p>
        </div>

        {/* Meta */}
        <Section title="Details">
          <div className="space-y-3">
            <MetaRow label="Posted by" value={shortenAddress(bounty.creatorWallet)} />
            {bounty.workerWallet && <MetaRow label="Claimed by" value={shortenAddress(bounty.workerWallet)} />}
            <MetaRow label="Posted" value={timeAgo(bounty.createdAt)} />
          </div>
        </Section>

        {/* Submitted work */}
        {bounty.submittedEvidence && (
          <Section title="Submitted work">
            <p className="text-text-secondary text-sm leading-relaxed whitespace-pre-wrap mb-3">{bounty.submittedEvidence}</p>
            {bounty.submittedLink && (
              <a
                href={sanitizeUrl(bounty.submittedLink)}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-1.5 text-nimiq-yellow text-sm font-semibold"
              >
                View link <ExternalLink size={13} />
              </a>
            )}
          </Section>
        )}

        {/* Error */}
        {payError && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
            <AlertCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
            <p className="text-red-700 text-sm">{payError}</p>
          </div>
        )}

        {/* CTA */}
        <div className="pt-2">
          {!wallet ? (
            <Button size="lg" className="w-full" onClick={connect} disabled={connecting}>
              {connecting ? 'Connecting…' : 'Connect wallet to claim'}
            </Button>
          ) : canClaim ? (
            <Button size="lg" className="w-full" onClick={handleClaim} disabled={claiming}>
              {claiming ? <><Loader2 size={16} className="animate-spin mr-2" />Claiming…</> : 'Claim this bounty'}
            </Button>
          ) : canSubmit ? (
            <Button size="lg" className="w-full" onClick={() => navigate(`/bounty/${bounty.id}/submit`)}>
              Submit your work
            </Button>
          ) : canApprove ? (
            <Button size="lg" className="w-full" onClick={handleApprove} disabled={approving}>
              {approving
                ? <><Loader2 size={16} className="animate-spin mr-2" />Sending payment…</>
                : `Approve & send ${formatReward(bounty.rewardAmount, bounty.rewardCurrency)}`}
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
      <p className="text-[11px] font-label font-bold text-text-secondary uppercase tracking-widest mb-3">{title}</p>
      {children}
    </div>
  )
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-text-secondary">{label}</span>
      <span className="text-sm font-medium text-text-primary">{value}</span>
    </div>
  )
}
