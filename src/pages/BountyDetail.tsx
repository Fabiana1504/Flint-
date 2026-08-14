import { useState, type ReactNode } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, AlertCircle, CheckCircle2, Loader2, ExternalLink, RotateCcw, Star } from 'lucide-react'
import { CategoryPill } from '@/components/bounty/CategoryPill'
import { StatusBadge } from '@/components/bounty/StatusBadge'
import { SkeletonCard } from '@/components/common/SkeletonCard'
import { useBounty } from '@/hooks/useBounties'
import { useWallet } from '@/context/WalletContext'
import { useLang } from '@/context/LangContext'
import { claimBounty, approveBounty, markBountyPaid, requestRevision, rateWorker } from '@/lib/supabase'
import { sendPayment } from '@/lib/nimiq'
import { formatReward, timeAgo, shortenAddress, cn } from '@/lib/utils'
import type { BountyCategory } from '@/types'

const CAT_ACCENT: Record<BountyCategory, string> = {
  Testing: '#A855F7', Design: '#EC4899', Writing: '#3B82F6', Survey: '#14B8A6', Dev: '#F97316',
}

export function BountyDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { wallet, connect, connecting } = useWallet()
  const { t, lang } = useLang()
  const { bounty, loading, setBounty } = useBounty(id)

  const [claiming, setClaiming]         = useState(false)
  const [approving, setApproving]       = useState(false)
  const [payError, setPayError]         = useState<string | null>(null)

  // Revision state
  const [showRevision, setShowRevision] = useState(false)
  const [revisionNote, setRevisionNote] = useState('')
  const [requesting, setRequesting]     = useState(false)

  // Rating state
  const [hoveredStar, setHoveredStar]   = useState(0)
  const [selectedStar, setSelectedStar] = useState(0)
  const [ratingComment, setRatingComment] = useState('')
  const [savingRating, setSavingRating] = useState(false)
  const [ratingSaved, setRatingSaved]   = useState(false)

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
        const result = await sendPayment({
          recipient: bounty.workerWallet,
          amount: bounty.rewardAmount,
          currency: bounty.rewardCurrency,
          bountyId: bounty.id,
        })
        txHash = result.txHash
        const approvedBounty = await approveBounty(bounty.id)
        setBounty(approvedBounty)
      } else {
        txHash = `recovery-${bounty.id.slice(0, 8)}`
      }
      setBounty(await markBountyPaid(bounty.id, txHash))
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : typeof err === 'object' && err !== null && 'message' in err
            ? String((err as { message: unknown }).message)
            : 'Could not complete payment. Please try again.'
      setPayError(msg)
    } finally { setApproving(false) }
  }

  async function handleRequestRevision() {
    if (!bounty || !revisionNote.trim()) return
    setRequesting(true)
    try {
      setBounty(await requestRevision(bounty.id, revisionNote.trim()))
      setShowRevision(false)
      setRevisionNote('')
    } finally { setRequesting(false) }
  }

  async function handleRating() {
    if (!bounty || !selectedStar || !bounty.workerWallet) return
    setSavingRating(true)
    try {
      setBounty(await rateWorker(bounty.id, bounty.workerWallet, selectedStar, ratingComment))
      setRatingSaved(true)
    } finally { setSavingRating(false) }
  }

  if (loading) return (
    <div className="px-4 pt-6 space-y-4 bg-background min-h-screen">
      <div className="h-8 w-40 shimmer rounded-xl" />
      <SkeletonCard /><SkeletonCard />
    </div>
  )

  if (!bounty) return (
    <div className="flex flex-col items-center justify-center min-h-screen px-5 text-center bg-background">
      <div className="w-16 h-16 rounded-3xl bg-surface border border-border flex items-center justify-center mb-4" style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
        <AlertCircle size={28} className="text-text-muted" />
      </div>
      <h2 className="font-display font-bold text-text-primary text-xl mb-1">{t.detail.notFound}</h2>
      <p className="text-text-secondary text-sm mb-6">{t.detail.notFoundDesc}</p>
      <button onClick={() => navigate('/browse')} className="h-12 px-6 rounded-2xl font-bold text-nimiq-dark text-sm press"
        style={{ background: 'linear-gradient(135deg,#F5A623,#F7C04A)', boxShadow: '0 4px 16px rgba(245,166,35,0.4)' }}>
        {t.detail.browseBounties}
      </button>
    </div>
  )

  const isCreator  = wallet?.address === bounty.creatorWallet
  const isWorker   = wallet?.address === bounty.workerWallet
  const canClaim   = bounty.status === 'open'      && wallet && !isCreator
  const canSubmit  = bounty.status === 'claimed'   && isWorker
  const canApprove = (bounty.status === 'submitted' || bounty.status === 'approved') && isCreator
  const isPaid     = bounty.status === 'paid'
  const canRate    = isPaid && isCreator && bounty.workerRating === null && !ratingSaved
  const accent     = CAT_ACCENT[bounty.category]

  const displayStar = hoveredStar || selectedStar

  return (
    <div className="flex flex-col min-h-screen bg-background">

      {/* Header */}
      <div className="sticky top-0 z-10 bg-surface/95 border-b border-border px-4 h-14 flex items-center gap-2">
        <button onClick={() => navigate(-1)} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-background transition-colors press">
          <ArrowLeft size={20} className="text-text-primary" />
        </button>
        <span className="font-display font-bold text-text-primary text-[0.95rem]">{t.detail.title}</span>
      </div>

      <div className="px-4 pt-4 pb-6 flex flex-col gap-4">

        {/* Hero card */}
        <div className="bg-surface rounded-3xl overflow-hidden" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
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
                <p className="text-[11px] text-text-muted font-semibold uppercase tracking-widest mb-1">{t.detail.reward}</p>
                <span className="font-display font-extrabold text-3xl" style={{ color: accent }}>
                  {formatReward(bounty.rewardAmount, bounty.rewardCurrency)}
                </span>
              </div>
              <span className="text-xs text-text-muted bg-background px-3 py-1.5 rounded-full font-medium">
                {timeAgo(bounty.createdAt, lang)}
              </span>
            </div>
          </div>
        </div>

        {/* Paid banner */}
        {isPaid && (
          <div className="bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-green-100 dark:bg-green-900/50 flex items-center justify-center shrink-0">
              <CheckCircle2 size={20} className="text-green-600" />
            </div>
            <div>
              <p className="font-bold text-green-800 dark:text-green-400 text-sm">{t.detail.paymentSent}</p>
              <p className="text-green-700 dark:text-green-500 text-xs mt-0.5">{formatReward(bounty.rewardAmount, bounty.rewardCurrency)} {t.detail.paymentSentTo}</p>
            </div>
          </div>
        )}

        {/* Revision feedback banner (shown to worker when status=claimed and revisionNote exists) */}
        {bounty.status === 'claimed' && bounty.revisionNote && isWorker && (
          <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center shrink-0 mt-0.5">
              <RotateCcw size={16} className="text-amber-600" />
            </div>
            <div>
              <p className="font-bold text-amber-800 dark:text-amber-400 text-sm mb-1">{t.revision.bannerTitle}</p>
              <p className="text-amber-700 dark:text-amber-500 text-xs mb-1.5">{t.revision.bannerDesc}</p>
              <p className="text-amber-900 dark:text-amber-300 text-sm leading-relaxed italic">"{bounty.revisionNote}"</p>
            </div>
          </div>
        )}

        {/* Description */}
        <Card title={t.detail.description}>
          <p className="text-text-secondary text-sm leading-relaxed whitespace-pre-wrap">{bounty.description}</p>
        </Card>

        {/* Evidence required */}
        <div className="rounded-2xl p-4 border-2 bg-nimiq-yellow-light dark:bg-nimiq-yellow/10" style={{ borderColor: 'rgba(245,166,35,0.3)' }}>
          <p className="text-[11px] font-bold text-nimiq-yellow uppercase tracking-widest mb-2">{t.detail.evidenceRequired}</p>
          <p className="text-text-primary text-sm leading-relaxed">{bounty.evidenceRequired}</p>
        </div>

        {/* Details */}
        <Card title={t.detail.details}>
          <div className="space-y-3">
            <MetaRow label={t.detail.postedBy}  value={shortenAddress(bounty.creatorWallet)} />
            {bounty.workerWallet && <MetaRow label={t.detail.claimedBy} value={shortenAddress(bounty.workerWallet)} />}
            <MetaRow label={t.detail.posted}    value={timeAgo(bounty.createdAt, lang)} />
          </div>
        </Card>

        {/* Submitted work */}
        {bounty.submittedEvidence && (
          <Card title={t.detail.submittedWork}>
            <p className="text-text-secondary text-sm leading-relaxed whitespace-pre-wrap mb-3">{bounty.submittedEvidence}</p>
            {bounty.submittedLink && (
              <a href={bounty.submittedLink} target="_blank" rel="noreferrer noopener"
                className="inline-flex items-center gap-1.5 font-bold text-sm"
                style={{ color: accent }}>
                {t.detail.viewLink} <ExternalLink size={13} />
              </a>
            )}
          </Card>
        )}

        {/* Rating — shown to creator after payment if not yet rated */}
        {(canRate || (isPaid && bounty.workerRating !== null)) && (
          <div className="bg-surface rounded-2xl p-4" style={{ boxShadow: '0 1px 6px rgba(0,0,0,0.05)' }}>
            <p className="text-[11px] font-bold text-text-muted uppercase tracking-widest mb-3">
              {bounty.workerRating !== null ? t.rating.rated : t.rating.title}
            </p>
            {bounty.workerRating !== null ? (
              /* Already rated */
              <div>
                <div className="flex gap-1 mb-2">
                  {[1,2,3,4,5].map(s => (
                    <Star key={s} size={20} strokeWidth={1.5}
                      className={s <= bounty.workerRating! ? 'text-nimiq-yellow fill-nimiq-yellow' : 'text-border'} />
                  ))}
                </div>
                {bounty.ratingComment && (
                  <p className="text-text-secondary text-sm italic">"{bounty.ratingComment}"</p>
                )}
              </div>
            ) : ratingSaved ? (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle2 size={16} />
                <span className="text-sm font-semibold">{t.rating.saved}</span>
              </div>
            ) : (
              /* Rating form */
              <div className="flex flex-col gap-3">
                <p className="text-text-secondary text-sm">{t.rating.subtitle}</p>
                <div className="flex gap-2">
                  {[1,2,3,4,5].map(s => (
                    <button
                      key={s}
                      type="button"
                      onMouseEnter={() => setHoveredStar(s)}
                      onMouseLeave={() => setHoveredStar(0)}
                      onClick={() => setSelectedStar(s)}
                      className="press"
                    >
                      <Star size={28} strokeWidth={1.5}
                        className={cn(
                          'transition-colors',
                          s <= displayStar ? 'text-nimiq-yellow fill-nimiq-yellow' : 'text-border'
                        )} />
                    </button>
                  ))}
                </div>
                <textarea
                  value={ratingComment}
                  onChange={e => setRatingComment(e.target.value)}
                  placeholder={t.rating.commentPlaceholder}
                  rows={2}
                  className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-nimiq-yellow/40 resize-none"
                />
                <button
                  onClick={handleRating}
                  disabled={!selectedStar || savingRating}
                  className="h-11 rounded-xl font-bold text-sm text-nimiq-dark disabled:opacity-40 press"
                  style={{ background: 'linear-gradient(135deg,#F5A623,#F7C04A)', boxShadow: '0 3px 12px rgba(245,166,35,0.35)' }}
                >
                  {savingRating ? t.rating.submitting : t.rating.submit}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Error */}
        {payError && (
          <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-2xl p-4 flex items-start gap-3">
            <AlertCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
            <p className="text-red-700 dark:text-red-400 text-sm">{payError}</p>
          </div>
        )}

        {/* CTA */}
        <div className="pt-1 flex flex-col gap-2">
          {!wallet ? (
            <CTA label={connecting ? t.dashboard.connecting : t.detail.connectToClaim} onClick={connect} disabled={connecting} />
          ) : canClaim ? (
            <CTA label={claiming ? t.detail.claiming : t.detail.claim} onClick={handleClaim} disabled={claiming} loading={claiming} />
          ) : canSubmit ? (
            <CTA label={t.detail.submitWork} onClick={() => navigate(`/bounty/${bounty.id}/submit`)} />
          ) : canApprove ? (
            <>
              {bounty.status === 'approved' ? (
                <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-2xl p-3 flex items-start gap-2.5">
                  <AlertCircle size={16} className="text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-amber-800 dark:text-amber-300 text-xs font-medium leading-relaxed">
                    {t.detail.recoveryWarning}
                  </p>
                </div>
              ) : null}

              {/* Revision inline form */}
              {showRevision ? (
                <div className="bg-surface rounded-2xl p-4 border border-border flex flex-col gap-3">
                  <p className="text-sm font-bold text-text-primary">{t.revision.noteLabel}</p>
                  <textarea
                    value={revisionNote}
                    onChange={e => setRevisionNote(e.target.value)}
                    placeholder={t.revision.notePlaceholder}
                    rows={3}
                    className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-nimiq-yellow/40 resize-none"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setShowRevision(false); setRevisionNote('') }}
                      className="flex-1 h-11 rounded-xl font-bold text-sm text-text-secondary border border-border bg-background press"
                    >
                      {t.revision.cancel}
                    </button>
                    <button
                      onClick={handleRequestRevision}
                      disabled={!revisionNote.trim() || requesting}
                      className="flex-1 h-11 rounded-xl font-bold text-sm text-nimiq-dark disabled:opacity-40 press"
                      style={{ background: 'linear-gradient(135deg,#F5A623,#F7C04A)' }}
                    >
                      {requesting ? t.revision.sending : t.revision.send}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2">
                  {/* Only show revision button when status=submitted (not on recovery path) */}
                  {bounty.status === 'submitted' && (
                    <button
                      onClick={() => setShowRevision(true)}
                      className="flex-1 h-14 rounded-2xl font-display font-bold text-text-primary text-sm border border-border bg-surface press"
                    >
                      <span className="flex items-center justify-center gap-1.5">
                        <RotateCcw size={15} strokeWidth={2.5} />
                        {t.revision.requestBtn}
                      </span>
                    </button>
                  )}
                  <CTA
                    className={bounty.status === 'submitted' ? 'flex-1' : 'w-full'}
                    label={
                      approving
                        ? t.detail.completing
                        : bounty.status === 'approved'
                          ? t.detail.completeApproval
                          : `${t.detail.approve} ${formatReward(bounty.rewardAmount, bounty.rewardCurrency)}`
                    }
                    onClick={handleApprove}
                    disabled={approving}
                    loading={approving}
                  />
                </div>
              )}
            </>
          ) : null}
        </div>
      </div>
    </div>
  )
}

function Card({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="bg-surface rounded-2xl p-4" style={{ boxShadow: '0 1px 6px rgba(0,0,0,0.05)' }}>
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

function CTA({ label, onClick, disabled, loading, className }: { label: string; onClick: () => void; disabled?: boolean; loading?: boolean; className?: string }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn('h-14 rounded-2xl font-display font-bold text-nimiq-dark text-base disabled:opacity-60 flex items-center justify-center gap-2 press', className)}
      style={{ background: 'linear-gradient(135deg, #F5A623, #F7C04A)', boxShadow: '0 4px 20px rgba(245,166,35,0.4)' }}
    >
      {loading && <Loader2 size={18} className="animate-spin" />}
      {label}
    </button>
  )
}
