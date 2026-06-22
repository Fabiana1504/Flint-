import { init, getHostLanguage, type NimiqProvider } from '@nimiq/mini-app-sdk'
import type { ErrorResponse } from '@nimiq/mini-app-sdk'

let provider: NimiqProvider | null = null

async function getProvider(): Promise<NimiqProvider> {
  if (!provider) {
    provider = await init({ timeout: 10_000 })
  }
  return provider
}

function isError(res: unknown): res is ErrorResponse {
  return typeof res === 'object' && res !== null && 'error' in res
}

export interface NimiqWallet {
  address: string
  label: string
}

export async function connectWallet(): Promise<NimiqWallet> {
  const nimiq = await getProvider()
  const result = await nimiq.listAccounts()

  if (isError(result)) {
    throw new Error(result.error.message)
  }

  const address = result[0]
  if (!address) throw new Error('No accounts found')

  return {
    address,
    label: `${address.slice(0, 9)}…${address.slice(-4)}`,
  }
}

export interface PaymentRequest {
  recipient: string
  amount: number
  currency: 'NIM' | 'USDT'
  bountyId: string
}

export async function sendPayment(req: PaymentRequest): Promise<{ txHash: string }> {
  if (req.currency !== 'NIM') {
    throw new Error('USDT payments require EVM integration — coming soon')
  }

  const nimiq = await getProvider()
  const lunas = Math.round(req.amount * 1e5)

  const result = await nimiq.sendBasicTransactionWithData({
    recipient: req.recipient,
    value: lunas,
    data: `Flint bounty ${req.bountyId}`,
  })

  if (isError(result)) {
    throw new Error(result.error.message)
  }

  return { txHash: result }
}

export function getLocale(): string {
  return getHostLanguage() ?? navigator.language.split('-')[0] ?? 'en'
}

export function isInsideNimiqPay(): boolean {
  return typeof window !== 'undefined' && 'nimiqPay' in window
}
