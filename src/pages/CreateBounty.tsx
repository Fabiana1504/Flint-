import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Flame } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useWallet } from '@/context/WalletContext'
import { createBounty } from '@/lib/supabase'
import { CATEGORIES, cn, checkBountyRateLimit } from '@/lib/utils'
import type { BountyCategory, RewardCurrency } from '@/types'

const schema = z.object({
  title: z.string().min(5, 'At least 5 characters').max(100),
  description: z.string().min(20, 'At least 20 characters').max(2000),
  evidenceRequired: z.string().min(10, 'Describe what proof you need').max(500),
  rewardAmount: z.coerce.number().positive('Must be positive'),
})

type FormData = z.infer<typeof schema>

const CATEGORY_EMOJIS: Record<BountyCategory, string> = {
  Testing: '🧪', Design: '🎨', Writing: '✍️', Survey: '📋', Dev: '💻',
}

export function CreateBounty() {
  const navigate = useNavigate()
  const { wallet, connect, connecting } = useWallet()
  const [category, setCategory] = useState<BountyCategory>('Dev')
  const [currency, setCurrency] = useState<RewardCurrency>('NIM')
  const [submitting, setSubmitting] = useState(false)
  const [rateError, setRateError] = useState<string | null>(null)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  async function onSubmit(data: FormData) {
    if (!wallet) { await connect(); return }

    const rl = checkBountyRateLimit(wallet.address)
    if (!rl.allowed) {
      setRateError(`Too many bounties. Try again in ${rl.retryInMinutes} min.`)
      return
    }
    setRateError(null)

    setSubmitting(true)
    try {
      const bounty = await createBounty({
        title: data.title,
        description: data.description,
        category,
        rewardAmount: data.rewardAmount,
        rewardCurrency: currency,
        creatorWallet: wallet.address,
        evidenceRequired: data.evidenceRequired,
        status: 'open',
      })
      navigate(`/bounty/${bounty.id}`)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 bg-white/95 border-b border-gray-100 z-10 px-4 h-14 flex items-center gap-2">
        <button onClick={() => navigate(-1)} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors press">
          <ArrowLeft size={20} className="text-text-primary" />
        </button>
        <span className="font-display font-semibold text-text-primary text-[0.95rem]">Post a bounty</span>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="px-4 pt-5 pb-8 flex flex-col gap-5">
        <Field label="Title" hint="Be specific and clear" error={errors.title?.message}>
          <Input {...register('title')} placeholder="e.g. Test our checkout flow on mobile" />
        </Field>

        <Field label="Description" hint="What exactly needs to be done?" error={errors.description?.message}>
          <Textarea {...register('description')} placeholder="Describe the task in detail. Include any links, assets or context the worker will need." rows={4} />
        </Field>

        {/* Category */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-text-primary">Category</label>
          <div className="grid grid-cols-3 gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={cn(
                  'flex flex-col items-center gap-1 py-3 rounded-2xl border text-xs font-semibold transition-all duration-150 press',
                  category === cat
                    ? 'border-nimiq-yellow bg-nimiq-yellow-light text-nimiq-yellow'
                    : 'border-gray-200 bg-white text-text-secondary'
                )}
              >
                <span className="text-xl">{CATEGORY_EMOJIS[cat]}</span>
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Reward */}
        <Field label="Reward" error={errors.rewardAmount?.message}>
          <div className="flex gap-2">
            <Input
              {...register('rewardAmount')}
              type="number"
              inputMode="decimal"
              min="0"
              step="any"
              placeholder="0"
              className="flex-1 text-lg font-bold"
            />
            <div className="flex rounded-2xl border border-gray-200 overflow-hidden bg-white">
              {(['NIM', 'USDT'] as RewardCurrency[]).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCurrency(c)}
                  className={cn(
                    'w-16 text-sm font-bold transition-all duration-150 press',
                    currency === c
                      ? 'bg-nimiq-yellow text-text-primary'
                      : 'bg-white text-text-secondary'
                  )}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </Field>

        <Field label="Proof required" hint="What should the worker send you?" error={errors.evidenceRequired?.message}>
          <Textarea
            {...register('evidenceRequired')}
            placeholder="e.g. Screenshot of each step + written bug report"
            rows={3}
          />
        </Field>

        {/* Rate limit error */}
        {rateError && (
          <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3 text-sm text-red-700 font-medium">
            {rateError}
          </div>
        )}

        {/* Submit */}
        <div className="pt-2">
          {!wallet ? (
            <Button size="lg" className="w-full" onClick={connect} disabled={connecting}>
              {connecting ? 'Connecting…' : 'Connect wallet to post'}
            </Button>
          ) : (
            <Button size="lg" className="w-full" type="submit" disabled={submitting}>
              {submitting
                ? 'Posting…'
                : <span className="flex items-center gap-2"><Flame size={16} />Post bounty</span>}
            </Button>
          )}
        </div>
      </form>
    </div>
  )
}

function Field({ label, hint, error, children }: { label: string; hint?: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between">
        <label className="text-sm font-semibold text-text-primary">{label}</label>
        {hint && <span className="text-xs text-text-secondary">{hint}</span>}
      </div>
      {children}
      {error && <p className="text-xs text-error font-medium">{error}</p>}
    </div>
  )
}
