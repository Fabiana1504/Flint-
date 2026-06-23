import { useNavigate } from 'react-router-dom'
import { CategoryPill } from './CategoryPill'
import { StatusBadge } from './StatusBadge'
import { formatReward, timeAgo, shortenAddress } from '@/lib/utils'
import type { Bounty } from '@/types'

interface BountyCardProps {
  bounty: Bounty
}

export function BountyCard({ bounty }: BountyCardProps) {
  const navigate = useNavigate()

  return (
    <div
      onClick={() => navigate(`/bounty/${bounty.id}`)}
      className="group bg-white rounded-2xl border border-gray-100 p-4 cursor-pointer transition-all duration-150 active:scale-[0.982] press"
      style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.03)' }}
    >
      {/* Top row: category + reward */}
      <div className="flex items-start justify-between gap-3 mb-2.5">
        <div className="flex items-center gap-1.5 flex-wrap">
          <CategoryPill category={bounty.category} />
          <StatusBadge status={bounty.status} />
        </div>
        <div className="shrink-0 bg-nimiq-yellow rounded-xl px-2.5 py-1.5" style={{ boxShadow: '0 2px 8px rgba(245,166,35,0.3)' }}>
          <span className="text-[#1A1A1A] font-display font-bold text-sm whitespace-nowrap">
            {formatReward(bounty.rewardAmount, bounty.rewardCurrency)}
          </span>
        </div>
      </div>

      {/* Title */}
      <h3 className="font-display font-bold text-text-primary text-[0.95rem] leading-snug mb-1.5 line-clamp-2 group-active:text-nimiq-yellow transition-colors">
        {bounty.title}
      </h3>

      {/* Description */}
      <p className="text-text-secondary text-sm leading-relaxed line-clamp-2 mb-3">
        {bounty.description}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <span className="text-xs text-text-secondary">
          by <span className="font-semibold text-text-primary">{shortenAddress(bounty.creatorWallet)}</span>
        </span>
        <span className="text-xs text-text-secondary">{timeAgo(bounty.createdAt)}</span>
      </div>
    </div>
  )
}
