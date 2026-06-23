import { cn } from '@/lib/utils'
import type { BountyStatus } from '@/types'

const STATUS_LABELS: Record<BountyStatus, string> = {
  open:      'Open',
  claimed:   'Claimed',
  submitted: 'In Review',
  approved:  'Approved',
  paid:      'Paid',
  cancelled: 'Cancelled',
}

const STYLE: Record<BountyStatus, { bg: string; text: string; dot: string }> = {
  open:      { bg: 'bg-emerald-50',  text: 'text-emerald-700', dot: 'bg-emerald-500' },
  claimed:   { bg: 'bg-blue-50',     text: 'text-blue-700',    dot: 'bg-blue-500' },
  submitted: { bg: 'bg-amber-50',    text: 'text-amber-700',   dot: 'bg-amber-500' },
  approved:  { bg: 'bg-green-50',    text: 'text-green-700',   dot: 'bg-green-500' },
  paid:      { bg: 'bg-purple-50',   text: 'text-purple-700',  dot: 'bg-purple-500' },
  cancelled: { bg: 'bg-gray-100',    text: 'text-gray-500',    dot: 'bg-gray-400' },
}

export function StatusBadge({ status, className }: { status: BountyStatus; className?: string }) {
  const s = STYLE[status]
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold', s.bg, s.text, className)}>
      <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', s.dot, status === 'open' && 'pulse-dot')} />
      {STATUS_LABELS[status]}
    </span>
  )
}
