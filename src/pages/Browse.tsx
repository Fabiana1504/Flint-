import { useState } from 'react'
import { Search } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { BountyCard } from '@/components/bounty/BountyCard'
import { SkeletonList } from '@/components/common/SkeletonCard'
import { EmptyState } from '@/components/common/EmptyState'
import { useBounties } from '@/hooks/useBounties'
import { CATEGORIES, CATEGORY_COLORS, cn } from '@/lib/utils'
import type { BountyCategory } from '@/types'

const ALL = 'All'
type Filter = BountyCategory | typeof ALL

const CATEGORY_EMOJIS: Record<BountyCategory, string> = {
  Testing: '🧪',
  Design: '🎨',
  Writing: '✍️',
  Survey: '📋',
  Dev: '💻',
}

export function Browse() {
  const navigate = useNavigate()
  const [selected, setSelected] = useState<Filter>(ALL)
  const [query, setQuery] = useState('')

  const { bounties, loading } = useBounties(
    selected !== ALL ? { category: selected } : undefined
  )

  const filtered = bounties.filter((b) =>
    query === '' ||
    b.title.toLowerCase().includes(query.toLowerCase()) ||
    b.description.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="sticky top-0 bg-background/95 backdrop-blur-md z-10 px-5 pt-6 pb-3 space-y-3">
        <div className="flex items-center justify-between">
          <h1 className="font-display font-bold text-text-primary text-2xl">Browse</h1>
          <span className="text-xs font-label text-text-secondary bg-white border border-gray-100 px-2.5 py-1 rounded-full">
            {loading ? '…' : `${filtered.length} tasks`}
          </span>
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" />
          <input
            type="search"
            placeholder="Search tasks…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full h-11 pl-10 pr-4 rounded-full border border-border bg-white text-sm font-body text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-nimiq-yellow/30 focus:border-nimiq-yellow transition-all"
          />
        </div>

        {/* Category filters */}
        <div className="flex gap-2 overflow-x-auto pb-0.5 no-scrollbar">
          <button
            onClick={() => setSelected(ALL)}
            className={cn(
              'shrink-0 px-3.5 py-1.5 rounded-full text-xs font-label font-semibold transition-all duration-150',
              selected === ALL
                ? 'bg-text-primary text-white shadow-sm'
                : 'bg-white border border-border text-text-secondary hover:border-gray-300'
            )}
          >
            All
          </button>
          {CATEGORIES.map((cat) => {
            const colors = CATEGORY_COLORS[cat]
            const isActive = selected === cat
            return (
              <button
                key={cat}
                onClick={() => setSelected(cat)}
                className={cn(
                  'shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-label font-semibold transition-all duration-150',
                  isActive
                    ? `${colors.bg} ${colors.text} shadow-sm`
                    : 'bg-white border border-border text-text-secondary hover:border-gray-300'
                )}
              >
                <span>{CATEGORY_EMOJIS[cat]}</span>
                {cat}
              </button>
            )
          })}
        </div>
      </div>

      {/* List */}
      <div className="px-5 pt-2 pb-2 flex flex-col gap-3">
        {loading ? (
          <SkeletonList count={5} />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon="🎯"
            title="No bounties here"
            description={query ? 'Try a different search or clear the filter.' : 'Be the first to post a bounty in this category.'}
            action={{ label: 'Post a bounty', onClick: () => navigate('/create') }}
          />
        ) : (
          <div className="flex flex-col gap-3 stagger">
            {filtered.map((b) => <BountyCard key={b.id} bounty={b} />)}
          </div>
        )}
      </div>
    </div>
  )
}
