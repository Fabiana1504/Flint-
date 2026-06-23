import { useNavigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { CategoryPill } from './CategoryPill'
import { StatusBadge } from './StatusBadge'
import { formatReward, timeAgo, shortenAddress } from '@/lib/utils'
import type { Bounty, BountyCategory } from '@/types'

const CAT_ACCENT: Record<BountyCategory, string> = {
  Testing: '#A855F7',
  Design:  '#EC4899',
  Writing: '#3B82F6',
  Survey:  '#14B8A6',
  Dev:     '#F97316',
}

export function BountyCard({ bounty }: { bounty: Bounty }) {
  const navigate = useNavigate()
  const accent = CAT_ACCENT[bounty.category]

  return (
    <div
      onClick={() => navigate(`/bounty/${bounty.id}`)}
      className="group relative bg-white rounded-3xl overflow-hidden cursor-pointer press"
      style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.07), 0 1px 3px rgba(0,0,0,0.04)' }}
    >
      {/* Category color top bar */}
      <div className="h-1" style={{ background: accent }} />

      <div className="p-4">
        {/* Top row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex flex-wrap items-center gap-1.5 min-w-0">
            <CategoryPill category={bounty.category} />
            <StatusBadge status={bounty.status} />
          </div>
          {/* Reward */}
          <div
            className="shrink-0 rounded-2xl px-3 py-1.5 flex items-baseline gap-1"
            style={{ background: 'linear-gradient(135deg, #F5A623 0%, #F7B844 100%)', boxShadow: '0 2px 8px rgba(245,166,35,0.35)' }}
          >
            <span className="text-[#18181B] font-display font-bold text-sm leading-none whitespace-nowrap">
              {formatReward(bounty.rewardAmount, bounty.rewardCurrency)}
            </span>
          </div>
        </div>

        {/* Title */}
        <h3 className="font-display font-bold text-text-primary text-[1rem] leading-snug mb-1.5 line-clamp-2">
          {bounty.title}
        </h3>

        {/* Description */}
        <p className="text-text-secondary text-sm leading-relaxed line-clamp-2 mb-4">
          {bounty.description}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-text-muted">
            by <span className="text-text-secondary font-medium">{shortenAddress(bounty.creatorWallet)}</span>
          </span>
          <div className="flex items-center gap-1 text-xs text-text-muted">
            {timeAgo(bounty.createdAt)}
            <ArrowRight size={11} className="opacity-40 group-active:opacity-100 transition-opacity" />
          </div>
        </div>
      </div>
    </div>
  )
}
