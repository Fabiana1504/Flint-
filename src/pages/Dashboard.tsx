import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Wallet } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { BountyCard } from '@/components/bounty/BountyCard'
import { SkeletonList } from '@/components/common/SkeletonCard'
import { EmptyState } from '@/components/common/EmptyState'
import { useWallet } from '@/context/WalletContext'
import { fetchMyBounties, fetchPaymentHistory } from '@/lib/supabase'
import { formatReward, shortenAddress, timeAgo } from '@/lib/utils'
import { cn } from '@/lib/utils'
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
    Promise.all([
      fetchMyBounties(wallet.address),
      fetchPaymentHistory(wallet.address),
    ]).then(([{ created: c, claimed: cl }, p]) => {
      setCreated(c)
      setClaimed(cl)
      setPayments(p)
    }).finally(() => setLoading(false))
  }, [wallet])

  if (!wallet) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-5 text-center">
        <div className="w-16 h-16 rounded-full bg-nimiq-yellow-light flex items-center justify-center mb-5">
          <Wallet size={28} className="text-nimiq-yellow" />
        </div>
        <h1 className="font-display font-bold text-text-primary text-2xl mb-2">Your dashboard</h1>
        <p className="text-text-secondary text-sm max-w-[240px] leading-relaxed mb-8">
          Connect your Nimiq wallet to see your bounties and payment history.
        </p>
        <Button size="lg" onClick={connect} disabled={connecting}>
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
      <div className="px-5 pt-8 pb-5 bg-white border-b border-gray-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-11 h-11 rounded-full bg-nimiq-yellow-light flex items-center justify-center">
            <span className="text-nimiq-yellow font-display font-bold text-lg">
              {shortenAddress(wallet.address).charAt(0)}
            </span>
          </div>
          <div>
            <p className="font-display font-semibold text-text-primary">{user?.displayName ?? 'My account'}</p>
            <p className="text-xs text-text-secondary font-label">{shortenAddress(wallet.address)}</p>
          </div>
        </div>

        <div className="flex gap-4">
          <Stat label="Created" value={user?.createdBounties ?? 0} />
          <Stat label="Completed" value={user?.completedBounties ?? 0} />
          <Stat label="Rep score" value={user?.reputationScore ?? 0} />
        </div>
      </div>

      {/* Tabs */}
      <div className="sticky top-0 bg-background z-10 flex border-b border-gray-100">
        {TABS.map(({ key, label, count }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={cn(
              'flex-1 py-3.5 text-sm font-label font-semibold transition-colors relative',
              tab === key ? 'text-text-primary' : 'text-text-secondary'
            )}
          >
            {label} {count > 0 && <span className="ml-1 text-xs text-text-secondary">({count})</span>}
            {tab === key && (
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-nimiq-yellow rounded-full" />
            )}
          </button>
        ))}
      </div>

      <div className="px-5 pt-4 flex flex-col gap-3">
        {loading ? (
          <SkeletonList count={3} />
        ) : tab === 'created' ? (
          created.length === 0
            ? <EmptyState icon="📋" title="No bounties yet" description="Post your first bounty to get started." action={{ label: 'Post a bounty', onClick: () => navigate('/create') }} />
            : created.map((b) => <BountyCard key={b.id} bounty={b} />)
        ) : tab === 'claimed' ? (
          claimed.length === 0
            ? <EmptyState icon="🎯" title="Nothing claimed yet" description="Browse bounties and claim one to earn rewards." action={{ label: 'Browse bounties', onClick: () => navigate('/browse') }} />
            : claimed.map((b) => <BountyCard key={b.id} bounty={b} />)
        ) : (
          payments.length === 0
            ? <EmptyState icon="💸" title="No payments yet" description="Completed bounties will show up here." />
            : payments.map((p) => <PaymentRow key={p.id} payment={p} myAddress={wallet.address} />)
        )}
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col">
      <span className="font-display font-bold text-text-primary text-xl">{value}</span>
      <span className="text-xs text-text-secondary font-label">{label}</span>
    </div>
  )
}

function PaymentRow({ payment, myAddress }: { payment: Payment; myAddress: string }) {
  const isSent = payment.fromWallet === myAddress
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-4 flex items-center justify-between">
      <div>
        <p className="text-sm font-label font-semibold text-text-primary">
          {isSent ? 'Sent' : 'Received'}
        </p>
        <p className="text-xs text-text-secondary mt-0.5">{timeAgo(payment.createdAt)}</p>
      </div>
      <span className={cn('font-display font-bold text-base', isSent ? 'text-error' : 'text-success')}>
        {isSent ? '−' : '+'}{formatReward(payment.amount, payment.currency)}
      </span>
    </div>
  )
}
