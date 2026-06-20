export type RewardCurrency = 'NIM' | 'USDT'

export type BountyStatus =
  | 'open'
  | 'claimed'
  | 'submitted'
  | 'approved'
  | 'paid'
  | 'cancelled'

export type BountyCategory =
  | 'Testing'
  | 'Design'
  | 'Writing'
  | 'Survey'
  | 'Dev'

export interface User {
  id: string
  walletAddress: string
  displayName: string
  avatar: string | null
  createdAt: string
  completedBounties: number
  createdBounties: number
  reputationScore: number
}

export interface Bounty {
  id: string
  title: string
  description: string
  category: BountyCategory
  rewardAmount: number
  rewardCurrency: RewardCurrency
  creatorWallet: string
  workerWallet: string | null
  status: BountyStatus
  evidenceRequired: string
  submittedEvidence: string | null
  submittedLink: string | null
  createdAt: string
  updatedAt: string
  claimedAt: string | null
  submittedAt: string | null
  approvedAt: string | null
  paidAt: string | null
}

export interface Payment {
  id: string
  bountyId: string
  fromWallet: string
  toWallet: string
  amount: number
  currency: RewardCurrency
  txHash: string | null
  status: 'pending' | 'confirmed' | 'failed'
  createdAt: string
}

export interface BountyFilters {
  category?: BountyCategory | 'All'
  status?: BountyStatus | 'All'
}
