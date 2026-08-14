import { cn } from '@/lib/utils'
import type { BountyCategory } from '@/types'

interface CategoryPillProps {
  category: BountyCategory
  className?: string
  size?: 'sm' | 'md'
}

const STYLE: Record<BountyCategory, { bg: string; text: string; emoji: string }> = {
  Testing: { bg: 'bg-purple-100 dark:bg-purple-950/60', text: 'text-purple-700 dark:text-purple-300', emoji: '🧪' },
  Design:  { bg: 'bg-pink-100 dark:bg-pink-950/60',     text: 'text-pink-700 dark:text-pink-300',     emoji: '🎨' },
  Writing: { bg: 'bg-blue-100 dark:bg-blue-950/60',     text: 'text-blue-700 dark:text-blue-300',     emoji: '✍️' },
  Survey:  { bg: 'bg-teal-100 dark:bg-teal-950/60',     text: 'text-teal-700 dark:text-teal-300',     emoji: '📋' },
  Dev:     { bg: 'bg-orange-100 dark:bg-orange-950/60', text: 'text-orange-700 dark:text-orange-300', emoji: '💻' },
}

export function CategoryPill({ category, className, size = 'sm' }: CategoryPillProps) {
  const s = STYLE[category]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full font-semibold',
        size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm',
        s.bg, s.text, className
      )}
    >
      <span className="leading-none">{s.emoji}</span>
      {category}
    </span>
  )
}
