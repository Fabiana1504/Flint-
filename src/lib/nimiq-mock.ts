// Dev-only mock for window.nimiq — never runs in production (import.meta.env.DEV guard)
// Simulates the NimiqProvider injected by Nimiq Pay so the app works in the browser.

const MOCK_ADDRESS = 'NQ07 MOCK 0000 0000 0000 0000 0000 0000 0001'

const mockProvider = {
  listAccounts: async (): Promise<string[]> => {
    console.info('[Nimiq Mock] listAccounts() → returning mock address')
    await delay(400)
    return [MOCK_ADDRESS]
  },

  sendBasicTransaction: async (tx: { recipient: string; value: number }) => {
    console.info('[Nimiq Mock] sendBasicTransaction()', tx)
    await delay(800)
    return `mock-tx-hash-${Date.now()}`
  },

  sendBasicTransactionWithData: async (tx: { recipient: string; value: number; data?: string }) => {
    console.info('[Nimiq Mock] sendBasicTransactionWithData()', tx)
    await delay(800)
    return `mock-tx-hash-${Date.now()}`
  },

  sign: async (message: string) => {
    console.info('[Nimiq Mock] sign()', message)
    await delay(300)
    return { publicKey: 'mock-pubkey', signature: 'mock-signature' }
  },

  isConsensusEstablished: async () => true,
  getBlockNumber: async () => 3_500_000,
}

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}

export function installNimiqMock() {
  if (!import.meta.env.DEV) return

  // Inject window.nimiq so init() resolves immediately
  Object.defineProperty(window, 'nimiq', {
    value: mockProvider,
    writable: false,
    configurable: true,
  })

  // Inject window.nimiqPay so isInsideNimiqPay() returns true
  Object.defineProperty(window, 'nimiqPay', {
    value: { language: 'en' },
    writable: false,
    configurable: true,
  })

  console.info(
    '%c[Nimiq Mock] Active — wallet: ' + MOCK_ADDRESS,
    'color: #F5A623; font-weight: bold'
  )
}
