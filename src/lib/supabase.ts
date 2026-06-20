import { createClient } from '@supabase/supabase-js'
import type { Bounty, Payment, User } from '@/types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

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
    .insert({ ...bounty, createdAt: now, updatedAt: now })
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
  const { data, error } = await supabase
    .from('bounties')
    .update({
      status: 'submitted',
      submittedEvidence: evidence,
      submittedLink: link ?? null,
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
