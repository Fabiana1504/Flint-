import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Wallet, TrendingUp, CheckSquare, Star, Copy, Check } from 'lucide-react'
import { BountyCard } from '@/components/bounty/BountyCard'
import { SkeletonList } from '@/components/common/SkeletonCard'
import { EmptyState } from '@/components/common/EmptyState'
import { useWallet } from '@/context/WalletContext'
import { useLang } from '@/context/LangContext'
import { fetchMyBounties, fetchPaymentHistory, getOrCreateUser } from '@/lib/supabase'
import { formatReward, shortenAddress, timeAgo, cn } from '@/lib/utils'
import type { Bounty, Payment, User } from '@/types'

type Tab = 'created' | 'claimed' | 'payments'

export function Dashboard() {
  const navigate = useNavigate()
  const { wallet, user, connect, connecting } = useWallet()
  const { t, lang } = useLang()
  const [tab, setTab] = useState<Tab>('created')
  const [created, setCreated] = useState<Bounty[]>([])
  const [claimed, setClaimed] = useState<Bounty[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(false)
  const [freshUser, setFreshUser] = useState<User | null>(null)

  useEffect(() => {
    if (!wallet) return
    setLoading(true)
    Promise.all([
      fetchMyBounties(wallet.address),
      fetchPaymentHistory(wallet.address),
      getOrCreateUser(wallet.address),
    ])
      .then(([{ created: c, claimed: cl }, p, u]) => {
        setCreated(c)
        setClaimed(cl)
        setPayments(p)
        setFreshUser(u)
      })
      .finally(() => setLoading(false))
  }, [wallet])

  if (!wallet) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-6 text-center bg-background">
        <div className="w-24 h-24 rounded-4xl bg-surface border border-border flex items-center justify-center mb-6"
          style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.08)' }}>
          <Wallet size={36} className="text-nimiq-yellow" />
        </div>
        <h1 className="font-display font-extrabold text-text-primary text-2xl mb-2" style={{ letterSpacing: '-0.02em' }}>{t.dashboard.title}</h1>
        <p className="text-text-secondary text-sm max-w-[220px] leading-relaxed mb-8">
          {t.dashboard.connectDesc}
        </p>
        <button
          onClick={connect}
          disabled={connecting}
          className="w-full max-w-xs h-14 rounded-2xl font-display font-bold text-nimiq-dark text-base disabled:opacity-60 press"
          style={{ background: 'linear-gradient(135deg, #F5A623, #F7C04A)', boxShadow: '0 4px 20px rgba(245,166,35,0.4)' }}
        >
          {connecting ? t.dashboard.connecting : t.dashboard.connect}
        </button>
      </div>
    )
  }

  const TABS: { key: Tab; label: string; count: number }[] = [
    { key: 'created',  label: t.dashboard.created,     count: created.length },
    { key: 'claimed',  label: t.dashboard.claimedTab,  count: claimed.length },
    { key: 'payments', label: t.dashboard.paymentsTab, count: payments.length },
  ]

  const initial = wallet.address.replace(/\s/g, '').charAt(3) || 'N'

  return (
    <div className="flex flex-col bg-background">

      {/* Profile header */}
      <div className="bg-surface px-5 pt-8 pb-6 border-b border-border">
        <div className="flex items-center gap-3.5 mb-5">
          <div className="w-14 h-14 rounded-3xl flex items-center justify-center shrink-0"
            style={{ background: 'linear-gradient(135deg, #F5A623 0%, #F7C04A 100%)', boxShadow: '0 4px 16px rgba(245,166,35,0.35)' }}>
            <span className="font-display font-extrabold text-nimiq-dark text-2xl">{initial}</span>
          </div>
          <div className="min-w-0">
            <p className="font-display font-bold text-text-primary text-[1.05rem] truncate">{user?.displayName ?? t.dashboard.myAccount}</p>
            <p className="text-xs text-text-muted font-mono mt-0.5">{shortenAddress(wallet.address)}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <StatCard icon={<TrendingUp size={14} strokeWidth={2} />} label={t.dashboard.created}   value={created.length} />
          <StatCard icon={<CheckSquare size={14} strokeWidth={2} />} label={t.dashboard.completed} value={claimed.filter(b => b.status === 'paid').length} />
          <StatCard icon={<Star size={14} strokeWidth={2} />}        label={t.dashboard.repScore}  value={freshUser?.reputationScore ?? user?.reputationScore ?? 0} />
        </div>
      </div>

      {/* Tabs */}
      <div className="sticky top-0 z-10 bg-surface border-b border-border flex">
        {TABS.map(({ key, label, count }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={cn('flex-1 py-3.5 text-sm font-bold transition-colors relative press', tab === key ? 'text-text-primary' : 'text-gray-400')}
          >
            <span>{label}</span>
            {count > 0 && (
              <span className={cn('ml-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full',
                tab === key ? 'bg-nimiq-yellow text-nimiq-dark' : 'bg-border text-text-muted')}>
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
            ? <EmptyState icon="📋" title={t.dashboard.noCreated} description={t.dashboard.noCreatedDesc} action={{ label: t.dashboard.postBounty, onClick: () => navigate('/create') }} />
            : <div className="flex flex-col gap-3 stagger">{created.map(b => <BountyCard key={b.id} bounty={b} />)}</div>
        ) : tab === 'claimed' ? (
          claimed.length === 0
            ? <EmptyState icon="🎯" title={t.dashboard.noClaimed} description={t.dashboard.noClaimedDesc} action={{ label: t.dashboard.browseBounties, onClick: () => navigate('/browse') }} />
            : <div className="flex flex-col gap-3 stagger">{claimed.map(b => <BountyCard key={b.id} bounty={b} />)}</div>
        ) : (
          payments.length === 0
            ? <EmptyState icon="💸" title={t.dashboard.noPayments} description={t.dashboard.noPaymentsDesc} />
            : <div className="flex flex-col gap-3 stagger">{payments.map(p => <PaymentRow key={p.id} payment={p} myAddress={wallet.address} lang={lang} sent={t.dashboard.sent} received={t.dashboard.received} />)}</div>
        )}
      </div>
    </div>
  )
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="bg-background rounded-2xl p-3 border border-border">
      <div className="flex items-center gap-1.5 text-text-muted mb-1">{icon}<span className="text-xs font-semibold">{label}</span></div>
      <span className="font-display font-bold text-text-primary text-2xl">{value}</span>
    </div>
  )
}

function PaymentRow({ payment, myAddress, lang, sent, received }: { payment: Payment; myAddress: string; lang: 'en' | 'es'; sent: string; received: string }) {
  const isSent = payment.fromWallet === myAddress
  const [copied, setCopied] = useState(false)
  const visibleHash = payment.txHash && !payment.txHash.startsWith('recovery-')

  function copyHash() {
    if (!payment.txHash) return
    navigator.clipboard.writeText(payment.txHash).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }

  return (
    <div className="bg-surface rounded-3xl p-4 flex flex-col gap-2" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
      <div className="flex items-center gap-3">
        <div className={cn('w-11 h-11 rounded-2xl flex items-center justify-center text-lg font-bold shrink-0', isSent ? 'bg-red-50 dark:bg-red-950/40 text-red-500' : 'bg-green-50 dark:bg-green-950/40 text-green-600')}>
          {isSent ? '↑' : '↓'}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-text-primary text-sm">{isSent ? sent : received}</p>
          <p className="text-xs text-text-muted">{timeAgo(payment.createdAt, lang)}</p>
        </div>
        <span className={cn('font-display font-extrabold text-base shrink-0', isSent ? 'text-error' : 'text-success')}>
          {isSent ? '−' : '+'}{formatReward(payment.amount, payment.currency)}
        </span>
      </div>

      {/* TxHash */}
      {visibleHash && (
        <div className="flex items-center gap-2 pl-14">
          <span className="text-[10px] font-mono text-text-muted truncate flex-1">
            {payment.txHash!.slice(0, 12)}…{payment.txHash!.slice(-8)}
          </span>
          <button
            onClick={copyHash}
            className="shrink-0 w-6 h-6 rounded-lg flex items-center justify-center text-text-muted hover:text-text-primary bg-background border border-border transition-colors press"
          >
            {copied ? <Check size={11} className="text-green-500" /> : <Copy size={11} />}
          </button>
        </div>
      )}
    </div>
  )
}
