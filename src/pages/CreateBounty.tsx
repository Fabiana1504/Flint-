import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { CategoryPill } from '@/components/bounty/CategoryPill'
import { useWallet } from '@/context/WalletContext'
import { createBounty } from '@/lib/supabase'
import { CATEGORIES, cn } from '@/lib/utils'
import type { BountyCategory, RewardCurrency } from '@/types'

const schema = z.object({
  title: z.string().min(5, 'At least 5 characters').max(100),
  description: z.string().min(20, 'At least 20 characters').max(2000),
  evidenceRequired: z.string().min(10, 'Describe what proof you need').max(500),
  rewardAmount: z.coerce.number().positive('Must be positive'),
})

type FormData = z.infer<typeof schema>

export function CreateBounty() {
  const navigate = useNavigate()
  const { wallet, connect, connecting } = useWallet()
  const [category, setCategory] = useState<BountyCategory>('Dev')
  const [currency, setCurrency] = useState<RewardCurrency>('NIM')
  const [submitting, setSubmitting] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  async function onSubmit(data: FormData) {
    if (!wallet) { await connect(); return }
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
    <div className="flex flex-col min-h-screen">
      <div className="sticky top-0 bg-white border-b border-gray-100 z-10 px-5 py-4 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="h-9 w-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
          <ArrowLeft size={20} className="text-text-primary" />
        </button>
        <span className="font-display font-semibold text-text-primary">Post a bounty</span>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="px-5 pt-6 pb-32 flex flex-col gap-5">
        {/* Title */}
        <Field label="Title" error={errors.title?.message}>
          <Input {...register('title')} placeholder="e.g. Test our checkout flow on mobile" />
        </Field>

        {/* Description */}
        <Field label="Description" error={errors.description?.message}>
          <Textarea {...register('description')} placeholder="What exactly needs to be done? Be specific." rows={4} />
        </Field>

        {/* Category */}
        <Field label="Category">
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={cn(
                  'rounded-full border transition-all px-3 py-1.5 text-sm font-label font-medium',
                  category === cat
                    ? 'border-nimiq-yellow bg-nimiq-yellow-light text-nimiq-yellow'
                    : 'border-border bg-white text-text-secondary'
                )}
              >
                <CategoryPill category={cat} className={category === cat ? '!bg-transparent !text-nimiq-yellow' : ''} />
              </button>
            ))}
          </div>
        </Field>

        {/* Reward */}
        <Field label="Reward" error={errors.rewardAmount?.message}>
          <div className="flex gap-2">
            <Input
              {...register('rewardAmount')}
              type="number"
              min="0"
              step="any"
              placeholder="Amount"
              className="flex-1"
            />
            <div className="flex rounded-2xl border border-border overflow-hidden">
              {(['NIM', 'USDT'] as RewardCurrency[]).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCurrency(c)}
                  className={cn(
                    'px-4 text-sm font-label font-semibold transition-colors',
                    currency === c ? 'bg-nimiq-yellow text-text-primary' : 'bg-white text-text-secondary'
                  )}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </Field>

        {/* Evidence required */}
        <Field label="Evidence required" error={errors.evidenceRequired?.message}>
          <Textarea
            {...register('evidenceRequired')}
            placeholder="What should the worker submit as proof? e.g. Screenshot + short written summary"
            rows={3}
          />
        </Field>
      </form>

      <div className="fixed bottom-16 left-1/2 -translate-x-1/2 w-full max-w-app px-5 pb-4 bg-gradient-to-t from-background via-background to-transparent pt-6">
        {!wallet ? (
          <Button size="lg" className="w-full" onClick={connect} disabled={connecting}>
            {connecting ? 'Connecting…' : 'Connect wallet to post'}
          </Button>
        ) : (
          <Button size="lg" className="w-full" onClick={handleSubmit(onSubmit)} disabled={submitting}>
            {submitting ? 'Posting…' : 'Post bounty'}
          </Button>
        )}
      </div>
    </div>
  )
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-label font-semibold text-text-primary">{label}</label>
      {children}
      {error && <p className="text-xs text-error font-label">{error}</p>}
    </div>
  )
}
