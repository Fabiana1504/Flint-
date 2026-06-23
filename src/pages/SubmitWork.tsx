import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Clock, CheckCircle2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { useBounty } from '@/hooks/useBounties'
import { useWallet } from '@/context/WalletContext'
import { submitEvidence } from '@/lib/supabase'
import { formatReward } from '@/lib/utils'

const schema = z.object({
  evidence: z.string().min(10, 'Describe your work in at least 10 characters').max(2000),
  link: z.string()
    .refine(v => v === '' || /^https:\/\/.+/.test(v), 'Link must start with https://')
    .optional()
    .or(z.literal('')),
})

type FormData = z.infer<typeof schema>

export function SubmitWork() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { wallet } = useWallet()
  const { bounty, setBounty } = useBounty(id!)
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  async function onSubmit(data: FormData) {
    if (!bounty || !wallet) return
    setSubmitting(true)
    try {
      const updated = await submitEvidence(bounty.id, data.evidence, data.link || undefined)
      setBounty(updated)
      setSubmitted(true)
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted || bounty?.status === 'submitted') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-5 text-center">
        <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mb-5">
          <Clock size={28} className="text-green-600" />
        </div>
        <h1 className="font-display font-bold text-text-primary text-2xl mb-2">Work submitted!</h1>
        <p className="text-text-secondary text-sm max-w-[260px] leading-relaxed mb-8">
          Your work is under review. The bounty creator will approve and release payment.
        </p>
        {bounty && (
          <div className="w-full bg-white rounded-2xl border border-gray-100 shadow-card p-4 text-left mb-6">
            <p className="text-xs text-text-secondary font-label mb-0.5">Pending reward</p>
            <p className="font-display font-bold text-nimiq-yellow text-xl">
              {formatReward(bounty.rewardAmount, bounty.rewardCurrency)}
            </p>
          </div>
        )}
        <Button variant="secondary" onClick={() => navigate('/dashboard')}>View my bounties</Button>
      </div>
    )
  }

  if (bounty?.status === 'approved' || bounty?.status === 'paid') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-5 text-center">
        <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mb-5">
          <CheckCircle2 size={28} className="text-green-600" />
        </div>
        <h1 className="font-display font-bold text-text-primary text-2xl mb-2">Payment approved!</h1>
        <p className="text-text-secondary text-sm mb-6">The creator approved your work. Payment is on its way.</p>
        <Button onClick={() => navigate('/dashboard')}>View my bounties</Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <div className="sticky top-0 bg-white border-b border-gray-100 z-10 px-5 py-4 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="h-9 w-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
          <ArrowLeft size={20} className="text-text-primary" />
        </button>
        <span className="font-display font-semibold text-text-primary">Submit your work</span>
      </div>

      <div className="px-5 pt-6 pb-32 flex flex-col gap-5">
        {bounty && (
          <div className="bg-nimiq-yellow-light rounded-2xl p-4">
            <p className="text-xs text-text-secondary font-label mb-0.5">Bounty</p>
            <p className="font-display font-semibold text-text-primary text-base">{bounty.title}</p>
            <p className="text-nimiq-yellow font-bold text-lg mt-1">{formatReward(bounty.rewardAmount, bounty.rewardCurrency)}</p>
          </div>
        )}

        {bounty?.evidenceRequired && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-4">
            <p className="text-xs font-label font-semibold text-text-secondary uppercase tracking-wide mb-1">Required evidence</p>
            <p className="text-sm text-text-primary leading-relaxed">{bounty.evidenceRequired}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-label font-semibold text-text-primary">Describe your work</label>
            <Textarea
              {...register('evidence')}
              placeholder="Explain what you did and how you completed the task…"
              rows={5}
            />
            {errors.evidence && <p className="text-xs text-error">{errors.evidence.message}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-label font-semibold text-text-primary">Link (optional)</label>
            <Input {...register('link')} type="url" placeholder="https://..." />
            {errors.link && <p className="text-xs text-error">{errors.link.message}</p>}
          </div>
        </form>
      </div>

      <div className="fixed bottom-16 left-1/2 -translate-x-1/2 w-full max-w-app px-5 pb-4 bg-gradient-to-t from-background via-background to-transparent pt-6">
        <Button size="lg" className="w-full" onClick={handleSubmit(onSubmit)} disabled={submitting || !wallet}>
          {submitting ? 'Submitting…' : 'Submit work'}
        </Button>
      </div>
    </div>
  )
}
