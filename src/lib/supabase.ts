import { createClient } from '@supabase/supabase-js'
import { sanitizeText } from '@/lib/utils'
import type { Bounty, Payment, User } from '@/types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? 'https://placeholder.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? 'placeholder'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface Database {
  public: {
    Tables: {
      users: { Row: User }
      bounties: { Row: Bounty }
      payments: { Row: Payment }
    }
  }
}

export async function getOrCreateUser(walletAddress: string): Promise<User> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('walletAddress', walletAddress)
    .single()

  if (data && !error) return data as User

  const newUser: Omit<User, 'id'> = {
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
  return created as User
}

export async function fetchBounties(filters?: { category?: string; status?: string }) {
  let query = supabase.from('bounties').select('*').order('createdAt', { ascending: false })

  if (filters?.category && filters.category !== 'All') {
    query = query.eq('category', filters.category)
  }
  if (filters?.status && filters.status !== 'All') {
    query = query.eq('status', filters.status)
  }

  const { data, error } = await query
  if (error) throw error
  return data as Bounty[]
}

export async function fetchBountyById(id: string) {
  const { data, error } = await supabase
    .from('bounties')
    .select('*')
    .eq('id', id)
    .single()
  if (error) throw error
  return data as Bounty
}

export async function createBounty(bounty: Omit<Bounty, 'id' | 'createdAt' | 'updatedAt' | 'workerWallet' | 'submittedEvidence' | 'submittedLink' | 'claimedAt' | 'submittedAt' | 'approvedAt' | 'paidAt'>) {
  const now = new Date().toISOString()
  const { data, error } = await supabase
    .from('bounties')
    .insert({
      ...bounty,
      title: sanitizeText(bounty.title),
      description: sanitizeText(bounty.description),
      evidenceRequired: sanitizeText(bounty.evidenceRequired),
      createdAt: now,
      updatedAt: now,
    })
    .select()
    .single()
  if (error) throw error
  return data as Bounty
}

export async function claimBounty(bountyId: string, workerWallet: string) {
  const { data, error } = await supabase
    .from('bounties')
    .update({ status: 'claimed', workerWallet, claimedAt: new Date().toISOString(), updatedAt: new Date().toISOString() })
    .eq('id', bountyId)
    .eq('status', 'open')
    .select()
    .single()
  if (error) throw error
  return data as Bounty
}

export async function submitEvidence(bountyId: string, evidence: string, link?: string) {
  // Sanitize link: only allow http/https
  const safeLink = link ? (/^https?:\/\//.test(link) ? link : null) : null
  const { data, error } = await supabase
    .from('bounties')
    .update({
      status: 'submitted',
      submittedEvidence: sanitizeText(evidence),
      submittedLink: safeLink,
      submittedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
    .eq('id', bountyId)
    .eq('status', 'claimed')
    .select()
    .single()
  if (error) throw error
  return data as Bounty
}

export async function approveBounty(bountyId: string) {
  const { data, error } = await supabase
    .from('bounties')
    .update({ status: 'approved', approvedAt: new Date().toISOString(), updatedAt: new Date().toISOString() })
    .eq('id', bountyId)
    .eq('status', 'submitted')
    .select()
    .single()
  if (error) throw error
  return data as Bounty
}

export async function markBountyPaid(bountyId: string, txHash: string) {
  const { data, error } = await supabase
    .from('bounties')
    .update({ status: 'paid', paidAt: new Date().toISOString(), updatedAt: new Date().toISOString() })
    .eq('id', bountyId)
    // Allow update from both 'approved' and 'submitted' (handles recovery after partial failure)
    .in('status', ['submitted', 'approved'])
    .select()
    .single()
  if (error) throw new Error(`Could not mark bounty as paid: ${error.message}`)
  if (!data) throw new Error('Bounty not found or already paid')

  const bounty = data as Bounty
  await supabase.from('payments').insert({
    bountyId,
    fromWallet: bounty.creatorWallet,
    toWallet: bounty.workerWallet,
    amount: bounty.rewardAmount,
    currency: bounty.rewardCurrency,
    txHash,
    status: 'confirmed',
    createdAt: new Date().toISOString(),
  })

  return bounty
}

export async function fetchMyBounties(walletAddress: string) {
  const [created, claimed] = await Promise.all([
    supabase.from('bounties').select('*').eq('creatorWallet', walletAddress).order('createdAt', { ascending: false }),
    supabase.from('bounties').select('*').eq('workerWallet', walletAddress).order('createdAt', { ascending: false }),
  ])
  if (created.error) throw created.error
  if (claimed.error) throw claimed.error
  return {
    created: created.data as Bounty[],
    claimed: claimed.data as Bounty[],
  }
}

export async function fetchPaymentHistory(walletAddress: string) {
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .or(`fromWallet.eq.${walletAddress},toWallet.eq.${walletAddress}`)
    .order('createdAt', { ascending: false })
  if (error) throw error
  return data as Payment[]
}
