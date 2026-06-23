import { cn } from '@/lib/utils'
import type { BountyCategory } from '@/types'

interface CategoryPillProps {
  category: BountyCategory
  className?: string
  size?: 'sm' | 'md'
}

const STYLE: Record<BountyCategory, { bg: string; text: string; emoji: string }> = {
  Testing: { bg: 'bg-purple-100', text: 'text-purple-700', emoji: '🧪' },
  Design:  { bg: 'bg-pink-100',   text: 'text-pink-700',   emoji: '🎨' },
  Writing: { bg: 'bg-blue-100',   text: 'text-blue-700',   emoji: '✍️' },
  Survey:  { bg: 'bg-teal-100',   text: 'text-teal-700',   emoji: '📋' },
  Dev:     { bg: 'bg-orange-100', text: 'text-orange-700', emoji: '💻' },
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
