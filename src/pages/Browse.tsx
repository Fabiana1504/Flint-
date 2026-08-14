import { useState } from 'react'
import { Search, X, ChevronLeft, ChevronRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { BountyCard } from '@/components/bounty/BountyCard'
import { SkeletonList } from '@/components/common/SkeletonCard'
import { EmptyState } from '@/components/common/EmptyState'
import { useBounties } from '@/hooks/useBounties'
import { useLang } from '@/context/LangContext'
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

const PAGE_SIZE = 8

export function Browse() {
  const navigate = useNavigate()
  const { t } = useLang()
  const [selected, setSelected] = useState<Filter>(ALL)
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)

  const { bounties, loading } = useBounties(selected !== ALL ? { category: selected } : undefined)
  const filtered = bounties.filter(b =>
    query === '' ||
    b.title.toLowerCase().includes(query.toLowerCase()) ||
    b.description.toLowerCase().includes(query.toLowerCase())
  )

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  function handleFilterChange(f: Filter) {
    setSelected(f)
    setPage(1)
  }

  function handleSearch(q: string) {
    setQuery(q)
    setPage(1)
  }

  const taskCount = filtered.length
  const taskLabel = taskCount === 1 ? t.browse.task : t.browse.tasks

  return (
    <div className="flex flex-col bg-background">

      {/* Sticky header */}
      <div className="sticky top-0 z-10 bg-background border-b border-border px-4 pt-5 pb-3 space-y-3">
        {/* Title + count */}
        <div className="flex items-center justify-between">
          <h1 className="font-display font-extrabold text-text-primary text-2xl" style={{ letterSpacing: '-0.02em' }}>
            {t.browse.title}
          </h1>
          <span className="text-xs font-bold text-text-secondary bg-surface border border-border px-3 py-1 rounded-full">
            {loading ? '…' : `${taskCount} ${taskLabel}`}
          </span>
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
          <input
            type="search"
            placeholder={t.browse.searchPlaceholder}
            value={query}
            onChange={e => handleSearch(e.target.value)}
            className="w-full h-12 pl-10 pr-10 rounded-2xl border border-border bg-surface text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-nimiq-yellow/40 focus:border-nimiq-yellow transition-all"
          />
          {query && (
            <button
              onClick={() => handleSearch('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-border flex items-center justify-center"
            >
              <X size={11} className="text-text-secondary" />
            </button>
          )}
        </div>

        {/* Category pills */}
        <div className="flex gap-2 overflow-x-auto pb-0.5 no-scrollbar">
          <button
            onClick={() => handleFilterChange(ALL)}
            className={cn(
              'shrink-0 px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-150 press',
              selected === ALL
                ? 'bg-nimiq-dark dark:bg-nimiq-yellow text-white dark:text-nimiq-dark'
                : 'bg-surface border border-border text-text-secondary'
            )}
          >
            {t.categories.All}
          </button>
          {CATEGORIES.map(cat => {
            const s = CATEGORY_STYLE[cat]
            const active = selected === cat
            return (
              <button
                key={cat}
                onClick={() => handleFilterChange(cat)}
                className={cn(
                  'shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all duration-150 press',
                  active ? `${s.active} ${s.activeText}` : 'bg-surface border border-border text-text-secondary'
                )}
              >
                <span>{s.emoji}</span>{t.categories[cat]}
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
            title={t.browse.noBounties}
            description={query ? t.browse.tryDifferent : t.browse.beFirst}
            action={{ label: t.browse.postBounty, onClick: () => navigate('/create') }}
          />
        ) : (
          <>
            <div className="flex flex-col gap-3 stagger">
              {paginated.map(b => <BountyCard key={b.id} bounty={b} />)}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-5">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="flex items-center gap-1 h-9 px-3 rounded-xl text-sm font-bold bg-surface border border-border text-text-secondary disabled:opacity-40 press"
                >
                  <ChevronLeft size={14} /> {t.browse.prev}
                </button>
                <span className="text-sm font-semibold text-text-secondary">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-1 h-9 px-3 rounded-xl text-sm font-bold bg-surface border border-border text-text-secondary disabled:opacity-40 press"
                >
                  {t.browse.next} <ChevronRight size={14} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
