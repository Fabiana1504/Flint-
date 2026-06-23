import { useState } from 'react'
import { Search, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { BountyCard } from '@/components/bounty/BountyCard'
import { SkeletonList } from '@/components/common/SkeletonCard'
import { EmptyState } from '@/components/common/EmptyState'
import { useBounties } from '@/hooks/useBounties'
import { CATEGORIES, cn } from '@/lib/utils'
import type { BountyCategory } from '@/types'

const ALL = 'All'
type Filter = BountyCategory | typeof ALL

const CATEGORY_STYLE: Record<BountyCategory, { emoji: string; active: string; activeText: string }> = {
  Testing: { emoji: '🧪', active: 'bg-purple-500', activeText: 'text-white' },
  Design:  { emoji: '🎨', active: 'bg-pink-500',   activeText: 'text-white' },
  Writing: { emoji: '✍️', active: 'bg-blue-500',   activeText: 'text-white' },
  Survey:  { emoji: '📋', active: 'bg-teal-500',   activeText: 'text-white' },
  Dev:     { emoji: '💻', active: 'bg-orange-500', activeText: 'text-white' },
}

export function Browse() {
  const navigate = useNavigate()
  const [selected, setSelected] = useState<Filter>(ALL)
  const [query, setQuery] = useState('')

  const { bounties, loading } = useBounties(selected !== ALL ? { category: selected } : undefined)
  const filtered = bounties.filter(b =>
    query === '' ||
    b.title.toLowerCase().includes(query.toLowerCase()) ||
    b.description.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <div className="flex flex-col bg-background">

      {/* Sticky header */}
      <div className="sticky top-0 z-10 bg-background border-b border-gray-200/60 px-4 pt-5 pb-3 space-y-3">
        {/* Title + count */}
        <div className="flex items-center justify-between">
          <h1 className="font-display font-extrabold text-text-primary text-2xl" style={{ letterSpacing: '-0.02em' }}>
            Browse
          </h1>
          <span className="text-xs font-bold text-text-secondary bg-white border border-gray-200 px-3 py-1 rounded-full">
            {loading ? '…' : `${filtered.length} task${filtered.length !== 1 ? 's' : ''}`}
          </span>
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
          <input
            type="search"
            placeholder="Search tasks…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full h-12 pl-10 pr-10 rounded-2xl border border-gray-200 bg-white text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-nimiq-yellow/40 focus:border-nimiq-yellow transition-all"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center"
            >
              <X size={11} className="text-text-secondary" />
            </button>
          )}
        </div>

        {/* Category pills */}
        <div className="flex gap-2 overflow-x-auto pb-0.5 no-scrollbar">
          <button
            onClick={() => setSelected(ALL)}
            className={cn(
              'shrink-0 px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-150 press',
              selected === ALL
                ? 'bg-nimiq-dark text-white'
                : 'bg-white border border-gray-200 text-text-secondary'
            )}
          >
            All
          </button>
          {CATEGORIES.map(cat => {
            const s = CATEGORY_STYLE[cat]
            const active = selected === cat
            return (
              <button
                key={cat}
                onClick={() => setSelected(cat)}
                className={cn(
                  'shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all duration-150 press',
                  active ? `${s.active} ${s.activeText}` : 'bg-white border border-gray-200 text-text-secondary'
                )}
              >
                <span>{s.emoji}</span>{cat}
              </button>
            )
          })}
        </div>
      </div>

      {/* List */}
      <div className="px-4 pt-3 pb-4">
        {loading ? (
          <SkeletonList count={5} />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon="🎯"
            title="No bounties here"
            description={query ? 'Try different search terms or clear the filter.' : 'Be the first to post one in this category.'}
            action={{ label: 'Post a bounty', onClick: () => navigate('/create') }}
          />
        ) : (
          <div className="flex flex-col gap-3 stagger">
            {filtered.map(b => <BountyCard key={b.id} bounty={b} />)}
          </div>
        )}
      </div>
    </div>
  )
}
