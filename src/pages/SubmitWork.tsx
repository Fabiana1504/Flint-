import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Clock, CheckCircle2, Loader2, Send } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { useBounty } from '@/hooks/useBounties'
import { useWallet } from '@/context/WalletContext'
import { useLang } from '@/context/LangContext'
import { RotateCcw } from 'lucide-react'
import { submitEvidence } from '@/lib/supabase'
import { formatReward } from '@/lib/utils'
import type { BountyCategory } from '@/types'

const schema = z.object({
  evidence: z.string().min(10, 'Describe your work in at least 10 characters').max(2000),
  link: z.string()
    .refine(v => v === '' || /^https:\/\/.+/.test(v), 'Link must start with https://')
    .optional()
    .or(z.literal('')),
})
type FormData = z.infer<typeof schema>

const CAT_ACCENT: Record<BountyCategory, string> = {
  Testing: '#A855F7', Design: '#EC4899', Writing: '#3B82F6', Survey: '#14B8A6', Dev: '#F97316',
}

export function SubmitWork() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { wallet } = useWallet()
  const { t } = useLang()
  const { bounty, setBounty } = useBounty(id)
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) })

  async function onSubmit(data: FormData) {
    if (!bounty || !wallet) return
    setSubmitting(true)
    try {
      setBounty(await submitEvidence(bounty.id, data.evidence, data.link || undefined))
      setSubmitted(true)
    } finally { setSubmitting(false) }
  }

  const accent = bounty ? CAT_ACCENT[bounty.category] : '#F5A623'

  /* ── Success ── */
  if (submitted || bounty?.status === 'submitted') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-5 text-center bg-background">
        <div className="w-24 h-24 rounded-4xl flex items-center justify-center mb-5 animate-scale-in"
          style={{ background: 'linear-gradient(145deg,#d1fae5,#a7f3d0)', boxShadow: '0 8px 32px rgba(16,185,129,0.25)' }}>
          <Clock size={36} strokeWidth={1.8} className="text-emerald-600" />
        </div>
        <h1 className="font-display font-extrabold text-text-primary text-2xl mb-2" style={{ letterSpacing: '-0.02em' }}>
          {t.submit.workSubmitted}
        </h1>
        <p className="text-text-secondary text-sm max-w-[240px] leading-relaxed mb-8">
          {t.submit.workSubmittedDesc}
        </p>
        {bounty && (
          <div className="w-full max-w-xs bg-surface rounded-3xl p-5 text-left mb-6 shadow-card-md">
            <p className="text-[11px] font-bold text-text-muted uppercase tracking-widest mb-1.5">{t.submit.pendingReward}</p>
            <p className="font-display font-extrabold text-3xl" style={{ color: accent, letterSpacing: '-0.03em' }}>
              {formatReward(bounty.rewardAmount, bounty.rewardCurrency)}
            </p>
          </div>
        )}
        <button onClick={() => navigate('/dashboard')}
          className="h-12 px-8 rounded-2xl font-bold text-sm text-text-secondary border border-border bg-surface press shadow-card">
          {t.submit.viewMyBounties}
        </button>
      </div>
    )
  }

  /* ── Paid / Approved ── */
  if (bounty?.status === 'approved' || bounty?.status === 'paid') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-5 text-center bg-background">
        <div className="w-24 h-24 rounded-4xl flex items-center justify-center mb-5 animate-scale-in"
          style={{ background: 'linear-gradient(145deg,#d1fae5,#a7f3d0)', boxShadow: '0 8px 32px rgba(16,185,129,0.25)' }}>
          <CheckCircle2 size={36} strokeWidth={1.8} className="text-emerald-600" />
        </div>
        <h1 className="font-display font-extrabold text-text-primary text-2xl mb-2" style={{ letterSpacing: '-0.02em' }}>
          {t.submit.paymentApproved}
        </h1>
        <p className="text-text-secondary text-sm mb-8">{t.submit.paymentApprovedDesc}</p>
        <button onClick={() => navigate('/dashboard')}
          className="h-14 px-8 rounded-2xl font-display font-bold text-[#18181B] text-base press"
          style={{ background: 'linear-gradient(145deg,#F7C04A,#F5A623)', boxShadow: '0 6px 24px rgba(245,166,35,0.48)' }}>
          {t.submit.viewDashboard}
        </button>
      </div>
    )
  }

  /* ── Form ── */
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <div className="sticky top-0 z-10 bg-surface/95 border-b border-border px-4 h-14 flex items-center gap-2">
        <button onClick={() => navigate(-1)} className="w-9 h-9 flex items-center justify-center rounded-full bg-background press">
          <ArrowLeft size={18} className="text-text-primary" />
        </button>
        <span className="font-display font-bold text-text-primary">{t.submit.title}</span>
      </div>

      <div className="px-4 pt-5 pb-8 flex flex-col gap-5">

        {/* Bounty info card */}
        {bounty && (
          <div className="bg-surface rounded-3xl overflow-hidden shadow-card">
            <div className="h-[3px]" style={{ background: `linear-gradient(90deg,${accent},${accent}88)` }} />
            <div className="p-4">
              <p className="text-[11px] font-bold text-text-muted uppercase tracking-widest mb-1">{t.submit.bounty}</p>
              <p className="font-display font-bold text-text-primary text-base mb-2">{bounty.title}</p>
              <p className="font-display font-extrabold text-2xl" style={{ color: accent, letterSpacing: '-0.02em' }}>
                {formatReward(bounty.rewardAmount, bounty.rewardCurrency)}
              </p>
            </div>
          </div>
        )}

        {/* Revision feedback from creator */}
        {bounty?.revisionNote && (
          <div className="rounded-2xl p-4 border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 flex items-start gap-3">
            <RotateCcw size={15} className="text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-[11px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-widest mb-1.5">
                {t.revision.bannerTitle}
              </p>
              <p className="text-amber-900 dark:text-amber-300 text-sm leading-relaxed italic">"{bounty.revisionNote}"</p>
            </div>
          </div>
        )}

        {/* Required evidence */}
        {bounty?.evidenceRequired && (
          <div className="rounded-2xl p-4 border-2" style={{ borderColor: `${accent}35`, background: `${accent}0A` }}>
            <p className="text-[11px] font-bold uppercase tracking-widest mb-2" style={{ color: accent }}>
              {t.submit.requiredEvidence}
            </p>
            <p className="text-text-primary text-sm leading-relaxed">{bounty.evidenceRequired}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-text-primary">{t.submit.describeWork}</label>
            <Textarea {...register('evidence')} placeholder={t.submit.descWorkPlaceholder} rows={5} />
            {errors.evidence && <p className="text-xs text-error font-semibold">{errors.evidence.message}</p>}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-text-primary">
              {t.submit.link} <span className="font-normal text-text-muted">{t.submit.optional}</span>
            </label>
            <Input {...register('link')} type="url" placeholder="https://…" />
            {errors.link && <p className="text-xs text-error font-semibold">{errors.link.message}</p>}
          </div>
        </form>

        {/* Submit */}
        <button
          onClick={handleSubmit(onSubmit)}
          disabled={submitting || !wallet}
          className="w-full h-14 rounded-2xl font-display font-bold text-[#18181B] text-base disabled:opacity-60 flex items-center justify-center gap-2.5 mt-1 press"
          style={{ background: 'linear-gradient(145deg,#F7C04A 0%,#F5A623 60%,#E8951A 100%)', boxShadow: '0 6px 24px rgba(245,166,35,0.48)' }}
        >
          {submitting ? <Loader2 size={20} className="animate-spin" /> : <><Send size={18} strokeWidth={2.5} />{t.submit.submitWork}</>}
        </button>
      </div>
    </div>
  )
}
