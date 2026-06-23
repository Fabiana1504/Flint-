import { useState } from 'react'
import { Search, X, SlidersHorizontal } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { BountyCard } from '@/components/bounty/BountyCard'
import { SkeletonList } from '@/components/common/SkeletonCard'
import { EmptyState } from '@/components/common/EmptyState'
import { useBounties } from '@/hooks/useBounties'
import { CATEGORIES, cn } from '@/lib/utils'
import type { BountyCategory } from '@/types'

const ALL = 'All'
type Filter = BountyCategory | typeof ALL

const CATEGORY_STYLE: Record<BountyCategory, { emoji: string; active: string }> = {
  Testing: { emoji: '🧪', active: 'bg-purple-500' },
  Design:  { emoji: '🎨', active: 'bg-pink-500'   },
  Writing: { emoji: '✍️', active: 'bg-blue-500'   },
  Survey:  { emoji: '📋', active: 'bg-teal-500'   },
  Dev:     { emoji: '💻', active: 'bg-orange-500' },
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
    <div className="flex flex-col bg-background min-h-screen">

      {/* Header */}
      <div className="sticky top-0 z-10" style={{ background: 'rgba(245,247,250,0.97)', backdropFilter: 'blur(16px)' }}>
        <div className="px-4 pt-6 pb-3 space-y-3">

          {/* Title row */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display font-extrabold text-text-primary text-2xl" style={{ letterSpacing: '-0.025em' }}>
                Browse
              </h1>
              <p className="text-text-muted text-xs font-medium mt-0.5">
                {loading ? 'Loading…' : `${filtered.length} task${filtered.length !== 1 ? 's' : ''} available`}
              </p>
            </div>
            <button
              onClick={() => navigate('/create')}
              className="h-9 px-3.5 rounded-full text-xs font-bold text-nimiq-dark flex items-center gap-1.5 press"
              style={{ background: 'linear-gradient(135deg,#F7C04A,#F5A623)', boxShadow: '0 4px 12px rgba(245,166,35,0.4)' }}
            >
              <SlidersHorizontal size={12} strokeWidth={2.5} />
              Post task
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
            <input
              type="search"
              placeholder="Search tasks…"
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="w-full h-11 pl-10 pr-10 rounded-2xl bg-white text-sm font-medium text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-nimiq-yellow/40 transition-all"
              style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)', border: 'none' }}
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center"
              >
                <X size={11} className="text-text-secondary" />
              </button>
            )}
          </div>

          {/* Category pills */}
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar -mx-4 px-4">
            <button
              onClick={() => setSelected(ALL)}
              className={cn(
                'shrink-0 px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-150 press',
                selected === ALL
                  ? 'bg-[#18181B] text-white'
                  : 'bg-white text-text-secondary'
              )}
              style={selected === ALL ? { boxShadow: '0 3px 10px rgba(0,0,0,0.2)' } : { boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}
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
                    active ? `${s.active} text-white` : 'bg-white text-text-secondary'
                  )}
                  style={active
                    ? { boxShadow: '0 3px 10px rgba(0,0,0,0.18)' }
                    : { boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}
                >
                  <span>{s.emoji}</span>{cat}
                </button>
              )
            })}
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gray-200/60" />
      </div>

      {/* List */}
      <div className="px-4 pt-4 pb-28">
        {loading ? (
          <SkeletonList count={5} />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon="🎯"
            title="No bounties here"
            description={query ? 'Try different keywords or clear the filter.' : 'Be the first to post one in this category.'}
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
