import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Wallet, TrendingUp, CheckSquare, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
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
      <div className="flex flex-col items-center justify-center min-h-screen px-6 text-center">
        <div className="w-20 h-20 rounded-3xl bg-nimiq-yellow-light flex items-center justify-center mb-5">
          <Wallet size={32} className="text-nimiq-yellow" />
        </div>
        <h1 className="font-display font-bold text-text-primary text-2xl mb-2">Your dashboard</h1>
        <p className="text-text-secondary text-sm max-w-[220px] leading-relaxed mb-8">
          Connect your Nimiq wallet to see your bounties and payments.
        </p>
        <Button size="lg" className="w-full max-w-xs" onClick={connect} disabled={connecting}>
          {connecting ? 'Connecting…' : 'Connect wallet'}
        </Button>
      </div>
    )
  }

  const TABS: { key: Tab; label: string; count: number }[] = [
    { key: 'created', label: 'Created', count: created.length },
    { key: 'claimed', label: 'Claimed', count: claimed.length },
    { key: 'payments', label: 'Payments', count: payments.length },
  ]

  return (
    <div className="flex flex-col">
      {/* Profile header */}
      <div className="bg-white px-5 pt-8 pb-6 border-b border-gray-100">
        <div className="flex items-center gap-3 mb-5">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
            style={{ background: 'linear-gradient(135deg, #F5A623 0%, #F5C842 100%)' }}
          >
            <span className="text-white font-display font-bold text-xl">
              {wallet.address.charAt(3) || 'N'}
            </span>
          </div>
          <div>
            <p className="font-display font-bold text-text-primary text-[1rem]">{user?.displayName ?? 'My account'}</p>
            <p className="text-xs text-text-secondary font-label mt-0.5">{shortenAddress(wallet.address)}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          <StatCard icon={<TrendingUp size={14} />} label="Created" value={user?.createdBounties ?? 0} />
          <StatCard icon={<CheckSquare size={14} />} label="Completed" value={user?.completedBounties ?? 0} />
          <StatCard icon={<Clock size={14} />} label="Rep score" value={user?.reputationScore ?? 0} />
        </div>
      </div>

      {/* Tabs */}
      <div className="sticky top-0 bg-white z-10 flex border-b border-gray-100">
        {TABS.map(({ key, label, count }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={cn(
              'flex-1 py-3.5 text-sm font-semibold transition-colors relative press',
              tab === key ? 'text-text-primary' : 'text-gray-400'
            )}
          >
            {label}
            {count > 0 && (
              <span className={cn(
                'ml-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full',
                tab === key ? 'bg-nimiq-yellow text-text-primary' : 'bg-gray-100 text-gray-400'
              )}>
                {count}
              </span>
            )}
            {tab === key && (
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-0.5 bg-nimiq-yellow rounded-full" />
            )}
          </button>
        ))}
      </div>

      <div className="px-4 pt-4 pb-4 flex flex-col gap-3">
        {loading ? (
          <SkeletonList count={3} />
        ) : tab === 'created' ? (
          created.length === 0
            ? <EmptyState icon="📋" title="No bounties yet" description="Post your first bounty and start getting work done." action={{ label: 'Post a bounty', onClick: () => navigate('/create') }} />
            : <div className="flex flex-col gap-3 stagger">{created.map((b) => <BountyCard key={b.id} bounty={b} />)}</div>
        ) : tab === 'claimed' ? (
          claimed.length === 0
            ? <EmptyState icon="🎯" title="Nothing claimed yet" description="Browse open bounties and start earning." action={{ label: 'Browse bounties', onClick: () => navigate('/browse') }} />
            : <div className="flex flex-col gap-3 stagger">{claimed.map((b) => <BountyCard key={b.id} bounty={b} />)}</div>
        ) : (
          payments.length === 0
            ? <EmptyState icon="💸" title="No payments yet" description="Completed bounty payments will appear here." />
            : <div className="flex flex-col gap-3 stagger">{payments.map((p) => <PaymentRow key={p.id} payment={p} myAddress={wallet.address} />)}</div>
        )}
      </div>
    </div>
  )
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="bg-gray-50 rounded-2xl p-3 flex flex-col gap-1">
      <div className="flex items-center gap-1.5 text-text-secondary">{icon}<span className="text-xs font-label">{label}</span></div>
      <span className="font-display font-bold text-text-primary text-xl">{value}</span>
    </div>
  )
}

function PaymentRow({ payment, myAddress }: { payment: Payment; myAddress: string }) {
  const isSent = payment.fromWallet === myAddress
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center justify-between" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
      <div className="flex items-center gap-3">
        <div className={cn('w-9 h-9 rounded-full flex items-center justify-center text-sm', isSent ? 'bg-red-50' : 'bg-green-50')}>
          {isSent ? '↑' : '↓'}
        </div>
        <div>
          <p className="text-sm font-semibold text-text-primary">{isSent ? 'Sent' : 'Received'}</p>
          <p className="text-xs text-text-secondary">{timeAgo(payment.createdAt)}</p>
        </div>
      </div>
      <span className={cn('font-display font-bold text-base', isSent ? 'text-error' : 'text-success')}>
        {isSent ? '−' : '+'}{formatReward(payment.amount, payment.currency)}
      </span>
    </div>
  )
}
