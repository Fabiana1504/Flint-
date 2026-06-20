import { useNavigate } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
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
    <Card
      className="cursor-pointer hover:shadow-md transition-shadow duration-150 active:scale-[0.99]"
      onClick={() => navigate(`/bounty/${bounty.id}`)}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          <CategoryPill category={bounty.category} />
          <StatusBadge status={bounty.status} />
        </div>
        <span className="text-nimiq-yellow font-display font-semibold text-base whitespace-nowrap">
          {formatReward(bounty.rewardAmount, bounty.rewardCurrency)}
        </span>
      </div>

      <h3 className="font-display font-semibold text-text-primary text-[1rem] leading-snug mb-1 line-clamp-2">
        {bounty.title}
      </h3>

      <CardContent className="p-0 line-clamp-2 text-sm mb-3">
        {bounty.description}
      </CardContent>

      <div className="flex items-center justify-between text-xs text-text-secondary">
        <span>by {shortenAddress(bounty.creatorWallet)}</span>
        <span>{timeAgo(bounty.createdAt)}</span>
      </div>
    </Card>
  )
}
