import { cn, STATUS_COLORS, STATUS_LABELS } from '@/lib/utils'
import type { BountyStatus } from '@/types'

interface StatusBadgeProps {
  status: BountyStatus
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const colors = STATUS_COLORS[status]
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-label font-medium',
        colors.bg,
        colors.text,
        className
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  )
}
