import { useNavigate } from 'react-router-dom'
import { ArrowRight, Flame, Zap, CheckCircle } from 'lucide-react'
import { BountyCard } from '@/components/bounty/BountyCard'
import { SkeletonCard } from '@/components/common/SkeletonCard'
import { useBounties } from '@/hooks/useBounties'

const STEPS = [
  { emoji: '📝', step: '1', title: 'Post a task', desc: 'Describe what you need and set a NIM reward.' },
  { emoji: '⚡', step: '2', title: 'Someone claims it', desc: 'A worker picks it up and gets to work.' },
  { emoji: '✅', step: '3', title: 'Approve & pay', desc: 'Review the work — payment goes out instantly.' },
]

export function Home() {
  const navigate = useNavigate()
  const { bounties, loading } = useBounties({ status: 'open' })
  const featured = bounties.slice(0, 3)

  return (
    <div className="flex flex-col bg-background">

      {/* ── Hero ─────────────────────────────────── */}
      <div className="relative overflow-hidden px-5 pt-10 pb-10" style={{ background: 'linear-gradient(160deg, #18181B 0%, #1C1C28 60%, #0F0F18 100%)' }}>

        {/* Glow blobs */}
        <div className="absolute pointer-events-none inset-0 overflow-hidden">
          <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(245,166,35,0.22) 0%, transparent 65%)' }} />
          <div className="absolute top-32 -left-16 w-48 h-48 rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(245,166,35,0.10) 0%, transparent 65%)' }} />
        </div>

        {/* Logo row */}
        <div className="relative flex items-center gap-2.5 mb-10 animate-fade-up">
          <div className="w-10 h-10 rounded-2xl bg-nimiq-yellow flex items-center justify-center shadow-yellow">
            <Flame size={20} strokeWidth={2.5} className="text-nimiq-dark" />
          </div>
          <span className="font-display font-extrabold text-white text-xl tracking-tight">Flint</span>
          <span className="ml-auto text-[10px] font-bold text-nimiq-yellow border border-nimiq-yellow/40 bg-nimiq-yellow/10 px-2.5 py-1 rounded-full uppercase tracking-widest">
            Beta
          </span>
        </div>

        {/* Headline */}
        <div className="relative mb-8">
          <h1
            className="font-display font-extrabold text-white mb-3 animate-fade-up"
            style={{ fontSize: '2.6rem', lineHeight: 1.05, letterSpacing: '-0.035em', animationDelay: '50ms' }}
          >
            Small tasks.<br />
            <span style={{ color: '#F5A623' }}>Real rewards.</span>
          </h1>
          <p className="text-zinc-400 text-[0.95rem] leading-relaxed max-w-[260px] animate-fade-up" style={{ animationDelay: '100ms' }}>
            Post micro-tasks or earn NIM completing them — no sign-ups, no friction.
          </p>
        </div>

        {/* CTAs */}
        <div className="relative flex gap-3 animate-fade-up" style={{ animationDelay: '150ms' }}>
          <button
            onClick={() => navigate('/browse')}
            className="flex-1 h-14 rounded-2xl font-display font-bold text-nimiq-dark text-base press"
            style={{ background: 'linear-gradient(135deg, #F5A623 0%, #F7C04A 100%)', boxShadow: '0 4px 20px rgba(245,166,35,0.45)' }}
          >
            Browse tasks
          </button>
          <button
            onClick={() => navigate('/create')}
            className="flex-1 h-14 rounded-2xl font-display font-bold text-white text-base border border-white/15 bg-white/8 press"
            style={{ backdropFilter: 'blur(10px)' }}
          >
            Post a task
          </button>
        </div>
      </div>

      {/* ── Stats ────────────────────────────────── */}
      <div className="grid grid-cols-3 divide-x divide-nimiq-yellow/20 bg-nimiq-yellow border-b border-nimiq-yellow-dim">
        {[
          { value: loading ? '—' : String(bounties.length), label: 'Open now' },
          { value: 'NIM', label: 'Native token' },
          { value: '0%', label: 'Platform fee' },
        ].map(({ value, label }) => (
          <div key={label} className="flex flex-col items-center py-3.5">
            <span className="font-display font-extrabold text-nimiq-dark text-lg leading-none">{value}</span>
            <span className="text-[11px] text-nimiq-dark/60 font-semibold mt-1 uppercase tracking-wide">{label}</span>
          </div>
        ))}
      </div>

      {/* ── Latest bounties ──────────────────────── */}
      <div className="px-4 pt-7 pb-2">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-bold text-text-primary text-lg">Latest bounties</h2>
          <button
            onClick={() => navigate('/browse')}
            className="flex items-center gap-1 text-sm font-bold text-nimiq-yellow press"
          >
            See all <ArrowRight size={14} strokeWidth={2.5} />
          </button>
        </div>

        <div className="flex flex-col gap-3 stagger">
          {loading
            ? Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)
            : featured.length > 0
              ? featured.map((b) => <BountyCard key={b.id} bounty={b} />)
              : (
                <div className="bg-white rounded-3xl p-8 text-center" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                  <p className="text-4xl mb-3">🎯</p>
                  <p className="font-display font-bold text-text-primary text-sm">No bounties yet</p>
                  <p className="text-text-muted text-xs mt-1">Be the first to post one!</p>
                </div>
              )}
        </div>
      </div>

      {/* ── How it works ─────────────────────────── */}
      <div className="px-4 pt-8 pb-4">
        <div className="flex items-center gap-2 mb-5">
          <Zap size={16} className="text-nimiq-yellow" strokeWidth={2.5} />
          <h2 className="font-display font-bold text-text-primary text-lg">How it works</h2>
        </div>

        <div className="relative">
          {/* Connecting line */}
          <div className="absolute left-[22px] top-10 bottom-10 w-px bg-gradient-to-b from-nimiq-yellow/40 via-nimiq-yellow/20 to-transparent" />
          <div className="flex flex-col gap-1">
            {STEPS.map(({ emoji, step, title, desc }) => (
              <div key={step} className="flex gap-4 items-start py-3">
                <div className="relative z-10 w-11 h-11 rounded-2xl bg-white border-2 border-nimiq-yellow/30 flex items-center justify-center shrink-0 text-xl"
                  style={{ boxShadow: '0 2px 8px rgba(245,166,35,0.12)' }}>
                  {emoji}
                </div>
                <div className="pt-1">
                  <p className="font-display font-bold text-text-primary text-[0.95rem]">{title}</p>
                  <p className="text-text-secondary text-sm leading-relaxed mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Footer CTA ───────────────────────────── */}
      <div className="mx-4 mb-5 mt-2">
        <div className="rounded-3xl overflow-hidden relative" style={{ background: 'linear-gradient(135deg, #18181B 0%, #1C1C28 100%)' }}>
          {/* Glow */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full"
              style={{ background: 'radial-gradient(circle, rgba(245,166,35,0.2) 0%, transparent 65%)' }} />
          </div>
          <div className="relative px-5 py-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-nimiq-yellow/15 border border-nimiq-yellow/25 flex items-center justify-center shrink-0">
              <CheckCircle size={22} className="text-nimiq-yellow" strokeWidth={2} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-display font-bold text-white text-sm">Instant payments via Nimiq</p>
              <p className="text-zinc-400 text-xs mt-0.5">No banks, no delays, no fees.</p>
            </div>
            <div className="w-2 h-2 rounded-full bg-emerald-400 pulse-dot shrink-0" />
          </div>
        </div>
      </div>

    </div>
  )
}
