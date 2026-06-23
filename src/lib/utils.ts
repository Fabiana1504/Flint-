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

// Only allow http/https links — blocks javascript:, data:, vbscript: etc.
export function sanitizeUrl(url: string): string {
  try {
    const parsed = new URL(url)
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return '#'
    return url
  } catch {
    return '#'
  }
}

// Strip non-printable / control characters from user text before it hits the DB.
export function sanitizeText(text: string): string {
  // Remove ASCII control chars except \t (9), \n (10), \r (13)
  return text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '').trim()
}

// Client-side rate limit: max 5 bounties per wallet per hour (localStorage).
// The DB trigger is the real enforcement; this gives immediate UX feedback.
const RL_WINDOW_MS = 60 * 60 * 1000
const RL_MAX = 5

export function checkBountyRateLimit(walletAddress: string): { allowed: boolean; retryInMinutes?: number } {
  const key = `flint_rl_${walletAddress}`
  let timestamps: number[] = []
  try {
    timestamps = JSON.parse(localStorage.getItem(key) ?? '[]')
  } catch { timestamps = [] }

  const now = Date.now()
  timestamps = timestamps.filter(t => now - t < RL_WINDOW_MS)

  if (timestamps.length >= RL_MAX) {
    const retryInMinutes = Math.ceil((timestamps[0] + RL_WINDOW_MS - now) / 60_000)
    return { allowed: false, retryInMinutes }
  }

  timestamps.push(now)
  try { localStorage.setItem(key, JSON.stringify(timestamps)) } catch { /* ignore */ }
  return { allowed: true }
}
