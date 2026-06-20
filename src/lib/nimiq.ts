import HubApi, { type SignedTransaction } from '@nimiq/hub-api'

let hubApi: HubApi | null = null

function getHub(): HubApi {
  if (!hubApi) {
    hubApi = new HubApi()
  }
  return hubApi
}

export interface NimiqWallet {
  address: string
  label: string
}

export async function chooseAddress(): Promise<NimiqWallet> {
  const hub = getHub()
  const result = await hub.chooseAddress({ appName: 'Flint' })
  return { address: result.address, label: result.label }
}

export interface PaymentRequest {
  recipient: string
  amount: number
  currency: 'NIM' | 'USDT'
  message?: string
  bountyId: string
}

export async function sendPayment(req: PaymentRequest): Promise<{ txHash: string }> {
  const hub = getHub()

  if (req.currency === 'NIM') {
    const result = await hub.checkout({
      appName: 'Flint',
      recipient: req.recipient,
      value: Math.round(req.amount * 1e5),
      extraData: req.message ?? `Flint bounty ${req.bountyId}`,
    })
    const tx = result as SignedTransaction
    return { txHash: tx.hash }
  }

  throw new Error('USDT payments require additional OASIS integration')
}

export function isNimiqPayEnvironment(): boolean {
  return typeof window !== 'undefined' && 'nimiqPay' in window
}
