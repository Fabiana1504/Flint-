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
      className="group bg-white rounded-2xl border border-gray-100 shadow-card p-4 cursor-pointer transition-all duration-150 hover:shadow-md hover:border-gray-200 active:scale-[0.985]"
    >
      {/* Top row: category + reward */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-1.5 flex-wrap">
          <CategoryPill category={bounty.category} />
          <StatusBadge status={bounty.status} />
        </div>
        <div className="shrink-0 bg-nimiq-yellow-light rounded-xl px-2.5 py-1">
          <span className="text-nimiq-yellow font-display font-bold text-sm whitespace-nowrap">
            {formatReward(bounty.rewardAmount, bounty.rewardCurrency)}
          </span>
        </div>
      </div>

      {/* Title */}
      <h3 className="font-display font-semibold text-text-primary text-[0.95rem] leading-snug mb-1.5 line-clamp-2 group-hover:text-nimiq-yellow transition-colors duration-150">
        {bounty.title}
      </h3>

      {/* Description */}
      <p className="text-text-secondary text-sm leading-relaxed line-clamp-2 mb-3">
        {bounty.description}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-50">
        <span className="text-xs text-text-secondary font-label">
          by <span className="font-medium text-text-primary">{shortenAddress(bounty.creatorWallet)}</span>
        </span>
        <span className="text-xs text-text-secondary font-label">{timeAgo(bounty.createdAt)}</span>
      </div>
    </div>
  )
}
