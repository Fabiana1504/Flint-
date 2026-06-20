import { cn, CATEGORY_COLORS } from '@/lib/utils'
import type { BountyCategory } from '@/types'

interface CategoryPillProps {
  category: BountyCategory
  className?: string
  size?: 'sm' | 'md'
}

export function CategoryPill({ category, className, size = 'sm' }: CategoryPillProps) {
  const colors = CATEGORY_COLORS[category]
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-label font-medium',
        size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm',
        colors.bg,
        colors.text,
        className
      )}
    >
      {category}
    </span>
  )
}
