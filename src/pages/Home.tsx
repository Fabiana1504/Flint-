import { useNavigate } from 'react-router-dom'
import { Zap, ArrowRight, CheckCircle, DollarSign, Flame } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { BountyCard } from '@/components/bounty/BountyCard'
import { SkeletonCard } from '@/components/common/SkeletonCard'
import { useBounties } from '@/hooks/useBounties'

const HOW_IT_WORKS = [
  { icon: Zap, step: '01', title: 'Post a bounty', desc: 'Describe your task, set the reward in NIM or USDT, fund it.' },
  { icon: CheckCircle, step: '02', title: 'Someone claims it', desc: 'A worker claims the task and gets to work.' },
  { icon: DollarSign, step: '03', title: 'Approve & pay', desc: 'Review the work, approve it, payment releases instantly.' },
]

export function Home() {
  const navigate = useNavigate()
  const { bounties, loading } = useBounties({ status: 'open' })
  const featured = bounties.slice(0, 3)

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="px-5 pt-12 pb-8 bg-white">
        <div className="flex items-center gap-2 mb-5">
          <Flame size={22} className="text-nimiq-yellow" strokeWidth={2.5} />
          <span className="font-display font-bold text-text-primary text-lg tracking-tight">Flint</span>
        </div>
        <h1 className="font-display font-bold text-[2rem] leading-[1.15] text-text-primary mb-2">
          Small tasks.<br />Real rewards.
        </h1>
        <p className="text-text-secondary text-[0.95rem] leading-relaxed mb-7 max-w-[300px]">
          Post a micro-bounty. Claim one. Get paid instantly via Nimiq Pay.
        </p>
        <div className="flex gap-3">
          <Button size="lg" className="flex-1" onClick={() => navigate('/browse')}>
            Browse bounties
          </Button>
          <Button size="lg" variant="secondary" className="flex-1" onClick={() => navigate('/create')}>
            Post a bounty
          </Button>
        </div>
      </div>

      {/* Featured bounties */}
      <div className="px-5 pt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-semibold text-text-primary text-lg">Open bounties</h2>
          <button
            onClick={() => navigate('/browse')}
            className="text-sm text-nimiq-yellow font-medium flex items-center gap-1"
          >
            See all <ArrowRight size={14} />
          </button>
        </div>

        <div className="flex flex-col gap-3">
          {loading
            ? Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)
            : featured.map((b) => <BountyCard key={b.id} bounty={b} />)}
        </div>
      </div>

      {/* How it works */}
      <div className="px-5 pt-10 pb-6">
        <h2 className="font-display font-semibold text-text-primary text-lg mb-5">How it works</h2>
        <div className="flex flex-col gap-4">
          {HOW_IT_WORKS.map(({ icon: Icon, step, title, desc }) => (
            <div key={step} className="flex gap-4 items-start">
              <div className="w-10 h-10 rounded-2xl bg-nimiq-yellow-light flex items-center justify-center shrink-0">
                <Icon size={18} className="text-nimiq-yellow" strokeWidth={2} />
              </div>
              <div>
                <span className="text-[10px] font-label font-semibold text-nimiq-yellow tracking-widest uppercase">{step}</span>
                <h3 className="font-display font-semibold text-text-primary text-[0.95rem] leading-tight">{title}</h3>
                <p className="text-text-secondary text-sm mt-0.5 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
