import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, AlertCircle, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CategoryPill } from '@/components/bounty/CategoryPill'
import { StatusBadge } from '@/components/bounty/StatusBadge'
import { SkeletonCard } from '@/components/common/SkeletonCard'
import { useBounty } from '@/hooks/useBounties'
import { useWallet } from '@/context/WalletContext'
import { claimBounty, approveBounty } from '@/lib/supabase'
import { formatReward, timeAgo, shortenAddress } from '@/lib/utils'

export function BountyDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { wallet, connect, connecting } = useWallet()
  const { bounty, loading, setBounty } = useBounty(id!)

  async function handleClaim() {
    if (!wallet || !bounty) return
    const updated = await claimBounty(bounty.id, wallet.address)
    setBounty(updated)
  }

  async function handleApprove() {
    if (!bounty) return
    const updated = await approveBounty(bounty.id)
    setBounty(updated)
    navigate(`/bounty/${bounty.id}/submit`)
  }

  if (loading) {
    return (
      <div className="px-5 pt-6">
        <div className="h-10 w-10 mb-6" />
        <SkeletonCard />
      </div>
    )
  }

  if (!bounty) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-5 text-center">
        <AlertCircle size={40} className="text-text-secondary mb-3" />
        <h2 className="font-display font-semibold text-text-primary text-h2">Bounty not found</h2>
        <Button className="mt-5" onClick={() => navigate('/browse')}>Back to browse</Button>
      </div>
    )
  }

  const isCreator = wallet?.address === bounty.creatorWallet
  const isWorker = wallet?.address === bounty.workerWallet
  const canClaim = bounty.status === 'open' && wallet && !isCreator
  const canSubmit = bounty.status === 'claimed' && isWorker
  const canApprove = bounty.status === 'submitted' && isCreator

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-100 z-10 px-5 py-4 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="h-9 w-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
          <ArrowLeft size={20} className="text-text-primary" />
        </button>
        <span className="font-display font-semibold text-text-primary">Bounty detail</span>
      </div>

      <div className="px-5 pt-5 pb-32 flex flex-col gap-5">
        {/* Category + Status */}
        <div className="flex items-center gap-2 flex-wrap">
          <CategoryPill category={bounty.category} size="md" />
          <StatusBadge status={bounty.status} />
        </div>

        {/* Title + reward */}
        <div>
          <h1 className="font-display font-bold text-text-primary text-[1.5rem] leading-snug mb-2">
            {bounty.title}
          </h1>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-display font-bold text-nimiq-yellow">
              {formatReward(bounty.rewardAmount, bounty.rewardCurrency)}
            </span>
          </div>
        </div>

        {/* Description */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-4">
          <h3 className="font-display font-semibold text-text-primary text-sm mb-2">Description</h3>
          <p className="text-text-secondary text-sm leading-relaxed whitespace-pre-wrap">{bounty.description}</p>
        </div>

        {/* Evidence required */}
        <div className="bg-nimiq-yellow-light rounded-2xl p-4">
          <h3 className="font-display font-semibold text-text-primary text-sm mb-1">Evidence required</h3>
          <p className="text-text-secondary text-sm leading-relaxed">{bounty.evidenceRequired}</p>
        </div>

        {/* Meta */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-4 space-y-2.5">
          <Row label="Posted by" value={shortenAddress(bounty.creatorWallet)} />
          {bounty.workerWallet && (
            <Row label="Claimed by" value={shortenAddress(bounty.workerWallet)} />
          )}
          <Row label="Posted" value={timeAgo(bounty.createdAt)} icon={<Clock size={13} className="text-text-secondary" />} />
        </div>

        {/* Submitted evidence */}
        {bounty.submittedEvidence && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-4">
            <h3 className="font-display font-semibold text-text-primary text-sm mb-2">Submitted work</h3>
            <p className="text-text-secondary text-sm leading-relaxed whitespace-pre-wrap mb-2">{bounty.submittedEvidence}</p>
            {bounty.submittedLink && (
              <a href={bounty.submittedLink} target="_blank" rel="noreferrer" className="text-nimiq-yellow text-sm font-medium underline break-all">
                {bounty.submittedLink}
              </a>
            )}
          </div>
        )}
      </div>

      {/* CTA */}
      <div className="fixed bottom-16 left-1/2 -translate-x-1/2 w-full max-w-app px-5 pb-4 bg-gradient-to-t from-background via-background to-transparent pt-6">
        {!wallet ? (
          <Button size="lg" className="w-full" onClick={connect} disabled={connecting}>
            {connecting ? 'Connecting…' : 'Connect wallet to claim'}
          </Button>
        ) : canClaim ? (
          <Button size="lg" className="w-full" onClick={handleClaim}>
            Claim this bounty
          </Button>
        ) : canSubmit ? (
          <Button size="lg" className="w-full" onClick={() => navigate(`/bounty/${bounty.id}/submit`)}>
            Submit your work
          </Button>
        ) : canApprove ? (
          <Button size="lg" className="w-full" onClick={handleApprove}>
            Approve & release payment
          </Button>
        ) : null}
      </div>
    </div>
  )
}

function Row({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-text-secondary font-label">{label}</span>
      <div className="flex items-center gap-1 text-xs font-label font-medium text-text-primary">
        {icon}
        {value}
      </div>
    </div>
  )
}
