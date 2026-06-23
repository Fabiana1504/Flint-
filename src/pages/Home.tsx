import { useNavigate } from 'react-router-dom'
import { Flame, Zap, CheckCircle, ChevronRight } from 'lucide-react'
import { BountyCard } from '@/components/bounty/BountyCard'
import { SkeletonCard } from '@/components/common/SkeletonCard'
import { useBounties } from '@/hooks/useBounties'

const STEPS = [
  { emoji: '📝', title: 'Post a task',       desc: 'Set a NIM reward for what you need done.' },
  { emoji: '⚡', title: 'Worker claims it',   desc: 'Someone picks it up and gets to work.' },
  { emoji: '✅', title: 'Approve & pay',      desc: 'Review the work — payment is instant.' },
]

export function Home() {
  const navigate = useNavigate()
  const { bounties, loading } = useBounties({ status: 'open' })
  const featured = bounties.slice(0, 3)

  return (
    <div className="flex flex-col bg-background">

      {/* ── Hero ─────────────────────────────────────────── */}
      <div
        className="relative overflow-hidden px-5 pt-10 pb-12"
        style={{ background: 'linear-gradient(165deg, #0E0E16 0%, #18181B 45%, #1A1A2A 100%)' }}
      >
        {/* Dot grid texture */}
        <div className="absolute inset-0 hero-dots pointer-events-none" />

        {/* Yellow glow orb — top right */}
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(245,166,35,0.28) 0%, transparent 62%)' }} />
        {/* Yellow glow orb — bottom left */}
        <div className="absolute bottom-0 -left-16 w-56 h-56 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(245,166,35,0.12) 0%, transparent 65%)' }} />

        {/* Logo */}
        <div className="relative flex items-center gap-3 mb-10 animate-fade-up">
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center float"
            style={{ background: 'linear-gradient(145deg,#F7C04A,#F5A623,#E8951A)', boxShadow: '0 6px 24px rgba(245,166,35,0.55)' }}
          >
            <Flame size={22} strokeWidth={2.5} className="text-[#18181B]" />
          </div>
          <span className="font-display font-extrabold text-white text-xl tracking-tight">Flint</span>
          <span className="ml-auto text-[10px] font-extrabold text-nimiq-yellow border border-nimiq-yellow/35 bg-nimiq-yellow/10 px-2.5 py-1 rounded-full uppercase tracking-[0.12em]">
            Beta
          </span>
        </div>

        {/* Headline */}
        <div className="relative mb-9">
          <h1 className="font-display font-extrabold text-white mb-4 animate-fade-up"
            style={{ fontSize: '2.75rem', lineHeight: 1.0, letterSpacing: '-0.04em', animationDelay: '50ms' }}>
            Small tasks.<br />
            <span style={{ background: 'linear-gradient(90deg,#F7C04A,#F5A623)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Real rewards.
            </span>
          </h1>
          <p className="text-zinc-400 text-base leading-relaxed max-w-[250px] animate-fade-up"
            style={{ animationDelay: '100ms' }}>
            Post micro-tasks or earn NIM completing them — no accounts, no friction.
          </p>
        </div>

        {/* CTAs */}
        <div className="relative flex gap-3 animate-fade-up" style={{ animationDelay: '150ms' }}>
          <button
            onClick={() => navigate('/browse')}
            className="flex-1 h-14 rounded-2xl font-display font-bold text-[#18181B] text-[0.95rem] press"
            style={{ background: 'linear-gradient(145deg,#F7C04A 0%,#F5A623 60%,#E8951A 100%)', boxShadow: '0 6px 24px rgba(245,166,35,0.5)' }}
          >
            Browse tasks
          </button>
          <button
            onClick={() => navigate('/create')}
            className="flex-1 h-14 rounded-2xl font-display font-bold text-white text-[0.95rem] border press"
            style={{ borderColor: 'rgba(255,255,255,0.14)', background: 'rgba(255,255,255,0.07)', backdropFilter: 'blur(12px)' }}
          >
            Post a task
          </button>
        </div>
      </div>

      {/* ── Stats ─────────────────────────────────────────── */}
      <div className="grid grid-cols-3 divide-x divide-black/10" style={{ background: 'linear-gradient(135deg,#F5A623,#F7C04A)' }}>
        {[
          { value: loading ? '—' : String(bounties.length), label: 'Open now', sub: 'bounties' },
          { value: 'NIM',  label: 'Native',  sub: 'token'   },
          { value: '0%',   label: 'Zero',    sub: 'platform fee' },
        ].map(({ value, label, sub }) => (
          <div key={label} className="flex flex-col items-center py-4" style={{ borderColor: 'rgba(0,0,0,0.08)' }}>
            <span className="font-display font-extrabold text-[#18181B] text-xl leading-none">{value}</span>
            <span className="text-[11px] font-bold text-[#18181B]/60 mt-1 uppercase tracking-wide">{label}</span>
            <span className="text-[10px] text-[#18181B]/40 font-medium">{sub}</span>
          </div>
        ))}
      </div>

      {/* ── Latest bounties ───────────────────────────────── */}
      <div className="px-4 pt-7">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-bold text-text-primary text-lg" style={{ letterSpacing: '-0.01em' }}>
            Latest bounties
          </h2>
          <button onClick={() => navigate('/browse')} className="flex items-center gap-0.5 text-sm font-bold text-nimiq-yellow press">
            See all <ChevronRight size={16} strokeWidth={2.5} />
          </button>
        </div>

        <div className="flex flex-col gap-3 stagger">
          {loading
            ? Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)
            : featured.length > 0
              ? featured.map(b => <BountyCard key={b.id} bounty={b} />)
              : (
                <div className="bg-white rounded-3xl p-8 text-center shadow-card">
                  <p className="text-4xl mb-3">🎯</p>
                  <p className="font-display font-bold text-text-primary text-sm">No bounties yet</p>
                  <p className="text-text-muted text-xs mt-1">Be the first to post one!</p>
                </div>
              )}
        </div>
      </div>

      {/* ── How it works ──────────────────────────────────── */}
      <div className="px-4 pt-8 pb-4">
        <div className="flex items-center gap-2 mb-5">
          <Zap size={16} className="text-nimiq-yellow" strokeWidth={2.5} />
          <h2 className="font-display font-bold text-text-primary text-lg" style={{ letterSpacing: '-0.01em' }}>How it works</h2>
        </div>

        <div className="flex flex-col gap-2.5">
          {STEPS.map(({ emoji, title, desc }, i) => (
            <div key={title} className="bg-white rounded-3xl p-4 flex items-center gap-4 shadow-card">
              <div className="relative w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 text-2xl"
                style={{ background: 'linear-gradient(145deg,#FEF3DC,#FDE9B8)' }}>
                {emoji}
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-nimiq-yellow flex items-center justify-center text-[10px] font-extrabold text-[#18181B]">
                  {i + 1}
                </span>
              </div>
              <div>
                <p className="font-display font-bold text-text-primary text-sm">{title}</p>
                <p className="text-text-secondary text-sm leading-relaxed mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Footer CTA card ───────────────────────────────── */}
      <div className="mx-4 mb-5 mt-3">
        <div className="relative overflow-hidden rounded-4xl px-5 py-5 flex items-center gap-4"
          style={{ background: 'linear-gradient(145deg,#0E0E16,#1A1A2A)' }}>
          {/* glow */}
          <div className="absolute -top-10 -right-10 w-44 h-44 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle,rgba(245,166,35,0.22) 0%,transparent 65%)' }} />
          {/* icon */}
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
            style={{ background: 'rgba(245,166,35,0.15)', border: '1px solid rgba(245,166,35,0.25)' }}>
            <CheckCircle size={22} strokeWidth={2} className="text-nimiq-yellow" />
          </div>
          <div className="flex-1 relative">
            <p className="font-display font-bold text-white text-sm">Instant payments via Nimiq</p>
            <p className="text-zinc-500 text-xs mt-0.5">No banks. No delays. No fees.</p>
          </div>
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 pulse-dot shrink-0" />
        </div>
      </div>

    </div>
  )
}
