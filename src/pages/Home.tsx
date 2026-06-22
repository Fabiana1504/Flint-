import { useNavigate } from 'react-router-dom'
import { ArrowRight, Zap, CheckCircle, DollarSign, Flame } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { BountyCard } from '@/components/bounty/BountyCard'
import { SkeletonCard } from '@/components/common/SkeletonCard'
import { useBounties } from '@/hooks/useBounties'

const HOW_IT_WORKS = [
  { icon: Zap, step: '01', title: 'Post a bounty', desc: 'Describe the task, set the reward in NIM or USDT.' },
  { icon: CheckCircle, step: '02', title: 'Someone claims it', desc: 'A worker claims the task and gets to work.' },
  { icon: DollarSign, step: '03', title: 'Approve & pay', desc: 'Review the evidence, approve, payment releases instantly.' },
]

export function Home() {
  const navigate = useNavigate()
  const { bounties, loading } = useBounties({ status: 'open' })
  const featured = bounties.slice(0, 3)

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <div className="relative px-5 pt-12 pb-10 overflow-hidden bg-white">
        {/* Yellow decorative blob */}
        <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-nimiq-yellow/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 -left-6 w-32 h-32 rounded-full bg-nimiq-yellow/8 blur-2xl pointer-events-none" />

        {/* Logo */}
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-xl bg-nimiq-yellow flex items-center justify-center shadow-sm">
            <Flame size={16} className="text-text-primary" strokeWidth={2.5} />
          </div>
          <span className="font-display font-bold text-text-primary text-lg tracking-tight">Flint</span>
        </div>

        {/* Tagline */}
        <h1 className="font-display font-bold text-[2.25rem] leading-[1.1] text-text-primary mb-3 animate-fade-up">
          Small tasks.<br />
          <span className="text-nimiq-yellow">Real rewards.</span>
        </h1>
        <p className="text-text-secondary text-[0.95rem] leading-relaxed mb-8 max-w-[280px] animate-fade-up" style={{ animationDelay: '80ms' }}>
          Post a micro-bounty or claim one. Get paid instantly via Nimiq Pay — no sign-ups, no friction.
        </p>

        {/* CTAs */}
        <div className="flex gap-3 animate-fade-up" style={{ animationDelay: '140ms' }}>
          <Button size="lg" className="flex-1 shadow-sm shadow-nimiq-yellow/20" onClick={() => navigate('/browse')}>
            Browse bounties
          </Button>
          <Button size="lg" variant="secondary" className="flex-1" onClick={() => navigate('/create')}>
            Post a task
          </Button>
        </div>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-3 bg-nimiq-yellow-light border-y border-nimiq-yellow/20">
        {[
          { value: bounties.length.toString(), label: 'Open bounties' },
          { value: 'NIM', label: 'Native currency' },
          { value: '0%', label: 'Platform fee' },
        ].map(({ value, label }) => (
          <div key={label} className="flex flex-col items-center py-3.5">
            <span className="font-display font-bold text-text-primary text-lg leading-tight">{value}</span>
            <span className="text-[11px] text-text-secondary font-label mt-0.5">{label}</span>
          </div>
        ))}
      </div>

      {/* Open bounties */}
      <div className="px-5 pt-7 pb-2">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-semibold text-text-primary text-[1.1rem]">Open bounties</h2>
          <button
            onClick={() => navigate('/browse')}
            className="flex items-center gap-1 text-sm text-nimiq-yellow font-semibold"
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
                <div className="text-center py-10 text-text-secondary text-sm">
                  No bounties yet — be the first to post one!
                </div>
              )}
        </div>
      </div>

      {/* How it works */}
      <div className="px-5 pt-8 pb-8">
        <h2 className="font-display font-semibold text-text-primary text-[1.1rem] mb-5">How it works</h2>
        <div className="relative flex flex-col gap-0">
          {/* Vertical line */}
          <div className="absolute left-[19px] top-10 bottom-10 w-px bg-gray-100" />

          {HOW_IT_WORKS.map(({ icon: Icon, step, title, desc }) => (
            <div key={step} className="flex gap-4 items-start py-3">
              <div className="relative z-10 w-10 h-10 rounded-2xl bg-white border border-gray-100 shadow-card flex items-center justify-center shrink-0">
                <Icon size={17} className="text-nimiq-yellow" strokeWidth={2} />
              </div>
              <div className="pt-1.5">
                <span className="text-[10px] font-label font-bold text-nimiq-yellow tracking-widest uppercase">{step}</span>
                <h3 className="font-display font-semibold text-text-primary text-[0.9rem] leading-tight">{title}</h3>
                <p className="text-text-secondary text-sm mt-0.5 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
