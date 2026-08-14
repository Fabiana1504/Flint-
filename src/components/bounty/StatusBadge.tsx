import { cn } from '@/lib/utils'
import { useLang } from '@/context/LangContext'
import type { BountyStatus } from '@/types'

const STYLE: Record<BountyStatus, { bg: string; text: string; dot: string }> = {
  open:      { bg: 'bg-emerald-50 dark:bg-emerald-950/50', text: 'text-emerald-700 dark:text-emerald-400', dot: 'bg-emerald-500' },
  claimed:   { bg: 'bg-blue-50 dark:bg-blue-950/50',       text: 'text-blue-700 dark:text-blue-400',       dot: 'bg-blue-500' },
  submitted: { bg: 'bg-amber-50 dark:bg-amber-950/50',     text: 'text-amber-700 dark:text-amber-400',     dot: 'bg-amber-500' },
  approved:  { bg: 'bg-green-50 dark:bg-green-950/50',     text: 'text-green-700 dark:text-green-400',     dot: 'bg-green-500' },
  paid:      { bg: 'bg-purple-50 dark:bg-purple-950/50',   text: 'text-purple-700 dark:text-purple-400',   dot: 'bg-purple-500' },
  cancelled: { bg: 'bg-gray-100 dark:bg-zinc-800',         text: 'text-gray-500 dark:text-zinc-400',       dot: 'bg-gray-400' },
}

export function StatusBadge({ status, className }: { status: BountyStatus; className?: string }) {
  const { t } = useLang()
  const s = STYLE[status]
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold', s.bg, s.text, className)}>
      <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', s.dot, status === 'open' && 'pulse-dot')} />
      {t.status[status]}
    </span>
  )
}
