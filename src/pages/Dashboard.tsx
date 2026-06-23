import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Wallet, TrendingUp, CheckSquare, Star } from 'lucide-react'
import { BountyCard } from '@/components/bounty/BountyCard'
import { SkeletonList } from '@/components/common/SkeletonCard'
import { EmptyState } from '@/components/common/EmptyState'
import { useWallet } from '@/context/WalletContext'
import { fetchMyBounties, fetchPaymentHistory } from '@/lib/supabase'
import { formatReward, shortenAddress, timeAgo, cn } from '@/lib/utils'
import type { Bounty, Payment } from '@/types'

type Tab = 'created' | 'claimed' | 'payments'

export function Dashboard() {
  const navigate = useNavigate()
  const { wallet, user, connect, connecting } = useWallet()
  const [tab, setTab] = useState<Tab>('created')
  const [created, setCreated] = useState<Bounty[]>([])
  const [claimed, setClaimed] = useState<Bounty[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!wallet) return
    setLoading(true)
    Promise.all([fetchMyBounties(wallet.address), fetchPaymentHistory(wallet.address)])
      .then(([{ created: c, claimed: cl }, p]) => { setCreated(c); setClaimed(cl); setPayments(p) })
      .finally(() => setLoading(false))
  }, [wallet])

  if (!wallet) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-6 text-center bg-background">
        <div className="w-24 h-24 rounded-4xl bg-white border border-gray-100 flex items-center justify-center mb-6"
          style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.08)' }}>
          <Wallet size={36} className="text-nimiq-yellow" />
        </div>
        <h1 className="font-display font-extrabold text-text-primary text-2xl mb-2" style={{ letterSpacing: '-0.02em' }}>Your dashboard</h1>
        <p className="text-text-secondary text-sm max-w-[220px] leading-relaxed mb-8">
          Connect your Nimiq wallet to see your bounties and payments.
        </p>
        <button
          onClick={connect}
          disabled={connecting}
          className="w-full max-w-xs h-14 rounded-2xl font-display font-bold text-nimiq-dark text-base disabled:opacity-60 press"
          style={{ background: 'linear-gradient(135deg, #F5A623, #F7C04A)', boxShadow: '0 4px 20px rgba(245,166,35,0.4)' }}
        >
          {connecting ? 'Connecting…' : 'Connect wallet'}
        </button>
      </div>
    )
  }

  const TABS: { key: Tab; label: string; count: number }[] = [
    { key: 'created',  label: 'Created',  count: created.length },
    { key: 'claimed',  label: 'Claimed',  count: claimed.length },
    { key: 'payments', label: 'Payments', count: payments.length },
  ]

  const initial = wallet.address.replace(/\s/g, '').charAt(3) || 'N'

  return (
    <div className="flex flex-col bg-background">

      {/* Profile header */}
      <div className="bg-white px-5 pt-8 pb-6 border-b border-gray-100">
        <div className="flex items-center gap-3.5 mb-5">
          <div className="w-14 h-14 rounded-3xl flex items-center justify-center shrink-0"
            style={{ background: 'linear-gradient(135deg, #F5A623 0%, #F7C04A 100%)', boxShadow: '0 4px 16px rgba(245,166,35,0.35)' }}>
            <span className="font-display font-extrabold text-nimiq-dark text-2xl">{initial}</span>
          </div>
          <div className="min-w-0">
            <p className="font-display font-bold text-text-primary text-[1.05rem] truncate">{user?.displayName ?? 'My account'}</p>
            <p className="text-xs text-text-muted font-mono mt-0.5">{shortenAddress(wallet.address)}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <StatCard icon={<TrendingUp size={14} strokeWidth={2} />} label="Created"   value={user?.createdBounties ?? 0} />
          <StatCard icon={<CheckSquare size={14} strokeWidth={2} />} label="Completed" value={user?.completedBounties ?? 0} />
          <StatCard icon={<Star size={14} strokeWidth={2} />}        label="Rep score"  value={user?.reputationScore ?? 0} />
        </div>
      </div>

      {/* Tabs */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100 flex">
        {TABS.map(({ key, label, count }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={cn('flex-1 py-3.5 text-sm font-bold transition-colors relative press', tab === key ? 'text-text-primary' : 'text-gray-400')}
          >
            <span>{label}</span>
            {count > 0 && (
              <span className={cn('ml-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full',
                tab === key ? 'bg-nimiq-yellow text-nimiq-dark' : 'bg-gray-100 text-gray-400')}>
                {count}
              </span>
            )}
            {tab === key && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-0.5 bg-nimiq-yellow rounded-full" />}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="px-4 pt-4 pb-4">
        {loading ? (
          <SkeletonList count={3} />
        ) : tab === 'created' ? (
          created.length === 0
            ? <EmptyState icon="📋" title="No bounties yet" description="Post your first bounty and start getting work done." action={{ label: 'Post a bounty', onClick: () => navigate('/create') }} />
            : <div className="flex flex-col gap-3 stagger">{created.map(b => <BountyCard key={b.id} bounty={b} />)}</div>
        ) : tab === 'claimed' ? (
          claimed.length === 0
            ? <EmptyState icon="🎯" title="Nothing claimed yet" description="Browse open bounties and start earning NIM." action={{ label: 'Browse bounties', onClick: () => navigate('/browse') }} />
            : <div className="flex flex-col gap-3 stagger">{claimed.map(b => <BountyCard key={b.id} bounty={b} />)}</div>
        ) : (
          payments.length === 0
            ? <EmptyState icon="💸" title="No payments yet" description="Completed bounty payments will appear here." />
            : <div className="flex flex-col gap-3 stagger">{payments.map(p => <PaymentRow key={p.id} payment={p} myAddress={wallet.address} />)}</div>
        )}
      </div>
    </div>
  )
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="bg-gray-50 rounded-2xl p-3">
      <div className="flex items-center gap-1.5 text-text-muted mb-1">{icon}<span className="text-xs font-semibold">{label}</span></div>
      <span className="font-display font-bold text-text-primary text-2xl">{value}</span>
    </div>
  )
}

function PaymentRow({ payment, myAddress }: { payment: Payment; myAddress: string }) {
  const isSent = payment.fromWallet === myAddress
  return (
    <div className="bg-white rounded-3xl p-4 flex items-center gap-3" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
      <div className={cn('w-11 h-11 rounded-2xl flex items-center justify-center text-lg font-bold shrink-0', isSent ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-600')}>
        {isSent ? '↑' : '↓'}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-text-primary text-sm">{isSent ? 'Sent' : 'Received'}</p>
        <p className="text-xs text-text-muted">{timeAgo(payment.createdAt)}</p>
      </div>
      <span className={cn('font-display font-extrabold text-base', isSent ? 'text-error' : 'text-success')}>
        {isSent ? '−' : '+'}{formatReward(payment.amount, payment.currency)}
      </span>
    </div>
  )
}
