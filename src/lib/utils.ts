import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { BountyCategory, BountyStatus, RewardCurrency } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatReward(amount: number, currency: RewardCurrency): string {
  if (currency === 'NIM') {
    return `${amount.toLocaleString()} NIM`
  }
  return `$${amount.toFixed(2)} USDT`
}

export function shortenAddress(address: string): string {
  if (!address) return ''
  return `${address.slice(0, 6)}…${address.slice(-4)}`
}

export function timeAgo(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (seconds < 60) return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}

export const STATUS_LABELS: Record<BountyStatus, string> = {
  open: 'Open',
  claimed: 'Claimed',
  submitted: 'Under Review',
  approved: 'Approved',
  paid: 'Paid',
  cancelled: 'Cancelled',
}

export const CATEGORY_COLORS: Record<BountyCategory, { bg: string; text: string }> = {
  Testing: { bg: 'bg-purple-50', text: 'text-purple-700' },
  Design: { bg: 'bg-pink-50', text: 'text-pink-700' },
  Writing: { bg: 'bg-blue-50', text: 'text-blue-700' },
  Survey: { bg: 'bg-teal-50', text: 'text-teal-700' },
  Dev: { bg: 'bg-orange-50', text: 'text-orange-700' },
}

export const STATUS_COLORS: Record<BountyStatus, { bg: string; text: string }> = {
  open: { bg: 'bg-yellow-50', text: 'text-yellow-700' },
  claimed: { bg: 'bg-blue-50', text: 'text-blue-700' },
  submitted: { bg: 'bg-orange-50', text: 'text-orange-700' },
  approved: { bg: 'bg-green-50', text: 'text-green-700' },
  paid: { bg: 'bg-green-100', text: 'text-green-800' },
  cancelled: { bg: 'bg-gray-100', text: 'text-gray-500' },
}

export const CATEGORIES: BountyCategory[] = ['Testing', 'Design', 'Writing', 'Survey', 'Dev']

