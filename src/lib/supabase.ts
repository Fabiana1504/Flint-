import { createClient } from '@supabase/supabase-js'
import type { Bounty, Payment, User, BountyFilters } from '@/types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? 'https://placeholder.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? 'placeholder'

export interface Database {
  public: {
    Tables: {
      users: {
        Row: User & Record<string, unknown>
        Insert: (Omit<User, 'id' | 'avatar'> & { avatar?: string | null }) & Record<string, unknown>
        Update: Partial<Omit<User, 'id'>> & Record<string, unknown>
        Relationships: []
      }
      bounties: {
        Row: Bounty & Record<string, unknown>
        Insert: (Omit<Bounty, 'id' | 'workerWallet' | 'submittedEvidence' | 'submittedLink' | 'claimedAt' | 'submittedAt' | 'approvedAt' | 'paidAt' | 'revisionNote' | 'workerRating' | 'ratingComment'> & {
          workerWallet?: string | null
          submittedEvidence?: string | null
          submittedLink?: string | null
          claimedAt?: string | null
          submittedAt?: string | null
          approvedAt?: string | null
          paidAt?: string | null
          revisionNote?: string | null
          workerRating?: number | null
          ratingComment?: string | null
        }) & Record<string, unknown>
        Update: Partial<Omit<Bounty, 'id'>> & Record<string, unknown>
        Relationships: []
      }
      payments: {
        Row: Payment & Record<string, unknown>
        Insert: (Omit<Payment, 'id' | 'txHash'> & { txHash?: string | null }) & Record<string, unknown>
        Update: Partial<Omit<Payment, 'id'>> & Record<string, unknown>
        Relationships: []
      }
    }
    Views: { [_ in never]: never }
    Functions: { [_ in never]: never }
    Enums: { [_ in never]: never }
    CompositeTypes: { [_ in never]: never }
  }
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

export async function getOrCreateUser(walletAddress: string): Promise<User> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('walletAddress', walletAddress)
    .single()

  if (data && !error) return data

  const newUser: Database['public']['Tables']['users']['Insert'] = {
    walletAddress,
    displayName: `User ${walletAddress.slice(0, 6)}`,
    avatar: null,
    createdAt: new Date().toISOString(),
    completedBounties: 0,
    createdBounties: 0,
    reputationScore: 0,
  }

  const { data: created, error: createError } = await supabase
    .from('users')
    .insert(newUser)
    .select()
    .single()

  if (createError) throw createError
  if (!created) throw new Error('Failed to create user')
  return created
}

export async function fetchBounties(filters?: BountyFilters): Promise<Bounty[]> {
  let query = supabase.from('bounties').select('*').order('createdAt', { ascending: false })

  if (filters?.category && filters.category !== 'All') {
    query = query.eq('category', filters.category)
  }
  if (filters?.status && filters.status !== 'All') {
    query = query.eq('status', filters.status)
  }

  const { data, error } = await query
  if (error) throw error
  return data ?? []
}

export async function fetchBountyById(id: string): Promise<Bounty> {
  const { data, error } = await supabase
    .from('bounties')
    .select('*')
    .eq('id', id)
    .single()
  if (error) throw error
  if (!data) throw new Error('Bounty not found')
  return data
}

export async function createBounty(bounty: Omit<Bounty, 'id' | 'createdAt' | 'updatedAt' | 'workerWallet' | 'submittedEvidence' | 'submittedLink' | 'claimedAt' | 'submittedAt' | 'approvedAt' | 'paidAt' | 'revisionNote' | 'workerRating' | 'ratingComment'>): Promise<Bounty> {
  const now = new Date().toISOString()
  const { data, error } = await supabase
    .from('bounties')
    .insert({ ...bounty, createdAt: now, updatedAt: now })
    .select()
    .single()
  if (error) throw error
  if (!data) throw new Error('Failed to create bounty')
  return data
}

export async function claimBounty(bountyId: string, workerWallet: string): Promise<Bounty> {
  const { data, error } = await supabase
    .from('bounties')
    .update({ status: 'claimed', workerWallet, claimedAt: new Date().toISOString(), updatedAt: new Date().toISOString() })
    .eq('id', bountyId)
    .eq('status', 'open')
    .select()
    .single()
  if (error) throw error
  if (!data) throw new Error('Bounty not found or already claimed')
  return data
}

export async function submitEvidence(bountyId: string, evidence: string, link?: string): Promise<Bounty> {
  const safeLink = link ? (/^https?:\/\//.test(link) ? link : null) : null
  const { data, error } = await supabase
    .from('bounties')
    .update({
      status: 'submitted',
      submittedEvidence: evidence,
      submittedLink: safeLink,
      submittedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
    .eq('id', bountyId)
    .eq('status', 'claimed')
    .select()
    .single()
  if (error) throw error
  if (!data) throw new Error('Bounty not found or cannot be submitted')
  return data
}

export async function approveBounty(bountyId: string): Promise<Bounty> {
  const { data, error } = await supabase
    .from('bounties')
    .update({ status: 'approved', approvedAt: new Date().toISOString(), updatedAt: new Date().toISOString() })
    .eq('id', bountyId)
    .eq('status', 'submitted')
    .select()
    .single()
  if (error) throw error
  if (!data) throw new Error('Bounty not found or cannot be approved')
  return data
}

export async function markBountyPaid(bountyId: string, txHash: string): Promise<Bounty> {
  const { data, error } = await supabase
    .from('bounties')
    .update({ status: 'paid', paidAt: new Date().toISOString(), updatedAt: new Date().toISOString() })
    .eq('id', bountyId)
    .in('status', ['submitted', 'approved'])
    .select()
    .single()
  if (error) throw new Error(`Could not mark bounty as paid: ${error.message}`)
  if (!data) throw new Error('Bounty not found or already paid')
  if (!data.workerWallet) throw new Error('Bounty has no worker wallet')

  await supabase.from('payments').insert({
    bountyId,
    fromWallet: data.creatorWallet,
    toWallet: data.workerWallet,
    amount: data.rewardAmount,
    currency: data.rewardCurrency,
    txHash,
    status: 'confirmed',
    createdAt: new Date().toISOString(),
  })

  return data
}

export async function requestRevision(bountyId: string, note: string): Promise<Bounty> {
  const { data, error } = await supabase
    .from('bounties')
    .update({
      status: 'claimed',
      revisionNote: note,
      submittedEvidence: null,
      submittedLink: null,
      submittedAt: null,
      updatedAt: new Date().toISOString(),
    })
    .eq('id', bountyId)
    .eq('status', 'submitted')
    .select()
    .single()
  if (error) throw error
  if (!data) throw new Error('Bounty not found or cannot request revision')
  return data
}

export async function rateWorker(bountyId: string, workerWallet: string, rating: number, comment: string): Promise<Bounty> {
  const { data, error } = await supabase
    .from('bounties')
    .update({ workerRating: rating, ratingComment: comment || null, updatedAt: new Date().toISOString() })
    .eq('id', bountyId)
    .eq('status', 'paid')
    .is('workerRating', null)
    .select()
    .single()
  if (error) throw error
  if (!data) throw new Error('Could not save rating')

  const { data: worker } = await supabase
    .from('users')
    .select('reputationScore, completedBounties')
    .eq('walletAddress', workerWallet)
    .single()
  if (worker) {
    const count = Math.max(1, worker.completedBounties)
    const newScore = Math.round((worker.reputationScore * (count - 1) + rating * 20) / count)
    await supabase
      .from('users')
      .update({ reputationScore: Math.min(100, newScore) })
      .eq('walletAddress', workerWallet)
  }
  return data
}

export async function fetchMyBounties(walletAddress: string): Promise<{ created: Bounty[]; claimed: Bounty[] }> {
  const [created, claimed] = await Promise.all([
    supabase.from('bounties').select('*').eq('creatorWallet', walletAddress).order('createdAt', { ascending: false }),
    supabase.from('bounties').select('*').eq('workerWallet', walletAddress).order('createdAt', { ascending: false }),
  ])
  if (created.error) throw created.error
  if (claimed.error) throw claimed.error
  return {
    created: created.data ?? [],
    claimed: claimed.data ?? [],
  }
}

export async function fetchPaymentHistory(walletAddress: string): Promise<Payment[]> {
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .or(`fromWallet.eq.${walletAddress},toWallet.eq.${walletAddress}`)
    .order('createdAt', { ascending: false })
  if (error) throw error
  return data ?? []
}
