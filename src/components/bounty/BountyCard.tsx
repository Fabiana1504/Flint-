import { useNavigate } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
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
      style={{
        boxShadow: '0 2px 12px rgba(0,0,0,0.07), 0 1px 3px rgba(0,0,0,0.04)',
        // Very subtle category tint on the card background
        background: `linear-gradient(180deg, ${accent}0B 0%, #ffffff 40%)`,
      }}
    >
      {/* Category color bar */}
      <div className="h-[3px]" style={{ background: `linear-gradient(90deg, ${accent}, ${accent}88)` }} />

      <div className="p-4">
        {/* Badges row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex flex-wrap items-center gap-1.5 min-w-0">
            <CategoryPill category={bounty.category} />
            <StatusBadge status={bounty.status} />
          </div>
          {/* Reward badge */}
          <div
            className="shrink-0 rounded-xl px-3 py-1.5"
            style={{ background: 'linear-gradient(135deg,#F7C04A 0%,#F5A623 100%)', boxShadow: '0 2px 10px rgba(245,166,35,0.38)' }}
          >
            <span className="font-display font-extrabold text-[#18181B] text-sm whitespace-nowrap">
              {formatReward(bounty.rewardAmount, bounty.rewardCurrency)}
            </span>
          </div>
        </div>

        {/* Title */}
        <h3 className="font-display font-bold text-text-primary text-[1.05rem] leading-snug mb-2 line-clamp-2"
          style={{ letterSpacing: '-0.01em' }}>
          {bounty.title}
        </h3>

        {/* Description */}
        <p className="text-text-secondary text-sm leading-relaxed line-clamp-2 mb-4">
          {bounty.description}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-black/[0.05]">
          <span className="text-xs text-text-muted">
            by <span className="text-text-secondary font-semibold">{shortenAddress(bounty.creatorWallet)}</span>
          </span>
          <div className="flex items-center gap-0.5 text-xs text-text-muted">
            {timeAgo(bounty.createdAt)}
            <ChevronRight size={12} className="opacity-30" />
          </div>
        </div>
      </div>
    </div>
  )
}
