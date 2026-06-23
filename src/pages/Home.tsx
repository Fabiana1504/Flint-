import { useNavigate } from 'react-router-dom'
import { ArrowRight, Zap, CheckCircle, Wallet, Flame } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { BountyCard } from '@/components/bounty/BountyCard'
import { SkeletonCard } from '@/components/common/SkeletonCard'
import { useBounties } from '@/hooks/useBounties'

const HOW_IT_WORKS = [
  { icon: Flame, step: '01', title: 'Post a bounty', desc: 'Describe the task and set a reward in NIM or USDT.' },
  { icon: Zap, step: '02', title: 'Someone claims it', desc: 'A worker picks up your task and gets to work.' },
  { icon: CheckCircle, step: '03', title: 'Approve & pay', desc: 'Review the work and payment goes out instantly.' },
]

export function Home() {
  const navigate = useNavigate()
  const { bounties, loading } = useBounties({ status: 'open' })
  const featured = bounties.slice(0, 3)

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <div className="relative overflow-hidden bg-white px-5 pt-10 pb-8">
        {/* Background decoration */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full opacity-40"
            style={{ background: 'radial-gradient(circle, #F5A623 0%, transparent 70%)' }} />
          <div className="absolute -bottom-8 -left-8 w-40 h-40 rounded-full opacity-20"
            style={{ background: 'radial-gradient(circle, #F5A623 0%, transparent 70%)' }} />
        </div>

        {/* Logo */}
        <div className="relative flex items-center gap-2.5 mb-9">
          <div className="w-9 h-9 rounded-xl bg-nimiq-yellow flex items-center justify-center"
            style={{ boxShadow: '0 4px 12px rgba(245,166,35,0.4)' }}>
            <Flame size={18} className="text-[#1A1A1A]" strokeWidth={2.5} />
          </div>
          <span className="font-display font-bold text-text-primary text-xl tracking-tight">Flint</span>
          <span className="ml-auto text-[11px] font-bold text-nimiq-yellow bg-nimiq-yellow-light px-2.5 py-1 rounded-full uppercase tracking-wide">
            Beta
          </span>
        </div>

        {/* Tagline */}
        <div className="relative mb-7">
          <h1 className="font-display font-bold text-[2.4rem] leading-[1.1] text-text-primary mb-3 animate-fade-up" style={{ letterSpacing: '-0.03em' }}>
            Small tasks.<br />
            <span className="text-nimiq-yellow">Real rewards.</span>
          </h1>
          <p className="text-text-secondary text-[0.95rem] leading-relaxed max-w-[270px] animate-fade-up" style={{ animationDelay: '70ms' }}>
            Post micro-tasks or earn NIM by completing them — no sign-ups, no waiting.
          </p>
        </div>

        {/* CTAs */}
        <div className="relative flex gap-3 animate-fade-up" style={{ animationDelay: '130ms' }}>
          <Button size="lg" className="flex-1" onClick={() => navigate('/browse')}>
            Browse tasks
          </Button>
          <Button size="lg" variant="secondary" className="flex-1" onClick={() => navigate('/create')}>
            Post a task
          </Button>
        </div>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-3 bg-nimiq-yellow-light border-y border-nimiq-yellow/20 py-1">
        {[
          { value: loading ? '…' : bounties.length.toString(), label: 'Open bounties' },
          { value: 'NIM', label: 'Native token' },
          { value: '0%', label: 'Platform fee' },
        ].map(({ value, label }) => (
          <div key={label} className="flex flex-col items-center py-3">
            <span className="font-display font-bold text-text-primary text-lg">{value}</span>
            <span className="text-[11px] text-text-secondary font-label mt-0.5">{label}</span>
          </div>
        ))}
      </div>

      {/* Open bounties */}
      <div className="px-4 pt-6 pb-2">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-bold text-text-primary text-[1.15rem]">Latest bounties</h2>
          <button
            onClick={() => navigate('/browse')}
            className="flex items-center gap-1 text-sm text-nimiq-yellow font-bold press"
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
                <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                  <div className="text-3xl mb-3">🎯</div>
                  <p className="font-display font-semibold text-text-primary text-sm mb-1">No bounties yet</p>
                  <p className="text-text-secondary text-xs">Be the first to post one!</p>
                </div>
              )}
        </div>
      </div>

      {/* How it works */}
      <div className="px-4 pt-8 pb-6">
        <h2 className="font-display font-bold text-text-primary text-[1.15rem] mb-5">How it works</h2>

        <div className="flex flex-col gap-3">
          {HOW_IT_WORKS.map(({ icon: Icon, step, title, desc }) => (
            <div key={step} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-start gap-4" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
              <div className="w-10 h-10 rounded-2xl bg-nimiq-yellow-light flex items-center justify-center shrink-0">
                <Icon size={18} className="text-nimiq-yellow" strokeWidth={2} />
              </div>
              <div>
                <span className="text-[10px] font-bold text-nimiq-yellow uppercase tracking-widest">{step}</span>
                <p className="font-display font-bold text-text-primary text-sm leading-tight">{title}</p>
                <p className="text-text-secondary text-xs mt-1 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer banner */}
      <div className="mx-4 mb-4 rounded-3xl bg-nimiq-yellow overflow-hidden">
        <div className="relative px-5 py-6">
          <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-black/5" />
          <div className="absolute -bottom-8 -left-4 w-24 h-24 rounded-full bg-black/5" />
          <div className="relative flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-black/10 flex items-center justify-center shrink-0">
              <Wallet size={18} className="text-[#1A1A1A]" strokeWidth={2} />
            </div>
            <div>
              <p className="font-display font-bold text-[#1A1A1A] text-sm leading-tight">Open inside Nimiq Pay</p>
              <p className="text-[#3A3A3A] text-xs mt-0.5">Wallet auto-connects, no extra steps.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
