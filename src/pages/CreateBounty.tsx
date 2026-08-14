import { useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Flame, Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useWallet } from '@/context/WalletContext'
import { useLang } from '@/context/LangContext'
import { createBounty } from '@/lib/supabase'
import { CATEGORIES, cn } from '@/lib/utils'
import type { BountyCategory } from '@/types'

const schema = z.object({
  title:            z.string().min(5, 'At least 5 characters').max(100),
  description:      z.string().min(20, 'At least 20 characters').max(2000),
  evidenceRequired: z.string().min(10, 'Describe what proof you need').max(500),
  rewardAmount:     z.coerce.number().positive('Must be positive'),
})
type FormData = z.infer<typeof schema>

const CAT_STYLE: Record<BountyCategory, { emoji: string; active: string; glow: string }> = {
  Testing: { emoji: '🧪', active: 'bg-purple-500 border-purple-500', glow: 'rgba(168,85,247,0.3)' },
  Design:  { emoji: '🎨', active: 'bg-pink-500   border-pink-500',   glow: 'rgba(236,72,153,0.3)' },
  Writing: { emoji: '✍️', active: 'bg-blue-500   border-blue-500',   glow: 'rgba(59,130,246,0.3)' },
  Survey:  { emoji: '📋', active: 'bg-teal-500   border-teal-500',   glow: 'rgba(20,184,166,0.3)' },
  Dev:     { emoji: '💻', active: 'bg-orange-500 border-orange-500', glow: 'rgba(249,115,22,0.3)' },
}

export function CreateBounty() {
  const navigate = useNavigate()
  const { wallet, connect, connecting } = useWallet()
  const { t } = useLang()
  const [category, setCategory]   = useState<BountyCategory>('Dev')
  const [submitting, setSubmitting] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) })

  async function onSubmit(data: FormData) {
    if (!wallet) { await connect(); return }
    setSubmitting(true)
    try {
      const bounty = await createBounty({ title: data.title, description: data.description, category, rewardAmount: data.rewardAmount, rewardCurrency: 'NIM', creatorWallet: wallet.address, evidenceRequired: data.evidenceRequired, status: 'open' })
      navigate(`/bounty/${bounty.id}`)
    } finally { setSubmitting(false) }
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">

      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-border px-4 h-14 flex items-center gap-2 bg-surface/95">
        <button onClick={() => navigate(-1)} className="w-9 h-9 flex items-center justify-center rounded-full bg-background press">
          <ArrowLeft size={18} className="text-text-primary" />
        </button>
        <span className="font-display font-bold text-text-primary">{t.create.title}</span>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="px-4 pt-5 pb-8 flex flex-col gap-5">

        {/* Title */}
        <Field label={t.create.whatTask} error={errors.title?.message}>
          <Input {...register('title')} placeholder={t.create.taskPlaceholder} className="h-13 text-base" />
        </Field>

        {/* Description */}
        <Field label={t.create.describeIt} error={errors.description?.message}>
          <Textarea {...register('description')} placeholder={t.create.descPlaceholder} rows={4} />
        </Field>

        {/* Category */}
        <div className="flex flex-col gap-2.5">
          <label className="text-sm font-bold text-text-primary">{t.create.category}</label>
          <div className="grid grid-cols-3 gap-2">
            {(CATEGORIES.slice(0, 3)).map(cat => <CatButton key={cat} cat={cat} active={category === cat} onSelect={setCategory} label={t.categories[cat]} />)}
          </div>
          <div className="grid grid-cols-2 gap-2">
            {(CATEGORIES.slice(3)).map(cat => <CatButton key={cat} cat={cat} active={category === cat} onSelect={setCategory} label={t.categories[cat]} />)}
          </div>
        </div>

        {/* Reward */}
        <div className="flex flex-col gap-2.5">
          <label className="text-sm font-bold text-text-primary">{t.create.reward}</label>
          <div className="bg-surface rounded-3xl border border-border overflow-hidden shadow-card px-5 py-5">
            <div className="flex items-baseline gap-2">
              <input
                {...register('rewardAmount')}
                type="number"
                inputMode="decimal"
                min="0"
                step="any"
                placeholder="0"
                className="flex-1 text-4xl font-display font-extrabold text-text-primary bg-transparent outline-none placeholder:text-text-muted w-0"
                style={{ letterSpacing: '-0.03em' }}
              />
              <span className="text-lg font-bold text-nimiq-yellow">NIM</span>
            </div>
            {errors.rewardAmount && <p className="text-xs text-error font-medium mt-1">{errors.rewardAmount.message}</p>}
          </div>
        </div>

        {/* Evidence */}
        <Field label={t.create.proof} error={errors.evidenceRequired?.message}>
          <Textarea {...register('evidenceRequired')} placeholder={t.create.proofPlaceholder} rows={3} />
        </Field>

        {/* Submit */}
        {!wallet ? (
          <ActionBtn label={connecting ? t.dashboard.connecting : t.create.connectToPost} onClick={connect} disabled={connecting} />
        ) : (
          <ActionBtn label={submitting ? '' : t.create.postBounty} onClick={handleSubmit(onSubmit)} disabled={submitting} loading={submitting} icon={<Flame size={18} strokeWidth={2.5} />} />
        )}
      </form>
    </div>
  )
}

function CatButton({ cat, active, onSelect, label }: { cat: BountyCategory; active: boolean; onSelect: (c: BountyCategory) => void; label: string }) {
  const s = CAT_STYLE[cat]
  return (
    <button
      type="button"
      onClick={() => onSelect(cat)}
      className={cn(
        'flex flex-col items-center gap-1.5 py-3.5 rounded-2xl border-2 text-xs font-bold transition-all duration-150 press',
        active ? `${s.active} text-white` : 'border-border bg-surface text-text-secondary'
      )}
      style={active ? { boxShadow: `0 4px 16px ${s.glow}` } : {}}
    >
      <span className="text-2xl leading-none">{s.emoji}</span>
      {label}
    </button>
  )
}

function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-bold text-text-primary">{label}</label>
      {children}
      {error && <p className="text-xs text-error font-semibold">{error}</p>}
    </div>
  )
}


function ActionBtn({ label, onClick, disabled, loading, icon }: { label: string; onClick: () => void; disabled?: boolean; loading?: boolean; icon?: ReactNode }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full h-14 rounded-2xl font-display font-bold text-[#18181B] text-base disabled:opacity-60 flex items-center justify-center gap-2.5 mt-1 press"
      style={{ background: 'linear-gradient(145deg,#F7C04A 0%,#F5A623 60%,#E8951A 100%)', boxShadow: '0 6px 24px rgba(245,166,35,0.48)' }}
    >
      {loading ? <Loader2 size={20} className="animate-spin" /> : <>{icon}{label}</>}
    </button>
  )
}
